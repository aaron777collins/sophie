#!/bin/bash
# Email Monitor - Helper script for cron job
# Gets new emails and formats them for AI processing

DB=~/clawd/data/contacts/contacts.db
LAST_CHECK_FILE=~/clawd/scheduler/email-monitor/last-check.txt

# Get timestamp of last check (default: 1 hour ago)
if [ -f "$LAST_CHECK_FILE" ]; then
    LAST_CHECK=$(cat "$LAST_CHECK_FILE")
else
    LAST_CHECK=$(date -d '1 hour ago' +%Y-%m-%d)
fi

# Get recent emails from BOTH folders
# NOTE: Newer emails go to "AaronCollins.Info" folder, older ones to "INBOX"
echo "=== RECENT EMAILS - AaronCollins.Info folder (last 20) ==="
himalaya envelope list -f "AaronCollins.Info" --page-size 20 2>/dev/null

echo ""
echo "=== RECENT EMAILS - INBOX folder (last 10) ==="
himalaya envelope list -f "INBOX" --page-size 10 2>/dev/null

echo ""
echo "=== TRUSTED SENDERS ==="
sqlite3 "$DB" "SELECT email, owner FROM trusted_senders;"

echo ""
echo "=== SPAM PATTERNS TO SKIP ==="
echo "- Tim Hortons"
echo "- Bikini Village"
echo "- Generic marketing"
echo "- Pipeline progress notifications (unless STALLED/FAILED)"

# Update last check
date +%Y-%m-%dT%H:%M:%S > "$LAST_CHECK_FILE"
