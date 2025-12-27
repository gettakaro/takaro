---
name: takaro-engineer
description: Takaro repository knowledge - monorepo structure, tests, Docker setup, debugging, database migrations. Use when working on this codebase, running tests, debugging issues, or understanding the project structure. (project)
---

# Takaro Engineer

Essential knowledge for the Takaro repository - a web-based multi-gameserver manager.

## Quick Reference

| Task | Command |
|------|---------|
| Run specific test | `docker compose exec takaro npm run test:file <path>` |
| Run unit tests | `docker compose exec takaro npm run test:unit` |
| Run integration tests | `docker compose exec takaro npm run test:integration` |
| Shell into container | `docker compose exec takaro bash` |
| View logs | `docker compose logs --tail=50 takaro` |
| Database CLI | `docker compose exec postgresql psql -U takaro -d takaro` |
| Run migrations | `docker compose exec takaro npm -w packages/app-api run db:migrate` |
| Create dev data | `docker compose exec takaro node scripts/dev-data.mjs` |
| Reset dev data | `docker compose exec takaro node scripts/dev-remove-domains.mjs` |

## Stack

- **Runtime**: Node.js 24.11.0, TypeScript 5.5.4
- **Backend**: Express, routing-controllers, Objection.js/Knex
- **Frontend**: React 18, TanStack Router, styled-components
- **Database**: PostgreSQL 15, Redis 7.2
- **Auth**: Ory Kratos
- **Testing**: Node.js test runner (backend), Vitest (frontend)

## Ports

| Port | Service |
|------|---------|
| 13000 | API |
| 13001 | web-main (frontend) |
| 13002 | Storybook |
| 13005 | Documentation |
| 13100 | PostgreSQL |
| 6379 | Redis |
| 4433 | Kratos (auth) |

## Monorepo Structure

```
packages/
├── app-api          # Main API server
├── app-connector    # Game server connector
├── app-mock-gameserver  # Mock gameserver for testing
├── lib-*            # Shared libraries
├── web-main         # Frontend (React)
├── web-docs         # Documentation (Docusaurus)
└── lib-components   # UI component library
```

## Detailed Guides

- [DEV-ENVIRONMENT.md](DEV-ENVIRONMENT.md) - Dev data setup, credentials, Playwright testing
- [TESTING.md](TESTING.md) - Test framework, commands, debugging failures
- [DEBUGGING.md](DEBUGGING.md) - CI failures, log analysis, domain ID tracing
- [DATABASE.md](DATABASE.md) - Multi-tenancy, migrations, useful queries
- [DOCKER.md](DOCKER.md) - Services, exec commands, compose files
- [API.md](API.md) - Controller patterns, adding endpoints, permissions
- [FRONTEND.md](FRONTEND.md) - lib-components, web-main, storybook
- [MODULES.md](MODULES.md) - Module system, commands, hooks, testing

## Helper Scripts

```bash
# Find test files
./scripts/find-test.sh <pattern>

# Database debugging queries
./scripts/psql-debug.sh <query-name>

# CI failure logs
./scripts/ci-logs.sh <PR_NUMBER> [search_pattern]
```

## Key Gotchas

1. **Internal packages as peerDependencies**: Add `@takaro/*` packages to `peerDependencies` with `*` version
2. **Tests log domain ID**: Failed tests print domain ID - grep logs with it
3. **TypeScript check before tests**: Every test run validates types first (~2s overhead)
4. **Dangling domains cleanup**: Test framework auto-removes `integration-*` prefixed domains
5. **Frontend components**: Always use lib-components, never inline components
