<?php
/**
 * Lista de espera do AgendaDiaria.
 *
 * Faz uma coisa so: acrescentar um e-mail a um arquivo. Nao le, nao lista, nao
 * apaga e nao administra nada — se for comprometido, o estrago possivel e
 * escrever linhas numa lista. Isso e proposital: e o unico codigo de servidor
 * do projeto, e quanto menos ele puder fazer, melhor.
 *
 * Para VER a lista, use o Gerenciador de Arquivos do cPanel. O arquivo fica
 * fora da pasta publica sempre que possivel (ver $destino), justamente para
 * nao ser baixavel pela web.
 */

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'metodo nao permitido']);
    exit;
}

$corpo = file_get_contents('php://input');
if (strlen($corpo) > 2000) {           // nao ha motivo para um JSON maior que isso
    http_response_code(413);
    echo json_encode(['ok' => false, 'error' => 'requisicao grande demais']);
    exit;
}

$dados = json_decode($corpo, true);
$email = is_array($dados) ? trim((string)($dados['email'] ?? '')) : '';

if ($email === '' || strlen($email) > 254 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'e-mail invalido']);
    exit;
}

/**
 * Preferimos gravar UM NIVEL ACIMA da pasta publica: assim o arquivo nao tem
 * URL e nao ha como baixar a lista de e-mails pela web, mesmo que o .htaccess
 * se perca num deploy. So caimos para dentro da pasta publica se o nivel acima
 * nao for gravavel — e nesse caso o .htaccess bloqueia o acesso.
 */
$acima = dirname(__DIR__);
$destino = is_dir($acima) && is_writable($acima)
    ? $acima . '/agendadiaria-lista-espera.csv'
    : __DIR__ . '/lista-espera.csv';

// Sanitiza antes de gravar: um e-mail com virgula, aspas ou quebra de linha
// corromperia o CSV — e quebra de linha permitiria forjar registros.
$limpo = str_replace(["\r", "\n", '"', ','], '', $email);
$linha = sprintf(
    "%s,%s,%s\n",
    date('c'),
    $limpo,
    substr(preg_replace('/[^A-Za-z0-9 ._\-\/();:,]/', '', $_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 120)
);

$f = @fopen($destino, 'ab');
if ($f === false) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'nao foi possivel gravar']);
    exit;
}
// Trava exclusiva: dois envios simultaneos poderiam intercalar bytes e
// corromper as duas linhas.
if (flock($f, LOCK_EX)) {
    if (filesize($destino) === 0) {
        fwrite($f, "data,email,navegador\n");
    }
    fwrite($f, $linha);
    flock($f, LOCK_UN);
}
fclose($f);
@chmod($destino, 0600);

echo json_encode(['ok' => true]);
