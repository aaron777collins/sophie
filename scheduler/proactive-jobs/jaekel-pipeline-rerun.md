# ConnectedDrivingPipelineV4 - Full System Audit & Execution Plan

**Created:** 2026-02-24
**Server:** jaekel (`ssh jaekel`)
**Repository:** `/home/ubuntu/repos/ConnectedDrivingPipelineV4`
**Status:** READY FOR EXECUTION

---

## 🔍 AUDIT FINDINGS

### ✅ Issue 1: deg2rad Bug - VERIFIED FIXED

**File:** `Helpers/MathHelper.py`

```python
def dist_between_two_points(lat1, lon1, lat2, lon2):
    """
    Note:
        FIXED BUG: geographiclib.Geodesic.Inverse() expects lat/lon in DEGREES,
        not radians. Previous code incorrectly converted to radians first,
        resulting in ~98% underestimation of distances.
    """
    geod = Geodesic.WGS84
    # CORRECT: Pass degrees directly to Geodesic.Inverse
    distance = geod.Inverse(lat1, lon1, lat2, lon2)
    return distance['s12']
```

**Status:** ✅ **FIXED** - Code correctly passes degrees directly without deg2rad conversion.

**Also in:** `Helpers/DaskUDFs/GeospatialFunctions.py` - Uses Numba-optimized haversine (correct implementation) or falls back to MathHelper.

---

### ✅ Issue 2: Cache Key Uniqueness - VERIFIED FIXED

**File:** `MachineLearning/DaskPipelineRunner.py`

The `_get_config_hash()` method now generates MD5 hash from ALL relevant config parameters:

```python
def _get_config_hash(self) -> str:
    hash_input = {
        'name': self.pipeline_name,
        'version': self.config.get('version', '1.0'),
        'data': {
            'source_file': ...,
            'filtering': ...,
            'date_range': ...,
            'coordinate_conversion': ...,
            'num_subsection_rows': ...,
        },
        'attack': {
            'type': ...,
            'malicious_ratio': ...,
            'offset_distance_min': ...,
            'offset_distance_max': ...,
            'seed': ...,
        },
        'ml': {
            'features': sorted(...),
            'label': ...,
            'train_test_split': ...,
        },
        'cache_version': self.config.get('cache', {}).get('version', 'v1'),
    }
```

**File:** `Decorators/FileCache.py`

The `create_deterministic_cache_key()` function now:
- Uses MD5 hashing for deterministic keys
- Includes context snapshot to capture ALL configuration
- Sorts collections for determinism

**Status:** ✅ **FIXED** - Different configs → different cache keys → no stale cache issues.

---

### ✅ Issue 3: Train/Test Split - VERIFIED FIXED

**File:** `MachineLearning/DaskPipelineRunner.py`

```python
# Use test_size if available, otherwise use train_ratio
test_size = split_config.get("test_size", 0.2)
train_ratio = 1.0 - test_size if test_size else split_config.get("train_ratio", 0.8)

# Calculate train rows - ALWAYS use percentage to avoid overflow
num_rows_to_train = int(total_rows * train_ratio)

# Ensure we have at least some rows in both sets
if num_rows_to_train >= total_rows:
    num_rows_to_train = int(total_rows * 0.8)  # Fall back to 80/20
```

**Status:** ✅ **FIXED** - Uses percentage-based (80/20) split, not fixed row counts.

---

### ✅ Issue 4: Coordinate Conversion - VERIFIED FIXED

**File:** `Generator/Cleaners/DaskConnectedDrivingCleaner.py`

The `convert_to_XY_Coordinates()` method converts lat/long to meters from center point:

```python
def _convert_xy_coords_partition(partition: pd.DataFrame) -> pd.DataFrame:
    """
    FIXED BUG: Previous code had incorrect parameter order for geodesic_distance().
    geodesic_distance expects (lat1, lon1, lat2, lon2).
    
    After POINT parsing:
      - x_pos contains LONGITUDE (x = current_lon)
      - y_pos contains LATITUDE (y = current_lat)
    
    Config variables (confusingly named):
      - self.x_pos = center_longitude (ref_lon)
      - self.y_pos = center_latitude (ref_lat)
    """
    # x_pos conversion: distance EAST from reference
    partition['x_pos'] = partition['x_pos'].apply(
        lambda x: geodesic_distance(self.y_pos, x, self.y_pos, self.x_pos)
    )
    # y_pos conversion: distance NORTH from reference
    partition['y_pos'] = partition['y_pos'].apply(
        lambda y: geodesic_distance(y, self.x_pos, self.y_pos, self.x_pos)
    )
```

**All 36 Configs Verified:**
```
coordinate_conversion.enabled: true (ALL configs)
```

**Status:** ✅ **FIXED** - Coordinate conversion enabled in all configs, correct implementation.

---

### ✅ Issue 5: Per-Run Folder Output Structure - VERIFIED FIXED

**File:** `run_all_pipelines.py`

Each pipeline creates an organized output folder:

```python
pipeline_output_dir = os.path.join(results_dir, pipeline_name)
os.makedirs(pipeline_output_dir, exist_ok=True)

# Artifacts saved:
# 1. {pipeline_name}_results.json - Full results with timing, config, metrics
# 2. {pipeline_name}.csv - CSV format results  
# 3. {pipeline_name}.log - Consolidated execution log
# 4. confusion_matrix_RandomForest.png
# 5. confusion_matrix_DecisionTree.png
# 6. confusion_matrix_KNeighbors.png
# 7. metrics_summary.txt - Human-readable summary
```

**Status:** ✅ **FIXED** - Per-pipeline folder structure with all required artifacts.

---

## 📋 CONFIG VERIFICATION

All 36 configs verified with correct parameters:

| Feature Set | Radius | Attack Type | With ID | Count |
|-------------|--------|-------------|---------|-------|
| basic | 2km (2000m) | const, rand | no, yes | 4 |
| basic | 100km (100000m) | const, rand | no, yes | 4 |
| basic | 200km (200000m) | const, rand | no, yes | 4 |
| extended | 2km (2000m) | const, rand | no, yes | 4 |
| extended | 100km (100000m) | const, rand | no, yes | 4 |
| extended | 200km (200000m) | const, rand | no, yes | 4 |
| movement | 2km (2000m) | const, rand | no, yes | 4 |
| movement | 100km (100000m) | const, rand | no, yes | 4 |
| movement | 200km (200000m) | const, rand | no, yes | 4 |

**Total: 36 pipelines** ✅

### Radius Values Confirmed:
- `2km` → `radius_meters: 2000` ✅
- `100km` → `radius_meters: 100000` ✅
- `200km` → `radius_meters: 200000` ✅

### Attack Types Confirmed:
- `const` → `type: "const_offset_per_id"` ✅
- `rand` → `type: "rand_offset"` ✅

### Common Settings Verified:
- `malicious_ratio: 0.3` (30% attackers)
- `offset_distance_min: 100` meters
- `offset_distance_max: 200` meters
- `seed: 42` (reproducibility)
- `train_test_split.test_size: 0.2` (80/20 split)

---

## 📂 CURRENT STATE

### Source Data
- **File:** `April_2021_Wyoming_Data_Fixed.parquet`
- **Size:** ~1.6GB (27 partitions)
- **Location:** `/home/ubuntu/repos/ConnectedDrivingPipelineV4/`

### Cache Status
- `cache/` - 4K (empty)
- `cache_backup_20260223_224105/` - 123MB (old cache, can be deleted)
- `data/classifierdata/splitfiles/` - 9.4GB (intermediate data)
- `data/mclassifierdata/` - 37MB (ML-prepared data)

### Results Status
- `pipeline-results/` - Empty (symlinked to `/var/www/static/pipeline-results/`)
- `logs/` - Empty

---

## 🚀 EXECUTION PLAN

### Phase 1: Clear ALL Caches (Fresh Start)

```bash
ssh jaekel << 'EOF'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4

# Backup current state (just in case)
echo "Creating backup of current state..."
BACKUP_DIR="cache_backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Save any existing results
cp -r pipeline-results/* "$BACKUP_DIR/" 2>/dev/null || true

# Clear ALL caches
echo "Clearing caches..."
rm -rf cache/*
rm -rf data/classifierdata/splitfiles/*
rm -rf data/classifierdata/subsection/*
rm -rf data/mclassifierdata/*
rm -rf logs/*
rm -rf Outputs/Output/*
rm -rf results/*
rm -rf pipeline-results/*

# Clear old backups (keep only last one)
ls -dt cache_backup_* | tail -n +3 | xargs rm -rf 2>/dev/null || true

echo "Caches cleared!"
ls -la cache/ data/classifierdata/ data/mclassifierdata/ pipeline-results/
EOF
```

### Phase 2: Run All 36 Pipelines

```bash
ssh jaekel << 'EOF'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4

# Activate virtual environment
source .venv/bin/activate

# Set up logging
LOGFILE="pipeline_run_$(date +%Y%m%d_%H%M%S).log"
exec > >(tee -a "$LOGFILE") 2>&1

echo "=============================================="
echo "Starting ALL 36 Pipelines"
echo "Started at: $(date)"
echo "=============================================="

# Run all pipelines
python run_all_pipelines.py 2>&1

echo "=============================================="
echo "Completed at: $(date)"
echo "=============================================="
EOF
```

### Phase 3: Monitor Progress

During execution, monitor with:

```bash
# Watch log in real-time
ssh jaekel "cd /home/ubuntu/repos/ConnectedDrivingPipelineV4 && tail -f pipeline_run_*.log"

# Check completed pipelines
ssh jaekel "ls /var/www/static/pipeline-results/ 2>/dev/null | wc -l"

# Check disk usage
ssh jaekel "df -h /home/ubuntu/repos/ConnectedDrivingPipelineV4"
```

### Phase 4: Verify Results

```bash
ssh jaekel << 'EOF'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4

echo "=== RESULTS VERIFICATION ==="

# Count completed pipelines
COMPLETED=$(ls pipeline-results/ | wc -l)
echo "Completed pipelines: $COMPLETED / 36"

# Check for failures
echo ""
echo "=== Checking for failures ==="
cat pipeline-results/run_summary.json | python3 -c "
import json, sys
data = json.load(sys.stdin)
print(f\"Total: {data['total']}\")
print(f\"Successful: {data['successful']}\")
print(f\"Failed: {data['failed']}\")
print(f\"Total time: {data['total_seconds']/60:.1f} minutes\")
if data['failed'] > 0:
    print('\nFailed pipelines:')
    for r in data['results']:
        if r['status'] == 'failed':
            print(f\"  - {r['pipeline_name']}: {r['error']}\")
"

# Verify artifact structure
echo ""
echo "=== Sample pipeline artifacts ==="
ls -la pipeline-results/basic_2km_const/

# Check results accessibility via web
echo ""
echo "=== Web accessibility check ==="
curl -s -o /dev/null -w "%{http_code}" http://localhost/pipeline-results/ || echo "N/A"
EOF
```

### Phase 5: Send Completion Email

After verification, send comprehensive email using himalaya:

```bash
# Generate email content
ssh jaekel << 'EOF' > /tmp/pipeline_results.txt
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4

echo "ConnectedDrivingPipelineV4 - Complete Results Summary"
echo "========================================================"
echo ""
echo "Execution Date: $(date)"
echo "Server: jaekel"
echo ""

# Parse run_summary.json
python3 << 'PYTHON'
import json
import os

results_dir = 'pipeline-results'
summary_file = os.path.join(results_dir, 'run_summary.json')

with open(summary_file, 'r') as f:
    summary = json.load(f)

print(f"Total Pipelines: {summary['total']}")
print(f"Successful: {summary['successful']}")
print(f"Failed: {summary['failed']}")
print(f"Total Time: {summary['total_seconds']/60:.1f} minutes")
print()

print("=" * 80)
print("DETAILED RESULTS PER PIPELINE")
print("=" * 80)

for result in summary['results']:
    print()
    print(f"Pipeline: {result['pipeline_name']}")
    print("-" * 60)
    
    if result['status'] == 'failed':
        print(f"  STATUS: FAILED - {result.get('error', 'Unknown error')}")
        continue
    
    print(f"  Status: SUCCESS")
    print(f"  Elapsed Time: {result['elapsed_seconds']:.1f}s")
    
    config = result.get('config', {})
    print(f"  Config:")
    print(f"    - Spatial Radius: {config.get('spatial_radius')} meters")
    print(f"    - Feature Set: {config.get('feature_set')}")
    print(f"    - Attack Type: {config.get('attack_type')}")
    print(f"    - With Vehicle ID: {config.get('with_vehicle_id')}")
    print(f"    - Malicious Ratio: {config.get('malicious_ratio')}")
    
    print(f"  Sample Sizes:")
    print(f"    - Train: {result.get('train_sample_size', 'N/A'):,}")
    print(f"    - Test: {result.get('test_sample_size', 'N/A'):,}")
    print(f"    - Total After Cleaning: {result.get('total_rows_after_cleaning', 'N/A'):,}")
    
    print(f"  Classifier Results:")
    for clf in result.get('classifiers', []):
        print(f"    {clf['name']}:")
        print(f"      Train: Acc={clf['train_accuracy']:.4f}, Prec={clf['train_precision']:.4f}, Rec={clf['train_recall']:.4f}, F1={clf['train_f1']:.4f}, Spec={clf['train_specificity']:.4f}")
        print(f"      Test:  Acc={clf['test_accuracy']:.4f}, Prec={clf['test_precision']:.4f}, Rec={clf['test_recall']:.4f}, F1={clf['test_f1']:.4f}, Spec={clf['test_specificity']:.4f}")
        print(f"      Train Time: {clf['total_train_time']:.3f}s")
        if clf.get('prediction_test_time_per_sample', 0) > 0:
            print(f"      Prediction Time/Sample: {clf['prediction_test_time_per_sample']*1000:.4f}ms")

print()
print("=" * 80)
print("Results available at: /var/www/static/pipeline-results/")
print("Each pipeline folder contains:")
print("  - {name}_results.json (full metrics)")
print("  - {name}.csv (results table)")
print("  - {name}.log (execution log)")
print("  - confusion_matrix_*.png (per classifier)")
print("  - metrics_summary.txt (human-readable)")
PYTHON
EOF

# Send email
cat << 'EMAILEOF' | himalaya template send
From: contact@aaroncollins.info
To: aaron777collins@gmail.com
Cc: joshuapicchioni@gmail.com
Subject: ConnectedDrivingPipelineV4 - All 36 Pipelines Complete

$(cat /tmp/pipeline_results.txt)

Best regards,
Sophie (Clawdbot)
EMAILEOF
```

---

## ⚠️ CONTINGENCIES

### If Pipeline Fails Mid-Run

```bash
# Check which pipeline failed
ssh jaekel "cat /home/ubuntu/repos/ConnectedDrivingPipelineV4/pipeline-results/run_summary.json | jq '.results[] | select(.status==\"failed\")'"

# Resume from specific pipeline (1-indexed)
ssh jaekel "cd /home/ubuntu/repos/ConnectedDrivingPipelineV4 && source .venv/bin/activate && python run_all_pipelines.py --start-from N"
```

### If Disk Space Issues

```bash
# Check disk usage
ssh jaekel "df -h /home/ubuntu"

# Clear intermediate data (after successful run)
ssh jaekel "rm -rf /home/ubuntu/repos/ConnectedDrivingPipelineV4/data/classifierdata/splitfiles/*"
```

### If Memory Issues

```bash
# Check Dask config in run_all_pipelines.py
# Reduce workers or memory limits:
cluster = LocalCluster(
    n_workers=2,  # Reduce from 4
    threads_per_worker=2,  # Reduce from 3
    memory_limit='8GB',  # Reduce from 12GB
)
```

---

## 📊 EXPECTED OUTPUT STRUCTURE

```
pipeline-results/
├── run_summary.json
├── basic_2km_const/
│   ├── basic_2km_const_results.json
│   ├── basic_2km_const.csv
│   ├── basic_2km_const.log
│   ├── confusion_matrix_RandomForest.png
│   ├── confusion_matrix_DecisionTree.png
│   ├── confusion_matrix_KNeighbors.png
│   └── metrics_summary.txt
├── basic_2km_rand/
│   └── ...
├── basic_2km_withid_const/
│   └── ...
... (36 total pipeline folders)
```

---

## 🔧 PROACTIVE JOB CONFIGURATION

To automate future runs, add to `scheduler/proactive-jobs/pipeline-monitor.yaml`:

```yaml
name: ConnectedDrivingPipeline Monitor
schedule: "0 */6 * * *"  # Every 6 hours
enabled: false  # Enable when needed

tasks:
  - name: check_pipeline_status
    command: |
      ssh jaekel "cat /home/ubuntu/repos/ConnectedDrivingPipelineV4/pipeline-results/run_summary.json 2>/dev/null | jq -r '.successful // 0'"
    on_failure: notify_aaron
    
  - name: notify_aaron
    type: email
    to: aaron777collins@gmail.com
    subject: "Pipeline Status Update"
```

---

## ✅ EXECUTION CHECKLIST

- [ ] Clear all caches (Phase 1)
- [ ] Start pipeline run (Phase 2)
- [ ] Monitor progress (Phase 3)
- [ ] Verify 36/36 completed (Phase 4)
- [ ] Check no failures in run_summary.json
- [ ] Verify artifact structure for each pipeline
- [ ] Send completion email (Phase 5)
- [ ] Archive results if needed

---

## 📞 CONTACTS

- **Aaron Collins:** aaron777collins@gmail.com
- **Joshua Picchioni:** joshuapicchioni@gmail.com

---

*Document generated by Sophie (Opus) - 2026-02-24*
