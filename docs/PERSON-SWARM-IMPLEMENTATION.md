# Person Swarm Implementation Plan

**Created:** 2026-02-20 16:25 EST
**Directive From:** Aaron Collins
**Status:** In Progress

## Executive Summary

Transform the current static agent hierarchy into a dynamic "person swarm" with:
1. Enhanced validation standards (login + click around, not just page renders)
2. Hire/fire capabilities for dynamic scaling
3. Performance tracking and evaluation
4. Claude Code integration for non-Slack work
5. Enforced TDD and real validation

---

## Part 1: Enhanced Validation Standards (CRITICAL)

### Current Problem
- Agents claim "validated" after seeing a page render
- No actual user flow testing (login, click, interact)
- False completions wasting time

### New Standard: Real Validation Protocol

```
┌─────────────────────────────────────────────────────────────────────┐
│   ⚠️  "PAGE RENDERS" IS NOT VALIDATION. LOGIN IS MANDATORY.  ⚠️    │
│                                                                     │
│   Every web app validation MUST include:                            │
│   1. Navigate to the app                                            │
│   2. LOGIN with test credentials                                    │
│   3. Click through at least 3 different sections                    │
│   4. Perform at least 1 create/update action                        │
│   5. Verify the action persisted                                    │
│   6. Take screenshots as evidence                                   │
│                                                                     │
│   "Login page renders" = AUTOMATIC REJECTION                        │
└─────────────────────────────────────────────────────────────────────┘
```

### Files to Update
- [ ] AGENTS.md - Add Real Validation Protocol
- [ ] scheduler/validator/IDENTITY.md - Reject page-render-only validations
- [ ] scheduler/workers/IDENTITY.md - Require full flow testing
- [ ] scheduler/coordinator/IDENTITY.md - Enforce standards
- [ ] docs/VERIFICATION-CHECKLIST.md - Add login requirement

---

## Part 2: Hire/Fire Person System

### Design Philosophy
- Each "person" is a persistent role with identity, notes, inbox
- Persons can be hired (created) or fired (archived)
- Track run frequency and cost
- Model selection: Sonnet/Opus for decisions, Haiku for execution

### Directory Structure
```
scheduler/
├── people/                    # Active persons
│   ├── {person-id}/
│   │   ├── IDENTITY.md        # Role, responsibilities
│   │   ├── JOBS.md            # Current assignments
│   │   ├── notes/             # Their working notes
│   │   ├── inbox/             # Messages to them
│   │   ├── outbox/            # Messages from them
│   │   └── metrics.json       # Performance tracking
│   └── ...
├── archived/                  # Fired persons
├── hiring/
│   ├── templates/             # Person templates
│   └── process.md             # How to hire
└── registry.json              # All persons, active status
```

### Person Registry Schema
```json
{
  "version": 1,
  "persons": {
    "person-id": {
      "name": "Display Name",
      "role": "Role description",
      "model": "sonnet|opus|haiku",
      "cronSchedule": "*/30 * * * *",
      "status": "active|suspended|archived",
      "hiredAt": "timestamp",
      "firedAt": null,
      "metrics": {
        "totalRuns": 0,
        "successRate": 0.0,
        "avgCostPerRun": 0.0,
        "lastRunAt": null
      }
    }
  }
}
```

### Hire Process
1. Identify need (performance gap, new responsibility)
2. Create person from template
3. Define clear responsibilities
4. Set cron schedule based on model cost
5. Register in registry

### Fire Process
1. Identify poor performance or redundancy
2. Archive person (don't delete)
3. Redistribute responsibilities
4. Update registry

### Cost-Based Scheduling
| Model | Run Frequency | Use Case |
|-------|--------------|----------|
| Haiku | Every 5-15 min | Heartbeats, job kicks, simple checks |
| Sonnet | Every 30-60 min | Task management, coordination |
| Opus | Every 2-4 hours | Strategic decisions, complex analysis |

---

## Part 3: Performance Evaluation System

### Metrics to Track
- Success rate (validated completions / attempts)
- Cost efficiency (output quality / tokens used)
- Time efficiency (task duration vs estimates)
- Fraud rate (fabricated work incidents)
- Escalation rate (issues needing higher level help)

### Evaluation Process
1. Person Manager runs evaluation (daily or weekly)
2. Uses The Circle/Counsel for deep analysis
3. Identifies struggling workers
4. Recommends: coaching, reassignment, firing, or hiring help

### Performance Categories
- **High Performer:** >90% success, low cost - increase responsibilities
- **Adequate:** 70-90% success - maintain current role
- **Struggling:** 50-70% success - coaching or role change
- **Failing:** <50% success or fraud - fire immediately

---

## Part 4: Claude Code Integration

### Architecture
```
┌─────────────────────────────────────────────────────────────────────┐
│                         SLACK CHANNEL                                │
│                              ↕                                       │
│                    ┌─────────────────┐                               │
│                    │  Slack Tether   │  (L1/L2 summaries only)       │
│                    │  (Haiku/Sonnet) │                               │
│                    └────────┬────────┘                               │
│                             ↓                                        │
│              ┌──────────────────────────────┐                        │
│              │      Claude Code Sessions     │                       │
│              │  (No gateway limits, parallel) │                      │
│              └──────────────────────────────┘                        │
│                    ↙     ↓     ↘                                     │
│              Worker  Worker  Worker                                  │
│              (TDD)   (TDD)   (TDD)                                   │
└─────────────────────────────────────────────────────────────────────┘
```

### When to Use Claude Code
- Any work not requiring immediate Slack response
- Complex multi-step tasks
- Sub-agent spawning (no gateway timeout issues)
- Long-running implementations

### When to Use Gateway/Clawdbot
- Direct Slack responses
- Quick status checks
- User interaction
- Summaries and announcements

### Session Tracking
- Registry in `memory/claude-sessions/`
- Track: purpose, project, cost, status
- Cleanup stale sessions

---

## Part 5: TDD & Validation Enforcement

### From Superpowers Skill
- Test before implement (RED → GREEN → REFACTOR)
- Validation is mandatory, not optional
- Real testing on test servers

### Enhanced Validation Checklist

```markdown
## Validation Evidence Required

### For Web Applications:
- [ ] Screenshot of login page
- [ ] Screenshot AFTER successful login
- [ ] Screenshot of 3+ different pages/sections
- [ ] Screenshot of create/update action
- [ ] Screenshot confirming action persisted
- [ ] Console log showing no JS errors
- [ ] Network tab showing no failed requests

### For APIs:
- [ ] curl/test results for all endpoints
- [ ] Error handling tested
- [ ] Edge cases covered

### For Libraries:
- [ ] Unit tests pass (with output)
- [ ] Integration tests pass (with output)
- [ ] Example usage works
```

---

## Execution Plan

### Phase 1: Update Validation Standards (TODAY)
1. Update AGENTS.md with Real Validation Protocol
2. Update all scheduler identity files
3. Create REAL-VALIDATION-CHECKLIST.md
4. Commit and announce

### Phase 2: Create Person System Structure (TODAY)
1. Create scheduler/people/ directory structure
2. Create registry.json
3. Create hiring templates
4. Migrate existing persons to new structure

### Phase 3: Performance Tracking (TODAY)
1. Add metrics.json to each person
2. Create evaluation cron job
3. Implement Circle-based performance review

### Phase 4: Claude Code Setup (TODAY)
1. Fix authentication (need API key from Aaron)
2. Install Superpowers
3. Create session tracking
4. Create Slack tether pattern

### Phase 5: Test & Iterate (ONGOING)
1. Run full system test
2. Hire/fire based on performance
3. Iterate on processes

---

## Dependencies

1. **Claude Code Auth:** Need API key from Aaron (OAuth expired)
2. **Test Credentials:** Need test accounts for each project
3. **Cron Permissions:** Ensure cron system can spawn new persons

---

## Success Criteria

1. ✅ No more "page renders" validations accepted
2. ✅ Dynamic person hiring/firing working
3. ✅ Performance metrics tracked for all persons
4. ✅ Claude Code sessions running for complex work
5. ✅ TDD enforced at all levels
6. ✅ Real validation with login/interaction required

---

*This plan addresses all of Aaron's requirements. Execute in phases, starting with validation standards.*
