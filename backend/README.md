# AgendaDiaria Backend API

Backend API server for the AgendaDiaria multi-user authentication system.

## Requirements

- Node.js 18+ LTS
- PostgreSQL 14+

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables (create `.env` file):
```
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/agenda_dinamica
JWT_SECRET=your-secret-key
```

3. Run database migrations:
```bash
# Apply all pending migrations
npm run migrate:up

# Revert last migration
npm run migrate:down

# Create a new migration
npm run migrate:create <migration-name>
```

4. Start the server:
```bash
# Development mode with hot reload
npm run dev

# Production mode
npm start
```

## Scripts

- `npm start` - Start the production server
- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm test` - Run tests
- `npm run test:db` - Test database connection
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run migrate:up` - Apply pending database migrations
- `npm run migrate:down` - Revert last migration
- `npm run migrate:create` - Create a new migration file

## Project Structure

```
backend/
├── src/
│   ├── index.js          # Entry point
│   ├── routes/           # API route handlers
│   ├── controllers/      # Request controllers
│   ├── services/         # Business logic
│   ├── repositories/     # Database access layer
│   ├── middleware/       # Express middleware
│   └── utils/            # Utility functions
├── migrations/           # Database migrations
├── tests/                # Test files
├── migrations.config.json # Migration configuration
├── package.json
└── README.md
```

## Technology Stack

- **Runtime:** Node.js 18+ LTS
- **Framework:** Express.js 4.x
- **Database:** PostgreSQL 14+
- **Migrations:** node-pg-migrate
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcrypt
- **Validation:** express-validator or joi
- **File Upload:** multer
- **Email:** nodemailer

## Database Migrations

The project uses [node-pg-migrate](https://salsita.github.io/node-pg-migrate/) for managing database schema changes. All migration files are stored in the `migrations/` directory.

### Common Migration Commands

Create a new migration:
```bash
npm run migrate:create create-users-table
```

Apply all pending migrations:
```bash
npm run migrate:up
```

Revert the last migration:
```bash
npm run migrate:down
```

### Migration Best Practices

- Each migration should represent a single logical change
- Always include a `down()` function to revert changes
- Test both up and down migrations before committing
- Never modify migrations that have been applied in production
- See `migrations/README.md` for detailed documentation

## API Documentation

API documentation will be added as endpoints are implemented.
