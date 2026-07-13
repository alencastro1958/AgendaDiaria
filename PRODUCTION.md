# AgendaDiaria - Guia de Implantação em Produção

## Pré-requisitos

### Servidor
- **Sistema Operacional**: Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- **RAM**: Mínimo 2GB (recomendado 4GB)
- **Disco**: Mínimo 20GB livres
- **Acesso**: SSH com permissões sudo

### Software
- Docker 20.10+
- Docker Compose 2.0+
- Git

---

## Instalação Rápida

### 1. Conectar ao Servidor

```bash
ssh usuario@seu-servidor.com
```

### 2. Instalar Docker

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER

# Aplicar mudanças de grupo
newgrp docker
```

### 3. Instalar Docker Compose

```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

sudo chmod +x /usr/local/bin/docker-compose
```

### 4. Clonar o Projeto

```bash
cd /opt
sudo git clone https://github.com/seu-usuario/agenda-dinamica.git
sudo chown -R $USER:$USER agenda-dinamica
cd agenda-dinamica
```

---

## Configuração

### 1. Configurar Variáveis de Ambiente

```bash
# Editar arquivo de configuração
nano .env.production
```

Variáveis obrigatórias:

| Variável | Descrição |
|----------|-----------|
| `DB_PASSWORD` | Senha do banco de dados |
| `JWT_SECRET` | Chave secreta para JWT (mínimo 32 caracteres) |
| `SMTP_USER` | E-mail para envio de notificações |
| `SMTP_PASS` | Senha do e-mail (use senha de app do Gmail) |
| `CORS_ORIGIN` | Domínio da aplicação (ex: https://agendadiaria.com) |

### 2. Configurar SSL/HTTPS

#### Opção 1: Let's Encrypt (Recomendado)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obter certificados (pare o nginx temporariamente se estiver rodando)
sudo certbot certonly --standalone -d seu-dominio.com -d www.seu-dominio.com

# Copiar certificados
mkdir -p ssl
sudo cp /etc/letsencrypt/live/seu-dominio.com/fullchain.pem ssl/
sudo cp /etc/letsencrypt/live/seu-dominio.com/privkey.pem ssl/
sudo chown $USER:$USER ssl/*
```

#### Opção 2: Autoassinado (Apenas para Testes)

```bash
mkdir -p ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/privkey.pem -out ssl/fullchain.pem \
  -subj '/CN=seu-dominio.com'
```

### 3. Configurar Frontend

```bash
# Copiar index.html para o diretório do frontend
mkdir -p frontend
cp index.html frontend/
```

---

## Implantação

### Executar Script de Setup

```bash
chmod +x setup-production.sh
./setup-production.sh
```

### Ou Execute Manualmente

```bash
# Build e iniciar serviços
docker-compose -f docker-compose.prod.yml up -d --build

# Verificar status
docker-compose -f docker-compose.prod.yml ps

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f
```

---

## Comandos Úteis

### Gerenciamento de Serviços

```bash
# Iniciar
docker-compose -f docker-compose.prod.yml up -d

# Parar
docker-compose -f docker-compose.prod.yml down

# Reiniciar
docker-compose -f docker-compose.prod.yml restart

# Atualizar (após mudanças no código)
docker-compose -f docker-compose.prod.yml up -d --build

# Ver logs em tempo real
docker-compose -f docker-compose.prod.yml logs -f

# Logs de serviço específico
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f postgres
```

### Banco de Dados

```bash
# Acessar console do PostgreSQL
docker-compose -f docker-compose.prod.yml exec postgres psql -U agendadiaria_user -d agendadiaria

# Criar backup
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U agendadiaria_user agendadiaria > backup_$(date +%Y%m%d).sql

# Restaurar backup
cat backup.sql | docker-compose -f docker-compose.prod.yml exec -T postgres psql -U agendadiaria_user -d agendadiaria
```

### Monitoramento

```bash
# Status dos containers
docker-compose -f docker-compose.prod.yml ps

# Uso de recursos
docker stats

# Espaço em disco
docker system df
```

---

## Backup Automático

### Criar Script de Backup

```bash
cat > /opt/backup-agendadiaria.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/backups/agendadiaria"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup do banco
docker-compose -f /opt/agenda-dinamica/docker-compose.prod.yml exec -T postgres \
  pg_dump -U agendadiaria_user agendadiaria | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup dos uploads
docker cp agendadiaria-api-prod:/app/uploads $BACKUP_DIR/uploads_$DATE

# Manter apenas últimos 7 backups
cd $BACKUP_DIR && ls -t db_*.sql.gz | tail -n +8 | xargs rm -f
cd $BACKUP_DIR && ls -t uploads_* -d | tail -n +8 | xargs rm -rf

echo "Backup concluído: $DATE"
EOF

chmod +x /opt/backup-agendadiaria.sh
```

### Agendar Backup Diário

```bash
# Editar crontab
crontab -e

# Adicionar linha (executa todo dia às 2h)
0 2 * * * /opt/backup-agendadiaria.sh >> /var/log/backup-agendadiaria.log 2>&1
```

---

## Segurança

### Checklist de Segurança

- [ ] Senhas fortes em todas as variáveis de ambiente
- [ ] JWT_SECRET com mínimo 32 caracteres
- [ ] SSL/HTTPS configurado
- [ ] Firewall configurado (apenas portas 80 e 443)
- [ ] Backup automático configurado
- [ ] Logs monitorados
- [ ] Containers rodando como non-root

### Configurar Firewall (UFW)

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
sudo ufw status
```

---

## Solução de Problemas

### Container não inicia

```bash
# Verificar logs
docker-compose -f docker-compose.prod.yml logs backend

# Verificar se o banco está rodando
docker-compose -f docker-compose.prod.yml ps postgres
```

### Erro de conexão com banco

```bash
# Testar conexão
docker-compose -f docker-compose.prod.yml exec backend node -e "
  const pg = require('pg');
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  pool.query('SELECT NOW()').then(r => {
    console.log('Conectado:', r.rows[0]);
    process.exit(0);
  }).catch(e => {
    console.error('Erro:', e.message);
    process.exit(1);
  });
"
```

### Erro de SSL

```bash
# Verificar certificados
ls -la ssl/

# Testar configuração do nginx
docker-compose -f docker-compose.prod.yml exec nginx nginx -t
```

### Espaço em disco cheio

```bash
# Limpar imagens não utilizadas
docker system prune -a

# Limpar backups antigos
find /opt/backups -name "*.sql.gz" -mtime +7 -delete
```

---

## Arquitetura

```
                    ┌─────────────┐
                    │   Internet  │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │    Nginx    │
                    │  (Port 80/  │
                    │   443)      │
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              │                         │
     ┌────────▼────────┐     ┌─────────▼─────────┐
     │    Frontend     │     │     Backend       │
     │   (Static)      │     │   (Node.js)       │
     │   Port: 80      │     │   Port: 3000      │
     └─────────────────┘     └─────────┬─────────┘
                                       │
                              ┌────────▼────────┐
                              │    PostgreSQL   │
                              │   Port: 5432    │
                              └─────────────────┘
```

---

## Contato

Em caso de problemas, consulte:
- Documentação: https://github.com/seu-usuario/agenda-dinamica
- Issues: https://github.com/seu-usuario/agenda-dinamica/issues
