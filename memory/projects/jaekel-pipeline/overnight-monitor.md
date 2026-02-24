# Jaekel Pipeline Monitor - Overnight Run (2026-02-24)

## Progress
- 8/36 pipelines completed so far
- 4 successful, 4 failed
- Current pipeline: Run2kmExtendedConst.py [running]

## Issues
- Errors in Run2kmMovementConst pipeline related to Parquet file access
- Overall, more than 3 failures, so alerting for review

## Actions
- Restarted pipeline daemon (was running)
- Checked row consistency (264,444 for successful 2km pipelines)
- Reviewed error logs

## Next Steps
- Monitor remaining pipelines
- Investigate Run2kmMovementConst failures
- Provide status update to Aaron