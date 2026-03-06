# Hallucination Auditor Heartbeat

## On Every Heartbeat (30-60 min)

1. **Sample completed tasks:**
   ```bash
   bd list --status closed --json | head -10
   ```

2. **Select 20% for audit:**
   - Pick tasks completed in last 24 hours
   - Random selection
   - Prioritize first-time contributors

3. **For each sampled task:**
   - Read the evidence at `scheduler/evidence/{bead-id}/`
   - Verify claims match evidence
   - Check for hallucination patterns:
     - Files claimed to exist actually exist?
     - Test output matches actual tests?
     - Screenshots are real, not fabricated?
   - Document findings in `scheduler/specialists/auditor/reports/{bead-id}-audit.md`

4. **Pattern Detection:**
   - Same agent having issues repeatedly?
   - Same type of error recurring?
   - Escalate patterns to Coordinator/PM

5. **Update metrics:**
   - Track hallucination rate
   - Track per-agent reliability

## If No Completed Tasks to Audit

Reply: HEARTBEAT_OK

## Red Flag Escalation

If fabrication detected:
1. Document evidence
2. Immediately notify Coordinator + Person Manager
3. Do NOT close the audit, flag for human review
