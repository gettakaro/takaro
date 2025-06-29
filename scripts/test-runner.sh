#!/bin/bash

# Test runner script for Takaro monorepo
# Uses vitest for all backend package tests

set -e

# Default values
LOGGING_LEVEL="${LOGGING_LEVEL:-none}"
DEBUG_MODE=false
CHECK_TYPES=false

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
    npx tsc --noEmit --skipLibCheck
}

run_vitest_tests() {
    local pattern="$1"
    local extra_args="$2"
    
    echo "Running tests with vitest..."
    
    if [ "$DEBUG_MODE" = true ]; then
        echo "Debug mode: Connect debugger to port 9229"
        extra_args="--inspect-brk $extra_args"
    fi
    
    # Run vitest in each package that has tests matching the pattern
    local packages=($(find packages -name "vitest.config.mts" -type f | sed 's|/vitest.config.mts||' | sort))
    
    for package_dir in "${packages[@]}"; do
        # Skip the packages directory itself
        if [ "$package_dir" = "packages" ]; then
            continue
        fi
        
        # Check if package has tests matching pattern
        local has_tests=false
        if [ -z "$pattern" ]; then
            # No pattern, check for any test files
            if find "$package_dir" -name "*.test.ts" -type f 2>/dev/null | grep -q .; then
                has_tests=true
            fi
        else
            # Check for specific pattern
            case "$pattern" in
                *unit*)
                    if find "$package_dir" -name "*.unit.test.ts" -type f 2>/dev/null | grep -q .; then
                        has_tests=true
                    fi
                    ;;
                *integration*)
                    if find "$package_dir" -name "*.integration.test.ts" -type f 2>/dev/null | grep -q .; then
                        has_tests=true
                    fi
                    ;;
                *)
                    if find "$package_dir" -name "*.test.ts" -type f 2>/dev/null | grep -q .; then
                        has_tests=true
                    fi
                    ;;
            esac
        fi
        
        if [ "$has_tests" = true ]; then
            echo "Running tests in $package_dir..."
            (cd "$package_dir" && npx vitest run --reporter=verbose $extra_args) || exit 1
        fi
    done
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
            EXTRA_ARGS="--reporter=junit --reporter=default --outputFile=test-results.xml"
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

# Determine test pattern and run tests
case $MODE in
    all)
        if [ -z "$CUSTOM_PATTERN" ]; then
            wait_for_services
            run_web_tests
        fi
        run_vitest_tests "$CUSTOM_PATTERN" "$EXTRA_ARGS"
        ;;
    unit)
        if [ -z "$CUSTOM_PATTERN" ]; then
            CUSTOM_PATTERN="packages/**/*.unit.test.ts"
        fi
        run_vitest_tests "$CUSTOM_PATTERN" "$EXTRA_ARGS"
        ;;
    integration)
        if [ -z "$CUSTOM_PATTERN" ]; then
            CUSTOM_PATTERN="packages/**/*.integration.test.ts"
            wait_for_services
            run_web_tests
        fi
        run_vitest_tests "$CUSTOM_PATTERN" "$EXTRA_ARGS"
        ;;
    ci)
        wait_for_services
        run_web_tests
        run_vitest_tests "$CUSTOM_PATTERN" "$EXTRA_ARGS"
        ;;
    *)
        echo "Unknown mode: $MODE"
        exit 1
        ;;
esac

echo "✅ All tests completed successfully!"