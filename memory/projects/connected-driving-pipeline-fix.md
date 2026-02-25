# Connected Driving Pipeline Fix Project

## Latest Status: Feb 25, 2026 7:45 AM EST

**PIPELINE RUNNING SUCCESSFULLY** ✅

### Current Progress
- **Total Pipelines:** 108 (actual full matrix)
- **Completed:** 57 pipelines (52.8% complete)
- **Failed:** 0 (100% success rate!)
- **Started:** Feb 24, 2026 @ 9:43 AM EST  
- **Runtime:** ~22 hours continuous
- **Estimated Remaining:** ~25 hours (based on current progress rate)

### Process Status
- Process running: `python3 -u run_with_skips.py` (PID 1155359)
- CPU Usage: 64.1% (heavy computation as expected)
- Memory Usage: 8.2% of system RAM (~5.4GB)

### Performance Analysis
| Pipeline Type | Average Runtime | Notes |
|---------------|-----------------|-------|
| 2km runs | 3-4 minutes | Fast, baseline tests |
| 100km runs | 15-25 minutes | Medium complexity |
| 200km runs | 25-70 minutes | High complexity |
| SwapRand variants | 85+ minutes | Computationally intensive |

### Recent Completions (Last 10 recorded)
1. movementWithId_100km_constoffset: 14.2 min ✓
2. movementWithId_100km_randoffset: 16.4 min ✓
3. movementWithId_2km_overriderand: 3.5 min ✓
4. movementWithId_2km_overrideconst: 3.5 min ✓
5. movementWithId_2km_swaprand: 85.5 min ✓
6. movementWithId_2km_constoffsetperid: 4.0 min ✓
7. movementWithId_2km_constoffset: 3.7 min ✓
8. movementWithId_2km_randoffset: 3.8 min ✓
9. basicWithId_200km_constoffsetperid: 68.8 min ✓
10. basicWithId_200km_constoffset: 26.5 min ✓

### Server Configuration
- **Server:** jaekel (ssh alias)
- **Results Location:** `/var/www/static/pipeline-results/`
- **Progress File:** `/var/www/static/pipeline-results/progress_162.json`
- **Dashboard:** http://65.108.237.46/pipeline-results/
- **Log File:** `~/repos/ConnectedDrivingPipelineV4/pipeline_run.log`

### Monitoring Schedule
- **Cron Job:** 3faf1d65-b6a8-45b3-9d19-6f1d86bc09cf
- **Frequency:** Regular monitoring with progress emails
- **Recipients:** aaron777collins@gmail.com, joshuapicchioni@gmail.com

### Email Updates
- **[Feb 25, 7:45 AM EST]** Sent progress email with Material Design HTML template
  - Progress: 57/108 complete (52.8%) - **Same progress as 14 minutes ago (pipeline still processing)**
  - Estimated 25 hours remaining  
  - All 57 completed pipelines successful (100% success rate)
  - Recipients: aaron777collins@gmail.com, joshuapicchioni@gmail.com
  - **Format:** Blue gradient header, progress bar, metric boxes, completion table with latest 5 pipelines
  - **Notable:** MovementWithId 100km pipelines recently completed (14-25 min range)
- **[Feb 25, 7:31 AM EST]** Previous progress email sent

### Next Steps
1. Continue monitoring until all 108 pipelines complete
2. Send comprehensive final email with full ML results when complete
3. Archive results and analysis

### Pipeline Categories Identified
- **Basic configurations:** Standard baseline tests
- **Movement configurations:** Movement-based feature testing
- **Extended configurations:** Extended feature sets
- **BasicWithId configurations:** ID-based feature variants
- **MovementWithId configurations:** Combined movement and ID features

### Attack Types Being Tested
- randoffset
- constoffset
- constoffsetperid
- swaprand
- overrideconst
- overriderand

### Distance Radii
- 2km (fast, local area)
- 100km (medium, regional)
- 200km (large, wide area)

---

## Historical Context

### Previous Issues Fixed
- [Feb 24] Fixed logging configuration preventing progress tracking
- [Earlier] Resolved pipeline execution bugs
- Implemented skip mechanism for failed runs

### Key Learnings
- SwapRand attacks are significantly more computationally intensive
- 2km radius tests provide quick validation
- Larger radius tests (200km) take substantially longer but crucial for comprehensive analysis

---

*Last updated: [Feb 25, 2026 7:45 AM EST] - Pipeline running smoothly, 57/108 complete (52.8%), 0 failures*