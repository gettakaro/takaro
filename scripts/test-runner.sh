#!/bin/bash

# Test runner script for Takaro project
# Provides different test execution modes for better developer experience

set -e

# Default values
TEST_TYPE=""
CI_MODE=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --all)
      TEST_TYPE="all"
      shift
      ;;
    --unit)
      TEST_TYPE="unit"
      shift
      ;;
    --integration)
      TEST_TYPE="integration"
      shift
      ;;
    --ci)
      CI_MODE=true
      TEST_TYPE="all"
      shift
      ;;
    *)
      echo "Unknown option $1"
      exit 1
      ;;
  esac
done

# Ensure we have a test type
if [[ -z "$TEST_TYPE" ]]; then
  echo "Error: Please specify a test type (--all, --unit, --integration, or --ci)"
  exit 1
fi

# Wait for dependencies to be ready
echo "Waiting for test dependencies..."
node packages/test/dist/waitUntilReady.js

# Run tests based on type
case $TEST_TYPE in
  "all")
    if [[ "$CI_MODE" == "true" ]]; then
      npm run test:base -- --test-reporter=spec --test-reporter-destination=stdout --test-reporter=@reporters/github --test-reporter-destination=stdout 'packages/{app-*,lib-apiclient,lib-auth,lib-aws,lib-config,lib-db,lib-email,lib-function-helpers,lib-gameserver,lib-http,lib-modules,lib-queues,lib-util,test,web-docs}/**/*.test.ts'
    else
      npm run test:base -- 'packages/{app-*,lib-apiclient,lib-auth,lib-aws,lib-config,lib-db,lib-email,lib-function-helpers,lib-gameserver,lib-http,lib-modules,lib-queues,lib-util,test,web-docs}/**/*.test.ts'
    fi
    ;;
  "unit")
    npm run test:base -- 'packages/{app-*,lib-apiclient,lib-auth,lib-aws,lib-config,lib-db,lib-email,lib-function-helpers,lib-gameserver,lib-http,lib-modules,lib-queues,lib-util,test,web-docs}/**/*.unit.test.ts'
    ;;
  "integration")
    npm run test:base -- 'packages/{app-*,lib-apiclient,lib-auth,lib-aws,lib-config,lib-db,lib-email,lib-function-helpers,lib-gameserver,lib-http,lib-modules,lib-queues,lib-util,test,web-docs}/**/*.integration.test.ts'
    ;;
esac