# Script de Automação de Keystore e Preparação de Build Android TWA para AgendaDiária

$keyStorePath = Join-Path $PSScriptRoot "android-release-key.jks"
$assetLinksPath = Join-Path $PSScriptRoot "..\landing\.well-known\assetlinks.json"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " AgendaDiária - Preparação do Pacote Android (Google Play) " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# 1. Gerar Keystore de Produção se não existir
if (-not (Test-Path $keyStorePath)) {
    Write-Host "`n1. Gerando a chave de assinatura de produção (Keystore)..." -ForegroundColor Yellow
    
    $storePass = "AgendaDiaria2026Secure!"
    $aliasPass = "AgendaDiaria2026Secure!"
    
    & keytool -genkeypair -v `
        -keystore $keyStorePath `
        -alias "agendadiaria" `
        -keyalg RSA `
        -keysize 2048 `
        -validity 10000 `
        -storepass $storePass `
        -keypass $aliasPass `
        -dname "CN=Diogo Alencastro, OU=Desenvolvimento, O=AgendaDiaria, L=Sao Paulo, ST=SP, C=BR"
        
    Write-Host "✓ Keystore gerada com sucesso em: $keyStorePath" -ForegroundColor Green
} else {
    Write-Host "`n✓ Keystore existente localizada em: $keyStorePath" -ForegroundColor Green
}

# 2. Extrair o Fingerprint SHA-256 da Keystore
Write-Host "`n2. Extraindo o Fingerprint SHA-256 da Keystore..." -ForegroundColor Yellow

$certInfo = & keytool -list -v -keystore $keyStorePath -alias "agendadiaria" -storepass "AgendaDiaria2026Secure!" | Out-String

if ($certInfo -match "SHA256:\s*([A-FA-f0-9:]+)") {
    $sha256 = $Matches[1].Trim()
    Write-Host "✓ Fingerprint SHA-256 obtido: $sha256" -ForegroundColor Green
    
    # Atualizar assetlinks.json
    if (Test-Path $assetLinksPath) {
        $jsonContent = Get-Content $assetLinksPath -Raw
        $updatedJson = $jsonContent -replace "REPLACE_WITH_YOUR_RELEASE_KEY_SHA256_FINGERPRINT", $sha256
        Set-Content -Path $assetLinksPath -Value $updatedJson -Encoding UTF8
        Write-Host "✓ Arquivo landing/.well-known/assetlinks.json atualizado com a SHA-256!" -ForegroundColor Green
    }
} else {
    Write-Host "⚠️ Não foi possível extrair a SHA-256 automaticamente via keytool. Verifique o Java JDK." -ForegroundColor Red
}

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host " Próximos passos para compilar o .aab:" -ForegroundColor Cyan
Write-Host " 1. Publique os novos arquivos no servidor Hostgator (incluindo .well-known/assetlinks.json e sw.js)" -ForegroundColor White
Write-Host " 2. Execute: npx @bubblewrap/cli build no diretório android-twa" -ForegroundColor White
Write-Host "============================================================" -ForegroundColor Cyan
