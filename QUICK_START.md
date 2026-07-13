# Quick Start Guide - AgendaDinamica

## 🚀 Getting Started

This guide provides quick commands to get your development environment running.

---

## Prerequisites

- ✅ Docker Desktop installed and running
- ✅ Node.js 18+ installed
- ✅ PostgreSQL setup complete (via Docker)

---

## Starting the Database

### First Time Setup
```bash
# Start PostgreSQL container
docker-compose up -d

# Verify it's running
docker ps | grep agenda-dinamica-db

# Test database connection
cd backend
npm run test:db
```

### Daily Development
```bash
# Start database (if stopped)
docker-compose start

# Or start from scratch
docker-compose up -d
```

---

## Starting the Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

The backend will be available at: `http://localhost:3000`

---

## Common Commands

### Database Management

```bash
# View database logs
docker-compose logs -f postgres

# Access PostgreSQL CLI
docker exec -it agenda-dinamica-db psql -U agenda_user -d agenda_dinamica

# Stop database
docker-compose stop

# Restart database
docker-compose restart

# Stop and remove (keeps data)
docker-compose down

# Stop and remove ALL data
docker-compose down -v
```

### Backend Development

```bash
# From backend directory

# Run in development mode (auto-reload)
npm run dev

# Build TypeScript
npm run build

# Run production build
npm start

# Run tests
npm test

# Test database connection
npm run test:db

# Lint code
npm run lint

# Format code
npm run format
```

---

## Environment Configuration

### Database Connection (backend/.env)
```env
DB_HOST=localhost
DB_PORT=5433
DB_NAME=agenda_dinamica
DB_USER=agenda_user
DB_PASSWORD=agenda_password_dev
```

### Server Configuration (backend/.env)
```env
PORT=3000
NODE_ENV=development
```

---

## Troubleshooting

### Database won't start
```bash
# Check if Docker is running
docker ps

# Check logs
docker-compose logs postgres

# Restart everything
docker-compose down
docker-compose up -d
```

### Backend won't start
```bash
# Check if dependencies are installed
cd backend
npm install

# Verify database is running
npm run test:db

# Check for port conflicts
netstat -ano | findstr :3000
```

### Port 5433 already in use
```bash
# Find what's using the port
netstat -ano | findstr :5433

# Stop the container and change port in docker-compose.yml
docker-compose down
# Edit docker-compose.yml: change "5433:5432" to "5434:5432"
docker-compose up -d
# Update backend/.env: DB_PORT=5434
```

---

## Project Structure

```
Agenda_Dinamica/
├── backend/                  # Backend API
│   ├── src/                  # Source code
│   │   ├── config/           # Configuration
│   │   ├── controllers/      # Request handlers
│   │   ├── middleware/       # Express middleware
│   │   ├── repositories/     # Database access
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   └── index.ts          # Entry point
│   ├── .env                  # Environment variables
│   └── package.json          # Dependencies
├── docker-compose.yml        # Database container
└── POSTGRESQL_SETUP.md       # Detailed setup guide
```

---

## Development Workflow

1. **Start Database**
   ```bash
   docker-compose up -d
   ```

2. **Verify Database**
   ```bash
   cd backend
   npm run test:db
   ```

3. **Start Backend**
   ```bash
   npm run dev
   ```

4. **Make Changes**
   - Edit files in `backend/src/`
   - Server auto-reloads on save

5. **Test Changes**
   ```bash
   npm test
   ```

6. **Stop Everything**
   ```bash
   # Stop backend (Ctrl+C)
   # Stop database
   docker-compose stop
   ```

---

## Useful Database Queries

### Inside PostgreSQL CLI
```sql
-- List all tables
\dt

-- Describe a table
\d users

-- Show all databases
\l

-- Show current database
SELECT current_database();

-- Show database size
SELECT pg_size_pretty(pg_database_size('agenda_dinamica'));

-- Exit
\q
```

---

## Next Steps

- [x] PostgreSQL running ✅
- [ ] Create database schema (users, notes, etc.)
- [ ] Implement authentication endpoints
- [ ] Create user management features
- [ ] Build frontend interface

---

## Documentation

- [POSTGRESQL_SETUP.md](./POSTGRESQL_SETUP.md) - Detailed database setup
- [POSTGRESQL_SETUP_VERIFICATION.md](./POSTGRESQL_SETUP_VERIFICATION.md) - Verification report
- [backend/README.md](./backend/README.md) - Backend documentation

---

## Support

Having issues? Check:
1. Docker Desktop is running
2. Database container is healthy: `docker ps`
3. Environment variables are correct: `backend/.env`
4. Test database connection: `npm run test:db`
5. Check logs: `docker-compose logs postgres`

---

**Happy Coding! 🚀**
