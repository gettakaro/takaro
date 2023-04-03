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

### Integration tests

Takaro is a complex system, getting it to run in a test environment is not trivial. We use a combination of Docker, Docker Compose and a custom script to get everything running.

```sh
# Assumes you have a running dev environment

DOCKER_TAG=latest npx zx scripts/integration-tests.mjs
```

See the [Github Actions config](.github/workflows) for more details.

### Debugging tests

If you wish to see logs when testing you can add the `LOGGING_LEVEL` env to your script

```sh
docker-compose exec -e LOGGING_LEVEL=debug takaro npm t
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

## Resetting data

There's two ways to reset database data, each applicable in different situations. If your environment is running correctly, you can quickly delete all domains (with related data) using the `dev-remove-domains.mjs` script. This script will talk to the Takaro API, thus if your application is not running this will fail. This script is significantly faster than the other option.

```bash
docker-compose exec takaro node scripts/dev-remove-domains.mjs
```

If your setup is well and truly messed up, you can use the `dev-reset-data.sh` script. This will take down the containers, remove the database data on filesystem level and then restart the containers.

```bash
./scripts/dev-reset-data.sh
```

## "Starting from scratch"

Cleaning out all artifacts from the repo and rebuilding everything. This will take a while, so go grab some ☕️.

```bash
npm run clean && ./scripts/dev-init.sh && docker-compose up -d --build
```
