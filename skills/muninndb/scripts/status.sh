#!/bin/bash
# MuninnDB Status Check Script
# Check server status and basic connectivity

set -euo pipefail

# Configuration
TOKEN_FILE="$HOME/clawd/data/muninndb-token.secret"
API_BASE="http://localhost:8475/api"
HEALTH_ENDPOINT="http://localhost:8475/api/health"
WEB_UI="http://localhost:8476"

# Function to show usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Check MuninnDB server status and connectivity."
    echo ""
    echo "OPTIONS:"
    echo "  --detailed    Show detailed server information"
    echo "  --json        Output in JSON format"
    echo "  --help        Show this help message"
    echo ""
    echo "EXAMPLES:"
    echo "  $0                 # Basic status check"
    echo "  $0 --detailed      # Detailed server info"
    echo "  $0 --json          # JSON output"
    echo ""
}

DETAILED=false
JSON_OUTPUT=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --detailed)
            DETAILED=true
            shift
            ;;
        --json)
            JSON_OUTPUT=true
            shift
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

# Initialize status variables
MUNINN_SERVICE_STATUS=""
HEALTH_STATUS=""
TOKEN_STATUS=""
API_STATUS=""
WEB_UI_STATUS=""

# Function to check service status
check_service_status() {
    if command -v muninn >/dev/null 2>&1; then
        MUNINN_SERVICE_STATUS=$(muninn status 2>/dev/null || echo "ERROR")
    else
        MUNINN_SERVICE_STATUS="NOT_INSTALLED"
    fi
}

# Function to check health endpoint
check_health() {
    HEALTH_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "$HEALTH_ENDPOINT" 2>/dev/null || echo "FAILED\nHTTP_STATUS:000")
    HEALTH_BODY=$(echo "$HEALTH_RESPONSE" | sed '$d')
    HEALTH_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1 | sed 's/.*HTTP_STATUS://')
    
    if [[ "$HEALTH_CODE" == "200" ]]; then
        HEALTH_STATUS="HEALTHY"
    else
        HEALTH_STATUS="UNHEALTHY"
    fi
}

# Function to check bearer token
check_token() {
    if [[ -f "$TOKEN_FILE" ]]; then
        TOKEN_CONTENT=$(cat "$TOKEN_FILE" 2>/dev/null || echo "")
        if [[ -n "$TOKEN_CONTENT" && ( "$TOKEN_CONTENT" =~ ^mdb_ || "$TOKEN_CONTENT" =~ ^mk_ ) ]]; then
            TOKEN_STATUS="VALID"
        else
            TOKEN_STATUS="INVALID_FORMAT"
        fi
    else
        TOKEN_STATUS="NOT_FOUND"
    fi
}

# Function to check API access
check_api_access() {
    if [[ "$TOKEN_STATUS" == "VALID" ]]; then
        TOKEN=$(cat "$TOKEN_FILE")
        API_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
            -H "Authorization: Bearer $TOKEN" \
            "$API_BASE/engrams" 2>/dev/null || echo "FAILED\nHTTP_STATUS:000")
        API_CODE=$(echo "$API_RESPONSE" | tail -n1 | sed 's/.*HTTP_STATUS://')
        
        if [[ "$API_CODE" =~ ^2[0-9][0-9]$ ]]; then
            API_STATUS="ACCESSIBLE"
        else
            API_STATUS="INACCESSIBLE"
        fi
    else
        API_STATUS="NO_TOKEN"
    fi
}

# Function to check web UI
check_web_ui() {
    WEB_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "$WEB_UI" 2>/dev/null || echo "FAILED\nHTTP_STATUS:000")
    WEB_CODE=$(echo "$WEB_RESPONSE" | tail -n1 | sed 's/.*HTTP_STATUS://')
    
    if [[ "$WEB_CODE" == "200" ]]; then
        WEB_UI_STATUS="ACCESSIBLE"
    else
        WEB_UI_STATUS="INACCESSIBLE"
    fi
}

# Perform all checks
check_service_status
check_health
check_token
check_api_access
check_web_ui

# Generate output
if [[ "$JSON_OUTPUT" == true ]]; then
    # JSON output
    cat <<EOF
{
    "muninn_service": "$MUNINN_SERVICE_STATUS",
    "health_endpoint": "$HEALTH_STATUS",
    "bearer_token": "$TOKEN_STATUS",
    "api_access": "$API_STATUS",
    "web_ui": "$WEB_UI_STATUS",
    "endpoints": {
        "health": "$HEALTH_ENDPOINT",
        "api_base": "$API_BASE",
        "web_ui": "$WEB_UI"
    },
    "timestamp": "$(date -Iseconds)"
}
EOF
else
    # Human-readable output
    echo "🔍 MuninnDB Status Check"
    echo "========================"
    echo ""
    
    # Service status
    echo "📊 Service Status:"
    if [[ "$MUNINN_SERVICE_STATUS" == "NOT_INSTALLED" ]]; then
        echo "   ❌ muninn command not found"
    elif [[ "$MUNINN_SERVICE_STATUS" == "ERROR" ]]; then
        echo "   ⚠️  Error checking service status"
    elif [[ "$MUNINN_SERVICE_STATUS" == *"[up]"* ]]; then
        echo "   ✅ MuninnDB service running"
    else
        echo "   ❌ MuninnDB service not running"
        echo "   💡 Try: muninn start"
    fi
    
    # Health check
    echo ""
    echo "🏥 Health Check:"
    if [[ "$HEALTH_STATUS" == "HEALTHY" ]]; then
        echo "   ✅ Health endpoint responding"
        if [[ "$DETAILED" == true && -n "$HEALTH_BODY" ]]; then
            if command -v jq >/dev/null 2>&1; then
                echo "$HEALTH_BODY" | jq -r '
                    "   📍 Version: \(.version // "unknown")",
                    "   ⏱️  Uptime: \(.uptime_seconds // 0) seconds",
                    "   💾 Database: \(if .db_writable then "writable" else "read-only" end)"'
            else
                echo "   📄 $HEALTH_BODY"
            fi
        fi
    else
        echo "   ❌ Health endpoint not responding ($HEALTH_ENDPOINT)"
    fi
    
    # Token status
    echo ""
    echo "🔐 Authentication:"
    case "$TOKEN_STATUS" in
        "VALID")
            echo "   ✅ Bearer token found and valid"
            ;;
        "NOT_FOUND")
            echo "   ❌ Bearer token not found: $TOKEN_FILE"
            echo "   💡 Try: muninn api-key create"
            ;;
        "INVALID_FORMAT")
            echo "   ⚠️  Bearer token found but invalid format"
            echo "   💡 Should start with 'mdb_'"
            ;;
    esac
    
    # API access
    echo ""
    echo "🔌 API Access:"
    case "$API_STATUS" in
        "ACCESSIBLE")
            echo "   ✅ API accessible with token"
            ;;
        "INACCESSIBLE")
            echo "   ❌ API not accessible"
            ;;
        "NO_TOKEN")
            echo "   ❌ Cannot test API - no valid token"
            ;;
    esac
    
    # Web UI
    echo ""
    echo "🌐 Web UI:"
    if [[ "$WEB_UI_STATUS" == "ACCESSIBLE" ]]; then
        echo "   ✅ Web UI accessible: $WEB_UI"
    else
        echo "   ❌ Web UI not accessible: $WEB_UI"
    fi
    
    # Summary
    echo ""
    echo "📋 Summary:"
    OVERALL_STATUS="HEALTHY"
    
    if [[ "$MUNINN_SERVICE_STATUS" != *"[up]"* ]]; then
        echo "   ⚠️  Service not running - start with: muninn start"
        OVERALL_STATUS="DEGRADED"
    fi
    
    if [[ "$TOKEN_STATUS" != "VALID" ]]; then
        echo "   ⚠️  Token issue - create with: muninn api-key create"
        OVERALL_STATUS="DEGRADED"
    fi
    
    if [[ "$API_STATUS" != "ACCESSIBLE" ]]; then
        echo "   ⚠️  API not accessible - check service and token"
        OVERALL_STATUS="DEGRADED"
    fi
    
    if [[ "$OVERALL_STATUS" == "HEALTHY" ]]; then
        echo "   ✅ All systems operational"
        echo ""
        echo "💡 Ready to use:"
        echo "   store.sh --concept \"Test\" --content \"Hello MuninnDB\""
        echo "   activate.sh --query \"test\""
        echo "   Web UI: $WEB_UI"
    fi
fi

# Exit with appropriate code
if [[ "$OVERALL_STATUS" == "HEALTHY" || "$JSON_OUTPUT" == true ]]; then
    exit 0
else
    exit 1
fi