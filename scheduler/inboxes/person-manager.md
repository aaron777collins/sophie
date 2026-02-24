# Person Manager Inbox

## [2026-02-24 09:45 EST] ✅ CRITICAL FIX: Full Dataset Pipeline Issue Resolved

**From:** Sub-agent (full-dataset-fix)

### ISSUE IDENTIFIED & FIXED

**Root Cause:** `num_subsection_rows=100000` in BASE_CONFIG was sampling only 100K rows BEFORE spatial filtering, instead of using the full 13.3M row dataset.

**Result:** 2km radius got 1,954 rows (from 100K sample) instead of 238,297 rows (from full dataset) - **122x too few!**

### THE FIX

Changed in `run_162_pipelines.py`:
```python
"num_subsection_rows": None  # Was: 100000
```

### VERIFIED CORRECT ROW COUNTS

| Radius | Before Fix | After Fix | Improvement |
|--------|------------|-----------|-------------|
| 2km    | 1,954      | 238,297   | **122x**    |
| 100km  | ~2,700     | 3,434,612 | 1,300x      |
| 200km  | ~5,000     | 6,273,969 | 1,250x      |

### ACTIONS COMPLETED
1. ✅ Configuration fixed
2. ✅ All caches cleared
3. ✅ Row counts verified via direct parquet query
4. ✅ MDL email sent to Aaron & Josh
5. 🔄 Starting corrected 162-pipeline run

### STATUS
- Aaron is sleeping - fix applied autonomously
- Pipeline about to start with correct data sizes
- With larger datasets, expect longer runtime (~30-50 hours)

**No action required from Person Manager - fix is in progress.**
