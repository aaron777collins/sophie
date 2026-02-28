You are sub-agent MELO-P1-S06-leave-server-audit working on MELO Audit.

## YOUR TASK
Comprehensive audit of server leave functionality using TDD methodology

## BEFORE YOU START
1. Read ~/clawd/AGENTS.md (especially "As a Sub-Agent on a Proactive Task") 
2. Read ~/clawd/scheduler/progress/MELO-AUDIT/_manager.md
3. Read ~/clawd/scheduler/progress/MELO-P1-S06-leave-server-audit.md
4. Read ~/clawd/memory/projects/MELO-AUDIT/_overview.md

## REPO PATH
/home/ubuntu/clawd/projects/melo-v2

## 🧪 TDD APPROACH (MANDATORY)
**Follow Test-Driven Development:**
1. Write tests FIRST (before implementation)
2. Run tests — they should FAIL (red)  
3. Implement the feature
4. Run tests — they should PASS (green)
5. Refactor if needed (keep tests green)

## 🎯 CRITICAL THINKING CHECKPOINTS
**Apply Circle analysis for major decisions using:**
`scheduler/templates/CRITICAL-THINKING-CHECKPOINT-TEMPLATE.md`

**Required checkpoints when:**
- [ ] Task involves architectural decisions
- [ ] Security/compliance implications exist  
- [ ] Resource allocation exceeds 20 hours
- [ ] Integration with existing systems required
- [ ] Technology or approach selection needed

**Circle Perspectives to consider:**
- **Pragmatist:** Can we implement this practically?
- **Skeptic:** What could go wrong? What edge cases?
- **Guardian:** What security/risks need protection?
- **Dreamer:** How does this align with vision/future?

## TESTS TO WRITE
- Unit tests: `tests/units/leave-server.spec.ts`
- E2E tests: `tests/e2e/audit/MELO-P1-S06-leave-server.spec.ts`

## WHAT TO BUILD
- Server Leave Modal UI component
- Matrix SDK integration for leave functionality
- Comprehensive test suite for validation

## SUCCESS CRITERIA
- [ ] All unit tests pass: `pnpm test`
- [ ] All E2E tests pass: `pnpm test:e2e`  
- [ ] Build passes: `pnpm build`

## ⚠️ WHEN DONE (CRITICAL — DO ALL OF THESE!)
1. Update scheduler/progress/MELO-P1-S06-leave-server-audit.md with full work log
2. Update memory/projects/MELO-AUDIT/_overview.md
3. Git commit your changes
4. **🚨 UPDATE ~/clawd/PROACTIVE-JOBS.md:**
   - Change MELO-P1-S06-leave-server-audit `Status: in-progress` → `Status: needs-validation`
   - Add `Claimed Complete: 2026-02-27 22:30 EST` 
   - Add validation checklist:
     ```markdown
     - **Validation Checklist:**
       - Build: ✅/❌ `pnpm build`
       - Unit tests: ✅/❌ `pnpm test`
       - E2E tests: ✅/❌ `pnpm test:e2e`
       - Files created: `tests/units/leave-server.spec.ts`, `tests/e2e/audit/MELO-P1-S06-leave-server.spec.ts`
       - Git commit: TBD
     ```
   - ⚠️ DO NOT set `complete` — Coordinator/Validator will do that!
5. **DELETE your heartbeat:** `rm ~/clawd/scheduler/heartbeats/MELO-P1-S06-leave-server-audit.json`
6. Send brief Slack notification: "📋 MELO-P1-S06-leave-server-audit needs-validation"

⚠️ IF YOU SKIP STEPS 4-5, THE WHOLE SYSTEM STALLS!

## IF YOU GET STUCK
Document what you tried, mark status as blocked, explain the issue.