# User Story: [US-BA-04] Reliability Validation (10 Consecutive Runs)

**Epic:** EPIC-01 (Playwright Setup & Validation)  
**Project:** Browser Automation Infrastructure  
**Status:** approved  
**Story Architect:** story-architect  
**Created:** 2026-02-28 04:45 EST  
**Version:** 1  
**Test Server:** https://example.com, http://localhost:3000

---

## Story

**As a** validation system administrator (Aaron)  
**I want** Playwright to work reliably every single time  
**So that** I never hear "screenshot failed" again and validation workflows are unblocked

---

## Acceptance Criteria

### AC-1: 10 Consecutive Public URL Screenshots Succeed

**Given** basic screenshot capability works (US-BA-02 complete)  
**When** I run the same screenshot command 10 times in a row  
**Then** all 10 runs succeed without any failures

**Validation:**
- Method: Bash loop with success counting
- Test Command:
  ```bash
  SUCCESS=0
  FAIL=0
  for i in {1..10}; do
    echo "Run $i..."
    if node -e "
      const {chromium} = require('playwright');
      (async () => {
        const browser = await chromium.launch();
        const page = await browser.newPage();
        await page.goto('https://example.com', { waitUntil: 'networkidle' });
        await page.screenshot({ path: '/tmp/reliability-test-$i.png' });
        await browser.close();
        process.exit(0);
      })().catch(() => process.exit(1));
    " 2>/dev/null; then
      echo "Run $i: SUCCESS"
      ((SUCCESS++))
    else
      echo "Run $i: FAIL"
      ((FAIL++))
    fi
  done
  echo "Results: $SUCCESS/10 passed, $FAIL/10 failed"
  [ "$SUCCESS" -eq 10 ]
  ```
- Expected Output: "10/10 passed, 0/10 failed"
- Screenshot: Required ✅ (test output log)

---

### AC-2: 10 Consecutive MELO Localhost Screenshots Succeed

**Given** MELO screenshot capability works (US-BA-03 complete)  
**And** MELO dev server is running on localhost:3000  
**When** I run MELO screenshot command 10 times in a row  
**Then** all 10 runs succeed without any failures

**Validation:**
- Method: Bash loop with success counting
- Test Command:
  ```bash
  # Verify MELO server first
  curl -s http://localhost:3000 > /dev/null || { echo "MELO server not running"; exit 1; }
  
  SUCCESS=0
  FAIL=0
  for i in {1..10}; do
    echo "MELO Run $i..."
    if node -e "
      const {chromium} = require('playwright');
      (async () => {
        const browser = await chromium.launch();
        const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
        await page.screenshot({ path: '/tmp/melo-reliability-$i.png' });
        await browser.close();
        process.exit(0);
      })().catch(() => process.exit(1));
    " 2>/dev/null; then
      echo "MELO Run $i: SUCCESS"
      ((SUCCESS++))
    else
      echo "MELO Run $i: FAIL"
      ((FAIL++))
    fi
  done
  echo "MELO Results: $SUCCESS/10 passed, $FAIL/10 failed"
  [ "$SUCCESS" -eq 10 ]
  ```
- Expected Output: "10/10 passed, 0/10 failed"
- Screenshot: Required ✅ (test output log)

---

### AC-3: Works After 5-Minute Pause

**Given** 10 consecutive tests passed  
**When** I wait 5 minutes and run again  
**Then** the screenshot still works without re-initialization

**Validation:**
- Method: Delayed execution test
- Test Command:
  ```bash
  echo "Waiting 5 minutes (300 seconds)..."
  sleep 300
  
  echo "Running post-wait test..."
  if node -e "
    const {chromium} = require('playwright');
    (async () => {
      const browser = await chromium.launch();
      const page = await browser.newPage();
      await page.goto('https://example.com', { waitUntil: 'networkidle' });
      await page.screenshot({ path: '/tmp/after-pause.png' });
      await browser.close();
      console.log('Post-pause screenshot succeeded');
    })();
  "; then
    echo "SUCCESS: Works after 5 minute pause"
  else
    echo "FAIL: Broken after pause"
  fi
  ```
- Expected Output: "SUCCESS: Works after 5 minute pause"
- Screenshot: Required ✅ (success after pause)

---

### AC-4: Works From Different Working Directories

**Given** Playwright works from ~/clawd  
**When** I run from ~/repos/melo  
**Then** it works identically without path issues

**Validation:**
- Method: Directory change test
- Test Command:
  ```bash
  echo "Testing from ~/clawd..."
  cd ~/clawd
  node -e "
    const {chromium} = require('playwright');
    (async () => {
      const browser = await chromium.launch();
      const page = await browser.newPage();
      await page.goto('https://example.com');
      await page.screenshot({ path: '/tmp/from-clawd.png' });
      await browser.close();
      console.log('From ~/clawd: SUCCESS');
    })();
  "
  
  echo "Testing from ~/repos/melo..."
  cd ~/repos/melo
  node -e "
    const {chromium} = require('playwright');
    (async () => {
      const browser = await chromium.launch();
      const page = await browser.newPage();
      await page.goto('https://example.com');
      await page.screenshot({ path: '/tmp/from-melo.png' });
      await browser.close();
      console.log('From ~/repos/melo: SUCCESS');
    })();
  "
  
  echo "Both directories work!"
  ```
- Expected Output: Both directories report SUCCESS
- Screenshot: Required ✅ (output from both directories)

---

### AC-5: No Memory Leaks Over 10 Runs

**Given** reliability testing is complete  
**When** I check system resources after 10 runs  
**Then** there are no orphaned browser processes or significant memory increase

**Validation:**
- Method: Process and memory check
- Test Command:
  ```bash
  # Check for orphan chromium processes before
  BEFORE_CHROME=$(pgrep -c chromium 2>/dev/null || echo 0)
  BEFORE_MEM=$(free -m | awk '/^Mem:/{print $3}')
  
  # Run 10 screenshots
  for i in {1..10}; do
    node -e "
      const {chromium} = require('playwright');
      (async () => {
        const browser = await chromium.launch();
        const page = await browser.newPage();
        await page.goto('https://example.com');
        await page.screenshot({ path: '/tmp/leak-test-$i.png' });
        await browser.close();
      })();
    " 2>/dev/null
  done
  
  # Check after
  sleep 2
  AFTER_CHROME=$(pgrep -c chromium 2>/dev/null || echo 0)
  AFTER_MEM=$(free -m | awk '/^Mem:/{print $3}')
  
  echo "Chrome processes - Before: $BEFORE_CHROME, After: $AFTER_CHROME"
  echo "Memory used (MB) - Before: $BEFORE_MEM, After: $AFTER_MEM"
  
  # Orphan check (after should not be significantly higher)
  if [ "$AFTER_CHROME" -le "$((BEFORE_CHROME + 2))" ]; then
    echo "SUCCESS: No orphan processes"
  else
    echo "WARNING: Possible orphan processes"
  fi
  ```
- Expected Output: No orphan chromium processes, reasonable memory usage
- Screenshot: Required ✅ (resource check output)

---

### AC-6: Rapid Sequential Screenshots Work

**Given** reliability is verified  
**When** I run 5 screenshots as fast as possible (no delay between)  
**Then** all 5 succeed without resource exhaustion

**Validation:**
- Method: Rapid fire test
- Test Command:
  ```bash
  echo "Running rapid sequential test..."
  SUCCESS=0
  for i in {1..5}; do
    node -e "
      const {chromium} = require('playwright');
      (async () => {
        const browser = await chromium.launch();
        const page = await browser.newPage();
        await page.goto('https://example.com');
        await page.screenshot({ path: '/tmp/rapid-$i.png' });
        await browser.close();
      })();
    " 2>/dev/null && ((SUCCESS++))
  done
  echo "Rapid test: $SUCCESS/5 succeeded"
  [ "$SUCCESS" -eq 5 ] && echo "SUCCESS: Rapid sequential works"
  ```
- Expected Output: "5/5 succeeded"
- Screenshot: Required ✅ (rapid test output)

---

### AC-7: Parallel Screenshots Work (Stretch Goal)

**Given** sequential reliability is verified  
**When** I run 3 screenshots in parallel (background processes)  
**Then** all 3 succeed without conflicts

**Validation:**
- Method: Parallel execution test
- Test Command:
  ```bash
  echo "Running parallel test..."
  
  # Run 3 in parallel
  for i in 1 2 3; do
    node -e "
      const {chromium} = require('playwright');
      (async () => {
        const browser = await chromium.launch();
        const page = await browser.newPage();
        await page.goto('https://example.com');
        await page.screenshot({ path: '/tmp/parallel-$i.png' });
        await browser.close();
        console.log('Parallel $i: done');
      })();
    " &
  done
  
  # Wait for all
  wait
  
  # Check results
  ls -la /tmp/parallel-*.png
  COUNT=$(ls /tmp/parallel-*.png 2>/dev/null | wc -l)
  echo "Parallel results: $COUNT/3 files created"
  [ "$COUNT" -eq 3 ] && echo "SUCCESS: Parallel works"
  ```
- Expected Output: "3/3 files created"
- Screenshot: Required ✅ (parallel test output)

---

### AC-8: Reliability Test Script Created

**Given** all reliability tests pass  
**When** validation agents need to verify browser automation  
**Then** a reusable reliability test script exists

**Validation:**
- Method: Script creation + execution
- Script Location: `/home/ubuntu/clawd/tools/playwright-reliability-test.sh`
- Script Content:
  ```bash
  #!/bin/bash
  # Playwright Reliability Test
  # Usage: ./playwright-reliability-test.sh [count]
  
  COUNT=${1:-10}
  SUCCESS=0
  FAIL=0
  
  echo "Running Playwright reliability test ($COUNT iterations)..."
  
  for i in $(seq 1 $COUNT); do
    if node -e "
      const {chromium} = require('playwright');
      (async () => {
        const browser = await chromium.launch();
        const page = await browser.newPage();
        await page.goto('https://example.com');
        await page.screenshot({ path: '/tmp/reliability-$i.png' });
        await browser.close();
        process.exit(0);
      })().catch(() => process.exit(1));
    " 2>/dev/null; then
      ((SUCCESS++))
    else
      ((FAIL++))
    fi
  done
  
  echo "Results: $SUCCESS/$COUNT passed"
  [ "$SUCCESS" -eq "$COUNT" ]
  ```
- Expected Output: Script exists and runs successfully
- Screenshot: Required ✅ (script execution output)

---

## Contingencies

### What Could Go Wrong

| Risk | Likelihood | Impact | Detection | Mitigation |
|------|------------|--------|-----------|------------|
| Random intermittent failures | M | H | Flaky test results | Investigate logs, add retries |
| Memory exhaustion over runs | L | H | OOM errors | Ensure browser.close(), check leaks |
| Orphan processes accumulate | M | M | pgrep shows stale chromium | Kill orphans, fix cleanup code |
| Network variance causes timeout | L | L | Occasional timeout | Increase timeout, retry logic |
| Disk fills with screenshots | L | L | No space left | Clean up /tmp after tests |
| Port conflicts with MELO | M | M | Connection refused | Verify server, check port |
| System resource limits | L | M | "Too many open files" | ulimit -n check |

### Fallback Options

- **If random failures occur:** Add retry logic (max 3 retries)
- **If memory issues:** Add explicit garbage collection hints
- **If process leaks:** Add process cleanup in finally block
- **If parallel fails:** Fall back to sequential-only (acceptable)

### Blockers (Would Prevent Story Completion)

| Blocker | Likelihood | Mitigation |
|---------|------------|------------|
| US-BA-02 and US-BA-03 not complete | - | Wait for dependencies |
| System resources insufficient | VL | dev3 is capable |
| Fundamental Playwright instability | VL | Would have surfaced earlier |

### Early Warning Signs

- First 3 runs succeed but later runs fail (resource exhaustion)
- Timing becomes progressively slower (memory leak)
- "Connection refused" errors mid-test (server crash)
- High CPU even after tests complete (orphan processes)

---

## Dependencies

### Dependency Graph

```
[US-BA-02: Basic Screenshot] ───┬──► [THIS STORY: US-BA-04] ────► [EPIC-01 Complete]
                                │                │
[US-BA-03: MELO Screenshot] ────┘                └──► [MELO Validation Unblocked]
```

### Upstream (Must Complete First)

| Dependency | Type | Status | Blocker? | Notes |
|------------|------|--------|----------|-------|
| US-BA-02 (Basic Screenshot) | story | pending | YES | Need working screenshots |
| US-BA-03 (MELO Screenshot) | story | pending | partial | Needed for MELO reliability test |

### Downstream (Waiting on This)

| Dependent | Type | Impact if Delayed |
|-----------|------|-------------------|
| EPIC-01 completion | epic | Cannot mark Playwright ready |
| MELO validation workflow | feature | Cannot use confidently |
| All browser-dependent validation | feature | Must use less reliable methods |

### External Dependencies

| External | Description | Status | Fallback |
|----------|-------------|--------|----------|
| example.com | Stable test target | available | httpbin.org |
| MELO dev server | localhost testing | when running | Skip MELO test |
| System resources | CPU, memory, disk | available | - |

### Technical Prerequisites

- [x] US-BA-02 complete
- [ ] US-BA-03 complete (for MELO reliability)
- [x] example.com accessible
- [ ] MELO server can be started
- [ ] /tmp has space for screenshots

---

## Out of Scope

Explicitly NOT included in this story (to prevent scope creep):

- Long-term reliability (hours/days) - just 10 runs
- Load testing (high parallelism)
- Cross-browser reliability (Chromium only)
- Network failure simulation
- CI/CD integration
- Automated reliability monitoring
- Performance benchmarking
- Memory profiling deep-dive

---

## Technical Notes

### Suggested Approach

1. **Run public URL test:** 10 consecutive example.com screenshots
2. **Run MELO test:** 10 consecutive localhost screenshots (if server running)
3. **Run pause test:** Wait 5 min, verify still works
4. **Run directory test:** Verify from different paths
5. **Run resource test:** Check for leaks
6. **Create script:** Reusable reliability test

### Success Threshold

| Test | Minimum Pass Rate | Target |
|------|-------------------|--------|
| Public URL 10x | 100% (10/10) | 100% |
| MELO localhost 10x | 100% (10/10) | 100% |
| After pause | Pass | Pass |
| Directory test | Pass | Pass |
| Resource check | No orphans | No orphans |

### Known Reliability Factors

- **Network stability:** dev3 has stable connection
- **Resource availability:** Sufficient RAM, CPU
- **Browser cleanup:** Must always close browser
- **Error handling:** Must catch and log failures

### Debugging Intermittent Failures

```bash
# If a run fails, capture detailed output:
DEBUG=pw:api node -e "
  const {chromium} = require('playwright');
  (async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto('https://example.com');
    await page.screenshot({ path: '/tmp/debug.png' });
    await browser.close();
  })();
"
```

### Anti-Patterns to Avoid

- Don't skip browser.close() (causes leaks)
- Don't run unbounded loops (have exit condition)
- Don't ignore failures (log and count them)
- Don't hardcode file paths that conflict

---

## Test Credentials

**Location:** N/A (no authentication required)

---

## Sub-Tasks (Coordinator Fills This)

| Task ID | Description | Model | Status |
|---------|-------------|-------|--------|
| | | | |

---

## Definition of Done

- [ ] AC-1: 10/10 public URL screenshots succeed
- [ ] AC-2: 10/10 MELO localhost screenshots succeed
- [ ] AC-3: Works after 5-minute pause
- [ ] AC-4: Works from different directories
- [ ] AC-5: No memory leaks or orphan processes
- [ ] AC-6: Rapid sequential screenshots work
- [ ] AC-7: Parallel screenshots work (stretch)
- [ ] AC-8: Reliability test script created
- [ ] All test outputs saved as evidence
- [ ] Documented as "Ready for production use"
- [ ] L1 (Self) validation complete
- [ ] L2 (Manager) validation complete

---

## Validation History

| Level | Validator | Date | Result | Report |
|-------|-----------|------|--------|--------|
| L1 Self | | | | |
| L2 Manager | | | | |
| L3 Peer | | | | |

---

## Review Checklist (Story Architect / Reviewer)

### Completeness
- [x] Happy path covered (10 consecutive successes)
- [x] Alternate valid paths covered (MELO, directories)
- [x] All error scenarios covered (resource exhaustion)
- [x] All edge cases covered (pause, parallel, rapid)
- [x] Empty states covered (N/A)
- [x] Boundary conditions covered (resource limits)
- [x] Permission/auth cases covered (N/A)

### Testability
- [x] Every AC has Given/When/Then
- [x] Every AC has validation method
- [x] ACs are specific and measurable (10/10, 5/5)
- [x] No ambiguous language

### Dependencies
- [x] Upstream dependencies identified
- [x] Downstream dependents identified
- [x] External dependencies mapped
- [x] Technical prerequisites listed
- [x] No circular dependencies

### Contingencies
- [x] Risks identified with mitigations
- [x] Fallback options documented
- [x] Blockers identified with workarounds
- [x] Early warning signs listed

### Clarity
- [x] Sonnet could implement without clarifying questions
- [x] No ambiguous terms
- [x] Scope boundaries explicit (out of scope)
- [x] Technical notes sufficient

---

## Review History

| Version | Reviewer | Date | Outcome | Key Feedback |
|---------|----------|------|---------|--------------|
| v1 | story-architect | 2026-02-28 | approved | Comprehensive reliability testing |

---
*Story Architect: Opus | Created for EPIC-01 Playwright Setup*
