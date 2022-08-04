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


printHeader "Building packages"

# These require a specific order...
npm run-script -w packages/lib-config build
npm run-script -w packages/lib-logger build
npm run-script -w packages/lib-http build
npm run-script -w packages/lib-components build