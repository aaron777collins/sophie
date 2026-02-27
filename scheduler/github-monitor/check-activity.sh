#!/bin/bash
# GitHub Activity Monitor - Helper script
# Checks for new issues, PRs, comments across Aaron's repos

echo "=== GitHub Activity Check $(date '+%Y-%m-%d %H:%M %Z') ==="

# Key repos to monitor (active ones)
REPOS=(
    "aaron777collins/MinecraftDatapackLanguage"
    "aaron777collins/projects"
    "aaron777collins/portableralph"
    "aaron777collins/melo"
    "aaron777collins/ConnectedDrivingPipelineV4"
    "aaron777collins/sophie"
    "aaron777collins/haos"
)

for repo in "${REPOS[@]}"; do
    echo ""
    echo "--- $repo ---"
    
    # Recent issues (last 24 hours)
    echo "Recent Issues:"
    gh issue list --repo "$repo" --state all --json number,title,author,createdAt,state \
        --jq '.[] | select(.createdAt > (now - 86400 | todate)) | "  #\(.number) [\(.state)] \(.title) (by \(.author.login))"' 2>/dev/null || echo "  (no access or no issues)"
    
    # Recent PRs
    echo "Recent PRs:"
    gh pr list --repo "$repo" --state all --json number,title,author,createdAt,state \
        --jq '.[] | select(.createdAt > (now - 86400 | todate)) | "  #\(.number) [\(.state)] \(.title) (by \(.author.login))"' 2>/dev/null || echo "  (no access or no PRs)"
    
    # Failed CI runs
    echo "Failed CI Runs:"
    gh run list --repo "$repo" --status failure --limit 5 --json databaseId,name,conclusion,createdAt \
        --jq '.[] | "  \(.databaseId): \(.name) - \(.conclusion)"' 2>/dev/null || echo "  (no failures)"
done

echo ""
echo "=== End Check ==="
