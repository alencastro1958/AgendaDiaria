/**
 * Database Permissions Verification Script
 * 
 * This script verifies that the agenda_user has all necessary permissions
 * to support the multi-user authentication system.
 */

import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// ANSI color codes for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function pass(message) {
  console.log(`${colors.green}✅ PASS${colors.reset} - ${message}`);
}

function fail(message) {
  console.log(`${colors.red}❌ FAIL${colors.reset} - ${message}`);
}

function info(message) {
  console.log(`${colors.blue}ℹ INFO${colors.reset} - ${message}`);
}

function section(title) {
  console.log(`\n${colors.bold}${colors.yellow}=== ${title} ===${colors.reset}\n`);
}

async function runTest(testName, testFn) {
  try {
    const result = await testFn();
    if (result) {
      pass(testName);
      return true;
    } else {
      fail(testName);
      return false;
    }
  } catch (error) {
    fail(`${testName} - Error: ${error.message}`);
    return false;
  }
}

async function verifyPermissions() {
  let allPassed = true;
  
  console.log(`${colors.bold}${colors.blue}
╔════════════════════════════════════════════════════════════╗
║     Database Permissions Verification Tool                ║
║     AgendaDinamica Multi-User Authentication System       ║
╚════════════════════════════════════════════════════════════╝
${colors.reset}`);

  // Test 1: Basic Connection
  section('1. Database Connection');
  allPassed &= await runTest('Connect to PostgreSQL', async () => {
    const result = await pool.query('SELECT version()');
    info(`PostgreSQL Version: ${result.rows[0].version}`);
    return true;
  });

  // Test 2: User Role Verification
  section('2. User Role and Attributes');
  allPassed &= await runTest('Check user role attributes', async () => {
    const result = await pool.query(`
      SELECT rolname, rolsuper, rolcreaterole, rolcreatedb, rolreplication, rolbypassrls
      FROM pg_roles
      WHERE rolname = $1
    `, [process.env.DB_USER]);
    
    if (result.rows.length === 0) {
      info('User not found');
      return false;
    }
    
    const user = result.rows[0];
    info(`User: ${user.rolname}`);
    info(`Superuser: ${user.rolsuper}`);
    info(`Create Role: ${user.rolcreaterole}`);
    info(`Create DB: ${user.rolcreatedb}`);
    info(`Replication: ${user.rolreplication}`);
    info(`Bypass RLS: ${user.rolbypassrls}`);
    
    return true;
  });

  // Test 3: Database-Level Permissions
  section('3. Database-Level Permissions');
  allPassed &= await runTest('Check CREATE privilege', async () => {
    const result = await pool.query(`
      SELECT has_database_privilege($1, $2, 'CREATE') as can_create
    `, [process.env.DB_USER, process.env.DB_NAME]);
    return result.rows[0].can_create;
  });

  allPassed &= await runTest('Check CONNECT privilege', async () => {
    const result = await pool.query(`
      SELECT has_database_privilege($1, $2, 'CONNECT') as can_connect
    `, [process.env.DB_USER, process.env.DB_NAME]);
    return result.rows[0].can_connect;
  });

  allPassed &= await runTest('Check TEMP privilege', async () => {
    const result = await pool.query(`
      SELECT has_database_privilege($1, $2, 'TEMP') as can_temp
    `, [process.env.DB_USER, process.env.DB_NAME]);
    return result.rows[0].can_temp;
  });

  // Test 4: Schema-Level Permissions
  section('4. Schema-Level Permissions');
  allPassed &= await runTest('Check CREATE on public schema', async () => {
    const result = await pool.query(`
      SELECT has_schema_privilege($1, 'public', 'CREATE') as can_create
    `, [process.env.DB_USER]);
    return result.rows[0].can_create;
  });

  allPassed &= await runTest('Check USAGE on public schema', async () => {
    const result = await pool.query(`
      SELECT has_schema_privilege($1, 'public', 'USAGE') as can_use
    `, [process.env.DB_USER]);
    return result.rows[0].can_use;
  });

  // Test 5: Table Operations
  section('5. Table CRUD Operations');
  const testTableName = 'test_permissions_' + Date.now();
  
  allPassed &= await runTest('CREATE TABLE', async () => {
    await pool.query(`
      CREATE TABLE ${testTableName} (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    return true;
  });

  allPassed &= await runTest('INSERT data', async () => {
    await pool.query(`
      INSERT INTO ${testTableName} (name) VALUES ($1)
    `, ['test_value']);
    return true;
  });

  allPassed &= await runTest('SELECT data', async () => {
    const result = await pool.query(`
      SELECT * FROM ${testTableName}
    `);
    return result.rows.length === 1;
  });

  allPassed &= await runTest('UPDATE data', async () => {
    await pool.query(`
      UPDATE ${testTableName} SET name = $1 WHERE name = $2
    `, ['updated_value', 'test_value']);
    const result = await pool.query(`
      SELECT * FROM ${testTableName} WHERE name = $1
    `, ['updated_value']);
    return result.rows.length === 1;
  });

  allPassed &= await runTest('DELETE data', async () => {
    await pool.query(`
      DELETE FROM ${testTableName}
    `);
    const result = await pool.query(`
      SELECT * FROM ${testTableName}
    `);
    return result.rows.length === 0;
  });

  allPassed &= await runTest('DROP TABLE', async () => {
    await pool.query(`
      DROP TABLE ${testTableName}
    `);
    return true;
  });

  // Test 6: Index Creation
  section('6. Index Creation');
  const testIndexTable = 'test_index_' + Date.now();
  
  allPassed &= await runTest('Create table with index', async () => {
    await pool.query(`
      CREATE TABLE ${testIndexTable} (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email TEXT NOT NULL,
        tags TEXT[]
      )
    `);
    return true;
  });

  allPassed &= await runTest('CREATE B-tree index', async () => {
    await pool.query(`
      CREATE INDEX idx_${testIndexTable}_email ON ${testIndexTable}(email)
    `);
    return true;
  });

  allPassed &= await runTest('CREATE GIN index (for arrays)', async () => {
    await pool.query(`
      CREATE INDEX idx_${testIndexTable}_tags ON ${testIndexTable} USING GIN(tags)
    `);
    return true;
  });

  allPassed &= await runTest('DROP test index table', async () => {
    await pool.query(`
      DROP TABLE ${testIndexTable}
    `);
    return true;
  });

  // Test 7: Constraints
  section('7. Database Constraints');
  const testConstraintTable = 'test_constraint_' + Date.now();
  
  allPassed &= await runTest('Create table with constraints', async () => {
    await pool.query(`
      CREATE TABLE ${testConstraintTable} (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email TEXT NOT NULL UNIQUE,
        username TEXT CHECK (username ~ '^[a-zA-Z0-9_-]{3,20}$'),
        status TEXT DEFAULT 'active'
      )
    `);
    return true;
  });

  allPassed &= await runTest('UNIQUE constraint enforcement', async () => {
    await pool.query(`
      INSERT INTO ${testConstraintTable} (email, username) VALUES ($1, $2)
    `, ['test@example.com', 'testuser']);
    
    try {
      await pool.query(`
        INSERT INTO ${testConstraintTable} (email, username) VALUES ($1, $2)
      `, ['test@example.com', 'testuser2']);
      return false; // Should have failed
    } catch (error) {
      // Expected to fail due to UNIQUE constraint
      return error.code === '23505'; // unique_violation
    }
  });

  allPassed &= await runTest('CHECK constraint enforcement', async () => {
    try {
      await pool.query(`
        INSERT INTO ${testConstraintTable} (email, username) VALUES ($1, $2)
      `, ['test2@example.com', 'ab']); // Too short (< 3 chars)
      return false; // Should have failed
    } catch (error) {
      // Expected to fail due to CHECK constraint
      return error.code === '23514'; // check_violation
    }
  });

  allPassed &= await runTest('DROP test constraint table', async () => {
    await pool.query(`
      DROP TABLE ${testConstraintTable}
    `);
    return true;
  });

  // Test 8: Extensions
  section('8. PostgreSQL Extensions');
  allPassed &= await runTest('Check uuid-ossp extension', async () => {
    const result = await pool.query(`
      SELECT uuid_generate_v4() as test_uuid
    `);
    info(`Generated UUID: ${result.rows[0].test_uuid}`);
    return true;
  });

  allPassed &= await runTest('Check pgcrypto extension', async () => {
    const result = await pool.query(`
      SELECT digest('test_password', 'sha256') as test_hash
    `);
    info(`Generated hash: ${result.rows[0].test_hash.toString('hex').substring(0, 20)}...`);
    return true;
  });

  // Test 9: Foreign Keys
  section('9. Foreign Key Constraints');
  const parentTable = 'test_parent_' + Date.now();
  const childTable = 'test_child_' + Date.now();
  
  allPassed &= await runTest('Create parent-child tables with FK', async () => {
    await pool.query(`
      CREATE TABLE ${parentTable} (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL
      )
    `);
    await pool.query(`
      CREATE TABLE ${childTable} (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        parent_id UUID NOT NULL REFERENCES ${parentTable}(id) ON DELETE CASCADE,
        value TEXT
      )
    `);
    return true;
  });

  allPassed &= await runTest('Foreign key enforcement', async () => {
    const parentResult = await pool.query(`
      INSERT INTO ${parentTable} (name) VALUES ($1) RETURNING id
    `, ['parent_record']);
    
    const parentId = parentResult.rows[0].id;
    
    await pool.query(`
      INSERT INTO ${childTable} (parent_id, value) VALUES ($1, $2)
    `, [parentId, 'child_record']);
    
    return true;
  });

  allPassed &= await runTest('CASCADE DELETE enforcement', async () => {
    await pool.query(`
      DELETE FROM ${parentTable}
    `);
    
    const result = await pool.query(`
      SELECT COUNT(*) as count FROM ${childTable}
    `);
    
    // Child records should be deleted due to CASCADE
    return result.rows[0].count === '0';
  });

  allPassed &= await runTest('DROP FK test tables', async () => {
    await pool.query(`
      DROP TABLE IF EXISTS ${childTable}
    `);
    await pool.query(`
      DROP TABLE IF EXISTS ${parentTable}
    `);
    return true;
  });

  // Summary
  section('Verification Summary');
  
  if (allPassed) {
    console.log(`${colors.green}${colors.bold}
╔════════════════════════════════════════════════════════════╗
║  ✅ ALL PERMISSIONS VERIFIED SUCCESSFULLY                 ║
║                                                            ║
║  The database user '${process.env.DB_USER}' has all necessary    ║
║  permissions to support the multi-user authentication     ║
║  system.                                                   ║
╚════════════════════════════════════════════════════════════╝
${colors.reset}`);
  } else {
    console.log(`${colors.red}${colors.bold}
╔════════════════════════════════════════════════════════════╗
║  ❌ SOME PERMISSION CHECKS FAILED                         ║
║                                                            ║
║  Please review the failed tests above and ensure the      ║
║  database user has the necessary permissions.             ║
╚════════════════════════════════════════════════════════════╝
${colors.reset}`);
  }

  await pool.end();
  process.exit(allPassed ? 0 : 1);
}

// Run verification
verifyPermissions().catch((error) => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
