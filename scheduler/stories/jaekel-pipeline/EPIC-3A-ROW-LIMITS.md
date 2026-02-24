# EPIC-3A: Remove Row Limits - Full Data Processing (CRITICAL)

**Priority:** 🔴 CRITICAL - Blocking Real Results
**Estimated Complexity:** HIGH
**Status:** Not Started

---

## Executive Summary

**THE PIPELINES ARE RUNNING ON TOY DATA, NOT REAL DATA!**

Current pipelines process only **100,000 rows** when the full April 2021 Wyoming dataset has **13,318,201 rows** (13.3 million). This makes ALL results invalid for research purposes.

### The Problem

```
Source Data: 13,318,201 rows (13.3M)

Current Processing:
  1. Read first 100,000 rows ← WRONG (default limit)
  2. Apply spatial filter (2km/100km/200km)
  3. Get ~4,610 rows (for 2km from 100K subset)
  
What SHOULD Happen:
  1. Read ALL 13.3M rows (or use full Parquet file)
  2. Apply spatial filter
  3. Get actual filtered count:
     - 2km: ~50K-500K rows
     - 100km: ~2-5M rows
     - 200km: ~8-13M rows
```

### Root Cause Location

**File:** `MachineLearning/DaskPipelineRunner.py`

```python
# Line 145:
num_subsection_rows = data_config.get("num_subsection_rows", 100000)  # ← DEFAULT LIMIT!

# Line 185:
"DataGatherer.numrows": num_subsection_rows,  # ← Passed to data gatherer
```

The `num_subsection_rows` defaults to 100,000 if not specified in config. **None of the production configs specify this value**, so ALL pipelines use the 100K limit!

---

## Investigation Findings

### Current Config Files (Missing num_subsection_rows)

Examined `production_configs/basic_200km_pipeline_config.json`:
```json
{
  "data": {
    "source_file": "April_2021_Wyoming_Data_Fixed.csv",
    "filtering": {
      "radius_meters": 200000
    },
    "date_range": {
      "start": "2021-04-01",
      "end": "2021-04-30"
    }
    // ← NO num_subsection_rows specified!
  }
}
```

### Data Flow Problem

```
April_2021_Wyoming_Data_Fixed.csv (13.3M rows)
         ↓
DataGatherer.numrows = 100000 (LIMIT!)
         ↓
First 100,000 rows read
         ↓
Spatial filter (200km radius)
         ↓
~4,610 rows (wrong! should be millions)
         ↓
Train/Test split
         ↓
INVALID RESULTS
```

### Expected vs Actual Row Counts

| Radius | Expected Rows | Current (from 100K) | % of Expected |
|--------|--------------|---------------------|---------------|
| 2km | ~50K-500K | ~4,610 | 1-9% |
| 100km | ~2-5M | ~20-50K | 1-2.5% |
| 200km | ~8-13M | ~80-100K | 0.8-1.2% |

**We're training on ~1% of the data we should be using!**

---

## User Stories

### Story 3A.1: Remove Row Limit Default

**As a** ML researcher  
**I want** pipelines to process ALL data by default  
**So that** results are scientifically valid

#### Acceptance Criteria

##### AC-3A.1.1: Change Default to "All Rows"
**Given** `DaskPipelineRunner.py` line 145  
**When** Modified  
**Then:** Default changed from 100000 to -1 or None (meaning "all rows"):
```python
# OLD:
num_subsection_rows = data_config.get("num_subsection_rows", 100000)

# NEW:
num_subsection_rows = data_config.get("num_subsection_rows", -1)  # -1 = all rows
```
**Test Method:** grep for default value
**Evidence Required:** Code diff showing change

##### AC-3A.1.2: DataGatherer Handles "All Rows"
**Given** `numrows = -1` passed to gatherer  
**When** Data gathered  
**Then:** ALL rows read without limit
**Test Method:**
```python
# In DaskDataGatherer:
if self.numrows == -1 or self.numrows is None:
    self.data = dd.read_csv(filepath)  # No limit
else:
    self.data = dd.read_csv(filepath).head(self.numrows, compute=False)
```
**Evidence Required:** Log showing "Reading all rows"

##### AC-3A.1.3: 200km Pipeline Gets Full Data
**Given** 200km config with no row limit  
**When** Pipeline runs  
**Then:** Spatial filter receives 13.3M rows, outputs 8-13M rows
**Test Method:** Check log for row counts
**Evidence Required:** Log showing millions of rows

---

### Story 3A.2: Use Parquet Source Instead of CSV

**As a** data engineer  
**I want** to read from the pre-converted Parquet file  
**So that** data loading is fast and memory-efficient

#### Acceptance Criteria

##### AC-3A.2.1: Parquet File Exists
**Given** Need fast data access  
**When** Checked  
**Then:** `Full_Wyoming_Data.parquet/` directory exists with partitions
**Test Method:** `ls -la Full_Wyoming_Data.parquet/`
**Evidence Required:** Directory listing

##### AC-3A.2.2: Configs Point to Parquet
**Given** Parquet file available  
**When** Configs updated  
**Then:** `source_file` changed from `.csv` to `.parquet`:
```json
"data": {
  "source_file": "Full_Wyoming_Data.parquet"
}
```
**Test Method:** grep configs for source_file
**Evidence Required:** Config showing parquet path

##### AC-3A.2.3: DaskDataGatherer Supports Parquet
**Given** Parquet source specified  
**When** Data gathered  
**Then:** Uses `dd.read_parquet()` instead of `dd.read_csv()`
**Test Method:** Check gatherer detects file type
**Evidence Required:** Log showing "Reading Parquet file"

##### AC-3A.2.4: No Row Limit on Parquet
**Given** Reading from Parquet  
**When** Full file read  
**Then:** All partitions loaded, no artificial limit
**Test Method:** Count resulting rows
**Evidence Required:** Row count matches expected 13.3M

---

### Story 3A.3: Update All Production Configs

**As a** pipeline operator  
**I want** all 18 configs explicitly configured for full data  
**So that** there's no ambiguity about data size

#### Acceptance Criteria

##### AC-3A.3.1: Add Full-Data Flag to Configs
**Given** 18 production configs  
**When** Updated  
**Then:** Each has explicit setting:
```json
"data": {
  "source_file": "Full_Wyoming_Data.parquet",
  "num_subsection_rows": -1,  // Explicit: all rows
  "process_full_data": true
}
```
**Test Method:** Validate all configs have setting
**Evidence Required:** grep output

##### AC-3A.3.2: Validation Script Checks Row Config
**Given** Config validation script  
**When** Extended  
**Then:** Warns if `num_subsection_rows` is set to a limit:
```
WARNING: basic_2km_pipeline_config.json has num_subsection_rows=100000
This will limit data to 100K rows. Full data has 13.3M rows.
```
**Test Method:** Run validator with old config
**Evidence Required:** Warning message

##### AC-3A.3.3: Document Expected Data Sizes
**Given** Full data processing  
**When** Documentation added  
**Then:** `docs/EXPECTED-DATA-SIZES.md` specifies:
```markdown
# Expected Data Sizes (April 2021 Wyoming)

| Source | Rows |
|--------|------|
| Full dataset | 13,318,201 |

| Radius | Filter Center | Expected Rows |
|--------|--------------|---------------|
| 2km | (-109.32, 41.54) | 50,000 - 500,000 |
| 100km | (-109.32, 41.54) | 2,000,000 - 5,000,000 |
| 200km | (-109.32, 41.54) | 8,000,000 - 13,000,000 |
```
**Test Method:** File exists
**Evidence Required:** Documentation file

---

### Story 3A.4: Scale Dask Resources for Large Data

**As a** system running 200km pipelines  
**I want** Dask cluster configured for millions of rows  
**So that** processing completes without memory errors

#### Acceptance Criteria

##### AC-3A.4.1: Memory Limits Increased for Large Variants
**Given** 200km configs  
**When** Dask section updated  
**Then:** Memory appropriate for data size:
```json
// 2km config (50K-500K rows):
"dask": {
  "n_workers": 2,
  "threads_per_worker": 2,
  "memory_limit": "8GB"
}

// 100km config (2-5M rows):
"dask": {
  "n_workers": 4,
  "threads_per_worker": 2,
  "memory_limit": "12GB"
}

// 200km config (8-13M rows):
"dask": {
  "n_workers": 6,
  "threads_per_worker": 2,
  "memory_limit": "16GB"
}
```
**Test Method:** Check config values
**Evidence Required:** Config diffs

##### AC-3A.4.2: Chunked Processing for 200km
**Given** 200km pipeline with 8M+ rows  
**When** Processing  
**Then:** Uses chunked/batched approach if needed:
- Parquet read with `blocksize='256MB'`
- Spatial filter applied per partition
- Results written incrementally
**Test Method:** Monitor memory during 200km run
**Evidence Required:** Memory usage log

##### AC-3A.4.3: Disk Spilling Enabled
**Given** Large data processing  
**When** Memory pressure high  
**Then:** Dask spills to disk instead of crashing:
```python
cluster = LocalCluster(
    memory_target_fraction=0.6,
    memory_spill_fraction=0.7,
    memory_pause_fraction=0.8,
    local_directory='/tmp/dask-scratch'
)
```
**Test Method:** Check dask config
**Evidence Required:** Config showing spill settings

##### AC-3A.4.4: 200km Completes Successfully
**Given** Full data, scaled resources  
**When** 200km pipeline runs  
**Then:** Completes without OOM, processes 8M+ rows
**Test Method:** Run 200km pipeline end-to-end
**Evidence Required:** Success log with row counts

---

### Story 3A.5: Verify Data Integrity After Fix

**As a** researcher  
**I want** to verify the row counts are now correct  
**So that** I know the fix worked

#### Acceptance Criteria

##### AC-3A.5.1: Pre-Filter Row Count Logged
**Given** Any pipeline run  
**When** Data loaded  
**Then:** Log shows rows BEFORE spatial filter:
```
[INFO] Loaded 13,318,201 rows from Full_Wyoming_Data.parquet
[INFO] Applying spatial filter (radius=2000m)...
[INFO] After filter: 127,543 rows
```
**Test Method:** Check log format
**Evidence Required:** Log with pre/post counts

##### AC-3A.5.2: 2km Row Count Validation
**Given** 2km pipeline with full data  
**When** Spatial filter applied  
**Then:** Row count in range 50,000 - 500,000
**Test Method:** Run 2km, check count
**Evidence Required:** Log showing count in range

##### AC-3A.5.3: 100km Row Count Validation
**Given** 100km pipeline with full data  
**When** Spatial filter applied  
**Then:** Row count in range 2,000,000 - 5,000,000
**Test Method:** Run 100km, check count
**Evidence Required:** Log showing count in range

##### AC-3A.5.4: 200km Row Count Validation
**Given** 200km pipeline with full data  
**When** Spatial filter applied  
**Then:** Row count in range 8,000,000 - 13,000,000
**Test Method:** Run 200km, check count
**Evidence Required:** Log showing count in range

##### AC-3A.5.5: Comparison Report Generated
**Given** All variants run with full data  
**When** Report generated  
**Then:** `validation/row-count-comparison.md`:
```markdown
# Row Count Comparison: Before vs After Fix

| Pipeline | Old (100K limit) | New (Full Data) | Change |
|----------|------------------|-----------------|--------|
| 2km | 4,610 | 127,543 | +27.7x |
| 100km | 48,231 | 3,245,789 | +67.3x |
| 200km | 92,156 | 11,234,567 | +121.9x |

All pipelines now processing full dataset!
```
**Test Method:** Report exists and accurate
**Evidence Required:** Report file

---

## Testing Requirements

### Testing Framework
- **Dask diagnostics** for memory monitoring
- **Log analysis** for row counts
- **Manual validation** of data sizes

### Test Strategy
1. **Unit Tests:** Row limit handling in gatherer
2. **Integration Tests:** Full pipeline with small radius first (2km)
3. **Load Tests:** 200km with full data
4. **Memory Tests:** Monitor for OOM conditions

### Memory Testing for 200km

```python
def test_200km_memory_usage():
    """200km pipeline should not OOM with 8M+ rows"""
    import psutil
    
    start_mem = psutil.virtual_memory().used
    
    # Run 200km pipeline
    runner = DaskPipelineRunner.from_config("production_configs/basic_200km_pipeline_config.json")
    results = runner.run()
    
    peak_mem = psutil.virtual_memory().used
    
    # Should not exceed 80% of system memory
    assert peak_mem < psutil.virtual_memory().total * 0.8
    
    # Should produce results
    assert len(results) == 3  # RF, DT, KNN
```

---

## Contingency Plans

### What Could Go Wrong

| Issue | Response | Fallback |
|-------|----------|----------|
| OOM on 200km | Increase spill fraction, reduce workers | Process in batches |
| Takes too long | Use more workers, optimize spatial filter | Sample subset for quick validation |
| Parquet corrupted | Regenerate from CSV | Use CSV directly |
| Disk fills with spill | Use larger temp disk | Clear intermediates more often |

### If 200km Still Fails

1. **Start smaller:** Validate 2km works first
2. **Profile:** Use Dask dashboard to identify bottleneck
3. **Chunk:** Process date ranges separately, combine results
4. **Sample:** Use 50% sample for initial validation

### Progressive Scale-Up

```
Phase 1: 2km with full data (50K-500K rows) ← Validate this first
Phase 2: 100km with full data (2-5M rows)
Phase 3: 200km with full data (8-13M rows)
```

Don't attempt 200km until 2km and 100km work!

---

## Dependencies

### Depends On
- **EPIC-1:** Cache keys (must include row limit in key if used)
- **EPIC-2:** Column names (data must load correctly)

### Blocks
- **EPIC-3:** Split logic (needs real row counts)
- **EPIC-5:** Validation (results meaningless without full data)

---

## Files to Modify

| File | Changes |
|------|---------|
| `MachineLearning/DaskPipelineRunner.py` | Change default from 100000 to -1 |
| `Gatherer/DaskDataGatherer.py` | Handle -1 as "all rows" |
| `production_configs/*.json` (18 files) | Add explicit row config, update source |
| `docs/EXPECTED-DATA-SIZES.md` | NEW - document expected sizes |
| `scripts/validate_row_counts.py` | NEW - validation script |

---

## Implementation Details

### DaskPipelineRunner Fix

```python
# MachineLearning/DaskPipelineRunner.py, line 145

# OLD:
num_subsection_rows = data_config.get("num_subsection_rows", 100000)

# NEW:
num_subsection_rows = data_config.get("num_subsection_rows", -1)  # -1 = all rows

# Add logging:
if num_subsection_rows == -1:
    self.logger.log("Processing ALL rows (no subsection limit)")
else:
    self.logger.log(f"WARNING: Limited to {num_subsection_rows:,} rows (subsection mode)")
```

### DaskDataGatherer Fix

```python
# Gatherer/DaskDataGatherer.py

def gather_data(self):
    """Gather data, respecting row limits."""
    
    if self.numrows == -1 or self.numrows is None:
        self.logger.log(f"Reading ALL rows from {self.filepath}")
        if self.filepath.endswith('.parquet'):
            self.data = dd.read_parquet(self.filepath)
        else:
            self.data = dd.read_csv(self.filepath, blocksize=self.blocksize)
    else:
        self.logger.log(f"Reading {self.numrows:,} rows from {self.filepath}")
        if self.filepath.endswith('.parquet'):
            self.data = dd.read_parquet(self.filepath).head(self.numrows, compute=False)
        else:
            self.data = dd.read_csv(self.filepath, blocksize=self.blocksize).head(self.numrows, compute=False)
    
    row_count = len(self.data)  # Will be computed lazily
    self.logger.log(f"Loaded approximately {row_count:,} rows")
    
    return self.data
```

### Config Update Template

```json
{
  "data": {
    "source_file": "Full_Wyoming_Data.parquet",
    "source_type": "parquet",
    "num_subsection_rows": -1,
    "process_full_data": true,
    "filtering": {
      "center_longitude": -109.319556,
      "center_latitude": 41.538689,
      "radius_meters": 200000
    }
  },
  "dask": {
    "n_workers": 6,
    "threads_per_worker": 2,
    "memory_limit": "16GB",
    "local_directory": "/tmp/dask-scratch"
  }
}
```

---

## Estimated Effort

| Task | Hours |
|------|-------|
| Modify DaskPipelineRunner default | 0.5 |
| Modify DaskDataGatherer for -1 handling | 1 |
| Update 18 config files | 2 |
| Scale Dask resources in configs | 1 |
| Test 2km with full data | 1 |
| Test 100km with full data | 2 |
| Test 200km with full data | 4 |
| Handle any OOM issues | 2 |
| Documentation | 1 |
| **Total** | **14.5 hours** |

---

## Success Metrics

1. ✅ Default row limit changed from 100000 to -1
2. ✅ 2km pipeline processes 50K-500K rows (not 4,610)
3. ✅ 100km pipeline processes 2-5M rows
4. ✅ 200km pipeline processes 8-13M rows
5. ✅ No OOM errors on any pipeline
6. ✅ All 18 configs explicitly specify full data mode
7. ✅ Logs show pre-filter and post-filter row counts

---

## CRITICAL INSIGHT

**Without this fix, ALL validation work is meaningless!**

We're currently validating that the code "works" on 1% of the data. That tells us nothing about:
- Real-world accuracy on full data
- Memory/performance at scale
- Actual attack detection capability

**This EPIC must be completed before EPIC-5 validation runs can produce valid results.**
