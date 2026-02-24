# Jaekel Pipeline Overnight Monitor

## Session Start: 2026-02-24 00:00 EST

### Fixes Applied
1. **Comprehensive Cache Hash** - Now includes:
   - Pipeline name
   - Data config (source, filtering, spatial radius, etc.)
   - Attack config (type, ratio, distances, seed)
   - ML config (features, label, train/test split)
   - Cache version

2. **All Caches Cleared**
   - data/classifierdata/splitfiles/*
   - data/classifierdata/cleaned/*
   - data/mclassifierdata/*
   - cache/*
   - Outputs/Output/*

3. **Queue Reset**
   - 36 pipelines queued fresh
   - Clean state

### Expected Behavior
- All 2km pipelines: ~264K rows
- All 100km pipelines: consistent rows (TBD after first run)
- All 200km pipelines: consistent rows (TBD after first run)

### Progress Log

| Time | Progress | Current | Notes |
|------|----------|---------|-------|
| 00:00 | 0/36 | Run2kmBasicConst.py | Started fresh run |
| 00:05 | 1/36 | Run2kmBasicRand.py | v4_0: 264,444 rows ✅ (3m 53s) |
| 00:08 | 2/36 | Run2kmBasicWithIdConst.py | v4_1: 264,444 rows ✅ (3m 52s) |

### Verification Checklist
- [ ] First 2km pipeline has ~264K rows
- [ ] All 2km pipelines have same row count
- [ ] 100km pipelines have consistent row count
- [ ] 200km pipelines have consistent row count
- [ ] No cache-related errors
- [ ] All 36 complete successfully

### Issues Encountered
(none yet)

### Completion Checklist
When all 36 complete:
1. [ ] Verify all row counts are consistent within each radius
2. [ ] Clear intermediate caches
3. [ ] Keep only source data
4. [ ] Generate summary report
5. [ ] Post to Slack
6. [ ] Disable monitor job
