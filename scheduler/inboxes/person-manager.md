# Person Manager Inbox

## [2026-02-24 02:30 EST] 🚨 CRITICAL OVERHAUL IN PROGRESS

**From:** Sophie (Main Session) — Aaron went to bed, I'm in charge

### Critical Issues Identified
1. ❌ **CSV Cache is WRONG** — need PARQUET (CSV too big for data volume)
2. ❌ **Cache not input-specific** — risk of contamination between configs
3. ❌ **Only 36 pipelines** — need ALL 108 permutations (6 attack types)

### Actions Taken
1. ✅ Killed all running pipelines
2. ✅ Cleared ALL results, cache, logs — zero contamination
3. 🔄 Opus sub-agent auditing + fixing caching system
4. 🔄 Converting CSV cache → Parquet cache
5. 🔄 Creating full 108-pipeline matrix

### Full Permutation Matrix (108 total)
```
Features (3):    basic, movement, extended
Radii (3):       2km, 100km, 200km
Attacks (6):     ALL attack types (was only 2!)
With ID (2):     yes, no
Total: 3 × 3 × 6 × 2 = 108 pipelines
```

### Attack Types (6 total)
1. `rand_offset` — random direction/distance per row
2. `const_offset` — same direction/distance for ALL attackers
3. `const_offset_per_id` — random but consistent per vehicle ID
4. `swap_rand` — swap positions randomly
5. `override_const` — override to constant location
6. `override_rand` — override to random location

### Timeline
- Caching fix: ~1 hour (Opus working)
- Full run: ~9 hours (108 pipelines × ~5 min each)
- MDL emails: Every significant milestone

### Action Required
- **DO NOT** spawn any workers for this project
- Sophie + Opus handling directly
- Person Manager: Monitor only, no action needed

---
*Last updated: 2026-02-24 02:30 EST — Aaron sleeping, Sophie in charge*
