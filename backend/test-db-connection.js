/**
 * Database Connection Test Script
 * Tests PostgreSQL connectivity with the configuration from .env
 */

import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();
const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  min: parseInt(process.env.DB_POOL_MIN || '5'),
  max: parseInt(process.env.DB_POOL_MAX || '20'),
});

async function testConnection() {
  console.log('🔍 Testing PostgreSQL connection...\n');
  
  console.log('Configuration:');
  console.log(`  Host: ${process.env.DB_HOST}`);
  console.log(`  Port: ${process.env.DB_PORT}`);
  console.log(`  Database: ${process.env.DB_NAME}`);
  console.log(`  User: ${process.env.DB_USER}`);
  console.log(`  Pool: ${process.env.DB_POOL_MIN}-${process.env.DB_POOL_MAX} connections\n`);

  try {
    // Test 1: Basic connection
    console.log('✓ Test 1: Basic connection');
    const client = await pool.connect();
    console.log('  ✓ Connected successfully\n');

    // Test 2: Query database version
    console.log('✓ Test 2: Query database version');
    const versionResult = await client.query('SELECT version()');
    console.log(`  ✓ ${versionResult.rows[0].version}\n`);

    // Test 3: Check extensions
    console.log('✓ Test 3: Check installed extensions');
    const extensionsResult = await client.query(`
      SELECT extname, extversion 
      FROM pg_extension 
      WHERE extname IN ('uuid-ossp', 'pgcrypto')
      ORDER BY extname
    `);
    extensionsResult.rows.forEach(row => {
      console.log(`  ✓ ${row.extname} v${row.extversion}`);
    });
    console.log();

    // Test 4: Check schema version
    console.log('✓ Test 4: Check schema version');
    const schemaResult = await client.query('SELECT * FROM schema_version');
    schemaResult.rows.forEach(row => {
      console.log(`  ✓ Version ${row.version}: ${row.description}`);
      console.log(`    Applied at: ${row.applied_at}`);
    });
    console.log();

    // Test 5: Test UUID generation
    console.log('✓ Test 5: Test UUID generation');
    const uuidResult = await client.query('SELECT uuid_generate_v4() as test_uuid');
    console.log(`  ✓ Generated UUID: ${uuidResult.rows[0].test_uuid}\n`);

    // Test 6: Test encryption function
    console.log('✓ Test 6: Test encryption function (pgcrypto)');
    const encryptResult = await client.query(`
      SELECT encode(digest('test_string', 'sha256'), 'hex') as hash
    `);
    console.log(`  ✓ SHA256 hash generated: ${encryptResult.rows[0].hash.substring(0, 16)}...\n`);

    // Release the client
    client.release();

    console.log('🎉 All tests passed! PostgreSQL is ready.\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Connection test failed!\n');
    console.error('Error details:');
    console.error(`  Message: ${error.message}`);
    if (error.code) {
      console.error(`  Code: ${error.code}`);
    }
    console.error(`\nPlease check:`);
    console.error(`  1. Docker container is running: docker ps | grep agenda-dinamica-db`);
    console.error(`  2. Database credentials in .env match docker-compose.yml`);
    console.error(`  3. Port 5432 is not blocked by firewall\n`);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testConnection();
