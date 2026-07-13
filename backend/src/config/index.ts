import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Load .env file from project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '../../.env');

dotenv.config({ path: envPath });

/**
 * Configuration interface for type safety
 */
export interface Config {
  // Server Configuration
  port: number;
  nodeEnv: string;

  // Database Configuration
  databaseUrl: string;

  // JWT Configuration
  jwtSecret: string;
  jwtExpiration: string;

  // Email Configuration
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
    from: string;
  };

  // File Storage Configuration
  storage: {
    uploadDir: string;
    maxFileSize: number;
    maxAudioSize: number;
    maxVideoSize: number;
    storageQuota: number;
  };

  // Payment Gateway Configuration
  payment: {
    stripeSecretKey?: string;
    stripePublishableKey?: string;
    pagseguroEmail?: string;
    pagseguroToken?: string;
    mercadopagoAccessToken?: string;
  };

  // Security Configuration
  security: {
    bcryptRounds: number;
    rateLimitWindow: number;
    rateLimitMaxRequests: number;
  };

  // CORS Configuration
  corsOrigin: string;

  // Trial Configuration
  trialPeriodDays: number;
}

/**
 * Validates that required environment variables are present
 * @throws Error if required variables are missing
 */
function validateEnv(): void {
  const required = [
    'PORT',
    'NODE_ENV',
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_EXPIRATION',
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASS',
    'EMAIL_FROM',
    'CORS_ORIGIN',
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
        'Please check your .env file and ensure all required variables are set.'
    );
  }

  // Validate NODE_ENV values
  const validEnvs = ['development', 'production', 'test'];
  if (!validEnvs.includes(process.env.NODE_ENV!)) {
    throw new Error(
      `Invalid NODE_ENV value: ${process.env.NODE_ENV}. Must be one of: ${validEnvs.join(', ')}`
    );
  }

  // Validate JWT_SECRET length in production
  if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET!.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long in production');
  }

  // Validate PORT is a number
  const port = parseInt(process.env.PORT!, 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error(
      `Invalid PORT value: ${process.env.PORT}. Must be a number between 1 and 65535`
    );
  }

  // Validate SMTP_PORT is a number
  const smtpPort = parseInt(process.env.SMTP_PORT!, 10);
  if (isNaN(smtpPort) || smtpPort < 1 || smtpPort > 65535) {
    throw new Error(
      `Invalid SMTP_PORT value: ${process.env.SMTP_PORT}. Must be a number between 1 and 65535`
    );
  }

  // Validate that at least one payment gateway is configured in production
  if (process.env.NODE_ENV === 'production') {
    const hasStripe = process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PUBLISHABLE_KEY;
    const hasPagSeguro = process.env.PAGSEGURO_EMAIL && process.env.PAGSEGURO_TOKEN;
    const hasMercadoPago = process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!hasStripe && !hasPagSeguro && !hasMercadoPago) {
      throw new Error(
        'At least one payment gateway must be configured in production ' +
          '(Stripe, PagSeguro, or Mercado Pago)'
      );
    }
  }
}

/**
 * Parses a string to boolean
 */
function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (!value) {
    return defaultValue;
  }
  return value.toLowerCase() === 'true' || value === '1';
}

/**
 * Parses a string to number with default value
 */
function parseNumber(value: string | undefined, defaultValue: number): number {
  if (!value) {
    return defaultValue;
  }
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Loads and validates configuration from environment variables
 * @throws Error if validation fails
 */
export function loadConfig(): Config {
  // Validate environment first
  validateEnv();

  return {
    port: parseInt(process.env.PORT!, 10),
    nodeEnv: process.env.NODE_ENV!,

    databaseUrl: process.env.DATABASE_URL!,

    jwtSecret: process.env.JWT_SECRET!,
    jwtExpiration: process.env.JWT_EXPIRATION!,

    smtp: {
      host: process.env.SMTP_HOST!,
      port: parseInt(process.env.SMTP_PORT!, 10),
      secure: parseBoolean(process.env.SMTP_SECURE, false),
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
      from: process.env.EMAIL_FROM!,
    },

    storage: {
      uploadDir: process.env.UPLOAD_DIR || './uploads',
      maxFileSize: parseNumber(process.env.MAX_FILE_SIZE, 10 * 1024 * 1024), // 10MB default
      maxAudioSize: parseNumber(process.env.MAX_AUDIO_SIZE, 5 * 1024 * 1024), // 5MB default
      maxVideoSize: parseNumber(process.env.MAX_VIDEO_SIZE, 50 * 1024 * 1024), // 50MB default
      storageQuota: parseNumber(process.env.STORAGE_QUOTA, 100 * 1024 * 1024), // 100MB default
    },

    payment: {
      stripeSecretKey: process.env.STRIPE_SECRET_KEY,
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      pagseguroEmail: process.env.PAGSEGURO_EMAIL,
      pagseguroToken: process.env.PAGSEGURO_TOKEN,
      mercadopagoAccessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
    },

    security: {
      bcryptRounds: parseNumber(process.env.BCRYPT_ROUNDS, 10),
      rateLimitWindow: parseNumber(process.env.RATE_LIMIT_WINDOW, 15), // minutes
      rateLimitMaxRequests: parseNumber(process.env.RATE_LIMIT_MAX_REQUESTS, 100),
    },

    corsOrigin: process.env.CORS_ORIGIN!,

    trialPeriodDays: parseNumber(process.env.TRIAL_PERIOD_DAYS, 3),
  };
}

// Export singleton config instance
let configInstance: Config | null = null;

/**
 * Gets the configuration singleton instance
 * @throws Error if configuration validation fails
 */
export function getConfig(): Config {
  if (!configInstance) {
    configInstance = loadConfig();
  }
  return configInstance;
}

/**
 * Resets the configuration (useful for testing)
 */
export function resetConfig(): void {
  configInstance = null;
}

export default getConfig;
