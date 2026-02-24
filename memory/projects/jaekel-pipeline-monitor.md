# Jaekel Pipeline Monitoring Notes

## Created: 2026-02-24 00:40 EST
## Updated: 2026-02-24 01:53 EST

## Current Execution Status
- **Batch:** v5 (12 pipelines - 2km only)
- **Started:** 2026-02-24 06:46 UTC
- **Completed:** 4/12 as of 06:52 UTC (basic_2km_*)
- **Currently Running:** extended_2km_* series
- **Dashboard:** http://65.108.237.46/dashboard/
- **Results Dir:** /var/www/static/pipeline-results/

## ⚠️ Path Correction (2026-02-24 01:52 EST)
- **CORRECT:** `/home/ubuntu/repos/ConnectedDrivingPipelineV4`
- **WRONG:** `~/ConnectedDrivingPipelineV4` (doesn't exist)

## Feature Sets Explained

| Feature Set | Columns | Description |
|-------------|---------|-------------|
| **BASIC** | x_pos, y_pos, coreData_elevation | Just position (XY coords + elevation) |
| **MOVEMENT** | + coreData_speed, coreData_heading | Position + velocity info |
| **EXTENDED** | + coreData_accelset_accelYaw | Position + velocity + acceleration |

## Pipeline Matrix (36 total)

| Radius | Feature Set | Attack Type | With ID | Pipeline Name |
|--------|-------------|-------------|---------|---------------|
| 2km | Basic | const_offset_per_id | No | basic_2km_const |
| 2km | Basic | rand_offset | No | basic_2km_rand |
| 2km | Basic | const_offset_per_id | Yes | basic_2km_withid_const |
| ... | ... | ... | ... | ... |

## Key Locations

- **Server:** jaekel (ssh alias configured)
- **Repo:** `/home/ubuntu/repos/ConnectedDrivingPipelineV4` ⚠️ (NOT ~/ConnectedDrivingPipelineV4)
- **Configs:** `production_configs_v2/`
- **CSV Results:** `Outputs/Output/*.csv`
- **JSON Results:** `/var/www/static/pipeline-results/*.json`
- **Dashboard:** http://65.108.237.46/dashboard/
- **Run Script:** `run_all_pipelines.py --only <pattern>` (not daemon-based)

## Issues Found & Fixed

### [2026-02-24 04:57 UTC] Attack type naming
- **Issue:** Configs used "random_offset" but code expected "rand_offset"
- **Fix:** Regenerated all configs with correct naming

### [2026-02-24 05:30 UTC] Train/test split bug
- **Issue:** Fixed 100K rows for train, causing 0 test rows for small datasets
- **Fix:** Changed to percentage-based split (80/20)

### [2026-02-24 05:36 UTC] Duplicate daemons
- **Issue:** Multiple daemon instances running
- **Fix:** Killed all and started single clean daemon

### [2026-02-24 06:52 UTC] Sophie audit - empty CSV files & stale data
- **Issue:** 10 CSV files were empty (303 bytes = header only) from interrupted runs
- **Issue:** 25+ old standalone log files from failed attempts
- **Issue:** Notes had wrong path (`~/ConnectedDrivingPipelineV4` vs `~/repos/...`)
- **Fix:** Deleted all empty CSV files (will regenerate correctly)
- **Fix:** Deleted old standalone log files
- **Fix:** Updated notes with correct paths
- **Verified:** Current run (v5, 2km only) IS working correctly - 5/12 completed

## Log Audit Protocol

After each pipeline completes, check logs for:
- `KeyError` - missing columns
- `ValueError` - data issues
- `n_samples=0` - empty dataset
- `traceback` - any Python errors
- `MemoryError` or `OOM` - resource issues

## Progress Log

| Time (UTC) | Pipeline | Status | Notes |
|------------|----------|--------|-------|
| 05:40:55 | basic_2km_const | ✅ | 13s, success |
| 05:44:37 | basic_2km_rand | ✅ | 3m42s, success |
| 05:48:19 | basic_2km_withid_const | ✅ | success |
| 05:52:01 | basic_2km_withid_rand | ✅ | success |

## TODO
- [ ] Monitor remaining 32 pipelines
- [ ] Verify results appear on dashboard
- [ ] Audit all logs for errors
- [ ] Create summary report when complete
