#!/bin/bash

# Runs an arbitrary command **concurrently** in all packages in the monorepo.
# Allows specifying a regex to only run in select packages

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

# Exclude optional dev tools (storybook, docs) - run manually if needed
EXCLUDED_PACKAGES="packages/web-docs|packages/lib-components"
FILTERED_PACKAGES=$(echo "$FILTERED_PACKAGES" | grep -v -E "$EXCLUDED_PACKAGES")

echo "Running in following packages:"
echo "$FILTERED_PACKAGES"

# Prepare commands to run
COMMANDS=$(echo "$FILTERED_PACKAGES" | sed -r -E "s/(packages\/.+)/\"npm run --if-present -w \1 $COMMAND\"/g")

# Prepare names to link to commands (better logging output)
NAMES=$(echo "$FILTERED_PACKAGES" | sed -r 's/(packages\/)(\w-.*)/\2/g')

echo '----------------------'
echo npx concurrently --names $(echo $NAMES | tr ' ' ',') $COMMANDS
echo '----------------------'

eval npx concurrently --names $(echo $NAMES | tr ' ' ',') $COMMANDS

SUCCESS=$?

echo ''
echo ''
echo ''

if [ $SUCCESS -eq 0 ]; then
	echo "All commands succeeded 🎉"
	exit 0
else
	echo "Some commands failed 😢"
	exit $SUCCESS
fi
