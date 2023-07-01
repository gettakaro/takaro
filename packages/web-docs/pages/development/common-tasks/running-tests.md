## Running tests

Running integration tests is easiest via the dev container.

Run everything:

```sh
docker-compose exec takaro npm test
```

Mocha allows you to filter for the test names you want to run. For example, to run all tests for the SettingsController:

```sh
docker-compose exec takaro npm -w packages/app-api run test:integration -- -g "SettingsController"
```

Or, if you want to zoom in to one test, you can use the full name of the test

```sh
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

### Snapshots

API tests can use snapshots for their assertions. Snapshots are stored in the `packages/test/src/__snapshots__` folder. If you want to update the snapshots, you can run the tests with the `OVERWRITE_SNAPSHOTS` env set to `true`.

```sh
docker-compose exec -e OVERWRITE_SNAPSHOTS=true takaro npm -w packages/app-api run test:integration
```
