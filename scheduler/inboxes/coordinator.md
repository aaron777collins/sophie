# Coordinator Inbox

## [2026-02-24 ~09:00 EST] 🚀 CRITICAL UPDATE: 162 Pipelines Running

**From:** Sub-agent (pipeline-162-expansion)

**Status:** 162-pipeline run started on jaekel

### What Changed
- Aaron clarified: need **9 feature sets**, not 6
- Expanded from 108 to 162 pipelines
- All previous results cleared

### 9 Feature Sets
1. basic (NO IDs)
2. movement (NO IDs)
3. extended (NO IDs)
4. basicWithId (X only)
5. movementWithId (X only)
6. extendedWithId (X only)
7. basicWithAll3Ids (W + X + O)
8. movementWithAll3Ids (W + X + O)
9. extendedWithAll3Ids (W + X + O)

### Column Mapping
- O (15) = metadata_receivedAt
- W (23) = coreData_msgCnt
- X (24) = coreData_id

### Full Matrix
9 × 3 radii × 6 attacks = **162 pipelines**

### Actions Completed
1. ✅ Cleared all previous results on jaekel
2. ✅ Created run_162_pipelines.py
3. ✅ Sent MDL email to Aaron & Josh
4. ✅ Started pipeline run

### Monitoring
- Progress: /var/www/static/pipeline-results/progress_162.json
- Log: /tmp/run_162.log
- ETA: ~20 hours

**No further action needed from Coordinator unless monitoring detects issues.**
