#!/bin/bash

# Test file script for running individual test files
# Supports TypeScript checking and debugging

set -e

# Default values
CHECK_TYPES=false
DEBUG_MODE=false
LOGGING_LEVEL="${LOGGING_LEVEL:-none}"
TEST_CONCURRENCY="${TEST_CONCURRENCY:-1}"

show_usage() {
    echo "Usage: $0 [OPTIONS] <test_file_path>"
    echo ""
    echo "Options:"
    echo "  --check    Run TypeScript checking before tests"
    echo "  --debug    Run tests with debugging enabled"
    echo "  --help     Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 packages/lib-config/src/__tests__/config.unit.test.ts"
    echo "  $0 --check packages/lib-config/src/__tests__/config.unit.test.ts"
    echo "  $0 --debug packages/app-api/src/controllers/__tests__/TrackingController.integration.test.ts"
}

run_typescript_check() {
    local test_file="$1"
    echo "Running TypeScript checks for: $test_file"
    # Check TypeScript for the specific test file and its dependencies
    tsc --noEmit --skipLibCheck "$test_file"
}

run_single_file_test() {
    local test_file="$1"
    
    local cmd_args="--test-concurrency $TEST_CONCURRENCY --test-force-exit --import=ts-node-maintained/register/esm --test"
    
    if [ "$DEBUG_MODE" = true ]; then
        cmd_args="--inspect-brk $cmd_args"
        echo "Starting test in debug mode. Connect your debugger to the process."
    fi
    
    echo "Running test: $test_file"
    LOGGING_LEVEL="$LOGGING_LEVEL" node $cmd_args "$test_file"
}

# Parse arguments
TEST_FILE=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --check)
            CHECK_TYPES=true
            shift
            ;;
        --debug)
            DEBUG_MODE=true
            shift
            ;;
        --help)
            show_usage
            exit 0
            ;;
        -*)
            echo "Unknown option: $1"
            show_usage
            exit 1
            ;;
        *)
            if [ -z "$TEST_FILE" ]; then
                TEST_FILE="$1"
            else
                echo "Error: Multiple test files specified. Please provide only one."
                show_usage
                exit 1
            fi
            shift
            ;;
    esac
done

# Validate test file argument
if [ -z "$TEST_FILE" ]; then
    echo "Error: No test file specified."
    show_usage
    exit 1
fi

# Check if test file exists
if [ ! -f "$TEST_FILE" ]; then
    echo "Error: Test file does not exist: $TEST_FILE"
    exit 1
fi

# Check if it's actually a test file
if [[ ! "$TEST_FILE" =~ \.test\.ts$ ]]; then
    echo "Warning: File does not appear to be a test file (should end with .test.ts): $TEST_FILE"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Run TypeScript check if requested
if [ "$CHECK_TYPES" = true ]; then
    run_typescript_check "$TEST_FILE"
fi

# Run the test
run_single_file_test "$TEST_FILE"