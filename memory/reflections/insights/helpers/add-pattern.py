#!/usr/bin/env python3
"""
Add or update a pattern in the insights index.

Usage:
    ./add-pattern.py --name "Verbose explanations" --category communication --type tendency \
                     --description "Tendency to over-explain when simpler would suffice"
    
    ./add-pattern.py --id pattern-001 --add-instance \
                     --context "User asked for brief answer, gave paragraph" \
                     --outcome negative
"""

import json
import argparse
from pathlib import Path
from datetime import datetime

INDEX_PATH = Path(__file__).parent.parent / "index.json"

def load_index():
    with open(INDEX_PATH) as f:
        return json.load(f)

def save_index(data):
    data["lastUpdated"] = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
    
    # Update statistics
    patterns = data.get("patterns", [])
    data["statistics"] = {
        "totalPatterns": len(patterns),
        "byCategory": {},
        "byType": {},
        "byStatus": {}
    }
    for p in patterns:
        cat = p.get("category", "unknown")
        typ = p.get("type", "unknown")
        status = p.get("status", "unknown")
        data["statistics"]["byCategory"][cat] = data["statistics"]["byCategory"].get(cat, 0) + 1
        data["statistics"]["byType"][typ] = data["statistics"]["byType"].get(typ, 0) + 1
        data["statistics"]["byStatus"][status] = data["statistics"]["byStatus"].get(status, 0) + 1
    
    with open(INDEX_PATH, "w") as f:
        json.dump(data, f, indent=2)
    print(f"Index saved to {INDEX_PATH}")

def generate_id(data):
    patterns = data.get("patterns", [])
    existing_ids = [p.get("id", "") for p in patterns]
    num = 1
    while f"pattern-{num:03d}" in existing_ids:
        num += 1
    return f"pattern-{num:03d}"

def add_pattern(data, args):
    today = datetime.utcnow().strftime("%Y-%m-%d")
    pattern_id = generate_id(data)
    
    pattern = {
        "id": pattern_id,
        "name": args.name,
        "category": args.category,
        "type": args.type,
        "description": args.description or "",
        "instances": [],
        "frequency": args.frequency or "occasional",
        "impact": args.impact or "medium",
        "status": "active",
        "improvements": [],
        "relatedPatterns": [],
        "firstSeen": today,
        "lastSeen": today,
        "tags": args.tags.split(",") if args.tags else []
    }
    
    data["patterns"].append(pattern)
    save_index(data)
    print(f"Added pattern: {pattern_id} - {args.name}")
    return pattern_id

def add_instance(data, args):
    today = datetime.utcnow().strftime("%Y-%m-%d")
    
    for p in data.get("patterns", []):
        if p.get("id") == args.id:
            instance = {
                "date": today,
                "context": args.context or "",
                "outcome": args.outcome or "neutral",
                "notes": args.notes or ""
            }
            p["instances"].append(instance)
            p["lastSeen"] = today
            
            # Update frequency based on instance count
            count = len(p["instances"])
            if count >= 10:
                p["frequency"] = "persistent"
            elif count >= 5:
                p["frequency"] = "frequent"
            elif count >= 2:
                p["frequency"] = "occasional"
            
            save_index(data)
            print(f"Added instance to {args.id}")
            return
    
    print(f"Pattern '{args.id}' not found.")

def main():
    parser = argparse.ArgumentParser(description="Add or update insight patterns")
    
    # For new patterns
    parser.add_argument("--name", "-n", help="Pattern name")
    parser.add_argument("--category", "-c", 
                        choices=["behavior", "communication", "technical", "process", "emotional"],
                        help="Pattern category")
    parser.add_argument("--type", "-t",
                        choices=["strength", "weakness", "tendency", "insight"],
                        help="Pattern type")
    parser.add_argument("--description", "-d", help="Pattern description")
    parser.add_argument("--frequency", choices=["rare", "occasional", "frequent", "persistent"])
    parser.add_argument("--impact", choices=["low", "medium", "high"])
    parser.add_argument("--tags", help="Comma-separated tags")
    
    # For adding instances
    parser.add_argument("--id", help="Pattern ID (for updates)")
    parser.add_argument("--add-instance", action="store_true", help="Add instance to existing pattern")
    parser.add_argument("--context", help="Instance context")
    parser.add_argument("--outcome", choices=["positive", "negative", "neutral"])
    parser.add_argument("--notes", help="Instance notes")
    
    args = parser.parse_args()
    data = load_index()
    
    if args.add_instance and args.id:
        add_instance(data, args)
    elif args.name and args.category and args.type:
        add_pattern(data, args)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
