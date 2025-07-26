# Claude AI Development Guide

When working on the frontend, you should ALWAYS use existing components from lib-components. Do not make inline components unless explicitly asked to

## Quick Links

- [Running Tests Documentation](packages/web-docs/docs/development/common-tasks/running-tests.md#frontend-component-tests)

## Testing

When frontend snapshot tests fail in CI:

1. Run `npm run test:unit --workspace=packages/lib-components` to see failures
2. Run `npm run test:snapshot --workspace=packages/lib-components` to update snapshots
3. Review the changes and commit if they're expected

You have access to a playwright MCP server. You can access the frontend on http://127.0.0.1:13001.
You username and password are available in env vars:
username: ${process.env.TAKARO_DEV_USER_NAME}@${process.env.TAKARO_DEV_DOMAIN_NAME}
password: ${TAKARO_DEV_USER_PASSWORD}

## Test Execution Commands

### Debugging Test Failures

When integration tests fail, they log the domain ID. You can grep docker compose logs for this ID to see all related logs:

```bash
docker compose logs | grep <domain-id>
```

### Test Commands

- **Run a specific test file**: `npm run test:file <path/to/test.ts>`
- **Run test with TypeScript checking**: `npm run test:file:check <path/to/test.ts>`
- **Debug a test file**: `npm run test:debug <path/to/test.ts>`
- **Run all tests for a package**: `npm run test:package <package-name>`
- **Run unit tests for a package**: `npm run test:package:unit <package-name>`
- **Run integration tests for a package**: `npm run test:package:integration <package-name>`
- **Run all tests**: `npm test` or `npm run test:unit` or `npm run test:integration`
- **Check TypeScript in test files**: `npm run test:check`

### Examples

```bash
# Run a specific test file
npm run test:file packages/lib-config/src/__tests__/config.unit.test.ts

# Run with TypeScript checking first
npm run test:file:check packages/app-api/src/controllers/__tests__/TrackingController.integration.test.ts

# Debug a test (connects debugger)
npm run test:debug packages/lib-modules/src/__tests__/ping.integration.test.ts

# Test a specific package
npm run test:package lib-config
npm run test:package:integration app-api

# Run all tests of a type
npm run test:unit          # All unit tests
npm run test:integration   # All integration tests
npm test                   # All tests
```
