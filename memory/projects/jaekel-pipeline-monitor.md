# Jaekel Pipeline Monitoring Notes

## Created: 2026-02-24 00:40 EST
## Updated: 2026-02-24 01:53 EST

## Current Execution Status (Updated 2026-02-24 07:15 EST)

**Progress Summary:**
| Radius | Completed | Status | Notes |
|--------|-----------|--------|-------|
| 2km | 12/12 | ✅ DONE | Results in pipeline-results/*.json |
| 100km | 1/12 | ⚠️ NEED RE-RUN | Only basic_100km_const completed; 11 failed (empty CSVs) |
| 200km | 0/12 | ⏳ RUNNING | Started 07:11 EST via run_all_pipelines.py |

**Currently Running:**
- `python run_all_pipelines.py --only 200km` (PID 913879)
- Log: `~/repos/ConnectedDrivingPipelineV4/run_200km.log`
- Output: Per-run folders with JSON, CSV, log, confusion matrix PNGs

**Monitoring:**
- Cron job: `jaekel-pipeline-monitor` (Sonnet, every 15 min)
- Will send email to aaron777collins@gmail.com, joshuapicchioni@gmail.com when complete

**Dashboard:** http://65.108.237.46/dashboard/
**Results Dir:** /var/www/static/pipeline-results/

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
- **Results (NEW):** `pipeline-results/{name}/` (symlinked to `/var/www/static/pipeline-results/`)
  - Each pipeline gets its own folder with JSON, CSV, log, PNGs, and run_info.txt
- **Dashboard:** http://65.108.237.46/dashboard/
- **Run Script:** `run_all_pipelines.py --only <pattern>` (not daemon-based)
- **Old CSV Location:** `Outputs/Output/*.csv` (still generated, but also copied to run folder)

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

### [2026-02-24 07:02 UTC] Sophie - Fixed JSON output completeness
- **Issue:** JSON results missing timing info, sample sizes, config, correct classifier names
- **Fix:** Added `run_with_metadata()` method to DaskPipelineRunner
- **Fix:** Updated run_all_pipelines.py to capture all metadata
- **Result:** JSON now includes:
  - Correct classifier names (RandomForest, DecisionTree, KNeighbors)
  - Timing metrics (train time, prediction times, per-sample)
  - Sample sizes (train/test counts)
  - Pipeline config (radius, attack type, center coords, date range)

### [2026-02-24 07:05 UTC] ✅ COMPLETED - Per-run folder structure with confusion matrices
- **Issue:** Aaron expected per-run folders with all artifacts (log, CSV, JSON, PNGs)
- **Previous:** Outputs scattered across multiple directories
- **Fix:** Rewrote `run_all_pipelines.py` to:
  1. Create per-pipeline subfolder in `pipeline-results/`
  2. Generate confusion matrix PNGs using sklearn's ConfusionMatrixDisplay
  3. Copy CSV from `Outputs/Output/` into subfolder
  4. Consolidate logs from `logs/{name}/` into single `.log` file
  5. Generate human-readable `metrics_summary.txt` summary
- **Tested:** basic_2km_const - all artifacts generated correctly
- **New structure (EXACT as Aaron specified):**
  ```
  pipeline-results/basic_2km_const/
  ├── basic_2km_const_results.json    # Full results with timing, config, metrics
  ├── basic_2km_const.csv             # CSV format results
  ├── basic_2km_const.log             # Consolidated pipeline execution log
  ├── confusion_matrix_RandomForest.png
  ├── confusion_matrix_DecisionTree.png
  ├── confusion_matrix_KNeighbors.png
  └── metrics_summary.txt             # Human-readable summary
  ```
- **Dashboard access:** Results accessible at http://65.108.237.46/pipeline-results/basic_2km_const/
- **Note:** Symlink in repo (`pipeline-results/` → `/var/www/static/pipeline-results/`) ensures web access automatically

### [2026-02-24 07:14 UTC] ✅ VERIFIED - Cache hash uniqueness
- Different attack types → different hashes ✅
- Different radii → different hashes ✅
- Different feature sets → different hashes ✅
- Hash includes: pipeline name, data config (filtering, date_range, coordinates), attack config (type, ratio, distances, seed), ml config (features, split), cache version

### [2026-02-24 07:14 UTC] ✅ VERIFIED - No Python errors in logs
- Checked for: Traceback, KeyError, n_samples=0, ERROR:
- Result: ZERO matches - logs are clean

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
- [x] ✅ Per-run folder structure with all artifacts together
- [x] ✅ Confusion matrix PNG generation
- [x] ✅ Human-readable run_info.txt summary
- [ ] Monitor remaining pipelines
- [ ] Verify results appear on dashboard
- [ ] Audit all logs for errors
- [ ] Create summary report when complete
