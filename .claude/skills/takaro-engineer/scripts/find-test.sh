#!/bin/bash
# Find test files by pattern
# Usage: ./find-test.sh <pattern>
# Example: ./find-test.sh ping
# Example: ./find-test.sh RoleController

PATTERN="$1"

if [ -z "$PATTERN" ]; then
    echo "Usage: ./find-test.sh <pattern>"
    echo ""
    echo "Examples:"
    echo "  ./find-test.sh ping           # Find tests containing 'ping'"
    echo "  ./find-test.sh RoleController # Find RoleController tests"
    echo "  ./find-test.sh unit           # Find all unit tests"
    echo "  ./find-test.sh integration    # Find all integration tests"
    exit 1
fi

echo "=== Test files matching '$PATTERN' ==="
echo ""

# Find matching test files
find packages -name "*.test.ts" -type f 2>/dev/null | grep -i "$PATTERN" | while read -r file; do
    # Get relative path and test type
    if [[ "$file" == *".unit.test.ts" ]]; then
        TYPE="[unit]"
    elif [[ "$file" == *".integration.test.ts" ]]; then
        TYPE="[integration]"
    else
        TYPE="[test]"
    fi
    echo "$TYPE $file"
done

echo ""
echo "=== Run a specific test ==="
echo "docker compose exec takaro npm run test:file <path>"
