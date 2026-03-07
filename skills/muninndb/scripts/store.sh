#!/bin/bash
# MuninnDB Memory Storage Script
# Store a memory with concept, content, tags, and confidence level

set -euo pipefail

# Configuration
TOKEN_FILE="$HOME/clawd/data/muninndb-token.secret"
API_BASE="http://localhost:8475/api"

# Default values
CONCEPT=""
CONTENT=""
TAGS=""
CONFIDENCE="0.7"
VAULT="default"

# Function to show usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Store a memory in MuninnDB with concept, content, tags, and confidence."
    echo ""
    echo "OPTIONS:"
    echo "  --concept TEXT      Memory concept/title (required)"
    echo "  --content TEXT      Memory content/details (required)"
    echo "  --tags TEXT         Comma-separated tags (optional)"
    echo "  --confidence FLOAT  Confidence level 0.0-1.0 (default: 0.7)"
    echo "  --vault NAME        Vault name (default: default)"
    echo "  --help             Show this help message"
    echo ""
    echo "EXAMPLES:"
    echo "  $0 --concept \"Aaron's Feedback\" --content \"Prefers direct communication\""
    echo "  $0 --concept \"Bug Fix\" --content \"Fixed by updating dependency\" --tags \"bug,fix\" --confidence 1.0"
    echo ""
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --concept)
            CONCEPT="$2"
            shift 2
            ;;
        --content)
            CONTENT="$2"
            shift 2
            ;;
        --tags)
            TAGS="$2"
            shift 2
            ;;
        --confidence)
            CONFIDENCE="$2"
            shift 2
            ;;
        --vault)
            VAULT="$2"
            shift 2
            ;;
        --help)
            usage
            exit 0
            ;;
        *)
            echo "Error: Unknown option $1" >&2
            usage >&2
            exit 1
            ;;
    esac
done

# Validate required arguments
if [[ -z "$CONCEPT" ]]; then
    echo "Error: --concept is required" >&2
    usage >&2
    exit 1
fi

if [[ -z "$CONTENT" ]]; then
    echo "Error: --content is required" >&2
    usage >&2
    exit 1
fi

# Validate confidence level
if ! [[ "$CONFIDENCE" =~ ^[0-9]*\.?[0-9]+$ ]] || (( $(echo "$CONFIDENCE < 0" | bc -l) )) || (( $(echo "$CONFIDENCE > 1" | bc -l) )); then
    echo "Error: --confidence must be a number between 0.0 and 1.0" >&2
    exit 1
fi

# Read bearer token
if [[ ! -f "$TOKEN_FILE" ]]; then
    echo "Error: Bearer token file not found: $TOKEN_FILE" >&2
    echo "Make sure MuninnDB is properly initialized." >&2
    exit 1
fi

TOKEN=$(cat "$TOKEN_FILE")

# Convert tags to array format for JSON
TAGS_JSON="[]"
if [[ -n "$TAGS" ]]; then
    # Split tags by comma and create JSON array
    IFS=',' read -ra TAG_ARRAY <<< "$TAGS"
    TAGS_JSON="["
    for i in "${!TAG_ARRAY[@]}"; do
        # Trim whitespace and add quotes
        TAG=$(echo "${TAG_ARRAY[$i]}" | xargs)
        if [[ $i -gt 0 ]]; then
            TAGS_JSON="${TAGS_JSON},"
        fi
        TAGS_JSON="${TAGS_JSON}\"${TAG}\""
    done
    TAGS_JSON="${TAGS_JSON}]"
fi

# Create JSON payload
JSON_PAYLOAD=$(cat <<EOF
{
    "concept": "$CONCEPT",
    "content": "$CONTENT",
    "tags": $TAGS_JSON,
    "confidence": $CONFIDENCE,
    "vault": "$VAULT"
}
EOF
)

echo "Storing memory in MuninnDB..."
echo "Concept: $CONCEPT"
echo "Content: $CONTENT"
echo "Tags: $TAGS"
echo "Confidence: $CONFIDENCE"
echo "Vault: $VAULT"
echo ""

# Store the memory
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
    -X POST \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$JSON_PAYLOAD" \
    "$API_BASE/engrams" 2>/dev/null)

# Extract response body and status
HTTP_BODY=$(echo "$RESPONSE" | sed '$d')
HTTP_STATUS=$(echo "$RESPONSE" | tail -n1 | sed 's/.*HTTP_STATUS://')

# Check if request was successful
if [[ "$HTTP_STATUS" =~ ^2[0-9][0-9]$ ]]; then
    echo "✅ Memory stored successfully!"
    echo "Response: $HTTP_BODY"
    
    # Try to extract memory ID if present
    if command -v jq >/dev/null 2>&1; then
        MEMORY_ID=$(echo "$HTTP_BODY" | jq -r '.id // empty' 2>/dev/null)
        if [[ -n "$MEMORY_ID" ]]; then
            echo "Memory ID: $MEMORY_ID"
        fi
    fi
else
    echo "❌ Failed to store memory (HTTP $HTTP_STATUS)" >&2
    echo "Response: $HTTP_BODY" >&2
    exit 1
fi

echo ""
echo "💡 To retrieve similar memories, use:"
echo "   activate.sh --query \"$CONCEPT\""