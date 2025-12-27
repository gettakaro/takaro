#!/bin/bash
# CI failure log helper
# Usage: ./ci-logs.sh <PR_NUMBER> [search_pattern]
# Example: ./ci-logs.sh 2413
# Example: ./ci-logs.sh 2413 defineConfig

set -e

REPO="${REPO:-gettakaro/takaro}"
PR_NUMBER="$1"
PATTERN="${2:-}"

if [ -z "$PR_NUMBER" ]; then
    echo "CI Logs Helper"
    echo ""
    echo "Usage: ./ci-logs.sh <PR_NUMBER> [search_pattern]"
    echo ""
    echo "Examples:"
    echo "  ./ci-logs.sh 2413              # Show failed checks and failures"
    echo "  ./ci-logs.sh 2413 defineConfig # Search for specific error"
    echo ""
    echo "Environment:"
    echo "  REPO=owner/repo  # Override repository (default: gettakaro/takaro)"
    exit 1
fi

echo "=== PR #$PR_NUMBER Checks ==="
gh pr checks "$PR_NUMBER" --repo "$REPO" 2>/dev/null || {
    echo "Failed to get PR checks. Make sure:"
    echo "  - gh CLI is authenticated (gh auth login)"
    echo "  - PR #$PR_NUMBER exists in $REPO"
    exit 1
}

# Get the most recent failed run ID
echo ""
echo "=== Finding Failed Run ==="
RUN_ID=$(gh pr view "$PR_NUMBER" --repo "$REPO" --json statusCheckRollup \
    --jq '.statusCheckRollup[] | select(.conclusion == "FAILURE") | .detailsUrl' 2>/dev/null \
    | head -1 | grep -oP 'runs/\K[0-9]+' || echo "")

if [ -z "$RUN_ID" ]; then
    echo "No failed runs found for PR #$PR_NUMBER"
    echo "All checks may be passing or still running."
    exit 0
fi

echo "Failed Run ID: $RUN_ID"
echo ""

if [ -n "$PATTERN" ]; then
    echo "=== Searching for: $PATTERN ==="
    gh run view "$RUN_ID" --repo "$REPO" --log-failed 2>&1 | grep -B 5 -A 10 "$PATTERN" || echo "Pattern not found in logs"
else
    echo "=== Failure Summary ==="
    gh run view "$RUN_ID" --repo "$REPO" --log-failed 2>&1 | \
        grep -E "✖|FAIL|AssertionError|SyntaxError|Error:|npm error" | head -50

    echo ""
    echo "=== Test Results ==="
    gh run view "$RUN_ID" --repo "$REPO" --log-failed 2>&1 | \
        grep -E "^.*(pass|fail|skip|todo|duration)" | tail -20
fi

echo ""
echo "=== More Commands ==="
echo "Full logs:  gh run view $RUN_ID --repo $REPO --log-failed"
echo "Search:     gh run view $RUN_ID --repo $REPO --log-failed 2>&1 | grep 'pattern'"
