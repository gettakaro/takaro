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

