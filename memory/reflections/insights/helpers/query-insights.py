#!/usr/bin/env python3
"""
Query and display insights from the patterns index.

Usage:
    ./query-insights.py                    # List all patterns
    ./query-insights.py --category behavior # Filter by category
    ./query-insights.py --type weakness    # Filter by type
    ./query-insights.py --status active    # Filter by status
    ./query-insights.py --stats            # Show statistics
    ./query-insights.py --id pattern-001   # Get specific pattern
"""

import json
import argparse
from pathlib import Path
from datetime import datetime

INDEX_PATH = Path(__file__).parent.parent / "index.json"

def load_index():
    with open(INDEX_PATH) as f:
        return json.load(f)

def list_patterns(data, category=None, ptype=None, status=None):
    patterns = data.get("patterns", [])
    
    if category:
        patterns = [p for p in patterns if p.get("category") == category]
    if ptype:
        patterns = [p for p in patterns if p.get("type") == ptype]
    if status:
        patterns = [p for p in patterns if p.get("status") == status]
    
    if not patterns:
        print("No patterns found matching criteria.")
        return
    
    print(f"\n{'ID':<15} {'Name':<30} {'Category':<12} {'Type':<10} {'Status':<10}")
    print("-" * 80)
    for p in patterns:
        print(f"{p.get('id', 'N/A'):<15} {p.get('name', 'N/A'):<30} "
              f"{p.get('category', 'N/A'):<12} {p.get('type', 'N/A'):<10} "
              f"{p.get('status', 'N/A'):<10}")

def show_pattern(data, pattern_id):
    for p in data.get("patterns", []):
        if p.get("id") == pattern_id:
            print(json.dumps(p, indent=2))
            return
    print(f"Pattern '{pattern_id}' not found.")

def show_stats(data):
    stats = data.get("statistics", {})
    patterns = data.get("patterns", [])
    
    print("\n=== Insights Statistics ===")
    print(f"Total Patterns: {len(patterns)}")
    print(f"Last Updated: {data.get('lastUpdated', 'N/A')}")
    
    if patterns:
        print("\nBy Category:")
        cats = {}
        for p in patterns:
            cat = p.get("category", "unknown")
            cats[cat] = cats.get(cat, 0) + 1
        for cat, count in sorted(cats.items()):
            print(f"  {cat}: {count}")
        
        print("\nBy Type:")
        types = {}
        for p in patterns:
            t = p.get("type", "unknown")
            types[t] = types.get(t, 0) + 1
        for t, count in sorted(types.items()):
            print(f"  {t}: {count}")

def main():
    parser = argparse.ArgumentParser(description="Query insights patterns")
    parser.add_argument("--category", "-c", help="Filter by category")
    parser.add_argument("--type", "-t", help="Filter by type")
    parser.add_argument("--status", "-s", help="Filter by status")
    parser.add_argument("--stats", action="store_true", help="Show statistics")
    parser.add_argument("--id", help="Get specific pattern by ID")
    parser.add_argument("--json", action="store_true", help="Output as JSON")
    
    args = parser.parse_args()
    data = load_index()
    
    if args.stats:
        show_stats(data)
    elif args.id:
        show_pattern(data, args.id)
    else:
        list_patterns(data, args.category, args.type, args.status)

if __name__ == "__main__":
    main()
