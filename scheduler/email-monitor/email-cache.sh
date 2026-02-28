#!/bin/bash
# Email Cache & Cooldown System
# Prevents hammering IMAP server with rate limiting protection

set -euo pipefail

CACHE_DIR=~/clawd/scheduler/email-monitor/cache
COOLDOWN_FILE="$CACHE_DIR/cooldown.lock"
CACHE_FILE="$CACHE_DIR/emails.json"
COOLDOWN_SECONDS=300  # 5 minute minimum between IMAP checks
MAX_CACHE_AGE=600     # 10 minute cache validity

mkdir -p "$CACHE_DIR"

# Check if we're in cooldown
check_cooldown() {
    if [ -f "$COOLDOWN_FILE" ]; then
        LAST_CHECK=$(cat "$COOLDOWN_FILE")
        NOW=$(date +%s)
        AGE=$((NOW - LAST_CHECK))
        if [ $AGE -lt $COOLDOWN_SECONDS ]; then
            REMAINING=$((COOLDOWN_SECONDS - AGE))
            echo "COOLDOWN: ${REMAINING}s remaining (last check ${AGE}s ago)"
            return 1
        fi
    fi
    return 0
}

# Update cooldown timestamp
update_cooldown() {
    date +%s > "$COOLDOWN_FILE"
}

# Check if cache is still valid
cache_valid() {
    if [ ! -f "$CACHE_FILE" ]; then
        return 1
    fi
    CACHE_AGE=$(($(date +%s) - $(stat -c %Y "$CACHE_FILE")))
    if [ $CACHE_AGE -gt $MAX_CACHE_AGE ]; then
        return 1
    fi
    return 0
}

# Get emails (from cache or fresh)
get_emails() {
    local FOLDER="${1:-INBOX}"
    local FORCE="${2:-false}"
    
    if [ "$FORCE" != "true" ] && cache_valid; then
        echo "CACHED: Using cached results ($(stat -c %Y "$CACHE_FILE" | xargs -I{} date -d @{} +%H:%M:%S))"
        cat "$CACHE_FILE"
        return 0
    fi
    
    if ! check_cooldown; then
        if [ -f "$CACHE_FILE" ]; then
            echo "COOLDOWN: Returning stale cache"
            cat "$CACHE_FILE"
        else
            echo "COOLDOWN: No cache available, please wait"
        fi
        return 1
    fi
    
    echo "FETCHING: Getting fresh emails from $FOLDER..."
    update_cooldown
    
    # Fetch and cache
    RESULT=$(himalaya envelope list -f "$FOLDER" --page-size 30 2>&1) || true
    
    if echo "$RESULT" | grep -qi "error\|limit\|login"; then
        echo "ERROR: $RESULT"
        # If we have cache, return it
        if [ -f "$CACHE_FILE" ]; then
            echo "FALLBACK: Returning cached results"
            cat "$CACHE_FILE"
        fi
        return 1
    fi
    
    echo "$RESULT" > "$CACHE_FILE"
    echo "$RESULT"
}

# List cache status
status() {
    echo "=== Email Cache Status ==="
    if [ -f "$COOLDOWN_FILE" ]; then
        LAST=$(cat "$COOLDOWN_FILE")
        AGE=$(($(date +%s) - LAST))
        echo "Last IMAP check: ${AGE}s ago ($(date -d @$LAST +%H:%M:%S))"
        if [ $AGE -lt $COOLDOWN_SECONDS ]; then
            echo "Cooldown: $((COOLDOWN_SECONDS - AGE))s remaining"
        else
            echo "Cooldown: Ready"
        fi
    else
        echo "Last check: Never"
    fi
    
    if [ -f "$CACHE_FILE" ]; then
        CACHE_AGE=$(($(date +%s) - $(stat -c %Y "$CACHE_FILE")))
        echo "Cache age: ${CACHE_AGE}s"
        echo "Cache valid: $([ $CACHE_AGE -lt $MAX_CACHE_AGE ] && echo 'Yes' || echo 'No (stale)')"
        echo "Cached emails: $(wc -l < "$CACHE_FILE") lines"
    else
        echo "Cache: Empty"
    fi
}

# Clear cache and cooldown
clear() {
    rm -f "$CACHE_FILE" "$COOLDOWN_FILE"
    echo "Cache and cooldown cleared"
}

# Main command dispatcher
case "${1:-status}" in
    get)
        get_emails "${2:-INBOX}" "${3:-false}"
        ;;
    status)
        status
        ;;
    clear)
        clear
        ;;
    cooldown)
        check_cooldown && echo "Ready" || true
        ;;
    *)
        echo "Usage: $0 {get [folder] [force]|status|clear|cooldown}"
        ;;
esac
