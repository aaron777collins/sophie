#!/usr/bin/env python3
"""
Query and update the insights index for pattern tracking.
Usage:
  ./query.py list                    - List all patterns
  ./query.py list --active           - List active patterns only
  ./query.py get <pattern-id>        - Get specific pattern
  ./query.py add <name> <category>   - Add new pattern
  ./query.py log <pattern-id>        - Log new instance of pattern
  ./query.py resolve <pattern-id>    - Mark pattern as resolved
  ./query.py stats                   - Show statistics
"""

import json
import sys
import os
from datetime import datetime
from pathlib import Path

INDEX_PATH = Path(__file__).parent / "index.json"

def load_index():
    with open(INDEX_PATH) as f:
        return json.load(f)

def save_index(data):
    data["lastUpdated"] = datetime.utcnow().isoformat() + "Z"
    # Update stats
    patterns = data["patterns"]
    data["stats"]["totalPatterns"] = len(patterns)
    data["stats"]["activePatterns"] = len([p for p in patterns if p.get("status") == "active"])
    data["stats"]["resolvedPatterns"] = len([p for p in patterns if p.get("status") == "resolved"])
    
    with open(INDEX_PATH, "w") as f:
        json.dump(data, f, indent=2)

def list_patterns(active_only=False):
    data = load_index()
    patterns = data["patterns"]
    if active_only:
        patterns = [p for p in patterns if p.get("status") == "active"]
    
    if not patterns:
        print("No patterns found.")
        return
    
    for p in patterns:
        status = p.get("status", "active")
        freq = p.get("frequency", 0)
        print(f"[{p['id']}] {p['name']} ({p['category']}) - {status}, seen {freq}x")

def get_pattern(pattern_id):
    data = load_index()
    for p in data["patterns"]:
        if p["id"] == pattern_id:
            print(json.dumps(p, indent=2))
            return
    print(f"Pattern '{pattern_id}' not found.")

def add_pattern(name, category):
    data = load_index()
    
    # Generate ID from name
    pattern_id = name.lower().replace(" ", "-")[:30]
    
    # Check for duplicates
    if any(p["id"] == pattern_id for p in data["patterns"]):
        print(f"Pattern with ID '{pattern_id}' already exists.")
        return
    
    now = datetime.utcnow().isoformat() + "Z"
    pattern = {
        "id": pattern_id,
        "name": name,
        "category": category,
        "description": "",
        "frequency": 1,
        "firstSeen": now,
        "lastSeen": now,
        "instances": [],
        "status": "active",
        "improvements": [],
        "impact": "medium",
        "tags": []
    }
    
    data["patterns"].append(pattern)
    save_index(data)
    print(f"Added pattern: {pattern_id}")

def log_instance(pattern_id, ref=None):
    data = load_index()
    for p in data["patterns"]:
        if p["id"] == pattern_id:
            p["frequency"] = p.get("frequency", 0) + 1
            p["lastSeen"] = datetime.utcnow().isoformat() + "Z"
            if ref:
                p.setdefault("instances", []).append(ref)
            save_index(data)
            print(f"Logged instance for '{pattern_id}' (total: {p['frequency']})")
            return
    print(f"Pattern '{pattern_id}' not found.")

def resolve_pattern(pattern_id):
    data = load_index()
    for p in data["patterns"]:
        if p["id"] == pattern_id:
            p["status"] = "resolved"
            save_index(data)
            print(f"Marked '{pattern_id}' as resolved.")
            return
    print(f"Pattern '{pattern_id}' not found.")

def show_stats():
    data = load_index()
    stats = data["stats"]
    print(f"Total patterns: {stats['totalPatterns']}")
    print(f"Active: {stats['activePatterns']}")
    print(f"Resolved: {stats['resolvedPatterns']}")
    print(f"Last updated: {data['lastUpdated']}")

def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return
    
    cmd = sys.argv[1]
    
    if cmd == "list":
        active = "--active" in sys.argv
        list_patterns(active)
    elif cmd == "get" and len(sys.argv) >= 3:
        get_pattern(sys.argv[2])
    elif cmd == "add" and len(sys.argv) >= 4:
        add_pattern(sys.argv[2], sys.argv[3])
    elif cmd == "log" and len(sys.argv) >= 3:
        ref = sys.argv[3] if len(sys.argv) >= 4 else None
        log_instance(sys.argv[2], ref)
    elif cmd == "resolve" and len(sys.argv) >= 3:
        resolve_pattern(sys.argv[2])
    elif cmd == "stats":
        show_stats()
    else:
        print(__doc__)

if __name__ == "__main__":
    main()
