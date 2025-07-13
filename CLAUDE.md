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
