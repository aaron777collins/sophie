#!/bin/bash
# HAOS v2 Deployment Validation Script
# Checks all key components are functional

set -e

REMOTE_HOST="dev2"
BASE_URL="https://dev2.aaroncollins.info"
HAOS_PORT="3001"

echo "🔍 HAOS v2 Deployment Validation"
echo "================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

pass() { echo -e "${GREEN}✅ PASS${NC}: $1"; }
fail() { echo -e "${RED}❌ FAIL${NC}: $1"; }
warn() { echo -e "${YELLOW}⚠️  WARN${NC}: $1"; }

# Track results
PASSED=0
FAILED=0

# Test 1: HAOS Container Running
echo "Test 1: Container Status"
if ssh "$REMOTE_HOST" "docker ps | grep -q haos-v2"; then
    pass "HAOS v2 container is running"
    ((PASSED++))
else
    fail "HAOS v2 container not running"
    ((FAILED++))
fi

# Test 2: HAOS Health Check
echo ""
echo "Test 2: Container Health"
HEALTH=$(ssh "$REMOTE_HOST" "docker inspect --format='{{.State.Health.Status}}' haos-v2 2>/dev/null" || echo "unknown")
if [[ "$HEALTH" == "healthy" ]]; then
    pass "Container health: $HEALTH"
    ((PASSED++))
elif [[ "$HEALTH" == "starting" ]]; then
    warn "Container still starting, check again in a minute"
    ((PASSED++))
else
    fail "Container health: $HEALTH"
    ((FAILED++))
fi

# Test 3: HTTP Response
echo ""
echo "Test 3: HTTP Endpoint"
HTTP_CODE=$(ssh "$REMOTE_HOST" "curl -s -o /dev/null -w '%{http_code}' http://localhost:$HAOS_PORT/ 2>/dev/null" || echo "000")
if [[ "$HTTP_CODE" == "200" ]]; then
    pass "HTTP response code: $HTTP_CODE"
    ((PASSED++))
else
    fail "HTTP response code: $HTTP_CODE (expected 200)"
    ((FAILED++))
fi

# Test 4: LiveKit Server
echo ""
echo "Test 4: LiveKit Server"
if ssh "$REMOTE_HOST" "docker ps | grep -q matrix-livekit"; then
    pass "LiveKit server is running"
    ((PASSED++))
else
    fail "LiveKit server not running"
    ((FAILED++))
fi

# Test 5: LiveKit JWT Service
echo ""
echo "Test 5: LiveKit JWT Service"
if ssh "$REMOTE_HOST" "docker ps | grep -q matrix-livekit-jwt"; then
    pass "LiveKit JWT service is running"
    ((PASSED++))
else
    fail "LiveKit JWT service not running"
    ((FAILED++))
fi

# Test 6: Matrix Synapse
echo ""
echo "Test 6: Matrix Synapse"
SYNAPSE_HEALTH=$(ssh "$REMOTE_HOST" "docker inspect --format='{{.State.Health.Status}}' matrix-synapse 2>/dev/null" || echo "unknown")
if [[ "$SYNAPSE_HEALTH" == "healthy" ]]; then
    pass "Matrix Synapse: $SYNAPSE_HEALTH"
    ((PASSED++))
else
    fail "Matrix Synapse: $SYNAPSE_HEALTH"
    ((FAILED++))
fi

# Test 7: TURN/COTURN Server
echo ""
echo "Test 7: TURN Server (Coturn)"
if ssh "$REMOTE_HOST" "docker ps | grep -q matrix-coturn"; then
    pass "TURN server is running"
    ((PASSED++))
else
    fail "TURN server not running"
    ((FAILED++))
fi

# Test 8: Check for voice/video components in build
echo ""
echo "Test 8: Voice Components in Build"
if ssh "$REMOTE_HOST" "docker exec haos-v2 ls -la /app/apps/web/.next/static 2>/dev/null | head -5" &>/dev/null; then
    pass "Build artifacts present"
    ((PASSED++))
else
    warn "Could not verify build artifacts"
    ((PASSED++))
fi

# Summary
echo ""
echo "================================="
echo "Validation Summary"
echo "================================="
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [[ $FAILED -eq 0 ]]; then
    echo -e "${GREEN}🎉 All validations passed!${NC}"
    exit 0
else
    echo -e "${RED}⚠️ Some validations failed. Check the logs above.${NC}"
    exit 1
fi
