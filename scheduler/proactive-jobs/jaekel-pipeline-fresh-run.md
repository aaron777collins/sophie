# Jaekel Pipeline - Fresh Complete Run

**Created:** 2026-02-24 02:16 EST
**Priority:** 🔴 CRITICAL
**Owner:** Sophie (Main Session) + Opus Audit Agent

## Objective

Run ALL 36 ConnectedDrivingPipelineV4 pipelines from scratch with:
- All caches cleared
- All previous results cleared
- Proper output structure (per-run folders)
- Comprehensive email with ALL metrics when complete

## Pre-Execution Checklist

- [x] Kill all running pipeline processes
- [x] Clear all caches (`cache/`)
- [x] Clear all results (`pipeline-results/`)
- [x] Clear all logs (`logs/`)
- [x] Clear all CSV outputs (`Outputs/Output/`)
- [ ] Opus audit complete
- [ ] Verify `run_all_pipelines.py` is correct
- [ ] Verify configs are correct
- [ ] Start fresh run

## Verification Points (From Audit)

### Distance Calculations
- [ ] `Helpers/MathHelper.py` - uses degrees (NOT radians) in Geodesic.Inverse
- [ ] `coordinate_conversion.enabled: true` in all configs
- [ ] Center point conversion to meters working

### Cache Keys
- [ ] Cache key includes ALL parameters (columns, attack, radius, features)
- [ ] No cache collisions between different configs

### Output Structure
- [ ] Per-run folders in `pipeline-results/{name}/`
- [ ] JSON results with full metrics
- [ ] CSV results
- [ ] Consolidated log file
- [ ] Confusion matrix PNGs
- [ ] run_info.txt summary

### Train/Test Split
- [ ] Percentage-based (80/20)
- [ ] NOT fixed row counts

## Execution Plan

1. **Run Opus audit** (in progress)
2. **Apply any fixes** identified by audit
3. **Execute:** `python run_all_pipelines.py` (all 36 pipelines)
4. **Monitor:** Sonnet cron job every 15 min
5. **Email:** When all 36 complete, send comprehensive report

## Email Requirements

**Recipients:** aaron777collins@gmail.com, joshuapicchioni@gmail.com

**Per Pipeline:**
- Pipeline name, status, duration
- Original row count
- Cleaned row count
- Filtered row count (after spatial filter)
- Train sample count
- Test sample count
- Total vehicle IDs
- Attacker vehicle IDs (train)
- Attacker vehicle IDs (test)
- Clean data count
- Attacked data count
- Per-classifier metrics:
  - Train accuracy, precision, recall, F1, specificity
  - Test accuracy, precision, recall, F1, specificity
  - Training time
  - Prediction time per sample
- Config parameters (radius, attack type, features)

## Monitoring

**Cron Job:** `jaekel-pipeline-monitor` (Sonnet, every 15 min)
- Check for running processes
- Check for completed results
- Check for errors in logs
- Send email when all 36 complete

## Contingencies

### If pipeline fails:
1. Check error in log
2. Fix the issue
3. Re-run failed pipeline only

### If cache issues:
1. Clear specific cache entries
2. Re-run affected pipeline

### If output missing:
1. Check `run_all_pipelines.py` output logic
2. Verify symlink to `/var/www/static/pipeline-results/`

## Status

- **Audit:** ⏳ In Progress (Opus sub-agent)
- **Execution:** ⏳ Pending audit completion
- **Monitoring:** ✅ Cron job active
