---
sidebar_position: 6
---

# Common tasks and snippets


## Running tests

Running integration tests is easiest via the dev container.

Run everything: 
```
docker-compose exec takaro npm -w packages/app-api run test:integration"
```

Mocha allows you to filter for the test names you want to run. For example, to run all tests for the SettingsController:

```
docker-compose exec takaro npm -w packages/app-api run test:integration -- -g "SettingsController"
```

Or, if you want to zoom in to one test, you can use the full name of the test

```
docker-compose exec takaro npm -w packages/app-api run test:integration -- -g "SettingsController - Can get all settings with a filter"
```

## Database migrations

Creating a new migration:

```bash
npm -w packages/lib-db run migrate:create:domain
# or
npm -w packages/lib-db run migrate:create:system
```

This will create an empty file with current timestamp in the name and place it in the migrations folder (`packages/lib-db/src/migrations`). You can now give it a meaningful name and add the SQL statements you want to run. (pro tip: look at the previous migrations for general structure of the file)

You do not need to manually run migrations to apply them, Takaro will do it automatically when required.