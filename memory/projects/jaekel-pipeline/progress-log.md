# Jaekel Pipeline Progress Log

## 2026-02-24 05:45 EST - Pipeline Execution Restored

### Critical Bugs Fixed

1. **Train/Test Split Bug** (Line 377 in DaskPipelineRunner.py)
   - **Problem:** Split used fixed 100K rows regardless of dataset size
   - **Cause:** `num_train_rows: 100000` default, not using `test_size` from config
   - **Effect:** Test set had 0 rows when dataset < 100K, causing n_samples=0 errors
   - **Fix:** Always use percentage-based split with `test_size` from config

2. **Port Conflict Bug** (Line 110-111 in DaskSessionManager.py)
   - **Problem:** Hardcoded ports `8786` and `8787` caused "Address already in use"
   - **Fix:** Changed to dynamic ports (`scheduler_port=0`, `dashboard_address=':0'`)

3. **Duplicate Daemon Bug**
   - **Problem:** Multiple daemon versions (v2, v3) running simultaneously
   - **Effect:** Multiple pipelines started concurrently, competing for resources
   - **Fix:** Killed all daemons, restart only one (daemon_v2.py)

4. **Watchdog False Positive Bug** (Line 165-185 in daemon_v2.py)
   - **Problem:** Watchdog marked jobs as crashed immediately after start
   - **Fix:** Added 60-second grace period before watchdog checks

### Current Status
- Batch: v4 (36 pipelines)
- Completed: 2/36 (100% success rate)
- v4_0: Run2kmBasicConst.py - 13s ✅
- v4_1: Run2kmBasicRand.py - 3m 42s ✅
- Currently running: v4_2 Run2kmBasicWithIdConst.py

### Estimated Completion
- ~2-3 hours for all 36 pipelines (3-4 min average per pipeline)

## 2026-02-24 05:54 EST - Cache Bug Fixed & Verified

### Issue
Aaron noticed row count discrepancy:
- `basic_2km_const`: 63,784 rows (WRONG - from stale cache)
- `basic_2km_rand`: 264,444 rows (CORRECT - fresh clean)

### Root Cause
`_get_config_hash()` only hashed `pipeline_name`, not the full config:
```python
# BROKEN:
return hashlib.md5(self.pipeline_name.encode()).hexdigest()
```

This allowed stale cache from old runs to be reused incorrectly.

### Fix
Changed hash to include full data config:
```python
# FIXED:
hash_input = {
    'name': self.pipeline_name,
    'data': self.config.get('data', {}),
    'cache_version': self.config.get('cache', {}).get('version', 'v1'),
}
return hashlib.md5(json.dumps(hash_input, sort_keys=True).encode()).hexdigest()
```

### Verification
After clearing cache and rerunning:
- `basic_2km_const`: 264,444 rows ✅
- All pipelines will now have consistent data
