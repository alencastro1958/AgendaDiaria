import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { loadConfig, resetConfig } from './index.js';

describe('Config Module', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
    // Clear all environment variables to start fresh
    for (const key in process.env) {
      delete process.env[key];
    }
    // Reset config singleton
    resetConfig();
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
    resetConfig();
  });

  describe('loadConfig', () => {
    it('should load valid configuration', () => {
      // Set up valid environment
      process.env.PORT = '3000';
      process.env.NODE_ENV = 'development';
      process.env.DATABASE_URL = 'postgresql://localhost:5432/test';
      process.env.JWT_SECRET = 'test-secret-key-at-least-32-characters-long';
      process.env.JWT_EXPIRATION = '7d';
      process.env.SMTP_HOST = 'smtp.test.com';
      process.env.SMTP_PORT = '587';
      process.env.SMTP_SECURE = 'false';
      process.env.SMTP_USER = 'test@test.com';
      process.env.SMTP_PASS = 'password';
      process.env.EMAIL_FROM = 'noreply@test.com';
      process.env.CORS_ORIGIN = 'http://localhost:3000';

      const config = loadConfig();

      assert.strictEqual(config.port, 3000);
      assert.strictEqual(config.nodeEnv, 'development');
      assert.strictEqual(config.databaseUrl, 'postgresql://localhost:5432/test');
      assert.strictEqual(config.jwtSecret, 'test-secret-key-at-least-32-characters-long');
      assert.strictEqual(config.jwtExpiration, '7d');
      assert.strictEqual(config.smtp.host, 'smtp.test.com');
      assert.strictEqual(config.smtp.port, 587);
      assert.strictEqual(config.smtp.secure, false);
      assert.strictEqual(config.smtp.user, 'test@test.com');
      assert.strictEqual(config.smtp.pass, 'password');
      assert.strictEqual(config.smtp.from, 'noreply@test.com');
      assert.strictEqual(config.corsOrigin, 'http://localhost:3000');
    });

    it('should throw error if required environment variable is missing', () => {
      // Missing PORT
      process.env.NODE_ENV = 'development';

      assert.throws(
        () => loadConfig(),
        /Missing required environment variables.*PORT/,
        'Should throw error for missing PORT'
      );
    });

    it('should throw error for invalid NODE_ENV', () => {
      process.env.PORT = '3000';
      process.env.NODE_ENV = 'invalid';
      process.env.DATABASE_URL = 'postgresql://localhost:5432/test';
      process.env.JWT_SECRET = 'test-secret-key-at-least-32-characters-long';
      process.env.JWT_EXPIRATION = '7d';
      process.env.SMTP_HOST = 'smtp.test.com';
      process.env.SMTP_PORT = '587';
      process.env.SMTP_USER = 'test@test.com';
      process.env.SMTP_PASS = 'password';
      process.env.EMAIL_FROM = 'noreply@test.com';
      process.env.CORS_ORIGIN = 'http://localhost:3000';

      assert.throws(
        () => loadConfig(),
        /Invalid NODE_ENV value.*Must be one of: development, production, test/,
        'Should throw error for invalid NODE_ENV'
      );
    });

    it('should throw error for invalid PORT', () => {
      process.env.PORT = 'invalid';
      process.env.NODE_ENV = 'development';
      process.env.DATABASE_URL = 'postgresql://localhost:5432/test';
      process.env.JWT_SECRET = 'test-secret-key-at-least-32-characters-long';
      process.env.JWT_EXPIRATION = '7d';
      process.env.SMTP_HOST = 'smtp.test.com';
      process.env.SMTP_PORT = '587';
      process.env.SMTP_USER = 'test@test.com';
      process.env.SMTP_PASS = 'password';
      process.env.EMAIL_FROM = 'noreply@test.com';
      process.env.CORS_ORIGIN = 'http://localhost:3000';

      assert.throws(
        () => loadConfig(),
        /Invalid PORT value.*Must be a number between 1 and 65535/,
        'Should throw error for invalid PORT'
      );
    });

    it('should throw error for PORT out of range', () => {
      process.env.PORT = '70000';
      process.env.NODE_ENV = 'development';
      process.env.DATABASE_URL = 'postgresql://localhost:5432/test';
      process.env.JWT_SECRET = 'test-secret-key-at-least-32-characters-long';
      process.env.JWT_EXPIRATION = '7d';
      process.env.SMTP_HOST = 'smtp.test.com';
      process.env.SMTP_PORT = '587';
      process.env.SMTP_USER = 'test@test.com';
      process.env.SMTP_PASS = 'password';
      process.env.EMAIL_FROM = 'noreply@test.com';
      process.env.CORS_ORIGIN = 'http://localhost:3000';

      assert.throws(
        () => loadConfig(),
        /Invalid PORT value.*Must be a number between 1 and 65535/,
        'Should throw error for PORT out of range'
      );
    });

    it('should throw error for invalid SMTP_PORT', () => {
      process.env.PORT = '3000';
      process.env.NODE_ENV = 'development';
      process.env.DATABASE_URL = 'postgresql://localhost:5432/test';
      process.env.JWT_SECRET = 'test-secret-key-at-least-32-characters-long';
      process.env.JWT_EXPIRATION = '7d';
      process.env.SMTP_HOST = 'smtp.test.com';
      process.env.SMTP_PORT = 'invalid';
      process.env.SMTP_USER = 'test@test.com';
      process.env.SMTP_PASS = 'password';
      process.env.EMAIL_FROM = 'noreply@test.com';
      process.env.CORS_ORIGIN = 'http://localhost:3000';

      assert.throws(
        () => loadConfig(),
        /Invalid SMTP_PORT value.*Must be a number between 1 and 65535/,
        'Should throw error for invalid SMTP_PORT'
      );
    });

    it('should throw error for short JWT_SECRET in production', () => {
      process.env.PORT = '3000';
      process.env.NODE_ENV = 'production';
      process.env.DATABASE_URL = 'postgresql://localhost:5432/test';
      process.env.JWT_SECRET = 'short';
      process.env.JWT_EXPIRATION = '7d';
      process.env.SMTP_HOST = 'smtp.test.com';
      process.env.SMTP_PORT = '587';
      process.env.SMTP_USER = 'test@test.com';
      process.env.SMTP_PASS = 'password';
      process.env.EMAIL_FROM = 'noreply@test.com';
      process.env.CORS_ORIGIN = 'http://localhost:3000';
      process.env.STRIPE_SECRET_KEY = 'sk_test_key';
      process.env.STRIPE_PUBLISHABLE_KEY = 'pk_test_key';

      assert.throws(
        () => loadConfig(),
        /JWT_SECRET must be at least 32 characters long in production/,
        'Should throw error for short JWT_SECRET in production'
      );
    });

    it('should accept short JWT_SECRET in development', () => {
      process.env.PORT = '3000';
      process.env.NODE_ENV = 'development';
      process.env.DATABASE_URL = 'postgresql://localhost:5432/test';
      process.env.JWT_SECRET = 'short';
      process.env.JWT_EXPIRATION = '7d';
      process.env.SMTP_HOST = 'smtp.test.com';
      process.env.SMTP_PORT = '587';
      process.env.SMTP_USER = 'test@test.com';
      process.env.SMTP_PASS = 'password';
      process.env.EMAIL_FROM = 'noreply@test.com';
      process.env.CORS_ORIGIN = 'http://localhost:3000';

      const config = loadConfig();
      assert.strictEqual(config.jwtSecret, 'short');
    });

    it('should throw error if no payment gateway configured in production', () => {
      process.env.PORT = '3000';
      process.env.NODE_ENV = 'production';
      process.env.DATABASE_URL = 'postgresql://localhost:5432/test';
      process.env.JWT_SECRET = 'test-secret-key-at-least-32-characters-long';
      process.env.JWT_EXPIRATION = '7d';
      process.env.SMTP_HOST = 'smtp.test.com';
      process.env.SMTP_PORT = '587';
      process.env.SMTP_USER = 'test@test.com';
      process.env.SMTP_PASS = 'password';
      process.env.EMAIL_FROM = 'noreply@test.com';
      process.env.CORS_ORIGIN = 'http://localhost:3000';

      assert.throws(
        () => loadConfig(),
        /At least one payment gateway must be configured in production/,
        'Should throw error for missing payment gateway in production'
      );
    });

    it('should accept configuration with Stripe in production', () => {
      process.env.PORT = '3000';
      process.env.NODE_ENV = 'production';
      process.env.DATABASE_URL = 'postgresql://localhost:5432/test';
      process.env.JWT_SECRET = 'test-secret-key-at-least-32-characters-long';
      process.env.JWT_EXPIRATION = '7d';
      process.env.SMTP_HOST = 'smtp.test.com';
      process.env.SMTP_PORT = '587';
      process.env.SMTP_USER = 'test@test.com';
      process.env.SMTP_PASS = 'password';
      process.env.EMAIL_FROM = 'noreply@test.com';
      process.env.CORS_ORIGIN = 'http://localhost:3000';
      process.env.STRIPE_SECRET_KEY = 'sk_test_key';
      process.env.STRIPE_PUBLISHABLE_KEY = 'pk_test_key';

      const config = loadConfig();
      assert.strictEqual(config.payment.stripeSecretKey, 'sk_test_key');
      assert.strictEqual(config.payment.stripePublishableKey, 'pk_test_key');
    });

    it('should use default values for optional storage settings', () => {
      process.env.PORT = '3000';
      process.env.NODE_ENV = 'development';
      process.env.DATABASE_URL = 'postgresql://localhost:5432/test';
      process.env.JWT_SECRET = 'test-secret-key-at-least-32-characters-long';
      process.env.JWT_EXPIRATION = '7d';
      process.env.SMTP_HOST = 'smtp.test.com';
      process.env.SMTP_PORT = '587';
      process.env.SMTP_USER = 'test@test.com';
      process.env.SMTP_PASS = 'password';
      process.env.EMAIL_FROM = 'noreply@test.com';
      process.env.CORS_ORIGIN = 'http://localhost:3000';

      const config = loadConfig();

      assert.strictEqual(config.storage.uploadDir, './uploads');
      assert.strictEqual(config.storage.maxFileSize, 10 * 1024 * 1024); // 10MB
      assert.strictEqual(config.storage.maxAudioSize, 5 * 1024 * 1024); // 5MB
      assert.strictEqual(config.storage.maxVideoSize, 50 * 1024 * 1024); // 50MB
      assert.strictEqual(config.storage.storageQuota, 100 * 1024 * 1024); // 100MB
    });

    it('should override default storage values when provided', () => {
      process.env.PORT = '3000';
      process.env.NODE_ENV = 'development';
      process.env.DATABASE_URL = 'postgresql://localhost:5432/test';
      process.env.JWT_SECRET = 'test-secret-key-at-least-32-characters-long';
      process.env.JWT_EXPIRATION = '7d';
      process.env.SMTP_HOST = 'smtp.test.com';
      process.env.SMTP_PORT = '587';
      process.env.SMTP_USER = 'test@test.com';
      process.env.SMTP_PASS = 'password';
      process.env.EMAIL_FROM = 'noreply@test.com';
      process.env.CORS_ORIGIN = 'http://localhost:3000';
      process.env.UPLOAD_DIR = '/custom/upload';
      process.env.MAX_FILE_SIZE = '20971520'; // 20MB
      process.env.MAX_AUDIO_SIZE = '10485760'; // 10MB
      process.env.MAX_VIDEO_SIZE = '104857600'; // 100MB
      process.env.STORAGE_QUOTA = '209715200'; // 200MB

      const config = loadConfig();

      assert.strictEqual(config.storage.uploadDir, '/custom/upload');
      assert.strictEqual(config.storage.maxFileSize, 20971520);
      assert.strictEqual(config.storage.maxAudioSize, 10485760);
      assert.strictEqual(config.storage.maxVideoSize, 104857600);
      assert.strictEqual(config.storage.storageQuota, 209715200);
    });

    it('should parse SMTP_SECURE as boolean', () => {
      process.env.PORT = '3000';
      process.env.NODE_ENV = 'development';
      process.env.DATABASE_URL = 'postgresql://localhost:5432/test';
      process.env.JWT_SECRET = 'test-secret-key-at-least-32-characters-long';
      process.env.JWT_EXPIRATION = '7d';
      process.env.SMTP_HOST = 'smtp.test.com';
      process.env.SMTP_PORT = '587';
      process.env.SMTP_SECURE = 'true';
      process.env.SMTP_USER = 'test@test.com';
      process.env.SMTP_PASS = 'password';
      process.env.EMAIL_FROM = 'noreply@test.com';
      process.env.CORS_ORIGIN = 'http://localhost:3000';

      const config = loadConfig();
      assert.strictEqual(config.smtp.secure, true);
    });

    it('should use default security settings', () => {
      process.env.PORT = '3000';
      process.env.NODE_ENV = 'development';
      process.env.DATABASE_URL = 'postgresql://localhost:5432/test';
      process.env.JWT_SECRET = 'test-secret-key-at-least-32-characters-long';
      process.env.JWT_EXPIRATION = '7d';
      process.env.SMTP_HOST = 'smtp.test.com';
      process.env.SMTP_PORT = '587';
      process.env.SMTP_USER = 'test@test.com';
      process.env.SMTP_PASS = 'password';
      process.env.EMAIL_FROM = 'noreply@test.com';
      process.env.CORS_ORIGIN = 'http://localhost:3000';

      const config = loadConfig();

      assert.strictEqual(config.security.bcryptRounds, 10);
      assert.strictEqual(config.security.rateLimitWindow, 15);
      assert.strictEqual(config.security.rateLimitMaxRequests, 100);
      assert.strictEqual(config.trialPeriodDays, 3);
    });
  });
});
