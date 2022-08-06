#!/bin/sh

set -e

printHeader() {
    printf '%s\n' ""
    printf '%s\n' "##################"
    printf '%s\n' "$1"
    printf '%s\n' "##################"
    printf '%s\n' ""
}


printHeader "Installing node dependencies"

npm ci

printHeader "Initializing database"

mkdir -p _data

printHeader "Building packages"

npm run db:generate

# These require a specific order for the first build...
npm run-script -w packages/lib-config build
npm run-script -w packages/lib-logger build
npm run-script -w packages/lib-http build
npm run-script -w packages/lib-db build