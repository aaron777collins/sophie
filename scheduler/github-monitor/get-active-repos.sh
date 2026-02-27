#!/bin/bash
# Get repos with issues opened in the last 6 months
# Output: list of owner/repo, one per line

SIX_MONTHS_AGO=$(date -d '6 months ago' +%Y-%m-%d)

echo "# Repos with issues opened since $SIX_MONTHS_AGO" >&2

# Get all repos, then check each for recent issues
gh repo list --limit 100 --json nameWithOwner --jq '.[].nameWithOwner' 2>/dev/null | while read repo; do
    # Check if repo has issues opened in last 6 months
    issue_count=$(gh issue list --repo "$repo" --state all --json createdAt \
        --jq "[.[] | select(.createdAt >= \"$SIX_MONTHS_AGO\")] | length" 2>/dev/null)
    
    if [ -n "$issue_count" ] && [ "$issue_count" -gt 0 ]; then
        echo "$repo"
        echo "  ✓ $repo ($issue_count recent issues)" >&2
    fi
done
