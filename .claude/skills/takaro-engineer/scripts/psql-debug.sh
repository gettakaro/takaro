#!/bin/bash
# Database debugging helper
# Usage: ./psql-debug.sh [query-name]
# Example: ./psql-debug.sh domains
# Example: ./psql-debug.sh players

QUERY="$1"

run_query() {
    docker compose exec postgresql psql -U takaro -d takaro -c "$1"
}

case "$QUERY" in
    "domains"|"d")
        echo "=== Active Domains ==="
        run_query "SELECT id, name, state, \"createdAt\" FROM domains WHERE state = 'ACTIVE' ORDER BY \"createdAt\" DESC LIMIT 20;"
        ;;
    "players"|"p")
        echo "=== Recent Players ==="
        run_query "SELECT id, name, \"steamId\", domain FROM players ORDER BY \"createdAt\" DESC LIMIT 20;"
        ;;
    "gameservers"|"gs")
        echo "=== Game Servers ==="
        run_query "SELECT id, name, type, domain FROM gameservers ORDER BY \"createdAt\" DESC LIMIT 20;"
        ;;
    "modules"|"m")
        echo "=== Installed Modules ==="
        run_query "SELECT mi.id, m.name as module, gs.name as gameserver, mi.domain FROM \"moduleInstallations\" mi JOIN modules m ON mi.\"moduleId\" = m.id JOIN gameservers gs ON mi.\"gameserverId\" = gs.id LIMIT 20;"
        ;;
    "events"|"e")
        echo "=== Recent Events ==="
        run_query "SELECT \"eventName\", \"createdAt\", domain FROM events ORDER BY \"createdAt\" DESC LIMIT 20;"
        ;;
    "migrations")
        echo "=== Recent Migrations ==="
        run_query "SELECT name, batch, migration_time FROM knex_migrations ORDER BY migration_time DESC LIMIT 10;"
        ;;
    "tables"|"t")
        echo "=== All Tables ==="
        run_query "\\dt"
        ;;
    "shell"|"sh")
        echo "Opening psql shell..."
        docker compose exec postgresql psql -U takaro -d takaro
        ;;
    *)
        echo "Database Debug Helper"
        echo ""
        echo "Usage: ./psql-debug.sh <query-name>"
        echo ""
        echo "Available queries:"
        echo "  domains (d)     - List active domains"
        echo "  players (p)     - List recent players"
        echo "  gameservers (gs)- List game servers"
        echo "  modules (m)     - List installed modules"
        echo "  events (e)      - List recent events"
        echo "  migrations      - List recent migrations"
        echo "  tables (t)      - List all tables"
        echo "  shell (sh)      - Open psql shell"
        echo ""
        echo "Or run custom query:"
        echo "  docker compose exec postgresql psql -U takaro -d takaro -c \"YOUR QUERY\""
        ;;
esac
