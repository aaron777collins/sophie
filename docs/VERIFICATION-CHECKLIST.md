# Verification Checklist — MANDATORY

> **"No claim without evidence. No evidence without commands. No commands without output."**

This checklist is **MANDATORY** for ALL task completions and validations. Skipping steps = fraud.

---

## 🚨 CRITICAL: Project Directories

**ALWAYS verify you're in the correct directory before ANY checks:**

| Project | Directory | NEVER Check |
|---------|-----------|-------------|
| **MELO** | `/home/ubuntu/repos/melo/` | ~~`~/clawd/`~~ |
| **Clawd** | `/home/ubuntu/clawd/` | |
| **Other** | Check with Coordinator | |

```bash
# ALWAYS START WITH THIS
cd /home/ubuntu/repos/melo  # (or correct project directory)
pwd  # VERIFY output matches expected directory
```

**If you're checking a project and files "don't exist" — you're probably in the wrong directory!**

---

## 📋 Test Validation Checklist (MANDATORY)

## Test Validation Checklist (MANDATORY)

**ALL tasks must complete comprehensive test validation before any completion claims.**

> **FOUNDATIONAL RULE:** This test validation checklist enforces the comprehensive testing requirements established in `AGENTS.md` and integrates with the `PROACTIVE-JOBS-TEMPLATE.md` structure. No task may claim completion without comprehensive test validation.

### Testing Framework Integration Validation (MANDATORY)

**Before ANY task execution, verify appropriate testing framework integration:**

```bash
# Verify testing framework configuration exists
ls -la package.json  # Check for Jest/Playwright/Cypress in dependencies
cat package.json | grep -A5 -B5 '"jest"\|"playwright"\|"cypress"'

# Verify testing framework config files
ls -la jest.config.js playwright.config.js cypress.config.js 2>/dev/null || echo "Config files checked"
```

**Testing Framework Integration Requirements:**
- **Jest:** For unit tests, integration tests, and documentation validation
- **Playwright:** For E2E testing of frontend components and user flows
- **Cypress:** For comprehensive browser-based testing and user interactions
- **Custom Scripts:** For infrastructure testing, validation scripts, and format checking

### Test Execution Output Documentation (MANDATORY)

For EVERY test suite you claim to have run, provide **actual command execution output**:

```bash
# Run tests and INCLUDE COMPLETE OUTPUT in your completion report
npm test # or pnpm test, jest, etc.
echo "Exit code: $?"

# For Playwright tests with actual command output
npx playwright test
echo "Exit code: $?"

# For Cypress tests with actual command output
npx cypress run
echo "Exit code: $?"

# For custom validation scripts
node your-validation-script.js
echo "Exit code: $?"
```

**Test Evidence Documentation Format:**
```markdown
### Tests Verified - ACTUAL EXECUTION OUTPUT
- **Jest Unit Tests:**
  ```
  $ npm test
  > test-project@1.0.0 test
  > jest
  
  PASS  ./tests/unit/feature.test.js
    Feature Tests
      ✓ should validate feature requirements (15 ms)
      ✓ should handle edge cases correctly (8 ms)
      ✓ should integrate with system properly (12 ms)
  
  Test Suites: 1 passed, 1 total
  Tests:       47 passed, 47 total
  Time:        5.2s
  Exit code: 0
  ```
- **Playwright E2E Tests:**
  ```
  $ npx playwright test
  Running 12 tests using 4 workers
  
    ✓ auth.spec.ts:15:5 › login with valid credentials (2.1s)
    ✓ auth.spec.ts:32:5 › login with invalid credentials shows error (1.8s)
    ✓ dashboard.spec.ts:10:5 › dashboard loads correctly (3.2s)
    
  12 passed (45.2s)
  Exit code: 0
  ```
```

## 📋 TDD Evidence Verification (MANDATORY)

Before claiming completion, you MUST provide evidence of Test-Driven Development approach with comprehensive TDD evidence verification requirements:

> **TDD REQUIREMENT:** All tasks must follow Red → Green → Refactor methodology. Evidence verification requirements must document each phase progression with actual command output.

### RED Phase Evidence Requirements

**RED Phase:** Tests written first and initially failing. Must provide evidence of initial failure:

```bash
# Show test file was created/modified before implementation
git log --oneline --follow tests/feature.test.js | head -5

# Show initial test failures (Red phase evidence)
git show <test-commit-hash>:tests/feature.test.js

# Run tests at RED phase commit to show failure
git checkout <test-commit-hash>
npm test 2>&1 | tail -20  # Should show test failures
git checkout main  # Return to current state
```

**RED Phase Evidence Documentation:**
```markdown
### TDD Evidence - RED Phase
- **Tests Written First:** `tests/auth.test.js` at commit abc123
- **Initial Test Failures Confirmed:**
  ```
  $ npm test
  FAIL  ./tests/auth.test.js
    ✗ should authenticate valid user (5 ms)
      ReferenceError: authenticateUser is not defined
  Tests: 1 failed, 1 total
  Exit code: 1
  ```
```

### GREEN Phase Evidence Requirements

**GREEN Phase:** Implementation added to make tests pass. Must provide evidence of test success:

```bash
# Show implementation commits after tests (Green phase evidence)
git log --oneline --since="<test-date>" --grep="feat\|impl"

# Show current test success
npm test 2>&1 | tail-20  # Should show all tests passing
```

**GREEN Phase Evidence Documentation:**
```markdown
### TDD Evidence - GREEN Phase  
- **Implementation Added:** commit def456 "feat: implement authenticateUser function"
- **Tests Now Passing:**
  ```
  $ npm test
  PASS  ./tests/auth.test.js
    ✓ should authenticate valid user (12 ms)
    ✓ should reject invalid credentials (8 ms)
  Tests: 2 passed, 2 total
  Exit code: 0
  ```
```

### REFACTOR Phase Evidence Requirements

**REFACTOR Phase:** Code improvement while keeping tests green (optional but recommended):

```bash
# Show refactor commits (if applicable) 
git log --oneline --grep="refactor\|clean\|optimize"

# Confirm tests still pass after refactoring
npm test 2>&1 | tail -20  # Should still show all tests passing
```

**REFACTOR Phase Evidence Documentation:**
```markdown
### TDD Evidence - REFACTOR Phase
- **Code Improvements:** commit ghi789 "refactor: optimize authentication logic"
- **Tests Still Passing After Refactor:**
  ```
  $ npm test
  PASS  ./tests/auth.test.js
    ✓ should authenticate valid user (8 ms)  # Faster after optimization
    ✓ should reject invalid credentials (6 ms)
  Tests: 2 passed, 2 total  
  Exit code: 0
  ```
```

## 📋 Enhanced Worker Completion Checklist

Before setting status to `needs-validation`, you MUST complete ALL of these with **test verification first**:

> **CRITICAL POLICY:** Test verification must happen FIRST before any other validation steps. Cannot claim completion without test evidence. Test evidence before claiming completion is absolutely mandatory.

### 0. Test Verification (MANDATORY FIRST - CANNOT PROCEED WITHOUT)

**MUST complete comprehensive test validation before ANY other checks. Cannot claim complete without test evidence. Test evidence before completion claims is non-negotiable:**

```bash
# ALWAYS verify you're in correct project directory FIRST
cd /correct/project/directory
pwd  # VERIFY output matches expected directory

# Run all test suites and INCLUDE COMPLETE OUTPUT - not just summaries
npm test 2>&1 | tee worker-test-execution.log
echo "Test execution exit code: $?"

# For specific testing framework integration verification
npx jest --verbose 2>&1 | tee worker-jest-results.log
echo "Jest exit code: $?"

npx playwright test 2>&1 | tee worker-playwright-results.log  
echo "Playwright exit code: $?"

npx cypress run 2>&1 | tee worker-cypress-results.log
echo "Cypress exit code: $?"

# Any custom validation scripts must also run
node validation-script.js 2>&1 | tee worker-validation-results.log
echo "Validation script exit code: $?"
```

**Mandatory Test Execution Proof:**
- All test output must be captured and documented
- Exit codes must be 0 (zero) for success 
- Test result format requirements must include actual command output
- Test evidence collection must include logs, screenshots, coverage reports

**Test Coverage Evidence (mandatory if applicable):**
```bash
npm run test:coverage 2>&1 | tee worker-coverage-report.log
# Include coverage percentage and detailed report
```

**Test Result Format Requirements:**
```markdown
### Worker Test Verification - MANDATORY
- **Test Framework:** Jest + Playwright + Custom Validation Scripts
- **TDD Evidence:** All tests written first, RED → GREEN → REFACTOR documented
- **All Tests Pass:** 100% success rate confirmed with actual execution output
- **Test Coverage:** 95%+ where applicable
- **Test Evidence:** Complete logs, screenshots, coverage reports collected

**Test Execution Log:**
```
$ npm test
[COMPLETE ACTUAL OUTPUT FROM TEST EXECUTION]
Exit code: 0
```
```

### 1. File Existence Verification (MANDATORY)

For EVERY file you claim to have created/modified:

```bash
# Run this command and INCLUDE OUTPUT in your completion report
ls -la '/full/path/to/file.ts'
```

**Evidence format:**
```markdown
### Files Verified
- `/home/ubuntu/repos/melo/tests/e2e/auth.spec.ts`:
  ```
  -rw-rw-r-- 1 ubuntu ubuntu 15234 Feb 19 14:30 auth.spec.ts
  ```
```

**Special characters:** Use quotes for paths with `[]`, `()`, or spaces:
```bash
ls -la 'app/(setup)/page.tsx'
ls -la 'app/api/channels/[channelId]/route.ts'
```

---

### 2. Git Commit Verification (MANDATORY)

For EVERY commit you claim to have made:

```bash
# Run this and INCLUDE OUTPUT
git log --oneline -1 <commit-hash>
git show --stat <commit-hash> | head -20
```

**Evidence format:**
```markdown
### Commits Verified
- `9a7d625`: "feat: add onboarding flow E2E test"
  ```
  9a7d625 feat: add onboarding flow E2E test
  tests/e2e/user-journeys/onboarding-flow.spec.ts | 432 +++++
  1 file changed, 432 insertions(+)
  ```
```

---

### 3. Build Verification (MANDATORY)

```bash
# Run fresh build (not cached) and INCLUDE OUTPUT
cd /home/ubuntu/repos/melo  # or correct project directory
pnpm build 2>&1 | tail -30
echo "Exit code: $?"
```

**Evidence format:**
```markdown
### Build Verification
```
$ pnpm build
✓ Compiled successfully in 12.3s
Exit code: 0
```
```

**Build must exit 0. Non-zero = task NOT complete.**

---

### 4. Test Verification (MANDATORY)

```bash
# Run ALL tests and INCLUDE OUTPUT
pnpm test 2>&1 | tail -50
echo "Exit code: $?"

# For E2E tests (if applicable)
pnpm test:e2e 2>&1 | tail -50
echo "Exit code: $?"
```

**Evidence format:**
```markdown
### Test Verification
```
$ pnpm test
✓ 47 tests passed (5.2s)
Exit code: 0
```

### E2E Test Verification
```
$ pnpm test:e2e tests/e2e/auth.spec.ts
Running 12 tests using 4 workers
  ✓ auth.spec.ts:15 login with valid credentials
  ✓ auth.spec.ts:32 login with invalid credentials shows error
  ...
  12 passed (45.2s)
Exit code: 0
```
```

**All tests must pass. Failing tests = task NOT complete.**

---

### 5. TDD Evidence (MANDATORY for new features)

Prove tests were written FIRST (or alongside):

```bash
# Show test file was created/modified
git log --oneline --follow tests/e2e/feature.spec.ts | head -5

# Show test runs before implementation was complete
# (ideally tests failed first, then passed)
```

**Evidence format:**
```markdown
### TDD Evidence
- Test file created: `tests/e2e/auth.spec.ts` at commit abc123
- Test initially failed (Red phase): confirmed at commit abc123
- Implementation added: commit def456
- Tests now pass (Green phase): confirmed above
```

---

## 📋 Enhanced Coordinator Self-Validation Checklist

Before sending to Validator, you MUST verify with **test framework validation first**:

> **COORDINATOR RESPONSIBILITY:** You must verify test evidence quality and perform independent test execution verification. Cannot approve tasks without verifying testing framework usage and test quality assessment.

### 1. Test Framework Validation (MANDATORY FIRST)

**Don't trust test claims. Verify test quality, testing framework integration, and comprehensive framework usage:**

```bash
cd /home/ubuntu/repos/melo  # CORRECT DIRECTORY
pwd  # verify correct directory first

# Verify testing framework integration and usage
ls -la tests/ package.json
grep -i "jest\|playwright\|cypress" package.json
cat package.json | grep -A10 '"jest"\|"playwright"\|"cypress"'

# Verify test files exist and are comprehensive
find . -name "*.test.js" -o -name "*.spec.js" -o -name "*.e2e.js" -o -name "*.test.ts" -o -name "*.spec.ts"
wc -l tests/**/*.{test,spec}.{js,ts}

# Verify test framework configuration files exist
ls -la jest.config.js playwright.config.js cypress.config.js 2>/dev/null || echo "Checking config files"

# Assess test comprehensiveness and quality
grep -r "describe\|it\|test(" tests/ | wc -l
grep -r "expect\|assert" tests/ | wc -l  
```

### 2. Test Evidence Quality Verification (MANDATORY)

**Verify test evidence quality and validate test evidence from workers:**

```bash
# Review worker test evidence files
ls -la worker-*-results.log worker-*-execution.log

# Verify test evidence collection is comprehensive  
cat worker-test-execution.log | grep -E "PASS|FAIL|✓|✗|passed|failed"
cat worker-coverage-report.log | grep -E "coverage|%|percentage"

# Validate test result authenticity
diff worker-test-execution.log coordinator-test-results.log | head -20
```

### 3. Test Coverage Validation Requirements (MANDATORY)

**Validate test coverage and ensure coverage requirements are met:**

```bash
# Independent test coverage verification
npm run test:coverage 2>&1 | tee coordinator-coverage-verification.log
echo "Coverage verification exit code: $?"

# Extract and validate coverage percentages
grep -E "Lines|Functions|Branches|Statements" coordinator-coverage-verification.log
grep -E "[0-9]+\%" coordinator-coverage-verification.log
```

### 4. Independent Test Execution Verification (MANDATORY)

**Run tests independently - don't trust worker claims. Perform comprehensive independent test execution:**

```bash
# Run all tests independently with comprehensive output
pnpm test 2>&1 | tee coordinator-test-results.log
echo "Coordinator test execution exit code: $?"

# Run E2E tests independently if applicable  
pnpm test:e2e 2>&1 | tee coordinator-e2e-results.log
echo "Coordinator E2E execution exit code: $?"

# Run integration tests independently
pnpm test:integration 2>&1 | tee coordinator-integration-results.log
echo "Coordinator integration test exit code: $?"

# Verify test coverage independently
pnpm test:coverage 2>&1 | tee coordinator-coverage.log
echo "Coordinator coverage exit code: $?"
```

### 3. Re-run Worker Verifications

Don't trust claims. Run the commands yourself:

```bash
cd /home/ubuntu/repos/melo  # CORRECT DIRECTORY
pwd  # verify

# Check files
ls -la 'path/to/claimed/file.ts'

# Check commits
git log --oneline | grep <hash>

# Run build
pnpm build

# Verify tests pass (already done above)
# Verify integration tests
pnpm test:integration  # if applicable
```

### 2. Integration Check

```bash
# Start dev server (if applicable)
pnpm dev &
sleep 10

# Test endpoint or UI
curl -s http://localhost:3000/api/health | jq .

# Kill dev server
pkill -f "next dev"
```

### 3. Documentation

Include in validation request:
- All commands run with output
- Which acceptance criteria verified and how
- Any caveats or known issues

---

## 📋 Enhanced Validator Verification Checklist

**You are independent QA. Trust nothing. Verify everything with comprehensive test validation.**

> **VALIDATOR RESPONSIBILITY:** You must perform independent test execution and comprehensive test validation. Run tests independently, validate test quality assessment requirements, and confirm end-to-end functionality validation.

### 1. FIRST: Confirm Correct Directory

```bash
# ALWAYS start with this — most common error is wrong directory!
cd /home/ubuntu/repos/melo  # or project directory from request
pwd  # MUST show expected directory

# If files "don't exist", you're probably in wrong directory
# Check the validation request for project directory
```

### 2. File Verification

```bash
# For EVERY claimed file
ls -la '/full/path/to/file.ts'

# Use quotes for special characters
ls -la 'app/(setup)/page.tsx'
ls -la 'app/api/channels/[channelId]/route.ts'

# If file "doesn't exist", try:
find . -name "filename.ts" -type f  # maybe different path?
pwd  # are you in right directory?
```

### 3. Git Verification

```bash
git log --oneline | grep <hash>
git show --stat <hash>
```

### 4. Build Verification

```bash
pnpm build 2>&1 | tail -30
echo "Exit code: $?"
```

### 5. Comprehensive Test Validation (MANDATORY)

**Run tests independently to confirm results - verify test quality and comprehensiveness with comprehensive test validation:**

#### Independent Test Execution by Validator (MANDATORY)

**Run all tests independently - validator must run tests to confirm results:**

```bash
# Run all test suites independently - don't trust previous results
pnpm test 2>&1 | tee validator-test-results.log
echo "Validator independent test execution exit code: $?"

# Run E2E tests independently - validator run tests for complete verification
pnpm test:e2e 2>&1 | tee validator-e2e-results.log  
echo "Validator E2E test execution exit code: $?"

# Run integration tests independently
pnpm test:integration 2>&1 | tee validator-integration-results.log
echo "Validator integration test execution exit code: $?"

# Independent test coverage verification by validator
pnpm test:coverage 2>&1 | tee validator-coverage-results.log
echo "Validator coverage execution exit code: $?"
```

#### Test Quality Assessment Requirements (MANDATORY)

**Assess test quality, comprehensiveness, and adherence to testing standards:**

```bash
# Verify test quality and comprehensiveness - test quality assessment
find tests/ -name "*.test.*" -o -name "*.spec.*" | wc -l
grep -r "describe\|it\|test(" tests/ | wc -l
grep -r "expect\|assert" tests/ | wc -l

# Check for missed edge cases and boundary testing
grep -r "edge case\|boundary\|error\|exception" tests/
grep -r "should.*fail\|should.*throw\|should.*error" tests/

# Assess test naming and documentation quality
grep -r "describe\|it\|test(" tests/ | grep -E "should|when|given"
```

#### End-to-End Functionality Validation (MANDATORY)

**Validate end-to-end functionality beyond just unit tests:**

```bash
# Test end-to-end functionality through actual system integration
pnpm dev &
DEV_PID=$!
sleep 10

# Test API endpoints if applicable (end-to-end functionality validation)
curl -s http://localhost:3000/api/health | jq . || echo "API test"
curl -s http://localhost:3000/api/test | jq . || echo "API test"

# Test UI functionality if applicable
if command -v playwright &> /dev/null; then
    npx playwright test --project=chromium 2>&1 | tee validator-e2e-functionality.log
fi

# Cleanup
kill $DEV_PID 2>/dev/null || echo "Dev server stopped"
```

**Test Framework Integration Validation Commands:**
```bash
# Verify Jest configuration and validate integration
cat package.json | grep -A10 '"jest"'
ls -la jest.config.js jest.config.ts 2>/dev/null || echo "Jest config checked"

# Verify Playwright configuration and validate integration
cat playwright.config.js || cat playwright.config.ts || echo "Playwright config checked"
ls -la playwright.config.js playwright.config.ts 2>/dev/null || echo "Playwright files checked"

# Verify Cypress configuration and validate integration
cat cypress.config.js || cat cypress.json || echo "Cypress config checked"
ls -la cypress.config.js cypress.json 2>/dev/null || echo "Cypress files checked"
```

### 6. Before Claiming Fraud

**NEVER claim "fabrication" or "fraud" without:**

1. ✅ Confirming you're in the correct project directory
2. ✅ Trying multiple path variations (quotes, escaping)
3. ✅ Running `find` to search for files
4. ✅ Checking git log thoroughly
5. ✅ Asking: "Am I in the right place?"

**False fraud accusations are as bad as actual fraud. Verify thoroughly.**

---

## 📋 Testing Evidence Template Enhancement

Copy this enhanced evidence template with comprehensive testing sections into every completion/validation report:

```markdown
## Verification Evidence

**Directory confirmed:**
```
$ pwd
/home/ubuntu/repos/melo
```

### Testing Framework Integration Verified (MANDATORY)
| Framework | Config File | Integration Status | Framework Validation |
|-----------|-------------|-------|--------------|
| Jest | `package.json` + `jest.config.js` | ✅ Configured | ✅ Validation scripts integrated |
| Playwright | `playwright.config.js` | ✅ Configured | ✅ E2E test execution confirmed |
| Cypress | `cypress.config.js` | ✅ Configured | ✅ Browser testing configured |

### Test Execution Output Template (MANDATORY)
| Test Suite | Command Executed | Complete Output | Coverage | Result |
|------------|------------------|----------------|----------|--------|
| Unit Tests | `pnpm test` | `✓ 47 tests passed (5.2s), Exit code: 0` | 95% | ✅ PASS |
| E2E Tests | `pnpm test:e2e` | `Running 12 tests using 4 workers, ✓ 12 passed (45.2s), Exit code: 0` | N/A | ✅ PASS |
| Integration | `pnpm test:integration` | `✓ 8 tests passed (12.1s), Exit code: 0` | 87% | ✅ PASS |
| Validation Scripts | `node validation.js` | `✓ All validation checks passed, Exit code: 0` | N/A | ✅ PASS |

### Test Evidence Collection Format (MANDATORY)
**Complete test evidence collection must include:**
- **Test Execution Logs:** Complete command output saved to files
- **Coverage Reports:** Detailed coverage percentages with line-by-line documentation
- **Screenshots:** UI test execution screenshots captured for visual validation
- **Performance Metrics:** Response times, load test results, and performance benchmarks
- **TDD Progression:** RED → GREEN → REFACTOR evidence with git commit hashes
- **Framework Integration:** Config file contents and dependency verification

### Test Result Documentation Standards (MANDATORY)
**All test results must follow standardized documentation format:**
```markdown
#### Test Execution Results
**Framework:** Jest + Playwright + Custom Validation
**TDD Methodology:** RED → GREEN → REFACTOR confirmed
**Execution Date:** 2026-02-22 15:30 EST
**Test Evidence:** Complete logs, screenshots, coverage reports

**Test Execution Output:**
```
$ pnpm test
[COMPLETE ACTUAL OUTPUT FROM COMMAND EXECUTION - NOT SUMMARIES]
Test Suites: 5 passed, 5 total
Tests:       47 passed, 47 total
Snapshots:   0 total
Time:        5.234s
Coverage:    95.2% of statements (342/360 lines)
Exit code: 0
```
```

### Files Verified
| File | Command | Result |
|------|---------|--------|
| `path/to/file.ts` | `ls -la 'path/to/file.ts'` | `-rw-rw-r-- 1 ubuntu ubuntu 1234 Feb 19 14:30 file.ts` |

### Commits Verified  
| Hash | Command | Result |
|------|---------|--------|
| `abc123` | `git log --oneline -1 abc123` | `abc123 feat: description` |

### Build
```
$ pnpm build
[output]
Exit code: 0
```

### Tests Verified
```
$ pnpm test
✓ 47 tests passed (5.2s)
Exit code: 0
```

### E2E Tests Verified
```
$ pnpm test:e2e
Running 12 tests using 4 workers
✓ 12 passed (45.2s)
Exit code: 0
```

### Test Coverage
```
$ pnpm test:coverage
Test Coverage: 95%
Lines: 342/360
Functions: 45/48
Branches: 23/25
```

### TDD Evidence
- **Tests Written at commit:** `abc123`
- **Test Initially Failed (Red Phase):** Confirmed at commit abc123
- **Implementation Added:** commit def456
- **Tests Now Pass (Green Phase):** Confirmed above
- **Refactor Phase:** commit ghi789 (if applicable)
```

---

## ❌ Testing-Related Anti-Patterns (WILL BE REJECTED)

**These testing-related anti-patterns will result in immediate task rejection:**

| Testing Anti-Pattern | Why It's Wrong | Consequence |
|----------------------|----------------|-------------|
| **"All tests pass" without test framework output** | **No test evidence provided** | **REJECTED - No test validation** |
| **"Test coverage good" without coverage report** | **No test evidence documented** | **REJECTED - Missing test proof** |
| **"Tests written first" without TDD evidence** | **No TDD methodology proof** | **REJECTED - Missing TDD validation** |
| **Skipping test execution before claiming complete** | **Missing mandatory test validation** | **REJECTED - Test phase skipped** |
| **"Testing framework integrated" without config files** | **No framework evidence provided** | **REJECTED - No integration proof** |
| **False test claims - claiming tests pass without running them** | **Fabricated test results** | **REJECTED - Test fraud detected** |
| **Jest syntax errors in standalone Node tests** | **Tests using `describe`, `it`, `expect` without Jest setup** | **REJECTED - Tests don't actually run** |
| **Claiming "comprehensive tests" with minimal test files** | **Inadequate test coverage attempted** | **REJECTED - Insufficient testing** |
| **No test evidence collection before validation** | **Missing mandatory test validation** | **REJECTED - No test documentation** |
| **"46/46 tests passing" without showing execution output** | **Fabricated test success claims** | **REJECTED - False test validation** |
| **Using Jest functions (`describe`, `it`) in files run with `node`** | **Tests contain ReferenceError and don't execute** | **REJECTED - Non-functional tests** |
| "Build passes" without output | No evidence | REJECTED - No build proof |
| "Tests pass" without output | No evidence | REJECTED - No test proof |
| "Files created" without `ls -la` | No evidence | REJECTED - No file proof |
| "Commits made" without hash | No evidence | REJECTED - No commit proof |
| Checking `~/clawd/` for MELO work | Wrong directory | REJECTED - Wrong location |
| Using unquoted paths with `[]` or `()` | Shell escaping error | REJECTED - Command error |
| "All tests pass" when some fail | Lying about test results | REJECTED - Test result fraud |
| Rounding "136/138" to "all pass" | Lying about test success | REJECTED - False test claims |
| Claiming fraud without directory check | False accusation | REJECTED - Improper validation |

---

## ✅ Testing-Related Good Patterns

**These testing-related good patterns demonstrate proper validation methodology:**

| Testing Good Pattern | Why It's Right | Best Practice |
|---------------------|----------------|---------------|
| **`pnpm test` with complete test output and exit code** | **Proves tests actually ran and passed with real execution** | **✅ Actual test evidence** |
| **Test coverage reports with specific percentages** | **Proper test evidence with measurable metrics** | **✅ Quantified test validation** |
| **TDD git commit progression evidence** | **Proves test-driven development methodology followed** | **✅ RED → GREEN → REFACTOR proof** |
| **Testing framework config file verification** | **Proves framework integration completed properly** | **✅ Framework validation evidence** |
| **Independent test execution at each validation layer** | **Test validation best practices implemented** | **✅ Multi-layer test verification** |
| **Test evidence screenshots and logs collection** | **Comprehensive test documentation maintained** | **✅ Complete test evidence** |
| **Proper TDD methodology with RED → GREEN → REFACTOR** | **Follows test-driven development correctly - TDD methodology good pattern** | **✅ Proper development methodology** |
| **Real test execution with `node test-file.js` confirmation** | **Tests actually executable and verified** | **✅ Functional test validation** |
| **Actual test execution output instead of fabricated claims** | **Genuine test evidence provided** | **✅ Authentic test validation** |
| **Testing framework integration with proper dependencies** | **Complete testing environment setup** | **✅ Comprehensive test framework** |
| **Test evidence collection before claiming completion** | **Test validation happens before completion claims** | **✅ Test-first completion** |
| **Comprehensive test output including pass/fail details** | **Complete test result documentation** | **✅ Detailed test reporting** |
| `pwd` before any file checks | Confirms correct directory | ✅ Directory validation |
| `ls -la` with full output | Proves file exists with size/timestamp | ✅ File existence proof |
| `git log --oneline` output | Proves commit exists | ✅ Commit verification |
| `pnpm build` with exit code | Proves build actually ran and passed | ✅ Build validation |
| Quoted paths for special chars | Handles `[]`, `()` correctly | ✅ Proper shell escaping |
| Screenshots for UI work | Visual evidence | ✅ Visual validation |

---

## Integration with System Requirements

### Integration with AGENTS.md Testing Requirements (MANDATORY)
This verification checklist directly enforces and integrates with the comprehensive testing requirements from `AGENTS.md`:
- **Testing & Validation Requirements (MANDATORY)** — mandate test evidence collection at all levels
- **3-layer validation workflow enhancement** — requiring testing verification at each validation layer
- **TDD methodology foundation** — evidence requirements throughout entire validation process
- **"No Task Without Tests" policy** — integrated throughout verification workflow
- **Testing framework integration guide** — Jest, Playwright, Cypress requirements from AGENTS.md foundation

### Template Alignment with PROACTIVE-JOBS-TEMPLATE.md Validation (MANDATORY)
All validation checklists align perfectly with the standardized template validation requirements:
- **Testing Requirements section validation** — mandatory in every task using template structure
- **Evidence Required specifications** — match template requirements exactly for consistency
- **3-layer validation checklist integration** — aligns with template structure for comprehensive validation
- **Status progression with testing phases** — integrated with template validation workflow
- **Acceptance criteria with testing methods** — validates template's Given-When-Then format with test integration

### Reference to Verification System Enhancements (MANDATORY)
This checklist implements the verification system enhancements established in `VERIFICATION-SYSTEM.md`:
- **Testing Phase (MANDATORY)** integration with verification system workflow
- **Enhanced 3-layer validation protocol** with testing at each layer from verification system
- **Test evidence collection protocols** implementation from verification system requirements
- **Testing framework integration requirements** enforcement aligned with verification system
- **Status progression enhancement** with testing phase validation from verification system

### Policy Enforcement: "No Task Without Tests" Policy (MANDATORY)
This checklist enforces the mandatory "No Task Without Tests" policy throughout the system:
- **Testing plans mandatory** — tasks automatically rejected without comprehensive testing plans
- **Test evidence required** — cannot claim completion without validated test evidence collection
- **Test validation approval process** — each validation layer must verify test quality independently
- **Policy violation consequences** — immediate task rejection for non-compliance with testing requirements
- **Policy compliance validation** — mandatory verification that all testing policies are followed correctly

---

## Summary

**The rule is simple:**

> **If you can't prove it with a command and its output, you can't claim it.**

Evidence is mandatory. Commands must be run fresh. Output must be included. This is how we prevent both fraud and false accusations.
