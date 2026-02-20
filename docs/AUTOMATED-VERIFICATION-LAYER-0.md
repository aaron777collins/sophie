# Layer 0 Automated Verification System (MANDATORY)

**Created:** 2026-02-20 16:05 EST  
**Deadline:** 48 hours from directive (2026-02-22 16:00 EST)  
**Priority:** CRITICAL - NO COMPLETION CLAIMS WITHOUT LAYER 0 PASSING

## Overview

Layer 0 is MANDATORY pre-validation that must pass before any worker can claim completion. This automated system prevents fraud and ensures basic quality gates are met.

## 🚨 NON-NEGOTIABLE RULE

**NO TASK CAN BE MARKED COMPLETE WITHOUT LAYER 0 PASSING**

- Workers MUST run Layer 0 checks before claiming completion
- Coordinators MUST verify Layer 0 passed before accepting claims
- Validators MUST confirm Layer 0 evidence before final approval

## Layer 0 Requirements

### 1. File Existence and Timestamp Checks

**Purpose:** Verify claimed work actually exists
**Implementation:** Automated file system verification

```bash
# For each claimed file, verify:
- File exists at specified path
- File size > 0 bytes (not empty)
- File modification timestamp within task timeframe
- File contains expected content markers (if applicable)
```

**Evidence Required:**
- `ls -la [file_path]` output showing size and timestamp
- File byte count verification
- Content sample (first/last 50 lines for code files)

### 2. Git Commit Verification

**Purpose:** Ensure work is properly committed and traceable
**Implementation:** Git history validation

```bash
# Verify all claimed commits:
git log --oneline -n 10  # Show recent commits
git show [commit_hash] --stat  # Verify specific commits exist
git diff [commit_hash]~1 [commit_hash] --name-status  # Show changed files
```

**Evidence Required:**
- Commit hash existence proof
- Commit message and timestamp
- List of files changed in commit
- Diff summary showing actual changes

### 3. Build/Test Execution Evidence

**Purpose:** Prove that code actually compiles and basic tests pass
**Implementation:** Automated build/test runs with output capture

```bash
# For different project types:

# Node.js projects:
npm test 2>&1 | tee test-output.log
npm run build 2>&1 | tee build-output.log
echo "Exit code: $?" >> build-output.log

# Python projects:
python -m pytest 2>&1 | tee test-output.log

# Bash scripts:
bash -n script.sh  # Syntax check
```

**Evidence Required:**
- Complete build output log
- Test execution results with pass/fail counts
- Exit codes (0 = success)
- Timestamp of execution

### 4. Functional Verification

**Purpose:** Basic functionality actually works
**Implementation:** Automated smoke tests

```bash
# Examples:
# For web apps: curl tests to verify endpoints respond
# For scripts: execute with --help flag
# For APIs: basic endpoint health checks
```

## Implementation Steps

### Step 1: Create Verification Scripts (24h deadline)

Create automated scripts in `/home/ubuntu/clawd/tools/layer0/`:

1. `verify-files.sh` - File existence and timestamp checks
2. `verify-git.sh` - Git commit verification  
3. `verify-build.sh` - Build and test execution
4. `verify-function.sh` - Basic functional tests
5. `layer0-runner.sh` - Master script that runs all checks

### Step 2: Integration with Task Management

Update task completion workflow:

1. Worker runs `layer0-runner.sh` before claiming completion
2. Evidence files generated in `/tmp/layer0-[task-id]/`
3. Worker includes Layer 0 evidence in completion claim
4. Coordinator verifies Layer 0 passed before accepting
5. Validator confirms Layer 0 evidence before final approval

### Step 3: Enforcement

**Immediate Actions Required:**
- Update all active task descriptions to include Layer 0 requirement
- Notify all active workers of new mandatory verification
- Reject any completion claims without Layer 0 evidence
- Document Layer 0 failures as validation failures

## Evidence Storage Format

Layer 0 evidence stored in structured format:

```
/tmp/layer0-[task-id]/
├── files-check.log          # File existence verification
├── git-check.log            # Git commit verification  
├── build-check.log          # Build output and exit codes
├── test-check.log           # Test execution results
├── function-check.log       # Basic functionality tests
├── layer0-summary.json      # Structured results
└── timestamp.txt            # Verification runtime
```

## Layer 0 Status Tracking

Tasks now have additional status tracking:

```
pending → in-progress → layer0-verified → self-validated → manager-validated → validated → complete
```

**layer0-verified:** All automated checks passed, evidence generated

## Failure Handling

**Layer 0 Failure = Immediate Return to Worker**
- No manual review needed for Layer 0 failures
- Worker must fix issues and re-run Layer 0
- Only after Layer 0 passes can human validation begin

## Project-Specific Layer 0 Configurations

### Melo V2
```bash
# Files to verify:
- Source files in /home/ubuntu/repos/melo/
- Test files with timestamps

# Build commands:
cd /home/ubuntu/repos/melo
NODE_OPTIONS="" pnpm build
pnpm test

# Functional tests:
curl -I https://dev2.aaroncollins.info/sign-in
```

### PortableRalph
```bash
# Files to verify:
- Scripts in project root
- Test files

# Build commands:
npm test

# Functional tests:
bash -n ralph.sh
./ralph.sh --help
```

## Rollout Timeline

- **0-24h:** Create verification scripts
- **24-48h:** Update all active tasks with Layer 0 requirement
- **48h+:** Full enforcement - no completion without Layer 0

This prevents fraud like the MELO-FIX-2 sub-agent fabrication incident and ensures consistent quality gates.