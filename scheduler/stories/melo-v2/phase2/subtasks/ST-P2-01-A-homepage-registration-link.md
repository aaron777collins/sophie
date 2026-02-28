# Sub-Task: [ST-P2-01-A] Homepage Registration Link

**User Story:** US-P2-01 (see `scheduler/stories/melo-v2/phase2/US-P2-01-user-registration.md`)
**Epic:** MELO-V2-PHASE2-AUTHENTICATION
**Project:** melo-v2
**Status:** pending
**Assigned:** 
**Model:** haiku
**Created:** 2026-02-28

---

## Parent Story Context

**Story:** User Registration Implementation - new users need discoverable path to create accounts
**ACs Covered:** AC-1 (Registration Access from Homepage)

---

## Task Description

**As a** developer implementing US-P2-01
**I need to** add a visible "Register" or "Sign Up" button/link on the homepage that directs to `/sign-up`
**So that** AC-1 will pass - new users can find registration within 5 seconds on the homepage

---

## Acceptance Criteria (Subset of Parent)

### AC-1: Registration Access from Homepage (P0-CRITICAL)

**Given** a new user on the MELO V2 homepage
**When** they look for registration options
**Then** they see a clear "Register" or "Sign Up" button/link within 5 seconds of page load

**Implementation Verification:**
- [ ] Button/link is visible on homepage
- [ ] Links to `/sign-up` or `/register`
- [ ] Visible across all viewport sizes
- [ ] Follows existing UI patterns

---

## Explicit Instructions

**IMPORTANT:** Follow these steps exactly. Do not deviate.

### Step 1: Setup/Preparation
```bash
cd /home/ubuntu/repos/melo && pwd
git status
# Verify you're on main/correct branch
```

### Step 2: Locate Homepage Component
```bash
# Find the homepage/landing page component
find . -name "*.tsx" -o -name "*.ts" | grep -E "(page|index|home|landing)" | grep -v node_modules
```

### Step 3: Implementation
- File: `{path/to/homepage/component}` (you'll need to identify this)
- Action: MODIFY
- Pattern to follow: Look for existing button patterns in the codebase

**Expected Implementation:**
1. Add a "Sign Up" or "Register" button/link near the hero section
2. Use existing UI component patterns (Button, Link from UI library)
3. Link should use `href="/sign-up"` 
4. Follow styling patterns of other CTA buttons

```typescript
// Expected structure (adapt to actual homepage component):
<Button variant="primary" asChild>
  <Link href="/sign-up">Sign Up</Link>
</Button>
// OR
<Link href="/sign-up" className="button-primary">
  Register
</Link>
```

### Step 4: Testing
```bash
pnpm build
pnpm test
# Visit http://dev2.aaroncollins.info:3000 to verify link appears
```

### Step 5: Verification
- [ ] Homepage loads without errors
- [ ] Registration link is visible
- [ ] Link navigates to `/sign-up`
- [ ] Build passes: `pnpm build`
- [ ] Tests pass: `pnpm test`

---

## Contingencies

### What Could Go Wrong (Implementation Level)

| Risk | Detection | Resolution |
|------|-----------|------------|
| Homepage component not found | grep returns no clear results | Look for app/page.tsx, pages/index.tsx, or similar |
| UI components not imported | Build error | Check existing imports, add Button/Link imports |
| Link doesn't work | Click test fails | Verify Next.js Link component usage |
| Styling conflicts | Visual inspection | Follow existing button class patterns |
| Build breaks | pnpm build fails | Check syntax, imports |

### If You Get Stuck
1. **Check the parent story** for context and expected behavior
2. **Check existing homepage** to understand current structure
3. **Look for similar buttons** in the codebase for patterns
4. **Document the blocker** in progress file
5. **Escalate** to Coordinator via inbox

### Rollback Plan
If changes break things:
```bash
git stash  # Save changes for later
# OR
git checkout -- {modified-files}  # Discard changes
```

---

## Dependencies

### Upstream (Must Be Done First)
| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| `/sign-up` page | technical | ✅ complete | Page already exists |
| Homepage component | technical | ✅ exists | Need to locate and modify |

### Downstream (Waiting on This)
| Dependent | Impact |
|-----------|--------|
| ST-P2-01-D (Registration Flow) | Users need access to reach form |

### Files This Task Touches
- `app/page.tsx` OR `pages/index.tsx` OR similar homepage component — MODIFY

### Files You Should NOT Touch
- `/sign-up` page components — Those belong to other tasks
- Authentication logic — Separate concern

---

## Model Guidance

**This task requires:** haiku

### If Haiku
- Instructions focus on finding homepage and adding a link/button
- Pattern: Follow existing button/link patterns in codebase
- No complex logic required, just UI modification

---

## Validation Checklist

Before claiming `needs-validation`:

### Evidence Required (PASTE ACTUAL OUTPUT)
```bash
$ cd /home/ubuntu/repos/melo && pwd
[PASTE OUTPUT]

$ ls -la {modified-homepage-file}
[PASTE OUTPUT]

$ git log --oneline -1
[PASTE OUTPUT]

$ pnpm build 2>&1 | tail -10 && echo "Exit: $?"
[PASTE OUTPUT]

$ pnpm test 2>&1 | tail -20 && echo "Exit: $?"
[PASTE OUTPUT]
```

### AC Verification
- [ ] AC-1 passes: Registration link visible on homepage
- [ ] Screenshot taken: `scheduler/validation/screenshots/melo-v2/ST-P2-01-A-AC-1.png`

---

## Completion Report Template

When done, write this to `scheduler/progress/ST-P2-01-A.md`:

```markdown
## Completion Report: ST-P2-01-A

**Status:** needs-validation
**Completed:** {timestamp}
**Worker:** {label}

### Files Changed
| File | Action | Verified |
|------|--------|----------|
| {path} | MODIFY | ls -la output |

### Commits
| Hash | Message | Verified |
|------|---------|----------|
| {hash} | Add registration link to homepage | git log output |

### Build Verification
\`\`\`
{actual build output}
\`\`\`

### Test Verification
\`\`\`
{actual test output}
\`\`\`

### AC Verification
- [ ] AC-1: Link visible and functional + screenshot path

### Self-Validation (Layer 1)
- Manual Check: Visited homepage, clicked link, reached /sign-up
- Result: PASS/FAIL
```

---
*Sub-task created from US-P2-01 breakdown — Critical for user registration discovery*