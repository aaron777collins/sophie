#!/bin/bash
# check-evidence.sh - Verify all required evidence exists for a bead
# Usage: ./check-evidence.sh <bead-id>
# Example: ./check-evidence.sh clawd-abc123

set -e

BEAD_ID="${1:?Usage: $0 <bead-id>}"
SCREENSHOT_DIR="scheduler/validation/screenshots/${BEAD_ID}"

echo "🔍 Checking evidence for ${BEAD_ID}"
echo "============================================"

PASS=0
FAIL=0

# Check 1: Bead exists
echo ""
echo "1️⃣  Checking bead exists..."
if bd show "${BEAD_ID}" --json >/dev/null 2>&1; then
    echo "   ✅ Bead exists"
    ((PASS++))
else
    echo "   ❌ Bead not found"
    ((FAIL++))
fi

# Check 2: Screenshot directories exist
echo ""
echo "2️⃣  Checking screenshot directories..."
for viewport in desktop tablet mobile; do
    if [ -d "${SCREENSHOT_DIR}/${viewport}" ] && [ "$(ls -A "${SCREENSHOT_DIR}/${viewport}" 2>/dev/null)" ]; then
        echo "   ✅ ${viewport}: $(ls "${SCREENSHOT_DIR}/${viewport}" | wc -l) files"
        ((PASS++))
    else
        echo "   ❌ ${viewport}: MISSING or EMPTY"
        ((FAIL++))
    fi
done

# Check 3: Bead has notes with evidence
echo ""
echo "3️⃣  Checking bead has evidence notes..."
NOTES=$(bd show "${BEAD_ID}" --json 2>/dev/null | jq -r '.notes // empty' || echo "")
if echo "${NOTES}" | grep -qi "e2e\|screenshot\|test"; then
    echo "   ✅ Evidence keywords found in notes"
    ((PASS++))
else
    echo "   ⚠️  No evidence keywords in notes (E2E/screenshot/test)"
    ((FAIL++))
fi

# Check 4: E2E test output in notes
echo ""
echo "4️⃣  Checking for E2E test evidence..."
if echo "${NOTES}" | grep -qi "pnpm test:e2e\|Exit: 0\|E2E"; then
    echo "   ✅ E2E test evidence found"
    ((PASS++))
else
    echo "   ❌ No E2E test evidence (pnpm test:e2e output required)"
    ((FAIL++))
fi

# Check 5: Bead status
echo ""
echo "5️⃣  Checking bead status..."
STATUS=$(bd show "${BEAD_ID}" --json 2>/dev/null | jq -r '.status' || echo "unknown")
echo "   📋 Current status: ${STATUS}"
if [ "${STATUS}" = "needs-validation" ]; then
    echo "   ✅ Ready for validation"
    ((PASS++))
elif [ "${STATUS}" = "in_progress" ]; then
    echo "   ⚠️  Still in progress"
    ((FAIL++))
else
    echo "   ℹ️  Status: ${STATUS}"
fi

# Summary
echo ""
echo "============================================"
echo "📊 EVIDENCE CHECK SUMMARY"
echo "============================================"
echo "   ✅ Passed: ${PASS}"
echo "   ❌ Failed: ${FAIL}"
echo ""

if [ ${FAIL} -eq 0 ]; then
    echo "🎉 ALL EVIDENCE PRESENT - Ready for validation"
    exit 0
else
    echo "⚠️  MISSING EVIDENCE - Fix before requesting validation"
    echo ""
    echo "Required evidence:"
    echo "  1. Screenshots at all 3 viewports"
    echo "  2. E2E test output in bead notes"
    echo "  3. Bead status = needs-validation"
    exit 1
fi
