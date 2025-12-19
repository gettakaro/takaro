#!/bin/bash

# Test runner script for Takaro project
# Provides different test execution modes for better developer experience

set -e

# Source the shared TypeScript checking function
source "$(dirname "$0")/typecheck-tests.sh"

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

# Create reports directory for JUnit output
mkdir -p reports/junit

# Run workspace tests first (for web-main and lib-components)
# Note: Skipping TypeScript check for workspace tests as Vitest handles TypeScript validation
echo "Running workspace tests..."
COMMAND="--if-present test:unit" REGEX='(web-main)|(lib-components)' bash ./scripts/run-all-pkgs.sh

# Run tests based on type
case $TEST_TYPE in
  "all")
    echo "Checking TypeScript for all backend tests..."
    typecheck_tests 'packages/{app-*,lib-apiclient,lib-auth,lib-aws,lib-config,lib-db,lib-email,lib-function-helpers,lib-gameserver,lib-http,lib-modules,lib-queues,lib-util,test,web-docs}/**/*.test.ts'
    
    if [[ "$CI_MODE" == "true" ]]; then
      node --test-concurrency 1 --test-force-exit --import=ts-node-maintained/register/esm --test \
        --test-reporter=spec --test-reporter-destination=stdout \
        --test-reporter=@reporters/github --test-reporter-destination=stdout \
        --test-reporter=junit --test-reporter-destination=reports/junit/backend.xml \
        'packages/{app-*,lib-apiclient,lib-auth,lib-aws,lib-config,lib-db,lib-email,lib-function-helpers,lib-gameserver,lib-http,lib-modules,lib-queues,lib-util,test,web-docs}/**/*.test.ts'
    else
      node --test-concurrency 1 --test-force-exit --import=ts-node-maintained/register/esm --test 'packages/{app-*,lib-apiclient,lib-auth,lib-aws,lib-config,lib-db,lib-email,lib-function-helpers,lib-gameserver,lib-http,lib-modules,lib-queues,lib-util,test,web-docs}/**/*.test.ts'
    fi
    ;;
  "unit")
    echo "Checking TypeScript for unit tests..."
    typecheck_tests 'packages/{app-*,lib-apiclient,lib-auth,lib-aws,lib-config,lib-db,lib-email,lib-function-helpers,lib-gameserver,lib-http,lib-modules,lib-queues,lib-util,test,web-docs}/**/*.unit.test.ts'
    
    node --test-concurrency 1 --test-force-exit --import=ts-node-maintained/register/esm --test 'packages/{app-*,lib-apiclient,lib-auth,lib-aws,lib-config,lib-db,lib-email,lib-function-helpers,lib-gameserver,lib-http,lib-modules,lib-queues,lib-util,test,web-docs}/**/*.unit.test.ts'
    ;;
  "integration")
    echo "Checking TypeScript for integration tests..."
    typecheck_tests 'packages/{app-*,lib-apiclient,lib-auth,lib-aws,lib-config,lib-db,lib-email,lib-function-helpers,lib-gameserver,lib-http,lib-modules,lib-queues,lib-util,test,web-docs}/**/*.integration.test.ts'
    
    node --test-concurrency 1 --test-force-exit --import=ts-node-maintained/register/esm --test 'packages/{app-*,lib-apiclient,lib-auth,lib-aws,lib-config,lib-db,lib-email,lib-function-helpers,lib-gameserver,lib-http,lib-modules,lib-queues,lib-util,test,web-docs}/**/*.integration.test.ts'
    ;;
esac