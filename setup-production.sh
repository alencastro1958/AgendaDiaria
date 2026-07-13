#!/bin/bash

# AgendaDiaria Production Setup Script
# Run this script on your server to deploy the application

set -e

echo "========================================="
echo "  AgendaDiaria - Production Setup"
echo "========================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed."
    echo "Please install Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "Error: Docker Compose is not installed."
    echo "Please install Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

# Create .env.production if it doesn't exist
if [ ! -f .env.production ]; then
    echo ""
    echo "Creating .env.production from template..."
    
    # Generate random secrets
    JWT_SECRET=$(openssl rand -hex 32 2>/dev/null || head -c 64 /dev/urandom | base64)
    DB_PASSWORD=$(openssl rand -hex 16 2>/dev/null || head -c 32 /dev/urandom | base64)
    
    cat > .env.production << EOF
# ===========================================
# AgendaDiaria Production Configuration
# ===========================================
# Generated on: $(date)

# Database
DB_NAME=agendadiaria
DB_USER=agendadiaria_user
DB_PASSWORD=${DB_PASSWORD}

# JWT Secret (generate a new one for each environment)
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRATION=7d

# Server
PORT=3000
NODE_ENV=production

# Email (SMTP) - Configure your email provider
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@yourdomain.com

# Domain (update with your actual domain)
CORS_ORIGIN=https://yourdomain.com

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# File Storage
MAX_FILE_SIZE=10485760
MAX_AUDIO_SIZE=5242880
MAX_VIDEO_SIZE=52428800
STORAGE_QUOTA=104857600

# Trial
TRIAL_PERIOD_DAYS=3
EOF

    echo "Created .env.production with random secrets."
    echo ""
    echo "IMPORTANT: Edit .env.production to configure:"
    echo "  - SMTP credentials for email"
    echo "  - CORS_ORIGIN with your domain"
    echo "  - Payment gateway keys (if using)"
    echo ""
    read -p "Press Enter to continue after reviewing .env.production..."
fi

# Create SSL directory
mkdir -p ssl

# Check for SSL certificates
if [ ! -f ssl/fullchain.pem ] || [ ! -f ssl/privkey.pem ]; then
    echo ""
    echo "SSL certificates not found in ./ssl/"
    echo ""
    echo "Options:"
    echo "1. Use Let's Encrypt (recommended):"
    echo "   sudo apt install certbot python3-certbot-nginx"
    echo "   sudo certbot certonly --standalone -d yourdomain.com"
    echo "   sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/"
    echo "   sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/"
    echo ""
    echo "2. Use self-signed certificates (testing only):"
    echo "   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \\"
    echo "     -keyout ssl/privkey.pem -out ssl/fullchain.pem \\"
    echo "     -subj '/CN=yourdomain.com'"
    echo ""
    read -p "Do you want to generate self-signed certificates for testing? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout ssl/privkey.pem -out ssl/fullchain.pem \
            -subj '/CN=localhost'
        echo "Self-signed certificates generated."
    fi
fi

# Create frontend directory and copy index.html
mkdir -p frontend
cp index.html frontend/

# Stop existing containers
echo ""
echo "Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

# Build and start services
echo ""
echo "Building and starting services..."
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
echo ""
echo "Waiting for services to start..."
sleep 10

# Check service status
echo ""
echo "Service Status:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "========================================="
echo "  Setup Complete!"
echo "========================================="
echo ""
echo "Your application is now running at:"
echo "  HTTP:  http://yourdomain.com"
echo "  HTTPS: https://yourdomain.com"
echo ""
echo "Useful commands:"
echo "  View logs:    docker-compose -f docker-compose.prod.yml logs -f"
echo "  Stop:         docker-compose -f docker-compose.prod.yml down"
echo "  Restart:      docker-compose -f docker-compose.prod.yml restart"
echo "  Update:       docker-compose -f docker-compose.prod.yml up -d --build"
echo ""
