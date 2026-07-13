import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

/**
 * Database connection pool configuration
 * Implements connection pooling as per design requirements:
 * - Minimum connections: 5
 * - Maximum connections: 20
 * - Proper error handling and connection testing
 */
interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  min: number;
  max: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
}

/**
 * Pool statistics for monitoring
 */
export interface PoolStats {
  totalCount: number;
  idleCount: number;
  waitingCount: number;
}

// Database configuration from environment variables
const dbConfig: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'agenda_dinamica',
  user: process.env.DB_USER || 'agenda_user',
  password: process.env.DB_PASSWORD || 'agenda_password_dev',
  min: parseInt(process.env.DB_POOL_MIN || '5', 10),
  max: parseInt(process.env.DB_POOL_MAX || '20', 10),
  idleTimeoutMillis: 30000, // 30 seconds
  connectionTimeoutMillis: 10000, // 10 seconds
};

// Validate pool configuration
if (dbConfig.min < 0 || dbConfig.min > dbConfig.max) {
  throw new Error(
    `Invalid pool configuration: min (${dbConfig.min}) must be between 0 and max (${dbConfig.max})`
  );
}

// Create connection pool
const pool = new Pool(dbConfig);

// Track pool state
let isPoolClosing = false;

// Handle pool errors - unexpected errors on idle clients
pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle database client', {
    error: err.message,
    stack: err.stack,
  });
  // Don't exit process immediately, log for monitoring
});

// Handle pool connection event for monitoring
pool.on('connect', () => {
  console.log('New database client connected to pool');
});

// Handle pool client removal
pool.on('remove', () => {
  console.log('Database client removed from pool');
});

/**
 * Execute a query on the database
 * @param text SQL query text
 * @param params Query parameters
 * @returns Query result
 * @throws Error if query fails or pool is closing
 */
export const query = async (text: string, params?: any[]) => {
  if (isPoolClosing) {
    throw new Error('Cannot execute query: database pool is closing');
  }

  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Log slow queries (> 1 second)
    if (duration > 1000) {
      console.warn('Slow query detected', {
        text: text.substring(0, 100),
        duration,
        rows: result.rowCount,
      });
    } else {
      console.log('Executed query', {
        text: text.substring(0, 100),
        duration,
        rows: result.rowCount,
      });
    }
    
    return result;
  } catch (error) {
    console.error('Database query error:', {
      text: text.substring(0, 100),
      error: error instanceof Error ? error.message : 'Unknown error',
      params: params ? 'present' : 'none',
    });
    throw error;
  }
};

/**
 * Get a client from the pool for transactions
 * Must call client.release() when done
 * @returns Database client
 * @throws Error if pool is closing or connection fails
 */
export const getClient = async () => {
  if (isPoolClosing) {
    throw new Error('Cannot get client: database pool is closing');
  }

  try {
    const client = await pool.connect();
    
    // Wrap release to add logging
    const originalRelease = client.release.bind(client);
    client.release = (err?: Error | boolean) => {
      if (err) {
        console.error('Client released with error', {
          error: err instanceof Error ? err.message : err,
        });
      }
      return originalRelease(err);
    };
    
    return client;
  } catch (error) {
    console.error('Failed to get database client from pool:', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
};

/**
 * Test database connection and verify it's working
 * @returns Connection status with details
 */
export const testConnection = async (): Promise<{
  success: boolean;
  message: string;
  serverTime?: Date;
  version?: string;
}> => {
  try {
    const result = await pool.query('SELECT NOW() as now, version() as version');
    const serverTime = result.rows[0].now;
    const version = result.rows[0].version.split(',')[0];
    
    console.log('✅ Database connection successful');
    console.log('📅 Server time:', serverTime);
    console.log('🗄️  PostgreSQL version:', version);
    
    return {
      success: true,
      message: 'Database connection successful',
      serverTime,
      version,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Database connection failed:', errorMessage);
    
    return {
      success: false,
      message: `Database connection failed: ${errorMessage}`,
    };
  }
};

/**
 * Check if database connection is healthy
 * Performs a simple query to verify connectivity
 * @returns Health status
 */
export const healthCheck = async (): Promise<{
  healthy: boolean;
  latency?: number;
  error?: string;
}> => {
  const start = Date.now();
  
  try {
    await pool.query('SELECT 1');
    const latency = Date.now() - start;
    
    return {
      healthy: true,
      latency,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      healthy: false,
      error: errorMessage,
    };
  }
};

/**
 * Get current pool statistics for monitoring
 * @returns Pool statistics
 */
export const getPoolStats = (): PoolStats => {
  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
  };
};

/**
 * Close all database connections gracefully
 * Waits for active queries to complete
 * @param timeout Maximum time to wait for connections to close (ms)
 */
export const closePool = async (timeout: number = 5000): Promise<void> => {
  if (isPoolClosing) {
    console.warn('Pool is already closing');
    return;
  }

  isPoolClosing = true;
  console.log('Closing database pool...');

  try {
    // Set a timeout for pool closure
    const closePromise = pool.end();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Pool close timeout')), timeout)
    );

    await Promise.race([closePromise, timeoutPromise]);
    console.log('✅ Database pool closed successfully');
  } catch (error) {
    console.error('Error closing database pool:', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
};

/**
 * Initialize database connection and verify it's working
 * @returns Initialization status
 */
export const initializeDatabase = async (): Promise<boolean> => {
  console.log('Initializing database connection...');
  console.log('Configuration:', {
    host: dbConfig.host,
    port: dbConfig.port,
    database: dbConfig.database,
    user: dbConfig.user,
    poolMin: dbConfig.min,
    poolMax: dbConfig.max,
  });

  const result = await testConnection();
  
  if (result.success) {
    const stats = getPoolStats();
    console.log('Pool statistics:', stats);
  }
  
  return result.success;
};

// Graceful shutdown handling
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing database pool');
  await closePool();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing database pool');
  await closePool();
  process.exit(0);
});

// Export pool for advanced usage
export { pool };

export default {
  query,
  getClient,
  testConnection,
  healthCheck,
  getPoolStats,
  closePool,
  initializeDatabase,
  pool,
};
