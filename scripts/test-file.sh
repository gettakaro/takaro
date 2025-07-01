#!/bin/bash

# Test file runner script for Takaro project
# Allows running specific test files with options for debugging and TypeScript checking

set -e

# Default values
CHECK_MODE=false
DEBUG_MODE=false
TEST_FILE=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --check)
      CHECK_MODE=true
      shift
      ;;
    --debug)
      DEBUG_MODE=true
      shift
      ;;
    -*)
      echo "Unknown option $1"
      exit 1
      ;;
    *)
      if [[ -z "$TEST_FILE" ]]; then
        TEST_FILE="$1"
      else
        echo "Error: Multiple test files specified. Please provide only one file."
        exit 1
      fi
      shift
      ;;
  esac
done

# Validate test file is provided
if [[ -z "$TEST_FILE" ]]; then
  echo "Error: Please specify a test file to run"
  echo "Usage: $0 [--check] [--debug] <test-file>"
  echo "Examples:"
  echo "  $0 packages/lib-config/src/__tests__/config.unit.test.ts"
  echo "  $0 --check packages/app-api/src/controllers/__tests__/TrackingController.integration.test.ts"
  echo "  $0 --debug packages/lib-modules/src/__tests__/ping.integration.test.ts"
  exit 1
fi

# Check if file exists
if [[ ! -f "$TEST_FILE" ]]; then
  echo "Error: Test file '$TEST_FILE' does not exist"
  exit 1
fi

# TypeScript checking mode
if [[ "$CHECK_MODE" == "true" ]]; then
  echo "Running TypeScript check on $TEST_FILE..."
  npx tsc --noEmit "$TEST_FILE"
  if [[ $? -ne 0 ]]; then
    echo "TypeScript check failed for $TEST_FILE"
    exit 1
  fi
  echo "TypeScript check passed. Proceeding with test execution..."
fi

# Set environment variables for consistent test behavior
export LOGGING_LEVEL=none
export TAKARO_TEST_RUNNER_ATTEMPTS=0

# Debug mode
if [[ "$DEBUG_MODE" == "true" ]]; then
  echo "Running test in debug mode: $TEST_FILE"
  echo "Debug server will be available for connection..."
  node --inspect-brk --test-concurrency 1 --test-force-exit --import=ts-node-maintained/register/esm --test "$TEST_FILE"
else
  echo "Running test: $TEST_FILE"
  node --test-concurrency 1 --test-force-exit --import=ts-node-maintained/register/esm --test "$TEST_FILE"
fi