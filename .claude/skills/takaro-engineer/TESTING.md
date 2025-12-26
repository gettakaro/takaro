# Testing

## Test Commands

All test commands run inside Docker:

```bash
# Shell into container first (optional - commands work with docker compose exec)
docker compose exec takaro bash
```

| Command | Purpose | Timing |
|---------|---------|--------|
| `npm run test:file <path>` | Run single test file | ~3-5s |
| `npm run test:file:check <path>` | Run with TypeScript check | ~5-7s |
| `npm run test:debug <path>` | Run with debugger attached | - |
| `npm run test:unit` | All unit tests | ~30s |
| `npm run test:integration` | All integration tests | ~45min |
| `npm run test:package <name>` | All tests for package | varies |
| `npm run test:package:unit <name>` | Unit tests for package | varies |
| `npm run test:package:integration <name>` | Integration tests for package | varies |

### Examples

```bash
# Unit test (fast, no external deps)
docker compose exec takaro npm run test:file packages/lib-config/src/__tests__/config.unit.test.ts

# Integration test (needs Docker services)
docker compose exec takaro npm run test:file packages/lib-modules/src/__tests__/ping.integration.test.ts

# Debug a test
docker compose exec takaro npm run test:debug packages/lib-modules/src/__tests__/ping.integration.test.ts
```

## Test File Naming

- `*.unit.test.ts` - Unit tests (fast, no external dependencies)
- `*.integration.test.ts` - Integration tests (requires Docker, creates domains)

## IntegrationTest Class

The `@takaro/test` package provides the `IntegrationTest<SetupData>` class:

```typescript
import { IntegrationTest, expect } from '@takaro/test';

new IntegrationTest<ISetupData>({
  group: 'ControllerName',           // Test group name
  name: 'Test description',          // Individual test name
  snapshot: true,                    // Enable snapshot testing
  setup: setupFunction,              // Optional setup function
  test: async function () {          // Test function
    // Access via this:
    // - this.client        - Authenticated API client
    // - this.adminClient   - Admin-level client
    // - this.setupData     - Data from setup function
    // - this.standardDomainId - Test domain ID
    return this.client.someApi.someMethod();
  },
  expectedStatus: 200,               // Expected HTTP status
  filteredFields: ['id', 'timestamp'], // Fields to ignore in snapshots
});
```

### Key Properties

| Property | Description |
|----------|-------------|
| `this.client` | Domain-scoped API client |
| `this.adminClient` | Cluster-wide admin client |
| `this.setupData` | Data returned from setup function |
| `this.standardDomainId` | Current test domain UUID |
| `this.standardLogin` | Username/password for domain |

## Test Setup Helpers

Located in `packages/test/src/setups/`:

### SetupGameServerPlayers

Creates full test environment:
- 2 mock game servers
- 20 players (10 per server)
- Player-on-gameserver records
- Events awaiter connected

```typescript
import { SetupGameServerPlayers, IntegrationTest } from '@takaro/test';

new IntegrationTest<SetupGameServerPlayers.ISetupData>({
  setup: SetupGameServerPlayers.setup,
  test: async function () {
    // this.setupData.gameServer1
    // this.setupData.gameServer2
    // this.setupData.players (20 players)
    // this.setupData.pogs1 (10 POGs on server 1)
    // this.setupData.mockservers
  },
});
```

### modulesTestSetup

Full module testing setup:
- All built-in modules loaded
- 2 game servers with players
- ROOT role assigned to all players

```typescript
import { modulesTestSetup, IModuleTestsSetupData } from '@takaro/test';

new IntegrationTest<IModuleTestsSetupData>({
  setup: modulesTestSetup,
  test: async function () {
    // this.setupData.utilsModule
    // this.setupData.teleportsModule
    // this.setupData.gameserver
    // this.setupData.players
  },
});
```

## EventsAwaiter

For testing async events via WebSocket:

```typescript
import { EventsAwaiter } from '@takaro/test';

const eventsAwaiter = new EventsAwaiter();
await eventsAwaiter.connect(this.client);

// Start waiting BEFORE triggering action
const events = eventsAwaiter.waitForEvents('chat-message', 1);

// Trigger the action that produces events
await this.client.command.commandControllerTrigger(gameServerId, {
  msg: '/ping',
  playerId: playerId,
});

// Wait for events (10s timeout by default)
const result = await events;
expect(result.length).to.be.eq(1);
```

## Snapshot Testing

### API Snapshots

Snapshots stored in `packages/test/src/__snapshots__/`

**Default filtered fields** (ignored in comparison):
- `createdAt`, `updatedAt`, `id`, `serverTime`, `domainId`, `url`
- `snapshot`, `permissionId`, `moduleVersionId`, `versionId`

**Update snapshots:**
```bash
OVERWRITE_SNAPSHOTS=true docker compose exec takaro npm test
```

### Frontend Snapshots

```bash
# See failures
npm run test:unit --workspace=packages/lib-components

# Update snapshots
npm run test:snapshot --workspace=packages/lib-components
```

## Debugging Test Failures

### 1. Find Domain ID

Failed tests print their domain ID:
```
Error in test: Search categories
Domain ID: great-crews-cross
```

### 2. Grep Docker Logs

```bash
docker compose logs | grep great-crews-cross
```

### 3. Enable Debug Logging

```bash
docker compose exec -e LOGGING_LEVEL=debug takaro npm run test:file <path>
```

### 4. Check Database State

```bash
docker compose exec postgresql psql -U takaro -d takaro -c "SELECT * FROM domains WHERE id = 'domain-uuid'"
```

## Test Configuration

Environment variables (set in container):

| Variable | Default | Description |
|----------|---------|-------------|
| `TEST_HTTP_TARGET` | `http://localhost:3000` | API target |
| `ADMIN_CLIENT_SECRET` | - | Admin auth secret |
| `OVERWRITE_SNAPSHOTS` | `false` | Update snapshots |
| `WAIT_FOR_EVENTS_TIMEOUT` | `10000` | Event timeout (ms) |
| `TAKARO_TEST_RUNNER_ATTEMPTS` | `3` | Retry attempts |

## Common Issues

| Issue | Solution |
|-------|----------|
| Test hangs | Check Docker services: `docker compose ps` |
| "Removed X dangling domains" | Normal - cleanup from previous failed runs |
| Snapshot mismatch | Check if ordering is deterministic, update if expected |
| Connection refused | Ensure `docker compose up -d` completed |
| TypeScript errors | Run `npm run test:check` to validate |
