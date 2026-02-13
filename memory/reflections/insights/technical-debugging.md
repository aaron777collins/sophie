# Technical Debugging Insights

## [2026-02-12] Dashboard Debugging Pattern

### Effective Structure Observed
When debugging the ConnectedDrivingPipelineV4 dashboard issues, a clear pattern emerged:

1. **Symptom** → What the user sees
2. **Root Cause** → Why it's happening  
3. **Fix** → What was changed
4. **Location** → Specific files and line numbers

This format made the debugging session highly trackable and reproducible.

### Key Elements
- **Specific symptoms:** "8 rows instead of 3" vs vague "table issues"
- **Technical root cause:** CSV parsing including confusion matrix data
- **Precise fixes:** Exact code changes with line numbers
- **File locations:** `~/pipeline-dashboard/app.py` lines 642-678

### Application
This pattern should be used for all technical debugging sessions - it creates clear documentation that future work can build on.