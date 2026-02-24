# ADDITIONAL CRITICAL CONTEXT FROM AARON

**Created:** 2026-02-24 01:05 EST
**For:** Opus sub-agent `pipeline-output-fix`

## 1. Old Code Had Proper Outputs
The original pipeline scripts (the 50+ individual MClassifier*.py files) had proper folder outputs with logs, confusion matrices, CSVs. Look at one for reference:
```bash
ssh jaekel "ls /home/ubuntu/repos/ConnectedDrivingPipelineV4/*.py | head -5"
ssh jaekel "head -100 /home/ubuntu/repos/ConnectedDrivingPipelineV4/MClassifierLargePipelineUserWithXYOffsetPos2000mDistRandSplit80PercentTrain20PercentTestAllRowsONLYXYELEVCols30attackersRandOffset100To200xN106y41d01to30m04y2021.py"
```

## 2. CACHING IS CRITICAL
**Unique cache names per:**
- Input params/features
- Time range
- Location (center lat/lon)
- Attack type
- Offset distances

The current `_get_config_hash()` in DaskPipelineRunner.py generates the cache key. VERIFY this includes ALL parameters that affect output.

## 3. Check for Python Errors
Aaron saw Python errors in logs. Before running, audit:
```bash
ssh jaekel "grep -r 'Traceback\|Error\|Exception' /home/ubuntu/repos/ConnectedDrivingPipelineV4/logs/ 2>/dev/null | tail -20"
```

## 4. Acceptance Criteria (from PROACTIVE-JOBS.md)
- ZERO "KeyError" in logs
- ZERO "n_samples=0" in logs
- ZERO "Traceback" in logs
- ZERO "ERROR:" in logs
- Real ML results produced (accuracy metrics, model files)

## 5. Confusion Matrix Generation
Check `MachineLearning/MDataClassifier.py` - it should have `plot_confusion_matrix()` or similar. Also check `MachineLearning/DaskMClassifierPipeline.py` for where this is called.

## 6. Final Output Structure Aaron Expects
```
/var/www/static/pipeline-results/{pipeline_name}/
├── {name}_results.json
├── {name}.csv
├── {name}.log
├── confusion_matrix_RandomForest.png
├── confusion_matrix_DecisionTree.png
├── confusion_matrix_KNeighbors.png
└── metrics_summary.txt
```

## 7. Pipeline Monitor Cron Disabled
I've disabled the `jaekel-pipeline-monitor` cron to prevent conflicts. Re-enable when done:
```
cron(action="update", jobId="7769a58f-1c4b-4ee3-b129-df683a6f5c1b", patch={"enabled": true})
```

TAKE YOUR TIME, BE THOROUGH. Aaron is sleeping. Results need to be right, not fast.
