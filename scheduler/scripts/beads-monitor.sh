#!/bin/bash
# Beads Monitoring Script
# Run via cron to detect stalled work and system issues
# Usage: ./beads-monitor.sh [--alert]

set -e

CLAWD_DIR="${CLAWD_DIR:-$HOME/clawd}"
ALERT_FILE="$CLAWD_DIR/scheduler/inboxes/person-manager/beads-alert-$(date +%Y%m%d-%H%M).json"
ALERT_MODE=false

if [[ "$1" == "--alert" ]]; then
    ALERT_MODE=true
fi

cd "$CLAWD_DIR"

echo "========================================"
echo "BEADS MONITORING REPORT"
echo "Time: $(date)"
echo "========================================"
echo ""

ISSUES_FOUND=0

# Health Check
echo "=== HEALTH CHECK ==="
DOCTOR_OUTPUT=$(bd doctor 2>&1)
if echo "$DOCTOR_OUTPUT" | grep -q "✖ [1-9]"; then
    echo "❌ HEALTH: Errors detected"
    echo "$DOCTOR_OUTPUT" | grep -E "(✖|error)"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
elif echo "$DOCTOR_OUTPUT" | grep -q "⚠ [1-9]"; then
    echo "⚠️ HEALTH: Warnings detected"
    echo "$DOCTOR_OUTPUT" | grep -E "(⚠|warning)"
else
    echo "✅ HEALTH: All checks passed"
fi
echo ""

# Dolt Server Check
echo "=== DOLT SERVER ==="
if pgrep -f "dolt sql-server" >/dev/null; then
    echo "✅ DOLT: Server running"
else
    echo "❌ DOLT: Server NOT running"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
    
    # Auto-recovery attempt
    echo "Attempting auto-recovery..."
    cd "$CLAWD_DIR/.beads/dolt"
    nohup dolt sql-server --host 127.0.0.1 --port 3307 > /tmp/dolt.log 2>&1 &
    sleep 2
    if pgrep -f "dolt sql-server" >/dev/null; then
        echo "✅ DOLT: Auto-recovery successful"
    else
        echo "❌ DOLT: Auto-recovery FAILED - manual intervention needed"
    fi
fi
cd "$CLAWD_DIR"
echo ""

# Issue Statistics
echo "=== ISSUE STATISTICS ==="
TOTAL=$(bd list --all --json 2>/dev/null | jq 'length' || echo "0")
OPEN=$(bd list --status open --json 2>/dev/null | jq 'length' || echo "0")
IN_PROGRESS=$(bd list --status in_progress --json 2>/dev/null | jq 'length' || echo "0")
BLOCKED=$(bd list --status blocked --json 2>/dev/null | jq 'length' || echo "0")
NEEDS_VAL=$(bd list --status needs-validation --json 2>/dev/null | jq 'length' || echo "0")
NEEDS_FIX=$(bd list --status needs-fix --json 2>/dev/null | jq 'length' || echo "0")
CLOSED=$(bd list --status closed --json 2>/dev/null | jq 'length' || echo "0")

echo "Total:            $TOTAL"
echo "Open:             $OPEN"
echo "In Progress:      $IN_PROGRESS"
echo "Blocked:          $BLOCKED"
echo "Needs Validation: $NEEDS_VAL"
echo "Needs Fix:        $NEEDS_FIX"
echo "Closed:           $CLOSED"
echo ""

# Stale Issue Detection (in_progress > 8 hours)
echo "=== STALE ISSUE CHECK (in_progress > 8h) ==="
STALE_THRESHOLD=$((8 * 60 * 60))  # 8 hours in seconds
NOW=$(date +%s)

STALE_ISSUES=$(bd list --status in_progress --json 2>/dev/null | jq -r --argjson now "$NOW" --argjson threshold "$STALE_THRESHOLD" '
    .[] | 
    select((.updated_at | fromdateiso8601) < ($now - $threshold)) | 
    "\(.id): \(.title) (last updated: \(.updated_at))"
' 2>/dev/null || echo "")

if [ -n "$STALE_ISSUES" ]; then
    echo "⚠️ STALE ISSUES FOUND:"
    echo "$STALE_ISSUES"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
    echo "✅ No stale in_progress issues"
fi
echo ""

# Blocked Issues
echo "=== BLOCKED ISSUES ==="
if [ "$BLOCKED" -gt 0 ]; then
    echo "⚠️ $BLOCKED blocked issue(s):"
    bd list --status blocked --json 2>/dev/null | jq -r '.[] | "  \(.id): \(.title)"'
else
    echo "✅ No blocked issues"
fi
echo ""

# Validation Queue
echo "=== VALIDATION QUEUE ==="
if [ "$NEEDS_VAL" -gt 0 ]; then
    echo "📋 $NEEDS_VAL issue(s) awaiting validation:"
    bd list --status needs-validation --json 2>/dev/null | jq -r '.[] | "  \(.id): \(.title)"'
else
    echo "✅ No pending validations"
fi
echo ""

# Failed Validations (needs-fix)
echo "=== FAILED VALIDATIONS ==="
if [ "$NEEDS_FIX" -gt 0 ]; then
    echo "❌ $NEEDS_FIX issue(s) need fixing:"
    bd list --status needs-fix --json 2>/dev/null | jq -r '.[] | "  \(.id): \(.title)"'
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
    echo "✅ No failed validations"
fi
echo ""

# Git Status
echo "=== GIT STATUS ==="
if git status --porcelain | grep -q .; then
    echo "⚠️ Uncommitted changes:"
    git status --short | head -10
else
    echo "✅ Working tree clean"
fi
echo ""

# Summary
echo "========================================"
echo "SUMMARY"
echo "========================================"
if [ "$ISSUES_FOUND" -eq 0 ]; then
    echo "✅ ALL SYSTEMS OPERATIONAL"
else
    echo "⚠️ $ISSUES_FOUND ISSUE(S) NEED ATTENTION"
fi
echo ""

# Create alert if needed
if [ "$ALERT_MODE" = true ] && [ "$ISSUES_FOUND" -gt 0 ]; then
    mkdir -p "$(dirname "$ALERT_FILE")"
    cat > "$ALERT_FILE" << EOF
{
    "type": "beads-monitor-alert",
    "timestamp": "$(date -Iseconds)",
    "issues_found": $ISSUES_FOUND,
    "summary": {
        "total": $TOTAL,
        "open": $OPEN,
        "in_progress": $IN_PROGRESS,
        "blocked": $BLOCKED,
        "needs_validation": $NEEDS_VAL,
        "needs_fix": $NEEDS_FIX,
        "stale_issues": $(echo "$STALE_ISSUES" | grep -c . || echo 0)
    },
    "action_required": true
}
EOF
    echo "Alert created: $ALERT_FILE"
fi

exit $ISSUES_FOUND
