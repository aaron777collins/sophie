#!/bin/bash
# Playwright Reliability Test
# Usage: ./playwright-reliability-test.sh [count] [url]
# 
# Examples:
#   ./playwright-reliability-test.sh           # 10 runs against example.com
#   ./playwright-reliability-test.sh 5         # 5 runs against example.com  
#   ./playwright-reliability-test.sh 10 http://localhost:3000  # 10 runs against localhost

COUNT=${1:-10}
URL=${2:-https://example.com}
SUCCESS=0
FAIL=0

echo "===========================================" 
echo "Playwright Reliability Test"
echo "==========================================="
echo "Runs: $COUNT"
echo "URL: $URL"
echo "Time: $(date)"
echo "NODE_PATH: $NODE_PATH"
echo "==========================================="

# Verify NODE_PATH is set
if [ -z "$NODE_PATH" ]; then
  echo "⚠️  Warning: NODE_PATH not set. Setting to default..."
  export NODE_PATH=$(npm root -g)
  echo "NODE_PATH set to: $NODE_PATH"
fi

echo "Running Playwright reliability test ($COUNT iterations)..."
echo ""

for i in $(seq 1 $COUNT); do
  echo -n "Run $i/$COUNT... "
  if node -e "
    const {chromium} = require('playwright');
    (async () => {
      const browser = await chromium.launch();
      const page = await browser.newPage();
      await page.goto('$URL', { waitUntil: 'networkidle' });
      await page.screenshot({ path: '/tmp/reliability-script-$i.png' });
      await browser.close();
      process.exit(0);
    })().catch(() => process.exit(1));
  " 2>/dev/null; then
    echo "SUCCESS"
    ((SUCCESS++))
  else
    echo "FAIL"
    ((FAIL++))
  fi
done

echo ""
echo "==========================================="
echo "RESULTS SUMMARY"
echo "==========================================="
echo "Total runs: $COUNT"
echo "Successful: $SUCCESS"
echo "Failed: $FAIL"
echo "Success rate: $(( SUCCESS * 100 / COUNT ))%"
echo "Time completed: $(date)"

if [ "$SUCCESS" -eq "$COUNT" ]; then
  echo "✅ RELIABILITY TEST PASSED: All $COUNT runs succeeded"
  exit 0
else
  echo "❌ RELIABILITY TEST FAILED: $FAIL/$COUNT runs failed"
  exit 1
fi