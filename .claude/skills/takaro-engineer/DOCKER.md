# Docker

## Services

| Service | Image | Purpose | Port |
|---------|-------|---------|------|
| takaro | local build | Main app (API, frontend, connector) | 13000, 13001, 13002 |
| postgresql | postgres:15 | Main database | 13100 |
| postgresql_kratos | postgres:15 | Kratos database | 13101 (localhost only) |
| redis | redis:7.2-alpine | Caching and queues | 6379 |
| redis-insight | redis/redisinsight:2.58 | Redis GUI | 5540 |
| kratos | oryd/kratos:v1.2.0 | Identity/auth | 4433, 4434 |
| mailhog | mailhog/mailhog | Email testing | 8025 |
| prometheus | prom/prometheus | Metrics | 9090 |
| homer | b4bz/homer | Dev dashboard | 13337 |

## Common Commands

### Container Access

```bash
# Shell into main container
docker compose exec takaro bash

# Or run npm command directly
npm run shell
```

### Log Viewing

```bash
# Tail specific service
docker compose logs --tail=50 takaro

# Follow in real-time
docker compose logs -f takaro

# Multiple services
docker compose logs takaro postgresql redis

# Since time
docker compose logs --since 5m takaro

# Filter by domain ID
docker compose logs | grep <domain-id>
```

### Service Management

```bash
# Start all
docker compose up -d

# Restart specific service
docker compose restart takaro

# Stop all
docker compose down

# Rebuild and start
docker compose up -d --build
```

### Health Checks

```bash
# Check service status
docker compose ps

# API health
curl http://127.0.0.1:13000/readyz
curl http://127.0.0.1:13000/healthz
```

### Database Access

```bash
# PostgreSQL CLI
docker compose exec postgresql psql -U takaro -d takaro

# Redis CLI
docker compose exec redis redis-cli
```

## Compose Files

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Main development stack |
| `docker-compose.test.yml` | CI testing with pre-built images |
| `docker-compose.observability.yml` | Grafana + Tempo for tracing |

### Using Observability Stack

```bash
docker compose -f docker-compose.yml -f docker-compose.observability.yml up -d
```

Adds:
- Grafana: http://127.0.0.1:13007
- Tempo: ports 3200, 4317

## Port Reference

| Port | Service | Description |
|------|---------|-------------|
| 13000 | takaro | API |
| 13001 | takaro | web-main frontend |
| 13002 | takaro | Storybook |
| 13005 | takaro | Documentation |
| 13006 | takaro | Mock gameserver |
| 13008 | takaro | Connector |
| 13100 | postgresql | Database |
| 6379 | redis | Cache |
| 4433 | kratos | Auth public |
| 4434 | kratos | Auth admin |
| 8025 | mailhog | Email UI |
| 5540 | redis-insight | Redis UI |

## Health Check Details

The takaro service uses:
- **Endpoint**: `http://localhost:3000/readyz`
- **Interval**: 5s
- **Timeout**: 3s
- **Retries**: 10
- **Start period**: 30s

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Container not starting | Check logs: `docker compose logs takaro` |
| Port already in use | Find process: `lsof -i :13000` |
| Database connection failed | Check postgres is running: `docker compose ps postgresql` |
| Migrations not running | Run manually: `docker compose exec takaro npm -w packages/app-api run db:migrate` |
| Need clean start | `docker compose down -v && docker compose up -d` |
