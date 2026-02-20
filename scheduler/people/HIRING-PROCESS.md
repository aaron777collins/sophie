# Hiring & Firing Process

**Version:** 1.0
**Created:** 2026-02-20
**Authority:** Person Manager (primary), Sophie (override)

## Overview

The Person Swarm is a dynamic workforce. Persons can be hired (created) or fired (archived) based on organizational needs and performance.

---

## Hiring Process

### When to Hire

1. **Capacity Issues:** Existing persons are overloaded
2. **New Responsibility:** Work that doesn't fit existing roles
3. **Specialization:** Need for domain expertise
4. **Redundancy:** Critical functions need backup

### How to Hire

1. **Identify Need**
   - Document the gap
   - Define responsibilities clearly
   - Determine model tier (Haiku/Sonnet/Opus)

2. **Create Person Directory**
   ```bash
   mkdir -p scheduler/people/{person-id}/
   mkdir -p scheduler/people/{person-id}/notes
   mkdir -p scheduler/people/{person-id}/inbox
   mkdir -p scheduler/people/{person-id}/outbox
   ```

3. **Create IDENTITY.md**
   Use template from `scheduler/people/templates/IDENTITY-TEMPLATE.md`

4. **Create JOBS.md**
   Empty initially, or with starter tasks

5. **Create metrics.json**
   ```json
   {
     "totalRuns": 0,
     "successfulRuns": 0,
     "failedRuns": 0,
     "fraudIncidents": 0,
     "avgCostPerRun": 0.0,
     "lastRunAt": null,
     "hiredAt": "ISO-timestamp"
   }
   ```

6. **Register in registry.json**
   Add entry to `persons` object

7. **Set Up Cron**
   Add to cron configuration based on model tier

### Model Selection Guidelines

| Responsibility Type | Model | Cron Frequency |
|---------------------|-------|----------------|
| Simple execution, heartbeats | Haiku | 5-15 min |
| Task coordination, validation | Sonnet | 30-60 min |
| Strategic decisions, analysis | Opus | 2-4 hours |

---

## Firing Process

### When to Fire

1. **Chronic Poor Performance:** <50% success rate over 1 week
2. **Fraud:** Any fabricated work incident
3. **Redundancy:** Role no longer needed
4. **Consolidation:** Merging responsibilities

### How to Fire

1. **Document Reason**
   - Performance data
   - Specific incidents
   - Business rationale

2. **Archive (Don't Delete)**
   ```bash
   mv scheduler/people/{person-id} scheduler/archived/{person-id}-{date}
   ```

3. **Update Registry**
   - Set `status: "archived"`
   - Set `firedAt: "timestamp"`
   - Add to `hiring.recentFires`

4. **Redistribute Work**
   - Reassign pending tasks
   - Update relevant JOBS.md files

5. **Post-Mortem**
   - What went wrong?
   - How to prevent?
   - Document in `scheduler/archived/{person-id}/POST-MORTEM.md`

### Immediate Fire Conditions

- **Fraud detected:** Fire immediately, no review needed
- **Repeated validation failures:** Fire after 3 consecutive failures
- **Insubordination:** Not following established protocols

---

## Performance Evaluation

Person Manager conducts evaluations:

### Metrics Tracked

| Metric | Good | Warning | Fire |
|--------|------|---------|------|
| Success Rate | >90% | 70-90% | <50% |
| Fraud Rate | 0% | 0% | >0% |
| Cost Efficiency | On budget | +20% | +50% |
| Response Time | On time | +50% delay | +100% delay |

### Evaluation Schedule

- **Haiku persons:** Weekly review
- **Sonnet persons:** Bi-weekly review
- **Opus persons:** Monthly review

### The Circle for Deep Analysis

For struggling workers, use The Circle:
1. Spawn Sonnet agents with different perspectives
2. Analyze patterns in failures
3. Identify root causes
4. Recommend: coaching, role change, or firing

---

## Templates

See `scheduler/people/templates/` for:
- IDENTITY-TEMPLATE.md
- JOBS-TEMPLATE.md
- metrics-template.json

---

## Audit Trail

All hiring/firing decisions logged in:
- `scheduler/people/registry.json` (current state)
- `memory/daily/YYYY-MM-DD.md` (event log)
- Person's directory (detailed records)
