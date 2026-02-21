# Claude Code Workflow for Workers
**Created:** 2026-02-20  
**Purpose:** Prevent false claims by separating implementation from validation  
**Requirement:** MANDATORY for all implementation tasks

---

## Why This Workflow Exists

**Problem:** Workers were making false completion claims due to biased self-validation:
- p3-3: Claimed "successful execution" when CI actually failed (3/5 jobs passed)  
- p3-4: Claimed "67% success rate" when actual rate was 0% (0/6 runs passed)

**Solution:** Separate implementation from validation using independent agents:
1. **Claude Code** = Professional implementation (no bias toward "completion")
2. **Independent sub-agent** = Fresh perspective validation (no implementation knowledge)
3. **Worker** = Orchestration only (no pressure to claim success)

---

## The Complete Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLAUDE CODE WORKFLOW                     │
│                                                                     │
│  Worker ──► Claude Code ──► Implementation ──► Validation Sub-Agent │
│     │           │                                        │          │
│     │           └── Professional Standards               │          │
│     │                                                    ▼          │
│     └─────────────────► Only claim success if validation PASSES    │
└─────────────────────────────────────────────────────────────────────┘
```

### Stage 1: Worker Setup
- Receives task from Task Manager/Coordinator  
- Reads task requirements and acceptance criteria
- Sets up project environment
- **Does NOT implement directly** → delegates to Claude Code

### Stage 2: Claude Code Implementation  
- Receives clean task description (no worker bias)
- Implements using professional standards:
  - TDD approach (tests first)
  - Comprehensive error handling
  - Clean, maintainable code
  - Proper documentation
- Claims "done" when implementation complete

### Stage 3: Independent Validation
- Worker spawns fresh sub-agent (Sonnet+) 
- Sub-agent has NO implementation context
- Tests on actual test server (not localhost)
- Provides objective pass/fail result

### Stage 4: Worker Decision
- **If validation PASSES:** Claim `needs-validation`
- **If validation FAILS:** Return to Stage 2 (fix issues)
- **Never claim success without validation proof**

---

## Step-by-Step Commands

### Step 1: Start Claude Code Session

```bash
# Navigate to project directory
cd /path/to/project  # e.g., /home/ubuntu/repos/melo

# Spawn Claude Code with PTY (required!)
bash pty:true workdir:$(pwd) background:true command:"claude --model opus '
IMPLEMENTATION TASK: {task-id}

{paste full task description here}

REQUIREMENTS:
- Use TDD approach (write tests first)
- Follow professional coding standards
- Implement comprehensive error handling
- Add proper documentation
- Ensure code is production-ready

When implementation is complete, run:
clawdbot gateway wake --text \"Implementation complete: {task-id}\" --mode now
'"

# Save the session ID returned for monitoring
export CLAUDE_SESSION_ID=XXX
```

### Step 2: Monitor Claude Code Progress

```bash
# Check progress periodically
process action:log sessionId:$CLAUDE_SESSION_ID limit:50

# Check if still running
process action:poll sessionId:$CLAUDE_SESSION_ID

# If Claude Code asks questions, respond via:
process action:submit sessionId:$CLAUDE_SESSION_ID data:"your response"
```

### Step 3: When Claude Code Claims Done

**CRITICAL:** Do NOT trust the claim. Immediately validate independently.

```bash
# Spawn independent validation sub-agent
sessions_spawn with:
  - model: sonnet  # MINIMUM (Haiku not allowed for validation)
  - task: "INDEPENDENT VALIDATION TASK

    You are validating work for task: {task-id}
    Project: {project-name}
    
    CRITICAL: You have NO CONTEXT about how this was implemented.
    You receive only the original requirements and must test objectively.
    
    **ORIGINAL TASK:** 
    {paste exact task description and acceptance criteria}
    
    **TEST SERVER:** {specify - e.g., https://dev2.aaroncollins.info}
    **TEST CREDENTIALS:** Located in ~/.env.test-credentials
    
    VALIDATION PROTOCOL (ALL STEPS REQUIRED):
    
    1. MANDATORY LOGIN PHASE:
       - Navigate to test server
       - Screenshot: Login page  
       - Login with test credentials
       - Screenshot: Post-login dashboard/main view
       - FAILURE TO LOGIN = AUTOMATIC REJECTION
    
    2. FEATURE TESTING PHASE:
       - Test each acceptance criterion individually
       - Navigate to at least 3 different sections
       - Perform actual user interactions (not just viewing)
       - Screenshot key steps as evidence
    
    3. ERROR CHECKING PHASE:
       - Check browser console: No JavaScript errors
       - Check server logs: ssh {server} 'pm2 logs {app} --lines 30 --nostream'
       - No critical errors should be present
    
    4. COMPREHENSIVE TESTING:
       - Test ALL features, not just the one changed
       - Verify no regressions in existing functionality
       - Test edge cases and error conditions
    
    REPORT FORMAT:
    - VERDICT: PASS or FAIL
    - EVIDENCE: Screenshots and log excerpts
    - ISSUES: List any problems found
    - ACCEPTANCE CRITERIA: Check each one individually
    
    REMEMBER: You are the independent verification layer.
    Be thorough and objective. Do not assume anything works."

# Save validation session ID
export VALIDATION_SESSION_ID=YYY
```

### Step 4: Review Validation Results

```bash
# Get validation report
process action:log sessionId:$VALIDATION_SESSION_ID

# Based on validation result:
if [[ validation_result == "PASS" ]]; then
    # Proceed to completion claim
    echo "Validation passed - ready to claim needs-validation"
else
    # Return to Claude Code for fixes
    echo "Validation failed - sending issues back to Claude Code"
    process action:submit sessionId:$CLAUDE_SESSION_ID data:"
    Validation found these issues: {paste validation issues}
    Please fix these and re-test."
fi
```

### Step 5: Completion (Only If Validation Passes)

```bash
# Update task status in PROACTIVE-JOBS.md
# Write completion report with validation evidence
# Send notification to Slack

# Example completion report format:
cat >> scheduler/progress/{task-id}.md << 'EOF'
## Completion Report - Claude Code Workflow

### Implementation Phase
- **Claude Code Session:** $CLAUDE_SESSION_ID  
- **Duration:** {duration}
- **Implementation Approach:** TDD with professional standards

### Independent Validation Phase  
- **Validation Session:** $VALIDATION_SESSION_ID
- **Validator Model:** Sonnet (fresh perspective)
- **Test Server:** {server-url}
- **Validation Result:** PASS ✅

### Evidence
- Login successful: [screenshot]
- Feature testing: [screenshots]  
- Server logs clean: [log excerpt]
- All acceptance criteria verified

### Final Status
Ready for needs-validation - implementation and independent validation complete.
EOF
```

---

## Test Server Configurations

### Melo v2
- **URL:** https://dev2.aaroncollins.info
- **Credentials:** `sophietest` / (see ~/.env.test-credentials)
- **Server Logs:** `ssh dev2 "pm2 logs melo --lines 30 --nostream"`

### PortableRalph  
- **Test Method:** GitHub Actions CI
- **Validation:** Check workflow run results
- **Logs:** CI workflow output

### Other Projects
- Check project documentation for test server details
- Always test on designated test server, never localhost

---

## Common Patterns

### For UI Features
```bash
# Claude Code implementation
claude --model opus 'Build login form with validation

Requirements:
- Form validation (email, password)
- Error handling and display  
- Integration with existing auth system
- E2E tests for user flow

Use TDD approach.'

# Validation focus areas
# - Form renders correctly
# - Validation messages appear  
# - Successful login works
# - Error cases handled properly
```

### For API Development
```bash
# Claude Code implementation  
claude --model opus 'Build REST API endpoints for user management

Requirements:
- CRUD operations (Create, Read, Update, Delete)
- Input validation and sanitization
- Error handling with proper HTTP codes
- Unit tests and integration tests

Follow OpenAPI specification.'

# Validation focus areas
# - All endpoints return correct data
# - Error codes match specification
# - Input validation works
# - Authentication required where needed
```

### For Bug Fixes
```bash
# Claude Code implementation
claude --model opus 'Fix authentication redirect loop

Current Issue: Users get stuck in redirect loop after login
Investigation needed: Session handling, redirect logic
Expected: Clean login flow to dashboard

Write tests that reproduce the bug first, then fix.'

# Validation focus areas  
# - Bug no longer reproduces
# - Login flow works correctly
# - No new regressions introduced
# - Edge cases tested
```

---

## Troubleshooting

### Claude Code Issues

**Issue:** Claude Code session hangs
**Solution:** 
```bash
process action:poll sessionId:XXX  # Check if still running
process action:kill sessionId:XXX  # Kill if hung
# Restart with simpler prompt
```

**Issue:** Claude Code asks too many questions  
**Solution:**
```bash
# Be more specific in initial prompt
claude --model opus 'Build X feature. Use these specific technologies: Y. 
Auto-approve reasonable implementation decisions. 
Only ask about major architectural choices.'
```

### Validation Issues

**Issue:** Validation sub-agent can't login
**Solution:**
- Check test credentials in ~/.env.test-credentials  
- Verify test server is running
- Try manual login to confirm server state

**Issue:** Validation is too strict/too lenient
**Solution:**  
- Adjust validation prompt specificity
- Include more detailed acceptance criteria
- Ask validator to focus on specific areas

### Communication Issues

**Issue:** Sessions not communicating
**Solution:**
```bash
# Check session status
process action:list
process action:poll sessionId:XXX

# Manual handoff if needed
# Get Claude Code output → paste to validator  
# Get validation report → paste to Claude Code
```

---

## Success Metrics

This workflow succeeds when:

### Objective Measures
- [ ] **Zero false completion claims** (success = actual success)
- [ ] **Independent validation passes** before any completion claim
- [ ] **Test server validation** (not localhost assumptions)  
- [ ] **Evidence-based reporting** (screenshots, logs, test results)

### Process Measures  
- [ ] **Clean separation** of implementation vs validation
- [ ] **Fresh perspective** validation (no implementation bias)
- [ ] **Professional implementation** standards via Claude Code
- [ ] **Reduced manager rework** from false claims

### Quality Measures
- [ ] **TDD approach** used consistently  
- [ ] **Comprehensive error handling** implemented
- [ ] **No regressions** introduced in existing functionality
- [ ] **Production-ready code** delivered

---

## Examples and Templates

### Task Types and Templates

**Feature Development Template:**
```bash
claude --model opus "FEATURE: {feature-name}

USER STORY: {user-story}

ACCEPTANCE CRITERIA:
- {criterion-1}  
- {criterion-2}
- {criterion-3}

TECHNICAL REQUIREMENTS:
- Use TDD approach
- Follow existing code patterns  
- Add comprehensive error handling
- Include E2E tests for user flows
- Update documentation

When complete, wake with summary of implementation."
```

**Bug Fix Template:**
```bash
claude --model opus "BUG FIX: {bug-description}

CURRENT BEHAVIOR: {what-happens-now}
EXPECTED BEHAVIOR: {what-should-happen}

INVESTIGATION APPROACH:
1. Write test that reproduces the bug
2. Identify root cause through debugging  
3. Implement minimal fix
4. Verify test passes
5. Check for related edge cases

CONSTRAINTS:
- Minimal code changes preferred
- Must not introduce regressions
- Include regression test

When fixed, wake with fix summary."
```

### Validation Templates

**UI Feature Validation:**
```markdown
VALIDATION CHECKLIST for {feature}:

LOGIN PHASE:
□ Navigate to {test-server}
□ Screenshot login page  
□ Login with test credentials
□ Screenshot post-login view

FEATURE TESTING:
□ Navigate to feature: {feature-path}
□ Screenshot feature view
□ Test user interaction: {action-1}  
□ Screenshot result
□ Test user interaction: {action-2}
□ Screenshot result

ERROR CHECKING:
□ Browser console: No critical errors
□ Server logs: No critical errors  
□ Network tab: Successful API calls

ACCEPTANCE CRITERIA:
□ {criterion-1}: {how-tested}
□ {criterion-2}: {how-tested}  
□ {criterion-3}: {how-tested}
```

---

## Training Notes

### For New Workers
1. **Always use this workflow** for implementation tasks
2. **Never skip validation** - it's the core fraud prevention
3. **Trust the process** - independent validation catches issues you miss  
4. **Document everything** - evidence is mandatory

### Common Mistakes to Avoid
1. **Skipping Claude Code** and implementing directly (introduces bias)
2. **Skipping validation** because "it looks right" (enables false claims)
3. **Testing on localhost** instead of test server (misses deployment issues)
4. **Rushing validation** without comprehensive testing (defeats the purpose)

### When This Workflow Applies
- **USE FOR:** Any implementation task (features, bug fixes, refactoring)
- **DON'T USE FOR:** Pure documentation tasks, simple configuration changes  
- **BORDERLINE CASES:** Ask Task Manager if unsure

---

This workflow is designed to make **telling the truth easier than lying** by providing independent verification and professional implementation standards.