# ConnectedDrivingPipelineV4 - XY Coordinate Conversion Fix Plan

**Date:** 2026-02-24
**Author:** Sophie (AI Assistant)
**Status:** Planning Phase

---

## Executive Summary

The ConnectedDrivingPipelineV4 project has a critical bug where lat/long coordinates were not being correctly converted to XY meters. This caused:
1. Incorrect distance calculations (57x too small due to deg2rad bug)
2. Incorrect spatial filtering
3. Invalid ML training data

This plan documents all fixes needed, caches to clear, and pipelines to run.

---

## Part 1: Code Changes Required

### 1.1 MathHelper.py - ALREADY FIXED ✅
**File:** `Helpers/MathHelper.py`
**Bug:** `dist_between_two_points()` converted degrees to radians before passing to `Geodesic.Inverse()`, but geographiclib expects degrees.
**Fix:** Remove deg2rad conversion, pass degrees directly.
**Commit:** 5f647d6
**Status:** COMPLETE

### 1.2 DaskConnectedDrivingCleaner.py - NEEDS VERIFICATION
**File:** `Generator/Cleaners/DaskConnectedDrivingCleaner.py`
**Issue:** `convert_to_XY_Coordinates()` may have incorrect parameter order for `geodesic_distance()`
**Expected:** 
- x_pos: `geodesic_distance(ref_lat, current_lon, ref_lat, ref_lon)` - distance EAST
- y_pos: `geodesic_distance(current_lat, ref_lon, ref_lat, ref_lon)` - distance NORTH
**Action:** VERIFY current implementation

### 1.3 ConnectedDrivingCleaner.py (Pandas) - NEEDS VERIFICATION
**File:** `Generator/Cleaners/ConnectedDrivingCleaner.py`
**Issue:** Same parameter order issue as Dask cleaner
**Action:** VERIFY current implementation

### 1.4 SparkConnectedDrivingCleaner.py - NEEDS VERIFICATION
**File:** `Generator/Cleaners/SparkConnectedDrivingCleaner.py`
**Issue:** Same parameter order issue
**Action:** VERIFY current implementation

### 1.5 DaskPipelineRunner.py - NEEDS VERIFICATION
**File:** `MachineLearning/DaskPipelineRunner.py`
**Issue:** Must correctly read `coordinate_conversion.enabled` from config
**Action:** VERIFY config parsing

---

## Part 2: Config Verification

### 2.1 Production Configs (production_configs_v2/)
All 36 configs must have:
```json
{
  "data": {
    "coordinate_conversion": {
      "enabled": true
    }
  }
}
```

### 2.2 Pipeline Configs by Category

| Category | Radius | Attack Type | Config File |
|----------|--------|-------------|-------------|
| BASIC | 2km | const | basic_2km_const_pipeline_config.json |
| BASIC | 2km | rand | basic_2km_rand_pipeline_config.json |
| BASIC | 2km | const+id | basic_2km_withid_const_pipeline_config.json |
| BASIC | 2km | rand+id | basic_2km_withid_rand_pipeline_config.json |
| BASIC | 100km | const | basic_100km_const_pipeline_config.json |
| BASIC | 100km | rand | basic_100km_rand_pipeline_config.json |
| BASIC | 100km | const+id | basic_100km_withid_const_pipeline_config.json |
| BASIC | 100km | rand+id | basic_100km_withid_rand_pipeline_config.json |
| BASIC | 200km | const | basic_200km_const_pipeline_config.json |
| BASIC | 200km | rand | basic_200km_rand_pipeline_config.json |
| BASIC | 200km | const+id | basic_200km_withid_const_pipeline_config.json |
| BASIC | 200km | rand+id | basic_200km_withid_rand_pipeline_config.json |
| EXTENDED | 2km | const | extended_2km_const_pipeline_config.json |
| EXTENDED | 2km | rand | extended_2km_rand_pipeline_config.json |
| EXTENDED | 2km | const+id | extended_2km_withid_const_pipeline_config.json |
| EXTENDED | 2km | rand+id | extended_2km_withid_rand_pipeline_config.json |
| EXTENDED | 100km | const | extended_100km_const_pipeline_config.json |
| EXTENDED | 100km | rand | extended_100km_rand_pipeline_config.json |
| EXTENDED | 100km | const+id | extended_100km_withid_const_pipeline_config.json |
| EXTENDED | 100km | rand+id | extended_100km_withid_rand_pipeline_config.json |
| EXTENDED | 200km | const | extended_200km_const_pipeline_config.json |
| EXTENDED | 200km | rand | extended_200km_rand_pipeline_config.json |
| EXTENDED | 200km | const+id | extended_200km_withid_const_pipeline_config.json |
| EXTENDED | 200km | rand+id | extended_200km_withid_rand_pipeline_config.json |
| MOVEMENT | 2km | const | movement_2km_const_pipeline_config.json |
| MOVEMENT | 2km | rand | movement_2km_rand_pipeline_config.json |
| MOVEMENT | 2km | const+id | movement_2km_withid_const_pipeline_config.json |
| MOVEMENT | 2km | rand+id | movement_2km_withid_rand_pipeline_config.json |
| MOVEMENT | 100km | const | movement_100km_const_pipeline_config.json |
| MOVEMENT | 100km | rand | movement_100km_rand_pipeline_config.json |
| MOVEMENT | 100km | const+id | movement_100km_withid_const_pipeline_config.json |
| MOVEMENT | 100km | rand+id | movement_100km_withid_rand_pipeline_config.json |
| MOVEMENT | 200km | const | movement_200km_const_pipeline_config.json |
| MOVEMENT | 200km | rand | movement_200km_rand_pipeline_config.json |
| MOVEMENT | 200km | const+id | movement_200km_withid_const_pipeline_config.json |
| MOVEMENT | 200km | rand+id | movement_200km_withid_rand_pipeline_config.json |

**Total: 36 pipelines**

---

## Part 3: Caches to Clear

### 3.1 Cache Locations
| Directory | Purpose | Status |
|-----------|---------|--------|
| `cache/` | Intermediate cleaned data (pre-filter) | CLEARED ✅ |
| `data/classifierdata/splitfiles/` | Split parquet files | CLEARED ✅ |
| `data/classifierdata/subsection/` | Subsection data | CLEARED ✅ |
| `data/mclassifierdata/` | ML training data | CLEARED ✅ |
| `pipeline-results/` | Previous results | CLEARED ✅ |
| `__pycache__/` | Python bytecode | CLEARED ✅ |

### 3.2 Cache Clearing Commands
```bash
rm -rf cache/*
rm -rf data/classifierdata/splitfiles/*
rm -rf data/classifierdata/subsection/*
rm -rf data/mclassifierdata/*
rm -rf pipeline-results/*
find . -type d -name '__pycache__' -exec rm -rf {} + 2>/dev/null
```

---

## Part 4: Expected Outcomes

### 4.1 XY Coordinate Conversion
After fix, for a point 1km east and 500m north of reference:
- x_pos should be ~1000 meters (not ~17m)
- y_pos should be ~500 meters (not ~8.7m)
- Euclidean distance: ~1118 meters

### 4.2 Spatial Filtering
- 2km radius: Should retain ~2-5% of Wyoming data
- 100km radius: Should retain ~30-50% of Wyoming data
- 200km radius: Should retain ~60-80% of Wyoming data

### 4.3 Row Counts (Approximate)
| Radius | Expected Filtered Rows |
|--------|----------------------|
| 2km | 50,000 - 300,000 |
| 100km | 3,000,000 - 7,000,000 |
| 200km | 8,000,000 - 12,000,000 |

### 4.4 ML Results
- Train accuracy: Should be > 90% for most classifiers
- Test accuracy: Should be > 80% for RandomForest/DecisionTree

---

## Part 5: Execution Plan

### Phase 1: Code Audit (15 min)
1. Verify MathHelper.py fix is in place
2. Verify DaskConnectedDrivingCleaner.py convert_to_XY_Coordinates()
3. Verify ConnectedDrivingCleaner.py convert_to_XY_Coordinates()
4. Verify SparkConnectedDrivingCleaner.py convert_to_XY_Coordinates()
5. Verify DaskPipelineRunner.py config parsing

### Phase 2: Config Audit (10 min)
1. Check all 36 production_configs_v2/*.json have coordinate_conversion.enabled=true
2. Verify center coordinates are correct (-109.319556, 41.538689)
3. Verify radius values are correct (2000, 100000, 200000)

### Phase 3: Cache Clear (5 min)
1. Verify all caches are cleared
2. Verify source data exists (April_2021_Wyoming_Data_Fixed.parquet)

### Phase 4: Test Run (30 min)
1. Run ONE 2km pipeline to verify fix
2. Check output x_pos/y_pos values are in meters
3. Check distance from origin is within 2km
4. Verify ML results are reasonable

### Phase 5: Full Run (4-8 hours)
1. Run all 36 pipelines sequentially
2. Save to /var/www/static/pipeline-results/20260224_v5/
3. Monitor for errors

### Phase 6: Verification (30 min)
1. Check all 36 results exist
2. Verify no errors in logs
3. Spot-check XY values in outputs
4. Post summary to Slack

---

## Part 6: Success Criteria

- [ ] All 36 pipelines complete without errors
- [ ] XY coordinates are in meters (not degrees)
- [ ] Filtered data counts match expected ranges
- [ ] ML accuracy is reasonable (>80% test accuracy)
- [ ] Results accessible at http://65.108.237.46/pipeline-results/
- [ ] Summary posted to Slack

---

## Part 7: Rollback Plan

If issues are found:
1. Stop running pipelines: `pkill -f run_all_pipelines`
2. Review error logs in `logs/` directory
3. Fix identified issues
4. Clear caches again
5. Re-run affected pipelines

---

## Appendix: Key File Locations

| File | Purpose |
|------|---------|
| `Helpers/MathHelper.py` | Geodesic distance calculation |
| `Generator/Cleaners/DaskConnectedDrivingCleaner.py` | Dask XY conversion |
| `Generator/Cleaners/ConnectedDrivingCleaner.py` | Pandas XY conversion |
| `Generator/Cleaners/SparkConnectedDrivingCleaner.py` | Spark XY conversion |
| `MachineLearning/DaskPipelineRunner.py` | Pipeline orchestration |
| `production_configs_v2/*.json` | Pipeline configurations |
| `run_all_pipelines.py` | Batch runner script |
| `April_2021_Wyoming_Data_Fixed.parquet/` | Source data |
