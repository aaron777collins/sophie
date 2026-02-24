# Jaekel Pipeline - WORKER TASKS

**Generated:** 2026-02-24 00:45 EST  
**Total Tasks:** 38  
**Execution:** Sequential (one at a time)

---

## TASK JAEKEL-001: Pre-Flight Verification

**Estimated Duration:** 30 minutes  
**Model:** Haiku (command execution only)

### Commands
```bash
ssh jaekel << 'COMMANDS'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4

echo "=== TASK JAEKEL-001: PRE-FLIGHT VERIFICATION ==="
echo "Timestamp: $(date)"

# Check system resources
echo ""
echo "=== SYSTEM RESOURCES ==="
free -h
df -h /home/ubuntu
nproc

# Verify config count
echo ""
echo "=== CONFIG VERIFICATION ==="
echo "Total configs: $(ls -la production_configs_v2/*.json | wc -l)"
echo "Const configs: $(grep -l const_offset_per_id production_configs_v2/*.json | wc -l)"
echo "Rand configs: $(grep -l rand_offset production_configs_v2/*.json | wc -l)"

# Verify run scripts
echo ""
echo "=== RUN SCRIPT VERIFICATION ==="
echo "Total scripts: $(ls Run*.py | wc -l)"
echo "Const scripts: $(ls Run*Const*.py | wc -l)"
echo "Rand scripts: $(ls Run*Rand*.py | wc -l)"

# Kill orphaned processes
echo ""
echo "=== KILLING ORPHANED PROCESSES ==="
pkill -f dask || echo "No dask processes"
pkill -f "python.*Run" || echo "No Run processes"

# Create directories
echo ""
echo "=== CREATING OUTPUT DIRECTORIES ==="
mkdir -p results/$(date +%Y%m%d)
mkdir -p logs/$(date +%Y%m%d)
echo "Results: results/$(date +%Y%m%d)"
echo "Logs: logs/$(date +%Y%m%d)"

echo ""
echo "=== PRE-FLIGHT COMPLETE ==="
COMMANDS
```

### Success Criteria
- [ ] 36 configs reported
- [ ] 18 const_offset_per_id configs
- [ ] 18 rand_offset configs
- [ ] 36 run scripts
- [ ] RAM >= 50GB available
- [ ] Disk >= 100GB free
- [ ] No orphaned processes

### Report Back
```
JAEKEL-001 COMPLETE
- Configs: {count}/36
- Scripts: {count}/36
- RAM: {available}
- Disk: {free}
- Status: PASS/FAIL
```

---

## TASKS JAEKEL-002 to JAEKEL-013: 2km Pipelines

### TASK JAEKEL-002: 2km Basic NoId Const
```bash
ssh jaekel << 'COMMANDS'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
DATE=$(date +%Y%m%d)
echo "=== TASK JAEKEL-002: 2km Basic NoId Const ===" 
echo "Start: $(date)"
python Run2kmBasicNoIdConst.py 2>&1 | tee logs/${DATE}/01_2km_basic_noid_const.log
echo "End: $(date)"
echo "=== AUDIT ==="
grep -iE "error|exception|traceback" logs/${DATE}/01_2km_basic_noid_const.log | head -5 || echo "No errors"
grep -iE "accuracy|f1" logs/${DATE}/01_2km_basic_noid_const.log | tail -3
COMMANDS
```
**Success:** No errors, accuracy logged

---

### TASK JAEKEL-003: 2km Basic NoId Rand
```bash
ssh jaekel << 'COMMANDS'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
DATE=$(date +%Y%m%d)
echo "=== TASK JAEKEL-003: 2km Basic NoId Rand ==="
echo "Start: $(date)"
python Run2kmBasicNoIdRand.py 2>&1 | tee logs/${DATE}/02_2km_basic_noid_rand.log
echo "End: $(date)"
echo "=== AUDIT ==="
grep -iE "error|exception|traceback" logs/${DATE}/02_2km_basic_noid_rand.log | head -5 || echo "No errors"
grep -iE "accuracy|f1" logs/${DATE}/02_2km_basic_noid_rand.log | tail -3
COMMANDS
```

---

### TASK JAEKEL-004: 2km Basic WithId Const
```bash
ssh jaekel << 'COMMANDS'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
DATE=$(date +%Y%m%d)
echo "=== TASK JAEKEL-004: 2km Basic WithId Const ==="
python Run2kmBasicWithIdConst.py 2>&1 | tee logs/${DATE}/03_2km_basic_withid_const.log
grep -iE "error|exception|traceback" logs/${DATE}/03_2km_basic_withid_const.log | head -5 || echo "No errors"
grep -iE "accuracy|f1" logs/${DATE}/03_2km_basic_withid_const.log | tail -3
COMMANDS
```

---

### TASK JAEKEL-005: 2km Basic WithId Rand
```bash
ssh jaekel << 'COMMANDS'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
DATE=$(date +%Y%m%d)
echo "=== TASK JAEKEL-005: 2km Basic WithId Rand ==="
python Run2kmBasicWithIdRand.py 2>&1 | tee logs/${DATE}/04_2km_basic_withid_rand.log
grep -iE "error|exception|traceback" logs/${DATE}/04_2km_basic_withid_rand.log | head -5 || echo "No errors"
grep -iE "accuracy|f1" logs/${DATE}/04_2km_basic_withid_rand.log | tail -3
COMMANDS
```

---

### TASK JAEKEL-006: 2km Movement NoId Const
```bash
ssh jaekel << 'COMMANDS'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
DATE=$(date +%Y%m%d)
echo "=== TASK JAEKEL-006: 2km Movement NoId Const ==="
python Run2kmMovementNoIdConst.py 2>&1 | tee logs/${DATE}/05_2km_movement_noid_const.log
grep -iE "error|exception|traceback" logs/${DATE}/05_2km_movement_noid_const.log | head -5 || echo "No errors"
grep -iE "accuracy|f1" logs/${DATE}/05_2km_movement_noid_const.log | tail -3
COMMANDS
```

---

### TASK JAEKEL-007: 2km Movement NoId Rand
```bash
ssh jaekel << 'COMMANDS'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
DATE=$(date +%Y%m%d)
echo "=== TASK JAEKEL-007: 2km Movement NoId Rand ==="
python Run2kmMovementNoIdRand.py 2>&1 | tee logs/${DATE}/06_2km_movement_noid_rand.log
grep -iE "error|exception|traceback" logs/${DATE}/06_2km_movement_noid_rand.log | head -5 || echo "No errors"
grep -iE "accuracy|f1" logs/${DATE}/06_2km_movement_noid_rand.log | tail -3
COMMANDS
```

---

### TASK JAEKEL-008: 2km Movement WithId Const
```bash
ssh jaekel << 'COMMANDS'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
DATE=$(date +%Y%m%d)
echo "=== TASK JAEKEL-008: 2km Movement WithId Const ==="
python Run2kmMovementWithIdConst.py 2>&1 | tee logs/${DATE}/07_2km_movement_withid_const.log
grep -iE "error|exception|traceback" logs/${DATE}/07_2km_movement_withid_const.log | head -5 || echo "No errors"
grep -iE "accuracy|f1" logs/${DATE}/07_2km_movement_withid_const.log | tail -3
COMMANDS
```

---

### TASK JAEKEL-009: 2km Movement WithId Rand
```bash
ssh jaekel << 'COMMANDS'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
DATE=$(date +%Y%m%d)
echo "=== TASK JAEKEL-009: 2km Movement WithId Rand ==="
python Run2kmMovementWithIdRand.py 2>&1 | tee logs/${DATE}/08_2km_movement_withid_rand.log
grep -iE "error|exception|traceback" logs/${DATE}/08_2km_movement_withid_rand.log | head -5 || echo "No errors"
grep -iE "accuracy|f1" logs/${DATE}/08_2km_movement_withid_rand.log | tail -3
COMMANDS
```

---

### TASK JAEKEL-010: 2km Extended NoId Const
```bash
ssh jaekel << 'COMMANDS'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
DATE=$(date +%Y%m%d)
echo "=== TASK JAEKEL-010: 2km Extended NoId Const ==="
python Run2kmExtendedNoIdConst.py 2>&1 | tee logs/${DATE}/09_2km_extended_noid_const.log
grep -iE "error|exception|traceback" logs/${DATE}/09_2km_extended_noid_const.log | head -5 || echo "No errors"
grep -iE "accuracy|f1" logs/${DATE}/09_2km_extended_noid_const.log | tail -3
COMMANDS
```

---

### TASK JAEKEL-011: 2km Extended NoId Rand
```bash
ssh jaekel << 'COMMANDS'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
DATE=$(date +%Y%m%d)
echo "=== TASK JAEKEL-011: 2km Extended NoId Rand ==="
python Run2kmExtendedNoIdRand.py 2>&1 | tee logs/${DATE}/10_2km_extended_noid_rand.log
grep -iE "error|exception|traceback" logs/${DATE}/10_2km_extended_noid_rand.log | head -5 || echo "No errors"
grep -iE "accuracy|f1" logs/${DATE}/10_2km_extended_noid_rand.log | tail -3
COMMANDS
```

---

### TASK JAEKEL-012: 2km Extended WithId Const
```bash
ssh jaekel << 'COMMANDS'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
DATE=$(date +%Y%m%d)
echo "=== TASK JAEKEL-012: 2km Extended WithId Const ==="
python Run2kmExtendedWithIdConst.py 2>&1 | tee logs/${DATE}/11_2km_extended_withid_const.log
grep -iE "error|exception|traceback" logs/${DATE}/11_2km_extended_withid_const.log | head -5 || echo "No errors"
grep -iE "accuracy|f1" logs/${DATE}/11_2km_extended_withid_const.log | tail -3
COMMANDS
```

---

### TASK JAEKEL-013: 2km Extended WithId Rand
```bash
ssh jaekel << 'COMMANDS'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
DATE=$(date +%Y%m%d)
echo "=== TASK JAEKEL-013: 2km Extended WithId Rand ==="
python Run2kmExtendedWithIdRand.py 2>&1 | tee logs/${DATE}/12_2km_extended_withid_rand.log
grep -iE "error|exception|traceback" logs/${DATE}/12_2km_extended_withid_rand.log | head -5 || echo "No errors"
grep -iE "accuracy|f1" logs/${DATE}/12_2km_extended_withid_rand.log | tail -3
COMMANDS
```

---

## TASKS JAEKEL-014 to JAEKEL-025: 100km Pipelines

### TASK JAEKEL-014: 100km Basic NoId Const
```bash
ssh jaekel << 'COMMANDS'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
DATE=$(date +%Y%m%d)
echo "=== TASK JAEKEL-014: 100km Basic NoId Const ==="
python Run100kmBasicNoIdConst.py 2>&1 | tee logs/${DATE}/13_100km_basic_noid_const.log
grep -iE "error|exception|traceback" logs/${DATE}/13_100km_basic_noid_const.log | head -5 || echo "No errors"
grep -iE "accuracy|f1" logs/${DATE}/13_100km_basic_noid_const.log | tail -3
COMMANDS
```

---

### TASK JAEKEL-015: 100km Basic NoId Rand
```bash
ssh jaekel << 'COMMANDS'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
DATE=$(date +%Y%m%d)
echo "=== TASK JAEKEL-015: 100km Basic NoId Rand ==="
python Run100kmBasicNoIdRand.py 2>&1 | tee logs/${DATE}/14_100km_basic_noid_rand.log
grep -iE "error|exception|traceback" logs/${DATE}/14_100km_basic_noid_rand.log | head -5 || echo "No errors"
grep -iE "accuracy|f1" logs/${DATE}/14_100km_basic_noid_rand.log | tail -3
COMMANDS
```

---

### TASK JAEKEL-016: 100km Basic WithId Const
```bash
ssh jaekel << 'COMMANDS'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
DATE=$(date +%Y%m%d)
echo "=== TASK JAEKEL-016: 100km Basic WithId Const ==="
python Run100kmBasicWithIdConst.py 2>&1 | tee logs/${DATE}/15_100km_basic_withid_const.log
grep -iE "error|exception|traceback" logs/${DATE}/15_100km_basic_withid_const.log | head -5 || echo "No errors"
grep -iE "accuracy|f1" logs/${DATE}/15_100km_basic_withid_const.log | tail -3
COMMANDS
```

---

### TASK JAEKEL-017: 100km Basic WithId Rand
```bash
ssh jaekel << 'COMMANDS'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
DATE=$(date +%Y%m%d)
echo "=== TASK JAEKEL-017: 100km Basic WithId Rand ==="
python Run100kmBasicWithIdRand.py 2>&1 | tee logs/${DATE}/16_100km_basic_withid_rand.log
grep -iE "error|exception|traceback" logs/${DATE}/16_100km_basic_withid_rand.log | head -5 || echo "No errors"
grep -iE "accuracy|f1" logs/${DATE}/16_100km_basic_withid_rand.log | tail -3
COMMANDS
```

---

### TASK JAEKEL-018: 100km Movement NoId Const
```bash
ssh jaekel << 'COMMANDS'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
DATE=$(date +%Y%m%d)
echo "=== TASK JAEKEL-018: 100km Movement NoId Const ==="
python Run100kmMovementNoIdConst.py 2>&1 | tee logs/${DATE}/17_100km_movement_noid_const.log
grep -iE "error|exception|traceback" logs/${DATE}/17_100km_movement_noid_const.log | head -5 || echo "No errors"
grep -iE "accuracy|f1" logs/${DATE}/17_100km_movement_noid_const.log | tail -3
COMMANDS
```

---

### TASK JAEKEL-019: 100km Movement NoId Rand
```bash
ssh jaekel << 'COMMANDS'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
DATE=$(date +%Y%m%d)
echo "=== TASK JAEKEL-019: 100km Movement NoId Rand ==="
python Run100kmMovementNoIdRand.py 2>&1 | tee logs/${DATE}/18_100km_movement_noid_rand.log
grep -iE "error|exception|traceback" logs/${DATE}/18_100km_movement_noid_rand.log | head -5 || echo "No errors"
grep -iE "accuracy|f1" logs/${DATE}/18_100km_movement_noid_rand.log | tail -3
COMMANDS
```

---

### TASK JAEKEL-020: 100km Movement WithId Const
```bash
ssh jaekel << 'COMMANDS'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
DATE=$(date +%Y%m%d)
echo "=== TASK JAEKEL-020: 100km Movement WithId Const ==="
python Run100kmMovementWithIdConst.py 2>&1 | tee logs/${DATE}/19_100km_movement_withid_const.log
grep -iE "error|exception|traceback" logs/${DATE}/19_100km_movement_withid_const.log | head -5 || echo "No errors"
grep -iE "accuracy|f1" logs/${DATE}/19_100km_movement_withid_const.log | tail -3
COMMANDS
```

---

### TASK JAEKEL-021: 100km Movement WithId Rand
```bash
ssh jaekel << 'COMMANDS'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
DATE=$(date +%Y%m%d)
echo "=== TASK JAEKEL-021: 100km Movement WithId Rand ==="
python Run100kmMovementWithIdRand.py 2>&1 | tee logs/${DATE}/20_100km_movement_withid_rand.log
grep -iE "error|exception|traceback" logs/${DATE}/20_100km_movement_withid_rand.log | head -5 || echo "No errors"
grep -iE "accuracy|f1" logs/${DATE}/20_100km_movement_withid_rand.log | tail -3
COMMANDS
```

---

### TASK JAEKEL-022: 100km Extended NoId Const
```bash
ssh jaekel << 'COMMANDS'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
DATE=$(date +%Y%m%d)
echo "=== TASK JAEKEL-022: 100km Extended NoId Const ==="
python Run100kmExtendedNoIdConst.py 2>&1 | tee logs/${DATE}/21_100km_extended_noid_const.log
grep -iE "error|exception|traceback" logs/${DATE}/21_100km_extended_noid_const.log | head -5 || echo "No errors"
grep -iE "accuracy|f1" logs/${DATE}/21_100km_extended_noid_const.log | tail -3
COMMANDS
```

---

### TASK JAEKEL-023: 100km Extended NoId Rand
```bash
ssh jaekel << 'COMMANDS'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
DATE=$(date +%Y%m%d)
echo "=== TASK JAEKEL-023: 100km Extended NoId Rand ==="
python Run100kmExtendedNoIdRand.py 2>&1 | tee logs/${DATE}/22_100km_extended_noid_rand.log
grep -iE "error|exception|traceback" logs/${DATE}/22_100km_extended_noid_rand.log | head -5 || echo "No errors"
grep -iE "accuracy|f1" logs/${DATE}/22_100km_extended_noid_rand.log | tail -3
COMMANDS
```

---

### TASK JAEKEL-024: 100km Extended WithId Const
```bash
ssh jaekel << 'COMMANDS'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
DATE=$(date +%Y%m%d)
echo "=== TASK JAEKEL-024: 100km Extended WithId Const ==="
python Run100kmExtendedWithIdConst.py 2>&1 | tee logs/${DATE}/23_100km_extended_withid_const.log
grep -iE "error|exception|traceback" logs/${DATE}/23_100km_extended_withid_const.log | head -5 || echo "No errors"
grep -iE "accuracy|f1" logs/${DATE}/23_100km_extended_withid_const.log | tail -3
COMMANDS
```

---

### TASK JAEKEL-025: 100km Extended WithId Rand
```bash
ssh jaekel << 'COMMANDS'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
DATE=$(date +%Y%m%d)
echo "=== TASK JAEKEL-025: 100km Extended WithId Rand ==="
python Run100kmExtendedWithIdRand.py 2>&1 | tee logs/${DATE}/24_100km_extended_withid_rand.log
grep -iE "error|exception|traceback" logs/${DATE}/24_100km_extended_withid_rand.log | head -5 || echo "No errors"
grep -iE "accuracy|f1" logs/${DATE}/24_100km_extended_withid_rand.log | tail -3
COMMANDS
```

---

## TASKS JAEKEL-026 to JAEKEL-037: 200km Pipelines

⚠️ **IMPORTANT:** These are large datasets. Monitor memory with `htop`.

### TASK JAEKEL-026: 200km Basic NoId Const
```bash
ssh jaekel << 'COMMANDS'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
DATE=$(date +%Y%m%d)
echo "=== TASK JAEKEL-026: 200km Basic NoId Const ==="
python Run200kmBasicNoIdConst.py 2>&1 | tee logs/${DATE}/25_200km_basic_noid_const.log
grep -iE "error|exception|traceback" logs/${DATE}/25_200km_basic_noid_const.log | head -5 || echo "No errors"
grep -iE "accuracy|f1" logs/${DATE}/25_200km_basic_noid_const.log | tail -3
COMMANDS
```

---

### TASK JAEKEL-027: 200km Basic NoId Rand
```bash
ssh jaekel << 'COMMANDS'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
DATE=$(date +%Y%m%d)
echo "=== TASK JAEKEL-027: 200km Basic NoId Rand ==="
python Run200kmBasicNoIdRand.py 2>&1 | tee logs/${DATE}/26_200km_basic_noid_rand.log
grep -iE "error|exception|traceback" logs/${DATE}/26_200km_basic_noid_rand.log | head -5 || echo "No errors"
grep -iE "accuracy|f1" logs/${DATE}/26_200km_basic_noid_rand.log | tail -3
COMMANDS
```

---

### TASK JAEKEL-028: 200km Basic WithId Const
```bash
ssh jaekel << 'COMMANDS'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
DATE=$(date +%Y%m%d)
echo "=== TASK JAEKEL-028: 200km Basic WithId Const ==="
python Run200kmBasicWithIdConst.py 2>&1 | tee logs/${DATE}/27_200km_basic_withid_const.log
grep -iE "error|exception|traceback" logs/${DATE}/27_200km_basic_withid_const.log | head -5 || echo "No errors"
grep -iE "accuracy|f1" logs/${DATE}/27_200km_basic_withid_const.log | tail -3
COMMANDS
```

---

### TASK JAEKEL-029: 200km Basic WithId Rand
```bash
ssh jaekel << 'COMMANDS'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
DATE=$(date +%Y%m%d)
echo "=== TASK JAEKEL-029: 200km Basic WithId Rand ==="
python Run200kmBasicWithIdRand.py 2>&1 | tee logs/${DATE}/28_200km_basic_withid_rand.log
grep -iE "error|exception|traceback" logs/${DATE}/28_200km_basic_withid_rand.log | head -5 || echo "No errors"
grep -iE "accuracy|f1" logs/${DATE}/28_200km_basic_withid_rand.log | tail -3
COMMANDS
```

---

### TASK JAEKEL-030: 200km Movement NoId Const
```bash
ssh jaekel << 'COMMANDS'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
DATE=$(date +%Y%m%d)
echo "=== TASK JAEKEL-030: 200km Movement NoId Const ==="
python Run200kmMovementNoIdConst.py 2>&1 | tee logs/${DATE}/29_200km_movement_noid_const.log
grep -iE "error|exception|traceback" logs/${DATE}/29_200km_movement_noid_const.log | head -5 || echo "No errors"
grep -iE "accuracy|f1" logs/${DATE}/29_200km_movement_noid_const.log | tail -3
COMMANDS
```

---

### TASK JAEKEL-031: 200km Movement NoId Rand
```bash
ssh jaekel << 'COMMANDS'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
DATE=$(date +%Y%m%d)
echo "=== TASK JAEKEL-031: 200km Movement NoId Rand ==="
python Run200kmMovementNoIdRand.py 2>&1 | tee logs/${DATE}/30_200km_movement_noid_rand.log
grep -iE "error|exception|traceback" logs/${DATE}/30_200km_movement_noid_rand.log | head -5 || echo "No errors"
grep -iE "accuracy|f1" logs/${DATE}/30_200km_movement_noid_rand.log | tail -3
COMMANDS
```

---

### TASK JAEKEL-032: 200km Movement WithId Const
```bash
ssh jaekel << 'COMMANDS'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
DATE=$(date +%Y%m%d)
echo "=== TASK JAEKEL-032: 200km Movement WithId Const ==="
python Run200kmMovementWithIdConst.py 2>&1 | tee logs/${DATE}/31_200km_movement_withid_const.log
grep -iE "error|exception|traceback" logs/${DATE}/31_200km_movement_withid_const.log | head -5 || echo "No errors"
grep -iE "accuracy|f1" logs/${DATE}/31_200km_movement_withid_const.log | tail -3
COMMANDS
```

---

### TASK JAEKEL-033: 200km Movement WithId Rand
```bash
ssh jaekel << 'COMMANDS'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
DATE=$(date +%Y%m%d)
echo "=== TASK JAEKEL-033: 200km Movement WithId Rand ==="
python Run200kmMovementWithIdRand.py 2>&1 | tee logs/${DATE}/32_200km_movement_withid_rand.log
grep -iE "error|exception|traceback" logs/${DATE}/32_200km_movement_withid_rand.log | head -5 || echo "No errors"
grep -iE "accuracy|f1" logs/${DATE}/32_200km_movement_withid_rand.log | tail -3
COMMANDS
```

---

### TASK JAEKEL-034: 200km Extended NoId Const
```bash
ssh jaekel << 'COMMANDS'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
DATE=$(date +%Y%m%d)
echo "=== TASK JAEKEL-034: 200km Extended NoId Const ==="
python Run200kmExtendedNoIdConst.py 2>&1 | tee logs/${DATE}/33_200km_extended_noid_const.log
grep -iE "error|exception|traceback" logs/${DATE}/33_200km_extended_noid_const.log | head -5 || echo "No errors"
grep -iE "accuracy|f1" logs/${DATE}/33_200km_extended_noid_const.log | tail -3
COMMANDS
```

---

### TASK JAEKEL-035: 200km Extended NoId Rand
```bash
ssh jaekel << 'COMMANDS'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
DATE=$(date +%Y%m%d)
echo "=== TASK JAEKEL-035: 200km Extended NoId Rand ==="
python Run200kmExtendedNoIdRand.py 2>&1 | tee logs/${DATE}/34_200km_extended_noid_rand.log
grep -iE "error|exception|traceback" logs/${DATE}/34_200km_extended_noid_rand.log | head -5 || echo "No errors"
grep -iE "accuracy|f1" logs/${DATE}/34_200km_extended_noid_rand.log | tail -3
COMMANDS
```

---

### TASK JAEKEL-036: 200km Extended WithId Const
```bash
ssh jaekel << 'COMMANDS'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
DATE=$(date +%Y%m%d)
echo "=== TASK JAEKEL-036: 200km Extended WithId Const ==="
python Run200kmExtendedWithIdConst.py 2>&1 | tee logs/${DATE}/35_200km_extended_withid_const.log
grep -iE "error|exception|traceback" logs/${DATE}/35_200km_extended_withid_const.log | head -5 || echo "No errors"
grep -iE "accuracy|f1" logs/${DATE}/35_200km_extended_withid_const.log | tail -3
COMMANDS
```

---

### TASK JAEKEL-037: 200km Extended WithId Rand
```bash
ssh jaekel << 'COMMANDS'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
DATE=$(date +%Y%m%d)
echo "=== TASK JAEKEL-037: 200km Extended WithId Rand ==="
python Run200kmExtendedWithIdRand.py 2>&1 | tee logs/${DATE}/36_200km_extended_withid_rand.log
grep -iE "error|exception|traceback" logs/${DATE}/36_200km_extended_withid_rand.log | head -5 || echo "No errors"
grep -iE "accuracy|f1" logs/${DATE}/36_200km_extended_withid_rand.log | tail -3
COMMANDS
```

---

## TASK JAEKEL-038: Results Compilation

**Estimated Duration:** 30 minutes

### Commands
```bash
ssh jaekel << 'COMMANDS'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
DATE=$(date +%Y%m%d)

echo "=== TASK JAEKEL-038: RESULTS COMPILATION ==="

# Create summary header
echo "Pipeline,Status,Accuracy,Errors" > results/${DATE}/summary.csv

# Process all logs
for i in $(seq -w 01 36); do
    LOG=$(ls logs/${DATE}/${i}_*.log 2>/dev/null | head -1)
    if [ -f "$LOG" ]; then
        NAME=$(basename "$LOG" .log)
        ERRORS=$(grep -ciE "error|exception|traceback" "$LOG" 2>/dev/null || echo 0)
        ACC=$(grep -oP "accuracy[:\s]+\K[0-9.]+" "$LOG" 2>/dev/null | tail -1 || echo "N/A")
        if [ "$ERRORS" -eq 0 ]; then
            STATUS="PASS"
        else
            STATUS="FAIL"
        fi
        echo "$NAME,$STATUS,$ACC,$ERRORS" >> results/${DATE}/summary.csv
    fi
done

echo ""
echo "=== SUMMARY ==="
cat results/${DATE}/summary.csv

echo ""
echo "=== STATISTICS ==="
TOTAL=$(wc -l < results/${DATE}/summary.csv)
PASS=$(grep -c "PASS" results/${DATE}/summary.csv || echo 0)
FAIL=$(grep -c "FAIL" results/${DATE}/summary.csv || echo 0)
echo "Total: $((TOTAL-1))"
echo "Passed: $PASS"
echo "Failed: $FAIL"

echo ""
echo "Results saved to: results/${DATE}/summary.csv"
COMMANDS
```

### Success Criteria
- [ ] 36 pipelines in summary
- [ ] All PASS status
- [ ] Accuracy values for all
- [ ] Summary CSV created

---

## 📊 PROGRESS TRACKING

| Task | Pipeline | Status | Accuracy | Notes |
|------|----------|--------|----------|-------|
| JAEKEL-001 | Pre-flight | ⬜ | - | |
| JAEKEL-002 | 2km Basic NoId Const | ⬜ | | |
| JAEKEL-003 | 2km Basic NoId Rand | ⬜ | | |
| JAEKEL-004 | 2km Basic WithId Const | ⬜ | | |
| JAEKEL-005 | 2km Basic WithId Rand | ⬜ | | |
| JAEKEL-006 | 2km Movement NoId Const | ⬜ | | |
| JAEKEL-007 | 2km Movement NoId Rand | ⬜ | | |
| JAEKEL-008 | 2km Movement WithId Const | ⬜ | | |
| JAEKEL-009 | 2km Movement WithId Rand | ⬜ | | |
| JAEKEL-010 | 2km Extended NoId Const | ⬜ | | |
| JAEKEL-011 | 2km Extended NoId Rand | ⬜ | | |
| JAEKEL-012 | 2km Extended WithId Const | ⬜ | | |
| JAEKEL-013 | 2km Extended WithId Rand | ⬜ | | |
| JAEKEL-014 | 100km Basic NoId Const | ⬜ | | |
| JAEKEL-015 | 100km Basic NoId Rand | ⬜ | | |
| JAEKEL-016 | 100km Basic WithId Const | ⬜ | | |
| JAEKEL-017 | 100km Basic WithId Rand | ⬜ | | |
| JAEKEL-018 | 100km Movement NoId Const | ⬜ | | |
| JAEKEL-019 | 100km Movement NoId Rand | ⬜ | | |
| JAEKEL-020 | 100km Movement WithId Const | ⬜ | | |
| JAEKEL-021 | 100km Movement WithId Rand | ⬜ | | |
| JAEKEL-022 | 100km Extended NoId Const | ⬜ | | |
| JAEKEL-023 | 100km Extended NoId Rand | ⬜ | | |
| JAEKEL-024 | 100km Extended WithId Const | ⬜ | | |
| JAEKEL-025 | 100km Extended WithId Rand | ⬜ | | |
| JAEKEL-026 | 200km Basic NoId Const | ⬜ | | |
| JAEKEL-027 | 200km Basic NoId Rand | ⬜ | | |
| JAEKEL-028 | 200km Basic WithId Const | ⬜ | | |
| JAEKEL-029 | 200km Basic WithId Rand | ⬜ | | |
| JAEKEL-030 | 200km Movement NoId Const | ⬜ | | |
| JAEKEL-031 | 200km Movement NoId Rand | ⬜ | | |
| JAEKEL-032 | 200km Movement WithId Const | ⬜ | | |
| JAEKEL-033 | 200km Movement WithId Rand | ⬜ | | |
| JAEKEL-034 | 200km Extended NoId Const | ⬜ | | |
| JAEKEL-035 | 200km Extended NoId Rand | ⬜ | | |
| JAEKEL-036 | 200km Extended WithId Const | ⬜ | | |
| JAEKEL-037 | 200km Extended WithId Rand | ⬜ | | |
| JAEKEL-038 | Results Compilation | ⬜ | - | |

---

## 🔄 SLACK UPDATES

Post to `#aibot-chat` thread after:
- Pre-flight complete (JAEKEL-001)
- Every 4 pipelines (JAEKEL-005, 009, 013, etc.)
- Phase transitions (after 013, 025, 037)
- All complete (after JAEKEL-038)

---

*Tasks generated by Opus Planner | 2026-02-24 00:45 EST*
