/**
 * AgendaDiaria Backend API
 * Entry point for the Express server
 */

import { getConfig } from './config/index.js';

// Load configuration
try {
  const config = getConfig();

  // Use console.warn for informational startup messages (allowed by ESLint config)
  console.warn('AgendaDiaria Backend - Project initialized with TypeScript');
  console.warn('Node.js version:', process.version);
  console.warn('Environment:', config.nodeEnv);
  console.warn('Port:', config.port);
  console.warn('Database:', config.databaseUrl.replace(/:[^:@]+@/, ':****@')); // Hide password
  console.warn('CORS Origin:', config.corsOrigin);
  console.warn('Configuration loaded successfully');
  console.warn('TypeScript ready for implementation...');
} catch (error) {
  console.error('Failed to load configuration:', error instanceof Error ? error.message : error);
  process.exit(1);
}
