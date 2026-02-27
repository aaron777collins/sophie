#!/bin/bash
# Get repos with failing CI runs in the last 7 days
# For email notifications and self-reflection

SEVEN_DAYS_AGO=$(date -d '7 days ago' +%Y-%m-%dT%H:%M:%SZ)

echo "# Repos with CI failures since $SEVEN_DAYS_AGO" >&2

gh repo list --limit 100 --json nameWithOwner --jq '.[].nameWithOwner' 2>/dev/null | while read repo; do
    # Check for failed runs in last 7 days
    failures=$(gh run list --repo "$repo" --status failure --limit 10 --json createdAt,name,conclusion \
        --jq "[.[] | select(.createdAt >= \"$SEVEN_DAYS_AGO\")] | length" 2>/dev/null)
    
    if [ -n "$failures" ] && [ "$failures" -gt 0 ]; then
        echo "$repo"
        echo "  ⚠ $repo ($failures recent failures)" >&2
    fi
done
