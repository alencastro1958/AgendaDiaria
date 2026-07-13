# Environment Variable Management Setup

## Overview

This document describes the environment variable management system implemented for the AgendaDinamica backend application.

## Implementation Summary

✅ **Task Completed**: Set up environment variable management (.env with dotenv)

### What Was Implemented

1. **dotenv Package**: Already installed and configured for loading environment variables from `.env` file
2. **Environment Files**: 
   - `.env` - Active environment configuration (gitignored)
   - `.env.example` - Template with all required variables
3. **Configuration Module**: Type-safe configuration loader with validation (`src/config/index.ts`)
4. **Unit Tests**: Comprehensive test suite with 14 tests, all passing (`src/config/index.test.ts`)
5. **Security**: `.gitignore` properly excludes `.env` files from version control

## Features

### Type-Safe Configuration Interface

The configuration module provides a strongly-typed `Config` interface covering:

- **Server Configuration**: PORT, NODE_ENV
- **Database Configuration**: DATABASE_URL
- **JWT Configuration**: JWT_SECRET, JWT_EXPIRATION
- **Email Configuration**: SMTP settings (host, port, user, pass, from)
- **File Storage Configuration**: Upload limits and quotas
- **Payment Gateway Configuration**: Stripe, PagSeguro, Mercado Pago
- **Security Configuration**: Bcrypt rounds, rate limiting
- **CORS Configuration**: Allowed origins
- **Trial Configuration**: Trial period duration

### Comprehensive Validation

The module validates:

1. **Required Variables**: Ensures all mandatory variables are present
2. **NODE_ENV**: Must be `development`, `production`, or `test`
3. **PORT**: Must be a valid number (1-65535)
4. **SMTP_PORT**: Must be a valid number (1-65535)
5. **JWT_SECRET**: Must be at least 32 characters in production
6. **Payment Gateway**: At least one must be configured in production

### Default Values

Sensible defaults are provided for optional settings:

- Upload directory: `./uploads`
- Max file size: 10MB
- Max audio size: 5MB
- Max video size: 50MB
- Storage quota: 100MB per user
- Bcrypt rounds: 10
- Rate limit window: 15 minutes
- Rate limit max requests: 100
- Trial period: 3 days

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

### Error Handling

```typescript
try {
  const config = getConfig();
  // Use config...
} catch (error) {
  console.error('Configuration error:', error.message);
  process.exit(1);
}
```

## Testing

All 14 unit tests pass successfully:

```bash
npm test
```

Tests cover:
- Valid configuration loading
- Missing required variables
- Invalid environment values
- Port validation
- JWT secret length validation
- Payment gateway validation
- Default value handling
- Boolean parsing

## Security Considerations

1. ✅ `.env` files are excluded from version control
2. ✅ `.env.example` provides a template without sensitive data
3. ✅ Production requires strong JWT secrets (32+ characters)
4. ✅ Production requires at least one payment gateway configured
5. ✅ Configuration validation happens on application startup

## Next Steps

The environment variable management is fully implemented and tested. You can now:

1. Configure your `.env` file with actual values (use `.env.example` as a template)
2. Use `getConfig()` in any module that needs configuration
3. Add additional configuration variables as needed by extending the `Config` interface

## Files Modified/Created

- ✅ `.env` - Environment configuration (already existed)
- ✅ `.env.example` - Environment template (already existed)
- ✅ `.gitignore` - Excludes .env files (already configured)
- ✅ `src/config/index.ts` - Configuration module (already implemented)
- ✅ `src/config/index.test.ts` - Unit tests (fixed to properly isolate environment)
- ✅ `src/config/README.md` - Documentation (already existed)
- ✅ `package.json` - Updated test script to build before testing

## Validation

Run the following to verify the setup:

```bash
# Build the project
npm run build

# Run tests
npm test

# Verify configuration loads correctly
node -e "import('./dist/config/index.js').then(({getConfig}) => console.log('Config loaded:', getConfig().port))"
```

All tests should pass (14/14), confirming the environment variable management system is working correctly.
