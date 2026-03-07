#!/bin/bash
# MuninnDB Memory Listing Script
# List recent memories from MuninnDB

set -euo pipefail

# Configuration
TOKEN_FILE="$HOME/clawd/data/muninndb-token.secret"
API_BASE="http://localhost:8475/api"

# Default values
LIMIT="10"
VAULT="default"
OUTPUT_FORMAT="human"
SORT_BY="created"  # created, confidence, concept
ORDER="desc"       # desc, asc

# Function to show usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "List recent memories from MuninnDB."
    echo ""
    echo "OPTIONS:"
    echo "  --recent NUMBER        Number of recent memories (default: 10)"
    echo "  --limit NUMBER         Alias for --recent"
    echo "  --vault NAME           Vault name (default: default)"
    echo "  --sort FIELD           Sort by: created|confidence|concept (default: created)"
    echo "  --order ORDER          Sort order: desc|asc (default: desc)"
    echo "  --format FORMAT        Output format: human|json|csv (default: human)"
    echo "  --help                Show this help message"
    echo ""
    echo "EXAMPLES:"
    echo "  $0                           # List 10 most recent memories"
    echo "  $0 --recent 20               # List 20 most recent memories"
    echo "  $0 --sort confidence         # Sort by confidence (highest first)"
    echo "  $0 --format json             # JSON output"
    echo "  $0 --format csv              # CSV output"
    echo ""
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --recent|--limit)
            LIMIT="$2"
            shift 2
            ;;
        --vault)
            VAULT="$2"
            shift 2
            ;;
        --sort)
            SORT_BY="$2"
            shift 2
            ;;
        --order)
            ORDER="$2"
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

# Validate limit
if ! [[ "$LIMIT" =~ ^[0-9]+$ ]] || [[ "$LIMIT" -le 0 ]]; then
    echo "Error: --recent/--limit must be a positive integer" >&2
    exit 1
fi

# Validate sort field
if [[ "$SORT_BY" != "created" && "$SORT_BY" != "confidence" && "$SORT_BY" != "concept" ]]; then
    echo "Error: --sort must be 'created', 'confidence', or 'concept'" >&2
    exit 1
fi

# Validate order
if [[ "$ORDER" != "desc" && "$ORDER" != "asc" ]]; then
    echo "Error: --order must be 'desc' or 'asc'" >&2
    exit 1
fi

# Validate output format
if [[ "$OUTPUT_FORMAT" != "human" && "$OUTPUT_FORMAT" != "json" && "$OUTPUT_FORMAT" != "csv" ]]; then
    echo "Error: --format must be 'human', 'json', or 'csv'" >&2
    exit 1
fi

# Read bearer token
if [[ ! -f "$TOKEN_FILE" ]]; then
    echo "Error: Bearer token file not found: $TOKEN_FILE" >&2
    echo "Make sure MuninnDB is properly initialized." >&2
    exit 1
fi

TOKEN=$(cat "$TOKEN_FILE")

if [[ "$OUTPUT_FORMAT" == "human" ]]; then
    echo "📋 Listing MuninnDB memories"
    echo "Vault: $VAULT, Limit: $LIMIT, Sort: $SORT_BY ($ORDER)"
    echo ""
fi

# List memories (using a generic GET request to memory endpoint)
# Note: The actual API might differ, we'll construct query parameters
QUERY_PARAMS="limit=$LIMIT&vault=$VAULT&sort=$SORT_BY&order=$ORDER"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
    -H "Authorization: Bearer $TOKEN" \
    "$API_BASE/engrams?$QUERY_PARAMS" 2>/dev/null)

# Extract response body and status
HTTP_BODY=$(echo "$RESPONSE" | sed '$d')
HTTP_STATUS=$(echo "$RESPONSE" | tail -n1 | sed 's/.*HTTP_STATUS://')

# Check if request was successful
if [[ "$HTTP_STATUS" =~ ^2[0-9][0-9]$ ]]; then
    case "$OUTPUT_FORMAT" in
        "json")
            echo "$HTTP_BODY"
            ;;
        "csv")
            if command -v jq >/dev/null 2>&1; then
                echo "ID,Concept,Content,Tags,Confidence,Created,Updated"
                echo "$HTTP_BODY" | jq -r '.memories[]? // .[]? // . | 
                    [
                        .id // "unknown",
                        (.concept // "No concept" | gsub(","; ";")),
                        (.content // "No content" | gsub(","; ";")),
                        (.tags // [] | join(";")),
                        .confidence // 0,
                        .created_at // "unknown",
                        .updated_at // "unknown"
                    ] | @csv' 2>/dev/null || echo "Error parsing JSON for CSV output"
            else
                echo "Error: jq required for CSV output" >&2
                echo "Install with: apt-get install jq" >&2
                exit 1
            fi
            ;;
        "human")
            if command -v jq >/dev/null 2>&1; then
                # Parse response and determine structure
                MEMORY_COUNT=$(echo "$HTTP_BODY" | jq '.engrams | length // (.total // 0)' 2>/dev/null)
                
                if [[ "$MEMORY_COUNT" == "null" || "$MEMORY_COUNT" == "0" ]]; then
                    echo "No memories found in vault '$VAULT'"
                    echo ""
                    echo "💡 To create your first memory:"
                    echo "   store.sh --concept \"My First Memory\" --content \"Hello MuninnDB!\""
                else
                    echo "Found $MEMORY_COUNT memories:"
                    echo ""
                    
                    # Format memories nicely
                    echo "$HTTP_BODY" | jq -r '
                        .engrams | 
                        to_entries | 
                        .[] | 
                        "[\(.key + 1)] 🧠 \(.value.concept // "No concept")",
                        "    💭 \(.value.content // "No content")",
                        "    🏷️  \(.value.tags // [] | if length > 0 then join(", ") else "No tags" end)",
                        "    📊 Confidence: \(.value.confidence // 0)",
                        "    🆔 ID: \(.value.id // "unknown")",
                        "    ⏰ Created: \(.value.created_at // "unknown")",
                        ""' 2>/dev/null || {
                        # Fallback if jq parsing fails
                        echo "Raw response (jq parsing failed):"
                        echo "$HTTP_BODY"
                    }
                fi
            else
                echo "Raw JSON response (install jq for better formatting):"
                echo "$HTTP_BODY"
            fi
            ;;
    esac
else
    if [[ "$OUTPUT_FORMAT" == "human" ]]; then
        echo "❌ Failed to list memories (HTTP $HTTP_STATUS)" >&2
        echo "Response: $HTTP_BODY" >&2
        
        # Suggest common solutions
        echo "" >&2
        echo "💡 Possible solutions:" >&2
        echo "   - Check if MuninnDB is running: status.sh" >&2
        echo "   - Verify vault exists: muninn show vaults" >&2
        echo "   - Check token validity: cat $TOKEN_FILE" >&2
    else
        echo "{\"error\": \"HTTP $HTTP_STATUS\", \"response\": \"$HTTP_BODY\"}"
    fi
    exit 1
fi

if [[ "$OUTPUT_FORMAT" == "human" ]]; then
    echo ""
    echo "💡 Commands:"
    echo "   activate.sh --query \"search terms\"    # Search memories"
    echo "   store.sh --concept \"...\" --content \"...\"  # Store new memory"
    echo "   status.sh                               # Check system status"
    echo "   Web UI: http://localhost:8476           # Visual interface"
fi