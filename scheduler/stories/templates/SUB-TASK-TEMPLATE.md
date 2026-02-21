# Sub-Task: [{TASK-ID}] {Title}

**User Story:** {US-ID} (see `scheduler/stories/{project}/stories/{US-ID}.md`)
**Epic:** {EPIC-ID}
**Project:** {project-name}
**Status:** pending | in-progress | needs-validation | validated | complete
**Assigned:** {worker}
**Model:** haiku | sonnet
**Created:** {date}

---

## Parent Story Context

**Story:** {brief summary of parent story}
**ACs Covered:** {which ACs from parent story this task implements}

---

## Task Description

**As a** developer implementing {US-ID}
**I need to** {specific implementation task}
**So that** {which AC(s) will pass}

---

## Acceptance Criteria (Subset of Parent)

### AC-{N}: {From Parent Story}

**Given** {copied from parent}
**When** {copied from parent}
**Then** {copied from parent}

**Implementation Verification:**
- [ ] Code handles this case
- [ ] Test written for this case
- [ ] Manually verified

---

## Explicit Instructions

**IMPORTANT:** Follow these steps exactly. Do not deviate.

### Step 1: {Setup/Preparation}
```bash
{exact commands}
```

### Step 2: {Implementation}
- File: `{exact/path/to/file.ts}`
- Action: CREATE | MODIFY
- Pattern to follow: `{reference to existing pattern}`
```typescript
// Expected structure/pattern
```

### Step 3: {Testing}
```bash
{exact test commands}
```

### Step 4: {Verification}
- [ ] {specific check}
- [ ] Build passes: `pnpm build`
- [ ] Tests pass: `pnpm test`

---

## Contingencies

### What Could Go Wrong (Implementation Level)

| Risk | Detection | Resolution |
|------|-----------|------------|
| Import not found | Build error | Check package.json, install missing |
| Type mismatch | TypeScript error | Check interface definitions |
| Test fails unexpectedly | Test output | Check test setup, fixtures |
| Existing test breaks | CI failure | Check for regressions |
| {risk} | {how to detect} | {how to fix} |

### If You Get Stuck
1. **Check the parent story** for context
2. **Check similar implementations** in codebase
3. **Document the blocker** in progress file
4. **Escalate** to Coordinator via inbox

### Rollback Plan
If changes break things:
```bash
git stash  # or git checkout -- {files}
```

---

## Dependencies

### Upstream (Must Be Done First)
| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| {TASK-ID} | task | complete | {what it provides} |
| {package} | technical | available | {what we need} |

### Downstream (Waiting on This)
| Dependent | Impact |
|-----------|--------|
| {TASK-ID} | {what's blocked} |

### Files This Task Touches
- `{path/to/file1.ts}` — CREATE/MODIFY
- `{path/to/file2.ts}` — MODIFY

### Files You Should NOT Touch
- `{path/to/file.ts}` — Belongs to {other task}

---

## Model Guidance

**This task requires:** {haiku | sonnet}

### If Haiku
- Instructions are explicit and complete
- No decisions required
- Just follow the steps exactly

### If Sonnet
- Some problem-solving may be needed
- Use the patterns and context provided
- Document any decisions in progress file

---

## Validation Checklist

Before claiming `needs-validation`:

### Evidence Required (PASTE ACTUAL OUTPUT)
```bash
$ cd {project-dir} && pwd
[PASTE OUTPUT]

$ ls -la '{file-created}'
[PASTE OUTPUT]

$ git log --oneline -1
[PASTE OUTPUT]

$ pnpm build 2>&1 | tail -10 && echo "Exit: $?"
[PASTE OUTPUT]

$ pnpm test 2>&1 | tail -20 && echo "Exit: $?"
[PASTE OUTPUT]
```

### AC Verification
- [ ] AC-{N} passes (with evidence)
- [ ] Screenshot taken: `scheduler/validation/screenshots/{project}/{TASK-ID}-AC-{N}.png`

---

## Completion Report Template

When done, write this to `scheduler/progress/{TASK-ID}.md`:

```markdown
## Completion Report: {TASK-ID}

**Status:** needs-validation
**Completed:** {timestamp}
**Worker:** {label}

### Files Changed
| File | Action | Verified |
|------|--------|----------|
| {path} | CREATE/MODIFY | `ls -la` output |

### Commits
| Hash | Message | Verified |
|------|---------|----------|
| {hash} | {message} | `git log` output |

### Build Verification
\`\`\`
{actual build output}
\`\`\`

### Test Verification
\`\`\`
{actual test output}
\`\`\`

### AC Verification
- [ ] AC-{N}: {how verified} + screenshot path

### Self-Validation (Layer 1)
- Spawned: {yes/no - validation sub-agent}
- Result: {PASS/FAIL}
- Report: {path to L1 report}
```

---
*Template version: 1.0 — Created for Coordinator task breakdown (2026-02-21)*
