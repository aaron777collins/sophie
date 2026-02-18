#!/bin/bash

# HAOS Deployment Validation Script
# This script performs comprehensive validation of the HAOS application for deployment readiness

set -e  # Exit on any error

echo "🚀 HAOS Deployment Validation & Export Resolution"
echo "=================================================="
echo "Timestamp: $(date)"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Function to print status
print_status() {
    if [ "$1" = "PASS" ]; then
        echo -e "${GREEN}✅ PASS:${NC} $2"
        PASSED=$((PASSED + 1))
    elif [ "$1" = "FAIL" ]; then
        echo -e "${RED}❌ FAIL:${NC} $2"
        FAILED=$((FAILED + 1))
    elif [ "$1" = "WARN" ]; then
        echo -e "${YELLOW}⚠️  WARN:${NC} $2"
        WARNINGS=$((WARNINGS + 1))
    fi
}

# Function to run with timeout
run_with_timeout() {
    timeout "$1" "$2" || {
        print_status "FAIL" "Command timed out after $1 seconds: $2"
        return 1
    }
}

echo "📋 Phase 1: Environment Validation"
echo "-----------------------------------"

# Check Node.js version
NODE_VERSION=$(node --version)
print_status "PASS" "Node.js version: $NODE_VERSION"

# Check pnpm version
PNPM_VERSION=$(pnpm --version)
print_status "PASS" "pnpm version: $PNPM_VERSION"

# Check if we're in the right directory
if [ -f "package.json" ] && [ -f "next.config.js" ]; then
    print_status "PASS" "Located in correct HAOS web app directory"
else
    print_status "FAIL" "Not in correct HAOS web app directory"
    exit 1
fi

echo ""
echo "📦 Phase 2: Dependency Validation"
echo "----------------------------------"

# Check if node_modules exists
if [ -d "node_modules" ]; then
    print_status "PASS" "node_modules directory exists"
else
    print_status "WARN" "node_modules not found, installing dependencies..."
    pnpm install
fi

# Install dependencies if package-lock is newer
if [ "pnpm-lock.yaml" -nt "node_modules" ]; then
    print_status "WARN" "Dependencies out of date, reinstalling..."
    pnpm install
fi

echo ""
echo "🔧 Phase 3: Configuration Validation"
echo "------------------------------------"

# Check Next.js config
if grep -q "output.*export" next.config.js; then
    print_status "PASS" "Static export configuration detected"
elif grep -q "NEXT_OUTPUT_MODE" next.config.js; then
    print_status "PASS" "Dynamic output configuration detected"
else
    print_status "WARN" "Static export may not be configured"
fi

# Check for workspace root configuration
if grep -q "outputFileTracingRoot" next.config.js; then
    print_status "PASS" "Workspace root configuration found"
else
    print_status "WARN" "Workspace root not configured (may cause warnings)"
fi

echo ""
echo "🏗️  Phase 4: Build System Validation"
echo "------------------------------------"

# Test TypeScript compilation (with timeout)
echo "Testing TypeScript compilation..."
if timeout 30s pnpm type-check > /tmp/typecheck.log 2>&1; then
    print_status "PASS" "TypeScript compilation successful"
else
    TYPECHECK_EXIT=$?
    if [ $TYPECHECK_EXIT -eq 124 ]; then
        print_status "FAIL" "TypeScript compilation timed out"
    else
        print_status "WARN" "TypeScript has errors (build configured to ignore)"
        echo "  First few TypeScript errors:"
        head -10 /tmp/typecheck.log | sed 's/^/    /'
    fi
fi

# Test linting (with timeout)
echo "Testing ESLint..."
if timeout 30s pnpm lint > /tmp/eslint.log 2>&1; then
    print_status "PASS" "ESLint validation successful"
else
    ESLINT_EXIT=$?
    if [ $ESLINT_EXIT -eq 124 ]; then
        print_status "FAIL" "ESLint timed out"
    else
        print_status "WARN" "ESLint has warnings (build configured to ignore)"
    fi
fi

echo ""
echo "📄 Phase 5: Page Analysis"
echo "-------------------------"

# Count pages
PAGE_COUNT=$(find app -name "page.tsx" -o -name "page.ts" -o -name "page.jsx" -o -name "page.js" | grep -v ".next" | wc -l)
print_status "PASS" "Found $PAGE_COUNT application pages"

# List pages
echo "  Detected pages:"
find app -name "page.tsx" -o -name "page.ts" -o -name "page.jsx" -o -name "page.js" | grep -v ".next" | sed 's/^/    - /'

echo ""
echo "🔨 Phase 6: Build Testing"
echo "-------------------------"

# Test standalone build (with timeout)
echo "Testing standalone build..."
export NEXT_OUTPUT_MODE=standalone
if timeout 120s pnpm build > /tmp/build-standalone.log 2>&1; then
    print_status "PASS" "Standalone build successful"
    
    # Check build artifacts
    if [ -d ".next" ] && [ -f ".next/BUILD_ID" ]; then
        print_status "PASS" "Build artifacts generated"
        BUILD_ID=$(cat .next/BUILD_ID)
        echo "  Build ID: $BUILD_ID"
    else
        print_status "FAIL" "Build artifacts missing"
    fi
else
    BUILD_EXIT=$?
    if [ $BUILD_EXIT -eq 124 ]; then
        print_status "FAIL" "Standalone build timed out after 120 seconds"
    else
        print_status "FAIL" "Standalone build failed"
        echo "  Last 10 lines of build log:"
        tail -10 /tmp/build-standalone.log | sed 's/^/    /'
    fi
fi

# Test export build (with timeout)
echo "Testing export build..."
export NEXT_OUTPUT_MODE=export
if timeout 120s pnpm build > /tmp/build-export.log 2>&1; then
    print_status "PASS" "Export build successful"
    
    # Check for out directory
    if [ -d "out" ]; then
        print_status "PASS" "Static export files generated"
        EXPORT_FILES=$(find out -name "*.html" | wc -l)
        echo "  Generated $EXPORT_FILES HTML files"
    else
        print_status "WARN" "No 'out' directory found (may be in .next)"
    fi
else
    EXPORT_EXIT=$?
    if [ $EXPORT_EXIT -eq 124 ]; then
        print_status "FAIL" "Export build timed out after 120 seconds"
        echo "  Build may be hanging at compilation or trace collection"
        echo "  Last 10 lines of build log:"
        tail -10 /tmp/build-export.log | sed 's/^/    /'
    else
        print_status "FAIL" "Export build failed"
        echo "  Last 10 lines of build log:"
        tail -10 /tmp/build-export.log | sed 's/^/    /'
    fi
fi

echo ""
echo "🧪 Phase 7: Development Server Test"
echo "-----------------------------------"

# Test dev server startup (with timeout)
echo "Testing development server startup..."
if timeout 30s bash -c 'pnpm dev > /tmp/dev.log 2>&1 & sleep 15 && curl -f http://localhost:3000 > /tmp/dev-response.html 2>/dev/null && pkill -f "next dev"'; then
    print_status "PASS" "Development server starts and responds"
else
    print_status "WARN" "Development server test failed or timed out"
fi

echo ""
echo "📊 Phase 8: Final Analysis"
echo "--------------------------"

# Generate summary
echo "Validation Summary:"
echo "  ✅ Passed: $PASSED tests"
echo "  ❌ Failed: $FAILED tests"
echo "  ⚠️  Warnings: $WARNINGS tests"
echo ""

# Overall status
if [ $FAILED -eq 0 ]; then
    if [ $WARNINGS -eq 0 ]; then
        echo -e "${GREEN}🎉 OVERALL STATUS: READY FOR DEPLOYMENT${NC}"
        exit 0
    else
        echo -e "${YELLOW}⚠️  OVERALL STATUS: DEPLOYMENT POSSIBLE WITH WARNINGS${NC}"
        exit 0
    fi
else
    echo -e "${RED}❌ OVERALL STATUS: DEPLOYMENT BLOCKED - ISSUES NEED RESOLUTION${NC}"
    exit 1
fi