# Sub-Task: [ST-P2-01-B] Login Page Registration Link

**User Story:** US-P2-01 (see `scheduler/stories/melo-v2/phase2/US-P2-01-user-registration.md`)
**Epic:** MELO-V2-PHASE2-AUTHENTICATION
**Project:** melo-v2
**Status:** pending
**Assigned:** 
**Model:** haiku
**Created:** 2026-02-28

---

## Parent Story Context

**Story:** User Registration Implementation - users on sign-in page need path to create account
**ACs Covered:** AC-2 (Registration Access from Login Page)

---

## Task Description

**As a** developer implementing US-P2-01
**I need to** add a "Create an account" or "Register" link on the sign-in page that navigates to `/sign-up`
**So that** AC-2 will pass - users on login page can easily switch to registration

---

## Acceptance Criteria (Subset of Parent)

### AC-2: Registration Access from Login Page

**Given** a user on the sign-in page (`/sign-in`)
**When** they need to create a new account
**Then** they see a "Create an account" or "Register" link that navigates to `/sign-up`

**Implementation Verification:**
- [ ] Link is visible on sign-in page
- [ ] Links to `/sign-up`
- [ ] Text is clear ("Create an account", "Register", "Sign up" etc.)
- [ ] Follows existing styling patterns

---

## Explicit Instructions

**IMPORTANT:** Follow these steps exactly. Do not deviate.

### Step 1: Setup/Preparation
```bash
cd /home/ubuntu/repos/melo && pwd
git status
# Verify you're on main/correct branch
```

### Step 2: Locate Sign-in Page Component
```bash
# Find the sign-in page component
find . -name "*.tsx" -o -name "*.ts" | xargs grep -l "sign-in\|signin\|login" | grep -v node_modules
# Should find components related to sign-in/login page
```

### Step 3: Implementation
- File: `{path/to/signin/component}` (you'll need to identify this)
- Action: MODIFY
- Pattern to follow: Look for existing link patterns on auth pages

**Expected Implementation:**
1. Add "Create an account" link below or near the sign-in form
2. Use existing Link component from Next.js or UI library
3. Link should use `href="/sign-up"`
4. Place it logically (typically below form or in form footer)

```typescript
// Expected structure (adapt to actual sign-in component):
<div className="auth-footer">
  <p>Don't have an account?{" "}
    <Link href="/sign-up" className="auth-link">
      Create an account
    </Link>
  </p>
</div>
```

### Step 4: Testing
```bash
pnpm build
pnpm test
# Visit http://dev2.aaroncollins.info:3000/sign-in to verify link appears
```

### Step 5: Verification
- [ ] Sign-in page loads without errors
- [ ] Registration link is visible
- [ ] Link navigates to `/sign-up`
- [ ] Build passes: `pnpm build`
- [ ] Tests pass: `pnpm test`

---

## Contingencies

### What Could Go Wrong (Implementation Level)

| Risk | Detection | Resolution |
|------|-----------|------------|
| Sign-in component not found | grep returns unclear results | Look for app/sign-in/page.tsx, pages/signin.tsx |
| Multiple sign-in components | Multiple files found | Check app/sign-in/ directory first |
| Link styling doesn't match | Visual inspection | Check existing auth page link styles |
| Link placement unclear | UI looks awkward | Place below form, follow auth UX patterns |
| Build breaks | pnpm build fails | Check syntax, imports |

### If You Get Stuck
1. **Check the parent story** for context and expected behavior
2. **Visit existing `/sign-in` page** to understand current structure
3. **Look for similar auth links** in the codebase for patterns
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
| `/sign-in` page | technical | ✅ exists | Need to locate and modify |

### Downstream (Waiting on This)
| Dependent | Impact |
|-----------|--------|
| ST-P2-01-D (Registration Flow) | Users on login page need access path |

### Files This Task Touches
- `app/sign-in/page.tsx` OR similar sign-in component — MODIFY

### Files You Should NOT Touch
- `/sign-up` page components — Those belong to other tasks
- Authentication logic — Separate concern
- Homepage components — That's ST-P2-01-A

---

## Model Guidance

**This task requires:** haiku

### If Haiku
- Instructions focus on finding sign-in page and adding a link
- Pattern: Follow existing link patterns in auth components
- Simple UI modification, no complex logic

---

## Validation Checklist

Before claiming `needs-validation`:

### Evidence Required (PASTE ACTUAL OUTPUT)
```bash
$ cd /home/ubuntu/repos/melo && pwd
[PASTE OUTPUT]

$ ls -la {modified-signin-file}
[PASTE OUTPUT]

$ git log --oneline -1
[PASTE OUTPUT]

$ pnpm build 2>&1 | tail -10 && echo "Exit: $?"
[PASTE OUTPUT]

$ pnpm test 2>&1 | tail -20 && echo "Exit: $?"
[PASTE OUTPUT]
```

### AC Verification
- [ ] AC-2 passes: Registration link visible on sign-in page
- [ ] Screenshot taken: `scheduler/validation/screenshots/melo-v2/ST-P2-01-B-AC-2.png`

---

## Completion Report Template

When done, write this to `scheduler/progress/ST-P2-01-B.md`:

```markdown
## Completion Report: ST-P2-01-B

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
| {hash} | Add registration link to sign-in page | git log output |

### Build Verification
\`\`\`
{actual build output}
\`\`\`

### Test Verification
\`\`\`
{actual test output}
\`\`\`

### AC Verification
- [ ] AC-2: Link visible and functional + screenshot path

### Self-Validation (Layer 1)
- Manual Check: Visited /sign-in, clicked link, reached /sign-up
- Result: PASS/FAIL
```

---
*Sub-task created from US-P2-01 breakdown — Essential for users coming from login flow*