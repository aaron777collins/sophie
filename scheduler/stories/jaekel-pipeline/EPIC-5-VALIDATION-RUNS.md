# EPIC-5: Pipeline Validation Runs

**Priority:** 🔴 CRITICAL - Final Validation
**Estimated Complexity:** HIGH
**Status:** Blocked by EPIC-1, EPIC-2, EPIC-3, EPIC-4

---

## Executive Summary

This epic covers the **systematic validation of all 18 pipeline configurations** after fixes from EPICs 1-4 are complete. Each pipeline must be run, logs fully analyzed, and results verified before proceeding to the next.

**Key Principle:** One pipeline at a time. Fix any errors before continuing.

---

## Pipeline Matrix

### 18 Pipeline Variants

| Radius | Feature Set | With ID | Pipeline Name |
|--------|------------|---------|---------------|
| 2km | BASIC | No | `Run2kmBasic` |
| 2km | BASIC | Yes | `Run2kmBasicWithId` |
| 2km | MOVEMENT | No | `Run2kmMovement` |
| 2km | MOVEMENT | Yes | `Run2kmMovementWithId` |
| 2km | EXTENDED | No | `Run2kmExtended` |
| 2km | EXTENDED | Yes | `Run2kmExtendedWithId` |
| 100km | BASIC | No | `Run100kmBasic` |
| 100km | BASIC | Yes | `Run100kmBasicWithId` |
| 100km | MOVEMENT | No | `Run100kmMovement` |
| 100km | MOVEMENT | Yes | `Run100kmMovementWithId` |
| 100km | EXTENDED | No | `Run100kmExtended` |
| 100km | EXTENDED | Yes | `Run100kmExtendedWithId` |
| 200km | BASIC | No | `Run200kmBasic` |
| 200km | BASIC | Yes | `Run200kmBasicWithId` |
| 200km | MOVEMENT | No | `Run200kmMovement` |
| 200km | MOVEMENT | Yes | `Run200kmMovementWithId` |
| 200km | EXTENDED | No | `Run200kmExtended` |
| 200km | EXTENDED | Yes | `Run200kmExtendedWithId` |

### Recommended Run Order

1. **2km pipelines first** (fastest, ~5 minutes each)
   - Run2kmBasic ← Start here
   - Run2kmMovement
   - Run2kmExtended
   - Run2kmBasicWithId
   - Run2kmMovementWithId
   - Run2kmExtendedWithId

2. **100km pipelines** (medium, ~30 minutes each)
   - Run100kmBasic
   - ... (same order as 2km)

3. **200km pipelines** (longest, ~1-2 hours each)
   - Run200kmBasic
   - ... (same order)

---

## User Stories

### Story 5.1: Pre-Validation System Check

**As a** pipeline operator  
**I want** to verify the system is ready for validation runs  
**So that** runs don't fail due to environmental issues

#### Acceptance Criteria

##### AC-5.1.1: Cache is Cleared
**Given** Validation runs about to start  
**When** Pre-check runs  
**Then** Confirms cache directories are empty:
- `cache/` - empty or backed up
- `data/classifierdata/splitfiles/cleaned/` - empty
- `data/classifierdata/splitfiles/combinedcleaned/` - empty
**Test Method:** `find cache -type f | wc -l` = 0
**Evidence Required:** Command output showing 0 files

##### AC-5.1.2: No Orphan Processes
**Given** System ready for validation  
**When** Process check runs  
**Then** No pipeline-related processes running:
```bash
ps aux | grep -E "Run.*Pipeline|DaskPipelineRunner|dask-worker" | wc -l
# Expected: 0 (or just grep itself)
```
**Test Method:** ps output
**Evidence Required:** ps output showing clean system

##### AC-5.1.3: Disk Space Sufficient
**Given** Multiple pipeline runs planned  
**When** Disk check runs  
**Then** At least 100GB free on data partition
**Test Method:** `df -h /home/ubuntu`
**Evidence Required:** df output showing sufficient space

##### AC-5.1.4: Config Files Validated
**Given** All 18 configs exist  
**When** Validation script runs  
**Then** All pass schema validation:
- Correct column names (EPIC-2)
- Percentage-based splits (EPIC-3)
**Test Method:** `python scripts/validate_configs.py`
**Evidence Required:** "18/18 configs valid"

##### AC-5.1.5: Pre-Check Report Generated
**Given** All checks complete  
**When** Report saved  
**Then** `validation/pre-check-report.json` contains:
```json
{
  "timestamp": "2026-02-24 10:00:00",
  "cache_cleared": true,
  "orphan_processes": 0,
  "disk_free_gb": 150,
  "configs_valid": 18,
  "ready_for_validation": true
}
```
**Test Method:** File exists with valid content
**Evidence Required:** Report file screenshot

---

### Story 5.2: Single Pipeline Validation Protocol

**As a** pipeline validator  
**I want** a strict protocol for validating each pipeline  
**So that** no errors are missed and results are trustworthy

#### Acceptance Criteria

##### AC-5.2.1: Full Log Analysis Required
**Given** Pipeline run completes  
**When** Validation occurs  
**Then** ENTIRE log file is analyzed, not just tail:
- Check for ANY "ERROR" (case insensitive)
- Check for ANY "Traceback"
- Check for ANY "Exception"
- Check for ANY "KeyError"
- Check for ANY "ValueError"
- Check for ANY "n_samples=0"
- Check for ANY "Port already in use"
**Test Method:** 
```bash
grep -iE "ERROR|Traceback|Exception|KeyError|ValueError|n_samples=0|Port.*in use" $LOG_FILE
```
**Evidence Required:** grep output (should be empty for passing run)

##### AC-5.2.2: Results Files Verified
**Given** Pipeline "Run2kmBasic" completes  
**When** Results checked  
**Then** These files exist and are valid:
- `results/basic-2km-randomoffset.csv` - has 3 rows (RF, DT, KNN)
- `logs/basic-2km-randomoffset/pipeline.log` - no errors
- Confusion matrix images generated
**Test Method:** File existence and content check
**Evidence Required:** ls -la output of results directory

##### AC-5.2.3: Metrics in Valid Range
**Given** Results CSV exists  
**When** Metrics extracted  
**Then** All metrics in valid range:
- Accuracy: 0.50 - 1.00 (random chance minimum)
- Precision: 0.00 - 1.00
- Recall: 0.00 - 1.00
- F1: 0.00 - 1.00
- Train/Test sizes > 0
**Test Method:** Parse CSV, check ranges
**Evidence Required:** Metrics summary

##### AC-5.2.4: Confusion Matrix Non-Zero
**Given** Classifier trained  
**When** Confusion matrix checked  
**Then** Not all zeros (actual predictions made):
- True Positives > 0 OR False Negatives > 0 (attackers exist)
- True Negatives > 0 OR False Positives > 0 (benign exist)
**Test Method:** Parse confusion matrix from log
**Evidence Required:** Confusion matrix screenshot

##### AC-5.2.5: STOP on Error Protocol
**Given** Any error found in validation  
**When** Error detected  
**Then** STOP validation process:
1. Document error in `validation/errors/{pipeline_name}.md`
2. Create fix ticket
3. Do NOT proceed to next pipeline
4. After fix, re-run SAME pipeline
5. Only proceed when clean
**Test Method:** Manual verification of protocol
**Evidence Required:** Error documentation

---

### Story 5.3: Run 2km Pipeline Variants

**As a** researcher needing quick validation  
**I want** all 2km pipelines to pass validation  
**So that** the fastest tests confirm core functionality works

#### Acceptance Criteria

##### AC-5.3.1: Run2kmBasic Passes
**Given** Pre-checks pass  
**When** `python Runners/Run2kmBasic.py` executed  
**Then:**
- Exit code = 0
- Log has zero errors
- Results CSV has 3 rows
- Accuracy > 0.80 for all classifiers
- Confusion matrix shows real predictions
**Test Method:** Full validation protocol (AC-5.2.*)
**Evidence Required:** Validation report

##### AC-5.3.2: Run2kmMovement Passes
**Given** Run2kmBasic validated  
**When** Run2kmMovement executed  
**Then:** Same validation criteria as AC-5.3.1
**Test Method:** Full validation protocol
**Evidence Required:** Validation report

##### AC-5.3.3: Run2kmExtended Passes
**Given** Run2kmMovement validated  
**When** Run2kmExtended executed  
**Then:** Same validation criteria
**Test Method:** Full validation protocol
**Evidence Required:** Validation report

##### AC-5.3.4: WithId Variants Pass
**Given** Base variants validated  
**When** WithId variants executed  
**Then:** All 3 WithId variants pass validation
**Test Method:** Full validation protocol
**Evidence Required:** Validation reports for all 3

##### AC-5.3.5: 2km Summary Report
**Given** All 6 pipelines validated  
**When** Summary generated  
**Then:** `validation/2km-summary.md` contains:
```markdown
# 2km Pipeline Validation Summary

| Pipeline | Status | Train | Test | RF Acc | DT Acc | KNN Acc |
|----------|--------|-------|------|--------|--------|---------|
| Basic | ✅ PASS | 3688 | 922 | 0.998 | 0.999 | 0.998 |
| Movement | ✅ PASS | 3688 | 922 | 0.995 | 0.996 | 0.994 |
| Extended | ✅ PASS | 3688 | 922 | 0.997 | 0.998 | 0.996 |
| BasicWithId | ✅ PASS | 3688 | 922 | 0.998 | 0.999 | 0.998 |
| MovementWithId | ✅ PASS | 3688 | 922 | 0.995 | 0.996 | 0.994 |
| ExtendedWithId | ✅ PASS | 3688 | 922 | 0.997 | 0.998 | 0.996 |

All 2km pipelines validated successfully.
```
**Test Method:** Summary file exists and accurate
**Evidence Required:** Summary file screenshot

---

### Story 5.4: Run 100km Pipeline Variants

**As a** researcher needing medium-scale validation  
**I want** all 100km pipelines to pass  
**So that** larger dataset processing is confirmed working

#### Acceptance Criteria

##### AC-5.4.1: All 6 Pipelines Pass
**Given** 2km validation complete  
**When** 100km pipelines run sequentially  
**Then:** All pass full validation protocol
**Test Method:** Same as 2km
**Evidence Required:** 6 validation reports

##### AC-5.4.2: Expected Data Sizes
**Given** 100km radius  
**When** Data gathered  
**Then:** ~500,000 rows (±20%)
- Train: ~400,000
- Test: ~100,000
**Test Method:** Check log for row counts
**Evidence Required:** Log showing counts

##### AC-5.4.3: Processing Time Reasonable
**Given** 100km pipeline runs  
**When** Completed  
**Then:** Total time < 60 minutes
**Test Method:** Check timestamps in log
**Evidence Required:** Duration from log

##### AC-5.4.4: 100km Summary Report
**Given** All 6 pass  
**When** Summary generated  
**Then:** `validation/100km-summary.md` similar to 2km
**Evidence Required:** Summary file

---

### Story 5.5: Run 200km Pipeline Variants

**As a** researcher needing full-scale validation  
**I want** all 200km pipelines to pass  
**So that** the complete system is validated

#### Acceptance Criteria

##### AC-5.5.1: All 6 Pipelines Pass
**Given** 100km validation complete  
**When** 200km pipelines run  
**Then:** All pass full validation
**Test Method:** Same protocol
**Evidence Required:** 6 validation reports

##### AC-5.5.2: Expected Data Sizes
**Given** 200km radius  
**When** Data gathered  
**Then:** ~1,000,000 rows (±20%)
**Test Method:** Check log
**Evidence Required:** Log row counts

##### AC-5.5.3: Processing Time Reasonable
**Given** 200km pipeline runs  
**When** Completed  
**Then:** Total time < 2 hours
**Test Method:** Check timestamps
**Evidence Required:** Duration

##### AC-5.5.4: 200km Summary Report
**Given** All 6 pass  
**When** Summary generated  
**Then:** `validation/200km-summary.md`
**Evidence Required:** Summary file

---

### Story 5.6: Generate Final Validation Report

**As a** researcher presenting results  
**I want** a comprehensive final report  
**So that** all validation work is documented

#### Acceptance Criteria

##### AC-5.6.1: Complete Results Table
**Given** All 18 pipelines validated  
**When** Final report generated  
**Then:** `validation/FINAL-VALIDATION-REPORT.md` includes:
```markdown
# ConnectedDrivingPipelineV4 Validation Report

**Date:** 2026-02-XX
**Validator:** Sophie (Opus Agent)
**Total Pipelines:** 18
**Passed:** 18
**Failed:** 0

## Summary Table

| Pipeline | Radius | Features | WithId | Train | Test | RF Acc | DT Acc | KNN Acc | Status |
|----------|--------|----------|--------|-------|------|--------|--------|---------|--------|
| ... complete table ...

## Methodology

All pipelines were validated using the following protocol:
1. Pre-checks (cache cleared, no orphans, disk space)
2. Sequential execution (one at a time)
3. Full log analysis (entire file, not just tail)
4. Results file verification
5. Metrics range validation
6. Confusion matrix verification

Any error found → STOP → Fix → Re-run same pipeline → Only proceed when clean.

## Key Findings

1. Cache key uniqueness confirmed (EPIC-1)
2. Column names corrected (EPIC-2)
3. Train/test splits working for all sizes (EPIC-3)
4. Infrastructure stable (EPIC-4)

## Recommendations

[Any observations or suggestions]
```
**Test Method:** File exists and complete
**Evidence Required:** Full report file

##### AC-5.6.2: All Confusion Matrices Included
**Given** Report complete  
**When** Appendix checked  
**Then:** All 54 confusion matrices included (18 pipelines × 3 classifiers)
**Test Method:** Count confusion matrix entries
**Evidence Required:** Report appendix

##### AC-5.6.3: Log Archive Created
**Given** Validation complete  
**When** Archive created  
**Then:** `validation/logs-archive-YYYYMMDD.tar.gz` contains all logs
**Test Method:** Archive exists
**Evidence Required:** Archive file

##### AC-5.6.4: Results Backed Up
**Given** Validation complete  
**When** Backup made  
**Then:** `validation/results-backup-YYYYMMDD/` contains all CSVs
**Test Method:** Backup directory exists
**Evidence Required:** Directory listing

---

## Testing Requirements

### Validation Framework
- **Shell scripts** for log analysis
- **Python scripts** for results parsing
- **Manual review** for edge cases

### Required Evidence Per Pipeline

For each of the 18 pipelines, the validation record MUST include:

1. **Log file path and size**
2. **grep output for error patterns** (should be empty)
3. **Results CSV content** (3 rows)
4. **Metrics summary** (accuracy, precision, recall)
5. **Confusion matrices** (from log or images)
6. **Train/test sizes**
7. **Duration**
8. **Pass/Fail determination**

### Validation Checklist Template

```markdown
## Pipeline: Run2kmBasic

### Execution
- [ ] Pre-checks passed
- [ ] Command: `python Runners/Run2kmBasic.py`
- [ ] Started: 2026-02-XX HH:MM
- [ ] Completed: 2026-02-XX HH:MM
- [ ] Duration: XX minutes
- [ ] Exit code: 0

### Log Analysis
- [ ] Log file: `logs/basic-2km-randomoffset/pipeline.log`
- [ ] Log size: XXX KB
- [ ] ERROR count: 0
- [ ] Traceback count: 0
- [ ] Exception count: 0
- [ ] KeyError count: 0
- [ ] ValueError count: 0

### Results Verification
- [ ] CSV exists: `results/basic-2km-randomoffset.csv`
- [ ] Row count: 3 (RF, DT, KNN)
- [ ] RandomForest accuracy: 0.XXX
- [ ] DecisionTree accuracy: 0.XXX
- [ ] KNeighbors accuracy: 0.XXX

### Data Sizes
- [ ] Total rows: XXXX
- [ ] Train rows: XXXX
- [ ] Test rows: XXXX

### Confusion Matrices
- [ ] RF: TP=XXX, FP=XX, TN=XXX, FN=XX
- [ ] DT: TP=XXX, FP=XX, TN=XXX, FN=XX
- [ ] KNN: TP=XXX, FP=XX, TN=XXX, FN=XX

### Validation Status
- [ ] **PASS** - All checks passed
- [ ] FAIL - Errors found (document below)

### Notes
[Any observations or issues]
```

---

## Contingency Plans

### What Could Go Wrong

| Issue | Response | Fallback |
|-------|----------|----------|
| Pipeline crashes | Document error, create fix in prior EPIC | Block until fixed |
| Accuracy too low | Investigate data, check attack ratio | May need to tune parameters |
| Results don't match expected | Check cache key uniqueness | Clear cache, re-run |
| Disk fills up | Clear intermediate files | Expand storage |
| Dask cluster issues | Restart, use cleanup script | Run without Dask |

### If a Pipeline Fails

1. **STOP** - Do not proceed to next pipeline
2. **Document** the failure in `validation/errors/{pipeline}.md`:
   - Error message
   - Log excerpt
   - Probable cause
3. **Trace** the error to the appropriate EPIC (1-4)
4. **Fix** the underlying issue
5. **Re-run** the same pipeline
6. **Repeat** until clean

### If Multiple Pipelines Fail Similarly

1. Likely a systemic issue
2. Go back to appropriate EPIC
3. Create comprehensive fix
4. Restart validation from first failed pipeline

---

## Dependencies

### Depends On
- ✅ **EPIC-1:** Cache keys must be unique
- ✅ **EPIC-2:** Column names must be correct
- ✅ **EPIC-3:** Train/test splits must work
- ✅ **EPIC-4:** Infrastructure must be reliable

### Blocks
- Nothing (this is the final validation)

---

## Files to Create

| File | Purpose |
|------|---------|
| `validation/pre-check-report.json` | System readiness |
| `validation/2km-summary.md` | 2km results |
| `validation/100km-summary.md` | 100km results |
| `validation/200km-summary.md` | 200km results |
| `validation/FINAL-VALIDATION-REPORT.md` | Complete report |
| `validation/checklists/*.md` | Per-pipeline checklists |
| `validation/errors/*.md` | Error documentation |
| `validation/logs-archive-*.tar.gz` | Log backup |
| `scripts/run_validation.py` | Validation automation |
| `scripts/generate_report.py` | Report generation |

---

## Estimated Effort

| Task | Hours |
|------|-------|
| Pre-check script | 1 |
| Validation protocol documentation | 1 |
| Run 6 × 2km pipelines + validation | 3 |
| Run 6 × 100km pipelines + validation | 6 |
| Run 6 × 200km pipelines + validation | 12 |
| Handle any failures (estimated) | 4 |
| Generate final report | 2 |
| **Total** | **29 hours** |

*Note: This assumes no major failures. If significant issues are found, time will increase.*

---

## Success Metrics

1. ✅ All 18 pipelines pass validation
2. ✅ Zero errors in any log file
3. ✅ All accuracy metrics > 0.80 (expected > 0.95)
4. ✅ All confusion matrices show real predictions
5. ✅ Full validation report generated
6. ✅ Results backed up and archived
7. ✅ Reproducibility confirmed (same results on re-run)
