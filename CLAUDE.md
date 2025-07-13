# Claude AI Development Guide

## Quick Links

- [Running Tests Documentation](packages/web-docs/docs/development/common-tasks/running-tests.md#frontend-component-tests)

## Testing

When frontend snapshot tests fail in CI:
1. Run `npm run test:unit --workspace=packages/lib-components` to see failures
2. Run `npm run test:snapshot --workspace=packages/lib-components` to update snapshots
3. Review the changes and commit if they're expected