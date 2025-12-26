# Database

## Connection

```bash
# Interactive psql
docker compose exec postgresql psql -U takaro -d takaro

# Run single query
docker compose exec postgresql psql -U takaro -d takaro -c "SELECT 1"
```

**Connection details:**
- Host: `postgresql` (Docker) / `127.0.0.1` (host)
- Port: 5432 (Docker) / 13100 (host)
- Database: `takaro`
- User: `takaro`

## Multi-Tenancy Pattern

Every table with tenant data has a `domain` column referencing `domains.id`:

```sql
-- Always filter by domain
SELECT * FROM players WHERE domain = 'your-domain-id';
```

Test domains use prefix `integration-` and are auto-cleaned.

## Core Tables

### Tenant Management

| Table | Purpose |
|-------|---------|
| `domains` | Tenant definitions with rate limits and settings |

### User & Player

| Table | Purpose |
|-------|---------|
| `users` | Dashboard/web users |
| `players` | Game players (Steam, Xbox, EOS) |
| `playerOnGameServer` | Player state per server (position, currency, playtime) |
| `roleOnPlayer` | Role assignments for players |
| `roleOnUser` | Role assignments for users |

### Game Server

| Table | Purpose |
|-------|---------|
| `gameservers` | Game server connections (encrypted) |
| `bans` | Player bans |

### Module System

| Table | Purpose |
|-------|---------|
| `modules` | Module definitions |
| `moduleVersions` | Version tracking |
| `moduleInstallations` | Module installed on gameservers |
| `commands` | Chat commands |
| `hooks` | Event hooks |
| `cronJobs` | Scheduled tasks |

### Shop/Economy

| Table | Purpose |
|-------|---------|
| `shopListing` | Items for sale |
| `shopOrder` | Purchase orders |

## Useful Queries

### Domain Investigation

```sql
-- List domains
SELECT id, name, state, "createdAt" FROM domains ORDER BY "createdAt" DESC LIMIT 20;

-- Count resources per domain
SELECT
  d.id, d.name,
  (SELECT COUNT(*) FROM players p WHERE p.domain = d.id) as players,
  (SELECT COUNT(*) FROM gameservers gs WHERE gs.domain = d.id) as gameservers
FROM domains d
WHERE d.state = 'ACTIVE';
```

### Player Debugging

```sql
-- Find player by name
SELECT id, name, "steamId", domain FROM players WHERE name ILIKE '%playername%';

-- Player's gameserver presence
SELECT
  p.name as player_name,
  gs.name as server_name,
  pog.online,
  pog.currency,
  pog."playtimeSeconds" / 3600 as hours_played
FROM "playerOnGameServer" pog
JOIN players p ON pog."playerId" = p.id
JOIN gameservers gs ON pog."gameserverId" = gs.id
WHERE p.domain = 'your-domain';
```

### Module Installation

```sql
-- List installed modules
SELECT
  mi.id,
  m.name as module_name,
  gs.name as gameserver_name,
  mi."userConfig"
FROM "moduleInstallations" mi
JOIN modules m ON mi."moduleId" = m.id
JOIN gameservers gs ON mi."gameserverId" = gs.id
WHERE mi.domain = 'your-domain';
```

### Events/Audit Trail

```sql
-- Recent events
SELECT "eventName", "createdAt", meta
FROM events
WHERE domain = 'your-domain'
ORDER BY "createdAt" DESC
LIMIT 50;

-- Events by type count
SELECT "eventName", COUNT(*) as count
FROM events
WHERE domain = 'your-domain'
GROUP BY "eventName"
ORDER BY count DESC;
```

### Permission Debugging

```sql
-- User's permissions
SELECT
  u.name as user_name,
  r.name as role_name,
  p.permission
FROM users u
JOIN "roleOnUser" rou ON u.id = rou."userId"
JOIN roles r ON rou."roleId" = r.id
JOIN "permissionOnRole" por ON r.id = por."roleId"
JOIN permission p ON por."permissionId" = p.id
WHERE u.id = 'user-uuid';
```

## Migrations

### Commands

```bash
# Apply pending migrations
docker compose exec takaro npm -w packages/app-api run db:migrate

# Rollback last batch
docker compose exec takaro npm -w packages/app-api run db:rollback

# Create new migration
docker compose exec takaro npm -w packages/lib-db run migrate:create <name>
```

### Migration Files

Location: `packages/lib-db/src/migrations/sql/`

### Check Migration Status

```sql
SELECT name, batch, migration_time
FROM knex_migrations
ORDER BY migration_time DESC
LIMIT 10;
```

## Encryption

Only `gameservers.connectionInfo` is encrypted (pgcrypto, symmetric).

**Decrypt (requires key):**
```sql
SELECT
  id, name,
  PGP_SYM_DECRYPT("connectionInfo", 'your-encryption-key') as connection_info
FROM gameservers
WHERE domain = 'your-domain';
```

## Table Relationships

```
domains (tenant)
  ├── users → roleOnUser → roles → permissionOnRole → permission
  ├── players → roleOnPlayer → roles
  │     └── playerOnGameServer → gameservers
  ├── gameservers
  │     └── moduleInstallations → modules → moduleVersions
  │           ├── commands
  │           ├── hooks
  │           └── cronJobs
  └── events (audit log)
```
