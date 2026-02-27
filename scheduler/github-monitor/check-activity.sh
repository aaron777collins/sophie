#!/bin/bash
# GitHub Activity Monitor - Dynamic repo discovery
# Checks repos with recent issues (last 6 months) for new activity

CACHE_FILE=~/clawd/scheduler/github-monitor/active-repos.cache
CACHE_MAX_AGE=86400  # Refresh cache every 24 hours

echo "=== GitHub Activity Check $(date '+%Y-%m-%d %H:%M %Z') ==="

# Refresh cache if stale or missing
if [ ! -f "$CACHE_FILE" ] || [ $(($(date +%s) - $(stat -c %Y "$CACHE_FILE" 2>/dev/null || echo 0))) -gt $CACHE_MAX_AGE ]; then
    echo "Refreshing active repos cache..."
    ~/clawd/scheduler/github-monitor/get-active-repos.sh > "$CACHE_FILE" 2>/dev/null
    echo "Cache updated: $(wc -l < "$CACHE_FILE") active repos"
fi

# Read repos from cache (skip comment lines)
REPOS=$(grep -v '^#' "$CACHE_FILE" | grep -v '^$')

if [ -z "$REPOS" ]; then
    echo "No active repos found."
    exit 0
fi

echo ""
echo "Monitoring $(echo "$REPOS" | wc -l) repos with recent activity..."
echo ""

# Check each active repo
echo "$REPOS" | while read repo; do
    [ -z "$repo" ] && continue
    
    echo "--- $repo ---"
    
    # Recent issues (last 24 hours)
    echo "Recent Issues (24h):"
    gh issue list --repo "$repo" --state all --json number,title,author,createdAt,state \
        --jq '.[] | select(.createdAt > (now - 86400 | todate)) | "  #\(.number) [\(.state)] \(.title) (by \(.author.login))"' 2>/dev/null || echo "  (none)"
    
    # Recent PRs (last 24 hours)
    echo "Recent PRs (24h):"
    gh pr list --repo "$repo" --state all --json number,title,author,createdAt,state \
        --jq '.[] | select(.createdAt > (now - 86400 | todate)) | "  #\(.number) [\(.state)] \(.title) (by \(.author.login))"' 2>/dev/null || echo "  (none)"
    
    # Issue comments in last 24h (activity on existing issues)
    echo "Recent Comments:"
    gh api "repos/$repo/issues/comments?since=$(date -d '24 hours ago' -u +%Y-%m-%dT%H:%M:%SZ)&per_page=5" \
        --jq '.[] | "  \(.user.login) on #\(.issue_url | split("/") | last): \(.body | .[0:60])..."' 2>/dev/null | head -5 || echo "  (none)"
    
    echo ""
done

echo "=== End Check ==="
