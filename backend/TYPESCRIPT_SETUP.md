# TypeScript Configuration

This document describes the TypeScript setup for the AgendaDiaria backend project.

## Overview

The backend project is configured with TypeScript for improved type safety, better IDE support, and enhanced developer experience.

## Configuration

### tsconfig.json

The TypeScript configuration includes:

- **Target**: ES2022 (modern JavaScript features)
- **Module System**: ES2022 modules (native ESM)
- **Module Resolution**: Bundler strategy (modern approach)
- **Strict Mode**: All strict type checking options enabled
- **Output**: Compiled JavaScript goes to `dist/` directory
- **Source Maps**: Enabled for debugging
- **Node Types**: Included for Node.js built-in modules

### Key Features Enabled

- Strict null checks
- No implicit any
- No unused locals/parameters
- Strict function types
- Source maps for debugging
- JSON module imports

## Scripts

### Build

Compile TypeScript to JavaScript:

```bash
npm run build
```

This command:
- Compiles all `.ts` files in `src/` to JavaScript in `dist/`
- Generates source maps (`.js.map` files)
- Performs type checking

### Development

Run the development server with hot reload:

```bash
npm run dev
```

Uses `ts-node` to run TypeScript directly without compilation.

### Production

Run the compiled JavaScript:

```bash
npm start
```

**Note**: Always run `npm run build` before starting in production.

### Watch Mode

Automatically recompile on file changes:

```bash
npm run watch
```

## File Structure

```
backend/
├── src/              # TypeScript source files (.ts)
│   └── index.ts      # Entry point
├── dist/             # Compiled JavaScript (generated, git-ignored)
│   └── index.js      # Compiled entry point
├── tsconfig.json     # TypeScript configuration
└── package.json      # Dependencies and scripts
```

## Dependencies

### Runtime Dependencies

None yet - will be added as features are implemented.

### Development Dependencies

- `typescript`: TypeScript compiler
- `@types/node`: Type definitions for Node.js built-in modules
- `ts-node`: Run TypeScript directly (development only)

## Migration from JavaScript

The project was migrated from JavaScript to TypeScript:

1. ✅ Installed TypeScript and type definitions
2. ✅ Created `tsconfig.json` with strict configuration
3. ✅ Renamed `index.js` to `index.ts`
4. ✅ Updated package.json scripts
5. ✅ Updated .gitignore to exclude build artifacts

## Best Practices

### Type Definitions

When installing new packages, always install their type definitions if available:

```bash
npm install express
npm install --save-dev @types/express
```

### Type Safety

- Use explicit types for function parameters and return values
- Avoid `any` type - use `unknown` if type is truly unknown
- Enable all strict options in tsconfig.json
- Use interfaces for object shapes
- Use type guards for runtime type checking

### Module System

The project uses native ES modules (ESM):

- Use `import/export` syntax (not `require`)
- File extensions are `.ts` (source) and `.js` (compiled)
- Node.js 18+ required for native ESM support

## Troubleshooting

### Type Errors

If you see type errors related to Node.js built-ins:

1. Ensure `@types/node` is installed
2. Check that `"types": ["node"]` is in tsconfig.json

### Module Resolution

If you see module not found errors:

1. Check `moduleResolution` is set to `"bundler"`
2. Ensure `esModuleInterop` is enabled
3. Verify imports use correct file extensions (none for .ts, .js for compiled)

### Build Errors

If `npm run build` fails:

1. Check all `.ts` files for type errors
2. Verify tsconfig.json is valid JSON
3. Ensure all dependencies are installed

## Next Steps

As the project grows:

1. Add Express type definitions when Express is installed
2. Configure path aliases for cleaner imports
3. Set up linting with `@typescript-eslint`
4. Configure testing with TypeScript support
5. Consider adding stricter compiler options as needed

## References

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Node.js ES Modules](https://nodejs.org/api/esm.html)
