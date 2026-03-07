#!/bin/bash
# MuninnDB Memory Activation Script
# Retrieve relevant memories for a given query

set -euo pipefail

# Configuration
TOKEN_FILE="$HOME/clawd/data/muninndb-token.secret"
API_BASE="http://localhost:8475/api"

# Default values
QUERY=""
LIMIT="5"
MIN_CONFIDENCE="0.0"
VAULT="default"
OUTPUT_FORMAT="human"

# Function to show usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Retrieve relevant memories from MuninnDB for a query."
    echo ""
    echo "OPTIONS:"
    echo "  --query TEXT           Search query (required)"
    echo "  --limit NUMBER         Maximum memories to return (default: 5)"
    echo "  --min-confidence FLOAT Minimum confidence threshold (default: 0.0)"
    echo "  --vault NAME           Vault name (default: default)"
    echo "  --format FORMAT        Output format: human|json (default: human)"
    echo "  --help                Show this help message"
    echo ""
    echo "EXAMPLES:"
    echo "  $0 --query \"Aaron feedback browser automation\""
    echo "  $0 --query \"debugging postgres\" --limit 10 --min-confidence 0.7"
    echo "  $0 --query \"haos issues\" --format json"
    echo ""
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --query)
            QUERY="$2"
            shift 2
            ;;
        --limit)
            LIMIT="$2"
            shift 2
            ;;
        --min-confidence)
            MIN_CONFIDENCE="$2"
            shift 2
            ;;
        --vault)
            VAULT="$2"
            shift 2
            ;;
        --format)
            OUTPUT_FORMAT="$2"
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
if [[ -z "$QUERY" ]]; then
    echo "Error: --query is required" >&2
    usage >&2
    exit 1
fi

# Validate limit
if ! [[ "$LIMIT" =~ ^[0-9]+$ ]] || [[ "$LIMIT" -le 0 ]]; then
    echo "Error: --limit must be a positive integer" >&2
    exit 1
fi

# Validate confidence
if ! [[ "$MIN_CONFIDENCE" =~ ^[0-9]*\.?[0-9]+$ ]] || (( $(echo "$MIN_CONFIDENCE < 0" | bc -l) )) || (( $(echo "$MIN_CONFIDENCE > 1" | bc -l) )); then
    echo "Error: --min-confidence must be a number between 0.0 and 1.0" >&2
    exit 1
fi

# Validate output format
if [[ "$OUTPUT_FORMAT" != "human" && "$OUTPUT_FORMAT" != "json" ]]; then
    echo "Error: --format must be 'human' or 'json'" >&2
    exit 1
fi

# Read bearer token
if [[ ! -f "$TOKEN_FILE" ]]; then
    echo "Error: Bearer token file not found: $TOKEN_FILE" >&2
    echo "Make sure MuninnDB is properly initialized." >&2
    exit 1
fi

TOKEN=$(cat "$TOKEN_FILE")

# Create JSON payload
JSON_PAYLOAD=$(cat <<EOF
{
    "query": "$QUERY",
    "limit": $LIMIT,
    "min_confidence": $MIN_CONFIDENCE,
    "vault": "$VAULT"
}
EOF
)

if [[ "$OUTPUT_FORMAT" == "human" ]]; then
    echo "Searching MuninnDB for: '$QUERY'"
    echo "Limit: $LIMIT, Min confidence: $MIN_CONFIDENCE, Vault: $VAULT"
    echo ""
fi

# Activate memories
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
    -X POST \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$JSON_PAYLOAD" \
    "$API_BASE/activate" 2>/dev/null)

# Extract response body and status
HTTP_BODY=$(echo "$RESPONSE" | sed '$d')
HTTP_STATUS=$(echo "$RESPONSE" | tail -n1 | sed 's/.*HTTP_STATUS://')

# Check if request was successful
if [[ "$HTTP_STATUS" =~ ^2[0-9][0-9]$ ]]; then
    if [[ "$OUTPUT_FORMAT" == "json" ]]; then
        echo "$HTTP_BODY"
    else
        echo "✅ Found memories:"
        echo ""
        
        # Parse and display memories in human-readable format
        if command -v jq >/dev/null 2>&1; then
            # Use jq for nice formatting if available
            MEMORY_COUNT=$(echo "$HTTP_BODY" | jq '.memories | length' 2>/dev/null || echo "0")
            
            if [[ "$MEMORY_COUNT" == "0" ]]; then
                echo "No memories found matching your query."
                echo ""
                echo "💡 Try:"
                echo "  - Broader search terms"
                echo "  - Lower confidence threshold: --min-confidence 0.3"
                echo "  - Check available memories: list.sh"
            else
                echo "$HTTP_BODY" | jq -r '.memories[] | 
                    "🧠 Memory ID: \(.id // "unknown")",
                    "📝 Concept: \(.concept // "No concept")",
                    "💭 Content: \(.content // "No content")",
                    "🏷️  Tags: \(.tags // [] | join(", "))",
                    "📊 Confidence: \(.confidence // 0)",
                    "⏰ Created: \(.created_at // "unknown")",
                    "🔗 Score: \(.activation_score // "N/A")",
                    ""' 2>/dev/null
            fi
        else
            # Fallback without jq
            echo "$HTTP_BODY"
            echo ""
            echo "💡 Install jq for better formatting: apt-get install jq"
        fi
    fi
else
    if [[ "$OUTPUT_FORMAT" == "human" ]]; then
        echo "❌ Failed to activate memories (HTTP $HTTP_STATUS)" >&2
        echo "Response: $HTTP_BODY" >&2
    else
        echo "{\"error\": \"HTTP $HTTP_STATUS\", \"response\": \"$HTTP_BODY\"}"
    fi
    exit 1
fi

if [[ "$OUTPUT_FORMAT" == "human" ]]; then
    echo ""
    echo "💡 To store a new memory, use:"
    echo "   store.sh --concept \"Your Concept\" --content \"Your content\""
fi