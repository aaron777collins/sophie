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

## 📋 Worker Completion Checklist

Before setting status to `needs-validation`, you MUST complete ALL of these:

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

## 📋 Coordinator Self-Validation Checklist

Before sending to Validator, you MUST verify:

### 1. Re-run Worker Verifications

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

# Run tests
pnpm test
pnpm test:e2e  # if applicable
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

## 📋 Validator Verification Checklist

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

### 5. Test Verification

```bash
pnpm test 2>&1 | tail -50
pnpm test:e2e 2>&1 | tail -50  # if applicable
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

## 📋 Evidence Template

Copy this into every completion/validation report:

```markdown
## Verification Evidence

**Directory confirmed:**
```
$ pwd
/home/ubuntu/repos/melo
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

### Tests
```
$ pnpm test
[output]
Exit code: 0
```

### E2E Tests (if applicable)
```
$ pnpm test:e2e
[output]
Exit code: 0
```

### TDD Evidence
- Tests written at commit: `abc123`
- Tests pass at commit: `def456`
```

---

## ❌ Anti-Patterns (WILL BE REJECTED)

| Anti-Pattern | Why It's Wrong |
|--------------|----------------|
| "Build passes" without output | No evidence |
| "Tests pass" without output | No evidence |
| "Files created" without `ls -la` | No evidence |
| "Commits made" without hash | No evidence |
| Checking `~/clawd/` for MELO work | Wrong directory |
| Using unquoted paths with `[]` or `()` | Shell escaping error |
| "All tests pass" when some fail | Lying |
| Rounding "136/138" to "all pass" | Lying |
| Claiming fraud without directory check | False accusation |

---

## ✅ Good Patterns

| Pattern | Why It's Right |
|---------|----------------|
| `pwd` before any file checks | Confirms correct directory |
| `ls -la` with full output | Proves file exists with size/timestamp |
| `git log --oneline` output | Proves commit exists |
| `pnpm build` with exit code | Proves build actually ran and passed |
| `pnpm test` with test count | Proves tests actually ran and passed |
| Quoted paths for special chars | Handles `[]`, `()` correctly |
| Screenshots for UI work | Visual evidence |

---

## Summary

**The rule is simple:**

> **If you can't prove it with a command and its output, you can't claim it.**

Evidence is mandatory. Commands must be run fresh. Output must be included. This is how we prevent both fraud and false accusations.
