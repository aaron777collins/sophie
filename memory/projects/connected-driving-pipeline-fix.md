# Connected Driving Pipeline Fix

## Project Overview
**Status:** ✅ RUNNING SUCCESSFULLY  
**Server:** jaekel (ssh alias: 65.108.237.46)  
**Pipeline:** ConnectedDrivingPipelineV4  
**Started:** 2026-02-24 09:43 EST  

## Current Status (2026-02-25 18:01 EST)
- **Progress:** 83/108 pipelines completed (76.9%)
- **Success Rate:** 100% (0 failures)
- **Process:** Running stable (PID: 1155359, CPU: 63.9%)
- **Remaining:** 25 pipelines
- **Runtime:** 1200+ minutes continuous operation (20+ hours since Feb 24th restart)
- **Last Completed:** basicWithAll3Ids_200km_constoffset (26.6 min runtime)

## Key Improvements Made
- [2026-02-24] Fixed logging issues that were causing crashes
- [2026-02-24] Restarted with full 162-pipeline matrix (now running 108 config)
- [2026-02-24] Monitoring system established with automated progress emails

## Pipeline Categories Completed
✅ **Basic variants** (2km, 100km, 200km) - All attack types  
✅ **Movement variants** (2km, 100km, 200km) - All attack types  
✅ **Extended variants** (2km, 100km, 200km) - All attack types  
✅ **BasicWithId variants** (2km, 100km, 200km) - All attack types  
✅ **MovementWithId variants** (2km, 100km, 200km) - All attack types  
🔄 **ExtendedWithId variants** (currently processing 100km+ configs)

## Attack Types per Category
- randoffset (random offset attacks)
- constoffset (constant offset attacks)  
- constoffsetperid (per-ID constant offset)
- swaprand (random swap attacks) - *longest runtime ~85 mins*
- overrideconst (constant override attacks)
- overriderand (random override attacks)

## Performance Insights
- **Fastest:** Simple offset attacks (~3-4 minutes for 2km)
- **Slowest:** swaprand attacks (~85 minutes for 2km, longer for larger radii)
- **Scaling:** 100km configs take ~15-25 minutes, 200km take ~25-70 minutes
- **Stability:** No failures or crashes since restart

## Monitoring Setup
- **Progress File:** `/var/www/static/pipeline-results/progress_162.json`
- **Dashboard:** http://65.108.237.46/pipeline-results/
- **Automated Emails:** Every 30 minutes to aaron777collins@gmail.com, joshuapicchioni@gmail.com
- **Monitor Agent:** Jaekel Pipeline Monitor (Sonnet, cron job)

## Next Steps
- Continue monitoring until completion (39 pipelines remaining)
- Send comprehensive final report with full ML metrics when complete
- Archive results and update project documentation

## File Locations
- **Source:** `~/repos/ConnectedDrivingPipelineV4` on jaekel
- **Results:** `/var/www/static/pipeline-results/` on jaekel
- **Logs:** `pipeline_run.log` in source directory
- **Progress:** Real-time JSON at progress_162.json

## Email Recipients
- aaron777collins@gmail.com (primary)
- joshuapicchioni@gmail.com (collaborator)

---
*Last Updated: [2026-02-25 18:01 EST] Progress email sent: 83/108 complete, 0 failures*

## Latest Monitoring Activity  
- [2026-02-25 19:01 EST] ✅ Cron job executed - sent Material Design progress email (83/108 complete)
- [2026-02-25 19:01 EST] Email sent to aaron777collins@gmail.com, joshuapicchioni@gmail.com with enhanced HTML styling
- [2026-02-25 19:01 EST] Pipeline progress: 83/108 complete (76.85%), 0 failures - stable since 18:01 check
- [2026-02-25 19:01 EST] Process still stable (PID: 1155359, CPU: 62.9%) running for 20+ hours
- [2026-02-25 19:01 EST] Latest completed: basicWithAll3Ids_200km_constoffset (26m 34s elapsed)
- [2026-02-25 19:01 EST] Email featured: progressive metrics, recent completions table, live dashboard
- [2026-02-25 18:01 EST] ✅ Previous cron run - sent Material Design progress email (83/108 complete)
- [2026-02-25 18:01 EST] Email sent to aaron777collins@gmail.com, joshuapicchioni@gmail.com with enhanced HTML styling
- [2026-02-25 18:01 EST] Pipeline progress: 83/108 complete (76.9%), 0 failures - +2 completions since 17:01 check
- [2026-02-25 18:01 EST] Process still stable (PID: 1155359, CPU: 63.9%) running for 20+ hours
- [2026-02-25 18:01 EST] Recent completions: basicWithAll3Ids 200km variants (randoffset, constoffset)
- [2026-02-25 18:01 EST] Email featured: enhanced progress bar animation, metrics grid, live dashboard link
- [2026-02-25 17:01 EST] ✅ Cron job executed - sent Material Design progress email (81/108 complete)
- [2026-02-25 17:01 EST] Email sent to aaron777collins@gmail.com, joshuapicchioni@gmail.com with full HTML design
- [2026-02-25 17:01 EST] Pipeline progress: 81/108 complete (75%), 0 failures - +6 completions since 15:01 check
- [2026-02-25 17:01 EST] Process still stable (PID: 1155359, CPU: 63.7%) running for 19+ hours
- [2026-02-25 17:01 EST] Recent completions: basicWithAll3Ids 100km variants (randoffset, constoffset, constoffsetperid)
- [2026-02-25 17:01 EST] Email featured: animated progress bar, metrics grid, pipeline completion table, dashboard link
- [2026-02-25 15:01 EST] Previous monitoring email sent (75/108 complete) - stable progress noted
- [2026-02-25 14:01 EST] Previous monitoring email sent at 14:01 EST (71/108 complete)
- [2026-02-25 13:00 EST] Earlier monitoring run: 70/108 complete
- [2026-02-25 12:31 EST] First monitoring email of the day sent