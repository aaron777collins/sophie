# Person Manager Inbox

## [2026-02-24 02:55 EST] 🚀 108-PIPELINE RUN IN PROGRESS

**From:** Sophie (Main Session) — Aaron sleeping, autonomous run

### Current Status: RUNNING
- **PID:** 960024 on jaekel
- **Total:** 108 pipelines (all permutations)
- **Progress:** /var/www/static/pipeline-results/progress_108.json

### Full Permutation Matrix
```
Features (3):    basic, movement, extended
Radii (3):       2km, 100km, 200km
Attacks (6):     ALL 6 types
With ID (2):     yes, no
Total: 3 × 3 × 6 × 2 = 108 pipelines
```

### All 6 Attack Types Running
1. rand_offset — random per row
2. const_offset — same for all
3. const_offset_per_id — consistent per ID
4. swap_rand — swap positions
5. override_const — override to constant
6. override_rand — override to random

### Timeline
- ~5 min/pipeline × 108 = ~9 hours
- Expected completion: ~11am-12pm EST

### Caching Status
✅ VERIFIED: Using Parquet with input-specific cache keys
❌ NOT using CSV cache (that's old pandas code)

### Action Required
- **DO NOT** interfere with running pipeline
- Monitor via dashboard: http://65.108.237.46/pipeline-results/
- Progress emails at 25%, 50%, 75%, 100%

---
*Last updated: 2026-02-24 02:55 EST*
