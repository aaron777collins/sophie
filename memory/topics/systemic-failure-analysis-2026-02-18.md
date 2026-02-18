# Systemic Failure Analysis: Melo UI Disaster

**Date:** 2026-02-18  
**Incident:** UI built wrong, hours wasted, Aaron upset  
**Goal:** Identify root causes and implement permanent systemic fixes

---

## The Failure Chain

```
Aaron: "Use discord-clone as reference"
    ↓
Coordinator: Creates tasks without UI-specific requirements
    ↓
Task Manager: Assigns to Haiku because "it's just implementation"
    ↓
Haiku: Builds components from scratch (cannot judge visual output)
    ↓
Validation: "Build passes, tests pass" → marked complete
    ↓
No one: Looks at what was actually built
    ↓
Result: Garbage UI, hours wasted
```

---

## Root Cause Analysis

### 1. No Model Assignment Rules for Task Types

**Problem:** There were no explicit rules preventing Haiku from being assigned UI work. The AGENTS.md mentioned model tiers but didn't specify which tasks require which models.

**Why it happened:** Task assignment was based on "complexity" rather than "task type." UI work was seen as "implementing components" (sounds like Haiku work) rather than "visual design judgment" (requires higher reasoning).

### 2. No Visual Verification in Validation Flow

**Problem:** The validation system checks:
- ✅ Build passes
- ✅ Tests pass
- ✅ Code compiles
- ❌ **Output looks correct** (MISSING)

For UI work, "build passes" is meaningless if the result looks wrong. Visual verification was never part of the workflow.

### 3. "Reference" Was Interpreted as "Inspiration"

**Problem:** When Aaron said "use discord-clone," the system interpreted this as "be inspired by discord-clone." The actual work should have been:
- Open discord-clone component
- Copy the JSX structure exactly
- Copy the Tailwind classes exactly
- Only change the data fetching

Instead, components were written from scratch with "similar" styling.

### 4. No Task Type Classification

**Problem:** Tasks weren't classified by type. A "build component" task looks the same whether it's:
- UI component (requires visual judgment)
- Logic component (requires reasoning)
- Infrastructure component (requires technical knowledge)

Each type has different requirements but they were all treated the same.

### 5. Self-Validation Didn't Include Visual Checks

**Problem:** The validation system says "spawn verification sub-agent, run build, tests, manual checks." But for UI, what does "manual check" mean? It should mean "look at it" but there was no enforcement.

---

## Systemic Fixes

### Fix 1: Task Type Classification (MANDATORY)

Every task must be classified as one of:
- `UI` — Requires visual output judgment
- `LOGIC` — Requires reasoning about behavior
- `INFRASTRUCTURE` — Requires technical/system knowledge
- `DATA` — Requires data manipulation
- `DOCUMENTATION` — Requires clarity and accuracy

**Model minimums by type:**
| Type | Minimum Model | Reason |
|------|---------------|--------|
| UI | Sonnet | Must judge visual output |
| LOGIC | Sonnet | Must reason about behavior |
| INFRASTRUCTURE | Haiku* | Clear technical steps |
| DATA | Haiku* | Clear data operations |
| DOCUMENTATION | Haiku* | Clear writing tasks |

*Haiku only if steps are explicit and don't require judgment.

### Fix 2: UI Work Protocol (MANDATORY)

For ANY task classified as `UI`:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    UI WORK PROTOCOL (MANDATORY)                     │
└─────────────────────────────────────────────────────────────────────┘

1. REFERENCE REQUIRED
   - Must have a visual reference (screenshot, existing UI, design)
   - If adapting existing code, must have that code available

2. VISUAL VERIFICATION REQUIRED
   - After each significant change: take screenshot
   - Compare screenshot to reference
   - Document the comparison in progress file
   - If doesn't match: iterate until it does

3. MODEL REQUIREMENT
   - Minimum: Sonnet
   - Preferred: Opus for complex layouts

4. COMPLETION CRITERIA
   - ❌ "Build passes" is NOT sufficient
   - ✅ "Screenshot matches reference" IS the criteria
```

### Fix 3: Reference Copying Protocol

When Aaron says "use X as reference," this means:

```
COPYING PROTOCOL (When adapting reference code)

1. CLONE the reference repository locally
2. For each component to adapt:
   a. OPEN the reference component file
   b. COPY the exact JSX structure
   c. COPY the exact CSS/Tailwind classes
   d. COPY the exact color values
   e. ONLY CHANGE: data fetching, state management, API calls
3. TAKE SCREENSHOT of running reference
4. TAKE SCREENSHOT of your implementation
5. COMPARE side-by-side
6. ITERATE until matching

❌ DO NOT: "Be inspired by"
❌ DO NOT: "Write similar code"
❌ DO NOT: "Improve" the design
✅ DO: Copy exactly, change only data layer
```

### Fix 4: Enhanced Validation for UI Tasks

Add to validation requirements for UI tasks:

```
UI TASK VALIDATION CHECKLIST

□ Screenshot of reference exists
□ Screenshot of implementation exists
□ Visual comparison documented
□ Colors match reference exactly
□ Layout matches reference exactly
□ Spacing matches reference exactly
□ Responsive behavior matches reference
□ Model used was Sonnet or higher
```

### Fix 5: Task Template Enforcement

Add to task creation template:

```markdown
### {task-id}
- **Type:** {UI|LOGIC|INFRASTRUCTURE|DATA|DOCUMENTATION}
- **Model:** {Minimum model based on type}
- **Reference:** {Link/path to visual reference if UI}
...
```

If Type=UI and Reference is empty, task cannot be created.

---

## Implementation Plan

1. **Update AGENTS.md** with:
   - Task type classification requirement
   - Model minimums by task type
   - UI Work Protocol section
   - Reference Copying Protocol section

2. **Update IDENTITY.md** (Sophie) with:
   - Explicit rule: "I never assign Haiku to UI tasks"
   - Visual verification as part of my defaults

3. **Update task templates** in:
   - `scheduler/coordinator/JOBS.md`
   - `PROACTIVE-JOBS.md`

4. **Create checklist file** for UI work:
   - `docs/UI-WORK-CHECKLIST.md`

---

## Verification

After implementing these fixes, the failure chain becomes impossible:

```
Aaron: "Use discord-clone as reference"
    ↓
Coordinator: Creates task with Type=UI, Reference=discord-clone
    ↓
Task Manager: Sees Type=UI → assigns to Sonnet (minimum)
    ↓
Sonnet: Follows UI Work Protocol, clones reference, copies exactly
    ↓
Validation: Requires screenshot comparison, not just build pass
    ↓
Comparison: Shows visual match to reference
    ↓
Result: UI looks like Discord ✅
```

---

## Lessons Learned

1. **Task type matters more than complexity** — A "simple" UI task requires more judgment than a "complex" data task.

2. **Visual work requires visual verification** — You cannot validate visual output without looking at it.

3. **"Reference" means "copy"** — When given a reference, copy it exactly. Don't improve, don't simplify, don't "be inspired."

4. **Model selection should be type-based** — Not complexity-based. Some tasks require judgment that smaller models cannot provide.

5. **Build passing is not validation** — For UI work, the only validation is "does it look right?"

---

*This analysis exists so we never repeat this failure. The systemic fixes must be implemented.*
