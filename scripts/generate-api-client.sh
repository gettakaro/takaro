#!/bin/bash

# API Client Generation Script for Takaro
# This script generates the TypeScript API client from the OpenAPI specification

set -e

# Change to the lib-apiclient directory
cd "$(dirname "$0")/../packages/lib-apiclient"

# Wait for the API to be healthy
echo "Waiting for API to be healthy..."
node ../../scripts/wait-until-healthy.mjs

# Download the OpenAPI spec
SPEC_FILE="/tmp/takaro-openapi-spec.json"
echo "Downloading OpenAPI specification..."
curl -s "${TAKARO_HOST}/openapi.json" -o "${SPEC_FILE}"

# Set the version to 0.0.0
# This is a workaround to prevent merge conflicts. When the API client is generated
# in CI, the OpenAPI spec version includes the commit hash, which means every branch
# generates a slightly different client. This causes merge conflicts in every branch.
# By setting a fixed version (0.0.0), we ensure consistent output across all branches.
echo "Setting spec version to 0.0.0..."
jq '.info.version = "0.0.0"' "${SPEC_FILE}" > "${SPEC_FILE}.tmp" && mv "${SPEC_FILE}.tmp" "${SPEC_FILE}"

# Generate the API client
echo "Generating API client from OpenAPI specification..."
npx @openapitools/openapi-generator-cli generate \
  -i "${SPEC_FILE}" \
  -g typescript-axios \
  -o ./src/generated/

# Clean up the temporary file
rm -f "${SPEC_FILE}"

# Fix ESM imports in generated files
echo "Fixing ESM imports in generated files..."
DIRECTORY="./src/generated"
OS=$(uname -s)

sub() {
    if [ "$OS" = "Darwin" ]; then
        sed -i '' "$@"
    else
        sed -i "$@"
    fi
}

for file in "$DIRECTORY"/*.ts; do
    echo "Processing: $file"
    
    # sed command that replaces the import statement
    # from './configuration';
    # to './configuration.js';
    sub 's/from '\''\.\/configuration'\''/from '\''\.\/configuration\.js'\''/g' "$file"
    sub 's/from '\''\.\/common'\''/from '\''\.\/common\.js'\''/g' "$file"
    sub 's/from '\''\.\/base'\''/from '\''\.\/base\.js'\''/g' "$file"
    sub 's/from '\''\.\/api'\''/from '\''\.\/api\.js'\''/g' "$file"
    
    # Do the same for double quotes
    sub 's/from "\.\/configuration"/from "\.\/configuration\.js"/g' "$file"
    sub 's/from "\.\/common"/from "\.\/common\.js"/g' "$file"
    sub 's/from "\.\/base"/from "\.\/base\.js"/g' "$file"
    sub 's/from "\.\/api"/from "\.\/api\.js"/g' "$file"
done

# Build the generated code
echo "Building the API client..."
npm run build

# Run style fixes on generated code
echo "Running style fixes on generated code..."
cd ../..
npm run test:style:fix

echo "API client generation completed successfully!"