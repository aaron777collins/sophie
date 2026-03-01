#!/bin/bash
# validate-completion.sh — Automated quality gate enforcement
# Run BEFORE claiming any work complete
# Usage: ./validate-completion.sh <project-name> <repo-path> [--strict]

# Don't exit on first error - we want to check ALL gates
# set -e

PROJECT="${1:-}"
REPO_PATH="${2:-}"
STRICT="${3:-}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

log_pass() { echo -e "${GREEN}✅ PASS:${NC} $1"; ((PASS_COUNT++)); }
log_fail() { echo -e "${RED}❌ FAIL:${NC} $1"; ((FAIL_COUNT++)); }
log_warn() { echo -e "${YELLOW}⚠️  WARN:${NC} $1"; ((WARN_COUNT++)); }
log_info() { echo -e "ℹ️  INFO: $1"; }

echo "=============================================="
echo "  QUALITY GATE VALIDATION"
echo "  Project: ${PROJECT:-'(not specified)'}"
echo "  Repo: ${REPO_PATH:-'(not specified)'}"
echo "  Mode: ${STRICT:+'STRICT'}${STRICT:-'STANDARD'}"
echo "=============================================="
echo ""

# ============================================
# GATE 1: Issue Tracker Alignment
# ============================================
echo "--- GATE 1: Issue Tracker (Beads) ---"

if [ -z "$PROJECT" ]; then
    log_warn "No project specified, skipping beads check"
else
    # Check for open/in_progress/needs-fix/blocked issues
    OPEN_ISSUES=$(bd list --json 2>/dev/null | jq -r ".[] | select(.title | test(\"$PROJECT\"; \"i\")) | select(.status | test(\"open|in_progress|needs-fix|blocked\")) | .id" 2>/dev/null | wc -l || echo "0")
    
    if [ "$OPEN_ISSUES" -gt 0 ]; then
        log_fail "Found $OPEN_ISSUES open/in_progress/needs-fix/blocked issues for '$PROJECT'"
        echo "       Run: bd list --json | jq '.[] | select(.title | test(\"$PROJECT\"; \"i\"))'"
    else
        log_pass "No open issues found for '$PROJECT'"
    fi
fi

echo ""

# ============================================
# GATE 2: E2E Tests
# ============================================
echo "--- GATE 2: E2E Tests ---"

if [ -z "$REPO_PATH" ] || [ ! -d "$REPO_PATH" ]; then
    log_warn "No valid repo path, skipping E2E tests"
else
    cd "$REPO_PATH"
    
    # Check if playwright config exists
    if [ -f "playwright.config.ts" ] || [ -f "playwright.config.js" ]; then
        log_info "Running E2E tests..."
        
        # Run playwright tests and capture result
        if timeout 300 pnpm test:e2e --reporter=json > /tmp/e2e-results.json 2>&1; then
            E2E_PASSED=$(jq '.stats.expected // 0' /tmp/e2e-results.json 2>/dev/null || echo "0")
            E2E_FAILED=$(jq '.stats.unexpected // 0' /tmp/e2e-results.json 2>/dev/null || echo "0")
            E2E_SKIPPED=$(jq '.stats.skipped // 0' /tmp/e2e-results.json 2>/dev/null || echo "0")
            
            if [ "$E2E_FAILED" -gt 0 ]; then
                log_fail "E2E tests: $E2E_PASSED passed, $E2E_FAILED FAILED, $E2E_SKIPPED skipped"
            elif [ "$E2E_SKIPPED" -gt 0 ]; then
                log_warn "E2E tests: $E2E_PASSED passed, $E2E_SKIPPED skipped (document why!)"
            else
                log_pass "E2E tests: $E2E_PASSED passed"
            fi
        else
            # Check if it's a timeout or actual failure
            if [ $? -eq 124 ]; then
                log_fail "E2E tests timed out after 5 minutes"
            else
                log_fail "E2E tests failed to run (check playwright config)"
            fi
        fi
    else
        log_warn "No playwright config found, skipping E2E tests"
    fi
fi

echo ""

# ============================================
# GATE 3: Unit Tests
# ============================================
echo "--- GATE 3: Unit Tests ---"

if [ -z "$REPO_PATH" ] || [ ! -d "$REPO_PATH" ]; then
    log_warn "No valid repo path, skipping unit tests"
else
    cd "$REPO_PATH"
    
    if [ -f "package.json" ]; then
        # Check if test script exists
        if grep -q '"test"' package.json; then
            log_info "Running unit tests..."
            
            if pnpm test --passWithNoTests 2>&1 | tee /tmp/unit-test-output.txt | tail -5; then
                # Parse results from output
                UNIT_PASSED=$(grep -oP '\d+(?= passed)' /tmp/unit-test-output.txt | tail -1 || echo "0")
                UNIT_FAILED=$(grep -oP '\d+(?= failed)' /tmp/unit-test-output.txt | tail -1 || echo "0")
                UNIT_SKIPPED=$(grep -oP '\d+(?= skipped)' /tmp/unit-test-output.txt | tail -1 || echo "0")
                
                if [ "${UNIT_FAILED:-0}" -gt 0 ]; then
                    log_fail "Unit tests: $UNIT_PASSED passed, $UNIT_FAILED FAILED"
                elif [ "${UNIT_SKIPPED:-0}" -gt 0 ]; then
                    log_warn "Unit tests: $UNIT_PASSED passed, $UNIT_SKIPPED skipped"
                else
                    log_pass "Unit tests: ${UNIT_PASSED:-all} passed"
                fi
            else
                log_fail "Unit tests failed"
            fi
        else
            log_warn "No test script in package.json"
        fi
    else
        log_warn "No package.json found"
    fi
fi

echo ""

# ============================================
# GATE 4: Screenshots
# ============================================
echo "--- GATE 4: Screenshots (UI Work) ---"

SCREENSHOT_DIR="$HOME/clawd/scheduler/validation/screenshots"

if [ -z "$PROJECT" ]; then
    log_warn "No project specified, skipping screenshot check"
else
    PROJECT_SCREENSHOTS="$SCREENSHOT_DIR/$PROJECT"
    
    if [ -d "$PROJECT_SCREENSHOTS" ]; then
        DESKTOP_COUNT=$(find "$PROJECT_SCREENSHOTS" -path "*/desktop/*" -name "*.png" 2>/dev/null | wc -l)
        TABLET_COUNT=$(find "$PROJECT_SCREENSHOTS" -path "*/tablet/*" -name "*.png" 2>/dev/null | wc -l)
        MOBILE_COUNT=$(find "$PROJECT_SCREENSHOTS" -path "*/mobile/*" -name "*.png" 2>/dev/null | wc -l)
        
        if [ "$DESKTOP_COUNT" -gt 0 ] && [ "$TABLET_COUNT" -gt 0 ] && [ "$MOBILE_COUNT" -gt 0 ]; then
            log_pass "Screenshots found: desktop($DESKTOP_COUNT), tablet($TABLET_COUNT), mobile($MOBILE_COUNT)"
        else
            log_fail "Missing viewport screenshots: desktop($DESKTOP_COUNT), tablet($TABLET_COUNT), mobile($MOBILE_COUNT)"
        fi
    else
        log_fail "No screenshot directory found at $PROJECT_SCREENSHOTS"
    fi
fi

echo ""

# ============================================
# GATE 5: Validation Record
# ============================================
echo "--- GATE 5: Independent Validation ---"

VALIDATION_DIR="$HOME/clawd/scheduler/validation/reports"

if [ -z "$PROJECT" ]; then
    log_warn "No project specified, skipping validation check"
else
    # Look for validation reports
    VALIDATION_REPORTS=$(find "$VALIDATION_DIR" -name "*$PROJECT*" -mtime -1 2>/dev/null | wc -l)
    
    if [ "$VALIDATION_REPORTS" -gt 0 ]; then
        log_pass "Found $VALIDATION_REPORTS recent validation report(s)"
    else
        log_fail "No recent validation reports found for '$PROJECT'"
        echo "       Validator must independently verify and create report"
    fi
fi

echo ""

# ============================================
# SUMMARY
# ============================================
echo "=============================================="
echo "  SUMMARY"
echo "=============================================="
echo -e "  ${GREEN}PASSED:${NC} $PASS_COUNT"
echo -e "  ${RED}FAILED:${NC} $FAIL_COUNT"
echo -e "  ${YELLOW}WARNINGS:${NC} $WARN_COUNT"
echo ""

if [ "$FAIL_COUNT" -gt 0 ]; then
    echo -e "${RED}❌ QUALITY GATES NOT MET — CANNOT CLAIM COMPLETE${NC}"
    echo ""
    echo "Fix all failures before claiming this work is done."
    echo "See: ~/clawd/scheduler/QUALITY-GATES.md"
    exit 1
elif [ "$WARN_COUNT" -gt 0 ] && [ -n "$STRICT" ]; then
    echo -e "${YELLOW}⚠️  WARNINGS PRESENT — STRICT MODE REQUIRES ALL CLEAR${NC}"
    exit 1
else
    echo -e "${GREEN}✅ QUALITY GATES PASSED${NC}"
    echo ""
    echo "You may proceed with completion claim."
    echo "Remember to fill the completion checklist in your notes."
    exit 0
fi
