# Coordinator Jobs

**Last Updated:** 2026-02-24 02:20 EST

---

## 🔴 ACTIVE: ConnectedDrivingPipelineV4 Fresh Run

**Priority:** CRITICAL
**Owner:** Sophie (Main Session) + Opus Audit Agent
**Status:** In Progress

### What's Happening

Sophie is running a **complete fresh restart** of all 36 pipelines on jaekel server:
1. ✅ All caches cleared
2. ✅ All results cleared
3. ✅ All logs cleared
4. ⏳ Opus audit in progress
5. ⏳ Fresh run will start after audit

### Your Role (Coordinator)

**DO NOT** spawn any tasks related to this project. Sophie is handling it directly.

**DO:**
- Monitor for issues via your regular heartbeat
- If you see errors related to jaekel pipeline, note them but don't act
- Let Sophie know via inbox if you observe problems

### Monitoring

- **Cron job:** `jaekel-pipeline-monitor` (Sonnet, every 15 min)
- **Dashboard:** http://65.108.237.46/pipeline-results/
- **Email:** Will be sent to Aaron + Josh when complete

### Timeline

- Audit: ~10 min
- 2km pipelines: ~30 min
- 100km pipelines: ~2-3 hours
- 200km pipelines: ~6-8 hours
- **Expected completion:** Morning (EST)

---

## Other Projects

All other projects (MELO V2, Proactive Job Enhancement) are **COMPLETE** per PROACTIVE-JOBS.md.

Focus on routine heartbeat checks only.
