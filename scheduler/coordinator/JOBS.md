# Coordinator Jobs

**Last Updated:** 2026-02-24 02:20 EST

---

## 🔴 BLOCKED: ConnectedDrivingPipelineV4 Fresh Run

**Priority:** CRITICAL
**Owner:** Sophie (Main Session)
**Status:** ⚠️ BLOCKED — Disk Full

### Current State (Updated 2026-02-25 20:00 EST)

| Metric | Value |
|--------|-------|
| **Progress** | 84/108 pipelines (78%) |
| **Failed** | 1 (disk full error) |
| **Remaining** | 23 pipelines |
| **Blocked by** | `/home` partition 100% full (420GB) |
| **Stopped at** | Feb 26 01:04 UTC |

### Issue Details

Pipeline #85 (`movementWithAll3Ids_2km_randoffset`) failed with:
```
OSError(28, 'No space left on device')
```

### Your Role (Coordinator)

**DO NOT** spawn any tasks related to this project. Sophie is handling it directly.

**Waiting for:**
1. Sophie to free disk space on jaekel
2. Pipeline restart to complete remaining 23 pipelines

### Monitoring

- **Dashboard:** http://65.108.237.46/pipeline-results/
- **Email:** Will be sent to Aaron + Josh when complete

### Expected Resolution

- Need ~10-20GB freed to complete remaining pipelines
- After cleanup, restart from pipeline 85

---

## Other Projects

All other projects (MELO V2, Proactive Job Enhancement) are **COMPLETE** per PROACTIVE-JOBS.md.

Focus on routine heartbeat checks only.
