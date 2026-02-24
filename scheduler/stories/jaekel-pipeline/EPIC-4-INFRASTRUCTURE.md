# EPIC-4: Dashboard & Dask Infrastructure Fixes

**Priority:** 🟡 MEDIUM
**Estimated Complexity:** MEDIUM
**Status:** Not Started

---

## Executive Summary

The pipeline infrastructure has several issues that impact reliability and observability:

1. **Dashboard Error Detection:** Jobs marked "completed" even when they crashed
2. **Dask Port Conflicts:** "Port 8787 already in use" errors from orphaned clusters
3. **Process Orphans:** Zombie processes from previous runs
4. **Result Visibility:** Hard to verify if results are valid vs corrupted

These fixes improve operational reliability but are not blocking for core functionality.

---

## Investigation Findings

### Dashboard Status (http://65.108.237.46/dashboard/)

The queue daemon runs pipelines but doesn't properly detect failures:
- Subprocess returns exit code 0 even on internal errors
- Python exceptions don't propagate to bash exit codes
- Dashboard shows "completed" for crashed jobs

### Dask Scheduler Conflicts

From previous runs:
```
WARNING: Port 8787 already in use, using random port instead
```

Causes:
- Previous pipeline didn't shut down Dask cluster cleanly
- Multiple concurrent pipelines compete for same port
- No cleanup of orphaned distributed workers

### Process Management

```bash
$ ps aux | grep python | grep -i pipeline
# Often shows multiple zombie processes from crashed runs
```

### Files Involved

| File | Role |
|------|------|
| `PipelineScheduler/daemon.py` | Queue execution daemon |
| `Helpers/DaskSessionManager.py` | Dask cluster management |
| `Runners/Run*.py` | Individual pipeline scripts |

---

## User Stories

### Story 4.1: Fix Dashboard Error Detection

**As a** pipeline operator  
**I want** the dashboard to accurately show job status  
**So that** I know which jobs actually succeeded vs failed

#### Acceptance Criteria

##### AC-4.1.1: Exit Code Propagation
**Given** A pipeline that crashes with exception  
**When** Daemon checks subprocess result  
**Then** Exit code is non-zero  
**Test Method:**
```python
# Pipeline raises ValueError
# Daemon should see exit code != 0
result = subprocess.run(['python', 'Run2kmBasic.py'])
assert result.returncode != 0
```
**Evidence Required:** Crashed job exit code > 0

##### AC-4.1.2: Exception Detection in Logs
**Given** Pipeline run completes  
**When** Daemon parses output  
**Then** Scans for: "ERROR", "Traceback", "Exception", "Error:"  
**Test Method:**
```bash
# Daemon checks log for error patterns
grep -E "ERROR|Traceback|Exception" $LOG_FILE
```
**Evidence Required:** Log showing error pattern detection

##### AC-4.1.3: Failed Status in Dashboard
**Given** Pipeline crashes or has errors  
**When** Dashboard updated  
**Then** Status shows "FAILED" (red), not "COMPLETED"  
**Test Method:** 
1. Run intentionally failing job
2. Check dashboard status
**Evidence Required:** Screenshot showing FAILED status

##### AC-4.1.4: Error Summary in Dashboard
**Given** Job failed  
**When** Dashboard displays job  
**Then** Shows first error message: "KeyError: 'coredata_position_lat'"  
**Test Method:** Check dashboard error field
**Evidence Required:** Screenshot with error summary

---

### Story 4.2: Implement Proper Dask Cluster Management

**As a** pipeline execution system  
**I want** Dask clusters to be properly created and destroyed  
**So that** no port conflicts or orphaned workers occur

#### Acceptance Criteria

##### AC-4.2.1: Dynamic Port Allocation
**Given** New pipeline starting  
**When** Dask cluster created  
**Then** Uses random available port, not hardcoded 8787  
**Test Method:**
```python
cluster = LocalCluster(dashboard_address=':0')  # Auto-assign
print(cluster.dashboard_link)  # Should show random port
```
**Evidence Required:** Log showing random port used

##### AC-4.2.2: Cluster Cleanup on Completion
**Given** Pipeline completes (success or failure)  
**When** Cleanup runs  
**Then** `cluster.close()` and `client.close()` called
**Test Method:**
```python
try:
    run_pipeline()
finally:
    client.close()
    cluster.close()
```
**Evidence Required:** Log showing cleanup message

##### AC-4.2.3: Cluster Cleanup on Exception
**Given** Pipeline raises exception  
**When** Exception propagates  
**Then** Cluster still cleaned up (finally block)  
**Test Method:** Intentionally crash, verify cleanup
**Evidence Required:** Log showing cleanup after crash

##### AC-4.2.4: No Port 8787 Conflicts
**Given** Multiple pipelines run sequentially  
**When** Each starts a new cluster  
**Then** Zero "Port 8787 already in use" warnings  
**Test Method:** Run 3 pipelines in sequence
**Evidence Required:** Logs show no port warnings

---

### Story 4.3: Create Process Cleanup Script

**As a** system administrator  
**I want** a script to clean up orphaned processes  
**So that** I can reset the system to a clean state

#### Acceptance Criteria

##### AC-4.3.1: Cleanup Script Created
**Given** Need to clean orphaned processes  
**When** `scripts/cleanup_processes.sh` run  
**Then** Kills all:
- `python.*Run.*Pipeline`
- `python.*DaskPipelineRunner`
- `dask-worker`
- `dask-scheduler`
**Test Method:** Run script, verify processes gone
**Evidence Required:** ps output before/after

##### AC-4.3.2: Cleanup Logs Actions
**Given** Script runs  
**When** Processes killed  
**Then** Logs each PID killed: `Killed process 12345 (Run2kmBasic.py)`  
**Test Method:** Check script output
**Evidence Required:** Script output log

##### AC-4.3.3: Cleanup Before Pipeline Start
**Given** Daemon about to start new pipeline  
**When** Pre-run checks execute  
**Then** Cleanup script runs first (configurable)  
**Test Method:** Enable cleanup, check logs
**Evidence Required:** Log showing pre-cleanup

##### AC-4.3.4: Safe Mode (Dry Run)
**Given** `--dry-run` flag passed  
**When** Script runs  
**Then** Shows what WOULD be killed without killing  
**Test Method:** `./cleanup_processes.sh --dry-run`
**Evidence Required:** Output showing "Would kill PID 12345"

---

### Story 4.4: Improve DaskSessionManager

**As a** developer using Dask  
**I want** a robust session manager  
**So that** cluster lifecycle is handled automatically

#### Acceptance Criteria

##### AC-4.4.1: Context Manager Support
**Given** DaskSessionManager class  
**When** Used as context manager  
**Then** Automatically cleans up:
```python
with DaskSessionManager() as (client, cluster):
    run_pipeline(client)
# Cleanup automatic here
```
**Test Method:** Use context manager, verify cleanup
**Evidence Required:** Code diff showing implementation

##### AC-4.4.2: Configurable Workers
**Given** Config specifies `n_workers: 4`  
**When** Cluster created  
**Then** Has exactly 4 workers  
**Test Method:** Check `client.scheduler_info()['workers']`
**Evidence Required:** Log showing worker count

##### AC-4.4.3: Memory Limit Per Worker
**Given** Config specifies `memory_limit: 4GB`  
**When** Workers created  
**Then** Each worker limited to 4GB  
**Test Method:** Check worker info
**Evidence Required:** Scheduler info showing limits

##### AC-4.4.4: Graceful Shutdown Timeout
**Given** Cluster being shut down  
**When** Workers busy  
**Then** Waits up to 30 seconds before force kill  
**Test Method:** Shutdown during computation
**Evidence Required:** Log showing graceful shutdown

---

### Story 4.5: Add Pipeline Run Monitoring

**As a** pipeline operator  
**I want** real-time monitoring of pipeline progress  
**So that** I can detect hung or slow pipelines

#### Acceptance Criteria

##### AC-4.5.1: Progress Logging
**Given** Long-running pipeline  
**When** Processing data  
**Then** Logs progress every 30 seconds:
```
[INFO] Progress: 45% complete, 1,234,567 rows processed, ETA: 5 minutes
```
**Test Method:** Run 100km pipeline, check logs
**Evidence Required:** Progress log entries

##### AC-4.5.2: Heartbeat Mechanism
**Given** Pipeline running  
**When** Still active  
**Then** Daemon sees heartbeat file updated  
**Test Method:** 
```bash
# Heartbeat file touched every 30s
ls -la /tmp/pipeline_heartbeat_$PID
```
**Evidence Required:** Heartbeat file timestamp updates

##### AC-4.5.3: Timeout Detection
**Given** Pipeline hung (no progress)  
**When** No heartbeat for 10 minutes  
**Then** Daemon marks job as TIMEOUT and kills it  
**Test Method:** Create artificially hung job
**Evidence Required:** Job status shows TIMEOUT

##### AC-4.5.4: Resource Usage Logging
**Given** Pipeline running  
**When** Periodic check  
**Then** Logs memory and CPU usage:
```
[INFO] Resources: 45% CPU, 8.2GB memory, 12 Dask tasks pending
```
**Test Method:** Check log for resource entries
**Evidence Required:** Resource log lines

---

### Story 4.6: Fix Result File Validation

**As a** researcher reviewing results  
**I want** results automatically validated  
**So that** I know if output files are complete and valid

#### Acceptance Criteria

##### AC-4.6.1: Output File Existence Check
**Given** Pipeline completes  
**When** Post-run validation runs  
**Then** Checks for required files:
- `results/{pipeline_name}.csv`
- `logs/{pipeline_name}.log`
- Confusion matrix images
**Test Method:** Remove a file, check validation fails
**Evidence Required:** Validation error message

##### AC-4.6.2: Results File Content Validation
**Given** Results CSV exists  
**When** Validated  
**Then** Checks:
- Has required columns (Model, accuracy, precision, etc.)
- Has 3 rows (one per classifier)
- Metrics in valid range (0.0 - 1.0)
**Test Method:** Corrupt CSV, check validation fails
**Evidence Required:** Validation output

##### AC-4.6.3: Log File Error Check
**Given** Pipeline completed  
**When** Log validated  
**Then** Checks log for error patterns → warns if found  
**Test Method:** Add ERROR to log, check warning
**Evidence Required:** Warning message

##### AC-4.6.4: Validation Report Generated
**Given** All checks complete  
**When** Report written  
**Then** `results/{pipeline_name}_validation.json` contains:
```json
{
  "pipeline": "basic-2km",
  "status": "VALID",
  "files_checked": 5,
  "errors_found": 0,
  "warnings": [],
  "metrics_summary": {...}
}
```
**Test Method:** Check report contents
**Evidence Required:** Report file screenshot

---

## Testing Requirements

### Testing Framework
- **pytest** for unit tests
- **subprocess** for integration tests
- **Manual validation** for dashboard

### Test Strategy
1. **Unit Tests:** Individual functions
2. **Integration Tests:** Full daemon cycle
3. **Manual Tests:** Dashboard UI

### Test Cases

```python
def test_exit_code_propagation():
    """Crashed pipeline should have non-zero exit code"""
    result = subprocess.run(['python', '-c', 'raise ValueError()'])
    assert result.returncode != 0

def test_dask_cluster_cleanup():
    """Cluster should be closed after pipeline"""
    with DaskSessionManager() as (client, cluster):
        pass  # Pipeline runs here
    # Verify cluster is closed
    assert not cluster.status == 'running'

def test_cleanup_script():
    """Cleanup script should kill target processes"""
    # Start test process
    p = subprocess.Popen(['python', '-c', 'import time; time.sleep(60)'])
    # Run cleanup
    subprocess.run(['./scripts/cleanup_processes.sh'])
    # Verify process killed
    assert p.poll() is not None  # Process terminated
```

---

## Contingency Plans

### What Could Go Wrong

| Issue | Response | Fallback |
|-------|----------|----------|
| Cleanup kills wrong processes | Add process name filtering | Require confirmation |
| Dashboard can't parse logs | Use structured JSON logging | Manual status updates |
| Dask cluster won't close | Force kill workers | Restart system |
| Timeout too aggressive | Make configurable | Increase default |

### If Dashboard Still Shows Wrong Status

1. Add explicit status file written by pipeline
2. Daemon reads status file instead of inferring
3. Use database for job status

---

## Dependencies

### Depends On
- None (infrastructure can be fixed independently)

### Blocks
- **EPIC-5:** Validation runs need reliable infrastructure

---

## Files to Modify

| File | Changes |
|------|---------|
| `PipelineScheduler/daemon.py` | Error detection, status parsing |
| `Helpers/DaskSessionManager.py` | Context manager, port allocation |
| `scripts/cleanup_processes.sh` | NEW - process cleanup |
| `scripts/validate_results.py` | NEW - result validation |
| `Runners/DaskPipelineRunner.py` | Progress logging, heartbeat |

---

## Implementation Details

### Process Cleanup Script

```bash
#!/bin/bash
# scripts/cleanup_processes.sh
# Clean up orphaned pipeline processes

DRY_RUN=false
if [[ "$1" == "--dry-run" ]]; then
    DRY_RUN=true
    echo "DRY RUN MODE - no processes will be killed"
fi

echo "=== Pipeline Process Cleanup ==="
echo "Timestamp: $(date)"

# Patterns to match
PATTERNS=(
    "python.*Run.*Pipeline"
    "python.*DaskPipelineRunner"
    "dask-worker"
    "dask-scheduler"
    "python.*wyoming.*pipeline"
)

for pattern in "${PATTERNS[@]}"; do
    echo ""
    echo "Checking for: $pattern"
    
    pids=$(pgrep -f "$pattern" 2>/dev/null)
    
    if [[ -n "$pids" ]]; then
        for pid in $pids; do
            cmd=$(ps -p $pid -o args= 2>/dev/null)
            if $DRY_RUN; then
                echo "  Would kill PID $pid: $cmd"
            else
                echo "  Killing PID $pid: $cmd"
                kill -TERM $pid 2>/dev/null
            fi
        done
    else
        echo "  No matching processes"
    fi
done

# Wait for graceful shutdown
if ! $DRY_RUN; then
    sleep 2
    
    # Force kill any remaining
    for pattern in "${PATTERNS[@]}"; do
        pids=$(pgrep -f "$pattern" 2>/dev/null)
        if [[ -n "$pids" ]]; then
            for pid in $pids; do
                echo "Force killing PID $pid"
                kill -9 $pid 2>/dev/null
            done
        fi
    done
fi

echo ""
echo "=== Cleanup Complete ==="
```

### Updated DaskSessionManager

```python
# Helpers/DaskSessionManager.py

from dask.distributed import Client, LocalCluster
from contextlib import contextmanager
from Logger.Logger import Logger

logger = Logger("DaskSessionManager")

class DaskSessionManager:
    """Manage Dask cluster lifecycle with automatic cleanup."""
    
    _instance = None
    _client = None
    _cluster = None
    
    def __init__(self, n_workers=4, memory_limit='4GB', dashboard_port=0):
        """
        Initialize Dask cluster.
        
        Args:
            n_workers: Number of workers
            memory_limit: Memory per worker
            dashboard_port: 0 for auto-assign
        """
        self.n_workers = n_workers
        self.memory_limit = memory_limit
        self.dashboard_port = dashboard_port
    
    def __enter__(self):
        """Create and return Dask client and cluster."""
        logger.log(f"Creating Dask cluster: {self.n_workers} workers, {self.memory_limit} each")
        
        self._cluster = LocalCluster(
            n_workers=self.n_workers,
            threads_per_worker=2,
            memory_limit=self.memory_limit,
            dashboard_address=f':{self.dashboard_port}'  # 0 = auto-assign
        )
        
        self._client = Client(self._cluster)
        
        logger.log(f"Dask dashboard: {self._cluster.dashboard_link}")
        
        return self._client, self._cluster
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Clean up cluster on exit."""
        logger.log("Shutting down Dask cluster...")
        
        try:
            if self._client:
                self._client.close(timeout=30)
                logger.log("Client closed")
        except Exception as e:
            logger.log(f"Error closing client: {e}")
        
        try:
            if self._cluster:
                self._cluster.close(timeout=30)
                logger.log("Cluster closed")
        except Exception as e:
            logger.log(f"Error closing cluster: {e}")
        
        self._client = None
        self._cluster = None
        
        logger.log("Dask cleanup complete")
        
        # Don't suppress exceptions
        return False
```

### Error Detection in Daemon

```python
# PipelineScheduler/daemon.py additions

import re
import subprocess

ERROR_PATTERNS = [
    r'ERROR',
    r'Traceback',
    r'Exception',
    r'KeyError',
    r'ValueError',
    r'n_samples=0',
    r'CRITICAL'
]

def detect_errors_in_log(log_path: str) -> tuple[bool, str]:
    """
    Scan log file for error patterns.
    
    Returns:
        (has_errors: bool, first_error: str)
    """
    if not os.path.exists(log_path):
        return False, ""
    
    with open(log_path, 'r') as f:
        content = f.read()
    
    for pattern in ERROR_PATTERNS:
        match = re.search(pattern, content, re.IGNORECASE)
        if match:
            # Get context around match
            start = max(0, match.start() - 100)
            end = min(len(content), match.end() + 200)
            context = content[start:end].strip()
            return True, context
    
    return False, ""

def run_pipeline_with_monitoring(script_path: str, log_path: str) -> dict:
    """
    Run pipeline and detect success/failure properly.
    
    Returns:
        {
            'status': 'COMPLETED' | 'FAILED' | 'TIMEOUT',
            'exit_code': int,
            'error_message': str | None,
            'duration': float
        }
    """
    import time
    start_time = time.time()
    
    # Run subprocess
    result = subprocess.run(
        ['python', script_path],
        capture_output=True,
        text=True,
        timeout=3600 * 4  # 4 hour timeout
    )
    
    duration = time.time() - start_time
    
    # Check exit code
    if result.returncode != 0:
        return {
            'status': 'FAILED',
            'exit_code': result.returncode,
            'error_message': result.stderr[:500] if result.stderr else 'Non-zero exit code',
            'duration': duration
        }
    
    # Check log for errors
    has_errors, error_context = detect_errors_in_log(log_path)
    if has_errors:
        return {
            'status': 'FAILED',
            'exit_code': 0,  # Exit was 0 but had errors
            'error_message': error_context,
            'duration': duration
        }
    
    return {
        'status': 'COMPLETED',
        'exit_code': 0,
        'error_message': None,
        'duration': duration
    }
```

---

## Estimated Effort

| Task | Hours |
|------|-------|
| Dashboard error detection | 3 |
| DaskSessionManager update | 2 |
| Cleanup script | 1 |
| Progress/heartbeat logging | 2 |
| Result validation script | 2 |
| Testing | 3 |
| Documentation | 1 |
| **Total** | **14 hours** |

---

## Success Metrics

1. ✅ Dashboard accurately shows FAILED for crashed jobs
2. ✅ Zero "Port 8787 already in use" warnings
3. ✅ Cleanup script kills all orphaned processes
4. ✅ Dask clusters always cleaned up (even on crash)
5. ✅ Results validation catches incomplete outputs
6. ✅ Progress logging works for long pipelines
