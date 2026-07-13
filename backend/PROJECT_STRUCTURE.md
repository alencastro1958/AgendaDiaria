# Backend Project Structure

This document describes the complete directory structure for the AgendaDiaria backend application.

## Directory Layout

```
backend/
├── src/                    # Source code directory
│   ├── config/            # Configuration files (database, environment, etc.)
│   ├── controllers/       # Request handlers and business logic orchestration
│   ├── middleware/        # Express middleware (auth, validation, error handling)
│   ├── repositories/      # Data access layer (database queries)
│   ├── routes/            # API route definitions
│   ├── services/          # Business logic services
│   ├── types/             # TypeScript type definitions and interfaces
│   ├── utils/             # Utility functions and helpers
│   └── index.ts           # Application entry point
├── tests/                 # Test files (unit, integration, property-based)
├── dist/                  # Compiled JavaScript output (auto-generated)
├── node_modules/          # Dependencies (auto-generated)
├── .env.example           # Environment variable template
├── .gitignore             # Git ignore rules
├── .prettierignore        # Prettier ignore rules
├── .prettierrc            # Prettier configuration
├── eslint.config.js       # ESLint configuration
├── package.json           # NPM dependencies and scripts
├── package-lock.json      # Locked dependency versions
├── tsconfig.json          # TypeScript compiler configuration
└── README.md              # Project documentation

```

## Directory Purposes

### src/config/
Configuration files for:
- Database connection (PostgreSQL)
- Environment variables
- JWT settings
- Email service configuration
- Payment gateway settings
- File storage configuration

### src/controllers/
HTTP request handlers that:
- Validate request data
- Call service layer methods
- Format and return responses
- Handle errors appropriately

Example: `authController.ts`, `noteController.ts`, `subscriptionController.ts`

### src/middleware/
Express middleware functions for:
- Authentication (JWT verification)
- Authorization (permission checks)
- Request validation
- Error handling
- Logging
- Rate limiting

Example: `authMiddleware.ts`, `errorHandler.ts`, `validateRequest.ts`

### src/repositories/
Data access layer that:
- Executes database queries
- Maps database rows to domain objects
- Handles database transactions
- Abstracts database implementation details

Example: `userRepository.ts`, `noteRepository.ts`, `subscriptionRepository.ts`

### src/routes/
API route definitions:
- Define HTTP endpoints
- Map routes to controllers
- Apply middleware to routes
- Group related endpoints

Example: `authRoutes.ts`, `noteRoutes.ts`, `subscriptionRoutes.ts`

### src/services/
Business logic services that:
- Implement core application logic
- Orchestrate multiple repositories
- Handle complex workflows
- Integrate external services

Example: `authService.ts`, `noteService.ts`, `emailService.ts`, `paymentService.ts`

### src/types/
TypeScript type definitions:
- Interface definitions
- Type aliases
- DTOs (Data Transfer Objects)
- Domain models
- API request/response types

Example: `user.types.ts`, `note.types.ts`, `subscription.types.ts`

### src/utils/
Utility functions for:
- CPF validation
- Password hashing
- JWT token generation/verification
- Date calculations
- File handling
- Data formatting

Example: `cpfValidator.ts`, `passwordUtils.ts`, `jwtUtils.ts`

### tests/
Test files organized by:
- Unit tests (individual functions/classes)
- Integration tests (API endpoints, database)
- Property-based tests (correctness properties)

Example: `auth.test.ts`, `note.test.ts`, `cpfValidator.property.test.ts`

## Architecture Pattern

The project follows a **layered architecture**:

1. **Routes Layer**: Defines API endpoints
2. **Middleware Layer**: Authentication, validation, error handling
3. **Controllers Layer**: Request/response handling
4. **Services Layer**: Business logic
5. **Repositories Layer**: Data access
6. **Database Layer**: PostgreSQL

This separation ensures:
- Clear separation of concerns
- Testability of each layer
- Maintainability and scalability
- Reusability of components

## Status

✅ All required directories have been created
✅ `.gitkeep` files added to track empty directories in version control
✅ TypeScript configuration in place
✅ ESLint and Prettier configured
✅ Package.json with necessary dependencies

## Next Steps

Refer to `tasks.md` for the implementation sequence of authentication, database, and API endpoints.
