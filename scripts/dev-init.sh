#!/bin/sh

set -e

printHeader() {
	printf '%s\n' ""
	printf '%s\n' "##################"
	printf '%s\n' "$1"
	printf '%s\n' "##################"
	printf '%s\n' ""
}

if test -e ".env.example" && ! test -e ".env"; then
	printHeader "Applying default config"
	cp .env.example .env
fi

printHeader "Initializing datastores"

mkdir -p _data
mkdir -p _data/db
mkdir -p _data/kratos-db
mkdir -p _data/hydra-db
ls -la _data

printHeader "Setup playwright reports directory"
mkdir -p reports

# The prometheus container runs as a user with UID and GID 65534
# so we need to make sure the data directory is writable by that user
if [ ! -d "./_data/prometheus" ]; then
	mkdir -p ./_data/prometheus
	if command -v sudo >/dev/null 2>&1; then
		sudo chown -R 65534:65534 ./_data/prometheus
	fi
fi

# Same for Grafana
if [ ! -d "./_data/grafana" ]; then
	mkdir -p ./_data/grafana
	if command -v sudo >/dev/null 2>&1; then
		sudo chown -R 472:472 ./_data/grafana
	fi
fi

# Same for postgres
if [ ! -d "./_data/db" ]; then
  mkdir -p ./_data/db
  if command -v sudo >/dev/null 2>&1; then
    sudo chown -R 1000:1000 ./_data/db
  fi
fi

# Same for postgres (hydra)
if [ ! -d "./_data/hydra-db/" ]; then
  mkdir -p ./_data/db
  if command -v sudo >/dev/null 2>&1; then
    sudo chown -R 1000:1000 ./_data/hydra-db
  fi
fi

# Same for postgres (kratos)
if [ ! -d "./_data/kratos-db/" ]; then
  mkdir -p ./_data/db
  if command -v sudo >/dev/null 2>&1; then
    sudo chown -R 1000:1000 ./_data/kratos-db
  fi
fi



printHeader "Installing node dependencies"
npm ci

printHeader "Building packages"

# These require a specific order for the first build...
npm run-script -w packages/lib-config build
npm run-script -w packages/lib-util build
npm run-script -w packages/lib-apiclient build
npm run-script -w packages/lib-auth build
npm run-script -w packages/lib-aws build
npm run-script -w packages/lib-db build
npm run-script -w packages/lib-modules build
npm run-script -w packages/lib-email build
npm run-script -w packages/lib-gameserver build
npm run-script -w packages/lib-queues build
npm run-script -w packages/lib-http build
npm run-script -w packages/lib-function-helpers build

npm run-script -w packages/test build

npx ts-node scripts/getMonacoCustomTypes.ts

# npm run-script -w packages/app-agent build
