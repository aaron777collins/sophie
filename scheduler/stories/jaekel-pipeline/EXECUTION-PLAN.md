# ConnectedDrivingPipelineV4 - Comprehensive Execution Plan

**Created:** 2026-02-23 22:35 EST
**Priority:** 🔴 CRITICAL - Results needed ASAP
**Status:** Ready for Execution

---

## 🤖 FULLY AUTONOMOUS EXECUTION

**Scripts (run in order):**
```bash
# 1. Pre-flight audit - catches issues BEFORE running
python ~/clawd/scheduler/stories/jaekel-pipeline/scripts/audit_and_precheck.py

# 2. Autonomous executor - runs all pipelines with auto-fix
python ~/clawd/scheduler/stories/jaekel-pipeline/scripts/autonomous_executor.py
```

**The autonomous executor:**
1. ✅ Runs each pipeline
2. ✅ Parses logs for ALL known error patterns
3. ✅ Auto-diagnoses issues (KeyError, empty test, row limit, etc.)
4. ✅ Applies fixes automatically
5. ✅ Re-runs until success (max 3 attempts)
6. ✅ Saves progress after each pipeline
7. ✅ Generates final report

---

## Executive Summary

This plan fixes ALL identified issues in the ConnectedDrivingPipelineV4 and produces validated ML results on the FULL dataset (13.3M rows).

---

## Issues Inventory (ALL Must Be Fixed)

| # | Issue | Severity | Detection Method |
|---|-------|----------|------------------|
| 1 | Cache key collisions | 🔴 CRITICAL | Unit tests + log inspection |
| 2 | Column name case mismatch | 🔴 CRITICAL | `grep -i keyerror` in logs |
| 3 | Train/test split (100K hardcoded) | 🔴 CRITICAL | `grep -i "n_samples=0"` in logs |
| 4 | 100K row subsection limit | 🔴 CRITICAL | Check row counts in logs |
| 5 | Dashboard failure detection | 🟠 HIGH | Verify exit codes on crash |
| 6 | Dask port conflicts | 🟡 MEDIUM | `grep "Port 8787"` warnings |
| 7 | Orphaned processes | ✅ DONE | Process list check |

---

## Execution Order (Dependencies)

```
PHASE 0: Preparation
    ├── Kill orphaned processes ✅ DONE
    ├── Backup existing caches
    └── Clear all caches

PHASE 1: Cache Key Fix (EPIC-1) ← MUST BE FIRST
    └── All subsequent work depends on correct caching

PHASE 2: Schema Fix (EPIC-2)
    └── Data must load before we can split it

PHASE 3: Row Limit + Split Fix (EPIC-3 + NEW)
    └── Full data + correct splits

PHASE 4: Infrastructure (EPIC-4)
    └── Dashboard + Dask fixes

PHASE 5: Validation Runs (EPIC-5)
    └── One-by-one with full log analysis
```

---

## Phase 0: Preparation

### 0.1 Kill Orphaned Processes
```bash
# ✅ DONE - Already executed
pkill -f "Run.*km.*\.py"
```

### 0.2 Backup Existing Caches
```bash
ssh jaekel "cd /home/ubuntu/repos/ConnectedDrivingPipelineV4 && \
    mkdir -p cache_backup_$(date +%Y%m%d_%H%M%S) && \
    cp -r cache/* cache_backup_$(date +%Y%m%d_%H%M%S)/ 2>/dev/null || echo 'No cache to backup'"
```

### 0.3 Clear All Caches
```bash
ssh jaekel "cd /home/ubuntu/repos/ConnectedDrivingPipelineV4 && \
    rm -rf cache/* && \
    rm -rf data/classifierdata/splitfiles/cleaned/* && \
    rm -rf data/classifierdata/splitfiles/combinedcleaned/* && \
    echo 'Caches cleared'"
```

---

## Phase 1: Cache Key Fix

### 1.1 Implementation

**File:** `Decorators/FileCache.py`

```python
# NEW: Explicit cache key with ALL parameters
def create_cache_key_v2(
    function_name: str,
    columns: List[str],
    attack_config: Dict,
    spatial_config: Dict,
    date_range: Tuple[str, str],
    version: str = "v3"
) -> str:
    """
    Generate absolutely unique cache key including:
    - Function name
    - Column list hash
    - Attack type
    - Attack parameters (min/max offset, direction, etc.)
    - Spatial radius
    - Date range
    - Malicious ratio
    """
    # Column hash
    col_hash = hashlib.md5(str(sorted(columns)).encode()).hexdigest()[:8]
    
    # Attack hash - includes ALL attack params
    attack_str = json.dumps({
        "type": attack_config.get("type"),
        "offset_min": attack_config.get("offset_distance_min"),
        "offset_max": attack_config.get("offset_distance_max"),
        "direction_min": attack_config.get("offset_direction_min"),
        "direction_max": attack_config.get("offset_direction_max"),
        "ratio": attack_config.get("malicious_ratio"),
        "seed": attack_config.get("seed")
    }, sort_keys=True)
    attack_hash = hashlib.md5(attack_str.encode()).hexdigest()[:8]
    
    # Spatial hash
    spatial_str = f"{spatial_config.get('radius_meters')}_{spatial_config.get('center_latitude')}_{spatial_config.get('center_longitude')}"
    spatial_hash = hashlib.md5(spatial_str.encode()).hexdigest()[:8]
    
    # Date hash
    date_hash = hashlib.md5(f"{date_range[0]}_{date_range[1]}".encode()).hexdigest()[:8]
    
    # Verbose key for logging
    verbose_key = f"{version}|{function_name}|cols:{col_hash}|attack:{attack_config.get('type')}:{attack_hash}|radius:{spatial_config.get('radius_meters')}|dates:{date_hash}"
    
    # Log the verbose key
    logger.log(f"CACHE_KEY: {verbose_key}")
    
    # Return hash for filesystem
    return hashlib.md5(verbose_key.encode()).hexdigest()
```

### 1.2 Validation Tests

```python
# tests/test_cache_keys.py

def test_different_offset_ranges_different_keys():
    """50-100m offset vs 100-200m MUST have different keys"""
    config_a = {"offset_distance_min": 50, "offset_distance_max": 100, ...}
    config_b = {"offset_distance_min": 100, "offset_distance_max": 200, ...}
    key_a = create_cache_key_v2("clean", cols, config_a, spatial, dates)
    key_b = create_cache_key_v2("clean", cols, config_b, spatial, dates)
    assert key_a != key_b, f"Keys must differ: {key_a} vs {key_b}"

def test_different_attack_types_different_keys():
    """rand_offset vs const_offset MUST have different keys"""
    config_a = {"type": "rand_offset", ...}
    config_b = {"type": "const_offset", ...}
    key_a = create_cache_key_v2("clean", cols, config_a, spatial, dates)
    key_b = create_cache_key_v2("clean", cols, config_b, spatial, dates)
    assert key_a != key_b

def test_different_features_different_keys():
    """BASIC vs EXTENDED features MUST have different keys"""
    cols_basic = ["x_pos", "y_pos", "coreData_elevation"]
    cols_extended = ["x_pos", "y_pos", "coreData_elevation", "coreData_speed", "coreData_heading"]
    key_a = create_cache_key_v2("clean", cols_basic, attack, spatial, dates)
    key_b = create_cache_key_v2("clean", cols_extended, attack, spatial, dates)
    assert key_a != key_b
```

### 1.3 Detection Method
```bash
# Verify no cache collisions
grep "CACHE_KEY:" logs/*.log | sort | uniq -d
# Expected: NO OUTPUT (no duplicate keys for different configs)
```

---

## Phase 2: Schema Fix

### 2.1 Column Name Corrections

**All 18 config files need these fixes:**

| Wrong | Correct |
|-------|---------|
| `coredata_position_lat` | `coreData_position_lat` |
| `coredata_position_long` | `coreData_position_long` |
| `coredata_elevation` | `coreData_elevation` |
| `coredata_speed` | `coreData_speed` |
| `coredata_heading` | `coreData_heading` |
| `coredata_accelset_accelyaw` | `coreData_accelset_accelYaw` |
| `metadata_receivedat` | `metadata_receivedAt` |

### 2.2 Fix Script
```bash
ssh jaekel "cd /home/ubuntu/repos/ConnectedDrivingPipelineV4/production_configs && \
    for f in *.json; do
        sed -i 's/coredata_position_lat/coreData_position_lat/g' \$f
        sed -i 's/coredata_position_long/coreData_position_long/g' \$f
        sed -i 's/coredata_elevation/coreData_elevation/g' \$f
        sed -i 's/coredata_speed/coreData_speed/g' \$f
        sed -i 's/coredata_heading/coreData_heading/g' \$f
        sed -i 's/coredata_accelset_accelyaw/coreData_accelset_accelYaw/g' \$f
        sed -i 's/metadata_receivedat/metadata_receivedAt/g' \$f
    done && echo 'Fixed all configs'"
```

### 2.3 Detection Method
```bash
# Verify no KeyErrors
grep -i "keyerror" logs/*.log | wc -l
# Expected: 0

# Verify no wrong column names in configs
grep -r "coredata_position" production_configs/ | wc -l
# Expected: 0
```

---

## Phase 3: Row Limit + Split Fix

### 3.1 Remove 100K Subsection Limit

**File:** `MachineLearning/DaskPipelineRunner.py` line 145

```python
# BEFORE:
num_subsection_rows = data_config.get("num_subsection_rows", 100000)

# AFTER:
num_subsection_rows = data_config.get("num_subsection_rows", None)
if num_subsection_rows is None:
    # No limit - use all data after spatial filtering
    logger.log("Using ALL rows (no subsection limit)")
else:
    logger.log(f"Limiting to {num_subsection_rows:,} rows")
```

### 3.2 Fix Train/Test Split

**File:** `MachineLearning/DaskPipelineRunner.py` lines 375-387

```python
# BEFORE (broken):
num_rows_to_train = int(total_rows * train_ratio) if split_config.get("type") == "random" else split_config.get("num_train_rows", 100000)
train_pd = data_pd.head(num_rows_to_train)
test_pd = data_pd.tail(total_rows - num_rows_to_train)

# AFTER (correct):
from sklearn.model_selection import train_test_split

test_size = split_config.get("test_size", 0.2)
random_state = split_config.get("random_state", 42)

self.logger.log(f"Splitting {total_rows:,} rows: {(1-test_size)*100:.0f}% train, {test_size*100:.0f}% test")

train_pd, test_pd = train_test_split(
    data_pd, 
    test_size=test_size, 
    random_state=random_state,
    shuffle=True
)

self.logger.log(f"Split complete: train={len(train_pd):,}, test={len(test_pd):,}")

# Validation
if len(test_pd) < 10:
    raise ValueError(f"Test set too small: {len(test_pd)} samples")
```

### 3.3 Update Config Files

Add to ALL 18 production configs:
```json
{
  "data": {
    "num_subsection_rows": null  // Use ALL data after spatial filter
  },
  "ml": {
    "train_test_split": {
      "test_size": 0.2,
      "random_state": 42,
      "shuffle": true
    }
  }
}
```

### 3.4 Detection Methods
```bash
# Verify full data is being processed
grep "Using ALL rows\|Total rows after cleaning" logs/*.log

# Verify no n_samples=0 errors
grep -i "n_samples=0" logs/*.log | wc -l
# Expected: 0

# Verify split sizes are reasonable
grep "Split complete:" logs/*.log
# Expected: train and test both > 0
```

---

## Phase 4: Infrastructure Fixes

### 4.1 Dashboard Failure Detection

**File:** `~/.pipeline-queue/daemon.py`

```python
# Add proper error detection
def run_pipeline(job):
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    # Check for Python errors in output
    error_patterns = ["Traceback", "Error:", "Exception:", "KeyError:", "ValueError:"]
    has_error = any(p in result.stdout or p in result.stderr for p in error_patterns)
    
    if result.returncode != 0 or has_error:
        job["status"] = "failed"
        job["error"] = "Pipeline crashed - check logs"
    else:
        job["status"] = "completed"
```

### 4.2 Dask Port Management

**File:** Pipeline startup code

```python
# Use dynamic port allocation
from distributed import LocalCluster, Client

cluster = LocalCluster(
    n_workers=4,
    threads_per_worker=2,
    memory_limit='16GB',
    dashboard_address=':0'  # Dynamic port
)
```

---

## Phase 5: Validation Runs

### 5.1 Validation Protocol (STRICT)

For EACH pipeline:

1. **Pre-Run Check**
   ```bash
   # No orphaned processes
   pgrep -f "Run.*km" && echo "ABORT: Orphaned process!" || echo "OK"
   ```

2. **Execute Pipeline**
   ```bash
   cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
   source venv/bin/activate
   python Run{radius}{variant}.py 2>&1 | tee logs/run_$(date +%Y%m%d_%H%M%S).log
   ```

3. **Full Log Analysis (MANDATORY)**
   ```bash
   LOG="logs/latest.log"
   
   # Check for ANY errors
   echo "=== ERROR CHECK ==="
   grep -iE "error|exception|traceback|keyerror|valueerror" $LOG
   
   # Check row counts
   echo "=== ROW COUNTS ==="
   grep -E "rows|samples|split" $LOG
   
   # Check cache behavior
   echo "=== CACHE ==="
   grep -i "cache" $LOG
   
   # Check for success indicators
   echo "=== RESULTS ==="
   grep -E "accuracy|precision|recall|f1" $LOG
   ```

4. **Results Validation**
   ```bash
   # Check output files exist and have content
   ls -la results/matrix/*/
   
   # Verify CSV has actual data (not just headers)
   head -5 results/matrix/*/*.csv
   wc -l results/matrix/*/*.csv
   ```

5. **If ANY Error Found**
   - STOP immediately
   - Document the error
   - Create fix task
   - Fix the issue
   - Re-run same pipeline
   - Repeat until clean

### 5.2 Pipeline Run Order

| # | Pipeline | Expected Rows | Notes |
|---|----------|---------------|-------|
| 1 | Run2kmBasic.py | ~50K-500K | Smallest, fastest feedback |
| 2 | Run2kmMovement.py | ~50K-500K | |
| 3 | Run2kmExtended.py | ~50K-500K | |
| 4 | Run100kmBasic.py | ~2-5M | Larger dataset |
| 5 | Run100kmMovement.py | ~2-5M | |
| 6 | Run100kmExtended.py | ~2-5M | |
| 7 | Run200kmBasic.py | ~8-13M | Full dataset |
| 8 | Run200kmMovement.py | ~8-13M | |
| 9 | Run200kmExtended.py | ~8-13M | |

### 5.3 Success Criteria Per Pipeline

| Metric | Requirement |
|--------|-------------|
| Errors in log | 0 |
| KeyErrors | 0 |
| n_samples=0 | 0 |
| Test set size | > 10% of total |
| Accuracy | 0.5 - 1.0 (reasonable range) |
| Output CSV | Has data rows, not just headers |
| Confusion matrix | Present and non-empty |

---

## Log Analysis Cheat Sheet

```bash
# One-liner to check ALL error types
grep -iE "error|exception|traceback|keyerror|valueerror|failed|n_samples=0" logs/*.log

# Check if results are real (not empty)
for f in results/*/*.csv; do
    rows=$(wc -l < "$f")
    if [ "$rows" -lt 5 ]; then
        echo "WARNING: $f has only $rows lines!"
    fi
done

# Verify cache keys are unique
grep "CACHE_KEY:" logs/*.log | cut -d'|' -f2- | sort | uniq -c | sort -rn | head

# Check memory usage
grep -i "memory" logs/*.log | tail -20
```

---

## Rollback Plan

If fixes cause new issues:

1. **Restore cache backup**
   ```bash
   rm -rf cache/*
   cp -r cache_backup_*/* cache/
   ```

2. **Revert code changes**
   ```bash
   git checkout -- Decorators/FileCache.py
   git checkout -- MachineLearning/DaskPipelineRunner.py
   ```

3. **Restore config backups**
   ```bash
   git checkout -- production_configs/
   ```

---

## Estimated Timeline

| Phase | Time | Status |
|-------|------|--------|
| Phase 0: Preparation | 15 min | Ready |
| Phase 1: Cache Keys | 2-3 hours | Ready |
| Phase 2: Schema Fix | 1 hour | Ready |
| Phase 3: Row/Split Fix | 2 hours | Ready |
| Phase 4: Infrastructure | 1 hour | Ready |
| Phase 5: Validation | 4-6 hours | Depends on issues |
| **Total** | **10-13 hours** | |

---

## Final Deliverables

1. ✅ All 18 pipelines complete without errors
2. ✅ Real ML results (accuracy, confusion matrices)
3. ✅ Full data processed (millions of rows, not 100K)
4. ✅ Cache keys absolutely unique per config
5. ✅ Dashboard shows correct pass/fail status
6. ✅ Documentation of all fixes
