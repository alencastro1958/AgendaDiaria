import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  query,
  getClient,
  testConnection,
  healthCheck,
  getPoolStats,
  initializeDatabase,
  pool,
} from './database.js';

/**
 * Database Module Tests
 * Tests connection pooling, error handling, and connection testing functionality
 */

describe('Database Module', () => {
  describe('Configuration', () => {
    it('should have correct pool configuration from environment', () => {
      const config = pool.options;
      assert.strictEqual(config.min, 5, 'Pool minimum should be 5');
      assert.strictEqual(config.max, 20, 'Pool maximum should be 20');
      assert.ok(config.host, 'Host should be configured');
      assert.ok(config.database, 'Database should be configured');
    });

    it('should have proper timeout settings', () => {
      const config = pool.options;
      assert.strictEqual(
        config.idleTimeoutMillis,
        30000,
        'Idle timeout should be 30 seconds'
      );
      assert.strictEqual(
        config.connectionTimeoutMillis,
        10000,
        'Connection timeout should be 10 seconds'
      );
    });
  });

  describe('Connection Testing', () => {
    it('should successfully test database connection', async () => {
      const result = await testConnection();
      assert.strictEqual(result.success, true, 'Connection should be successful');
      assert.ok(result.message, 'Should have a message');
      assert.ok(result.serverTime, 'Should return server time');
      assert.ok(result.version, 'Should return PostgreSQL version');
    });

    it('should perform health check successfully', async () => {
      const result = await healthCheck();
      assert.strictEqual(result.healthy, true, 'Health check should pass');
      assert.ok(typeof result.latency === 'number', 'Should return latency');
      assert.ok(result.latency >= 0, 'Latency should be non-negative');
    });

    it('should initialize database successfully', async () => {
      const result = await initializeDatabase();
      assert.strictEqual(result, true, 'Database should initialize successfully');
    });
  });

  describe('Query Execution', () => {
    it('should execute a simple query', async () => {
      const result = await query('SELECT 1 as value');
      assert.strictEqual(result.rows.length, 1, 'Should return one row');
      assert.strictEqual(result.rows[0].value, 1, 'Should return value 1');
    });

    it('should execute a query with parameters', async () => {
      const result = await query('SELECT $1::int as value', [42]);
      assert.strictEqual(result.rows.length, 1, 'Should return one row');
      assert.strictEqual(result.rows[0].value, 42, 'Should return parameterized value');
    });

    it('should execute a query with timestamp', async () => {
      const result = await query('SELECT NOW() as now');
      assert.strictEqual(result.rows.length, 1, 'Should return one row');
      assert.ok(result.rows[0].now instanceof Date, 'Should return a Date object');
    });

    it('should throw error for invalid SQL', async () => {
      await assert.rejects(
        async () => {
          await query('INVALID SQL STATEMENT');
        },
        {
          name: 'error',
        },
        'Should throw error for invalid SQL'
      );
    });

    it('should handle multiple concurrent queries', async () => {
      const promises = Array.from({ length: 10 }, (_, i) =>
        query('SELECT $1::int as value', [i])
      );

      const results = await Promise.all(promises);
      assert.strictEqual(results.length, 10, 'Should execute all queries');
      
      results.forEach((result, i) => {
        assert.strictEqual(result.rows[0].value, i, `Query ${i} should return correct value`);
      });
    });
  });

  describe('Client Management', () => {
    it('should get a client from the pool', async () => {
      const client = await getClient();
      assert.ok(client, 'Should return a client');
      assert.ok(typeof client.query === 'function', 'Client should have query method');
      client.release();
    });

    it('should execute transaction with client', async () => {
      const client = await getClient();
      
      try {
        await client.query('BEGIN');
        const result = await client.query('SELECT 1 as value');
        await client.query('COMMIT');
        
        assert.strictEqual(result.rows[0].value, 1, 'Should execute query in transaction');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    });

    it('should handle client release after error', async () => {
      const client = await getClient();
      
      try {
        await client.query('BEGIN');
        await client.query('INVALID SQL');
      } catch (error) {
        await client.query('ROLLBACK');
      } finally {
        client.release();
      }
      
      // Should still be able to get another client
      const newClient = await getClient();
      assert.ok(newClient, 'Should get new client after error');
      newClient.release();
    });
  });

  describe('Pool Statistics', () => {
    it('should return pool statistics', () => {
      const stats = getPoolStats();
      assert.ok(typeof stats.totalCount === 'number', 'Should have total count');
      assert.ok(typeof stats.idleCount === 'number', 'Should have idle count');
      assert.ok(typeof stats.waitingCount === 'number', 'Should have waiting count');
      assert.ok(stats.totalCount >= 0, 'Total count should be non-negative');
      assert.ok(stats.idleCount >= 0, 'Idle count should be non-negative');
      assert.ok(stats.waitingCount >= 0, 'Waiting count should be non-negative');
    });

    it('should show pool is being used', async () => {
      // Execute query to ensure at least one connection
      await query('SELECT 1');
      
      const stats = getPoolStats();
      assert.ok(stats.totalCount > 0, 'Should have at least one connection in pool');
    });
  });

  describe('Connection Pooling', () => {
    it('should reuse connections from pool', async () => {
      const initialStats = getPoolStats();
      
      // Execute multiple queries
      await query('SELECT 1');
      await query('SELECT 2');
      await query('SELECT 3');
      
      const finalStats = getPoolStats();
      
      // Should not create a new connection for each query
      assert.ok(
        finalStats.totalCount <= initialStats.totalCount + 1,
        'Should reuse connections'
      );
    });

    it('should handle connection pool limits', async () => {
      // Try to use more than min connections
      const clients = [];
      
      try {
        // Get more clients than minimum pool size
        for (let i = 0; i < 7; i++) {
          clients.push(await getClient());
        }
        
        const stats = getPoolStats();
        assert.ok(stats.totalCount >= 5, 'Should have at least minimum connections');
        assert.ok(stats.totalCount <= 20, 'Should not exceed maximum connections');
      } finally {
        // Release all clients
        clients.forEach(client => client.release());
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle connection errors gracefully', async () => {
      // Test with invalid query
      await assert.rejects(
        async () => {
          await query('SELECT * FROM nonexistent_table');
        },
        (error: any) => {
          assert.ok(error, 'Should throw an error');
          return true;
        },
        'Should reject with error for invalid table'
      );
    });

    it('should handle parameter type errors', async () => {
      await assert.rejects(
        async () => {
          await query('SELECT $1::int as value', ['not_a_number']);
        },
        (error: any) => {
          assert.ok(error, 'Should throw an error');
          return true;
        },
        'Should reject with error for invalid parameter type'
      );
    });
  });
});

describe('Database Module - Edge Cases', () => {
  it('should handle empty query result', async () => {
    const result = await query('SELECT 1 WHERE false');
    assert.strictEqual(result.rows.length, 0, 'Should return empty result set');
  });

  it('should handle NULL values', async () => {
    const result = await query('SELECT NULL as value');
    assert.strictEqual(result.rows.length, 1, 'Should return one row');
    assert.strictEqual(result.rows[0].value, null, 'Should handle NULL value');
  });

  it('should handle special characters in parameters', async () => {
    const specialString = "Test ' with \" quotes";
    const result = await query('SELECT $1::text as value', [specialString]);
    assert.strictEqual(result.rows[0].value, specialString, 'Should handle special characters');
  });

  it('should handle large result sets', async () => {
    const result = await query('SELECT generate_series(1, 1000) as value');
    assert.strictEqual(result.rows.length, 1000, 'Should handle large result sets');
  });
});
