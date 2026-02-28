# Sub-Task: [ST-P2-01-C] Registration Form Validation

**User Story:** US-P2-01 (see `scheduler/stories/melo-v2/phase2/US-P2-01-user-registration.md`)
**Epic:** MELO-V2-PHASE2-AUTHENTICATION
**Project:** melo-v2
**Status:** pending
**Assigned:** 
**Model:** sonnet
**Created:** 2026-02-28

---

## Parent Story Context

**Story:** User Registration Implementation - registration form needs proper validation
**ACs Covered:** AC-3 (Form Fields), AC-6 (Email Validation), AC-7 (Password Mismatch), AC-9 (Password Strength)

---

## Task Description

**As a** developer implementing US-P2-01
**I need to** implement comprehensive form validation for the registration form
**So that** AC-3, AC-6, AC-7, and AC-9 will pass - users get proper feedback on form inputs

---

## Acceptance Criteria (Subset of Parent)

### AC-3: Registration Form Fields Display

**Given** a user on the registration page (`/sign-up`)
**When** the page loads
**Then** they see a form with: username field, email field, password field, confirm password field, and submit button

### AC-6: Validation Error - Invalid Email Format

**Given** a user entering an invalid email (e.g., "notanemail")
**When** they attempt to submit
**Then** they see inline validation error on the email field

### AC-7: Validation Error - Password Mismatch

**Given** a user with mismatched password and confirm password fields
**When** they attempt to submit
**Then** they see an error indicating passwords don't match

### AC-9: Password Strength Requirements

**Given** a user entering a weak password (e.g., "123")
**When** they attempt to submit
**Then** they see clear password requirements (minimum 8 characters, etc.)

**Implementation Verification:**
- [ ] All required form fields present
- [ ] Email validation works (regex/Zod)
- [ ] Password confirmation validation
- [ ] Password strength requirements enforced
- [ ] Error messages are user-friendly

---

## Explicit Instructions

**IMPORTANT:** Follow these steps exactly. Do not deviate.

### Step 1: Setup/Preparation
```bash
cd /home/ubuntu/repos/melo && pwd
git status
# Verify you're on main/correct branch
```

### Step 2: Locate Registration Page Component
```bash
# Find the sign-up page component
find . -path "*/sign-up/*" -name "*.tsx" -o -name "page.tsx" | xargs grep -l "sign.*up\|register" | head -5
# Look for app/sign-up/page.tsx or similar
```

### Step 3: Examine Current Implementation
```bash
# Check what form fields and validation already exist
grep -r "username\|email\|password" app/sign-up/ || echo "Directory not found"
```

### Step 4: Implementation

- File: `{path/to/signup/component}` (you'll need to identify this)
- Action: MODIFY
- Pattern to follow: Use React Hook Form + Zod validation (check existing auth patterns)

**Expected Implementation:**

1. **Ensure all required fields exist:**
```typescript
// Form fields required:
<input name="username" type="text" placeholder="Username" />
<input name="email" type="email" placeholder="Email" />
<input name="password" type="password" placeholder="Password" />
<input name="confirmPassword" type="password" placeholder="Confirm Password" />
<button type="submit">Create Account</button>
```

2. **Add Zod validation schema:**
```typescript
import { z } from 'zod';

const registrationSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});
```

3. **Add React Hook Form integration:**
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const form = useForm({
  resolver: zodResolver(registrationSchema)
});
```

4. **Add error display for each field**

### Step 5: Testing
```bash
pnpm build
pnpm test
# Test form validation on http://dev2.aaroncollins.info:3000/sign-up
```

### Step 6: Manual Validation Testing
- [ ] Test invalid email (should show error)
- [ ] Test password mismatch (should show error)
- [ ] Test weak password (should show requirements)
- [ ] Test all fields present and functional

---

## Contingencies

### What Could Go Wrong (Implementation Level)

| Risk | Detection | Resolution |
|------|-----------|------------|
| Sign-up component not found | Find command fails | Check app/auth/, pages/signup.tsx, or similar |
| Zod not installed | Import error | Check package.json, install if needed |
| React Hook Form conflicts | Build errors | Check existing form patterns in codebase |
| Validation doesn't trigger | Form submits without validation | Check form setup, onSubmit handler |
| Styling breaks | UI looks broken | Follow existing form styling patterns |

### If You Get Stuck
1. **Check the parent story** for context and expected validation behavior
2. **Look for existing form patterns** in the codebase (auth pages, other forms)
3. **Check package.json** for existing validation libraries
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
| `/sign-up` page | technical | ✅ exists | Page structure should already exist |
| Zod library | technical | ❓ unknown | Check if installed, install if needed |
| React Hook Form | technical | ❓ unknown | Check if used elsewhere in codebase |

### Downstream (Waiting on This)
| Dependent | Impact |
|-----------|--------|
| ST-P2-01-D (Registration Flow) | Form validation must work for flow to function |
| ST-P2-01-E (Mobile Design) | Validation errors need to display properly |

### Files This Task Touches
- `app/sign-up/page.tsx` OR similar registration component — MODIFY
- Potentially validation schema files — CREATE/MODIFY

### Files You Should NOT Touch
- Authentication logic (login handling) — That's a separate task
- Homepage/login page links — Other sub-tasks handle those

---

## Model Guidance

**This task requires:** sonnet

### If Sonnet
- Form validation requires some problem-solving and pattern matching
- Need to understand React Hook Form + Zod integration
- May need to make decisions about validation UX patterns
- Follow existing patterns but adapt to registration form needs

---

## Validation Checklist

Before claiming `needs-validation`:

### Evidence Required (PASTE ACTUAL OUTPUT)
```bash
$ cd /home/ubuntu/repos/melo && pwd
[PASTE OUTPUT]

$ ls -la {modified-signup-files}
[PASTE OUTPUT]

$ git log --oneline -1
[PASTE OUTPUT]

$ pnpm build 2>&1 | tail -10 && echo "Exit: $?"
[PASTE OUTPUT]

$ pnpm test 2>&1 | tail -20 && echo "Exit: $?"
[PASTE OUTPUT]
```

### AC Verification
- [ ] AC-3 passes: All form fields present
- [ ] AC-6 passes: Email validation works
- [ ] AC-7 passes: Password mismatch detection
- [ ] AC-9 passes: Password strength requirements
- [ ] Screenshots taken for each AC

---

## Completion Report Template

When done, write this to `scheduler/progress/ST-P2-01-C.md`:

```markdown
## Completion Report: ST-P2-01-C

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
| {hash} | Implement registration form validation | git log output |

### Build Verification
\`\`\`
{actual build output}
\`\`\`

### Test Verification
\`\`\`
{actual test output}
\`\`\`

### AC Verification
- [ ] AC-3: All form fields present + screenshot
- [ ] AC-6: Email validation working + screenshot
- [ ] AC-7: Password mismatch error + screenshot  
- [ ] AC-9: Password strength requirements + screenshot

### Self-Validation (Layer 1)
- Tested: Invalid email, weak password, password mismatch
- Result: PASS/FAIL
```

---
*Sub-task created from US-P2-01 breakdown — Critical form validation for user registration*