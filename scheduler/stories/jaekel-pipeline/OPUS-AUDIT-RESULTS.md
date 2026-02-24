# OPUS AUDIT RESULTS: ConnectedDrivingPipelineV4 Comprehensive Execution Plan

**Auditor:** Story Architect (Opus)
**Audit Date:** 2026-02-23 23:00 EST
**Plan Reviewed:** `COMPREHENSIVE-EXECUTION-PLAN.md`

---

## 🎯 SUMMARY

| Verdict | Confidence | Status |
|---------|------------|--------|
| **PLAN NEEDS CRITICAL FIXES** | 75% | 🔴 NOT READY FOR EXECUTION |

**The plan is well-structured but contains CRITICAL naming mismatches and a SHOW-STOPPING BUG that would cause execution failures.**

---

## 🔴 CRITICAL ISSUES (MUST FIX BEFORE EXECUTION)

### Issue #1: ATTACK TYPE NAME MISMATCH (SHOW-STOPPER)

**Severity:** 🔴 CRITICAL - Attacks won't be applied at all!

**Finding:** 
The existing production configs use `"type": "random_offset"` but the code in `DaskPipelineRunner.py` checks for `"rand_offset"`:

```python
# Code expects:
if attack_type == "rand_offset":        # ← Code checks THIS
    attacker = attacker.add_attacks_positional_offset_rand(...)

# Config has:
"attack": {
    "type": "random_offset",            # ← Config says THIS (doesn't match!)
    ...
}
```

**Impact:** The `elif` chain falls through and **NO ATTACK IS APPLIED** because `"random_offset"` doesn't match any case in the code.

**Required Fix:**
- **Option A:** Change all 18 configs from `"type": "random_offset"` → `"type": "rand_offset"`
- **Option B:** Update code to accept both names (add alias handling)

---

### Issue #2: CONST_OFFSET NAMING CONFUSION

**Severity:** 🔴 CRITICAL - Wrong attack logic will be used

**Finding:** 
The plan describes `const_offset` as "same offset for all data points of a vehicle" - but in the code, there are THREE different offset types:

| Config Value | Code Behavior | What Plan Describes |
|--------------|---------------|---------------------|
| `const_offset` | Fixed direction + fixed distance for ALL attackers | ❌ NOT this |
| `const_offset_per_id` | Random offset generated once per vehicle ID, applied to all their points | ✅ THIS is what Aaron wants |
| `rand_offset` | Different random offset for each data point | ✅ This is correct |

**The plan incorrectly uses `const_offset` when it should use `const_offset_per_id`!**

**Required Fix:**
- Update plan and all new configs to use `"type": "const_offset_per_id"` (not `const_offset`)
- This matches Aaron's requirement: "same offset for all data points of a vehicle"

---

### Issue #3: 36 PIPELINE COUNT VERIFICATION

**Severity:** 🟠 HIGH

**Finding:**
Current state on Jaekel server:
- 18 `*_pipeline_config.json` files exist (all with `random_offset`)
- 18 `*_template.json` files exist
- **0 configs have `const_offset_per_id`**

**Impact:** 18 new configs must be CREATED, not just modified.

**Required Fix:**
- Phase 1 must explicitly create 18 NEW config files for `const_offset_per_id` variants
- Config naming should be clear: `basic_2km_const_per_id_pipeline_config.json` (not `basic_2km_const.json` which is ambiguous)

---

## 🟠 HIGH-PRIORITY ISSUES

### Issue #4: Column Name Bug Still Present

**Severity:** 🟠 HIGH

**Finding:**
The existing configs STILL have wrong column names:
```json
"columns_to_extract": [
    "metadata_receivedat",        // ❌ WRONG - should be metadata_receivedAt
    "coredata_position_lat",      // ❌ WRONG - should be coreData_position_lat
    "coredata_position_long",     // ❌ WRONG - should be coreData_position_long
    "coredata_elevation"          // ❌ WRONG - should be coreData_elevation
]
```

**Impact:** KeyError exceptions will crash the pipeline.

**Required Fix:** EPIC-2 must be completed BEFORE creating new configs (or fix simultaneously).

---

### Issue #5: Missing Seed Consistency Documentation

**Severity:** 🟠 HIGH

**Finding:**
The plan doesn't specify whether the `seed: 42` in configs should:
- Be the same across all 36 pipelines (reproducible comparison)
- Be different for each pipeline (independent runs)
- Be documented for reproducibility

**Required Fix:**
Add to plan:
```
### Seed Strategy
- All pipelines use seed: 42 for reproducibility
- Results can be reproduced with same seed
- Document seed in results output
```

---

### Issue #6: Missing Attack Ratio Variation

**Severity:** 🟠 MEDIUM-HIGH

**Finding:**
All configs have `"malicious_ratio": 0.3` (30% attackers). Aaron's requirements don't mention this, but:
- Should all 36 pipelines use same 30% ratio?
- Should this be another dimension (like 10%, 30%, 50%)?

**Required Fix:**
Confirm with Aaron or document that 30% attack ratio is the standard for all runs.

---

## 🟡 MEDIUM-PRIORITY ISSUES

### Issue #7: WithId Variant ML Handling

**Severity:** 🟡 MEDIUM

**Finding:**
The plan adds `coreData_id` to features but doesn't address:
- How will the ML model handle categorical vehicle IDs?
- Is encoding (LabelEncoder, OneHotEncoder) needed?
- Can RandomForest handle raw string IDs?

**Required Fix:**
Add to plan:
```
### Vehicle ID Encoding
- coreData_id is a string/categorical feature
- Verify cleaner applies LabelEncoder before ML training
- Document encoding method in results
```

---

### Issue #8: Memory Estimates May Be Low

**Severity:** 🟡 MEDIUM

**Finding:**
Plan estimates for 200km:
- Rows: 8-13M
- Memory: 24-40 GB

Actual server has 62GB RAM. However:
- Dask workers + scheduler overhead ~10GB
- Extended feature set with 7 features × 13M rows × 8 bytes ≈ 728MB just for features
- Full DataFrame with all columns easily 3-5KB per row
- 13M × 5KB = 65GB potential peak

**Risk:** 200km Extended runs might OOM despite estimates.

**Required Fix:**
Add to plan:
```
### Memory Contingency for 200km
- If OOM: reduce to 2 workers (vs 4)
- If still OOM: use chunked processing
- Monitor with `htop` during first 200km run
- Consider streaming/lazy evaluation for Extended features
```

---

### Issue #9: Log Audit Missing Attack Verification

**Severity:** 🟡 MEDIUM

**Finding:**
Log audit protocol doesn't verify that attacks were actually applied. Could have:
- Attack config loaded but type didn't match (Issue #1)
- Zero attackers labeled (attack_ratio issue)

**Required Fix:**
Add to log audit:
```bash
# 6. Verify attacks applied
echo "=== ATTACK VERIFICATION ==="
grep -E "attackers|isAttacker|malicious" $LOG
# EXPECTED: Shows count of attackers > 0
# EXPECTED: Shows attack type applied
```

---

### Issue #10: Missing Baseline (No Attack) Comparison

**Severity:** 🟡 MEDIUM

**Finding:**
The 36 pipelines all have attacks. For research validity, you typically need:
- Clean baseline (0% attackers) for comparison
- Understanding of false positive rate without attacks

**Required Fix:**
Consider adding 18 more pipelines with `"malicious_ratio": 0.0` as baselines, OR document that baselines are out of scope.

---

## 🟢 MINOR ISSUES / RECOMMENDATIONS

### Issue #11: Run Script Naming Convention

**Finding:**
Plan proposes `Run2kmBasicConst.py` but code uses `const_offset_per_id`, creating confusion.

**Recommendation:**
Use explicit names: `Run2kmBasicConstPerID.py` or `Run2kmBasic_ConstOffsetPerID.py`

---

### Issue #12: Parallel Execution Risk

**Finding:**
Plan mentions running 12 pipelines per phase. If run in parallel:
- Dask port conflicts
- Memory contention
- Cache interference

**Recommendation:**
Add explicit note: "Run pipelines SEQUENTIALLY within each phase, one at a time."

---

### Issue #13: Results CSV Naming

**Finding:**
Plan doesn't specify output naming convention. Could get:
- Overwrites from same-named outputs
- Confusion about which results belong to which config

**Recommendation:**
Add naming convention:
```
results_{radius}_{features}_{id_variant}_{attack_type}_{timestamp}.csv
# Example: results_2km_basic_noid_constperid_20260224_120000.csv
```

---

## ✅ WHAT'S GOOD

### Correctly Documented

1. ✅ **36 pipeline matrix is mathematically correct:** 3 × 3 × 2 × 2 = 36
2. ✅ **Feature sets are properly defined:** Basic (3), Movement (5), Extended (7)
3. ✅ **Radii are correct:** 2km, 100km, 200km
4. ✅ **April 2021 date range is specified**
5. ✅ **Dask parallel processing is planned**
6. ✅ **Dashboard pipeline execution is planned**
7. ✅ **Log audit protocol is comprehensive** (with additions suggested above)
8. ✅ **Contingency handling is documented**
9. ✅ **Phased execution is sensible** (smallest first)
10. ✅ **Slack update schedule is practical**

### Server Resources Verified

| Resource | Available | Required | Status |
|----------|-----------|----------|--------|
| RAM | 62GB | 40GB peak | ✅ OK |
| Disk | 309GB free | ~50GB | ✅ OK |
| Swap | 63GB | backup | ✅ OK |

---

## 📋 REQUIRED ACTIONS BEFORE EXECUTION

### Phase 0.5: Critical Fixes (ADD THIS PHASE)

| # | Action | File(s) | Priority |
|---|--------|---------|----------|
| 1 | Fix attack type name in ALL 18 existing configs | `production_configs/*.json` | 🔴 CRITICAL |
| 2 | Use `const_offset_per_id` (not `const_offset`) for new configs | New configs | 🔴 CRITICAL |
| 3 | Use `rand_offset` (not `random_offset`) in all configs | All configs | 🔴 CRITICAL |
| 4 | Fix column names per EPIC-2 | All configs | 🔴 CRITICAL |
| 5 | Verify seed strategy (same for all or different) | Documentation | 🟠 HIGH |
| 6 | Add attack verification to log audit | Log audit script | 🟠 HIGH |
| 7 | Confirm 30% attack ratio is correct | Aaron | 🟠 MEDIUM |

### Config Name Mapping (Corrected)

| Plan Says | Should Be | Code Expects |
|-----------|-----------|--------------|
| `const_offset` | `const_offset_per_id` | `const_offset_per_id` |
| `random_offset` | `rand_offset` | `rand_offset` |

### Corrected Pipeline Naming

| # | Old Config Name | Corrected Config Name |
|---|-----------------|----------------------|
| 1 | `basic_2km_const.json` | `basic_2km_const_per_id_pipeline_config.json` |
| 2 | `basic_2km_rand.json` | `basic_2km_rand_offset_pipeline_config.json` |
| ... | ... | ... |

---

## 📊 FINAL ASSESSMENT

### Is the Plan Robust?

**NO** - with 75% confidence

**Blocking Issues:**
1. Attack type naming mismatch will cause NO ATTACKS to be applied
2. `const_offset` vs `const_offset_per_id` confusion will produce wrong attack patterns
3. Column name bugs will cause KeyError crashes

### With Fixes Applied?

**YES** - with 90% confidence

If the critical fixes above are applied:
- The matrix of 36 configurations is correct
- The phased execution approach is sound
- The log audit protocol will catch issues
- Memory/disk resources are sufficient
- Timeline estimates are reasonable

---

## 🔧 RECOMMENDED UPDATED EXECUTION ORDER

```
Phase 0: Pre-Flight (ORIGINAL)
    ↓
Phase 0.5: CRITICAL FIXES (NEW!)
    - Fix attack type names in code OR configs
    - Create 18 const_offset_per_id configs (not const_offset!)
    - Fix column names in ALL 36 configs
    - Add attack verification to log audit
    ↓
Phase 1: Generate/Validate Configs (30 min, not 1 hour)
    - Configs should already be fixed from 0.5
    - Validate all 36 have correct attack types
    - Validate all 36 have correct column names
    ↓
Phase 2-5: (ORIGINAL PLAN)
```

---

## 📝 AUDIT SIGN-OFF

| Check | Status |
|-------|--------|
| All 36 configurations enumerated | ✅ Pass |
| Attack types correctly differentiated | ❌ FAIL - naming mismatch |
| Feature sets complete | ✅ Pass |
| Edge cases identified | ⚠️ Partial - see recommendations |
| Log audit comprehensive | ⚠️ Needs attack verification added |
| Memory estimates reasonable | ⚠️ May be low for 200km |
| Risks identified | ✅ Pass |
| Execution plan logical | ✅ Pass (with fixes) |

**Auditor:** Opus (Story Architect)
**Audit Complete:** 2026-02-23 23:15 EST

---

## 🎬 NEXT STEPS

1. **Main session reviews this audit**
2. **Aaron confirms attack type requirements:**
   - Is `const_offset_per_id` the correct interpretation?
   - Is 30% malicious ratio correct?
   - Are baselines (0% attack) needed?
3. **Apply critical fixes**
4. **Re-audit if changes are significant**
5. **Proceed with execution**
