# Dev Environment Setup

## Quick Start

```bash
# 1. Start Docker services
docker compose up -d

# 2. Wait for services to be healthy (10-15 seconds)
docker compose ps  # Check takaro is "healthy"

# 3. Create dev data (domains, users)
docker compose exec takaro node scripts/dev-data.mjs

# 4. Access the app
# URL: http://127.0.0.1:13001
```

## Dev Credentials

Credentials are configured in `.env` (copy from `.env.example`):

```bash
# Environment variables
TAKARO_DEV_USER_NAME     # Username part (e.g., "takaro")
TAKARO_DEV_DOMAIN_NAME   # Domain part (e.g., "localdev.local")
TAKARO_DEV_USER_PASSWORD # Password

# Login format:
# Email: ${TAKARO_DEV_USER_NAME}@${TAKARO_DEV_DOMAIN_NAME}
# Password: ${TAKARO_DEV_USER_PASSWORD}
```

**Fetch credentials from environment:**
```bash
source .env
echo "Email: ${TAKARO_DEV_USER_NAME}@${TAKARO_DEV_DOMAIN_NAME}"
echo "Password: ${TAKARO_DEV_USER_PASSWORD}"
```

## What dev-data.mjs Creates

Running `docker compose exec takaro node scripts/dev-data.mjs` creates:

1. **Two domains:**
   - `localdev.local` (Domain 1) - max 10 gameservers
   - `localdev.local2` (Domain 2) - unlimited gameservers

2. **Users per domain:**
   - Root user (auto-created, credentials printed to console)
   - Dev user using env var credentials

3. **Output includes:**
   - Domain IDs
   - User credentials
   - Server registration token for connecting game servers

## Dev Scripts

| Script | Purpose | Command |
|--------|---------|---------|
| `dev-data.mjs` | Create domains and users | `docker compose exec takaro node scripts/dev-data.mjs` |
| `dev-init.sh` | Full environment init | `./scripts/dev-init.sh` |
| `dev-remove-domains.mjs` | Remove all domains | `docker compose exec takaro node scripts/dev-remove-domains.mjs` |
| `dev-reset-data.sh` | Complete database reset | `./scripts/dev-reset-data.sh` |

## Browser Testing with Playwright

The Playwright MCP server can be used to interact with the Takaro UI.

### Login Flow

```
1. Navigate to http://127.0.0.1:13001
2. Fill email: ${TAKARO_DEV_USER_NAME}@${TAKARO_DEV_DOMAIN_NAME}
3. Fill password: ${TAKARO_DEV_USER_PASSWORD}
4. Click "Log in"
5. Dashboard loads at /dashboard
```

### Available Pages After Login

| Page | URL | Purpose |
|------|-----|---------|
| Dashboard | `/dashboard` | Overview, stats, player map |
| Game servers | `/gameservers` | Manage connected servers |
| Events | `/events` | Audit log |
| Players | `/players` | Player management |
| Users | `/users` | User management |
| Roles | `/roles` | Permission roles |
| Analytics | `/analytics` | Statistics |
| Variables | `/variables` | Key-value storage |
| Settings | `/settings/gameservers` | Configuration |

### Use Cases for Browser Testing

1. **Manual feature verification** - Check UI after code changes
2. **Data setup** - Create game servers, players via UI
3. **E2E debugging** - Step through flows manually
4. **Screenshot documentation** - Capture UI states

## Reset Procedures

### Quick Reset (API-based)

```bash
docker compose exec takaro node scripts/dev-remove-domains.mjs
docker compose exec takaro node scripts/dev-data.mjs
```

### Full Reset (Database)

```bash
./scripts/dev-reset-data.sh
docker compose exec takaro node scripts/dev-data.mjs
```

### Nuclear Option (Complete Rebuild)

```bash
npm run clean
./scripts/dev-init.sh
docker compose up -d --build
docker compose exec takaro node scripts/dev-data.mjs
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Login fails | Run `dev-data.mjs` to create users |
| "No domains exist" | Run `dev-data.mjs` |
| Stale data | Run `dev-remove-domains.mjs` then `dev-data.mjs` |
| Services not starting | Check logs: `docker compose logs takaro` |
| Database issues | Run `dev-reset-data.sh` for full reset |
