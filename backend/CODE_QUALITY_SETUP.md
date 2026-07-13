# Code Quality Setup

## Overview

This document describes the ESLint and Prettier configuration for the AgendaDiaria backend project, ensuring consistent code quality and formatting across the TypeScript codebase.

## Tools Configured

### ESLint v10.4.1
- **Purpose**: Linting and code quality enforcement for TypeScript
- **Configuration**: `eslint.config.js` (Flat Config format)
- **Parser**: `typescript-eslint` with type-aware linting

### Prettier v3.8.4
- **Purpose**: Automatic code formatting
- **Configuration**: `.prettierrc`
- **Ignore patterns**: `.prettierignore`

## Configuration Details

### ESLint Rules

#### TypeScript-Specific Rules
- **`@typescript-eslint/no-unused-vars`**: Error for unused variables (ignores those prefixed with `_`)
- **`@typescript-eslint/explicit-function-return-type`**: Off (inferred types are allowed)
- **`@typescript-eslint/no-explicit-any`**: Warning (discourages `any` type)
- **`@typescript-eslint/no-floating-promises`**: Error (all promises must be awaited or handled)
- **`@typescript-eslint/await-thenable`**: Error (prevents awaiting non-promises)

#### General Code Quality Rules
- **`no-console`**: Warning (only `console.warn` and `console.error` allowed)
- **`prefer-const`**: Error (enforces immutability when possible)
- **`no-var`**: Error (forbids `var`, use `let` or `const`)
- **`eqeqeq`**: Error (requires `===` and `!==` instead of `==` and `!=`)
- **`curly`**: Error (requires curly braces for all control statements)

#### Prettier Integration
- **`prettier/prettier`**: Error (enforces Prettier formatting rules)
- **`endOfLine`**: Auto (handles different OS line endings)

### Prettier Formatting Rules

```json
{
  "semi": true,                  // Use semicolons
  "trailingComma": "es5",        // Trailing commas in ES5 contexts
  "singleQuote": true,           // Use single quotes
  "printWidth": 100,             // Max line width of 100 characters
  "tabWidth": 2,                 // 2 spaces per indentation level
  "useTabs": false,              // Use spaces, not tabs
  "arrowParens": "always",       // Always use parens for arrow functions
  "endOfLine": "auto",           // Auto-detect line endings
  "bracketSpacing": true,        // Spaces inside object literals
  "bracketSameLine": false       // Put `>` on new line in JSX
}
```

## Ignored Files

Both ESLint and Prettier ignore the following:
- `node_modules/`
- `dist/` (build output)
- `coverage/` (test coverage reports)
- `.env` files
- `*.config.js` and `*.config.mjs` files
- Lock files (`package-lock.json`, etc.)
- Logs
- Editor directories (`.vscode/`, `.idea/`)

## Available Scripts

### Linting
```bash
# Check for linting errors
npm run lint

# Automatically fix linting errors
npm run lint:fix
```

### Formatting
```bash
# Check formatting (doesn't modify files)
npm run format:check

# Format all files automatically
npm run format
```

## Usage Guidelines

### Before Committing Code
1. Run `npm run lint` to check for code quality issues
2. Run `npm run format:check` to verify formatting
3. Fix any issues reported
4. Alternatively, run `npm run lint:fix && npm run format` to auto-fix most issues

### IDE Integration

#### VS Code
Install these extensions for automatic linting and formatting:
- **ESLint** (`dbaeumer.vscode-eslint`)
- **Prettier** (`esbenp.prettier-vscode`)

Add to `.vscode/settings.json`:
```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

#### IntelliJ/WebStorm
1. Enable ESLint: Settings → Languages & Frameworks → JavaScript → Code Quality Tools → ESLint
2. Enable Prettier: Settings → Languages & Frameworks → JavaScript → Prettier
3. Enable "Run on save" for both tools

## Troubleshooting

### Common Issues

#### 1. "Unexpected console statement" Warning
**Problem**: Using `console.log()` instead of allowed methods.

**Solution**: Use `console.warn()` or `console.error()` instead, or remove console statements in production code.

#### 2. Type-Checking Errors
**Problem**: ESLint reports TypeScript type errors.

**Solution**: Fix the TypeScript type issues. ESLint uses the same type checker as `tsc`.

#### 3. Prettier Conflicts with ESLint
**Problem**: Formatting conflicts between the tools.

**Solution**: The configuration uses `eslint-plugin-prettier` and `eslint-config-prettier` to ensure compatibility. If conflicts arise, Prettier rules take precedence.

#### 4. Slow Linting
**Problem**: ESLint is slow on large projects.

**Solution**: The configuration uses `projectService: true` for efficient type-aware linting. Ensure your `tsconfig.json` is properly configured.

## Maintenance

### Updating Dependencies
```bash
# Check for outdated packages
npm outdated

# Update ESLint and related packages
npm update eslint @eslint/js typescript-eslint eslint-plugin-prettier eslint-config-prettier

# Update Prettier
npm update prettier

# Test after updating
npm run lint && npm run format:check
```

### Adding New Rules
1. Edit `eslint.config.js` to add or modify rules
2. Test with `npm run lint`
3. Document significant rule changes in this file
4. Communicate changes to the team

## Best Practices

1. **Run linting before commits**: Catch issues early
2. **Use IDE integration**: Get real-time feedback while coding
3. **Fix warnings**: Don't ignore warnings; they often catch subtle bugs
4. **Consistent formatting**: Let Prettier handle all formatting decisions
5. **Type safety**: Leverage TypeScript's type system; avoid `any`
6. **Async/await**: Always handle promises properly to avoid floating promises

## References

- [ESLint Documentation](https://eslint.org/docs/latest/)
- [typescript-eslint Documentation](https://typescript-eslint.io/)
- [Prettier Documentation](https://prettier.io/docs/en/)
- [ESLint Flat Config Guide](https://eslint.org/docs/latest/use/configure/configuration-files)
