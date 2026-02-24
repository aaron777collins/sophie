# ConnectedDrivingPipelineV4 - COMPREHENSIVE EXECUTION PLAN

**Created:** 2026-02-23 22:45 EST
**Status:** 🔴 DRAFT - Awaiting Opus Audit
**Total Pipelines:** 36 (doubling from current 18)

---

## 📋 Aaron's Requirements Checklist

| Requirement | Status | Notes |
|-------------|--------|-------|
| Different feature sets (with ID, without ID) | ✅ Planned | 2 variants each |
| Radii: 2km, 100km, 200km | ✅ Planned | 3 radii |
| **const_offset per ID** | ⚠️ NEEDS CREATION | Same offset per vehicle |
| **random_offset per ID** | ⚠️ NEEDS CREATION | Different offset each point |
| All within April 2021 | ✅ Planned | `2021-04-01` to `2021-04-30` |
| Use Dask | ✅ Planned | Multi-worker parallel |
| Use dashboard pipeline | ✅ Planned | Queue daemon |
| Audit logs during execution | ✅ Planned | Full log analysis |
| Re-run with correct configs | ✅ Planned | Not reuse old broken caches |

---

## 🧮 Full Pipeline Matrix (36 Configurations)

### Dimensions
- **3 Radii:** 2km, 100km, 200km
- **3 Feature Sets:** Basic, Movement, Extended
- **2 ID Variants:** NoId, WithId
- **2 Attack Types:** const_offset, random_offset

**Total: 3 × 3 × 2 × 2 = 36 pipelines**

### Complete Pipeline List

| # | Radius | Features | ID | Attack Type | Config Name | Run Script |
|---|--------|----------|----|---------|----|-------|
| 1 | 2km | Basic | No | const_offset | `basic_2km_const.json` | `Run2kmBasicConst.py` |
| 2 | 2km | Basic | No | random_offset | `basic_2km_rand.json` | `Run2kmBasicRand.py` |
| 3 | 2km | Basic | Yes | const_offset | `basic_2km_withid_const.json` | `Run2kmBasicWithIdConst.py` |
| 4 | 2km | Basic | Yes | random_offset | `basic_2km_withid_rand.json` | `Run2kmBasicWithIdRand.py` |
| 5 | 2km | Movement | No | const_offset | `movement_2km_const.json` | `Run2kmMovementConst.py` |
| 6 | 2km | Movement | No | random_offset | `movement_2km_rand.json` | `Run2kmMovementRand.py` |
| 7 | 2km | Movement | Yes | const_offset | `movement_2km_withid_const.json` | `Run2kmMovementWithIdConst.py` |
| 8 | 2km | Movement | Yes | random_offset | `movement_2km_withid_rand.json` | `Run2kmMovementWithIdRand.py` |
| 9 | 2km | Extended | No | const_offset | `extended_2km_const.json` | `Run2kmExtendedConst.py` |
| 10 | 2km | Extended | No | random_offset | `extended_2km_rand.json` | `Run2kmExtendedRand.py` |
| 11 | 2km | Extended | Yes | const_offset | `extended_2km_withid_const.json` | `Run2kmExtendedWithIdConst.py` |
| 12 | 2km | Extended | Yes | random_offset | `extended_2km_withid_rand.json` | `Run2kmExtendedWithIdRand.py` |
| 13 | 100km | Basic | No | const_offset | `basic_100km_const.json` | `Run100kmBasicConst.py` |
| 14 | 100km | Basic | No | random_offset | `basic_100km_rand.json` | `Run100kmBasicRand.py` |
| 15 | 100km | Basic | Yes | const_offset | `basic_100km_withid_const.json` | `Run100kmBasicWithIdConst.py` |
| 16 | 100km | Basic | Yes | random_offset | `basic_100km_withid_rand.json` | `Run100kmBasicWithIdRand.py` |
| 17 | 100km | Movement | No | const_offset | `movement_100km_const.json` | `Run100kmMovementConst.py` |
| 18 | 100km | Movement | No | random_offset | `movement_100km_rand.json` | `Run100kmMovementRand.py` |
| 19 | 100km | Movement | Yes | const_offset | `movement_100km_withid_const.json` | `Run100kmMovementWithIdConst.py` |
| 20 | 100km | Movement | Yes | random_offset | `movement_100km_withid_rand.json` | `Run100kmMovementWithIdRand.py` |
| 21 | 100km | Extended | No | const_offset | `extended_100km_const.json` | `Run100kmExtendedConst.py` |
| 22 | 100km | Extended | No | random_offset | `extended_100km_rand.json` | `Run100kmExtendedRand.py` |
| 23 | 100km | Extended | Yes | const_offset | `extended_100km_withid_const.json` | `Run100kmExtendedWithIdConst.py` |
| 24 | 100km | Extended | Yes | random_offset | `extended_100km_withid_rand.json` | `Run100kmExtendedWithIdRand.py` |
| 25 | 200km | Basic | No | const_offset | `basic_200km_const.json` | `Run200kmBasicConst.py` |
| 26 | 200km | Basic | No | random_offset | `basic_200km_rand.json` | `Run200kmBasicRand.py` |
| 27 | 200km | Basic | Yes | const_offset | `basic_200km_withid_const.json` | `Run200kmBasicWithIdConst.py` |
| 28 | 200km | Basic | Yes | random_offset | `basic_200km_withid_rand.json` | `Run200kmBasicWithIdRand.py` |
| 29 | 200km | Movement | No | const_offset | `movement_200km_const.json` | `Run200kmMovementConst.py` |
| 30 | 200km | Movement | No | random_offset | `movement_200km_rand.json` | `Run200kmMovementRand.py` |
| 31 | 200km | Movement | Yes | const_offset | `movement_200km_withid_const.json` | `Run200kmMovementWithIdConst.py` |
| 32 | 200km | Movement | Yes | random_offset | `movement_200km_withid_rand.json` | `Run200kmMovementWithIdRand.py` |
| 33 | 200km | Extended | No | const_offset | `extended_200km_const.json` | `Run200kmExtendedConst.py` |
| 34 | 200km | Extended | No | random_offset | `extended_200km_rand.json` | `Run200kmExtendedRand.py` |
| 35 | 200km | Extended | Yes | const_offset | `extended_200km_withid_const.json` | `Run200kmExtendedWithIdConst.py` |
| 36 | 200km | Extended | Yes | random_offset | `extended_200km_withid_rand.json` | `Run200kmExtendedWithIdRand.py` |

---

## 🔧 Attack Type Definitions

### const_offset (per vehicle ID)
```python
# Each vehicle ID gets assigned ONE random offset at the start
# That same offset is applied to ALL data points for that vehicle
def apply_const_offset_per_id(df):
    # Generate one offset per unique vehicle ID
    vehicle_ids = df['coreData_id'].unique()
    id_to_offset = {
        vid: {
            'distance': random.uniform(offset_min, offset_max),
            'direction': random.uniform(0, 360)
        }
        for vid in vehicle_ids
    }
    
    # Apply same offset to all rows for each vehicle
    for vid, offset in id_to_offset.items():
        mask = (df['coreData_id'] == vid) & (df['isAttacker'] == True)
        df.loc[mask, 'x_pos'] += offset['distance'] * cos(radians(offset['direction']))
        df.loc[mask, 'y_pos'] += offset['distance'] * sin(radians(offset['direction']))
```

**Use case:** Realistic attack where GPS spoofing device has consistent behavior per vehicle.

### random_offset (per data point)
```python
# Each data point gets a DIFFERENT random offset
def apply_random_offset_per_point(df):
    attacker_mask = df['isAttacker'] == True
    n_attackers = attacker_mask.sum()
    
    # Generate random offsets for each row
    distances = np.random.uniform(offset_min, offset_max, n_attackers)
    directions = np.random.uniform(0, 360, n_attackers)
    
    # Apply different offset to each row
    df.loc[attacker_mask, 'x_pos'] += distances * np.cos(np.radians(directions))
    df.loc[attacker_mask, 'y_pos'] += distances * np.sin(np.radians(directions))
```

**Use case:** More chaotic attack, harder detection pattern, stress test for ML models.

---

## 📊 Feature Set Definitions

### BASIC (Position only)
```json
"features": ["x_pos", "y_pos", "coreData_elevation"]
```

### MOVEMENT (Position + Motion)
```json
"features": ["x_pos", "y_pos", "coreData_elevation", "coreData_speed", "coreData_heading"]
```

### EXTENDED (All available)
```json
"features": ["x_pos", "y_pos", "coreData_elevation", "coreData_speed", "coreData_heading", 
             "coreData_accelset_accelYaw", "metadata_receivedAt_numeric"]
```

### WithId Variants
Add `coreData_id` (vehicle ID) to feature list - enables model to learn per-vehicle patterns.

---

## 🗄️ Expected Data Sizes

| Radius | Rows After Spatial Filter | Memory Estimate |
|--------|---------------------------|-----------------|
| 2km | ~50K - 500K | 2-4 GB |
| 100km | ~2M - 5M | 8-16 GB |
| 200km | ~8M - 13M | 24-40 GB |

**Source:** April 2021 Wyoming Data = 13,318,201 total rows

---

## 🛠️ Execution Phases

### Phase 0: Pre-Flight (30 min)
1. Kill orphaned processes
2. Backup existing caches
3. Clear ALL caches (force fresh runs)
4. Fix column name schema in ALL configs
5. Fix cache key generation code
6. Fix train/test split logic
7. Remove 100K row limit

### Phase 1: Generate Missing Configs (1 hour)
1. Create 18 new configs for const_offset variants
2. Create 18 new configs for random_offset variants (if existing are wrong)
3. Generate corresponding Run*.py scripts
4. Validate all 36 configs have correct column names

### Phase 2: Run 2km Pipelines (2 hours)
- 12 pipelines (smallest dataset, fastest feedback)
- Full log analysis after EACH
- Fix issues before continuing

### Phase 3: Run 100km Pipelines (4 hours)
- 12 pipelines
- Larger memory allocation
- Full log analysis after EACH

### Phase 4: Run 200km Pipelines (8 hours)
- 12 pipelines
- Maximum memory allocation
- May need chunked processing
- Full log analysis after EACH

### Phase 5: Results Compilation (1 hour)
- Compile accuracy metrics for all 36 runs
- Generate comparison tables
- Create visualizations

---

## 📝 Log Audit Protocol (MANDATORY for each pipeline)

```bash
# After EVERY pipeline run:
LOG="logs/latest.log"

# 1. Check for ANY errors
echo "=== ERROR CHECK ==="
grep -iE "error|exception|traceback|keyerror|valueerror" $LOG
# EXPECTED: NO OUTPUT

# 2. Verify row counts (NOT 100K limit!)
echo "=== ROW COUNTS ==="
grep -E "rows|samples|Total" $LOG
# EXPECTED: Matches spatial filter expectations

# 3. Verify cache uniqueness
echo "=== CACHE KEYS ==="
grep "CACHE_KEY:" $LOG
# EXPECTED: Unique key for this config

# 4. Check split sizes
echo "=== TRAIN/TEST SPLIT ==="
grep -E "train|test|split" $LOG
# EXPECTED: 80/20 split, both > 0

# 5. Verify ML results
echo "=== ML RESULTS ==="
grep -E "accuracy|precision|recall|f1|Accuracy" $LOG
# EXPECTED: Reasonable metrics (0.5-1.0)
```

---

## 🔄 Slack Update Schedule

| Event | Update |
|-------|--------|
| Phase start | "🚀 Starting Phase X: {description}" |
| Pipeline complete | "✅ Pipeline {N}/36 complete: {name} - {accuracy}" |
| Error found | "🔴 ERROR in {pipeline}: {brief description}" |
| Fix applied | "🔧 Fixed: {issue} - retrying" |
| Phase complete | "📊 Phase X complete: {success_count}/{total}" |
| All complete | "🎉 ALL 36 PIPELINES COMPLETE - Results summary" |

---

## 🚨 Contingency Handling

### If Cache Key Collision
1. Clear cache for affected config
2. Verify key generation includes attack type
3. Re-run pipeline

### If Out of Memory (200km)
1. Reduce workers from 4 to 2
2. Increase memory_limit per worker
3. Enable chunked processing if available

### If Train/Test Split Fails
1. Verify data has enough rows
2. Check percentage-based split is working
3. Ensure shuffle is enabled

### If Column Name KeyError
1. Stop immediately
2. Fix column mapping in config
3. Clear cache for that config
4. Re-run

---

## 📈 Success Metrics

| Metric | Target |
|--------|--------|
| Pipelines completed without error | 36/36 |
| Log errors | 0 across all pipelines |
| Test set empty (n_samples=0) | 0 occurrences |
| Cache key collisions | 0 |
| Results CSVs with data | 36/36 |
| Accuracy range | 0.5-1.0 (reasonable) |

---

## ⏱️ Estimated Timeline

| Phase | Duration | Cumulative |
|-------|----------|------------|
| Phase 0: Pre-Flight | 30 min | 30 min |
| Phase 1: Config Generation | 1 hour | 1.5 hours |
| Phase 2: 2km Pipelines (12) | 2 hours | 3.5 hours |
| Phase 3: 100km Pipelines (12) | 4 hours | 7.5 hours |
| Phase 4: 200km Pipelines (12) | 8 hours | 15.5 hours |
| Phase 5: Results Compilation | 1 hour | 16.5 hours |

**Total Estimated: ~16-20 hours**

---

## 🔍 Audit Questions for Opus

1. Are const_offset and random_offset correctly differentiated?
2. Is the feature set definition complete for each variant?
3. Are the expected data sizes realistic?
4. Is the log audit protocol sufficient to catch all issues?
5. Any missing configurations or edge cases?
6. Is the attack implementation correct for vehicle ID-based vs point-based?
7. Memory estimates appropriate for 200km dataset?
8. Any risks with parallel execution?

---

**STATUS: AWAITING OPUS AUDIT**
