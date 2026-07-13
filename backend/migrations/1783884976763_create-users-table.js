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
  // Create users table with all required columns
  pgm.createTable('users', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    full_name: {
      type: 'varchar(255)',
      notNull: true,
    },
    cpf_encrypted: {
      type: 'text',
      notNull: true,
      unique: true,
    },
    email: {
      type: 'varchar(255)',
      notNull: true,
      unique: true,
    },
    username: {
      type: 'varchar(20)',
      notNull: true,
      unique: true,
    },
    password_hash: {
      type: 'text',
      notNull: true,
    },
    status: {
      type: 'varchar(50)',
      notNull: true,
      default: "'pending_verification'",
    },
    trial_start_date: {
      type: 'timestamp',
      notNull: false,
    },
    trial_end_date: {
      type: 'timestamp',
      notNull: false,
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('NOW()'),
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('NOW()'),
    },
    deleted_at: {
      type: 'timestamp',
      notNull: false,
    },
  });

  // Add username format constraint
  pgm.addConstraint('users', 'username_format', {
    check: "username ~ '^[a-zA-Z0-9_-]{3,20}$'",
  });

  // Create indexes for optimized queries
  pgm.createIndex('users', 'email');
  pgm.createIndex('users', 'username');
  pgm.createIndex('users', 'status');
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  // Drop indexes first
  pgm.dropIndex('users', 'status');
  pgm.dropIndex('users', 'username');
  pgm.dropIndex('users', 'email');

  // Drop constraint
  pgm.dropConstraint('users', 'username_format');

  // Drop the table
  pgm.dropTable('users');
};
