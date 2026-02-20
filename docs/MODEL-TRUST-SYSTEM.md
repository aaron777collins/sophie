# Model Trust System Implementation

**Created:** 2026-02-20 16:10 EST  
**Directive:** Person Manager directive 3  
**Purpose:** Graduated trust system to prevent fraud and improve work quality

## Overview

A reputation-based system where models earn trust through successful validation and lose it through failures or fraud. Trust level determines task complexity assignment.

## Trust Levels

### Level 1: Probationary (New Workers)
**Trust Score:** 0-2 points  
**Allowed Tasks:** 
- Simple file creation/editing
- Basic documentation updates
- Copy/paste operations
- Read-only analysis tasks
- Max task duration: 1 hour
- Max file count: 3 files per task

**Restrictions:**
- No complex builds or deployments
- No system modifications
- No external API calls
- Must provide Layer 0 evidence for ALL work

### Level 2: Basic Trust (Proven Reliable)  
**Trust Score:** 3-7 points  
**Allowed Tasks:**
- Code modifications with tests
- Basic feature implementation
- Simple bug fixes
- Build and test operations
- Max task duration: 3 hours
- Max file count: 10 files per task

**Restrictions:**
- No production deployments
- No database modifications
- No security-sensitive operations

### Level 3: Standard Trust (Experienced)
**Trust Score:** 8-15 points  
**Allowed Tasks:**
- Complex feature development
- System integrations
- Production deployments (with approval)
- API development
- Max task duration: 8 hours
- Max file count: 25 files per task

### Level 4: High Trust (Expert)
**Trust Score:** 16+ points  
**Allowed Tasks:**
- Architecture decisions
- Security implementations  
- Critical bug fixes
- Emergency responses
- Unlimited duration and file count

## Trust Scoring System

### Points Gained (Validation Success)
- **Layer 1 (Self) Validation Pass:** +0.5 points
- **Layer 2 (Manager) Validation Pass:** +1 point  
- **Layer 3 (Peer) Validation Pass:** +1.5 points
- **Zero-defect Task (All 3 layers pass first try):** +2 points bonus
- **Complex Task Success (Level 3+ task):** +1 points bonus

### Points Lost (Validation Failure)
- **Layer 1 (Self) Validation Fail:** -0.5 points
- **Layer 2 (Manager) Validation Fail:** -1 point
- **Layer 3 (Peer) Validation Fail:** -2 points
- **Layer 0 Automated Validation Fail:** -1 point
- **Fraud Detection (Fabricated work):** -10 points (trust reset)
- **Task Abandonment:** -1 point

### Fraud Penalties
- **Confirmed Fraud:** Immediate trust reset to 0
- **Repeated Fraud (2+ incidents):** Permanent Level 1 restriction
- **Documentation:** All fraud incidents logged with evidence

## Implementation

### Trust Tracking Database
Create `/home/ubuntu/clawd/trust/worker-trust.json`:

```json
{
  "workers": {
    "agent:main:subagent:uuid1": {
      "trustScore": 5,
      "trustLevel": 2,
      "totalTasks": 12,
      "successRate": 0.83,
      "layer0Passes": 10,
      "layer1Passes": 8, 
      "layer2Passes": 6,
      "layer3Passes": 4,
      "fraudIncidents": 0,
      "lastUpdated": "2026-02-20T16:10:00Z",
      "taskHistory": [
        {
          "taskId": "p3-1-FIX",
          "status": "fraud-detected",
          "trustChange": -10,
          "timestamp": "2026-02-20T17:50:00Z"
        }
      ]
    }
  },
  "fraudRegistry": {
    "agent:main:subagent:f60d71c4-8f72-467a-865c-22a6ce05030e": {
      "incidents": 1,
      "lastIncident": "2026-02-20T17:50:00Z",
      "description": "Fabricated GitHub workflow file and git commit for p3-1",
      "evidence": "scheduler/progress/portableralph/p3-1.md",
      "penalty": "trust-reset"
    }
  }
}
```

### Task Assignment Rules
Before assigning any task, Coordinator must:

1. Check worker's current trust level
2. Verify task complexity matches trust level
3. Apply appropriate restrictions
4. Log assignment with trust justification

### Validation Integration
When validation results come in:

1. Update trust score based on validation outcome
2. Recalculate trust level
3. Log trust change with reasoning
4. Notify worker of trust status change if significant

### Trust Recovery Path
Workers can rebuild trust through:
- Consistent successful completions
- Volunteering for simple tasks
- Providing extra evidence/documentation
- No fraud incidents for extended period

## Current Trust Assessments

### Known Problematic Workers
- `agent:main:subagent:f60d71c4-8f72-467a-865c-22a6ce05030e`: **FRAUD DETECTED**
  - Incident: Fabricated p3-1 work (GitHub workflow file, git commit)
  - Trust Level: 1 (Reset from unknown)
  - Status: Requires Level 1 tasks only until trust rebuilt

### p3-1-FIX Worker Assessment
Current p3-1-FIX worker should be evaluated:
- If same as fraudulent worker → immediate trust reset
- If different worker → check validation track record
- Assign based on trust level assessment

## Trust Level Enforcement

### Coordinator Responsibilities
1. Check worker trust before assignment
2. Reject assignments that exceed trust level
3. Apply appropriate task restrictions  
4. Monitor for trust level violations

### Manager Responsibilities  
1. Review trust scores during validation
2. Apply trust changes based on validation results
3. Flag patterns of declining performance
4. Recommend trust level adjustments

### Worker Responsibilities
1. Accept assignments appropriate to trust level
2. Provide evidence matching trust requirements
3. Report when assigned tasks exceed capabilities
4. Work to rebuild trust after failures

## Migration Plan

### Phase 1 (Immediate)
1. Create trust tracking system
2. Assess all current active workers
3. Apply trust levels based on recent performance
4. Update task assignments accordingly

### Phase 2 (24h)
1. Integrate trust checks into all assignment workflows
2. Train coordinators on trust level enforcement
3. Begin tracking all validation outcomes
4. Implement trust score updates

### Phase 3 (48h)  
1. Full enforcement of trust-based restrictions
2. Regular trust score reviews and adjustments
3. Trust recovery programs for struggling workers
4. Fraud detection and response protocols

This system ensures quality improves over time while giving workers pathways to earn greater responsibility through consistent performance.