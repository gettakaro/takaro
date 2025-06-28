#!/bin/bash

# Test runner script for Takaro monorepo
# Handles core test execution logic with various modes

set -e

# Default values
LOGGING_LEVEL="${LOGGING_LEVEL:-none}"
TEST_CONCURRENCY="${TEST_CONCURRENCY:-1}"
DEBUG_MODE=false
CHECK_TYPES=false

# Test patterns
ALL_PACKAGES_PATTERN="packages/{app-*,lib-apiclient,lib-auth,lib-aws,lib-config,lib-db,lib-email,lib-function-helpers,lib-gameserver,lib-http,lib-modules,lib-queues,lib-util,test,web-docs}/**/*.test.ts"
UNIT_PATTERN="packages/{app-*,lib-apiclient,lib-auth,lib-aws,lib-config,lib-db,lib-email,lib-function-helpers,lib-gameserver,lib-http,lib-modules,lib-queues,lib-util,test,web-docs}/**/*.unit.test.ts"
INTEGRATION_PATTERN="packages/{app-*,lib-apiclient,lib-auth,lib-aws,lib-config,lib-db,lib-email,lib-function-helpers,lib-gameserver,lib-http,lib-modules,lib-queues,lib-util,test,web-docs}/**/*.integration.test.ts"

show_usage() {
    echo "Usage: $0 [OPTIONS] [TEST_PATTERN]"
    echo ""
    echo "Options:"
    echo "  --all           Run all tests (default)"
    echo "  --unit          Run only unit tests"
    echo "  --integration   Run only integration tests"
    echo "  --ci            Run tests with CI reporters"
    echo "  --debug         Run tests with debugging enabled"
    echo "  --check         Run TypeScript checking before tests"
    echo "  --help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 --all                    # Run all tests"
    echo "  $0 --unit                   # Run unit tests only"
    echo "  $0 --debug 'path/to/test'   # Debug specific test"
    echo "  $0 'packages/lib-*/**/*'    # Run tests matching pattern"
}

run_web_tests() {
    # Run web component tests first (different test runner)
    COMMAND="--if-present test:unit" REGEX='(web-main)|(lib-components)' ./scripts/run-all-pkgs.sh
}

run_typescript_check() {
    echo "Running TypeScript checks..."
    tsc --noEmit --skipLibCheck
}

run_node_tests() {
    local pattern="$1"
    local extra_args="$2"
    
    local cmd_args="--test-concurrency $TEST_CONCURRENCY --test-force-exit --import=ts-node-maintained/register/esm --test"
    
    if [ "$DEBUG_MODE" = true ]; then
        cmd_args="--inspect-brk $cmd_args"
    fi
    
    LOGGING_LEVEL="$LOGGING_LEVEL" node $cmd_args $extra_args "$pattern"
}

wait_for_services() {
    echo "Waiting for services to be ready..."
    node packages/test/dist/waitUntilReady.js
}

# Parse arguments
MODE="all"
CUSTOM_PATTERN=""
EXTRA_ARGS=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --all)
            MODE="all"
            shift
            ;;
        --unit)
            MODE="unit"
            shift
            ;;
        --integration)
            MODE="integration"
            shift
            ;;
        --ci)
            MODE="ci"
            EXTRA_ARGS="--test-reporter=spec --test-reporter-destination=stdout --test-reporter=@reporters/github --test-reporter-destination=stdout"
            shift
            ;;
        --debug)
            DEBUG_MODE=true
            shift
            ;;
        --check)
            CHECK_TYPES=true
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
            CUSTOM_PATTERN="$1"
            shift
            ;;
    esac
done

# Run TypeScript check if requested
if [ "$CHECK_TYPES" = true ]; then
    run_typescript_check
fi

# Determine test pattern
case $MODE in
    all)
        PATTERN="${CUSTOM_PATTERN:-$ALL_PACKAGES_PATTERN}"
        wait_for_services
        run_web_tests
        ;;
    unit)
        PATTERN="${CUSTOM_PATTERN:-$UNIT_PATTERN}"
        ;;
    integration)
        PATTERN="${CUSTOM_PATTERN:-$INTEGRATION_PATTERN}"
        wait_for_services
        run_web_tests
        ;;
    ci)
        PATTERN="${CUSTOM_PATTERN:-$ALL_PACKAGES_PATTERN}"
        wait_for_services
        run_web_tests
        ;;
    *)
        echo "Unknown mode: $MODE"
        exit 1
        ;;
esac

# Run the tests
echo "Running tests with pattern: $PATTERN"
run_node_tests "$PATTERN" "$EXTRA_ARGS"