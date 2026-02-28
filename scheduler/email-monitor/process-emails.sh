#!/bin/bash
# Email Monitor - Fetches NEW emails since last check
# Uses timestamp to avoid re-reading, with 50 email cap

set -euo pipefail

DB=~/clawd/data/contacts/contacts.db
PROCESSED_FILE=~/clawd/scheduler/email-monitor/processed-emails.txt
LAST_CHECK_FILE=~/clawd/scheduler/email-monitor/last-check.txt
ESCALATIONS_DIR=~/clawd/scheduler/email-monitor/escalations
PM_INBOX=~/clawd/scheduler/inboxes/person-manager

# Ensure files exist
touch "$PROCESSED_FILE"
mkdir -p "$ESCALATIONS_DIR/for-person-manager"

# Get date of last check (for filtering)
if [ -f "$LAST_CHECK_FILE" ]; then
    LAST_CHECK=$(cat "$LAST_CHECK_FILE")
    # Extract just the date part for himalaya filter
    LAST_DATE=$(echo "$LAST_CHECK" | cut -dT -f1)
else
    # First run: check last 2 days
    LAST_DATE=$(date -d '2 days ago' +%Y-%m-%d)
    LAST_CHECK="never"
fi

echo "=== EMAIL MONITOR RUN: $(date -Iseconds) ==="
echo "Last check: $LAST_CHECK"
echo "Filtering emails after: $LAST_DATE"
echo ""

# Create temp file for this run
TEMP_EMAILS=$(mktemp)
trap "rm -f $TEMP_EMAILS" EXIT

echo "=== CHECKING COOLDOWN ==="
CACHE_SCRIPT=~/clawd/scheduler/email-monitor/email-cache.sh

# Check cooldown first
if ! "$CACHE_SCRIPT" cooldown | grep -q "Ready"; then
    echo "RATE LIMITED: In cooldown period, using cached results"
    "$CACHE_SCRIPT" status
    echo ""
    echo "=== CACHED EMAILS ==="
    cat ~/clawd/scheduler/email-monitor/cache/emails.json 2>/dev/null || echo "(no cache)"
else
    echo "=== FETCHING NEW EMAILS (after $LAST_DATE, cap 50) ==="
    
    # Update cooldown timestamp
    date +%s > ~/clawd/scheduler/email-monitor/cache/cooldown.lock
    
    # Fetch from AaronCollins.Info folder - emails AFTER last check date
    echo ""
    echo "--- AaronCollins.Info folder ---"
    himalaya envelope list -f "AaronCollins.Info" --page-size 50 "after $LAST_DATE" 2>/dev/null || echo "(no results or error)"
    
    echo ""
    echo "--- INBOX folder ---"
    himalaya envelope list -f "INBOX" --page-size 20 "after $LAST_DATE" 2>/dev/null || echo "(no results or error)"
fi

echo ""
echo "=== ALREADY PROCESSED (for deduplication backup) ==="
echo "Last 20 processed email IDs:"
tail -20 "$PROCESSED_FILE" | grep -v "^#" | cut -d'|' -f1 || echo "(none yet)"

echo ""
echo "=== TRUSTED SENDERS ==="
sqlite3 "$DB" "SELECT email, owner FROM trusted_senders;" 2>/dev/null || echo "(no trusted_senders table)"

echo ""
echo "=== PENDING RESPONSES WE'RE TRACKING ==="
grep -E "^\|.*\|.*\|" ~/clawd/scheduler/email-monitor/pending-responses.md 2>/dev/null | grep -v "^|--" | grep -v "^| ID" | grep -v "~~" || echo "(none active)"

echo ""
echo "=== ESCALATION STATUS ==="
echo "Items pending for Aaron:"
grep -c "| pending |" "$ESCALATIONS_DIR/for-aaron.md" 2>/dev/null || echo "0"
echo "Items pending for Person Manager:"
ls -1 "$PM_INBOX"/*.json 2>/dev/null | wc -l || echo "0"

echo ""
echo "=== INSTRUCTIONS FOR SONNET ==="
cat << 'INSTRUCTIONS'
You are EYES ONLY. Process the emails above:

1. For EACH email shown:
   - Check if ID is in processed-emails.txt (backup dedup)
   - If already processed → SKIP
   
2. For NEW emails, decide:
   - Obvious spam/marketing → log as 'ignored'
   - Routine automated → log as 'noted'
   - Might need action → add to pending-opus-review.md, log as 'flagged-opus'

3. Log each processed email:
   echo "<email-id>|$(date -Iseconds)|<folder>|<action>" >> processed-emails.txt

4. For flagged items, spawn Opus with full Circle/Counsel thinking

OUTPUT: 
- HEARTBEAT_OK if nothing new/interesting
- Otherwise brief summary of what you processed/flagged

YOU ARE EYES ONLY. DO NOT RESPOND TO EMAILS OR TAKE ACTION.
INSTRUCTIONS

# Update last check timestamp AFTER processing
date +%Y-%m-%dT%H:%M:%S > "$LAST_CHECK_FILE"
