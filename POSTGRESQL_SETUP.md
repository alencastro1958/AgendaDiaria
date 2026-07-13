# PostgreSQL Database Setup

Este documento fornece instruções completas para configurar o banco de dados PostgreSQL para o sistema AgendaDinamica.

## Opções de Instalação

Você pode escolher entre duas opções:
1. **Docker (Recomendado)** - Mais fácil e consistente
2. **Instalação Local** - Se você preferir ter PostgreSQL instalado diretamente no sistema

---

## Opção 1: Docker (Recomendado)

### Pré-requisitos
- Docker Desktop instalado ([Download aqui](https://www.docker.com/products/docker-desktop))
- Docker Compose (geralmente incluído no Docker Desktop)

### Passo 1: Iniciar o Container PostgreSQL

No diretório raiz do projeto, execute:

```bash
docker-compose up -d
```

Este comando irá:
- Baixar a imagem PostgreSQL 14 Alpine
- Criar um container chamado `agenda-dinamica-db`
- Inicializar o banco de dados `agenda_dinamica`
- Executar o script de inicialização `init.sql`
- Expor a porta 5432

### Passo 2: Verificar o Status do Container

```bash
docker-compose ps
```

Você deve ver o container `agenda-dinamica-db` com status "Up" e "healthy".

### Passo 3: Verificar a Conexão

```bash
docker exec -it agenda-dinamica-db psql -U agenda_user -d agenda_dinamica
```

Dentro do psql, você pode testar:

```sql
-- Verificar extensões instaladas
\dx

-- Verificar a versão do schema
SELECT * FROM schema_version;

-- Sair
\q
```

### Comandos Úteis do Docker

```bash
# Parar o container
docker-compose stop

# Iniciar o container parado
docker-compose start

# Parar e remover containers (mantém os dados)
docker-compose down

# Parar, remover containers E apagar todos os dados
docker-compose down -v

# Ver logs do PostgreSQL
docker-compose logs postgres

# Ver logs em tempo real
docker-compose logs -f postgres

# Reiniciar o container
docker-compose restart
```

### Configuração

As credenciais padrão estão em `docker-compose.yml`:
- **Host:** localhost
- **Port:** 5433 (changed from 5432 to avoid conflicts with local PostgreSQL)
- **Database:** agenda_dinamica
- **User:** agenda_user
- **Password:** agenda_password_dev

**⚠️ IMPORTANTE:** Essas credenciais são apenas para desenvolvimento. Em produção, use credenciais fortes e armazene-as de forma segura.

**💡 NOTA:** Se você tiver PostgreSQL instalado localmente, ele pode estar usando a porta 5432. Este docker-compose usa a porta 5433 para evitar conflitos.

---

## Opção 2: Instalação Local

### Instalação no Windows

1. Baixe o instalador do PostgreSQL 14+ em https://www.postgresql.org/download/windows/
2. Execute o instalador e siga as instruções
3. Durante a instalação:
   - Defina uma senha forte para o usuário `postgres`
   - Mantenha a porta padrão 5432
   - Instale pgAdmin 4 (recomendado para gerenciamento visual)

4. Após a instalação, abra pgAdmin 4 ou SQL Shell (psql)

### Instalação no macOS

```bash
# Usando Homebrew
brew install postgresql@14

# Iniciar o serviço
brew services start postgresql@14

# Ou iniciar manualmente
pg_ctl -D /usr/local/var/postgres start
```

### Instalação no Linux (Ubuntu/Debian)

```bash
# Atualizar repositórios
sudo apt update

# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib

# O serviço inicia automaticamente
# Para verificar o status:
sudo systemctl status postgresql
```

### Criar o Banco de Dados Manualmente

Após instalar PostgreSQL localmente, crie o banco de dados:

```bash
# Conectar como usuário postgres (substitua 'postgres' se necessário)
psql -U postgres

# Ou no Linux:
sudo -u postgres psql
```

Dentro do psql:

```sql
-- Criar usuário
CREATE USER agenda_user WITH PASSWORD 'agenda_password_dev';

-- Criar banco de dados
CREATE DATABASE agenda_dinamica OWNER agenda_user;

-- Conectar ao banco
\c agenda_dinamica

-- Criar extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Criar tabela de versão do schema
CREATE TABLE IF NOT EXISTS schema_version (
    version INTEGER PRIMARY KEY,
    applied_at TIMESTAMP NOT NULL DEFAULT NOW(),
    description TEXT
);

INSERT INTO schema_version (version, description) 
VALUES (1, 'Initial database setup with extensions');

-- Garantir que agenda_user tem todas as permissões
GRANT ALL PRIVILEGES ON DATABASE agenda_dinamica TO agenda_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO agenda_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO agenda_user;

-- Sair
\q
```

### Atualizar Variáveis de Ambiente

Se você instalou localmente e mudou as credenciais, atualize o arquivo `.env` no diretório `backend`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=agenda_dinamica
DB_USER=agenda_user
DB_PASSWORD=sua_senha_aqui
```

---

## Verificar a Conexão do Backend

Depois de configurar o PostgreSQL (Docker ou local), instale as dependências e teste a conexão:

```bash
# Navegar para o diretório backend
cd backend

# Instalar dependências (incluindo pg)
npm install

# Testar a conexão com o banco de dados
npm run test:db
```

---

## Próximos Passos

Após configurar o PostgreSQL:

1. ✅ PostgreSQL configurado e rodando
2. ⏭️ Criar tabelas do schema (users, notes, etc.) - Task 2
3. ⏭️ Implementar conexão no backend - Task 3
4. ⏭️ Criar repositórios e serviços - Tasks 4-5

---

## Troubleshooting

### Docker: Container não inicia

```bash
# Ver logs detalhados
docker-compose logs postgres

# Verificar se a porta 5432 já está em uso
netstat -ano | findstr :5432   # Windows
lsof -i :5432                  # macOS/Linux

# Se a porta estiver em uso, você pode:
# 1. Parar o serviço PostgreSQL local
# 2. Ou alterar a porta no docker-compose.yml para "5433:5432"
```

### Docker: Erro de permissão no volume

```bash
# Remover volumes e recriar
docker-compose down -v
docker-compose up -d
```

### Local: Erro "psql: FATAL: Peer authentication failed"

Edite o arquivo `pg_hba.conf`:
- **Linux:** `/etc/postgresql/14/main/pg_hba.conf`
- **macOS:** `/usr/local/var/postgres/pg_hba.conf`
- **Windows:** `C:\Program Files\PostgreSQL\14\data\pg_hba.conf`

Altere a linha:
```
local   all   all   peer
```
Para:
```
local   all   all   md5
```

Reinicie o PostgreSQL:
```bash
# Linux
sudo systemctl restart postgresql

# macOS
brew services restart postgresql@14

# Windows
# Usar "Services" app e reiniciar PostgreSQL
```

### Local: Erro de conexão "Connection refused"

Verifique se o PostgreSQL está rodando:

```bash
# Linux
sudo systemctl status postgresql

# macOS
brew services list | grep postgresql

# Windows
# Verificar em Services (services.msc)
```

Se não estiver rodando, inicie o serviço.

### Backend não conecta ao banco

1. Verifique as credenciais no arquivo `.env`
2. Certifique-se de que o PostgreSQL está rodando
3. Teste a conexão manualmente:

```bash
# Com Docker
docker exec -it agenda-dinamica-db psql -U agenda_user -d agenda_dinamica

# Com instalação local
psql -h localhost -U agenda_user -d agenda_dinamica
```

---

## Backup e Restore

### Criar Backup

```bash
# Docker
docker exec -t agenda-dinamica-db pg_dump -U agenda_user agenda_dinamica > backup.sql

# Local
pg_dump -U agenda_user -d agenda_dinamica > backup.sql
```

### Restaurar Backup

```bash
# Docker
docker exec -i agenda-dinamica-db psql -U agenda_user -d agenda_dinamica < backup.sql

# Local
psql -U agenda_user -d agenda_dinamica < backup.sql
```

---

## Ferramentas Recomendadas

- **pgAdmin 4** - Interface gráfica oficial ([Download](https://www.pgadmin.org/download/))
- **DBeaver** - Cliente SQL universal ([Download](https://dbeaver.io/download/))
- **TablePlus** - Cliente moderno e bonito (macOS/Windows) ([Download](https://tableplus.com/))
- **VS Code Extension** - PostgreSQL by Chris Kolkman

---

## Segurança em Produção

⚠️ **Antes de fazer deploy em produção:**

1. **Altere todas as senhas** - Use senhas fortes e únicas
2. **Use SSL/TLS** - Configure `ssl: true` na conexão
3. **Limite conexões** - Configure `max_connections` apropriadamente
4. **Backup automatizado** - Configure rotina de backup diária
5. **Monitore logs** - Use ferramentas de monitoramento (DataDog, New Relic, etc.)
6. **Atualize regularmente** - Mantenha PostgreSQL atualizado com patches de segurança
7. **Use variáveis de ambiente** - Nunca commit credenciais no código
8. **Configure firewall** - Permita conexões apenas de IPs confiáveis

---

## Recursos Adicionais

- [Documentação Oficial PostgreSQL](https://www.postgresql.org/docs/14/)
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Node.js pg Library](https://node-postgres.com/)

---

## Suporte

Em caso de problemas, verifique:
1. Os logs do PostgreSQL
2. As configurações no arquivo `.env`
3. A conectividade de rede (firewall, portas)
4. As permissões do usuário no banco de dados

Se o problema persistir, consulte a documentação ou abra uma issue no repositório do projeto.
