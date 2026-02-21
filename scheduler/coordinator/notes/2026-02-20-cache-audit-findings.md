# Cache Audit Findings - Connected Driving Pipeline

**Date:** 2026-02-20 17:13 EST
**Audited By:** Sophie (main)
**Project:** Connected Driving Simulation Matrix

---

## 🔴 Critical Issue Found: Cache Key Collisions

### Problem Description
Different pipeline configurations (with different attack ratios, spatial radii, feature sets) were generating **identical cache keys**, causing:

1. **Silent Data Corruption** - Wrong cached results being used
2. **Non-Reproducible Results** - Same config could return different data
3. **Cross-Configuration Contamination** - Config A's cache used for Config B

### Root Cause
The `Decorators/FileCache.py` cache key generation did NOT include all configuration parameters:

**Missing from cache keys:**
- Attack parameters (ratios, distance ranges)
- Spatial parameters (radii, coordinates)
- Feature set specifications
- Full context from GeneratorContextProvider

### Impact
- All previous Phase 2 (2km) runs may have corrupted data
- Results cannot be trusted without re-running
- 0% cache hit rate indicated constant invalidation

---

## ✅ Fix Applied

**Location:** `~/repos/ConnectedDrivingPipelineV4/Decorators/FileCache.py`

**Enhancement:**
- Cache keys now include complete configuration snapshots
- All attack parameters included
- All spatial parameters included
- All feature set specifications included
- Full context parameter sets from GeneratorContextProvider

**Verification:**
```bash
cd ~/repos/ConnectedDrivingPipelineV4
python3 test_snapshot_approach.py  # Must show "SUCCESS"
```

---

## 📋 Action Required

1. **Clear All Caches** ✅ Done
   ```bash
   rm -rf cache/*
   echo '{"total_hits": 0, "total_misses": 0, "entries": {}}' > cache/cache_metadata.json
   ```

2. **Re-Run All Configurations** 🔄 In Progress
   - All 18 matrix configurations must be re-run
   - Use fresh cache (no stale data)
   - Monitor cache hit rates for validation

3. **Validate Cache Key Uniqueness**
   - Each of 18 configs should have unique cache entries
   - `cat cache/cache_metadata.json` to verify
   - No two different configs should share cache keys

---

## 📚 Lessons Learned

### For All Pipeline Work

1. **Cache keys MUST include ALL variable parameters**
   - Don't assume implicit parameters are unique
   - Explicitly include: radii, feature sets, attack types, ratios

2. **Validate cache key uniqueness before production runs**
   - Create test script that generates keys for all configs
   - Verify no duplicates exist

3. **Monitor cache hit rates**
   - Suspiciously low hit rates indicate cache invalidation issues
   - Suspiciously high hit rates with different configs indicate collisions

4. **Include config fingerprints in output paths**
   - Results directory should reflect config parameters
   - Makes it obvious when wrong config was used

---

## References

- Master Plan: `memory/projects/connected-driving-simulation-plan.md`
- Re-Run Plan: `memory/projects/connected-driving-full-rerun-plan.md`
- Pipeline Location: Jaekel: `~/repos/ConnectedDrivingPipelineV4`
- Dashboard: http://65.108.237.46/dashboard/
