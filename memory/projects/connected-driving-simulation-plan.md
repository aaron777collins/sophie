# Connected Driving Simulation Master Plan

**Created:** 2026-02-20 12:50 EST
**Owner:** Aaron Collins
**Status:** QUEUED FOR PROACTIVE EXECUTION

---

## 🎯 Objective

Run comprehensive simulations across multiple spatial filters, attack types, and feature sets to evaluate ML classifier performance for CV (Connected Vehicle) misbehavior detection.

---

## 📊 Experiment Matrix

### Spatial Filter Radii (from center point -106.0831353, 41.5430216)

| Radius | max_dist | Data Size (est.) | Purpose |
|--------|----------|------------------|---------|
| **200km** | 200000 | Large | Wide-area detection |
| **100km** | 100000 | Medium | Regional detection |
| **2km** | 2000 | Small | Local/intersection detection |

### Feature Sets

| Set Name | Columns | Includes ID? | Purpose |
|----------|---------|--------------|---------|
| **BASIC** | x_pos, y_pos, coreData_elevation | ❌ | Minimal position-only |
| **BASIC_WITH_ID** | x_pos, y_pos, coreData_elevation, coreData_id | ✅ | Position + vehicle tracking |
| **MOVEMENT** | x_pos, y_pos, coreData_elevation, coreData_heading, coreData_speed | ❌ | Position + motion vectors |
| **MOVEMENT_WITH_ID** | x_pos, y_pos, coreData_elevation, coreData_heading, coreData_speed, coreData_id | ✅ | Motion + vehicle tracking |
| **EXTENDED** | x_pos, y_pos, coreData_elevation, coreData_speed, coreData_accelset_accelYaw, coreData_heading | ❌ | Full dynamics |
| **EXTENDED_WITH_ID** | All above + coreData_id | ✅ | Full + vehicle tracking |

### Column Mapping (CSV → Pipeline)

| CSV Column | Pipeline Column | Description |
|------------|-----------------|-------------|
| coredata_position_lat | → x_pos | Latitude converted to meters |
| coredata_position_long | → y_pos | Longitude converted to meters |
| coredata_elevation | coreData_elevation | Altitude in meters |
| coredata_speed | coreData_speed | Speed (units vary) |
| coredata_heading | coreData_heading | Direction 0-360° |
| coredata_accelset_accelyaw | coreData_accelset_accelYaw | Yaw acceleration |
| coredata_id | coreData_id | Vehicle identifier (BSM ID) |

### Attack Types

| Attack | Description | Offset Range |
|--------|-------------|--------------|
| **RandOffset** | Random direction + distance per message | 100-200m |
| **ConstOffsetPerID** | Consistent offset per vehicle (random dir/dist assigned once) | 100-200m |
| **PositionSwap** | Swap positions between vehicles | N/A |

---

## 🔧 Required Pipeline Configurations

Need to create/modify Dask pipelines for each combination:

### New Pipelines to Create (18 total = 3 radii × 6 feature sets)

**200km Radius:**
1. `DaskMClassifier_200km_Basic_RandOffset100To200.py`
2. `DaskMClassifier_200km_BasicWithID_RandOffset100To200.py`
3. `DaskMClassifier_200km_Movement_RandOffset100To200.py`
4. `DaskMClassifier_200km_MovementWithID_RandOffset100To200.py`
5. `DaskMClassifier_200km_Extended_RandOffset100To200.py`
6. `DaskMClassifier_200km_ExtendedWithID_RandOffset100To200.py`

**100km Radius:**
7. `DaskMClassifier_100km_Basic_RandOffset100To200.py`
8. `DaskMClassifier_100km_BasicWithID_RandOffset100To200.py`
9. `DaskMClassifier_100km_Movement_RandOffset100To200.py`
10. `DaskMClassifier_100km_MovementWithID_RandOffset100To200.py`
11. `DaskMClassifier_100km_Extended_RandOffset100To200.py`
12. `DaskMClassifier_100km_ExtendedWithID_RandOffset100To200.py`

**2km Radius (existing, may need modification):**
13. `DaskMClassifier_2km_Basic_RandOffset100To200.py`
14. `DaskMClassifier_2km_BasicWithID_RandOffset100To200.py`
15. `DaskMClassifier_2km_Movement_RandOffset100To200.py`
16. `DaskMClassifier_2km_MovementWithID_RandOffset100To200.py`
17. `DaskMClassifier_2km_Extended_RandOffset100To200.py`
18. `DaskMClassifier_2km_ExtendedWithID_RandOffset100To200.py`

---

## 📁 Caching Strategy (CRITICAL)

**Ensure separate cache directories per configuration:**

```
data/classifierdata/
├── splitfiles/
│   └── cleaned/
│       └── {pipeline_hash}/           # Unique per pipeline class name
│           └── {date}_{radius}_{features}/  # Clear naming
└── subsection/
    └── {config_hash}-CreatingConnectedDrivingDataset/
        └── subsection-{n}.parquet
```

**Verification checklist before running:**
- [ ] Each pipeline has unique class name (generates unique hash)
- [ ] Cache paths include radius identifier
- [ ] Cache paths include feature set identifier
- [ ] No shared cache between different configurations

---

## 📋 Execution Plan

### Phase 1: Preparation
1. [ ] Stop any running jobs
2. [ ] Audit existing cache structure
3. [ ] Create base template pipeline with configurable parameters
4. [ ] Generate all 18 pipeline configurations
5. [ ] Git commit and push new configs

### Phase 2: 2km Radius Runs (fastest, validates setup)
6. [ ] Queue: 2km + Basic (no ID)
7. [ ] Queue: 2km + Basic (with ID)
8. [ ] Queue: 2km + Movement (no ID)
9. [ ] Queue: 2km + Movement (with ID)
10. [ ] Queue: 2km + Extended (no ID)
11. [ ] Queue: 2km + Extended (with ID)

### Phase 3: 100km Radius Runs
12-17. [ ] Queue all 6 feature set combinations

### Phase 4: 200km Radius Runs (largest)
18-23. [ ] Queue all 6 feature set combinations

### Phase 5: Analysis
24. [ ] Collect all results from dashboard
25. [ ] Create comparison table
26. [ ] Identify best performing configurations
27. [ ] Document findings

---

## 📈 Results Tracking

Track for each run:
- **Dataset:** Center point, radius, total rows
- **Columns used:** Feature set name + column list
- **Attack type:** Type + offset range
- **Metrics:** Accuracy, Precision, Recall, F1, Specificity
- **Runtime:** Total time, time per sample

---

## ⚠️ Pre-Run Checklist

- [ ] Dashboard accessible at http://65.108.237.46/dashboard/
- [ ] April 2021 Wyoming data symlinked correctly
- [ ] Source data contains records within 200km radius (verify!)
- [ ] Git repo clean, ready for new commits
- [ ] Daemon running and healthy

---

## Change Log

| Date | Change |
|------|--------|
| 2026-02-20 | Initial plan created from Aaron's requirements |
