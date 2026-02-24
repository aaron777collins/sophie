# ConnectedDrivingPipelineV4 - Complete Fix & Validation Master Plan

**Created:** 2026-02-23 22:20 EST
**Updated:** 2026-02-23 22:30 EST (User Stories Added)
**Priority:** 🔴 CRITICAL - Results needed ASAP
**Status:** IN PROGRESS

---

## 📋 Epic Documents (Detailed User Stories)

| Epic | File | Stories | Lines | Status |
|------|------|---------|-------|--------|
| **EPIC-1:** Cache Key Uniqueness | [EPIC-1-CACHE-KEYS.md](./EPIC-1-CACHE-KEYS.md) | 5 | 412 | Not Started |
| **EPIC-2:** Column Name Schema Fix | [EPIC-2-SCHEMA-FIX.md](./EPIC-2-SCHEMA-FIX.md) | 5 | 422 | Not Started |
| **EPIC-3:** Train/Test Split Logic | [EPIC-3-SPLIT-FIX.md](./EPIC-3-SPLIT-FIX.md) | 5 | 514 | Not Started |
| **🔴 EPIC-3A:** Row Limits (CRITICAL) | [EPIC-3A-ROW-LIMITS.md](./EPIC-3A-ROW-LIMITS.md) | 5 | 500+ | **BLOCKING** |
| **EPIC-4:** Infrastructure Fixes | [EPIC-4-INFRASTRUCTURE.md](./EPIC-4-INFRASTRUCTURE.md) | 6 | 689 | Not Started |
| **EPIC-5:** Validation Runs | [EPIC-5-VALIDATION-RUNS.md](./EPIC-5-VALIDATION-RUNS.md) | 6 | 571 | Blocked |

**Total:** 32 User Stories, 3100+ lines of documentation

### ⚠️ CRITICAL: Row Limit Issue (EPIC-3A)

**THE PIPELINES ARE RUNNING ON 100K ROW SUBSETS, NOT FULL DATA!**

```
Full April 2021 Data: 13,318,201 rows (13.3M)
Current Processing:   100,000 rows (0.75% of data!)

Expected After Fix:
- 2km:   50K - 500K rows (not 4,610)
- 100km: 2M - 5M rows
- 200km: 8M - 13M rows
```

**Root Cause:** `MachineLearning/DaskPipelineRunner.py` line 145:
```python
num_subsection_rows = data_config.get("num_subsection_rows", 100000)  # ← DEFAULT LIMIT!
```

**EPIC-3A must be completed before EPIC-5 validation runs produce meaningful results!**

---

## Executive Summary

Fix ALL issues in the ConnectedDrivingPipelineV4 on Jaekel server, run pipelines one-by-one with full log analysis, and produce validated ML results.

## 🎯 Success Criteria

1. **Zero errors in pipeline logs** - not warnings, ERRORS must be zero
2. **Real ML results produced** - accuracy metrics, confusion matrices, model files
3. **Cache keys absolutely unique** - different configs MUST NOT hit same cache
4. **All pipeline variants working** - 2km, 100km, 200km × Basic, Movement, Extended × WithId/NoId

---

## 🔍 Investigation Findings Summary

### Actual Data Schema (from CSV header)
Column names are **mixed case**, e.g.:
- `coreData_position_lat` (NOT `coredata_position_lat`)
- `coreData_elevation` (NOT `coredata_elevation`)
- `metadata_generatedAt` (NOT `metadata_generatedat`)

**Key Insight:** Config files reference WRONG case → KeyError crashes

### Cache Key Generation
Current `FileCache.py` uses context snapshot but may miss:
- Attack type differentiation
- Offset range parameters
- Feature set column hash
- Date range specifics

**Key Insight:** Different configs can produce SAME cache key → wrong data used

### Train/Test Split Issue
Current split uses `num_train_rows: 100000` but 2km datasets have ~4,610 rows
→ ALL data goes to train, test set EMPTY → `n_samples=0` error

**Key Insight:** Need percentage-based splits, not fixed row counts

### Successful Run Example
From `wyoming_apr2021_constoffset_20260213_031727.log`:
- 4,610 rows cleaned
- Train: 3,688, Test: 922 (80/20 split)
- RandomForest: 99.78% accuracy
- Pipeline completed in 6 seconds

**Key Insight:** System CAN work when properly configured

---

## 🔴 CRITICAL ADDITION: Full Data Processing (Not 100K Subsets!)

**Problem Discovered:** Current pipelines run on 100K row subsets, NOT full data!

**Source Data:**
- April 2021: **13,318,201 rows** (13.3M)

**Expected sizes after spatial filtering:**
| Radius | Expected Rows | Current (WRONG) |
|--------|---------------|-----------------|
| 2km | ~50K-500K | 100,000 |
| 100km | ~2-5M | 100,000 |
| 200km | ~8-13M | 100,000 |

**Root Cause Found:**
`DaskPipelineRunner.py` line 145:
```python
num_subsection_rows = data_config.get("num_subsection_rows", 100000)  # DEFAULT!
```
Configs don't override this → always 100K rows.

**Required Fixes:**
1. Add `"num_subsection_rows": null` or large value to ALL 18 configs
2. Modify code: if null, process ALL rows (no subsection)
3. Run spatial filter on FULL 13.3M rows first, THEN limit if needed
4. Adjust memory/workers for 8M+ row datasets:
   - 200km: 16GB → 32GB+ memory per worker
   - Maybe reduce workers from 4 to 2 for memory
5. May need chunked processing for 200km

---

## Phase 1: Investigation & Schema Mapping

### Task 1.1: Document Actual Data Schema
**Acceptance Criteria:**
- [ ] List ALL column names in `April_2021_Wyoming_Data_Fixed.parquet`
- [ ] List ALL column names expected by each cleaner type (Basic, Movement, Extended)
- [ ] Document exact mapping: `expected_column` → `actual_column`
- [ ] Identify any columns that don't exist at all

### Task 1.2: Document Cache Key Generation
**Acceptance Criteria:**
- [ ] Trace code path for cache key generation in `DaskParquetCache.py`
- [ ] Trace code path in `FileCache.py`
- [ ] Trace code path in `CacheManager.py`
- [ ] Document what variables ARE included in cache keys
- [ ] Document what variables SHOULD BE included but aren't

---

## Phase 2: Cache Key Uniqueness Fix (CRITICAL)

### Task 2.1: Design Unique Cache Key Schema
**Acceptance Criteria:**
- [ ] Cache key MUST include: column list hash
- [ ] Cache key MUST include: attack type
- [ ] Cache key MUST include: attack parameters (min_distance, max_distance, etc.)
- [ ] Cache key MUST include: spatial filter radius
- [ ] Cache key MUST include: date range
- [ ] Cache key MUST include: train/test split ratio
- [ ] Cache key MUST include: feature set identifier
- [ ] Write schema document showing key format

### Task 2.2: Implement Cache Key Changes
**Acceptance Criteria:**
- [ ] Modify `DaskParquetCache.py` with new key generation
- [ ] Modify `FileCache.py` with new key generation
- [ ] Add logging to show cache key being used
- [ ] Unit test: two configs differing ONLY in offset range produce DIFFERENT keys
- [ ] Unit test: two configs differing ONLY in attack type produce DIFFERENT keys
- [ ] Unit test: two configs differing ONLY in feature set produce DIFFERENT keys

### Task 2.3: Clear Old Caches
**Acceptance Criteria:**
- [ ] Backup existing cache directory
- [ ] Clear ALL cached data to force fresh runs
- [ ] Document cache locations cleared

---

## Phase 3: Schema & Split Fixes

### Task 3.1: Fix Column Name Mappings
**Acceptance Criteria:**
- [ ] Update `DaskCleanWithTimestamps.py` with correct column names
- [ ] Update any config files referencing wrong column names
- [ ] Test that cleaner can read data without KeyError
- [ ] Full log analysis - ZERO KeyError exceptions

### Task 3.2: Fix Train/Test Split Logic
**Acceptance Criteria:**
- [ ] Change `DaskPipelineRunner.py` to use percentage-based splits
- [ ] Add validation: `assert train_size <= total_rows * 0.9`
- [ ] Add logging showing actual split sizes
- [ ] Test with small dataset (2km) - verify non-zero test set
- [ ] Full log analysis - ZERO "n_samples=0" errors

---

## Phase 4: Infrastructure Fixes

### Task 4.1: Fix Dashboard Error Detection
**Acceptance Criteria:**
- [ ] Modify `daemon.py` to capture actual subprocess exit codes
- [ ] Parse stdout/stderr for "ERROR:", "Traceback", "Exception"
- [ ] Mark jobs as "failed" when errors detected
- [ ] Test: run intentionally failing job, verify status shows "failed"

### Task 4.2: Fix Dask Port Management
**Acceptance Criteria:**
- [ ] Configure Dask to use dynamic ports OR proper cleanup
- [ ] No more "Port 8787 already in use" warnings
- [ ] Each pipeline run gets clean cluster

### Task 4.3: Process Cleanup Script
**Acceptance Criteria:**
- [ ] Create script to kill orphaned pipeline processes
- [ ] Add to daemon startup routine
- [ ] Document manual cleanup command

---

## Phase 5: Validation Runs (One-by-One)

### Validation Protocol (FOR EACH PIPELINE)

1. **Pre-run checks:**
   - [ ] No orphaned processes running
   - [ ] Cache cleared or keys verified unique
   - [ ] Config file reviewed for correctness

2. **Run pipeline:**
   - [ ] Execute via queue daemon
   - [ ] Wait for completion

3. **Log Analysis (MANDATORY - FULL LOG):**
   - [ ] Read ENTIRE log file, not just tail
   - [ ] Check for ANY "ERROR" lines
   - [ ] Check for ANY "Traceback" 
   - [ ] Check for ANY "Exception"
   - [ ] Check for ANY "KeyError"
   - [ ] Check for ANY "ValueError"
   - [ ] Check for warnings that indicate problems
   - [ ] Document log file path and size

4. **Results Analysis:**
   - [ ] Verify output files exist
   - [ ] Check accuracy metrics (should be reasonable 0.7-0.99 range)
   - [ ] Check confusion matrix exists
   - [ ] Verify model was actually trained (not empty/default)

5. **If ANY errors found:**
   - [ ] STOP - do not proceed to next pipeline
   - [ ] Create fix task
   - [ ] Fix the issue
   - [ ] Re-run same pipeline
   - [ ] Repeat until clean

### Pipeline Run Order

1. **Run2kmBasic.py** - Smallest, fastest feedback
2. **Run2kmMovement.py**
3. **Run2kmExtended.py**
4. **Run100kmBasic.py**
5. **Run100kmMovement.py**
6. **Run100kmExtended.py**
7. **Run200kmBasic.py**
8. **Run200kmMovement.py**
9. **Run200kmExtended.py**

(WithId variants can run after base variants validated)

---

## Phase 6: Results Collection

### Task 6.1: Compile Results Summary
**Acceptance Criteria:**
- [ ] Table of all pipeline runs with accuracy metrics
- [ ] Confusion matrices for each
- [ ] Training time for each
- [ ] Any notes on data characteristics observed

---

## Contingencies

### If Column Names Still Wrong After Fix
- Check if Parquet was converted from CSV incorrectly
- May need to reconvert with proper column handling
- Check for case sensitivity issues

### If Train/Test Split Still Fails
- Check if spatial filter is too aggressive
- May need larger radius for smaller datasets
- Check if date range excludes all data

### If Cache Still Gets Wrong Hits
- Add random UUID to cache key temporarily
- Force complete cache clear
- Add more variables to key hash

### If Dask Clusters Keep Conflicting
- Add explicit cluster shutdown in finally block
- Use unique scheduler port per pipeline
- Consider single persistent cluster

---

## Dependencies

```
Phase 1 (Investigation) ✓ DONE
    ↓
Phase 2 (EPIC-1: Cache Keys) ←── CRITICAL, do first
    ↓
Phase 3a (EPIC-2: Schema Fix)
    ↓
Phase 3b (EPIC-3: Split Logic)
    ↓
Phase 3c (EPIC-3A: ROW LIMITS) ←── 🔴 CRITICAL! Without this, results are TOY DATA
    ↓
Phase 4 (EPIC-4: Infrastructure)
    ↓
Phase 5 (EPIC-5: Validation) ←── One-by-one, fix before continue
    ↓
Phase 6 (Results)
```

### Updated Execution Order

```
EPIC-1 (Cache Keys)
    ↓
EPIC-2 (Column Schema) ←── Can run in parallel with EPIC-3
    ↓
EPIC-3 (Split Logic)
    ↓
EPIC-3A (Row Limits) ←── 🔴 MUST complete before validation!
    ↓
EPIC-4 (Infrastructure) ←── Can run in parallel with EPIC-3A
    ↓
EPIC-5 (Validation) ←── Only after ALL fixes complete
```

---

## Notes

- SSH access: `ssh jaekel` from dev3
- Repo: `/home/ubuntu/repos/ConnectedDrivingPipelineV4`
- Dashboard: `http://65.108.237.46/dashboard/` (password: JaekelFiles2026!)
- Results: `/var/www/static/pipeline-results/`
