# Person Manager Evening Check — 2026-02-25 20:00 EST

## 🚨 CRITICAL: Pipeline Stopped - Disk Full

**Discovered:** 2026-02-25 20:00 EST (during routine check)
**Impact:** Wyoming pipeline STOPPED at 78% complete

### Issue Summary

| Metric | Value |
|--------|-------|
| **Pipelines Complete** | 84/108 (78%) |
| **Pipelines Failed** | 1 (`movementWithAll3Ids_2km_randoffset`) |
| **Remaining** | 23 pipelines |
| **Root Cause** | Disk full: `/home` at 100% (420G/420G) |
| **Stopped At** | Feb 26 01:04 UTC (~56 min ago) |

### Disk Status on jaekel

```
Filesystem            Size  Used Avail Use% Mounted on
/dev/mapper/vg0-home  420G  399G     0 100% /home    ← CRITICAL
/dev/mapper/vg0-var   393G  1.6G  372G   1% /var
/dev/mapper/vg0-root   59G  2.4G   54G   5% /
```

### Error Details

```
2026-02-26 01:04:35 - distributed.worker - ERROR - Compute Failed
Exception: "OSError(28, 'No space left on device')"
FAILED: movementWithAll3Ids_2km_randoffset - [Errno 28] No space left on device
```

### What Happened

1. Pipeline ran successfully through 84 completions
2. Pipeline #85 (`movementWithAll3Ids_2km_randoffset`) started
3. Dask attempted to write parquet partitions
4. Disk ran out of space mid-write
5. Pipeline failed and script terminated

### Immediate Actions Required

1. **Free disk space on jaekel `/home`** — old runs, logs, caches
2. **Restart pipeline** from where it left off (84/108)
3. **Monitor completion** of remaining 23 pipelines

### Potential Space Savings

- Old pipeline results in `/var/www/static/pipeline-results/` (if any)
- Cache files in `data/classifierdata/splitfiles/`
- Logs in older date directories
- `.venv` cache files

### Status

- **System Health:** DEGRADED (pipeline blocked)
- **Owner:** Sophie (Main Session) — ALERTING NOW
- **Priority:** HIGH — affects Aaron's research timeline

---

*This check discovered the pipeline failure. Sophie is being notified.*
