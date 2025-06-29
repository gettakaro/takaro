---
sidebar_position: 3
hide_table_of_contents: true
---

# Running tests

Takaro uses simplified test scripts that make running tests easy and provide clear error messages. All test commands work both locally and in Docker containers.

## Quick Start

### Run all tests
```sh
# In Docker (recommended for integration tests)
docker compose exec takaro npm test

# Locally (for unit tests)
npm test
```

### Run a specific test file
```sh
# In Docker
docker compose exec takaro npm run test:file packages/lib-config/src/__tests__/config.unit.test.ts

# Locally  
npm run test:file packages/lib-config/src/__tests__/config.unit.test.ts
```

### Run tests for a specific package
```sh
# All tests in a package
docker compose exec takaro bash -c "PKG=lib-config npm run test:package"

# Only unit tests
docker compose exec takaro bash -c "PKG=app-api npm run test:package:unit"

# Only integration tests  
docker compose exec takaro bash -c "PKG=app-api npm run test:package:integration"
```

## Test Commands Reference

### Single File Testing
- **`npm run test:file <path>`** - Run a specific test file
- **`npm run test:file:check <path>`** - Run test with TypeScript checking first
- **`npm run test:debug <path>`** - Run test with debugger (connects on port 9229)

### Package Testing
- **`PKG=<name> npm run test:package`** - Run all tests in a package
- **`PKG=<name> npm run test:package:unit`** - Run unit tests only
- **`PKG=<name> npm run test:package:integration`** - Run integration tests only

### Full Test Suite
- **`npm test`** - Run all tests (unit + integration)
- **`npm run test:unit`** - Run all unit tests
- **`npm run test:integration`** - Run all integration tests
- **`npm run test:ci`** - Run tests with CI reporters

### TypeScript & Code Quality
- **`npm run test:check`** - Check TypeScript in test files
- **`npm run test:style`** - Run linting and formatting checks
- **`npm run test:style:fix`** - Fix linting and formatting issues

## Examples

### Testing Specific Controllers
```sh
# Test a specific controller
docker compose exec takaro npm run test:file packages/app-api/src/controllers/__tests__/SettingsController.integration.test.ts

# Test with TypeScript checking first (catches type errors)
docker compose exec takaro npm run test:file:check packages/app-api/src/controllers/__tests__/SettingsController.integration.test.ts
```

### Package-Specific Testing
```sh
# Test all of lib-config package
docker compose exec takaro bash -c "PKG=lib-config npm run test:package"

# Test only integration tests for app-api
docker compose exec takaro bash -c "PKG=app-api npm run test:package:integration"

# Test lib-modules with TypeScript checking
docker compose exec takaro bash -c "PKG=lib-modules npm run test:package:unit --check"
```

### Debugging Tests
```sh
# Debug a specific test (opens debugger on port 9229)
docker compose exec takaro npm run test:debug packages/lib-modules/src/__tests__/ping.integration.test.ts

# Then connect your debugger to localhost:9229
```

### TypeScript Error Checking
```sh
# Check for TypeScript errors before running tests
docker compose exec takaro npm run test:file:check packages/app-api/src/controllers/__tests__/TrackingController.integration.test.ts

# Check all test files for TypeScript errors
docker compose exec takaro npm run test:check
```

## Integration Tests

Takaro is a complex system, getting it to run in a test environment requires Docker and Docker Compose. This command assumes you have a working development environment.

```sh
# Run full integration test suite
DOCKER_TAG=latest npx zx scripts/integration-tests.mjs

# To also run end-to-end tests
DOCKER_TAG=latest IS_E2E=1 npx zx scripts/integration-tests.mjs

# To run using containers from a specific PR
DOCKER_TAG=pr-1246 npx zx scripts/integration-tests.mjs
```

See the [Github Actions config](https://github.com/gettakaro/takaro/tree/main/.github/workflows) for more details.

## Vitest Migration Status

Takaro has been migrated to use **Vitest** for all test execution, replacing the previous Node.js test runner.

### Migration Completed ✅
- **Test Runner**: All packages now use Vitest instead of Node.js test runner
- **Test Scripts**: Updated to use `npx vitest` commands  
- **Configuration**: All packages have `vitest.config.mts` files
- **Base Configuration**: Shared config at `vitest.config.base.mts`

### Fully Migrated Packages ✅
- `lib-config` - Complete vitest migration (imports and assertions)
- `lib-util` - Complete vitest migration (imports and assertions)

### Partially Migrated Packages 🔄
- All other packages have vitest configs and use `describe/it` from vitest
- However, they still use `expect` from `@takaro/test` causing mixed output
- This allows tests to run but with legacy assertion library

### Known Issues
- Tests may output TAP format due to mixed vitest/`@takaro/test` usage
- Some packages may have Sentry dependency conflicts when fully migrated
- Integration tests still work but may show mixed test runner output

### How It Works

All test scripts now use Vitest:

```sh
# All commands now use vitest under the hood
npm run test:unit       # Runs vitest in each package with unit tests
npm run test:integration # Runs vitest in each package with integration tests

# Show packages with vitest configs (all of them)
find packages -name "vitest.config.mts" -type f
```

## Debugging Tests

### View detailed logs
```sh
# Add debug logging to any test command
docker compose exec -e LOGGING_LEVEL=debug takaro npm test

# Debug a specific test file
docker compose exec -e LOGGING_LEVEL=debug takaro npm run test:file packages/app-api/src/controllers/__tests__/SettingsController.integration.test.ts
```

### Interactive debugging
```sh
# Start test in debug mode
docker compose exec takaro npm run test:debug packages/lib-modules/src/__tests__/ping.integration.test.ts

# In another terminal, connect your debugger to localhost:9229
# Or use VS Code's "Attach to Node Process" configuration
```

## Playwright E2E Tests
Playwright tests are run locally, so make sure to set all required environment variables in your shell.

```sh
# Run E2E tests
npm -w ./packages/e2e run test:e2e

# Playwright development utilities
npm -w ./packages/e2e run dev:ui    # UI mode with time-travel
npm -w ./packages/e2e run codegen   # Generate locators and interactions
```

## Snapshots

API tests can use snapshots for their assertions. Snapshots are stored in the `packages/test/src/__snapshots__` folder.

```sh
# Update snapshots when test expectations change
docker compose exec -e OVERWRITE_SNAPSHOTS=true takaro npm run test:package:integration packages/app-api
```

## Test Script Benefits

Our new test scripts provide several advantages over the old complex commands:

- **🎯 Simple Commands**: No more complex shell commands with multiple flags
- **🔍 Clear TypeScript Errors**: The `--check` options show exact file and line number errors
- **📦 Package-Focused**: Easy testing of individual packages or specific files
- **🐛 Built-in Debugging**: Debug support with simple `test:debug` command
- **🐳 Docker Compatible**: All commands work seamlessly in Docker containers
- **⚡ Fast Feedback**: Run only the tests you need for faster development cycles

## Common Patterns

```sh
# Quick verification during development
PKG=lib-config npm run test:package:unit

# Full controller testing with type checking  
npm run test:file:check packages/app-api/src/controllers/__tests__/TrackingController.integration.test.ts

# Debug failing test
npm run test:debug packages/lib-modules/src/__tests__/problematic-test.integration.test.ts

# Test all of a specific type
npm run test:unit                # All unit tests
npm run test:integration         # All integration tests

# Before committing changes
npm run test:style:fix           # Fix formatting
npm run test:check               # Check TypeScript
npm test                         # Run full test suite
```