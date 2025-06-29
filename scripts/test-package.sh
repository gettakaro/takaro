#!/bin/bash

# Test package script for running tests within specific packages using Vitest
# Supports unit, integration, and all tests for a given package

set -e

# Default values
MODE="all"
CHECK_TYPES=false

show_usage() {
    echo "Usage: PKG=<package-name> $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --all           Run all tests in package (default)"
    echo "  --unit          Run only unit tests in package"
    echo "  --integration   Run only integration tests in package"
    echo "  --check         Run TypeScript checking before tests"
    echo "  --help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  PKG=lib-config $0                    # Run all tests in lib-config"
    echo "  PKG=lib-config $0 --unit            # Run unit tests in lib-config"
    echo "  PKG=app-api $0 --integration         # Run integration tests in app-api"
    echo "  PKG=lib-modules $0 --check --unit   # Check types then run unit tests"
    echo ""
    echo "Available packages:"
    echo "  lib-config, lib-db, lib-auth, lib-modules, lib-gameserver,"
    echo "  lib-http, lib-util, app-api, app-connector, etc."
}

validate_package() {
    local pkg="$1"
    
    if [ -z "$pkg" ]; then
        echo "Error: PKG environment variable is required."
        echo ""
        show_usage
        exit 1
    fi
    
    local package_dir="packages/$pkg"
    if [ ! -d "$package_dir" ]; then
        echo "Error: Package directory does not exist: $package_dir"
        echo ""
        echo "Available packages:"
        ls -1 packages/ | grep -E '^(app-|lib-)' | head -10
        if [ "$(ls -1 packages/ | grep -E '^(app-|lib-)' | wc -l)" -gt 10 ]; then
            echo "... and more"
        fi
        exit 1
    fi
}

run_typescript_check() {
    local pkg="$1"
    echo "Running TypeScript checks for package: $pkg"
    npx tsc --noEmit --skipLibCheck "packages/$pkg/**/*.ts"
}

run_package_tests() {
    local pkg="$1"
    local test_type="$2"
    
    local pattern
    case $test_type in
        unit)
            pattern="**/*.unit.test.ts"
            ;;
        integration)
            pattern="**/*.integration.test.ts"
            ;;
        all)
            pattern="**/*.test.ts"
            ;;
        *)
            echo "Error: Unknown test type: $test_type"
            exit 1
            ;;
    esac
    
    # Check if any test files exist using find
    local search_pattern
    case $test_type in
        unit)
            search_pattern="*.unit.test.ts"
            ;;
        integration)
            search_pattern="*.integration.test.ts"
            ;;
        all)
            search_pattern="*.test.ts"
            ;;
    esac
    
    local files=($(find "packages/$pkg" -name "$search_pattern" -type f 2>/dev/null || true))
    if [ ${#files[@]} -eq 0 ]; then
        echo "No $test_type test files found in package: $pkg"
        echo "Pattern searched: $pattern"
        exit 0
    fi
    
    echo "Running $test_type tests for package: $pkg"
    echo "Pattern: $pattern"
    echo "Found ${#files[@]} test files"
    
    # Run vitest from the package directory
    cd "packages/$pkg" && npx vitest run --reporter=verbose
}

# Parse arguments
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
            echo "Error: Unexpected argument: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Validate package
validate_package "$PKG"

# Run TypeScript check if requested
if [ "$CHECK_TYPES" = true ]; then
    run_typescript_check "$PKG"
fi

# Run the tests
run_package_tests "$PKG" "$MODE"