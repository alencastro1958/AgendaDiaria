# Database Migrations

This directory contains database migration files for the AgendaDiaria backend, managed by [node-pg-migrate](https://salsita.github.io/node-pg-migrate/).

## Overview

Database migrations provide a version-controlled way to manage schema changes. Each migration file represents a specific change to the database schema and can be applied (up) or reverted (down).

## Configuration

Migration settings are defined in `migrations.config.json` in the backend root directory. The database connection is configured via the `DATABASE_URL` environment variable in `.env`.

## Migration Scripts

The following npm scripts are available for managing migrations:

### Create a New Migration

```bash
npm run migrate:create <migration-name>
```

Example:
```bash
npm run migrate:create create-users-table
```

This creates a new timestamped migration file in the `migrations/` directory with the format:
```
<timestamp>_<migration-name>.js
```

### Apply Pending Migrations

```bash
npm run migrate:up
```

Applies all pending migrations to the database. This is typically run:
- During deployment to production
- After pulling new migrations from version control
- When setting up a new development environment

### Revert Last Migration

```bash
npm run migrate:down
```

Reverts the most recently applied migration. Useful for:
- Rolling back a problematic migration
- Testing migration rollback logic
- Development and testing

### Check Migration Status

```bash
npm run migrate:status
```

Lists all migrations with their current status (applied/pending).

## Migration File Structure

Each migration file exports two functions:

```javascript
/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export async function up(pgm) {
  // Define schema changes to apply
  pgm.createTable('users', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()')
    },
    email: {
      type: 'varchar(255)',
      notNull: true,
      unique: true
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('NOW()')
    }
  });
}

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export async function down(pgm) {
  // Define how to revert the changes
  pgm.dropTable('users');
}
```

## Best Practices

1. **One Change Per Migration**: Each migration should represent a single logical change (e.g., create a table, add an index)

2. **Always Include Down Migration**: Every `up()` should have a corresponding `down()` that reverts the change

3. **Test Migrations**: Test both up and down migrations before committing:
   ```bash
   npm run migrate:up
   npm run migrate:down
   npm run migrate:up
   ```

4. **Never Modify Applied Migrations**: Once a migration has been applied in any environment (especially production), never modify it. Create a new migration instead.

5. **Use Transactions**: Migrations run in transactions by default. Keep them idempotent when possible.

6. **Add Indexes**: Include appropriate indexes for foreign keys and frequently queried columns

7. **Use Descriptive Names**: Migration names should clearly describe what they do:
   - `create-users-table`
   - `add-username-to-users`
   - `create-notes-table-with-indexes`

## Common Operations

### Create a Table with Indexes

```javascript
export async function up(pgm) {
  pgm.createTable('notes', {
    id: 'id',  // Shorthand for UUID primary key
    user_id: {
      type: 'uuid',
      notNull: true,
      references: 'users',
      onDelete: 'CASCADE'
    },
    date: {
      type: 'date',
      notNull: true
    },
    content: 'text',
    created_at: 'createdAt',  // Shorthand
    updated_at: 'updatedAt'   // Shorthand
  });

  pgm.createIndex('notes', 'user_id');
  pgm.createIndex('notes', 'date');
  pgm.createIndex('notes', ['user_id', 'date']);
}

export async function down(pgm) {
  pgm.dropTable('notes');
}
```

### Add a Column

```javascript
export async function up(pgm) {
  pgm.addColumn('users', {
    username: {
      type: 'varchar(20)',
      notNull: true,
      unique: true
    }
  });
}

export async function down(pgm) {
  pgm.dropColumn('users', 'username');
}
```

### Add an Index

```javascript
export async function up(pgm) {
  pgm.createIndex('notes', 'tags', {
    method: 'gin'
  });
}

export async function down(pgm) {
  pgm.dropIndex('notes', 'tags');
}
```

## Migration Tracking

node-pg-migrate tracks applied migrations in a table called `pgmigrations` in your database. This table is created automatically on the first migration.

Do not manually modify this table.

## Troubleshooting

### Migration Failed

If a migration fails midway:
1. Check the error message
2. Fix the migration file
3. Manually revert any partial changes in the database if needed
4. Run the migration again

### Migration Out of Order

If migrations were applied in the wrong order (e.g., on different branches), the `checkOrder` setting will detect this and prevent execution.

### Reset All Migrations (Development Only)

**WARNING: This destroys all data!**

```bash
# Drop and recreate the database
dropdb agenda_dinamica
createdb agenda_dinamica
npm run migrate:up
```

## Integration with Application

The application should check migration status on startup in production:

```javascript
import pg from 'pg';
import pgMigrate from 'node-pg-migrate';

async function runMigrations() {
  await pgMigrate({
    databaseUrl: process.env.DATABASE_URL,
    dir: 'migrations',
    direction: 'up',
    migrationsTable: 'pgmigrations'
  });
}

// Run migrations before starting server
await runMigrations();
```

## Resources

- [node-pg-migrate Documentation](https://salsita.github.io/node-pg-migrate/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
