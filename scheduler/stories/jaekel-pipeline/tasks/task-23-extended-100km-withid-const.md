# Task 23: extended_100km_withid_const

**Status:** 🟡 PENDING  
**Dependencies:** Task 22  
**Estimated Time:** 10 min  
**Phase:** 2 (100km pipelines)

---

## Pipeline Details

| Property | Value |
|----------|-------|
| **Pipeline Name** | extended_100km_withid_const |
| **Config File** | `production_configs_v2/extended_100km_withid_const_pipeline_config.json` |
| **Run Script** | `production_configs_v2/Run100kmExtendedWithIdConst.py` |
| **Radius** | 100km |
| **Feature Set** | Extended (7 features) |
| **Vehicle ID** | Yes |
| **Attack Type** | const_offset_per_id |
| **Expected Rows** | 500,000-2,000,000 |

---

## Execution Commands

### Step 1: Run Pipeline

```bash
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
source .venv/bin/activate

# Execute pipeline
python production_configs_v2/Run100kmExtendedWithIdConst.py 2>&1 | tee logs/extended_100km_withid_const_$(date +%Y%m%d_%H%M%S).log
```

### Step 2: Log Audit

```bash
LOG=$(ls -t logs/extended_100km_withid_const_*.log | head -1)

echo "=========================================="
echo "LOG AUDIT: extended_100km_withid_const"
echo "Log file: $LOG"
echo "=========================================="

# 1. Check for errors
echo "=== ERRORS ==="
grep -iE "error|exception|failed|traceback" $LOG | head -5
# EXPECTED: No critical errors

# 2. Check row counts
echo "=== ROW COUNTS ==="
grep -iE "rows|records|loaded|filtered" $LOG
# EXPECTED: 500,000-2,000,000 rows

# 3. Check attack application
echo "=== ATTACK VERIFICATION ==="
grep -iE "attacker|malicious|isAttacker|attack.*applied|const_offset_per_id" $LOG
# EXPECTED: 30% attackers applied with const_offset_per_id

# 4. Check ML results
echo "=== ML RESULTS ==="
grep -iE "accuracy|precision|recall|f1|score" $LOG
# EXPECTED: Accuracy > 65%

# 5. Check completion
echo "=== COMPLETION ==="
grep -iE "complete|finished|done|success" $LOG | tail -3
# EXPECTED: Pipeline complete message
```

### Step 3: Verify Results

```bash
# Check results directory
ls -la results/matrix/extended_100km_withid_const/
# EXPECTED: CSV files with ML results

# Check cache created
ls -la cache/matrix/extended_100km_withid_const/
# EXPECTED: clean.parquet and attack.parquet
```

---

## Success Criteria

- [ ] Pipeline executed without errors
- [ ] Log audit shows no critical errors
- [ ] Row counts within expected range (500,000-2,000,000)
- [ ] Attack verification shows const_offset_per_id applied
- [ ] ML accuracy > 65%
- [ ] Results files created in results/matrix/extended_100km_withid_const/
- [ ] Cache files created

---

## If Failed

1. Check log for specific error
2. If OOM: Reduce workers in config, retry
3. If data error: Check column names in config
4. Document failure and notify Slack
5. DO NOT proceed to next task until resolved

---

## Completion

When successful:
1. Update status to ✅ COMPLETE in this file
2. Update TASK-INDEX.md
3. Proceed to Task 24 (unless this is Task 36)
