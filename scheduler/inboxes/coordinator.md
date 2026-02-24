# Coordinator Inbox

## [2026-02-24 09:45 EST] ✅ CRITICAL FIX: Full Dataset Now Being Used

**From:** Sub-agent (full-dataset-fix)

**Status:** FIX CONFIRMED - Starting corrected 162-pipeline run

### THE ISSUE
- `num_subsection_rows=100000` was SAMPLING only 100K rows BEFORE filtering
- Spatial filters were applied to 100K sample instead of full 13.3M dataset
- Result: 2km got only 1,954 rows instead of 238,297 (122x too few!)

### THE FIX
Changed in `run_162_pipelines.py`:
```python
# OLD:
"num_subsection_rows": 100000

# NEW:
"num_subsection_rows": None  # Use full 13.3M dataset
```

### VERIFIED ROW COUNTS

| Radius | Old (100K sample) | New (Full dataset) | Improvement |
|--------|-------------------|-------------------|-------------|
| 2km    | 1,954             | 238,297           | **122x**    |
| 100km  | ~2.7K             | 3,434,612         | ~1300x      |
| 200km  | ~5K               | 6,273,969         | ~1250x      |

### ACTIONS COMPLETED
1. ✅ Fixed configuration in run_162_pipelines.py
2. ✅ Cleared all caches and results
3. ✅ Verified row counts via direct parquet query
4. ✅ Sent MDL email to Aaron & Josh
5. 🔄 Starting corrected 162-pipeline run

### Timeline
- Larger datasets = longer processing
- 2km: ~5-10 min per pipeline
- 100km: ~30-60 min per pipeline (3.4M rows!)
- 200km: ~1-2 hours per pipeline (6.3M rows!)
- **Total estimate: 30-50 hours**

**Monitor will track progress and send updates.**
