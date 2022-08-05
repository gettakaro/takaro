#!/bin/bash

# Runs an arbitrary command **concurrently** in all packages in the monorepo.
# Allows specifying a regex to only run in select packages

set -e

COMMAND=$COMMAND
REGEX=$REGEX

if [ -z "$COMMAND" ]; then
  echo "COMMAND environment variable must be set"
  exit 1
fi

if [ -z "$REGEX" ]; then
  REGEX="packages\/.+"
fi

echo "Running command '$COMMAND' in packages matching regex '$REGEX'"

# Get all packages in the monorepo
PACKAGES=$(find packages -maxdepth 1 -mindepth 1 -type d)

# Filter packages by regex
FILTERED_PACKAGES=$(echo "$PACKAGES" | grep -E "$REGEX")

echo "Running in following packages:"
echo "$FILTERED_PACKAGES"

# Prepare commands to run
COMMANDS=$(echo "$FILTERED_PACKAGES" | sed -r -E "s/(packages\/.+)/\"npm run -w \1 $COMMAND\"/g")

# Prepare names to link to commands (better logging output)
NAMES=$(echo "$FILTERED_PACKAGES" | sed -r 's/(packages\/)(\w-.*)/\2/g' ) 

echo '----------------------'
echo npx concurrently --names $(echo $NAMES | tr ' ' ',') --kill-others-on-fail $COMMANDS
echo '----------------------'

eval npx concurrently --names $(echo $NAMES | tr ' ' ',') --kill-others-on-fail $COMMANDS
