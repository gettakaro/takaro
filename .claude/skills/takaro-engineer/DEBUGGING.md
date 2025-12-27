# Debugging

## CI Failure Debugging

### Step 1: Check PR Status

```bash
gh pr checks <PR_NUMBER> --repo gettakaro/takaro
```

Shows all checks with pass/fail status, duration, and URLs.

### Step 2: Get Failed Run ID

```bash
# Get branch name and status
gh pr view <PR_NUMBER> --repo gettakaro/takaro --json headRefName,statusCheckRollup

# Or list recent runs
gh run list --branch <branch-name> --repo gettakaro/takaro --limit 5
```

### Step 3: Get Failed Logs

```bash
gh run view <RUN_ID> --repo gettakaro/takaro --log-failed
```

### Step 4: Find Actual Failures

CI logs are very verbose. Use these grep patterns:

```bash
# Primary failure search
gh run view <RUN_ID> --repo gettakaro/takaro --log-failed 2>&1 | \
  grep -E "✖|FAIL|AssertionError|Error:|SyntaxError" | head -50

# Get context around failure
gh run view <RUN_ID> --repo gettakaro/takaro --log-failed 2>&1 | \
  grep -B 10 -A 10 "test name here"

# Test summary from end of logs
gh run view <RUN_ID> --repo gettakaro/takaro --log-failed 2>&1 | tail -100
```

### Useful Grep Patterns

| Pattern | Purpose |
|---------|---------|
| `✖` | Node.js test runner failure marker |
| `FAIL` | Generic test failure |
| `AssertionError` | Assertion failures |
| `Error:` | Exception error lines |
| `SyntaxError` | JavaScript syntax errors |
| `npm error` | npm command failures |
| `Expected:` / `Received:` | Snapshot diff details |
| `SNAPSHOT DIFFERENCE` | Snapshot test failures |
| `##[error]` | GitHub Actions error annotations |

### CI Failure Example (PR #2413)

Two failures were found:

1. **E2E Failure** - Playwright export error:
```
SyntaxError: The requested module '@playwright/test' does not provide an export named 'defineConfig'
```
Cause: Playwright upgrade broke import.

2. **Integration Test Failure** - Non-deterministic ordering:
```
In body.data.2.children.0:
  Expected: Melee Weapons
  Received: Ranged Weapons
```
Cause: Array ordering not guaranteed in query.

## Local Test Debugging

### Domain ID Tracing

Every integration test creates an isolated domain. On failure, the domain ID is logged:

```
Error in test: My test name
Domain ID: great-crews-cross
```

Find all logs for that domain:

```bash
docker compose logs | grep great-crews-cross
```

### Enable Debug Logging

```bash
docker compose exec -e LOGGING_LEVEL=debug takaro npm run test:file <path>
```

### Debug with Node Inspector

```bash
docker compose exec takaro npm run test:debug <path>
# Then attach debugger to the Node process
```

### Check Service Health

```bash
# Service status
docker compose ps

# Health endpoint
curl http://127.0.0.1:13000/readyz
curl http://127.0.0.1:13000/healthz
```

## Database Debugging

### Connect to PostgreSQL

```bash
docker compose exec postgresql psql -U takaro -d takaro
```

### Find Domain by Name

```sql
SELECT id, name, state, "createdAt" FROM domains WHERE name ILIKE '%test%';
```

### Count Resources per Domain

```sql
SELECT
  d.id,
  d.name,
  (SELECT COUNT(*) FROM players p WHERE p.domain = d.id) as players,
  (SELECT COUNT(*) FROM gameservers gs WHERE gs.domain = d.id) as gameservers
FROM domains d
WHERE d.state = 'ACTIVE';
```

### Find Player by Name

```sql
SELECT id, name, "steamId", domain FROM players WHERE name ILIKE '%playername%';
```

### Check Recent Events

```sql
SELECT "eventName", "createdAt", meta
FROM events
WHERE domain = 'your-domain-id'
ORDER BY "createdAt" DESC
LIMIT 50;
```

See [DATABASE.md](DATABASE.md) for more queries.

## Log Analysis

### View Service Logs

```bash
# Tail specific service
docker compose logs --tail=50 takaro

# Follow in real-time
docker compose logs -f takaro

# Multiple services
docker compose logs takaro postgresql redis

# Filter by time
docker compose logs --since 5m takaro
```

### Common Log Patterns

| Pattern | Meaning |
|---------|---------|
| `[domain-id]` | Log scoped to specific domain |
| `ValidationError` | Request validation failed |
| `PermissionDenied` | Auth/permission issue |
| `ECONNREFUSED` | Service not reachable |
| `relation "..." does not exist` | Migration not run |

## Snapshot Debugging

### View Snapshot Diff

Failed snapshot tests show detailed diff:
```
=== SNAPSHOT DIFFERENCE (Domain ID: xxx) ===

In body.data.2.children.0:
  - name:
    Expected: Melee Weapons
    Received: Ranged Weapons
```

### Update Snapshots

```bash
# Backend
OVERWRITE_SNAPSHOTS=true docker compose exec takaro npm test

# Frontend
npm run test:snapshot --workspace=packages/lib-components
```

### Snapshot Locations

- Backend: `packages/test/src/__snapshots__/`
- Frontend: Component directories `__snapshots__/`

## Common Issues

| Issue | Diagnosis | Solution |
|-------|-----------|----------|
| Tests timeout | Service not ready | Check `docker compose ps`, wait for healthy |
| Connection refused | Service down | `docker compose up -d` |
| "relation does not exist" | Missing migration | `npm -w packages/app-api run db:migrate` |
| Snapshot mismatch | Ordering issue | Check if query has ORDER BY |
| "dangling domains" message | Previous test failed | Normal cleanup, ignore |
| TypeScript errors | Type mismatch | `npm run test:check` |
| Permission denied | Missing role | Check test setup assigns proper role |
