#!/usr/bin/env python3
"""
Autonomous Pipeline Executor for ConnectedDrivingPipelineV4

Executes 36 pipelines across 3 phases:
- Phase 1: 12 x 2km pipelines (~30 min)
- Phase 2: 12 x 100km pipelines (~1-2 hours)
- Phase 3: 12 x 200km pipelines (~2-3 hours)

Features:
- Sequential execution with log auditing
- Progress tracking in JSON
- Auto-retry on failure (max 3)
- Slack updates at key milestones
"""

import subprocess
import json
import os
import sys
import time
import re
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Tuple

# Configuration
REPO_PATH = "/home/ubuntu/repos/ConnectedDrivingPipelineV4"
VENV_ACTIVATE = f"source {REPO_PATH}/.venv/bin/activate"
PROGRESS_FILE = Path(__file__).parent / "pipeline_progress.json"
SLACK_CHANNEL = "C0ABAU26S6N"
SLACK_THREAD = "1771904073.130349"
MAX_RETRIES = 3

# Pipeline definitions
PIPELINES = [
    # Phase 1: 2km (12 pipelines)
    {"id": 1, "name": "basic_2km_const", "phase": 1, "radius": "2km", "features": "Basic (3)", "attack": "const_offset_per_id", "script": "Run2kmBasicConst.py"},
    {"id": 2, "name": "basic_2km_rand", "phase": 1, "radius": "2km", "features": "Basic (3)", "attack": "rand_offset", "script": "Run2kmBasicRand.py"},
    {"id": 3, "name": "basic_2km_withid_const", "phase": 1, "radius": "2km", "features": "Basic+ID (4)", "attack": "const_offset_per_id", "script": "Run2kmBasicWithIdConst.py"},
    {"id": 4, "name": "basic_2km_withid_rand", "phase": 1, "radius": "2km", "features": "Basic+ID (4)", "attack": "rand_offset", "script": "Run2kmBasicWithIdRand.py"},
    {"id": 5, "name": "movement_2km_const", "phase": 1, "radius": "2km", "features": "Movement (5)", "attack": "const_offset_per_id", "script": "Run2kmMovementConst.py"},
    {"id": 6, "name": "movement_2km_rand", "phase": 1, "radius": "2km", "features": "Movement (5)", "attack": "rand_offset", "script": "Run2kmMovementRand.py"},
    {"id": 7, "name": "movement_2km_withid_const", "phase": 1, "radius": "2km", "features": "Movement+ID (6)", "attack": "const_offset_per_id", "script": "Run2kmMovementWithIdConst.py"},
    {"id": 8, "name": "movement_2km_withid_rand", "phase": 1, "radius": "2km", "features": "Movement+ID (6)", "attack": "rand_offset", "script": "Run2kmMovementWithIdRand.py"},
    {"id": 9, "name": "extended_2km_const", "phase": 1, "radius": "2km", "features": "Extended (6)", "attack": "const_offset_per_id", "script": "Run2kmExtendedConst.py"},
    {"id": 10, "name": "extended_2km_rand", "phase": 1, "radius": "2km", "features": "Extended (6)", "attack": "rand_offset", "script": "Run2kmExtendedRand.py"},
    {"id": 11, "name": "extended_2km_withid_const", "phase": 1, "radius": "2km", "features": "Extended+ID (7)", "attack": "const_offset_per_id", "script": "Run2kmExtendedWithIdConst.py"},
    {"id": 12, "name": "extended_2km_withid_rand", "phase": 1, "radius": "2km", "features": "Extended+ID (7)", "attack": "rand_offset", "script": "Run2kmExtendedWithIdRand.py"},
    
    # Phase 2: 100km (12 pipelines)
    {"id": 13, "name": "basic_100km_const", "phase": 2, "radius": "100km", "features": "Basic (3)", "attack": "const_offset_per_id", "script": "Run100kmBasicConst.py"},
    {"id": 14, "name": "basic_100km_rand", "phase": 2, "radius": "100km", "features": "Basic (3)", "attack": "rand_offset", "script": "Run100kmBasicRand.py"},
    {"id": 15, "name": "basic_100km_withid_const", "phase": 2, "radius": "100km", "features": "Basic+ID (4)", "attack": "const_offset_per_id", "script": "Run100kmBasicWithIdConst.py"},
    {"id": 16, "name": "basic_100km_withid_rand", "phase": 2, "radius": "100km", "features": "Basic+ID (4)", "attack": "rand_offset", "script": "Run100kmBasicWithIdRand.py"},
    {"id": 17, "name": "movement_100km_const", "phase": 2, "radius": "100km", "features": "Movement (5)", "attack": "const_offset_per_id", "script": "Run100kmMovementConst.py"},
    {"id": 18, "name": "movement_100km_rand", "phase": 2, "radius": "100km", "features": "Movement (5)", "attack": "rand_offset", "script": "Run100kmMovementRand.py"},
    {"id": 19, "name": "movement_100km_withid_const", "phase": 2, "radius": "100km", "features": "Movement+ID (6)", "attack": "const_offset_per_id", "script": "Run100kmMovementWithIdConst.py"},
    {"id": 20, "name": "movement_100km_withid_rand", "phase": 2, "radius": "100km", "features": "Movement+ID (6)", "attack": "rand_offset", "script": "Run100kmMovementWithIdRand.py"},
    {"id": 21, "name": "extended_100km_const", "phase": 2, "radius": "100km", "features": "Extended (6)", "attack": "const_offset_per_id", "script": "Run100kmExtendedConst.py"},
    {"id": 22, "name": "extended_100km_rand", "phase": 2, "radius": "100km", "features": "Extended (6)", "attack": "rand_offset", "script": "Run100kmExtendedRand.py"},
    {"id": 23, "name": "extended_100km_withid_const", "phase": 2, "radius": "100km", "features": "Extended+ID (7)", "attack": "const_offset_per_id", "script": "Run100kmExtendedWithIdConst.py"},
    {"id": 24, "name": "extended_100km_withid_rand", "phase": 2, "radius": "100km", "features": "Extended+ID (7)", "attack": "rand_offset", "script": "Run100kmExtendedWithIdRand.py"},
    
    # Phase 3: 200km (12 pipelines)
    {"id": 25, "name": "basic_200km_const", "phase": 3, "radius": "200km", "features": "Basic (3)", "attack": "const_offset_per_id", "script": "Run200kmBasicConst.py"},
    {"id": 26, "name": "basic_200km_rand", "phase": 3, "radius": "200km", "features": "Basic (3)", "attack": "rand_offset", "script": "Run200kmBasicRand.py"},
    {"id": 27, "name": "basic_200km_withid_const", "phase": 3, "radius": "200km", "features": "Basic+ID (4)", "attack": "const_offset_per_id", "script": "Run200kmBasicWithIdConst.py"},
    {"id": 28, "name": "basic_200km_withid_rand", "phase": 3, "radius": "200km", "features": "Basic+ID (4)", "attack": "rand_offset", "script": "Run200kmBasicWithIdRand.py"},
    {"id": 29, "name": "movement_200km_const", "phase": 3, "radius": "200km", "features": "Movement (5)", "attack": "const_offset_per_id", "script": "Run200kmMovementConst.py"},
    {"id": 30, "name": "movement_200km_rand", "phase": 3, "radius": "200km", "features": "Movement (5)", "attack": "rand_offset", "script": "Run200kmMovementRand.py"},
    {"id": 31, "name": "movement_200km_withid_const", "phase": 3, "radius": "200km", "features": "Movement+ID (6)", "attack": "const_offset_per_id", "script": "Run200kmMovementWithIdConst.py"},
    {"id": 32, "name": "movement_200km_withid_rand", "phase": 3, "radius": "200km", "features": "Movement+ID (6)", "attack": "rand_offset", "script": "Run200kmMovementWithIdRand.py"},
    {"id": 33, "name": "extended_200km_const", "phase": 3, "radius": "200km", "features": "Extended (6)", "attack": "const_offset_per_id", "script": "Run200kmExtendedConst.py"},
    {"id": 34, "name": "extended_200km_rand", "phase": 3, "radius": "200km", "features": "Extended (6)", "attack": "rand_offset", "script": "Run200kmExtendedRand.py"},
    {"id": 35, "name": "extended_200km_withid_const", "phase": 3, "radius": "200km", "features": "Extended+ID (7)", "attack": "const_offset_per_id", "script": "Run200kmExtendedWithIdConst.py"},
    {"id": 36, "name": "extended_200km_withid_rand", "phase": 3, "radius": "200km", "features": "Extended+ID (7)", "attack": "rand_offset", "script": "Run200kmExtendedWithIdRand.py"},
]


def load_progress() -> Dict:
    """Load progress from JSON file."""
    if PROGRESS_FILE.exists():
        with open(PROGRESS_FILE) as f:
            return json.load(f)
    return {
        "started_at": None,
        "last_updated": None,
        "current_pipeline": 0,
        "current_phase": 0,
        "pipelines": {},
        "phase_summaries": {},
        "total_completed": 0,
        "total_failed": 0
    }


def save_progress(progress: Dict):
    """Save progress to JSON file."""
    progress["last_updated"] = datetime.now().isoformat()
    with open(PROGRESS_FILE, 'w') as f:
        json.dump(progress, f, indent=2)


def run_ssh_command(command: str, timeout: int = 3600) -> Tuple[int, str, str]:
    """Run command via SSH on jaekel."""
    ssh_cmd = f'ssh jaekel "{command}"'
    try:
        result = subprocess.run(
            ssh_cmd,
            shell=True,
            capture_output=True,
            text=True,
            timeout=timeout
        )
        return result.returncode, result.stdout, result.stderr
    except subprocess.TimeoutExpired:
        return -1, "", "Command timed out"
    except Exception as e:
        return -1, "", str(e)


def execute_pipeline(pipeline: Dict, progress: Dict) -> Dict:
    """Execute a single pipeline and audit logs."""
    name = pipeline["name"]
    script = pipeline["script"]
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    log_file = f"logs/{name}_{timestamp}.log"
    
    result = {
        "name": name,
        "started_at": datetime.now().isoformat(),
        "log_file": log_file,
        "status": "running",
        "attempts": 0,
        "accuracy": None,
        "rows": None,
        "duration_seconds": None,
        "errors": []
    }
    
    for attempt in range(1, MAX_RETRIES + 1):
        result["attempts"] = attempt
        start_time = time.time()
        
        print(f"\n{'='*60}")
        print(f"Pipeline {pipeline['id']}/36: {name} (Attempt {attempt}/{MAX_RETRIES})")
        print(f"Phase: {pipeline['phase']} | Radius: {pipeline['radius']} | Attack: {pipeline['attack']}")
        print(f"{'='*60}")
        
        # Execute pipeline
        cmd = f"""
        cd {REPO_PATH} && \\
        {VENV_ACTIVATE} && \\
        python production_configs_v2/{script} 2>&1 | tee {log_file}
        """
        
        returncode, stdout, stderr = run_ssh_command(cmd.replace('\n', ' '))
        
        duration = time.time() - start_time
        result["duration_seconds"] = round(duration, 2)
        result["completed_at"] = datetime.now().isoformat()
        
        # Audit the log
        audit_result = audit_log(name, log_file)
        result["accuracy"] = audit_result.get("accuracy")
        result["rows"] = audit_result.get("rows")
        result["has_errors"] = audit_result.get("has_errors", False)
        result["errors"] = audit_result.get("errors", [])
        
        if returncode == 0 and not result["has_errors"]:
            result["status"] = "success"
            print(f"✅ Pipeline {name} completed successfully in {duration:.1f}s")
            break
        else:
            print(f"❌ Pipeline {name} failed (attempt {attempt})")
            if result["errors"]:
                print(f"   Errors: {result['errors'][:3]}")
            
            if attempt < MAX_RETRIES:
                print(f"   Retrying in 30 seconds...")
                # Cleanup before retry
                cleanup_failed_pipeline(name)
                time.sleep(30)
            else:
                result["status"] = "failed"
    
    return result


def audit_log(name: str, log_file: str) -> Dict:
    """Audit a pipeline log file for errors and results."""
    cmd = f"""
    cd {REPO_PATH}
    LOG="{log_file}"
    
    if [ ! -f "$LOG" ]; then
        echo "LOG_NOT_FOUND"
        exit 1
    fi
    
    echo "=== ERRORS ==="
    grep -iE "error|exception|failed|traceback|oom|killed" "$LOG" | head -5 || echo "NO_ERRORS"
    
    echo "=== ACCURACY ==="
    grep -iE "accuracy|precision|recall|f1" "$LOG" | tail -3 || echo "NO_ACCURACY"
    
    echo "=== ROWS ==="
    grep -iE "rows|records|loaded|filtered" "$LOG" | tail -3 || echo "NO_ROWS"
    
    echo "=== RESULTS ==="
    ls results/matrix/{name}/ 2>/dev/null | head -5 || echo "NO_RESULTS_DIR"
    """
    
    _, stdout, _ = run_ssh_command(cmd)
    
    result = {
        "has_errors": False,
        "errors": [],
        "accuracy": None,
        "rows": None
    }
    
    if "LOG_NOT_FOUND" in stdout:
        result["has_errors"] = True
        result["errors"].append("Log file not found")
        return result
    
    # Parse errors
    if "=== ERRORS ===" in stdout:
        error_section = stdout.split("=== ERRORS ===")[1].split("===")[0]
        if "NO_ERRORS" not in error_section:
            result["has_errors"] = True
            result["errors"] = [line.strip() for line in error_section.strip().split('\n') if line.strip()]
    
    # Parse accuracy
    accuracy_match = re.search(r'accuracy[:\s]+([0-9.]+)', stdout, re.IGNORECASE)
    if accuracy_match:
        result["accuracy"] = float(accuracy_match.group(1))
    
    # Parse row counts
    rows_match = re.search(r'(\d{3,})\s*rows', stdout, re.IGNORECASE)
    if rows_match:
        result["rows"] = int(rows_match.group(1))
    
    return result


def cleanup_failed_pipeline(name: str):
    """Cleanup after a failed pipeline attempt."""
    cmd = f"""
    pkill -f "{name}" 2>/dev/null || true
    pkill -f dask 2>/dev/null || true
    rm -rf {REPO_PATH}/cache/matrix/{name}/ 2>/dev/null || true
    sync
    """
    run_ssh_command(cmd)


def post_slack_update(message: str):
    """Post update to Slack thread."""
    # Write message to a temp file for the main agent to pick up
    update_file = PROGRESS_FILE.parent / "slack_update.txt"
    with open(update_file, 'w') as f:
        f.write(f"SLACK_UPDATE|{SLACK_CHANNEL}|{SLACK_THREAD}|{message}")
    print(f"\n📢 Slack update queued: {message[:100]}...")


def run_preflight() -> bool:
    """Run pre-flight checks."""
    print("\n" + "="*60)
    print("PHASE 0: PRE-FLIGHT CHECKS")
    print("="*60)
    
    checks = [
        ("SSH Connection", "echo 'connected'"),
        ("Configs Exist", f"ls {REPO_PATH}/production_configs_v2/*.json | wc -l"),
        ("Run Scripts Fixed", f"grep -l 'production_configs_v2/' {REPO_PATH}/production_configs_v2/Run*.py | wc -l"),
        ("No Orphan Processes", "pgrep -fa dask || echo 'clean'"),
        ("Disk Space", "df -h /home/ubuntu | tail -1"),
        ("Memory", "free -h | grep Mem"),
    ]
    
    all_passed = True
    for name, cmd in checks:
        _, stdout, stderr = run_ssh_command(cmd)
        output = stdout.strip() or stderr.strip()
        
        # Validate
        passed = True
        if name == "SSH Connection" and "connected" not in output:
            passed = False
        elif name == "Configs Exist" and output != "36":
            passed = False
        elif name == "Run Scripts Fixed" and output != "36":
            passed = False
        
        status = "✅" if passed else "❌"
        print(f"  {status} {name}: {output[:60]}")
        
        if not passed:
            all_passed = False
    
    return all_passed


def main():
    """Main execution loop."""
    progress = load_progress()
    
    # Initialize if fresh start
    if not progress["started_at"]:
        progress["started_at"] = datetime.now().isoformat()
        save_progress(progress)
    
    print("\n" + "="*60)
    print("CONNECTEDPRIVINGPIPELINEV4 - AUTONOMOUS EXECUTOR")
    print(f"Total Pipelines: 36 | Phases: 3")
    print(f"Started: {progress['started_at']}")
    print("="*60)
    
    # Run preflight
    if progress["current_pipeline"] == 0:
        if not run_preflight():
            print("\n❌ Pre-flight checks failed! Fix issues and retry.")
            sys.exit(1)
        post_slack_update("🚀 Pre-flight checks complete! Starting Phase 1 (2km pipelines)...")
        progress["current_phase"] = 1
        save_progress(progress)
    
    # Execute pipelines
    current_phase = 0
    for pipeline in PIPELINES:
        pid = pipeline["id"]
        
        # Skip completed pipelines
        if str(pid) in progress["pipelines"] and progress["pipelines"][str(pid)].get("status") == "success":
            print(f"\n⏭️  Skipping {pipeline['name']} (already completed)")
            continue
        
        # Phase transition
        if pipeline["phase"] != current_phase:
            current_phase = pipeline["phase"]
            if current_phase > 1:
                # Summarize previous phase
                prev_phase_pipelines = [p for p in progress["pipelines"].values() if p.get("phase") == current_phase - 1]
                success_count = len([p for p in prev_phase_pipelines if p.get("status") == "success"])
                post_slack_update(f"✅ Phase {current_phase - 1} Complete: {success_count}/12 pipelines | Starting Phase {current_phase}...")
            progress["current_phase"] = current_phase
            save_progress(progress)
        
        # Execute pipeline
        progress["current_pipeline"] = pid
        save_progress(progress)
        
        result = execute_pipeline(pipeline, progress)
        result["phase"] = pipeline["phase"]
        progress["pipelines"][str(pid)] = result
        
        if result["status"] == "success":
            progress["total_completed"] += 1
        else:
            progress["total_failed"] += 1
        
        save_progress(progress)
        
        # Small delay between pipelines
        time.sleep(5)
    
    # Final summary
    print("\n" + "="*60)
    print("🎉 ALL PIPELINES COMPLETE!")
    print("="*60)
    
    total_time = datetime.now() - datetime.fromisoformat(progress["started_at"])
    
    summary = f"""🎉 **ALL 36 PIPELINES COMPLETE!**

| Phase | Radius | Success | Failed |
|-------|--------|---------|--------|
| 1     | 2km    | {len([p for p in progress['pipelines'].values() if p.get('phase') == 1 and p.get('status') == 'success'])}/12 | {len([p for p in progress['pipelines'].values() if p.get('phase') == 1 and p.get('status') != 'success'])}/12 |
| 2     | 100km  | {len([p for p in progress['pipelines'].values() if p.get('phase') == 2 and p.get('status') == 'success'])}/12 | {len([p for p in progress['pipelines'].values() if p.get('phase') == 2 and p.get('status') != 'success'])}/12 |
| 3     | 200km  | {len([p for p in progress['pipelines'].values() if p.get('phase') == 3 and p.get('status') == 'success'])}/12 | {len([p for p in progress['pipelines'].values() if p.get('phase') == 3 and p.get('status') != 'success'])}/12 |

Total time: {total_time}
Results: {REPO_PATH}/results/matrix/"""
    
    post_slack_update(summary)
    print(summary)


if __name__ == "__main__":
    main()
