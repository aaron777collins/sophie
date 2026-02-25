# CRITICAL PIPELINE FIX - 2026-02-24 08:20 EST

## Issue Identified

**Root Cause:** The Logger class in ConnectedDrivingPipelineV4 uses dependency injection to get path providers. The first pipeline initialized sets up a PathProvider with its pipeline name, but subsequent pipelines reuse the same cached PathProvider due to how StandardDependencyInjection works. This caused ALL pipeline logs to be written to the FIRST pipeline's directory (e.g., `logs/basic_100km_const/`).

**Evidence:** 
- `logs/basic_100km_const/` contained: `basic_100km_rand.txt`, `basic_100km_withid_const.txt`, `basic_200km_const.txt`, etc.
- Other pipeline directories like `logs/basic_100km_rand/` didn't exist
- `consolidate_logs()` function looked for `logs/{pipeline_name}/` which didn't exist for most pipelines

## Fix Applied

Modified `run_all_pipelines.py` to capture stdout/stderr directly during pipeline execution using a TeeWriter class:

```python
class TeeWriter:
    """Write to both a capture buffer and the original stream."""
    def __init__(self, capture, original):
        self.capture = capture
        self.original = original
    
    def write(self, msg):
        self.capture.write(msg)
        self.original.write(msg)
    
    def flush(self):
        self.capture.flush()
        self.original.flush()

@contextlib.contextmanager
def capture_output():
    """Context manager to capture stdout and stderr while still printing to console."""
    ...
```

This bypasses the broken Logger dependency injection entirely. Each pipeline's verbose output (including row counts, vehicle IDs, attacker counts, ML results) is captured directly and written to `pipeline.log`.

## Actions Taken

1. Backed up original: `run_all_pipelines.py.backup`
2. Deployed fixed: `run_all_pipelines.py` with TeeWriter capture
3. Cleared all artifacts:
   - `/var/www/static/pipeline-results/*`
   - `data/classifierdata/splitfiles/combinedcleaned/*`
   - `data/mclassifierdata/*`
   - `Outputs/*`
   - `logs/*`
4. Started fresh run: `nohup python run_all_pipelines.py --results-dir "/var/www/static/pipeline-results" > /tmp/run_all_fresh.log 2>&1 &`

## Expected Output

Each `pipeline-results/{name}/pipeline.log` now contains:
- Configuration details
- Row counts at each stage
- Vehicle ID statistics (total, attackers, clean)
- Train/test split information  
- Classifier training logs
- ML metrics (accuracy, precision, recall, F1, specificity)

## Monitoring

Dashboard: http://65.108.237.46/pipeline-results/
Log: `ssh jaekel 'tail -f /tmp/run_all_fresh.log'`

---
Status: **IN PROGRESS** - Fresh run started 08:20 EST
