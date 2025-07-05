---
sidebar_position: 3
hide_table_of_contents: true
---

# Running tests

Running integration tests is easiest via the dev container.

Run everything:

```sh
docker compose exec takaro npm test
```

Mocha allows you to filter for the test names you want to run. For example, to run all tests for the SettingsController:

```sh
docker compose exec takaro npm -w packages/app-api run test:integration -- -g "SettingsController"
```

Or, if you want to zoom in to one test, you can use the full name of the test

```sh
docker compose exec takaro npm -w packages/app-api run test:integration -- -g "SettingsController - Can get all settings with a filter"
```

### Integration tests

Takaro is a complex system, getting it to run in a test environment is not trivial. We use a combination of Docker, Docker Compose and a custom script to get everything running.
This command assumes have a working/correctly set up dev environment.

```sh
DOCKER_TAG=latest npx zx scripts/integration-tests.mjs

# To also run end-to-end tests
DOCKER_TAG=latest IS_E2E=1 npx zx scripts/integration-tests.mjs

# To run using the containers specific PR, use pr-[PR_ID].
# You can find the PR_ID next to the title or in the URL.
# E.g. https://github.com/gettakaro/takaro/pull/1246 --> PR_ID=1246
DOCKER_TAG=pr-1246 npx zx scripts/integration-tests.mjs
```

See the [Github Actions config](https://github.com/gettakaro/takaro/tree/main/.github/workflows) for more details.

### Debugging tests

If you wish to see logs when testing you can add the `LOGGING_LEVEL` env to your script

```sh
docker compose exec -e LOGGING_LEVEL=debug takaro npm t
```

### Playwright e2e tests
Playwright tests are run locally, so make sure to set all required environment variables in shell. 


To run the tests:

```sh
  npm -w ./packages/e2e run test:e2e
```

To **write** tests Playwright has 2 more utilities/modes that can help you.

- UI mode adds time-travel experience and watch mode
- Codegen which can generate locators and interactions

```sh
  npm -w ./packages/e2e run dev:ui
  npm -w ./packages/e2e run codegen
```

### Snapshots

API tests can use snapshots for their assertions. Snapshots are stored in the `packages/test/src/__snapshots__` folder. If you want to update the snapshots, you can run the tests with the `OVERWRITE_SNAPSHOTS` env set to `true`.

```sh
docker compose exec -e OVERWRITE_SNAPSHOTS=true takaro npm -w packages/app-api run test:integration
```

### Frontend component tests

Run component tests with Vitest:

```sh
# Run all frontend tests
npm run test:unit --workspace=packages/lib-components

# Update snapshots when they fail
npm run test:snapshot --workspace=packages/lib-components
```

When CI fails due to snapshot mismatches (e.g., after adding new components), update the snapshots locally and commit the changes.
