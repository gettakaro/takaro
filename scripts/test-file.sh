#!/bin/bash

# Test file script for running individual test files with Vitest
# Supports TypeScript checking and debugging

set -e

# Default values
CHECK_TYPES=false
DEBUG_MODE=false

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
    npx tsc --noEmit --skipLibCheck "$test_file"
}

run_single_file_test() {
    local test_file="$1"
    
    # Find the package directory
    local package_dir=$(echo "$test_file" | grep -o "packages/[^/]*" | head -1)
    
    if [ -z "$package_dir" ]; then
        echo "Error: Could not determine package directory for $test_file"
        exit 1
    fi
    
    echo "Running test: $test_file"
    
    # Get the relative path from the package directory
    local relative_path=${test_file#$package_dir/}
    
    if [ "$DEBUG_MODE" = true ]; then
        echo "Starting test in debug mode. Connect your debugger to port 9229."
        cd "$package_dir" && npx vitest run --inspect-brk --reporter=verbose "$relative_path"
    else
        cd "$package_dir" && npx vitest run --reporter=verbose "$relative_path"
    fi
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