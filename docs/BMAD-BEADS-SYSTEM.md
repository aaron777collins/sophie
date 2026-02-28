# BMAD + Beads Integration System

> **Status:** Design Document (Insanely High Priority)
> **Created:** 2026-02-28
> **Author:** Sophie (Circle Analysis Applied)
> **Purpose:** Comprehensive implementation system for Sophie's agent hierarchy

---

## ⭕ Circle Analysis: What's Actually Going On

### 🎯 The Actual Goal

We need a system where:
1. **Work gets tracked properly** — Not lost in markdown files
2. **Validation is unforgeable** — Can't lie about being done
3. **Quality is visual** — Screenshots prove professional appearance
4. **E2E tests MUST pass** — Not just unit tests (the 92% failure disaster)

### Current Failure Modes

| Failure | Impact | Root Cause |
|---------|--------|------------|
| Unit tests pass, E2E fails 92% | Broken features shipped | Workers only ran `pnpm test`, not `pnpm test:e2e` |
| "Done" claims without evidence | False confidence | No hard gates on validation |
| Infrastructure excuses | Blocked progress | No clear accountability |
| No visual validation | Unprofessional output | Screenshots never required |

---

## ⭕ Circle Perspectives

### 🔧 Pragmatist: What Practically Works?

**BMAD Method provides:**
- Structured phases (Analysis → Planning → Solutioning → Implementation)
- Specialized agents (PM, Architect, SM, DEV)
- Guided workflows with outputs
- `bmad-help` for guidance

**Beads provides:**
- Git-backed issue tracking (survives restarts)
- Hash-based IDs (no collisions in multi-agent work)
- Hierarchical structure (Epic → Task → Sub-task)
- `bd ready` shows what's unblocked

**Practical integration:**
- Use BMAD for planning methodology
- Use Beads for execution tracking
- Use Playwright for validation evidence
- Use our existing hierarchy for orchestration

### 🔍 Skeptic: What Could Go Wrong?

| Risk | Mitigation |
|------|------------|
| **Agents ignore Beads** | Make it MANDATORY in protocols; fail validation without bead ID |
| **BMAD too heavyweight** | Use lightweight "Quick Flow" for small tasks |
| **Screenshots not taken** | Hard gate: No screenshot directory = auto-fail |
| **Tool installation fails** | Pre-install on dev3, verify with smoke tests |
| **Beads DB conflicts** | Use `--stealth` mode for agent work |
| **Learning curve** | Clear examples in IDENTITY.md files |
| **Still claim done without E2E** | Validator RUNS E2E independently |

### 🛡️ Guardian: Quality and Safety Concerns

**Critical quality gates (CANNOT BE BYPASSED):**

```
┌─────────────────────────────────────────────────────────────────────┐
│  QUALITY GATES - HARD STOPS, NO EXCEPTIONS                         │
├─────────────────────────────────────────────────────────────────────┤
│  □ Bead ID assigned (bd-XXXX)                                       │
│  □ Acceptance criteria defined (Given/When/Then)                    │
│  □ Unit tests written AND passing                                   │
│  □ E2E tests written AND passing                                    │
│  □ Screenshots at 3 viewports exist                                 │
│  □ Visual quality check: "professional appearance"                  │
│  □ Validator independently verified                                 │
│  □ Bead closed with evidence                                        │
└─────────────────────────────────────────────────────────────────────┘

Missing ANY gate = NOT DONE. Period.
```

**Safety concerns:**
- Beads stores in git — don't commit sensitive data
- Screenshots could contain PII — store in validation/, not public
- Tool installation needs sudo — pre-install, don't give agents sudo

### 💡 Innovator: What Are We Missing?

1. **Automated screenshot comparison** — Diff against baseline for regression
2. **Visual quality AI check** — Have Opus evaluate screenshot aesthetics
3. **Dependency visualization** — `bd` graph view for blocked tasks
4. **Time-boxing** — Tasks stale after N hours get flagged
5. **Audit trail** — Every claim linked to evidence in Beads notes
6. **Auto-escalation** — 2+ validation failures → Person Manager notified

---

## 🗺️ System Architecture

### Agent Mapping: BMAD → Sophie's Hierarchy

| BMAD Agent | Sophie's Equivalent | Model | Responsibility |
|------------|---------------------|-------|----------------|
| **PM** (Product Manager) | **Person Manager** | Opus | Master Plans, Epics, strategic decisions |
| **Analyst** | Person Manager spawns sub-agent | Opus/Sonnet | Research, brainstorming |
| **Architect** | **Story Architect** | Opus | Architecture, user stories, ACs |
| **SM** (Scrum Master) | **Coordinator** | Opus/Sonnet | Sprint planning, task breakdown |
| **DEV** (Developer) | **Worker** | Sonnet | Implementation |
| **— (new)** | **Validator** | Sonnet | Independent verification |

### Task Flow Integration

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    INTEGRATED WORKFLOW                                   │
└─────────────────────────────────────────────────────────────────────────┘

Aaron → Person Manager
         │
         │ 1. ANALYSIS PHASE (Optional)
         │    - /bmad-brainstorming
         │    - /bmad-bmm-research  
         │    - Output: product-brief.md
         │
         │ 2. PLANNING PHASE
         │    - /bmad-bmm-create-prd
         │    - Output: PRD.md
         │    - bd create "Epic: {name}" -t epic -p 0
         │
         ▼
Story Architect (Opus via Claude Code)
         │
         │ 3. SOLUTIONING PHASE
         │    - /bmad-bmm-create-architecture
         │    - /bmad-bmm-create-epics-and-stories
         │    - bd create "{Epic-ID}.1 Story: {name}" -t story -p 1
         │    - Output: scheduler/stories/{project}/{US-ID}.md
         │
         ▼
Coordinator (Opus/Sonnet)
         │
         │ 4. SPRINT PLANNING
         │    - /bmad-bmm-sprint-planning
         │    - Break stories into tasks
         │    - bd create "{Story-ID}.1 Task: {name}" -t task -p 2
         │    - bd dep add {task-id} {dependency-id}
         │    - Output: sprint-status.yaml
         │
         │ 5. TASK ASSIGNMENT
         │    - bd ready → Show unblocked tasks
         │    - Assign to Workers
         │
         ▼
Worker (Sonnet)
         │
         │ 6. IMPLEMENTATION
         │    - bd update {id} --claim
         │    - Write tests FIRST (TDD)
         │    - Implement feature
         │    - Run ALL tests: unit + integration + E2E
         │    - Take screenshots (3 viewports)
         │    - bd update {id} --notes "Evidence: screenshots at..."
         │    - Self-validate
         │
         │ 7. VALIDATION REQUEST
         │    - bd update {id} --status "needs-validation"
         │    - Create validation request in inbox
         │
         ▼
Validator (Sonnet)
         │
         │ 8. INDEPENDENT VALIDATION
         │    - Run E2E tests independently
         │    - Verify screenshots exist at all viewports
         │    - Check visual quality (professional appearance)
         │    - Verify acceptance criteria met
         │
         │ If PASS:
         │    - bd close {id} --reason "Validated: all gates passed"
         │
         │ If FAIL:
         │    - bd update {id} --notes "Validation failed: {reason}"
         │    - bd update {id} --status "needs-fix"
         │    - Return to Worker
         │
         ▼
Coordinator
         │
         │ 9. COMPLETION
         │    - Verify all story tasks closed
         │    - /bmad-bmm-code-review
         │    - /bmad-bmm-retrospective (after epic)
         │
         ▼
Person Manager
         │
         │ 10. OVERSIGHT
         │    - Spot-check validation results
         │    - Handle escalations
         │    - Close epic when all stories complete
```

---

## 📦 Beads Integration

### Installation

```bash
# Install Beads CLI globally
npm install -g @beads/bd

# Initialize in clawd project
cd ~/clawd
bd init --prefix sph

# Configure for our workflow
bd config set default_priority 2
bd config set auto_commit true
```

### Bead ID Convention

```
bd-{hash}           # Auto-generated hash (e.g., bd-a3f8)
bd-{hash}.{n}       # Child task (e.g., bd-a3f8.1)
bd-{hash}.{n}.{m}   # Sub-task (e.g., bd-a3f8.1.1)

Example:
bd-a3f8              Epic: Melo V2 Authentication
├── bd-a3f8.1        Story: User Login Flow
│   ├── bd-a3f8.1.1  Task: Create login form component
│   ├── bd-a3f8.1.2  Task: Implement auth API
│   └── bd-a3f8.1.3  Task: Write E2E tests
├── bd-a3f8.2        Story: Password Reset
└── bd-a3f8.3        Story: Session Management
```

### Mandatory Bead Fields

Every bead MUST have:

| Field | Required | Content |
|-------|----------|---------|
| `title` | ✅ | Clear, descriptive title |
| `type` | ✅ | epic / story / task / bug |
| `priority` | ✅ | 0 (critical) to 3 (low) |
| `acceptance` | ✅ | Given/When/Then criteria |
| `assignee` | ✅ when claimed | Agent role (worker-1, validator, etc.) |
| `notes` | ✅ on completion | Evidence links, screenshots, test output |

### Bead Workflow Commands

```bash
# Person Manager creates epic
bd create "Epic: Melo V2 Auth" -t epic -p 0 --acceptance "All auth flows work on 3 viewports"

# Story Architect creates stories under epic
bd create "bd-a3f8.1 Story: User Login" -t story -p 1 --acceptance "Given user at /login, When valid creds entered, Then redirected to dashboard"

# Coordinator creates tasks under story
bd create "bd-a3f8.1.1 Task: Login Form Component" -t task -p 2
bd dep add bd-a3f8.1.1 bd-a3f8.1  # Task depends on story

# Worker claims task
bd update bd-a3f8.1.1 --claim

# Worker adds evidence
bd update bd-a3f8.1.1 --notes "Screenshots: scheduler/validation/screenshots/melo/bd-a3f8.1.1/
E2E tests: pnpm test:e2e auth.spec.ts → PASS (attached output)
Unit tests: pnpm test → 47/47 passed"

# Validator closes with validation
bd close bd-a3f8.1.1 --reason "Validated: All 3 viewports pass, E2E green, visually professional"

# Check what's ready
bd ready
```

---

## 📦 BMAD Integration

### Installation

```bash
# Install BMAD Method
cd ~/clawd
npx bmad-method install

# Select modules when prompted:
# [x] BMad Method (core workflows)
# [x] Quick Flow (for small tasks)
```

### Directory Structure

```
~/clawd/
├── _bmad/                      # BMAD configuration
│   ├── agents/                 # Agent definitions
│   ├── workflows/              # Workflow scripts
│   └── config.yaml             # BMAD settings
├── _bmad-output/               # BMAD artifacts
│   ├── planning-artifacts/
│   │   ├── PRD.md
│   │   ├── architecture.md
│   │   └── epics/
│   └── implementation-artifacts/
│       └── sprint-status.yaml
└── scheduler/                  # Existing scheduler (unchanged)
    ├── validation/
    │   └── screenshots/        # Playwright evidence
    └── ...
```

### BMAD Workflow Integration

| Workflow | When Used | Who Runs | Output |
|----------|-----------|----------|--------|
| `/bmad-help` | Anytime | Anyone | Guidance |
| `/bmad-brainstorming` | Project start | Person Manager | Brainstorming report |
| `/bmad-bmm-create-prd` | After brief | Person Manager | PRD.md |
| `/bmad-bmm-create-architecture` | After PRD | Story Architect | architecture.md |
| `/bmad-bmm-create-epics-and-stories` | After arch | Story Architect | Epic files |
| `/bmad-bmm-sprint-planning` | Story ready | Coordinator | sprint-status.yaml |
| `/bmad-bmm-create-story` | Each story | Coordinator | story-{slug}.md |
| `/bmad-bmm-dev-story` | Implementation | Worker | Working code |
| `/bmad-bmm-code-review` | Post-impl | Coordinator | Review result |
| `/bmad-bmm-retrospective` | Epic complete | Coordinator | Lessons learned |

---

## 📸 Playwright Validation Pipeline

### Screenshot Requirements (NON-NEGOTIABLE)

| Viewport | Size | Required |
|----------|------|----------|
| Desktop | 1920×1080 | ✅ YES |
| Tablet | 768×1024 | ✅ YES |
| Mobile | 375×667 | ✅ YES |

### Screenshot Script

```typescript
// playwright-validation.ts
import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

interface ValidationResult {
  beadId: string;
  acId: string;
  screenshots: string[];
  passed: boolean;
  errors: string[];
}

const VIEWPORTS = [
  { name: 'desktop', width: 1920, height: 1080 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 667 },
];

const SCREENSHOT_BASE = 'scheduler/validation/screenshots';

async function validateAcceptanceCriterion(
  page: Page,
  beadId: string,
  acId: string,
  testFn: (page: Page) => Promise<boolean>
): Promise<ValidationResult> {
  const result: ValidationResult = {
    beadId,
    acId,
    screenshots: [],
    passed: true,
    errors: [],
  };

  const screenshotDir = path.join(SCREENSHOT_BASE, beadId);
  fs.mkdirSync(screenshotDir, { recursive: true });

  for (const vp of VIEWPORTS) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    
    try {
      const testPassed = await testFn(page);
      if (!testPassed) {
        result.passed = false;
        result.errors.push(`Failed at ${vp.name} viewport`);
      }
    } catch (error) {
      result.passed = false;
      result.errors.push(`Error at ${vp.name}: ${error}`);
    }

    // Always take screenshot
    const screenshotPath = path.join(screenshotDir, `${acId}-${vp.name}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    result.screenshots.push(screenshotPath);
  }

  return result;
}

// Example usage in E2E test
async function validateLoginFlow(beadId: string): Promise<ValidationResult[]> {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const results: ValidationResult[] = [];

  // AC-1: Login form displays correctly
  results.push(await validateAcceptanceCriterion(
    page,
    beadId,
    'ac-1-login-form',
    async (p) => {
      await p.goto('http://localhost:3000/login');
      const form = await p.locator('form[data-testid="login-form"]');
      return await form.isVisible();
    }
  ));

  // AC-2: Error messages show on invalid input
  results.push(await validateAcceptanceCriterion(
    page,
    beadId,
    'ac-2-error-messages',
    async (p) => {
      await p.fill('input[name="email"]', 'invalid');
      await p.click('button[type="submit"]');
      const error = await p.locator('.error-message');
      return await error.isVisible();
    }
  ));

  await browser.close();
  return results;
}
```

### Visual Quality Check

Workers must self-assess, Validator must verify:

```
┌─────────────────────────────────────────────────────────────────────┐
│  VISUAL QUALITY CHECKLIST                                           │
├─────────────────────────────────────────────────────────────────────┤
│  □ Text is readable at all viewport sizes                          │
│  □ No content overflow or horizontal scrolling on mobile           │
│  □ Interactive elements are tappable size (44px minimum)           │
│  □ Colors have sufficient contrast (WCAG AA)                        │
│  □ Layout is balanced and professional                              │
│  □ No broken images or missing assets                               │
│  □ Loading states display correctly                                 │
│  □ Error states are styled consistently                             │
│  □ Forms are usable on mobile                                       │
│  □ Navigation works at all breakpoints                              │
└─────────────────────────────────────────────────────────────────────┘

Rating: Must be "Super Amazing and Professional" — Aaron's words
```

---

## 🚦 Quality Gates (CANNOT BE BYPASSED)

### Gate 1: Story Definition

Before work begins:
- [ ] Bead created with `bd create`
- [ ] Acceptance criteria in Given/When/Then format
- [ ] Dependencies mapped with `bd dep add`
- [ ] Testing approach defined
- [ ] Screenshots requirements documented

**Enforcement:** Coordinator rejects stories without these.

### Gate 2: Implementation

Before claiming done:
- [ ] `bd update {id} --claim` executed
- [ ] Unit tests written AND passing
- [ ] Integration tests passing (if applicable)
- [ ] **E2E tests written AND passing** ← THE BIG ONE
- [ ] Screenshots at all 3 viewports captured
- [ ] Evidence documented in bead notes

**Enforcement:** Worker cannot create validation request without evidence.

### Gate 3: Validation

Before closing:
- [ ] Validator independently runs E2E tests
- [ ] Validator confirms screenshots exist
- [ ] Validator checks visual quality
- [ ] All acceptance criteria verified
- [ ] No "conditional" passes

**Enforcement:** `bd close` only by Validator, with reason.

### Gate 4: Completion

Before marking epic complete:
- [ ] All child beads closed
- [ ] Code review completed
- [ ] Retrospective documented
- [ ] Person Manager spot-checked

---

## 📝 Protocol Updates

### Worker Protocol Update

Add to `scheduler/workers/IDENTITY.md`:

```markdown
## Beads Integration (MANDATORY)

### Before Starting Work
1. Verify you have a bead assignment: `bd show {bead-id}`
2. Claim the bead: `bd update {bead-id} --claim`
3. Read acceptance criteria: `bd show {bead-id} --json | jq .acceptance`

### During Work
1. Write tests FIRST (TDD approach)
2. Implement the feature
3. Run ALL test suites:
   - `pnpm test` (unit)
   - `pnpm test:integration` (if exists)
   - `pnpm test:e2e` ← MANDATORY FOR UI WORK

### Before Claiming Done
1. Take screenshots at ALL viewports:
   ```bash
   npx playwright test --project=validation --update-snapshots
   ```
2. Verify screenshots exist:
   ```bash
   ls scheduler/validation/screenshots/{bead-id}/
   # Must show: *-desktop.png, *-tablet.png, *-mobile.png
   ```
3. Add evidence to bead:
   ```bash
   bd update {bead-id} --notes "Evidence:
   - Screenshots: scheduler/validation/screenshots/{bead-id}/
   - E2E: PASS (output attached)
   - Unit: PASS (47/47)
   - Visual check: Professional, no overflow, readable"
   ```
4. Request validation:
   ```bash
   bd update {bead-id} --status "needs-validation"
   ```

### What Gets Rejected
- Missing E2E tests
- Missing screenshots at any viewport
- "Infrastructure issues" without escalation
- Conditional passes ("works except for X")
```

### Validator Protocol Update

Add to `scheduler/validator/IDENTITY.md`:

```markdown
## Beads Validation (MANDATORY)

### Validation Process
1. Check inbox for validation requests
2. For each request:
   ```bash
   # Get the bead details
   bd show {bead-id} --json
   
   # Verify evidence exists
   ls scheduler/validation/screenshots/{bead-id}/
   
   # Run E2E tests INDEPENDENTLY
   pnpm test:e2e --grep "{test-pattern}"
   ```

3. Visual Quality Check:
   - Open each screenshot
   - Check against visual quality checklist
   - Rating must be "professional"

4. Decision:
   ```bash
   # If all gates pass:
   bd close {bead-id} --reason "Validated: E2E pass, screenshots complete, visually professional"
   
   # If any gate fails:
   bd update {bead-id} --notes "Validation FAILED:
   - E2E: {result}
   - Screenshots: {missing viewports}
   - Visual: {issues}
   Action required: {specific fix}"
   bd update {bead-id} --status "needs-fix"
   ```

### What Causes Rejection
- E2E tests fail (no exceptions)
- Missing screenshots at ANY viewport
- Visual quality issues (unprofessional appearance)
- Infrastructure excuses (escalate, don't pass)

### Escalation
If same issue fails 2+ times:
```bash
bd create "ESCALATION: Repeated failure on {bead-id}" -t bug -p 0
# Person Manager will be notified
```
```

### Coordinator Protocol Update

Add to `scheduler/coordinator/IDENTITY.md`:

```markdown
## Beads Management (MANDATORY)

### Sprint Planning with Beads
1. Get ready tasks:
   ```bash
   bd ready --json
   ```
2. Assign to workers by adding claim instructions
3. Track progress:
   ```bash
   bd list --status in_progress
   bd list --status needs-validation
   bd list --status needs-fix
   ```

### Creating Tasks from Stories
```bash
# Create tasks under a story
bd create "{story-id}.1 Task: {description}" -t task -p 2
bd create "{story-id}.2 Task: {description}" -t task -p 2

# Add dependencies
bd dep add {task-id} {blocking-task-id}
```

### Monitoring Validation
1. Check validator inbox for completed validations
2. Review any failures
3. Reassign failed tasks to workers
4. Track velocity:
   ```bash
   bd list --closed --since "24 hours ago" | wc -l
   ```

### Code Review After Validation
Only after Validator approves:
```bash
# Run BMAD code review
/bmad-bmm-code-review

# Document in bead
bd update {bead-id} --notes "Code review: PASS"
```
```

---

## 🔧 Implementation Plan

### Phase 1: Tool Installation (Day 1)

```bash
# 1. Install Beads
npm install -g @beads/bd
cd ~/clawd
bd init --prefix sph

# 2. Install BMAD
npx bmad-method install
# Select: BMad Method + Quick Flow

# 3. Create screenshot directories
mkdir -p scheduler/validation/screenshots

# 4. Verify installations
bd ready  # Should show empty list
cat _bmad/config.yaml  # Should exist
```

### Phase 2: Protocol Updates (Day 1-2)

1. Update `scheduler/workers/IDENTITY.md` with Beads section
2. Update `scheduler/validator/IDENTITY.md` with Beads section
3. Update `scheduler/coordinator/IDENTITY.md` with Beads section
4. Update `scheduler/person-manager/IDENTITY.md` with Beads section
5. Update `AGENTS.md` with Beads requirement

### Phase 3: Template Creation (Day 2)

Create new templates:
1. `scheduler/templates/BEAD-STORY-TEMPLATE.md`
2. `scheduler/templates/VALIDATION-REQUEST-TEMPLATE.md`
3. `scheduler/templates/VISUAL-QUALITY-CHECKLIST.md`

### Phase 4: Validation Script (Day 2-3)

1. Create `tools/validation/playwright-validator.ts`
2. Create `tools/validation/screenshot-checker.sh`
3. Create `tools/validation/visual-quality-report.ts`

### Phase 5: Testing (Day 3)

1. Create test bead: `bd create "Test: Validation Pipeline" -t task -p 2`
2. Run through full workflow
3. Verify all gates work
4. Document any issues

### Phase 6: Rollout (Day 4+)

1. Apply to next active project
2. Monitor for issues
3. Iterate on process

---

## 📊 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| E2E pass rate | 100% | `bd list --closed` with E2E in notes |
| Screenshot coverage | 100% | Directory check per bead |
| Validation rejections | <20% | Rejected/total ratio |
| Time to validation | <4 hours | Bead claimed → validated delta |
| Visual quality rating | "Professional" | All screenshots pass checklist |

---

## 🚨 Contingencies

### If Beads Installation Fails
- Use markdown tracking as fallback
- Escalate to Aaron for npm access issues
- Try alternative: `go install github.com/steveyegge/beads/cmd/bd@latest`

### If BMAD Too Heavy
- Use Quick Flow for simple tasks
- Skip Analysis phase for small fixes
- Person Manager decides planning depth

### If Screenshots Can't Be Taken
- Document exactly what's blocking
- Escalate immediately (don't skip)
- Manual screenshots as absolute last resort

### If E2E Tests Fail Repeatedly
- Escalate after 2 failures
- Person Manager investigates systemic issue
- May require architecture change

---

## 📚 Quick Reference

### Daily Commands

```bash
# Start of day
bd ready                    # What can I work on?
bd list --status needs-fix  # What needs attention?

# During work
bd update {id} --claim      # Start working
bd show {id}                # Check requirements

# End of work
bd update {id} --notes "..." # Add evidence
bd update {id} --status needs-validation

# Validation
bd close {id} --reason "..." # Validator only
```

### File Locations

| What | Where |
|------|-------|
| Beads DB | `.beads/beads.db` |
| BMAD config | `_bmad/` |
| Screenshots | `scheduler/validation/screenshots/{bead-id}/` |
| Stories | `scheduler/stories/{project}/` |
| PRD | `_bmad-output/planning-artifacts/PRD.md` |

---

## ✅ Checklist: Is This Ready?

- [ ] Beads installed and initialized
- [ ] BMAD installed and configured
- [ ] Screenshot directories created
- [ ] All IDENTITY.md files updated
- [ ] Playwright validation script created
- [ ] First test bead run through successfully
- [ ] Aaron approved system design

---

*This document designed with Circle thinking. All perspectives considered. Quality gates cannot be bypassed.*

*"If it isn't proven finished, IT ISN'T DONE." — Aaron*
