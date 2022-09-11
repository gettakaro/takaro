#!/bin/sh

set -e

printHeader() {
    printf '%s\n' ""
    printf '%s\n' "##################"
    printf '%s\n' "$1"
    printf '%s\n' "##################"
    printf '%s\n' ""
}

printHeader "Applying default config, if not already applied"


if test -f ".env.example"; then
    cp --no-clobber .env.example .env
fi

printHeader "Installing node dependencies"

npm ci

printHeader "Initializing database"

mkdir -p _data

printHeader "Building packages"

# These require a specific order for the first build...
npm run-script -w packages/lib-config build
npm run-script -w packages/lib-logger build
npm run-script -w packages/lib-http build
npm run-script -w packages/lib-db build
npm run-script -w packages/lib-gameserver build
npm run-script -w packages/test build

# npm run-script -w packages/app-api build
# npm run-script -w packages/app-agent build