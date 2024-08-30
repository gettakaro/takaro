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
