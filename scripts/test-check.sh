#!/bin/bash

# TypeScript check script for Takaro project test files
# Performs TypeScript checking on test files before running them

set -e

# Default values
CHECK_TESTS=false
CHECK_ALL=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --tests)
      CHECK_TESTS=true
      shift
      ;;
    --all)
      CHECK_ALL=true
      shift
      ;;
    *)
      echo "Unknown option $1"
      exit 1
      ;;
  esac
done

# Default to checking tests if no specific option provided
if [[ "$CHECK_TESTS" == "false" && "$CHECK_ALL" == "false" ]]; then
  CHECK_TESTS=true
fi

echo "Running TypeScript checks..."

if [[ "$CHECK_ALL" == "true" ]]; then
  echo "Checking all TypeScript files..."
  npx tsc --noEmit
elif [[ "$CHECK_TESTS" == "true" ]]; then
  echo "Checking test files..."
  
  # Find all test files and check them
  TEST_FILES=$(find packages -name "*.test.ts" -type f | head -20)
  
  if [[ -z "$TEST_FILES" ]]; then
    echo "No test files found to check"
    exit 0
  fi
  
  echo "Found test files to check:"
  echo "$TEST_FILES" | while read -r file; do
    echo "  - $file"
  done
  
  # Check each test file
  echo "$TEST_FILES" | while read -r file; do
    if [[ -n "$file" ]]; then
      echo "Checking: $file"
      npx tsc --noEmit "$file"
      if [[ $? -ne 0 ]]; then
        echo "TypeScript check failed for: $file"
        exit 1
      fi
    fi
  done
fi

echo "TypeScript checks completed successfully!"