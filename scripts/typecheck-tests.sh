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
    
    # Run TypeScript check on all files using project context
    echo "Checking TypeScript compilation..."
    
    # Create a temporary file list for TypeScript to check
    local temp_file_list=$(mktemp)
    
    # Write files to the temp list (one per line)
    for file in "${test_files[@]}"; do
        echo "$file" >> "$temp_file_list"
    done
    
    # Run TypeScript with project context and check only our specific files
    # We use --listFilesOnly first to validate files are in the project
    local check_output
    local check_exit_code
    
    # Check if files are part of the TypeScript project
    if ! npx tsc --project . --listFilesOnly | grep -qf "$temp_file_list"; then
        echo "Warning: Some test files may not be included in the TypeScript project"
    fi
    
    # Now run the actual type check
    # We use a trick: compile the whole project but only show errors for our files
    check_output=$(npx tsc --noEmit --project . 2>&1 || true)
    check_exit_code=$?
    
    # Filter output to only show errors for our test files
    local filtered_output=""
    local has_errors=false
    
    while IFS= read -r line; do
        for file in "${test_files[@]}"; do
            if [[ "$line" == *"$file"* ]]; then
                filtered_output+="$line"$'\n'
                has_errors=true
                break
            fi
        done
    done <<< "$check_output"
    
    # Clean up temp file
    rm -f "$temp_file_list"
    
    if [[ "$has_errors" == "true" ]]; then
        echo "$filtered_output"
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