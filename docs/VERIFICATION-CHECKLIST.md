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

**ALL tasks must complete comprehensive test validation before any completion claims.**

### Test Execution Verification (MANDATORY)

For EVERY test suite you claim to have run:

```bash
# Run tests and INCLUDE OUTPUT in your completion report
npm test # or pnpm test, jest, etc.
echo "Exit code: $?"

# For Playwright tests
npx playwright test
echo "Exit code: $?"

# For Cypress tests
npx cypress run
echo "Exit code: $?"
```

**Test Evidence Format:**
```markdown
### Tests Verified
- **Jest Unit Tests:**
  ```
  ✓ 47 tests passed (5.2s)
  Exit code: 0
  ```
- **Playwright E2E Tests:**
  ```
  Running 12 tests using 4 workers
  ✓ 12 passed (45.2s)
  Exit code: 0
  ```
```

## 📋 TDD Evidence Verification (MANDATORY)

Before claiming completion, you MUST provide evidence of Test-Driven Development approach:

### TDD Progression Evidence

```bash
# Show test file was created/modified before implementation
git log --oneline --follow tests/feature.test.js | head -5

# Show initial test failures (Red phase)
git show <test-commit-hash>:tests/feature.test.js

# Show implementation commits after tests
git log --oneline --since="<test-date>" --grep="feat\|impl"
```

**TDD Evidence Format:**
```markdown
### TDD Evidence
- **Test File Created:** `tests/auth.test.js` at commit abc123
- **Test Initially Failed (Red Phase):** Confirmed at commit abc123
- **Implementation Added:** commit def456 
- **Tests Now Pass (Green Phase):** Confirmed above
- **Refactor Phase:** commit ghi789 (optional)
```

## 📋 Worker Completion Checklist

Before setting status to `needs-validation`, you MUST complete ALL of these:

### 0. Test Verification (MANDATORY FIRST)

**MUST complete test validation before ANY other checks:**

```bash
# Run all test suites and INCLUDE OUTPUT
cd /correct/project/directory
npm test 2>&1 | tail -50
echo "Exit code: $?"

# For specific test frameworks
npx jest 2>&1 | tail -30
npx playwright test 2>&1 | tail-30
npx cypress run 2>&1 | tail -30
```

**Test Coverage Evidence (if applicable):**
```bash
npm run test:coverage
# Include coverage percentage and report
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

Before sending to Validator, you MUST verify:

### 1. Test Framework Validation (MANDATORY FIRST)

Don't trust test claims. Verify test quality and framework usage:

```bash
cd /home/ubuntu/repos/melo  # CORRECT DIRECTORY
pwd  # verify

# Verify testing framework usage
ls -la tests/ package.json
grep -i "jest\|playwright\|cypress" package.json

# Verify test files exist and are comprehensive
find . -name "*.test.js" -o -name "*.spec.js" -o -name "*.e2e.js"
wc -l tests/**/*.{test,spec}.{js,ts}
```

### 2. Independent Test Execution (MANDATORY)

Run tests yourself - don't trust claims:

```bash
# Run all tests independently
pnpm test 2>&1 | tee coordinator-test-results.log
echo "Exit code: $?"

# Run E2E tests if applicable  
pnpm test:e2e 2>&1 | tee coordinator-e2e-results.log
echo "Exit code: $?"

# Verify test coverage
pnpm test:coverage 2>&1 | tee coordinator-coverage.log
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

**You are independent QA. Trust nothing. Verify everything.**

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

**Run tests independently to confirm results - verify test quality and comprehensiveness:**

```bash
# Run all test suites independently - don't trust previous results
pnpm test 2>&1 | tee validator-test-results.log
echo "Exit code: $?"

# Run E2E tests independently
pnpm test:e2e 2>&1 | tee validator-e2e-results.log  
echo "Exit code: $?"

# Verify test quality and comprehensiveness
find tests/ -name "*.test.*" -o -name "*.spec.*" | wc -l
grep -r "describe\|it\|test(" tests/ | wc -l

# Check for missed edge cases
grep -r "edge case\|boundary\|error" tests/
```

**Test Framework Validation Commands:**
```bash
# Verify Jest configuration
cat package.json | grep -A10 '"jest"'

# Verify Playwright configuration  
cat playwright.config.js || cat playwright.config.ts

# Verify Cypress configuration
cat cypress.config.js || cat cypress.json
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

## 📋 Enhanced Evidence Template with Testing Sections

Copy this into every completion/validation report:

```markdown
## Verification Evidence

**Directory confirmed:**
```
$ pwd
/home/ubuntu/repos/melo
```

### Testing Framework Integration Verified
| Framework | Config File | Status |
|-----------|-------------|--------|
| Jest | `package.json` | ✅ Configured |
| Playwright | `playwright.config.js` | ✅ Configured |
| Cypress | `cypress.config.js` | ✅ Configured |

### Test Results Verified
| Test Suite | Command | Result | Coverage |
|------------|---------|--------|----------|
| Unit Tests | `pnpm test` | `47 tests passed (5.2s), Exit code: 0` | 95% |
| E2E Tests | `pnpm test:e2e` | `12 tests passed (45.2s), Exit code: 0` | N/A |
| Integration | `pnpm test:integration` | `8 tests passed (12.1s), Exit code: 0` | 87% |

### Test Evidence and Screenshots
- **Test Output:** Complete test execution logs saved
- **Coverage Report:** Detailed coverage percentages documented
- **Screenshots:** UI test execution screenshots captured
- **Performance Metrics:** Response times and load test results (if applicable)

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

## ❌ Anti-Patterns (WILL BE REJECTED)

| Anti-Pattern | Why It's Wrong |
|--------------|----------------|
| "Build passes" without output | No evidence |
| "Tests pass" without output | No evidence |
| **"All tests pass" without test framework output** | **No test evidence** |
| **"Test coverage good" without coverage report** | **No test evidence** |
| **"Tests written first" without TDD evidence** | **No TDD proof** |
| **Skipping test execution before claiming complete** | **Missing test validation** |
| **"Testing framework integrated" without config files** | **No framework evidence** |
| "Files created" without `ls -la` | No evidence |
| "Commits made" without hash | No evidence |
| Checking `~/clawd/` for MELO work | Wrong directory |
| Using unquoted paths with `[]` or `()` | Shell escaping error |
| "All tests pass" when some fail | Lying |
| Rounding "136/138" to "all pass" | Lying |
| **Claiming "comprehensive tests" with minimal test files** | **Inadequate test coverage** |
| **No test evidence collection before validation** | **Missing test validation** |
| Claiming fraud without directory check | False accusation |

---

## ✅ Good Patterns

| Pattern | Why It's Right |
|---------|----------------|
| `pwd` before any file checks | Confirms correct directory |
| **`pnpm test` with complete test output and exit code** | **Proves tests actually ran and passed** |
| **Test coverage reports with percentages** | **Proper test evidence** |
| **TDD git commit progression evidence** | **Proves test-driven development** |
| **Testing framework config file verification** | **Proves framework integration** |
| **Independent test execution at each validation layer** | **Test validation best practices** |
| **Test evidence screenshots and logs collection** | **Comprehensive test documentation** |
| `ls -la` with full output | Proves file exists with size/timestamp |
| `git log --oneline` output | Proves commit exists |
| `pnpm build` with exit code | Proves build actually ran and passed |
| Quoted paths for special chars | Handles `[]`, `()` correctly |
| Screenshots for UI work | Visual evidence |

---

## Integration with System Requirements

### Foundation: AGENTS.md Testing Requirements
This verification checklist enforces the comprehensive testing requirements from `AGENTS.md`:
- **Testing & Validation Requirements** mandate test evidence collection
- **3-layer validation workflow** requiring testing verification at each layer
- **TDD methodology** evidence requirements throughout validation process

### Template Alignment: PROACTIVE-JOBS-TEMPLATE.md
All validation checklists align with the standardized template:
- **Testing Requirements section** validation in every task
- **Evidence Required** specifications match template requirements
- **3-layer validation checklist** integration with template structure

### Policy Enforcement: "No Task Without Tests"
This checklist enforces the mandatory testing policies:
- **Testing plans mandatory** — tasks rejected without testing plans
- **Test evidence required** — cannot claim completion without test validation
- **Test validation approval process** — each layer must verify test quality

---

## Summary

**The rule is simple:**

> **If you can't prove it with a command and its output, you can't claim it.**

Evidence is mandatory. Commands must be run fresh. Output must be included. This is how we prevent both fraud and false accusations.
