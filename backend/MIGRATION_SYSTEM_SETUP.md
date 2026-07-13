# Database Migration System Setup - Complete

## Overview

The database migration system has been successfully configured for the AgendaDiaria backend project using **node-pg-migrate**. This system provides version-controlled schema management for PostgreSQL.

## What Was Installed

### Package
- **node-pg-migrate v8.0.4** - Added as a dev dependency

### Files Created

1. **migrations/.gitkeep** - Placeholder to track the migrations directory
2. **migrations/README.md** - Comprehensive documentation on using migrations
3. **migrations.config.json** - Configuration file for node-pg-migrate

### Configuration Files

#### migrations.config.json
```json
{
  "migrationsTable": "pgmigrations",
  "dir": "migrations",
  "direction": "up",
  "count": 999,
  "createSchema": true,
  "createMigrationsSchema": false,
  "checkOrder": true,
  "verbose": true,
  "decamelize": true,
  "ignorePattern": "\\..*\\.js"
}
```

**Key settings:**
- `migrationsTable`: Tracks applied migrations in a table named "pgmigrations"
- `dir`: Migration files are stored in the "migrations" directory
- `createSchema`: Automatically creates schemas if they don't exist
- `checkOrder`: Validates migration execution order
- `verbose`: Provides detailed output during migration operations
- `decamelize`: Converts camelCase to snake_case for PostgreSQL conventions

## NPM Scripts Added

The following scripts were added to `package.json`:

```json
{
  "migrate": "node-pg-migrate --envPath .env --config-file migrations.config.json",
  "migrate:up": "node-pg-migrate up --envPath .env --config-file migrations.config.json",
  "migrate:down": "node-pg-migrate down --envPath .env --config-file migrations.config.json",
  "migrate:create": "node-pg-migrate create --envPath .env --config-file migrations.config.json"
}
```

### Script Usage

**Create a new migration:**
```bash
npm run migrate:create <migration-name>
```
Example:
```bash
npm run migrate:create create-users-table
```

**Apply pending migrations:**
```bash
npm run migrate:up
```

**Revert last migration:**
```bash
npm run migrate:down
```

## Database Connection

The migration system reads the database connection from the `DATABASE_URL` environment variable in the `.env` file:

```
DATABASE_URL=postgresql://agenda_user:agenda_password_dev@localhost:5433/agenda_dinamica
```

## Migration File Structure

When you create a migration, a timestamped file is generated with the following structure:

```javascript
/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  // Define schema changes to apply
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  // Define how to revert the changes
};
```

## Example Migration

Here's an example of creating a users table:

```javascript
export const up = (pgm) => {
  pgm.createTable('users', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()')
    },
    full_name: {
      type: 'varchar(255)',
      notNull: true
    },
    email: {
      type: 'varchar(255)',
      notNull: true,
      unique: true
    },
    username: {
      type: 'varchar(20)',
      notNull: true,
      unique: true
    },
    password_hash: {
      type: 'text',
      notNull: true
    },
    status: {
      type: 'varchar(50)',
      notNull: true,
      default: 'pending_verification'
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('NOW()')
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('NOW()')
    }
  });

  // Create indexes
  pgm.createIndex('users', 'email');
  pgm.createIndex('users', 'username');
  pgm.createIndex('users', 'status');
};

export const down = (pgm) => {
  pgm.dropTable('users');
};
```

## Testing the Setup

The system was tested by:
1. Creating a test migration file
2. Verifying the migration file template structure
3. Confirming the migration file was created with the correct timestamp format
4. Removing the test migration file

**Test command used:**
```bash
npm run migrate:create test-migration
```

**Result:** Successfully created migration file with timestamp format:
```
1783884647395_test-migration.js
```

## Migration Tracking

node-pg-migrate automatically creates a table named `pgmigrations` in your database to track which migrations have been applied. This table contains:
- `id`: Sequential migration identifier
- `name`: Migration filename
- `run_on`: Timestamp when the migration was applied

**Important:** Do not manually modify the `pgmigrations` table.

## Documentation Updates

The following documentation files were updated:

1. **backend/README.md**
   - Added migration commands to setup instructions
   - Added migration scripts to the Scripts section
   - Added node-pg-migrate to Technology Stack
   - Added Database Migrations section with best practices

2. **migrations/README.md** (NEW)
   - Comprehensive guide on using migrations
   - Common operations and examples
   - Best practices
   - Troubleshooting guide

## Next Steps

Now that the migration system is set up, you can:

1. **Create the initial database schema** by creating migrations for:
   - Users table
   - Email tokens table
   - Notes table
   - Links table
   - Media files table
   - Subscriptions table
   - Payment methods table
   - Payments table
   - Audit logs table

2. **Run migrations** in your development environment:
   ```bash
   npm run migrate:up
   ```

3. **Integrate migrations into deployment pipeline** to automatically apply migrations in production

## Benefits of This Setup

✅ **Version Control**: Database schema is version-controlled alongside code
✅ **Reproducibility**: Same schema can be replicated across environments
✅ **Rollback Support**: Migrations can be reverted using `down()` functions
✅ **Team Collaboration**: Multiple developers can work on schema changes without conflicts
✅ **Audit Trail**: Clear history of all schema changes
✅ **PostgreSQL Optimized**: Native PostgreSQL features and data types
✅ **Type Safety**: TypeScript definitions for migration builder

## Resources

- [node-pg-migrate Documentation](https://salsita.github.io/node-pg-migrate/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Design Document - Database Schema](../.kiro/specs/multi-user-authentication/design.md#database-schema-postgresql)
