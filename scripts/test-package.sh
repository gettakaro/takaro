#!/bin/bash

# Test package runner script for Takaro project
# Allows running tests for specific packages with unit/integration options

set -e

# Default values
PACKAGE_NAME=""
TEST_TYPE="all"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --unit)
      TEST_TYPE="unit"
      shift
      ;;
    --integration)
      TEST_TYPE="integration"
      shift
      ;;
    -*)
      echo "Unknown option $1"
      exit 1
      ;;
    *)
      if [[ -z "$PACKAGE_NAME" ]]; then
        PACKAGE_NAME="$1"
      else
        echo "Error: Multiple package names specified. Please provide only one package."
        exit 1
      fi
      shift
      ;;
  esac
done

# Check if PKG environment variable is set (alternative way to specify package)
if [[ -z "$PACKAGE_NAME" && -n "$PKG" ]]; then
  PACKAGE_NAME="$PKG"
fi

# Validate package name is provided
if [[ -z "$PACKAGE_NAME" ]]; then
  echo "Error: Please specify a package name"
  echo "Usage: $0 [--unit|--integration] <package-name>"
  echo "   or: PKG=<package-name> $0 [--unit|--integration]"
  echo "Examples:"
  echo "  $0 lib-config"
  echo "  $0 --unit app-api"
  echo "  $0 --integration lib-modules"
  echo "  PKG=lib-config $0"
  exit 1
fi

# Check if package directory exists
PACKAGE_DIR="packages/$PACKAGE_NAME"
if [[ ! -d "$PACKAGE_DIR" ]]; then
  echo "Error: Package directory '$PACKAGE_DIR' does not exist"
  echo "Available packages:"
  ls -1 packages/ | grep -E '^(app-|lib-|web-|test)' | head -10
  exit 1
fi

# Set environment variables for consistent test behavior
export LOGGING_LEVEL=none
export TAKARO_TEST_RUNNER_ATTEMPTS=0

echo "Running tests for package: $PACKAGE_NAME (type: $TEST_TYPE)"

# Build the test pattern based on package and test type
case $TEST_TYPE in
  "unit")
    TEST_PATTERN="$PACKAGE_DIR/**/*.unit.test.ts"
    ;;
  "integration")
    TEST_PATTERN="$PACKAGE_DIR/**/*.integration.test.ts"
    ;;
  "all")
    TEST_PATTERN="$PACKAGE_DIR/**/*.test.ts"
    ;;
esac

# Check if any test files exist for this pattern
if ! ls $TEST_PATTERN >/dev/null 2>&1; then
  echo "Warning: No test files found matching pattern: $TEST_PATTERN"
  echo "Skipping test execution."
  exit 0
fi

echo "Test pattern: $TEST_PATTERN"

# Run the tests
node --test-concurrency 1 --test-force-exit --import=ts-node-maintained/register/esm --test "$TEST_PATTERN"