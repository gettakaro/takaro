# Claude AI Development Guide

## MANDATORY: Use the Engineer Skill

**Before doing ANYTHING in this repository, invoke `/takaro-engineer`.**

The engineer skill at `.claude/skills/takaro-engineer/SKILL.md` contains essential knowledge about the monorepo structure, testing, Docker setup, and debugging. You MUST consult it for:
- Setting up a fresh environment
- Running tests
- Debugging issues
- Understanding the monorepo structure
- Any command or workflow you're unsure about

**NEVER guess at commands or workflows.** If unsure, the skill has the answer.

### Proactive Maintenance

During your work, if you discover something that should be in the engineer skill:
- A debugging technique that worked
- A command or workflow that's useful
- A gotcha or non-obvious behavior
- An error and its solution

**ASK THE HUMAN:** "Should I add this to the engineer skill?"

Also watch for **outdated information** in the skill and ask before updating.

---

## Fresh Environment Setup

When starting in a **new git worktree** or fresh checkout (no node_modules, nothing built):

```bash
./scripts/dev-init.sh
```

**DO NOT** attempt to:
- Manually run `npm install` on individual packages
- Build packages one by one
- Guess at build order or dependencies

The script handles everything: .env setup, data folders, clean npm install, and building all packages in the correct dependency order.

---

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

### Reading GitHub CI Logs

When investigating CI failures from GitHub Actions:

1. **Get PR checks status**: `gh pr checks <PR_NUMBER> --repo gettakaro/takaro`
2. **Find the failed workflow run ID**: `gh run list --branch <branch-name> --repo gettakaro/takaro --limit 5`
3. **Get failed logs directly**: `gh run view <RUN_ID> --repo gettakaro/takaro --log-failed`

The CI logs are verbose. To find actual test failures:

```bash
# Search for test failures (✖ marks failures)
gh run view <RUN_ID> --repo gettakaro/takaro --log-failed 2>&1 | grep -E "✖|FAIL|AssertionError"

# Get context around a specific failing test name
gh run view <RUN_ID> --repo gettakaro/takaro --log-failed 2>&1 | grep -B 10 -A 20 "test name here"

# Look at the end of logs for summary
gh run view <RUN_ID> --repo gettakaro/takaro --log-failed 2>&1 | tail -100
```

Key patterns in test output:
- `✖ <test name>` - Failed test
- `ValidationError` / `AssertionError` - Error types
- `Request ... failed with status 400` - API validation failure
- `Request data:` - Shows what was sent to the API

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

## Package Management

This monorepo uses npm workspaces with syncpack for version synchronization.

### Adding Dependencies

When adding a new dependency to a package:

1. **External npm packages**: Add to the package's `dependencies` with the version from root `package.json`
2. **Internal @takaro/* packages**: Add to `peerDependencies` with `*` as the version

Example:
```json
{
  "dependencies": {
    "axios": "1.7.7"
  },
  "peerDependencies": {
    "@takaro/util": "*",
    "@takaro/config": "*"
  }
}
```

### Version Synchronization

syncpack ensures all packages use the same version of shared dependencies.

- **Check versions**: `npm run syncpack:lint`
- **Fix mismatches**: `npm run syncpack:fix`

CI automatically runs `syncpack:fix` on every push via `.github/workflows/codestyle.yml`.

### Config

See `.syncpackrc.json` for syncpack configuration (uses `sameRange` policy).
