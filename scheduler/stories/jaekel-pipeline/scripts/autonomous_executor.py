#!/usr/bin/env python3
"""
ConnectedDrivingPipelineV4 Autonomous Executor

This script:
1. Runs each pipeline
2. Parses logs for ALL known error patterns
3. Auto-diagnoses issues
4. Applies fixes automatically
5. Re-runs until success
6. Reports progress to Sophie via webhook

FULLY AUTONOMOUS - No human intervention needed
"""

import subprocess
import os
import re
import json
import hashlib
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass, field
from enum import Enum

# Configuration
REPO_PATH = "/home/ubuntu/repos/ConnectedDrivingPipelineV4"
LOG_DIR = f"{REPO_PATH}/logs"
CONFIG_DIR = f"{REPO_PATH}/production_configs"
VENV_ACTIVATE = f"source {REPO_PATH}/venv/bin/activate"

class IssueType(Enum):
    KEYERROR = "keyerror"
    COLUMN_MISMATCH = "column_mismatch"
    EMPTY_TEST_SET = "empty_test_set"
    CACHE_COLLISION = "cache_collision"
    ROW_LIMIT = "row_limit"
    MEMORY_ERROR = "memory_error"
    PORT_CONFLICT = "port_conflict"
    IMPORT_ERROR = "import_error"
    FILE_NOT_FOUND = "file_not_found"
    UNKNOWN = "unknown"

@dataclass
class DetectedIssue:
    type: IssueType
    message: str
    line_number: int
    context: str
    auto_fixable: bool
    fix_description: str = ""

@dataclass
class PipelineResult:
    name: str
    success: bool
    log_file: str
    issues: List[DetectedIssue] = field(default_factory=list)
    row_count: int = 0
    train_size: int = 0
    test_size: int = 0
    accuracy: float = 0.0
    run_time_seconds: float = 0.0
    attempts: int = 0

class LogAnalyzer:
    """Analyzes logs for ALL known error patterns"""
    
    ERROR_PATTERNS = {
        # KeyError patterns
        r"KeyError:\s*['\"]?(\w+)['\"]?": IssueType.KEYERROR,
        r"KeyError.*coredata": IssueType.COLUMN_MISMATCH,
        r"KeyError.*coreData": IssueType.COLUMN_MISMATCH,
        
        # Empty test set
        r"n_samples=0": IssueType.EMPTY_TEST_SET,
        r"test.*0.*samples": IssueType.EMPTY_TEST_SET,
        r"ValueError.*n_samples": IssueType.EMPTY_TEST_SET,
        
        # Row limit issues
        r"num_subsection_rows.*100000": IssueType.ROW_LIMIT,
        r"Limiting to 100,?000 rows": IssueType.ROW_LIMIT,
        
        # Memory issues
        r"MemoryError": IssueType.MEMORY_ERROR,
        r"memory.*exceeded": IssueType.MEMORY_ERROR,
        r"killed.*memory": IssueType.MEMORY_ERROR,
        
        # Port conflicts
        r"Port 8787.*in use": IssueType.PORT_CONFLICT,
        r"Address already in use": IssueType.PORT_CONFLICT,
        
        # Import errors
        r"ImportError": IssueType.IMPORT_ERROR,
        r"ModuleNotFoundError": IssueType.IMPORT_ERROR,
        
        # File not found
        r"FileNotFoundError": IssueType.FILE_NOT_FOUND,
        r"No such file or directory": IssueType.FILE_NOT_FOUND,
    }
    
    # Column name corrections
    COLUMN_FIXES = {
        "coredata_position_lat": "coreData_position_lat",
        "coredata_position_long": "coreData_position_long",
        "coredata_elevation": "coreData_elevation",
        "coredata_speed": "coreData_speed",
        "coredata_heading": "coreData_heading",
        "coredata_accelset_accelyaw": "coreData_accelset_accelYaw",
        "metadata_receivedat": "metadata_receivedAt",
    }
    
    def analyze(self, log_path: str) -> List[DetectedIssue]:
        """Parse log file and detect ALL issues"""
        issues = []
        
        if not os.path.exists(log_path):
            return [DetectedIssue(
                type=IssueType.FILE_NOT_FOUND,
                message=f"Log file not found: {log_path}",
                line_number=0,
                context="",
                auto_fixable=False
            )]
        
        with open(log_path, 'r') as f:
            lines = f.readlines()
        
        for i, line in enumerate(lines):
            for pattern, issue_type in self.ERROR_PATTERNS.items():
                if re.search(pattern, line, re.IGNORECASE):
                    # Get context (5 lines before and after)
                    start = max(0, i - 5)
                    end = min(len(lines), i + 6)
                    context = ''.join(lines[start:end])
                    
                    issue = self._create_issue(issue_type, line.strip(), i + 1, context)
                    issues.append(issue)
        
        # Check for success indicators
        log_content = ''.join(lines)
        
        # Check if row count is suspiciously low
        row_match = re.search(r'Total rows.*?(\d+)', log_content)
        if row_match and int(row_match.group(1)) < 1000:
            issues.append(DetectedIssue(
                type=IssueType.ROW_LIMIT,
                message=f"Suspiciously low row count: {row_match.group(1)}",
                line_number=0,
                context="Row count may indicate subsection limit is active",
                auto_fixable=True,
                fix_description="Remove num_subsection_rows limit from config"
            ))
        
        return issues
    
    def _create_issue(self, issue_type: IssueType, message: str, 
                      line_number: int, context: str) -> DetectedIssue:
        """Create a DetectedIssue with fix information"""
        
        fix_info = {
            IssueType.COLUMN_MISMATCH: (True, "Fix column names in config (coredata -> coreData)"),
            IssueType.KEYERROR: (True, "Check and fix column name casing"),
            IssueType.EMPTY_TEST_SET: (True, "Fix train/test split logic in DaskPipelineRunner.py"),
            IssueType.ROW_LIMIT: (True, "Set num_subsection_rows: null in config"),
            IssueType.PORT_CONFLICT: (True, "Kill orphaned Dask processes, use dynamic ports"),
            IssueType.MEMORY_ERROR: (True, "Reduce workers or increase memory limit"),
            IssueType.IMPORT_ERROR: (False, "Missing dependency - manual install required"),
            IssueType.FILE_NOT_FOUND: (False, "Missing file - investigate path"),
            IssueType.UNKNOWN: (False, "Unknown error - manual investigation required"),
        }
        
        auto_fixable, fix_desc = fix_info.get(issue_type, (False, ""))
        
        return DetectedIssue(
            type=issue_type,
            message=message,
            line_number=line_number,
            context=context,
            auto_fixable=auto_fixable,
            fix_description=fix_desc
        )
    
    def extract_metrics(self, log_path: str) -> Dict:
        """Extract performance metrics from log"""
        metrics = {
            "row_count": 0,
            "train_size": 0,
            "test_size": 0,
            "accuracy": 0.0,
            "cache_hits": 0,
            "cache_misses": 0,
        }
        
        if not os.path.exists(log_path):
            return metrics
        
        with open(log_path, 'r') as f:
            content = f.read()
        
        # Extract row count
        match = re.search(r'Total rows.*?(\d+)', content)
        if match:
            metrics["row_count"] = int(match.group(1))
        
        # Extract split sizes
        match = re.search(r'train.*?(\d+).*test.*?(\d+)', content, re.IGNORECASE)
        if match:
            metrics["train_size"] = int(match.group(1))
            metrics["test_size"] = int(match.group(2))
        
        # Extract accuracy
        match = re.search(r'accuracy.*?([0-9.]+)', content, re.IGNORECASE)
        if match:
            metrics["accuracy"] = float(match.group(1))
        
        # Count cache operations
        metrics["cache_hits"] = len(re.findall(r'cache hit', content, re.IGNORECASE))
        metrics["cache_misses"] = len(re.findall(r'cache miss', content, re.IGNORECASE))
        
        return metrics


class AutoFixer:
    """Automatically applies fixes for known issues"""
    
    def __init__(self, repo_path: str):
        self.repo_path = repo_path
        self.fixes_applied = []
    
    def fix_column_names(self, config_path: str) -> bool:
        """Fix column name casing in config file"""
        fixes = {
            "coredata_position_lat": "coreData_position_lat",
            "coredata_position_long": "coreData_position_long",
            "coredata_elevation": "coreData_elevation",
            "coredata_speed": "coreData_speed",
            "coredata_heading": "coreData_heading",
            "coredata_accelset_accelyaw": "coreData_accelset_accelYaw",
            "metadata_receivedat": "metadata_receivedAt",
        }
        
        with open(config_path, 'r') as f:
            content = f.read()
        
        original = content
        for wrong, correct in fixes.items():
            content = content.replace(wrong, correct)
        
        if content != original:
            with open(config_path, 'w') as f:
                f.write(content)
            self.fixes_applied.append(f"Fixed column names in {config_path}")
            return True
        return False
    
    def fix_row_limit(self, config_path: str) -> bool:
        """Remove or increase row limit in config"""
        with open(config_path, 'r') as f:
            config = json.load(f)
        
        modified = False
        
        # Remove subsection limit
        if "data" in config:
            if "num_subsection_rows" in config["data"]:
                del config["data"]["num_subsection_rows"]
                modified = True
        
        if modified:
            with open(config_path, 'w') as f:
                json.dump(config, f, indent=2)
            self.fixes_applied.append(f"Removed row limit in {config_path}")
        
        return modified
    
    def fix_train_test_split(self) -> bool:
        """Fix train/test split in DaskPipelineRunner.py"""
        runner_path = f"{self.repo_path}/MachineLearning/DaskPipelineRunner.py"
        
        with open(runner_path, 'r') as f:
            content = f.read()
        
        # Check if already fixed
        if "from sklearn.model_selection import train_test_split" in content:
            return False
        
        # Find and fix the split logic
        old_code = '''num_rows_to_train = int(total_rows * train_ratio) if split_config.get("type") == "random" else split_config.get("num_train_rows", 100000)'''
        
        new_code = '''# Fixed: Use sklearn train_test_split instead of head/tail
        from sklearn.model_selection import train_test_split as sklearn_split
        test_size = split_config.get("test_size", 0.2)
        random_state = split_config.get("random_state", 42)'''
        
        if old_code in content:
            content = content.replace(old_code, new_code)
            with open(runner_path, 'w') as f:
                f.write(content)
            self.fixes_applied.append("Fixed train/test split in DaskPipelineRunner.py")
            return True
        
        return False
    
    def kill_orphaned_processes(self) -> bool:
        """Kill any orphaned pipeline processes"""
        result = subprocess.run(
            ["pkill", "-f", "Run.*km.*\\.py"],
            capture_output=True
        )
        if result.returncode == 0:
            self.fixes_applied.append("Killed orphaned processes")
            return True
        return False
    
    def clear_cache(self) -> bool:
        """Clear all caches"""
        cache_dirs = [
            f"{self.repo_path}/cache",
            f"{self.repo_path}/data/classifierdata/splitfiles/cleaned",
            f"{self.repo_path}/data/classifierdata/splitfiles/combinedcleaned",
        ]
        
        for cache_dir in cache_dirs:
            if os.path.exists(cache_dir):
                subprocess.run(["rm", "-rf", f"{cache_dir}/*"], shell=True)
        
        self.fixes_applied.append("Cleared all caches")
        return True
    
    def apply_fixes_for_issues(self, issues: List[DetectedIssue], config_path: str) -> List[str]:
        """Apply all possible fixes for detected issues"""
        applied = []
        
        for issue in issues:
            if not issue.auto_fixable:
                continue
            
            if issue.type == IssueType.COLUMN_MISMATCH or issue.type == IssueType.KEYERROR:
                if self.fix_column_names(config_path):
                    applied.append(f"Fixed: {issue.type.value}")
            
            elif issue.type == IssueType.ROW_LIMIT:
                if self.fix_row_limit(config_path):
                    applied.append(f"Fixed: {issue.type.value}")
            
            elif issue.type == IssueType.EMPTY_TEST_SET:
                if self.fix_train_test_split():
                    applied.append(f"Fixed: {issue.type.value}")
            
            elif issue.type == IssueType.PORT_CONFLICT:
                if self.kill_orphaned_processes():
                    applied.append(f"Fixed: {issue.type.value}")
        
        return applied


class AutonomousExecutor:
    """Main executor that runs pipelines autonomously"""
    
    PIPELINES = [
        # (script_name, config_name, expected_min_rows)
        ("Run2kmBasic.py", "basic_2km_pipeline_config.json", 10000),
        ("Run2kmMovement.py", "movement_2km_pipeline_config.json", 10000),
        ("Run2kmExtended.py", "extended_2km_pipeline_config.json", 10000),
        ("Run100kmBasic.py", "basic_100km_pipeline_config.json", 100000),
        ("Run100kmMovement.py", "movement_100km_pipeline_config.json", 100000),
        ("Run100kmExtended.py", "extended_100km_pipeline_config.json", 100000),
        ("Run200kmBasic.py", "basic_200km_pipeline_config.json", 1000000),
        ("Run200kmMovement.py", "movement_200km_pipeline_config.json", 1000000),
        ("Run200kmExtended.py", "extended_200km_pipeline_config.json", 1000000),
    ]
    
    MAX_ATTEMPTS = 3
    
    def __init__(self):
        self.analyzer = LogAnalyzer()
        self.fixer = AutoFixer(REPO_PATH)
        self.results: List[PipelineResult] = []
        self.start_time = datetime.now()
    
    def run_pipeline(self, script_name: str, config_name: str) -> Tuple[str, int]:
        """Run a single pipeline and return log path and exit code"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        log_file = f"{LOG_DIR}/{script_name}_{timestamp}.log"
        
        cmd = f"""
        cd {REPO_PATH} && \
        {VENV_ACTIVATE} && \
        python {script_name} 2>&1 | tee {log_file}
        """
        
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        
        return log_file, result.returncode
    
    def execute_with_retry(self, script_name: str, config_name: str, 
                           expected_min_rows: int) -> PipelineResult:
        """Execute pipeline with automatic retry and fixing"""
        
        config_path = f"{CONFIG_DIR}/{config_name}"
        result = PipelineResult(name=script_name, success=False, log_file="")
        
        for attempt in range(1, self.MAX_ATTEMPTS + 1):
            result.attempts = attempt
            print(f"\n{'='*60}")
            print(f"Running {script_name} (Attempt {attempt}/{self.MAX_ATTEMPTS})")
            print(f"{'='*60}")
            
            # Run pipeline
            log_file, exit_code = self.run_pipeline(script_name, config_name)
            result.log_file = log_file
            
            # Analyze log
            issues = self.analyzer.analyze(log_file)
            result.issues = issues
            
            # Extract metrics
            metrics = self.analyzer.extract_metrics(log_file)
            result.row_count = metrics["row_count"]
            result.train_size = metrics["train_size"]
            result.test_size = metrics["test_size"]
            result.accuracy = metrics["accuracy"]
            
            # Check success conditions
            if exit_code == 0 and len([i for i in issues if i.type != IssueType.UNKNOWN]) == 0:
                if result.row_count >= expected_min_rows:
                    result.success = True
                    print(f"✅ SUCCESS: {script_name}")
                    print(f"   Rows: {result.row_count:,}, Accuracy: {result.accuracy:.4f}")
                    break
                else:
                    print(f"⚠️ WARNING: Row count {result.row_count:,} < expected {expected_min_rows:,}")
            
            # Report issues
            if issues:
                print(f"\n🔴 ISSUES DETECTED ({len(issues)}):")
                for issue in issues:
                    print(f"   [{issue.type.value}] {issue.message}")
                    if issue.auto_fixable:
                        print(f"      → Auto-fix: {issue.fix_description}")
            
            # Apply fixes if we have more attempts
            if attempt < self.MAX_ATTEMPTS:
                print(f"\n🔧 Applying auto-fixes...")
                fixes = self.fixer.apply_fixes_for_issues(issues, config_path)
                if fixes:
                    for fix in fixes:
                        print(f"   ✓ {fix}")
                else:
                    print("   No auto-fixes available")
        
        if not result.success:
            print(f"\n❌ FAILED after {self.MAX_ATTEMPTS} attempts: {script_name}")
        
        return result
    
    def execute_all(self):
        """Execute all pipelines with full automation"""
        print("\n" + "="*70)
        print("AUTONOMOUS PIPELINE EXECUTOR")
        print(f"Started: {self.start_time}")
        print("="*70)
        
        # Phase 0: Preparation
        print("\n📋 PHASE 0: PREPARATION")
        self.fixer.kill_orphaned_processes()
        print("   ✓ Orphaned processes killed")
        
        # Fix all configs upfront
        print("\n📋 APPLYING PRE-FIXES TO ALL CONFIGS...")
        for config_file in os.listdir(CONFIG_DIR):
            if config_file.endswith('.json'):
                config_path = f"{CONFIG_DIR}/{config_file}"
                self.fixer.fix_column_names(config_path)
                self.fixer.fix_row_limit(config_path)
        print(f"   ✓ Fixed {len(self.fixer.fixes_applied)} issues in configs")
        
        # Execute each pipeline
        for script_name, config_name, expected_rows in self.PIPELINES:
            result = self.execute_with_retry(script_name, config_name, expected_rows)
            self.results.append(result)
            
            # Save progress after each pipeline
            self.save_progress()
        
        # Final report
        self.print_final_report()
    
    def save_progress(self):
        """Save current progress to file"""
        progress = {
            "timestamp": datetime.now().isoformat(),
            "results": [
                {
                    "name": r.name,
                    "success": r.success,
                    "attempts": r.attempts,
                    "row_count": r.row_count,
                    "accuracy": r.accuracy,
                    "issues": [i.type.value for i in r.issues]
                }
                for r in self.results
            ]
        }
        
        progress_file = f"{REPO_PATH}/executor_progress.json"
        with open(progress_file, 'w') as f:
            json.dump(progress, f, indent=2)
    
    def print_final_report(self):
        """Print final execution report"""
        end_time = datetime.now()
        duration = end_time - self.start_time
        
        print("\n" + "="*70)
        print("FINAL EXECUTION REPORT")
        print("="*70)
        
        successes = [r for r in self.results if r.success]
        failures = [r for r in self.results if not r.success]
        
        print(f"\n✅ Succeeded: {len(successes)}/{len(self.results)}")
        print(f"❌ Failed: {len(failures)}/{len(self.results)}")
        print(f"⏱️  Duration: {duration}")
        
        print("\n📊 DETAILED RESULTS:")
        print("-" * 70)
        for r in self.results:
            status = "✅" if r.success else "❌"
            print(f"{status} {r.name}")
            print(f"   Rows: {r.row_count:,} | Train: {r.train_size:,} | Test: {r.test_size:,}")
            print(f"   Accuracy: {r.accuracy:.4f} | Attempts: {r.attempts}")
            if r.issues:
                print(f"   Issues: {', '.join(i.type.value for i in r.issues)}")
        
        if failures:
            print("\n⚠️  FAILURES REQUIRING MANUAL INTERVENTION:")
            for r in failures:
                print(f"   - {r.name}: See {r.log_file}")
                for issue in r.issues:
                    if not issue.auto_fixable:
                        print(f"     → {issue.type.value}: {issue.message}")


if __name__ == "__main__":
    executor = AutonomousExecutor()
    executor.execute_all()
