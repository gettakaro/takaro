# Unified Vitest Testing Approach

The Takaro monorepo uses **Vitest as the test runner everywhere** with **chai assertions via `@takaro/test`** for consistent, expressive testing.

## Current Testing Architecture

- **Test Runner**: Vitest for all packages (unit and integration tests)
- **Assertions**: Chai assertions via `@takaro/test` framework
- **Mocking**: Sinon via `@takaro/test` sandbox
- **Plugins**: chai-as-promised, sinon-chai, deep-equal-in-any-order

## Why This Approach?

During our migration from Node.js test runner to Vitest, we discovered that:

1. **Vitest Performance**: Much faster test execution and better TypeScript support
2. **Preserve Infrastructure**: Our `@takaro/test` framework provides valuable test harness for integration tests
3. **Rich Assertions**: Chai plugins (chai-as-promised, sinon-chai, deep-equal-in-any-order) offer more expressive testing
4. **Consistency**: Single assertion style across the entire codebase
5. **Backward Compatibility**: No need to rewrite thousands of existing assertions

## Test Types and Patterns

### Integration Tests (Recommended: @takaro/test)

Use `@takaro/test` for integration tests requiring database connections, complex setup, or rich assertions:

```typescript
import { IntegrationTest, expect, SetupGameServerPlayers } from '@takaro/test';
import { describe } from 'vitest';

const tests = [
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group: 'TrackingController',
    setup: SetupGameServerPlayers.setup,
    name: 'Basic player movement history',
    test: async function () {
      const res = await this.client.tracking.trackingControllerGetPlayerMovementHistory({});
      expect(res.data.data).to.be.an('array');
      expect(res.data.data.length).to.be.greaterThan(0);
    },
  }),
];

describe('TrackingController', function () {
  tests.forEach((test) => test.run());
});
```

### Unit Tests with @takaro/test

Use `@takaro/test` for unit tests requiring mocking or rich assertions:

```typescript
import { expect, sandbox } from '@takaro/test';
import { describe, it } from 'vitest';
import { SevenDaysToDie } from '../index.js';

describe('7d2d Actions', () => {
  it('Can parse ban list with a single ban', async () => {
    sandbox.stub(SevenDaysToDie.prototype, 'executeConsoleCommand').resolves(mockResult);
    
    const result = await new SevenDaysToDie(connectionInfo).listBans();
    
    expect(result).to.be.an('array');
    expect(result).to.have.length(1);
    expect(result[0].player.gameId).to.equal('expected-id');
  });
});
```

### Simple Unit Tests

For simple unit tests, use `@takaro/test` for consistency:

```typescript
import { expect } from '@takaro/test';
import { describe, it } from 'vitest';
import { Config } from '../main.js';

describe('config', () => {
  it('Allows loading one config', () => {
    const config = new Config();
    expect(config.get('app.name')).to.equal('UNNAMED_PACKAGE');
  });
  
  it('Throws an error when validating', () => {
    const config = new Config([testConfigSchema]);
    config.load({ test: 1 });
    expect(() => config.validate()).to.throw('test: must be of type String');
  });
});
```

## Package Configuration

Every package should have a `vitest.config.mts` file:

```typescript
// packages/your-package/vitest.config.mts
import { createVitestConfig } from '../../vitest.config.base.mjs';

export default createVitestConfig();
```

## Running Tests

### Using the New Test Scripts

```bash
# Run a specific test file
npm run test:file packages/app-api/src/controllers/__tests__/TrackingController.integration.test.ts

# Run with TypeScript checking first
npm run test:file:check packages/app-api/src/controllers/__tests__/TrackingController.integration.test.ts

# Debug a test (connects debugger)
npm run test:debug packages/lib-modules/src/__tests__/ping.integration.test.ts

# Test a specific package
PKG=lib-config npm run test:package
PKG=app-api npm run test:package:integration

# Run all tests of a type
npm run test:unit          # All unit tests
npm run test:integration   # All integration tests
npm test                   # All tests
```

### Direct Vitest Commands

```bash
# Test specific package
cd packages/your-package && npx vitest run

# Watch mode
cd packages/your-package && npx vitest

# Debug mode
cd packages/your-package && npx vitest --inspect-brk
```

## Writing New Tests

### Standard Approach: @takaro/test

All tests should use `@takaro/test` for consistency and to leverage the rich chai assertion library:

- **Integration tests**: Database connections, complex setup, test harness
- **Unit tests**: Rich assertions, async testing, mocking capabilities
- **Simple tests**: Consistent syntax across the codebase

### Import Pattern

```typescript
import { expect, sandbox } from '@takaro/test';
import { describe, it } from 'vitest';

// Rich chai assertions
expect(value).to.equal(expected);
expect(array).to.have.length(3);
expect(array).to.be.an('array');
expect(promise).to.eventually.be.fulfilled;
expect(fn).to.have.been.calledOnce;
expect(() => dangerousFunction()).to.throw('Expected error');

// Sinon mocking with automatic cleanup
const stub = sandbox.stub(object, 'method');
// sandbox.restore() is called automatically after each test
```

## Best Practices

### Using @takaro/test
- **Consistency**: Use `@takaro/test` for all tests to maintain uniform syntax
- **Rich Assertions**: Leverage chai plugins for expressive, readable tests
- **Sinon Mocking**: Utilize the sandbox for comprehensive mocking with automatic cleanup
- **Integration Tests**: Take advantage of the IntegrationTest class for setup/teardown
- **Async Testing**: Use chai-as-promised for cleaner async assertions
- **Deep Equality**: Benefit from deep-equal-in-any-order for complex object comparisons

## Troubleshooting

### Import Errors
If you see `expect is not defined`:
- Make sure you're importing `expect` from `@takaro/test`
- Ensure you have `import { expect } from '@takaro/test';` in your test file

### Vitest Configuration
If tests aren't being discovered:
- Ensure `vitest.config.mts` exists in the package
- Check that test files follow naming patterns (`*.test.ts`, `**/__tests__/**/*.ts`)

### Sinon Sandbox Issues
If mocks aren't being cleaned up properly:
- Use `sandbox` from `@takaro/test` for automatic cleanup between tests
- The sandbox automatically restores all stubs/spies after each test

## Migration from Node.js Test Runner

If you have old tests using Node.js test runner, the migration is simple:

```typescript
// Before (Node.js test runner)
import { expect, sandbox } from '@takaro/test';
import { describe, it } from 'node:test';

// After (Vitest runner) - just change the import
import { expect, sandbox } from '@takaro/test';
import { describe, it } from 'vitest';
```

No assertion changes needed! The `@takaro/test` framework continues to work exactly the same with Vitest.

## Benefits of Current Approach

1. **Fast Execution**: Vitest's speed improvements across all tests
2. **Better TypeScript**: Superior TypeScript integration and error reporting  
3. **Preserved Infrastructure**: Keep valuable `@takaro/test` framework
4. **Consistent Syntax**: Single assertion style across the entire codebase
5. **Rich Assertions**: Expressive chai syntax with powerful plugins
6. **Easy Migration**: Minimal changes required from previous setup
7. **Automatic Cleanup**: Sinon sandbox handles mock cleanup automatically

This unified approach gives us modern test runner performance with consistent, expressive testing throughout the monorepo.