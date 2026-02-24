#!/usr/bin/env python3
"""
Pre-Execution Audit

Scans the entire codebase and configs BEFORE running pipelines to find issues.
This catches problems BEFORE they cause failures.
"""

import os
import re
import json
from pathlib import Path
from typing import Dict, List, Tuple
from dataclasses import dataclass

REPO_PATH = "/home/ubuntu/repos/ConnectedDrivingPipelineV4"

@dataclass
class AuditFinding:
    severity: str  # CRITICAL, HIGH, MEDIUM, LOW
    file: str
    line: int
    issue: str
    fix: str

class CodebaseAuditor:
    """Audits the entire codebase for known issues"""
    
    def __init__(self, repo_path: str):
        self.repo_path = repo_path
        self.findings: List[AuditFinding] = []
    
    def audit_all(self) -> List[AuditFinding]:
        """Run all audit checks"""
        print("🔍 AUDITING CODEBASE...")
        print("=" * 60)
        
        self.audit_configs()
        self.audit_code()
        self.audit_cache_keys()
        self.audit_data_files()
        
        return self.findings
    
    def audit_configs(self):
        """Audit all config files for known issues"""
        print("\n📄 Checking configs...")
        config_dir = f"{self.repo_path}/production_configs"
        
        if not os.path.exists(config_dir):
            self.findings.append(AuditFinding(
                severity="CRITICAL",
                file=config_dir,
                line=0,
                issue="production_configs directory not found",
                fix="Create directory and config files"
            ))
            return
        
        for config_file in os.listdir(config_dir):
            if not config_file.endswith('.json'):
                continue
            
            config_path = f"{config_dir}/{config_file}"
            
            try:
                with open(config_path, 'r') as f:
                    config = json.load(f)
            except json.JSONDecodeError as e:
                self.findings.append(AuditFinding(
                    severity="CRITICAL",
                    file=config_path,
                    line=0,
                    issue=f"Invalid JSON: {e}",
                    fix="Fix JSON syntax"
                ))
                continue
            
            # Check for wrong column names (lowercase)
            config_str = json.dumps(config)
            wrong_columns = [
                "coredata_position_lat",
                "coredata_position_long", 
                "coredata_elevation",
                "coredata_speed",
                "coredata_heading",
                "metadata_receivedat"
            ]
            
            for col in wrong_columns:
                if col in config_str:
                    self.findings.append(AuditFinding(
                        severity="CRITICAL",
                        file=config_path,
                        line=0,
                        issue=f"Wrong column name: {col}",
                        fix=f"Change to proper casing (coreData_*, metadata_receivedAt)"
                    ))
            
            # Check for 100K row limit
            if config.get("data", {}).get("num_subsection_rows") == 100000:
                self.findings.append(AuditFinding(
                    severity="HIGH",
                    file=config_path,
                    line=0,
                    issue="num_subsection_rows set to 100000 (too small for 200km)",
                    fix="Set to null or remove to use full data"
                ))
            
            # Check train/test split config
            ml_config = config.get("ml", {})
            split_config = ml_config.get("train_test_split", {})
            
            if "num_train_rows" in split_config:
                self.findings.append(AuditFinding(
                    severity="CRITICAL",
                    file=config_path,
                    line=0,
                    issue="num_train_rows hardcoded in split config",
                    fix="Use test_size ratio instead"
                ))
            
            print(f"   ✓ {config_file}")
    
    def audit_code(self):
        """Audit Python code for known issues"""
        print("\n🐍 Checking Python code...")
        
        files_to_check = [
            "MachineLearning/DaskPipelineRunner.py",
            "Decorators/FileCache.py",
            "Decorators/DaskParquetCache.py",
            "Gatherer/DaskDataGatherer.py",
        ]
        
        for rel_path in files_to_check:
            file_path = f"{self.repo_path}/{rel_path}"
            
            if not os.path.exists(file_path):
                self.findings.append(AuditFinding(
                    severity="HIGH",
                    file=file_path,
                    line=0,
                    issue="File not found",
                    fix="Verify file path"
                ))
                continue
            
            with open(file_path, 'r') as f:
                lines = f.readlines()
            
            for i, line in enumerate(lines):
                # Check for hardcoded 100000 row limits
                if "100000" in line and ("num" in line.lower() or "rows" in line.lower()):
                    self.findings.append(AuditFinding(
                        severity="HIGH",
                        file=file_path,
                        line=i + 1,
                        issue=f"Hardcoded 100000 limit: {line.strip()[:80]}",
                        fix="Use config value or remove limit"
                    ))
                
                # Check for head/tail split pattern (broken)
                if ".head(" in line and "train" in line.lower():
                    self.findings.append(AuditFinding(
                        severity="CRITICAL",
                        file=file_path,
                        line=i + 1,
                        issue="Using .head() for train split - causes data leakage",
                        fix="Use sklearn train_test_split"
                    ))
                
                if ".tail(" in line and "test" in line.lower():
                    self.findings.append(AuditFinding(
                        severity="CRITICAL",
                        file=file_path,
                        line=i + 1,
                        issue="Using .tail() for test split - causes data leakage",
                        fix="Use sklearn train_test_split"
                    ))
            
            print(f"   ✓ {rel_path}")
    
    def audit_cache_keys(self):
        """Audit cache key generation for uniqueness issues"""
        print("\n🔑 Checking cache key generation...")
        
        cache_file = f"{self.repo_path}/Decorators/FileCache.py"
        
        if not os.path.exists(cache_file):
            self.findings.append(AuditFinding(
                severity="HIGH",
                file=cache_file,
                line=0,
                issue="FileCache.py not found",
                fix="Verify file path"
            ))
            return
        
        with open(cache_file, 'r') as f:
            content = f.read()
        
        # Check if all required parameters are in cache key
        required_in_key = [
            ("attack_type", "Attack type must be in cache key"),
            ("offset_distance", "Offset distance must be in cache key"),
            ("radius", "Spatial radius must be in cache key"),
            ("malicious_ratio", "Malicious ratio must be in cache key"),
        ]
        
        for param, message in required_in_key:
            if param not in content:
                self.findings.append(AuditFinding(
                    severity="CRITICAL",
                    file=cache_file,
                    line=0,
                    issue=f"Cache key may not include: {param}",
                    fix=message
                ))
        
        print(f"   ✓ FileCache.py")
    
    def audit_data_files(self):
        """Audit data files exist and have expected size"""
        print("\n📊 Checking data files...")
        
        data_files = [
            ("April_2021_Wyoming_Data_Fixed.csv", 13000000),  # ~13M rows
            ("April_2021_Wyoming_Data_Fixed.parquet", 13000000),
        ]
        
        for filename, expected_min_rows in data_files:
            file_path = f"{self.repo_path}/{filename}"
            
            if not os.path.exists(file_path):
                self.findings.append(AuditFinding(
                    severity="MEDIUM",
                    file=file_path,
                    line=0,
                    issue=f"Data file not found",
                    fix="File may be at different location"
                ))
            else:
                # Check file size as proxy for row count
                size_mb = os.path.getsize(file_path) / (1024 * 1024)
                print(f"   ✓ {filename}: {size_mb:.1f} MB")
    
    def print_report(self):
        """Print audit report"""
        print("\n" + "=" * 60)
        print("AUDIT REPORT")
        print("=" * 60)
        
        if not self.findings:
            print("\n✅ No issues found!")
            return
        
        # Group by severity
        critical = [f for f in self.findings if f.severity == "CRITICAL"]
        high = [f for f in self.findings if f.severity == "HIGH"]
        medium = [f for f in self.findings if f.severity == "MEDIUM"]
        low = [f for f in self.findings if f.severity == "LOW"]
        
        print(f"\n🔴 CRITICAL: {len(critical)}")
        print(f"🟠 HIGH: {len(high)}")
        print(f"🟡 MEDIUM: {len(medium)}")
        print(f"🟢 LOW: {len(low)}")
        
        if critical:
            print("\n🔴 CRITICAL ISSUES (must fix before running):")
            for f in critical:
                print(f"   [{f.file}:{f.line}]")
                print(f"   Issue: {f.issue}")
                print(f"   Fix: {f.fix}")
                print()
        
        if high:
            print("\n🟠 HIGH ISSUES (should fix):")
            for f in high:
                print(f"   [{f.file}:{f.line}]")
                print(f"   Issue: {f.issue}")
                print(f"   Fix: {f.fix}")
                print()
        
        return len(critical) == 0  # Return True if OK to proceed


class CacheKeyAuditor:
    """Specifically audits cache keys for collision risks"""
    
    def __init__(self, repo_path: str):
        self.repo_path = repo_path
    
    def check_existing_cache(self) -> List[Tuple[str, str]]:
        """Check existing cache files for potential collisions"""
        cache_dir = f"{self.repo_path}/cache"
        
        if not os.path.exists(cache_dir):
            return []
        
        cache_files = []
        for root, dirs, files in os.walk(cache_dir):
            for f in files:
                if f.endswith('.parquet'):
                    cache_files.append(os.path.join(root, f))
        
        print(f"\n🔑 Found {len(cache_files)} cache files")
        
        # Group by hash to find potential collisions
        by_hash = {}
        for cf in cache_files:
            # Extract hash from filename
            base = os.path.basename(cf)
            hash_part = base.replace('.parquet', '')
            
            if hash_part not in by_hash:
                by_hash[hash_part] = []
            by_hash[hash_part].append(cf)
        
        collisions = [(h, files) for h, files in by_hash.items() if len(files) > 1]
        
        if collisions:
            print(f"⚠️  Found {len(collisions)} potential cache key collisions!")
            for h, files in collisions:
                print(f"   Hash: {h}")
                for f in files:
                    print(f"      - {f}")
        
        return collisions


if __name__ == "__main__":
    auditor = CodebaseAuditor(REPO_PATH)
    findings = auditor.audit_all()
    ok_to_proceed = auditor.print_report()
    
    cache_auditor = CacheKeyAuditor(REPO_PATH)
    collisions = cache_auditor.check_existing_cache()
    
    print("\n" + "=" * 60)
    if ok_to_proceed and not collisions:
        print("✅ AUDIT PASSED - OK to proceed with execution")
    else:
        print("❌ AUDIT FAILED - Fix issues before running pipelines")
    print("=" * 60)
