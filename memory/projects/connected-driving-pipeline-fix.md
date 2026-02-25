# Connected Driving Pipeline V4 - Progress Tracking

## Pipeline Run Status (Latest Update: 2026-02-25 23:04 EST)

**Current Status:** RUNNING - 35/108 completed (32.4%)
**Success Rate:** 100% (0 failures)
**Server:** jaekel (65.108.237.46)
**Started:** Feb 24, 2026 09:43 UTC
**Monitor Active:** Since 03:20 EST with fixed logging

### Progress Timeline
- [2026-02-25 23:04 EST] Monitor email sent - 35/108 pipelines complete, 100% success rate, Material Design HTML progress report (13.5+ hours runtime)
- [2026-02-24 22:30 EST] Monitor email sent - 34/108 pipelines complete, 100% success rate, Material Design HTML progress report
- [2026-02-24 21:45 EST] Monitor email sent - 32/108 pipelines complete, 100% success rate, Material Design HTML email
- [2026-02-24 21:32 EST] Monitor email sent - 32/108 pipelines complete, 100% success rate, ~18h estimated remaining
- [2026-02-24 21:05 EST] Monitor email sent - 30/108 pipelines complete, 100% success rate
- [2026-02-24 03:20 EST] RESTARTED with fixed logging, running full 162-pipeline matrix
- Process: ubuntu 1155359 running `python3 -u run_with_skips.py` (CPU: 64.4%)

### Current Progress Details
**Total Expected:** 108 pipelines (note: original message mentioned 162, but progress file shows 108)
**Completed:** 35 pipelines
**Failed:** 0 pipelines
**Remaining:** 73 pipelines
**Progress:** 32.4%

### Completed Pipeline Categories (34 total):
1. **basic_2km_*** (6 pipelines) - All complete
   - randoffset, constoffset, constoffsetperid, swaprand, overrideconst, overriderand
   - Times: 3-4 min each, except swaprand (1h 25m)

2. **basic_100km_*** (3 pipelines) - All complete  
   - randoffset (16m), constoffset (14m), constoffsetperid (25m)

3. **basic_200km_*** (3 pipelines) - All complete
   - randoffset (30m), constoffset (26m), constoffsetperid (1h 8m)

4. **movement_2km_*** (6 pipelines) - All complete
   - Similar pattern to basic_2km, times range 3-4 min except swaprand (1h 26m)

5. **movement_100km_*** (3 pipelines) - All complete
   - Similar times to basic_100km variants

6. **movement_200km_*** (3 pipelines) - All complete  
   - Similar times to basic_200km variants

7. **extended_2km_*** (6 pipelines) - All complete
   - Similar pattern to other 2km variants

8. **extended_100km_*** (3 pipelines completed)
   - extended_100km_randoffset (16m 25s)
   - extended_100km_constoffset (14m 21s)  
   - extended_100km_constoffsetperid (25m 18s)

9. **extended_200km_*** (2 pipelines completed so far)
   - extended_200km_randoffset (30m 27s)
   - extended_200km_constoffset (26m 24s)

### Performance Patterns
- **2km radius:** ~3-4 minutes per pipeline (except swaprand variants: ~1.5 hours)
- **100km radius:** ~14-25 minutes per pipeline
- **200km radius:** ~26-68 minutes per pipeline
- **swaprand variants:** Consistently much longer (1+ hours)

### Email Recipients
- aaron777collins@gmail.com
- joshuapicchioni@gmail.com

### Dashboard
- **Live URL:** http://65.108.237.46/pipeline-results/
- **Results Path:** /var/www/static/pipeline-results/
- **Progress File:** /var/www/static/pipeline-results/progress_162.json

### Notes
- All 34 completed pipelines successful (100% success rate)
- Process running continuously with good CPU utilization (64.1% CPU, ~12.8 hours elapsed)
- Material Design HTML progress emails being sent with detailed metrics and completion tables
- Discrepancy between expected 162 and current 108 total - monitoring for clarification
- Pipeline has been running steadily since 9:43 AM EST on Feb 24th

## Next Steps
- Continue monitoring progress
- Send final comprehensive email when all 108 complete
- Investigate discrepancy between 162 vs 108 total pipeline count