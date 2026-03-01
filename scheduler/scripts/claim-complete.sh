#!/bin/bash
# claim-complete.sh — Wrapper for claiming work complete with enforcement
# Usage: ./claim-complete.sh <bead-id> <project-name> <repo-path> "<close-reason>"
#
# This script:
# 1. Runs quality gate validation
# 2. If passed, closes the bead with evidence
# 3. If failed, shows what needs fixing

set -e

BEAD_ID="${1:-}"
PROJECT="${2:-}"
REPO_PATH="${3:-}"
CLOSE_REASON="${4:-}"

if [ -z "$BEAD_ID" ] || [ -z "$PROJECT" ]; then
    echo "Usage: ./claim-complete.sh <bead-id> <project-name> <repo-path> \"<close-reason>\""
    echo ""
    echo "Example:"
    echo "  ./claim-complete.sh clawd-8cu BDV2 /home/ubuntu/repos/bible-drawing-v2 \"All ACs met, E2E passing\""
    exit 1
fi

SCRIPT_DIR="$(dirname "$0")"

echo "=============================================="
echo "  CLAIMING COMPLETION: $BEAD_ID"
echo "=============================================="
echo ""

# Run quality gate validation
echo "Step 1: Running quality gate validation..."
echo ""

if "$SCRIPT_DIR/validate-completion.sh" "$PROJECT" "$REPO_PATH"; then
    echo ""
    echo "Step 2: Quality gates passed, closing bead..."
    echo ""
    
    # Build evidence string
    EVIDENCE="Quality gates validated: $(date '+%Y-%m-%d %H:%M %Z')"
    
    if [ -n "$CLOSE_REASON" ]; then
        FULL_REASON="$CLOSE_REASON

$EVIDENCE"
    else
        FULL_REASON="$EVIDENCE"
    fi
    
    # Close the bead
    bd close "$BEAD_ID" --reason "$FULL_REASON" --json
    
    echo ""
    echo "=============================================="
    echo "  ✅ COMPLETION CLAIMED SUCCESSFULLY"
    echo "=============================================="
    echo "Bead $BEAD_ID is now closed."
    
else
    echo ""
    echo "=============================================="
    echo "  ❌ CANNOT CLAIM COMPLETE"
    echo "=============================================="
    echo ""
    echo "Quality gates not met. Fix the failures above before claiming complete."
    echo ""
    echo "DO NOT:"
    echo "  - Skip failing tests"
    echo "  - Self-validate"
    echo "  - Ignore open issues"
    echo ""
    echo "See: ~/clawd/scheduler/QUALITY-GATES.md"
    exit 1
fi
