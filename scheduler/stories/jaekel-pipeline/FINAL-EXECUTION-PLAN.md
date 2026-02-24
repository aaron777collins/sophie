# ConnectedDrivingPipelineV4 - FINAL EXECUTION PLAN

**Created:** 2026-02-24 00:30 EST  
**Status:** ✅ READY FOR EXECUTION  
**Total Pipelines:** 36  
**Estimated Duration:** 16-20 hours  

---

## ✅ PRE-EXECUTION STATE (Verified)

All critical fixes from the Opus Audit have been applied:

| Fix | Status | Verification |
|-----|--------|--------------|
| Attack type `const_offset_per_id` | ✅ Fixed | 18 configs use correct name |
| Attack type `rand_offset` | ✅ Fixed | 18 configs use correct name |
| Column names (camelCase) | ✅ Fixed | `coreData_position_lat`, etc. |
| 36 configs deployed | ✅ Complete | `/home/ubuntu/repos/ConnectedDrivingPipelineV4/production_configs_v2/` |
| 36 run scripts deployed | ✅ Complete | `Run*Const*.py` and `Run*Rand*.py` |
| Caches cleared | ✅ Complete | Fresh execution guaranteed |

---

## 🔧 Pipeline Parameters

### Attack Types
| Name | Code Value | Behavior |
|------|------------|----------|
| **Const Per ID** | `const_offset_per_id` | Same random offset applied to ALL data points of each vehicle ID |
| **Random** | `rand_offset` | Different random offset for each individual data point |

### Feature Sets
| Name | Features | Count |
|------|----------|-------|
| **Basic** | `x_pos`, `y_pos`, `coreData_elevation` | 3 |
| **Movement** | Basic + `coreData_speed`, `coreData_heading` | 5 |
| **Extended** | Movement + `coreData_accelset_accelYaw`, `metadata_receivedAt_numeric` | 7 |

### ID Variants
| Name | Includes `coreData_id` | Purpose |
|------|------------------------|---------|
| **NoId** | No | Standard feature-based detection |
| **WithId** | Yes | Per-vehicle pattern learning |

### Standard Parameters (All Pipelines)
- **Date Range:** 2021-04-01 to 2021-04-30 (April 2021)
- **Malicious Ratio:** 0.3 (30% attackers)
- **Random Seed:** 42 (reproducibility)
- **Train/Test Split:** 80/20

---

## 📋 COMPLETE PIPELINE MATRIX (36 Configurations)

### Phase 2: 2km Radius (12 pipelines) - ~2 hours

| # | Config File | Run Script | Expected Rows | Expected Memory |
|---|-------------|------------|---------------|-----------------|
| 1 | `basic_2km_noid_const_per_id_pipeline_config.json` | `Run2kmBasicNoIdConst.py` | 50K-500K | 2-4 GB |
| 2 | `basic_2km_noid_rand_offset_pipeline_config.json` | `Run2kmBasicNoIdRand.py` | 50K-500K | 2-4 GB |
| 3 | `basic_2km_withid_const_per_id_pipeline_config.json` | `Run2kmBasicWithIdConst.py` | 50K-500K | 2-4 GB |
| 4 | `basic_2km_withid_rand_offset_pipeline_config.json` | `Run2kmBasicWithIdRand.py` | 50K-500K | 2-4 GB |
| 5 | `movement_2km_noid_const_per_id_pipeline_config.json` | `Run2kmMovementNoIdConst.py` | 50K-500K | 2-4 GB |
| 6 | `movement_2km_noid_rand_offset_pipeline_config.json` | `Run2kmMovementNoIdRand.py` | 50K-500K | 2-4 GB |
| 7 | `movement_2km_withid_const_per_id_pipeline_config.json` | `Run2kmMovementWithIdConst.py` | 50K-500K | 2-4 GB |
| 8 | `movement_2km_withid_rand_offset_pipeline_config.json` | `Run2kmMovementWithIdRand.py` | 50K-500K | 2-4 GB |
| 9 | `extended_2km_noid_const_per_id_pipeline_config.json` | `Run2kmExtendedNoIdConst.py` | 50K-500K | 2-4 GB |
| 10 | `extended_2km_noid_rand_offset_pipeline_config.json` | `Run2kmExtendedNoIdRand.py` | 50K-500K | 2-4 GB |
| 11 | `extended_2km_withid_const_per_id_pipeline_config.json` | `Run2kmExtendedWithIdConst.py` | 50K-500K | 2-4 GB |
| 12 | `extended_2km_withid_rand_offset_pipeline_config.json` | `Run2kmExtendedWithIdRand.py` | 50K-500K | 2-4 GB |

### Phase 3: 100km Radius (12 pipelines) - ~4 hours

| # | Config File | Run Script | Expected Rows | Expected Memory |
|---|-------------|------------|---------------|-----------------|
| 13 | `basic_100km_noid_const_per_id_pipeline_config.json` | `Run100kmBasicNoIdConst.py` | 2M-5M | 8-16 GB |
| 14 | `basic_100km_noid_rand_offset_pipeline_config.json` | `Run100kmBasicNoIdRand.py` | 2M-5M | 8-16 GB |
| 15 | `basic_100km_withid_const_per_id_pipeline_config.json` | `Run100kmBasicWithIdConst.py` | 2M-5M | 8-16 GB |
| 16 | `basic_100km_withid_rand_offset_pipeline_config.json` | `Run100kmBasicWithIdRand.py` | 2M-5M | 8-16 GB |
| 17 | `movement_100km_noid_const_per_id_pipeline_config.json` | `Run100kmMovementNoIdConst.py` | 2M-5M | 8-16 GB |
| 18 | `movement_100km_noid_rand_offset_pipeline_config.json` | `Run100kmMovementNoIdRand.py` | 2M-5M | 8-16 GB |
| 19 | `movement_100km_withid_const_per_id_pipeline_config.json` | `Run100kmMovementWithIdConst.py` | 2M-5M | 8-16 GB |
| 20 | `movement_100km_withid_rand_offset_pipeline_config.json` | `Run100kmMovementWithIdRand.py` | 2M-5M | 8-16 GB |
| 21 | `extended_100km_noid_const_per_id_pipeline_config.json` | `Run100kmExtendedNoIdConst.py` | 2M-5M | 8-16 GB |
| 22 | `extended_100km_noid_rand_offset_pipeline_config.json` | `Run100kmExtendedNoIdRand.py` | 2M-5M | 8-16 GB |
| 23 | `extended_100km_withid_const_per_id_pipeline_config.json` | `Run100kmExtendedWithIdConst.py` | 2M-5M | 8-16 GB |
| 24 | `extended_100km_withid_rand_offset_pipeline_config.json` | `Run100kmExtendedWithIdRand.py` | 2M-5M | 8-16 GB |

### Phase 4: 200km Radius (12 pipelines) - ~8 hours

| # | Config File | Run Script | Expected Rows | Expected Memory |
|---|-------------|------------|---------------|-----------------|
| 25 | `basic_200km_noid_const_per_id_pipeline_config.json` | `Run200kmBasicNoIdConst.py` | 8M-13M | 24-40 GB |
| 26 | `basic_200km_noid_rand_offset_pipeline_config.json` | `Run200kmBasicNoIdRand.py` | 8M-13M | 24-40 GB |
| 27 | `basic_200km_withid_const_per_id_pipeline_config.json` | `Run200kmBasicWithIdConst.py` | 8M-13M | 24-40 GB |
| 28 | `basic_200km_withid_rand_offset_pipeline_config.json` | `Run200kmBasicWithIdRand.py` | 8M-13M | 24-40 GB |
| 29 | `movement_200km_noid_const_per_id_pipeline_config.json` | `Run200kmMovementNoIdConst.py` | 8M-13M | 24-40 GB |
| 30 | `movement_200km_noid_rand_offset_pipeline_config.json` | `Run200kmMovementNoIdRand.py` | 8M-13M | 24-40 GB |
| 31 | `movement_200km_withid_const_per_id_pipeline_config.json` | `Run200kmMovementWithIdConst.py` | 8M-13M | 24-40 GB |
| 32 | `movement_200km_withid_rand_offset_pipeline_config.json` | `Run200kmMovementWithIdRand.py` | 8M-13M | 24-40 GB |
| 33 | `extended_200km_noid_const_per_id_pipeline_config.json` | `Run200kmExtendedNoIdConst.py` | 8M-13M | 24-40 GB |
| 34 | `extended_200km_noid_rand_offset_pipeline_config.json` | `Run200kmExtendedNoIdRand.py` | 8M-13M | 24-40 GB |
| 35 | `extended_200km_withid_const_per_id_pipeline_config.json` | `Run200kmExtendedWithIdConst.py` | 8M-13M | 24-40 GB |
| 36 | `extended_200km_withid_rand_offset_pipeline_config.json` | `Run200kmExtendedWithIdRand.py` | 8M-13M | 24-40 GB |

---

## 🛫 PHASE 0: PRE-FLIGHT VERIFICATION (30 min)

### Step 0.1: Verify Server Resources
```bash
ssh jaekel
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4

# Check available resources
echo "=== SYSTEM RESOURCES ==="
free -h
df -h /home/ubuntu
nproc

# EXPECTED:
# RAM: 62GB total, ~50GB available
# Disk: 300+ GB free
# CPUs: 16 cores
```

### Step 0.2: Verify Config Deployment
```bash
# Count configs
echo "=== CONFIG COUNT ==="
ls -la production_configs_v2/*.json | wc -l
# EXPECTED: 36

# Verify attack types
echo "=== ATTACK TYPE VERIFICATION ==="
grep -l "const_offset_per_id" production_configs_v2/*.json | wc -l
# EXPECTED: 18

grep -l "rand_offset" production_configs_v2/*.json | wc -l
# EXPECTED: 18

# Verify column names (spot check)
echo "=== COLUMN NAME VERIFICATION ==="
grep -c "coreData_position_lat" production_configs_v2/*.json | head -5
# EXPECTED: Each config shows :1 (column name present)
```

### Step 0.3: Verify Run Scripts
```bash
echo "=== RUN SCRIPT COUNT ==="
ls Run*.py | wc -l
# EXPECTED: 36

echo "=== CONST RUN SCRIPTS ==="
ls Run*Const*.py | wc -l
# EXPECTED: 18

echo "=== RAND RUN SCRIPTS ==="
ls Run*Rand*.py | wc -l
# EXPECTED: 18
```

### Step 0.4: Kill Orphaned Processes
```bash
# Kill any stale Dask processes
pkill -f dask || true
pkill -f "python.*Run" || true

# Verify nothing running
ps aux | grep -E "(dask|Run.*\.py)" | grep -v grep
# EXPECTED: No output
```

### Step 0.5: Verify Caches Cleared
```bash
# Check cache directories are empty/fresh
echo "=== CACHE STATUS ==="
ls -la cache/ 2>/dev/null || echo "No cache directory"
du -sh cache/ 2>/dev/null || echo "Cache empty or missing"
# EXPECTED: Empty or minimal size
```

### Step 0.6: Create Results Directory
```bash
mkdir -p results/$(date +%Y%m%d)
mkdir -p logs/$(date +%Y%m%d)
echo "Results will go to: results/$(date +%Y%m%d)"
```

---

## 📝 LOG AUDIT PROTOCOL (Run After EVERY Pipeline)

### Standard Audit Script
```bash
#!/bin/bash
# save as: audit_pipeline.sh
# usage: ./audit_pipeline.sh <pipeline_name> <log_file>

PIPELINE_NAME="$1"
LOG="$2"

echo "============================================"
echo "AUDIT: $PIPELINE_NAME"
echo "LOG: $LOG"
echo "TIME: $(date)"
echo "============================================"

# 1. Error Check
echo ""
echo "=== 1. ERROR CHECK ==="
ERROR_COUNT=$(grep -ciE "error|exception|traceback|keyerror|valueerror" "$LOG" || echo 0)
if [ "$ERROR_COUNT" -gt 0 ]; then
    echo "🔴 ERRORS FOUND: $ERROR_COUNT"
    grep -iE "error|exception|traceback|keyerror|valueerror" "$LOG" | head -20
else
    echo "✅ No errors found"
fi

# 2. Row Count Verification
echo ""
echo "=== 2. ROW COUNTS ==="
grep -E "rows|samples|Total|DataFrame" "$LOG" | tail -10
# EXPECTED: Should match spatial filter expectations (NOT 100K limit)

# 3. Attack Verification
echo ""
echo "=== 3. ATTACK VERIFICATION ==="
grep -iE "attack|attacker|malicious|const_offset|rand_offset" "$LOG" | head -10
# EXPECTED: Shows attack type being applied, attacker count > 0

# 4. Cache Key Uniqueness
echo ""
echo "=== 4. CACHE KEY ==="
grep -E "CACHE|cache_key|hash" "$LOG" | head -5
# EXPECTED: Unique key for this config

# 5. Train/Test Split
echo ""
echo "=== 5. TRAIN/TEST SPLIT ==="
grep -E "train|test|split|Train|Test" "$LOG" | tail -5
# EXPECTED: 80/20 split, both sets have samples > 0

# 6. ML Results
echo ""
echo "=== 6. ML RESULTS ==="
grep -E "accuracy|precision|recall|f1|Accuracy|F1|AUC" "$LOG" | tail -5
# EXPECTED: Metrics in range 0.5-1.0

# 7. Duration
echo ""
echo "=== 7. EXECUTION TIME ==="
grep -iE "duration|elapsed|complete|finished|time" "$LOG" | tail -3

echo ""
echo "============================================"
echo "AUDIT COMPLETE: $PIPELINE_NAME"
echo "============================================"
```

### Success Criteria Per Pipeline
| Check | Pass Condition |
|-------|----------------|
| Errors | 0 errors in log |
| Rows | > 10,000 rows processed (not 100K ceiling) |
| Attacks | Attack type logged, attackers > 0 |
| Cache | Unique cache key logged |
| Split | Train AND test sets have samples |
| ML Results | Accuracy between 0.5 and 1.0 |
| Duration | Completed (no timeout/crash) |

---

## 🚀 EXECUTION ORDER (Sequential)

### IMPORTANT: Run One at a Time
**DO NOT run pipelines in parallel.** This prevents:
- Memory contention
- Dask port conflicts
- Cache interference
- Log interleaving

### Phase 1: Pre-Flight (30 min)
Run all verification steps in Phase 0.

**Slack Update:**
```
🛫 PRE-FLIGHT COMPLETE
✅ 36 configs verified
✅ 36 run scripts verified
✅ Resources: 62GB RAM, 300GB disk
✅ Caches cleared
Starting Phase 2: 2km pipelines (12 runs)
```

### Phase 2: 2km Pipelines (2 hours)

Execute in order:
```bash
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4

# Pipeline 1
python Run2kmBasicNoIdConst.py 2>&1 | tee logs/$(date +%Y%m%d)/01_2km_basic_noid_const.log
./audit_pipeline.sh "2km-Basic-NoId-Const" "logs/$(date +%Y%m%d)/01_2km_basic_noid_const.log"

# Pipeline 2
python Run2kmBasicNoIdRand.py 2>&1 | tee logs/$(date +%Y%m%d)/02_2km_basic_noid_rand.log
./audit_pipeline.sh "2km-Basic-NoId-Rand" "logs/$(date +%Y%m%d)/02_2km_basic_noid_rand.log"

# Pipeline 3
python Run2kmBasicWithIdConst.py 2>&1 | tee logs/$(date +%Y%m%d)/03_2km_basic_withid_const.log
./audit_pipeline.sh "2km-Basic-WithId-Const" "logs/$(date +%Y%m%d)/03_2km_basic_withid_const.log"

# Pipeline 4
python Run2kmBasicWithIdRand.py 2>&1 | tee logs/$(date +%Y%m%d)/04_2km_basic_withid_rand.log
./audit_pipeline.sh "2km-Basic-WithId-Rand" "logs/$(date +%Y%m%d)/04_2km_basic_withid_rand.log"

# Pipeline 5
python Run2kmMovementNoIdConst.py 2>&1 | tee logs/$(date +%Y%m%d)/05_2km_movement_noid_const.log
./audit_pipeline.sh "2km-Movement-NoId-Const" "logs/$(date +%Y%m%d)/05_2km_movement_noid_const.log"

# Pipeline 6
python Run2kmMovementNoIdRand.py 2>&1 | tee logs/$(date +%Y%m%d)/06_2km_movement_noid_rand.log
./audit_pipeline.sh "2km-Movement-NoId-Rand" "logs/$(date +%Y%m%d)/06_2km_movement_noid_rand.log"

# Pipeline 7
python Run2kmMovementWithIdConst.py 2>&1 | tee logs/$(date +%Y%m%d)/07_2km_movement_withid_const.log
./audit_pipeline.sh "2km-Movement-WithId-Const" "logs/$(date +%Y%m%d)/07_2km_movement_withid_const.log"

# Pipeline 8
python Run2kmMovementWithIdRand.py 2>&1 | tee logs/$(date +%Y%m%d)/08_2km_movement_withid_rand.log
./audit_pipeline.sh "2km-Movement-WithId-Rand" "logs/$(date +%Y%m%d)/08_2km_movement_withid_rand.log"

# Pipeline 9
python Run2kmExtendedNoIdConst.py 2>&1 | tee logs/$(date +%Y%m%d)/09_2km_extended_noid_const.log
./audit_pipeline.sh "2km-Extended-NoId-Const" "logs/$(date +%Y%m%d)/09_2km_extended_noid_const.log"

# Pipeline 10
python Run2kmExtendedNoIdRand.py 2>&1 | tee logs/$(date +%Y%m%d)/10_2km_extended_noid_rand.log
./audit_pipeline.sh "2km-Extended-NoId-Rand" "logs/$(date +%Y%m%d)/10_2km_extended_noid_rand.log"

# Pipeline 11
python Run2kmExtendedWithIdConst.py 2>&1 | tee logs/$(date +%Y%m%d)/11_2km_extended_withid_const.log
./audit_pipeline.sh "2km-Extended-WithId-Const" "logs/$(date +%Y%m%d)/11_2km_extended_withid_const.log"

# Pipeline 12
python Run2kmExtendedWithIdRand.py 2>&1 | tee logs/$(date +%Y%m%d)/12_2km_extended_withid_rand.log
./audit_pipeline.sh "2km-Extended-WithId-Rand" "logs/$(date +%Y%m%d)/12_2km_extended_withid_rand.log"
```

**Slack Update After Phase 2:**
```
📊 PHASE 2 COMPLETE: 2km Pipelines
✅ Completed: 12/12
⏱️ Duration: ~2 hours
📈 Results Summary:
- Basic NoId Const: {accuracy}%
- Basic NoId Rand: {accuracy}%
... (all 12)
Starting Phase 3: 100km pipelines (12 runs)
```

### Phase 3: 100km Pipelines (4 hours)

Execute in order:
```bash
# Pipeline 13
python Run100kmBasicNoIdConst.py 2>&1 | tee logs/$(date +%Y%m%d)/13_100km_basic_noid_const.log
./audit_pipeline.sh "100km-Basic-NoId-Const" "logs/$(date +%Y%m%d)/13_100km_basic_noid_const.log"

# Pipeline 14
python Run100kmBasicNoIdRand.py 2>&1 | tee logs/$(date +%Y%m%d)/14_100km_basic_noid_rand.log
./audit_pipeline.sh "100km-Basic-NoId-Rand" "logs/$(date +%Y%m%d)/14_100km_basic_noid_rand.log"

# Pipeline 15
python Run100kmBasicWithIdConst.py 2>&1 | tee logs/$(date +%Y%m%d)/15_100km_basic_withid_const.log
./audit_pipeline.sh "100km-Basic-WithId-Const" "logs/$(date +%Y%m%d)/15_100km_basic_withid_const.log"

# Pipeline 16
python Run100kmBasicWithIdRand.py 2>&1 | tee logs/$(date +%Y%m%d)/16_100km_basic_withid_rand.log
./audit_pipeline.sh "100km-Basic-WithId-Rand" "logs/$(date +%Y%m%d)/16_100km_basic_withid_rand.log"

# Pipeline 17
python Run100kmMovementNoIdConst.py 2>&1 | tee logs/$(date +%Y%m%d)/17_100km_movement_noid_const.log
./audit_pipeline.sh "100km-Movement-NoId-Const" "logs/$(date +%Y%m%d)/17_100km_movement_noid_const.log"

# Pipeline 18
python Run100kmMovementNoIdRand.py 2>&1 | tee logs/$(date +%Y%m%d)/18_100km_movement_noid_rand.log
./audit_pipeline.sh "100km-Movement-NoId-Rand" "logs/$(date +%Y%m%d)/18_100km_movement_noid_rand.log"

# Pipeline 19
python Run100kmMovementWithIdConst.py 2>&1 | tee logs/$(date +%Y%m%d)/19_100km_movement_withid_const.log
./audit_pipeline.sh "100km-Movement-WithId-Const" "logs/$(date +%Y%m%d)/19_100km_movement_withid_const.log"

# Pipeline 20
python Run100kmMovementWithIdRand.py 2>&1 | tee logs/$(date +%Y%m%d)/20_100km_movement_withid_rand.log
./audit_pipeline.sh "100km-Movement-WithId-Rand" "logs/$(date +%Y%m%d)/20_100km_movement_withid_rand.log"

# Pipeline 21
python Run100kmExtendedNoIdConst.py 2>&1 | tee logs/$(date +%Y%m%d)/21_100km_extended_noid_const.log
./audit_pipeline.sh "100km-Extended-NoId-Const" "logs/$(date +%Y%m%d)/21_100km_extended_noid_const.log"

# Pipeline 22
python Run100kmExtendedNoIdRand.py 2>&1 | tee logs/$(date +%Y%m%d)/22_100km_extended_noid_rand.log
./audit_pipeline.sh "100km-Extended-NoId-Rand" "logs/$(date +%Y%m%d)/22_100km_extended_noid_rand.log"

# Pipeline 23
python Run100kmExtendedWithIdConst.py 2>&1 | tee logs/$(date +%Y%m%d)/23_100km_extended_withid_const.log
./audit_pipeline.sh "100km-Extended-WithId-Const" "logs/$(date +%Y%m%d)/23_100km_extended_withid_const.log"

# Pipeline 24
python Run100kmExtendedWithIdRand.py 2>&1 | tee logs/$(date +%Y%m%d)/24_100km_extended_withid_rand.log
./audit_pipeline.sh "100km-Extended-WithId-Rand" "logs/$(date +%Y%m%d)/24_100km_extended_withid_rand.log"
```

**Slack Update After Phase 3:**
```
📊 PHASE 3 COMPLETE: 100km Pipelines
✅ Completed: 12/12 (24/36 total)
⏱️ Duration: ~4 hours
📈 Results Summary:
... (all 12)
Starting Phase 4: 200km pipelines (12 runs) - LARGEST DATA
```

### Phase 4: 200km Pipelines (8 hours)

**⚠️ MEMORY MONITORING REQUIRED**
```bash
# Run htop in separate terminal to monitor
htop &

# Pipeline 25
python Run200kmBasicNoIdConst.py 2>&1 | tee logs/$(date +%Y%m%d)/25_200km_basic_noid_const.log
./audit_pipeline.sh "200km-Basic-NoId-Const" "logs/$(date +%Y%m%d)/25_200km_basic_noid_const.log"

# Pipeline 26
python Run200kmBasicNoIdRand.py 2>&1 | tee logs/$(date +%Y%m%d)/26_200km_basic_noid_rand.log
./audit_pipeline.sh "200km-Basic-NoId-Rand" "logs/$(date +%Y%m%d)/26_200km_basic_noid_rand.log"

# Pipeline 27
python Run200kmBasicWithIdConst.py 2>&1 | tee logs/$(date +%Y%m%d)/27_200km_basic_withid_const.log
./audit_pipeline.sh "200km-Basic-WithId-Const" "logs/$(date +%Y%m%d)/27_200km_basic_withid_const.log"

# Pipeline 28
python Run200kmBasicWithIdRand.py 2>&1 | tee logs/$(date +%Y%m%d)/28_200km_basic_withid_rand.log
./audit_pipeline.sh "200km-Basic-WithId-Rand" "logs/$(date +%Y%m%d)/28_200km_basic_withid_rand.log"

# Pipeline 29
python Run200kmMovementNoIdConst.py 2>&1 | tee logs/$(date +%Y%m%d)/29_200km_movement_noid_const.log
./audit_pipeline.sh "200km-Movement-NoId-Const" "logs/$(date +%Y%m%d)/29_200km_movement_noid_const.log"

# Pipeline 30
python Run200kmMovementNoIdRand.py 2>&1 | tee logs/$(date +%Y%m%d)/30_200km_movement_noid_rand.log
./audit_pipeline.sh "200km-Movement-NoId-Rand" "logs/$(date +%Y%m%d)/30_200km_movement_noid_rand.log"

# Pipeline 31
python Run200kmMovementWithIdConst.py 2>&1 | tee logs/$(date +%Y%m%d)/31_200km_movement_withid_const.log
./audit_pipeline.sh "200km-Movement-WithId-Const" "logs/$(date +%Y%m%d)/31_200km_movement_withid_const.log"

# Pipeline 32
python Run200kmMovementWithIdRand.py 2>&1 | tee logs/$(date +%Y%m%d)/32_200km_movement_withid_rand.log
./audit_pipeline.sh "200km-Movement-WithId-Rand" "logs/$(date +%Y%m%d)/32_200km_movement_withid_rand.log"

# Pipeline 33
python Run200kmExtendedNoIdConst.py 2>&1 | tee logs/$(date +%Y%m%d)/33_200km_extended_noid_const.log
./audit_pipeline.sh "200km-Extended-NoId-Const" "logs/$(date +%Y%m%d)/33_200km_extended_noid_const.log"

# Pipeline 34
python Run200kmExtendedNoIdRand.py 2>&1 | tee logs/$(date +%Y%m%d)/34_200km_extended_noid_rand.log
./audit_pipeline.sh "200km-Extended-NoId-Rand" "logs/$(date +%Y%m%d)/34_200km_extended_noid_rand.log"

# Pipeline 35
python Run200kmExtendedWithIdConst.py 2>&1 | tee logs/$(date +%Y%m%d)/35_200km_extended_withid_const.log
./audit_pipeline.sh "200km-Extended-WithId-Const" "logs/$(date +%Y%m%d)/35_200km_extended_withid_const.log"

# Pipeline 36
python Run200kmExtendedWithIdRand.py 2>&1 | tee logs/$(date +%Y%m%d)/36_200km_extended_withid_rand.log
./audit_pipeline.sh "200km-Extended-WithId-Rand" "logs/$(date +%Y%m%d)/36_200km_extended_withid_rand.log"
```

**Slack Update After Phase 4:**
```
📊 PHASE 4 COMPLETE: 200km Pipelines
✅ Completed: 12/12 (36/36 total)
⏱️ Duration: ~8 hours
📈 Results Summary:
... (all 12)
Starting Phase 5: Results Compilation
```

### Phase 5: Results Compilation (1 hour)

```bash
# Collect all results
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4

# Create summary CSV
echo "Pipeline,Radius,Features,ID,Attack,Accuracy,Precision,Recall,F1,Duration" > results/$(date +%Y%m%d)/summary.csv

# Extract metrics from logs (example parsing - adjust to actual log format)
for log in logs/$(date +%Y%m%d)/*.log; do
    PIPELINE=$(basename "$log" .log)
    ACC=$(grep -oP "accuracy[:\s]+\K[0-9.]+" "$log" | tail -1 || echo "N/A")
    PREC=$(grep -oP "precision[:\s]+\K[0-9.]+" "$log" | tail -1 || echo "N/A")
    REC=$(grep -oP "recall[:\s]+\K[0-9.]+" "$log" | tail -1 || echo "N/A")
    F1=$(grep -oP "f1[:\s]+\K[0-9.]+" "$log" | tail -1 || echo "N/A")
    echo "$PIPELINE,$ACC,$PREC,$REC,$F1" >> results/$(date +%Y%m%d)/summary.csv
done

echo "Summary written to: results/$(date +%Y%m%d)/summary.csv"
```

**Final Slack Update:**
```
🎉 ALL 36 PIPELINES COMPLETE!

📊 FINAL SUMMARY:
- Total pipelines: 36/36 ✅
- Errors: 0
- Total duration: ~16 hours

📈 RESULTS BY CATEGORY:
[Paste summary table]

📁 Output locations:
- Results: /home/ubuntu/repos/ConnectedDrivingPipelineV4/results/YYYYMMDD/
- Logs: /home/ubuntu/repos/ConnectedDrivingPipelineV4/logs/YYYYMMDD/
- Summary: results/YYYYMMDD/summary.csv
```

---

## 🚨 CONTINGENCY PROCEDURES

### If Pipeline Fails with Error

1. **Capture the error:**
   ```bash
   grep -iE "error|exception|traceback" logs/CURRENT_LOG.log > error_report.txt
   ```

2. **Post to Slack immediately:**
   ```
   🔴 ERROR in Pipeline #{N}: {name}
   Error: {brief description}
   Investigating...
   ```

3. **Analyze and fix based on error type:**

| Error Type | Likely Cause | Fix |
|------------|--------------|-----|
| `KeyError: 'coreData_...'` | Column name mismatch | Fix in config, re-run |
| `MemoryError` | Not enough RAM | Reduce workers, retry |
| `FileNotFoundError` | Missing data/config | Verify paths |
| `ConnectionError` | Dask issue | Restart Dask, retry |
| `ValueError: n_samples=0` | Empty train/test set | Check spatial filter, date range |

4. **Re-run after fix:**
   ```bash
   # Clear cache for this specific config if needed
   rm -rf cache/{config_name}*
   
   # Re-run the pipeline
   python Run{Pipeline}.py 2>&1 | tee logs/$(date +%Y%m%d)/{N}_retry.log
   ```

### If Out of Memory (200km)

1. **Reduce Dask workers:**
   ```python
   # In the Run script, change:
   client = Client(n_workers=2, memory_limit='25GB')  # Instead of 4 workers
   ```

2. **If still OOM, enable chunking:**
   ```python
   # Process data in chunks
   chunk_size = 1000000
   ```

3. **Monitor memory:**
   ```bash
   watch -n 5 "free -h"
   ```

### If Cache Key Collision Detected

1. **Verify unique keys in logs:**
   ```bash
   grep "CACHE_KEY" logs/*.log | sort | uniq -c | sort -rn
   # Any count > 1 indicates collision
   ```

2. **Clear affected cache:**
   ```bash
   rm -rf cache/
   ```

3. **Re-run affected pipelines**

---

## ✅ SUCCESS CRITERIA

### Overall Success
| Metric | Requirement |
|--------|-------------|
| Pipelines completed | 36/36 |
| Log errors | 0 |
| Cache collisions | 0 |
| Results files generated | 36 |
| Accuracy range | 0.5 - 1.0 |

### Per-Pipeline Success
- [ ] No errors in log
- [ ] Row count > 10,000 (not artificially limited)
- [ ] Attack type applied (logged)
- [ ] Unique cache key
- [ ] Train set has samples
- [ ] Test set has samples
- [ ] Accuracy metric generated
- [ ] Duration logged (completed)

---

## 📅 SLACK UPDATE SCHEDULE

| Trigger | Message Template |
|---------|------------------|
| Pre-flight start | `🛫 Starting pre-flight verification for 36 pipeline execution` |
| Pre-flight complete | `✅ Pre-flight complete. Starting Phase 2 (2km, 12 pipelines)` |
| Every 4 pipelines | `📊 Progress: {N}/36 complete. Current: {pipeline_name}` |
| Phase complete | `📦 Phase {X} complete: {success}/{total}` |
| Error | `🔴 ERROR in {pipeline}: {brief}. Investigating.` |
| Error resolved | `🔧 Fixed: {issue}. Resuming.` |
| All complete | `🎉 ALL 36 PIPELINES COMPLETE! Summary: ...` |

---

## 📊 EXPECTED RESULTS OUTPUT

### Directory Structure
```
/home/ubuntu/repos/ConnectedDrivingPipelineV4/
├── results/
│   └── YYYYMMDD/
│       ├── summary.csv
│       ├── pipeline_01_results.csv
│       ├── pipeline_02_results.csv
│       └── ... (36 result files)
└── logs/
    └── YYYYMMDD/
        ├── 01_2km_basic_noid_const.log
        ├── 02_2km_basic_noid_rand.log
        └── ... (36 log files)
```

### Summary CSV Format
```csv
Pipeline,Radius,Features,ID,Attack,Accuracy,Precision,Recall,F1,Rows,Duration_sec
01_2km_basic_noid_const,2km,Basic,NoId,const_per_id,0.87,0.85,0.89,0.87,125000,180
02_2km_basic_noid_rand,2km,Basic,NoId,rand,0.82,0.80,0.84,0.82,125000,175
...
```

---

## 🏁 EXECUTION READY

**This plan is READY FOR EXECUTION.** All critical fixes have been applied.

**Next Steps:**
1. Worker verifies configs on Jaekel match this plan
2. Worker executes Phase 0 (pre-flight)
3. Worker executes phases 2-5 sequentially
4. Worker reports progress to Slack per schedule
5. Final summary posted when complete

**Document Location:** `scheduler/stories/jaekel-pipeline/FINAL-EXECUTION-PLAN.md`

---

*Plan created by Opus Planner | 2026-02-24 00:30 EST*
