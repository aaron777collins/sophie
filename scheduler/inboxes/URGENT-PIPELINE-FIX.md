# URGENT: Aaron's Exact Pipeline Output Requirements

**Created:** 2026-02-24 01:08 EST
**Priority:** CRITICAL - Must be fixed by morning
**For:** All sub-agents working on pipeline output

## Aaron's EXACT Requirements (Non-Negotiable)

### OUTPUT STRUCTURE (MANDATORY)
Each pipeline run MUST create a folder in `pipeline-results/` containing:
```
pipeline-results/{pipeline_name}/
├── {name}.csv              # Results CSV
├── {name}_results.json     # Full JSON with timing, config, metrics
├── {name}.log              # Complete execution log
├── confusion_matrix_RandomForest.png
├── confusion_matrix_DecisionTree.png  
├── confusion_matrix_KNeighbors.png
└── metrics_summary.txt     # Human-readable summary
```

### CACHING (CRITICAL - NO MISTAKES)
Cache keys MUST be unique per:
- Input parameters/features
- Time range (date_range)
- Location (center_lat, center_lon)
- Attack type
- Offset distances
- Radius
- Column list

**Verify `_get_config_hash()` in DaskPipelineRunner.py includes ALL these!**

### SYMLINKING
- Results MUST be accessible at `/var/www/static/pipeline-results/` for dashboard
- Handle symlinks carefully - verify they work
- Dashboard URL: http://65.108.237.46/dashboard/

### CHECK PROACTIVE-JOBS.md
Read `~/clawd/PROACTIVE-JOBS.md` - there are:
- Acceptance criteria
- Previous issue tracking
- Cache key requirements documented
- Validation protocol

Align your work with what's documented there!

### VALIDATION BEFORE DECLARING DONE
1. Run at least ONE full pipeline test
2. Verify folder structure created correctly
3. Verify ALL files exist (CSV, JSON, log, PNGs)
4. Check for ANY Python errors in logs (Traceback, Error, Exception)
5. Confirm caching works correctly (different params = different cache)
6. Test dashboard accessibility

### Acceptance Criteria (from PROACTIVE-JOBS.md)
- ZERO "KeyError" in logs
- ZERO "n_samples=0" in logs
- ZERO "Traceback" in logs
- ZERO "ERROR:" in logs
- Real ML results produced (accuracy metrics, model files)

## Server Access
- SSH: `ssh jaekel`
- Repo: `/home/ubuntu/repos/ConnectedDrivingPipelineV4`
- Venv: `source venv/bin/activate`
- Results: `/var/www/static/pipeline-results/`

## NO EXCUSES. FIX IT ALL.
