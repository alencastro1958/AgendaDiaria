# Configuration Module

This module provides centralized configuration management with environment variable validation for the AgendaDiaria backend application.

## Features

- ✅ Loads environment variables from `.env` file using `dotenv`
- ✅ Type-safe configuration interface
- ✅ Comprehensive validation of required variables
- ✅ Default values for optional settings
- ✅ Production-specific security checks
- ✅ Singleton pattern for consistent config access
- ✅ Full test coverage

## Usage

### Basic Usage

```typescript
import { getConfig } from './config/index.js';

// Get configuration singleton
const config = getConfig();

// Access configuration values
console.log('Server port:', config.port);
console.log('Database URL:', config.databaseUrl);
console.log('JWT secret:', config.jwtSecret);
```

### Configuration Structure

```typescript
interface Config {
  // Server
  port: number;
  nodeEnv: string;

  // Database
  databaseUrl: string;

  // JWT
  jwtSecret: string;
  jwtExpiration: string;

  // Email
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
    from: string;
  };

  // Storage
  storage: {
    uploadDir: string;
    maxFileSize: number;
    maxAudioSize: number;
    maxVideoSize: number;
    storageQuota: number;
  };

  // Payment Gateway
  payment: {
    stripeSecretKey?: string;
    stripePublishableKey?: string;
    pagseguroEmail?: string;
    pagseguroToken?: string;
    mercadopagoAccessToken?: string;
  };

  // Security
  security: {
    bcryptRounds: number;
    rateLimitWindow: number;
    rateLimitMaxRequests: number;
  };

  // CORS
  corsOrigin: string;

  // Trial
  trialPeriodDays: number;
}
```

## Environment Variables

### Required Variables

These variables **must** be set in the `.env` file:

- `PORT` - Server port (1-65535)
- `NODE_ENV` - Environment (development | production | test)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens (min 32 chars in production)
- `JWT_EXPIRATION` - Token expiration time (e.g., "7d")
- `SMTP_HOST` - SMTP server host
- `SMTP_PORT` - SMTP server port (1-65535)
- `SMTP_USER` - SMTP username
- `SMTP_PASS` - SMTP password
- `EMAIL_FROM` - From email address
- `CORS_ORIGIN` - Allowed CORS origin

### Optional Variables (with defaults)

- `UPLOAD_DIR` - Upload directory (default: `./uploads`)
- `MAX_FILE_SIZE` - Max file size in bytes (default: 10MB)
- `MAX_AUDIO_SIZE` - Max audio size in bytes (default: 5MB)
- `MAX_VIDEO_SIZE` - Max video size in bytes (default: 50MB)
- `STORAGE_QUOTA` - User storage quota in bytes (default: 100MB)
- `BCRYPT_ROUNDS` - Bcrypt cost factor (default: 10)
- `RATE_LIMIT_WINDOW` - Rate limit window in minutes (default: 15)
- `RATE_LIMIT_MAX_REQUESTS` - Max requests per window (default: 100)
- `TRIAL_PERIOD_DAYS` - Trial period in days (default: 3)
- `SMTP_SECURE` - Use TLS/SSL (default: false)

### Payment Gateway Variables

At least one payment gateway must be configured in production:

**Stripe:**
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`

**PagSeguro:**
- `PAGSEGURO_EMAIL`
- `PAGSEGURO_TOKEN`

**Mercado Pago:**
- `MERCADOPAGO_ACCESS_TOKEN`

## Validation Rules

The configuration module performs the following validations:

1. **Required Variables**: All required variables must be present
2. **NODE_ENV**: Must be one of: `development`, `production`, `test`
3. **PORT**: Must be a valid number between 1 and 65535
4. **SMTP_PORT**: Must be a valid number between 1 and 65535
5. **JWT_SECRET**: Must be at least 32 characters in production
6. **Payment Gateway**: At least one gateway must be configured in production

If validation fails, the application will throw an error with a descriptive message and exit.

## Example .env File

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/agenda_dinamica

# JWT Configuration
JWT_SECRET=your-secret-key-at-least-32-characters-long
JWT_EXPIRATION=7d

# Email Configuration
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
EMAIL_FROM=noreply@agendadinamica.com

# CORS Configuration
CORS_ORIGIN=http://localhost:5500

# Payment Gateway (Stripe)
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_key
```

## Testing

The module includes comprehensive unit tests covering:

- Valid configuration loading
- Missing required variables
- Invalid environment values
- Port validation
- JWT secret length validation
- Payment gateway validation
- Default value handling
- Boolean parsing

Run tests:

```bash
npm run build
npm test -- dist/config/index.test.js
```

## Error Handling

The configuration module throws descriptive errors for validation failures:

```typescript
try {
  const config = getConfig();
  // Use config...
} catch (error) {
  console.error('Configuration error:', error.message);
  process.exit(1);
}
```

Common errors:

- `Missing required environment variables: PORT, JWT_SECRET`
- `Invalid NODE_ENV value: invalid. Must be one of: development, production, test`
- `Invalid PORT value: abc. Must be a number between 1 and 65535`
- `JWT_SECRET must be at least 32 characters long in production`
- `At least one payment gateway must be configured in production`

## Security Considerations

1. **Never commit `.env` files** - The `.gitignore` file excludes them
2. **Use strong JWT secrets** - At least 32 characters, randomly generated
3. **Rotate secrets regularly** - Especially in production
4. **Limit environment access** - Only authorized personnel should access production env vars
5. **Use separate configs** - Different `.env` files for dev, staging, and production
6. **Validate input thoroughly** - The module performs extensive validation

## Integration Example

```typescript
// src/index.ts
import express from 'express';
import { getConfig } from './config/index.js';

try {
  const config = getConfig();
  const app = express();

  // Use configuration
  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
    console.log(`Environment: ${config.nodeEnv}`);
  });
} catch (error) {
  console.error('Failed to start server:', error.message);
  process.exit(1);
}
```

## Advanced Usage

### Resetting Configuration (for testing)

```typescript
import { resetConfig, getConfig } from './config/index.js';

// Reset the singleton (useful in tests)
resetConfig();

// Load fresh configuration
const config = getConfig();
```

### Custom Validation

The module provides sensible defaults and validation, but you can add custom logic:

```typescript
import { getConfig } from './config/index.js';

const config = getConfig();

// Custom validation
if (config.nodeEnv === 'production' && !config.databaseUrl.includes('ssl=true')) {
  console.warn('Warning: Production database should use SSL');
}
```

## Troubleshooting

### Configuration not loading

1. Ensure `.env` file exists in the backend root directory
2. Check that all required variables are set
3. Verify no syntax errors in `.env` file (no quotes needed for values)

### Tests failing

1. Run `npm run build` before running tests
2. Ensure test file uses proper import paths (`.js` extension)
3. Check that environment variables are being reset in test setup

### Application crashes on startup

1. Check the error message for specific missing variables
2. Compare your `.env` with `.env.example`
3. Verify all required variables are present and correctly formatted
