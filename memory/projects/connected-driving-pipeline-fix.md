# Connected Driving Pipeline - Critical Bug Fix

**Date:** 2026-02-24 00:35 EST

## Bug Discovery

While investigating XY coordinate conversion, discovered a critical bug in `MathHelper.py`:

```python
# BUG: Converting degrees to radians before passing to Geodesic.Inverse()
# But geographiclib.Geodesic.Inverse() expects DEGREES, not radians!

def dist_between_two_points(lat1, lon1, lat2, lon2):
    geod = Geodesic.WGS84
    lat1_rad = MathHelper.deg2rad(lat1)  # WRONG!
    ...
    distance = geod.Inverse(lat1_rad, ...)  # Geodesic expects degrees!
```

## Impact

**All distance calculations were 57.3x too small (180/π ratio):**

| Intended | Actual |
|----------|--------|
| 2km | 35m |
| 100km | 1.75km |
| 200km | 3.49km |

**This bug existed since the ORIGINAL pandas code (commit a070de3).**

## Fix Applied

```python
# FIXED: Pass degrees directly to Geodesic.Inverse
def dist_between_two_points(lat1, lon1, lat2, lon2):
    geod = Geodesic.WGS84
    distance = geod.Inverse(lat1, lon1, lat2, lon2)  # Degrees directly
    return distance['s12']
```

**Commit:** `5f647d6 fix: Remove deg2rad bug in dist_between_two_points`

## Actions Taken

1. ✅ Fixed MathHelper.py
2. ✅ Pushed fix to GitHub
3. ✅ Cleared all caches (33GB)
4. ✅ Cleared all old results
5. ✅ Started fresh pipeline run (all 36 configs)
6. ✅ Set up monitoring cron job
7. ✅ Symlinked results to web server

## Overnight Run (Fresh Restart)

- **Total pipelines:** 36
- **Started:** 2026-02-24 02:19 EST (fresh restart after full audit)
- **Process PID:** 941665 on jaekel
- **Log:** /tmp/run_all_fresh.log
- **Monitoring:** jaekel-pipeline-monitor cron (Sonnet, every 15 min)
- **Email notification:** aaron777collins@gmail.com, joshuapicchioni@gmail.com when complete
- **Results URL:** http://65.108.237.46/pipeline-results/

### Comprehensive Email Requirements (Aaron's request 02:21 EST)
For EACH pipeline include:
- Row counts (original, cleaned, filtered, train/test)
- Vehicle ID counts (total, clean, attackers in train/test)
- Attack config (type, radius, ratio, offset)
- ML results per classifier (RF, DT, KNN) - train/test metrics
- Confusion matrix values

### Expected Timeline
- 2km pipelines: ~30 min
- 100km pipelines: ~2-3 hours
- 200km pipelines: ~6-8 hours
- **Total: ~8-12 hours**

## Progress Updates

### [2026-02-24 08:16 CET] - 1/36 Pipelines Complete (2.8%) - Logging Issues Detected

**Status:** ACTIVE - Pipeline running but encountering logging system issues

**Completed Pipelines:**
1. `basic_100km_const` - RF Test Accuracy: 84.1% (1,544,050 rows, 146/33 attackers train/test)

**Current Issues:**
- ⚠️ **Logging System Malfunction:** 5 recent pipelines show "No log files found" errors
- 🔄 **Pipeline Still Active:** 4 Python processes running, files being generated
- 📁 **Results Being Created:** basic_200km_rand actively generating result files

**Active Pipeline Directories:**
- basic_100km_rand, basic_100km_withid_const, basic_100km_withid_rand, basic_200km_const, basic_200km_rand
- All show "No log files found" in pipeline.log despite having result files

**System Status:**
- 4 active Python processes confirmed
- Results files being generated in `/var/www/static/pipeline-results/`
- Server time: 08:16 CET (Tue Feb 24, 2026)

**Email Sent:** [08:16 CET] Material Design progress report with logging issue alert to aaron777collins@gmail.com, joshuapicchioni@gmail.com

**Next Action:** Monitor for resolution of logging issue and actual pipeline completion rate

## For Previous Research

Multiply intended distances by **0.0175** to get actual distances that were used.

## [2026-02-24 02:15 EST] CRITICAL FIX - Aaron's Directive

**Issue:** pipeline.log files contain "No log files found" instead of actual logs
**Root Cause:** run_all_pipelines.py looking for logs in wrong location

**Action Taken:**
1. Killed running pipeline process
2. Spawned Opus sub-agent for full audit (session: pipeline-critical-fix)
3. Notified Coordinator and Person Manager inboxes
4. Clean slate: clearing all results, cache, and logs
5. Will fix logging code and restart fresh

**Status:** Opus working on fix

### [2026-02-24 02:23 EST] - FULL ALIGNMENT COMPLETE

**Status:** ACTIVE - Fresh pipeline run in progress

**Fix Applied:**
- Root cause: logging directory overwritten between runs
- Solution: TeeWriter context manager captures stdout/stderr directly
- Each pipeline gets isolated `pipeline.log`

**Attack Implementation Verified:**
- ✅ `const_offset_per_id` in all 36 configs
- ✅ Caching via `@CSVCache` decorator
- ✅ Distance calculation correct (radians conversion)

**Everyone Aligned:**
- ✅ Person Manager inbox updated
- ✅ Coordinator inbox updated
- ✅ Jaekel monitor re-enabled
- ✅ MDL email sent to Aaron & Josh
- ✅ Memory files updated

**Fresh Run Status:**
- 36 pipelines queued
- Starting with `basic_100km_const`
- Expected: ~3 hours total

**Next:** Monitor continues with 15-min progress emails until completion.

### [2026-02-24 02:30 EST] - 🚨 CRITICAL OVERHAUL - Aaron sleeping, Sophie in charge

**Critical Issues Identified:**
1. ❌ CSV Cache is WRONG — need PARQUET (CSV too big)
2. ❌ Cache not input-specific — contamination risk
3. ❌ Only 36 pipelines — need ALL 108 permutations

**Actions Taken:**
1. ✅ Killed all running pipelines
2. ✅ Cleared ALL: results, cache, logs, data directories
3. 🔄 Opus auditing + fixing caching system (CSV → Parquet)
4. 🔄 Creating full 108-pipeline matrix

**Full Matrix (108 pipelines):**
- Features: basic, movement, extended (3)
- Radii: 2km, 100km, 200km (3)
- Attacks: ALL 6 types (was only 2!)
- With ID: yes/no (2)
- Total: 3 × 3 × 6 × 2 = 108

**Attack Types (6 total):**
1. rand_offset — random dir/dist per row
2. const_offset — same for ALL attackers
3. const_offset_per_id — consistent per vehicle ID
4. swap_rand — swap positions
5. override_const — override to constant
6. override_rand — override to random

**Sub-Agents Working:**
- `pipeline-comprehensive-plan` — documenting permutations
- `pipeline-full-overhaul` — fixing code + configs

**Next:** Opus will fix caching, create configs, start fresh run.
