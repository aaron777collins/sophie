# Jaekel Pipeline Monitoring Notes

## Created: 2026-02-24 00:40 EST

## Current Execution Status
- **Batch:** v4 (36 pipelines)
- **Started:** 2026-02-24 05:36 UTC
- **Completed:** 4/36 as of 05:40 UTC
- **Dashboard:** http://65.108.237.46/dashboard/

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
- **Repo:** /home/ubuntu/repos/ConnectedDrivingPipelineV4
- **Configs:** production_configs_v2/
- **Results (local):** Outputs/Output/ (symlinked to pipeline-results/)
- **Results (dashboard):** /var/www/static/pipeline-results/
- **Daemon:** ~/.pipeline-queue/daemon_v2.py
- **Dashboard URL:** http://65.108.237.46/dashboard/

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
