#!/bin/bash

# Shared TypeScript checking function for Takaro test scripts
# Performs TypeScript checking on test files before running them

set -e

# Function to check TypeScript for given test patterns
typecheck_tests() {
    local test_patterns=("$@")
    
    if [[ ${#test_patterns[@]} -eq 0 ]]; then
        echo "Error: No test patterns provided to typecheck_tests function"
        return 1
    fi
    
    echo "Running TypeScript check on test files..."
    
    # Collect all test files matching the patterns
    local test_files=()
    for pattern in "${test_patterns[@]}"; do
        # Check if it's a direct file path or a glob pattern
        if [[ -f "$pattern" ]]; then
            # It's a direct file path
            test_files+=("$pattern")
        else
            # It's a glob pattern, use bash globbing
            shopt -s globstar nullglob
            for file in $pattern; do
                if [[ -f "$file" ]]; then
                    test_files+=("$file")
                fi
            done
        fi
    done
    
    if [[ ${#test_files[@]} -eq 0 ]]; then
        echo "No test files found matching the patterns"
        return 0
    fi
    
    echo "Found ${#test_files[@]} test files to check:"
    for file in "${test_files[@]}"; do
        echo "  - $file"
    done
    
    # Run TypeScript check on all files
    echo "Checking TypeScript compilation..."
    if ! npx tsc --noEmit --skipLibCheck "${test_files[@]}"; then
        echo ""
        echo "❌ TypeScript check failed!"
        echo "Please fix the TypeScript errors above before running tests."
        return 1
    fi
    
    echo "✅ TypeScript check passed!"
    return 0
}

# If this script is run directly, show usage
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    echo "This script provides a shared typecheck_tests function for other test scripts."
    echo "Usage: source scripts/typecheck-tests.sh && typecheck_tests 'pattern1' 'pattern2' ..."
    echo "Example: typecheck_tests 'packages/lib-*/**/*.test.ts' 'packages/app-*/**/*.unit.test.ts'"
fi