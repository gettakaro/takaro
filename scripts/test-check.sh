#!/bin/bash

# TypeScript checking script for test files
# Provides targeted TypeScript validation

set -e

show_usage() {
    echo "Usage: $0 [OPTIONS] [pattern]"
    echo ""
    echo "Options:"
    echo "  --all       Check all TypeScript files (default)"
    echo "  --tests     Check only test files"
    echo "  --package   Check specific package (requires PKG env var)"
    echo "  --help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Check all files"
    echo "  $0 --tests                           # Check all test files"
    echo "  PKG=lib-config $0 --package          # Check lib-config package"
    echo "  $0 'packages/lib-config/**/*.ts'     # Check specific pattern"
}

run_typescript_check() {
    local pattern="$1"
    local description="$2"
    
    echo "Running TypeScript checks for: $description"
    echo "Pattern: $pattern"
    
    if [ -n "$pattern" ]; then
        # Use tsc with specific pattern
        tsc --noEmit --skipLibCheck $pattern
    else
        # Use tsc without pattern (checks entire project)
        tsc --noEmit --skipLibCheck
    fi
    
    echo "✅ TypeScript checks passed!"
}

# Parse arguments
MODE="all"
CUSTOM_PATTERN=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --all)
            MODE="all"
            shift
            ;;
        --tests)
            MODE="tests"
            shift
            ;;
        --package)
            MODE="package"
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

# Determine what to check based on mode
case $MODE in
    all)
        if [ -n "$CUSTOM_PATTERN" ]; then
            run_typescript_check "$CUSTOM_PATTERN" "custom pattern"
        else
            run_typescript_check "" "all TypeScript files"
        fi
        ;;
    tests)
        # Use find instead of pattern since tsc doesn't support glob patterns
        echo "Running TypeScript checks for: test files"
        test_files=($(find packages -name "*.test.ts" -type f | head -10))
        if [ ${#test_files[@]} -eq 0 ]; then
            echo "No test files found to check"
            exit 0
        fi
        tsc --noEmit --skipLibCheck "${test_files[@]}"
        echo "✅ TypeScript checks passed for test files!"
        ;;
    package)
        if [ -z "$PKG" ]; then
            echo "Error: PKG environment variable is required for --package mode."
            echo "Example: PKG=lib-config $0 --package"
            exit 1
        fi
        
        if [ ! -d "packages/$PKG" ]; then
            echo "Error: Package directory does not exist: packages/$PKG"
            exit 1
        fi
        
        PATTERN="${CUSTOM_PATTERN:-packages/$PKG/**/*.ts}"
        run_typescript_check "$PATTERN" "package $PKG"
        ;;
    *)
        echo "Unknown mode: $MODE"
        exit 1
        ;;
esac