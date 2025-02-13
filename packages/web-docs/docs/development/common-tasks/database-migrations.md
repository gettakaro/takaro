---
sidebar_position: 1
hide_table_of_contents: true
---

# Database migrations

Creating a new migration:

```bash
npm -w packages/lib-db run migrate:create some-meaningful-name
```

This will create an empty file with the current timestamp in the name and place it in the migrations' folder (`packages/lib-db/src/migrations`). You can now add the SQL statements you want to run. (pro-tip: look at the previous migrations for general structure of the file)

Running migrations:

```bash
docker-compose exec takaro npm -w packages/app-api run db:migrate
```

Rolling back migrations:

```bash
docker-compose exec takaro npm -w packages/app-api run db:rollback
```

## Snapshotting database migrations

When creating migrations, you'll want to test them to make sure they work as expected. Realistically, the first try wont work, so you'll need to rollback the migration, fix the issue, and try again. You can use the standard rollback mechanism if it is implemented already. Otherwise, you can use the following method to snapshot the database before running the migration:

```bash
mkdir -p _data/snapshots
# Create a snapshot
docker-compose exec postgresql pg_dump -U takaro takaro > _data/snapshots/pre_migration.sql
# Clean the DB
docker-compose exec postgresql psql -U takaro -c "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = 'takaro' AND pid <> pg_backend_pid();" postgres && docker-compose exec postgresql dropdb -U takaro takaro && docker-compose exec postgresql createdb -U takaro takaro
# To restore:
docker-compose exec -T postgresql psql -U takaro takaro < _data/snapshots/pre_migration.sql

```
