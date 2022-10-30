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

printHeader "Installing node dependencies"
npm ci

printHeader "Initializing database"

mkdir -p _data

printHeader "Building packages"

# These require a specific order for the first build...
npm run-script -w packages/lib-config build
npm run-script -w packages/lib-util build
npm run-script -w packages/lib-http build
npm run-script -w packages/lib-db build
npm run-script -w packages/lib-gameserver build
npm run-script -w packages/lib-queues build

npm run-script -w packages/lib-apiclient build
npm run-script -w packages/test build

# npm run-script -w packages/app-api build
# npm run-script -w packages/app-agent build
