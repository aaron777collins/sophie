#!/bin/bash
# Email Monitor - Improved with Deduplication
# Gets new emails, deduplicates, and formats for AI processing

set -euo pipefail

DB=~/clawd/data/contacts/contacts.db
PROCESSED_FILE=~/clawd/scheduler/email-monitor/processed-emails.txt
LAST_CHECK_FILE=~/clawd/scheduler/email-monitor/last-check.txt
ESCALATIONS_DIR=~/clawd/scheduler/email-monitor/escalations
PM_INBOX=~/clawd/scheduler/inboxes/person-manager

# Ensure files exist
touch "$PROCESSED_FILE"
mkdir -p "$ESCALATIONS_DIR/for-person-manager"

# Get timestamp of last check
if [ -f "$LAST_CHECK_FILE" ]; then
    LAST_CHECK=$(cat "$LAST_CHECK_FILE")
else
    LAST_CHECK=$(date -d '1 hour ago' +%Y-%m-%dT%H:%M:%S)
fi

echo "=== EMAIL MONITOR RUN: $(date -Iseconds) ==="
echo "Last check: $LAST_CHECK"
echo ""

# Get raw email list (with IDs) from both folders
echo "=== FETCHING EMAILS ==="

# Create temp file for this run
TEMP_EMAILS=$(mktemp)
trap "rm -f $TEMP_EMAILS" EXIT

# Fetch from AaronCollins.Info folder (newer emails go here)
echo "Fetching from AaronCollins.Info folder..."
himalaya envelope list -f "AaronCollins.Info" --page-size 20 2>/dev/null > "$TEMP_EMAILS" || true

# Also check INBOX for older stuff
echo "Fetching from INBOX folder..."
himalaya envelope list -f "INBOX" --page-size 10 2>/dev/null >> "$TEMP_EMAILS" || true

echo ""
echo "=== RAW EMAIL LIST ==="
cat "$TEMP_EMAILS"

echo ""
echo "=== DEDUPLICATION CHECK ==="
echo "Previously processed emails (last 50):"
tail -50 "$PROCESSED_FILE" | grep -v "^#" | cut -d'|' -f1 | head -20

echo ""
echo "=== TRUSTED SENDERS ==="
sqlite3 "$DB" "SELECT email, owner FROM trusted_senders;" 2>/dev/null || echo "(no trusted_senders table)"

echo ""
echo "=== PENDING RESPONSES WE'RE TRACKING ==="
cat ~/clawd/scheduler/email-monitor/pending-responses.md 2>/dev/null | grep -E "^\|.*\|.*\|" | grep -v "^|--" | grep -v "^| ID" || echo "(none)"

echo ""
echo "=== ESCALATION QUEUES ==="
echo "Items pending for Aaron:"
grep -c "| pending |" "$ESCALATIONS_DIR/for-aaron.md" 2>/dev/null || echo "0"
echo ""
echo "Items pending for Person Manager:"
ls -1 "$PM_INBOX"/*.json 2>/dev/null | wc -l || echo "0"

echo ""
echo "=== INSTRUCTIONS FOR AI ==="
cat << 'INSTRUCTIONS'
Based on the above:
1. For EACH email shown, check if its ID is in processed-emails.txt
2. If already processed → SKIP (say "Already seen: <id>")
3. If NEW, evaluate using IDENTITY.md rules:
   - Spam/marketing → Log as "ignored" 
   - Routine/automated → Log as "noted"
   - Needs Aaron's attention → Add to for-aaron.md, log as "flagged-aaron"
   - CI/CD failures or project issues → Create PM inbox message, log as "escalated-pm"
4. For any action, append to processed-emails.txt:
   echo "<email-id>|$(date -Iseconds)|<folder>|<action>" >> processed-emails.txt

OUTPUT: Say HEARTBEAT_OK if nothing new/interesting. Otherwise report what you did.
INSTRUCTIONS

# Update last check timestamp
date +%Y-%m-%dT%H:%M:%S > "$LAST_CHECK_FILE"
