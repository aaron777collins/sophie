# Connected Driving Full Re-Run Plan

## Created: [2026-02-20 19:17 EST]
## Status: 🚀 ACTIVE

> **Aaron's Order:** Re-run all results with cache bugs fixed. Make proper plan, validate, ensure UI visibility.

---

## Cache Fix Summary

**[2026-02-20 17:13 EST] Cache Audit Completed:**
- Cache key collision issues identified and fixed in `Decorators/FileCache.py`
- All corrupted cache files cleared
- Cache metadata reset: `{"total_hits": 0, "total_misses": 0}`
- Test script passes: `test_snapshot_approach.py`

**Root Cause (Fixed):**
- Different configs were generating identical cache keys
- Missing: attack ratios, spatial radii, feature sets in cache key generation
- Now includes complete configuration snapshots

---

## Execution Plan

### Phase 1: Clear & Verify Cache ✅ COMPLETE
- [x] Cache key uniqueness fix deployed
- [x] All cache directories cleared
- [x] Cache metadata reset
- [x] Validation script passes

### Phase 2: Re-Run All 18 Configurations 🔄 IN PROGRESS

**Current Status:**
- Job 20260220_230639 (100km Basic) - Running (2h+ runtime)
- Dashboard: http://65.108.237.46/dashboard/

#### 2km Radius Runs (6 configs) - NEED RE-RUN
| Config | Status | Job ID | Notes |
|--------|--------|--------|-------|
| 2km_basic | ⏳ pending | - | May have used corrupted cache |
| 2km_basic_with_id | ⏳ pending | - | May have used corrupted cache |
| 2km_movement | ⏳ pending | - | May have used corrupted cache |
| 2km_movement_with_id | ⏳ pending | - | May have used corrupted cache |
| 2km_extended | ⏳ pending | - | May have used corrupted cache |
| 2km_extended_with_id | ⏳ pending | - | May have used corrupted cache |

#### 100km Radius Runs (6 configs) - IN PROGRESS
| Config | Status | Job ID | Notes |
|--------|--------|--------|-------|
| 100km_basic | 🔄 running | 20260220_230639 | Started post-fix, should be clean |
| 100km_basic_with_id | ⏳ pending | - | |
| 100km_movement | ⏳ pending | - | |
| 100km_movement_with_id | ⏳ pending | - | |
| 100km_extended | ⏳ pending | - | |
| 100km_extended_with_id | ⏳ pending | - | |

#### 200km Radius Runs (6 configs) - PENDING
| Config | Status | Job ID | Notes |
|--------|--------|--------|-------|
| 200km_basic | ⏳ pending | - | |
| 200km_basic_with_id | ⏳ pending | - | |
| 200km_movement | ⏳ pending | - | |
| 200km_movement_with_id | ⏳ pending | - | |
| 200km_extended | ⏳ pending | - | |
| 200km_extended_with_id | ⏳ pending | - | |

### Phase 3: Validation & Results
- [ ] All 18 runs complete on dashboard
- [ ] Results visible at http://65.108.237.46/dashboard/
- [ ] No cache collisions detected (unique cache keys per config)
- [ ] Comparison table created
- [ ] Analysis documented

---

## Execution Commands

**Queue each config via pq:**
```bash
cd ~/repos/ConnectedDrivingPipelineV4

# Example: Queue 2km basic
pq add python3 configurable_pipeline_template.py --config production_configs/basic_2km_pipeline_config.json

# Or via wrapper scripts if created
```

**Monitor progress:**
```bash
pq status                              # Current queue status
pq logs                                # View logs
cat cache/cache_metadata.json          # Check cache performance
```

---

## Acceptance Criteria

1. **All 18 configurations run with FRESH CACHE** - No stale results
2. **All visible on dashboard** - UI shows all runs with results
3. **Proper cache separation verified** - Each config has unique cache keys
4. **Results documented** - Comparison table and analysis complete
5. **Git commits for all work** - Clean history

---

## Notes

- Each 100km run takes ~2+ hours
- Each 200km run may take longer (larger dataset)
- 2km runs are fastest (~minutes to hour)
- Run in parallel where possible (dashboard queue)
- Monitor cache hit rates - should see hits on subsequent identical runs only
