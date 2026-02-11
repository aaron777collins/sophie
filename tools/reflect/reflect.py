#!/usr/bin/env python3
"""
reflect - Zero-friction reflection logging CLI

Logs reflection entries to memory/reflections/daily/YYYY-MM-DD.md

Usage:
    reflect well "Something went great today"
    reflect improve "Could have done X better"
    reflect interesting "Noticed an interesting pattern"
    reflect feedback "User said Y about Z"
    reflect list                    # List today's entries
    reflect list --date 2026-01-15  # List specific date
    reflect well "entry" --date 2026-01-15  # Log to specific date
"""

import argparse
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional

# Find clawd root (where memory/ lives)
# Handle symlink: resolve the actual file location, not the symlink
SCRIPT_PATH = Path(__file__).resolve()
if SCRIPT_PATH.is_symlink() or str(SCRIPT_PATH).startswith("/usr"):
    # Symlinked from /usr/local/bin - use hardcoded path
    CLAWD_ROOT = Path("/home/ubuntu/clawd")
else:
    SCRIPT_DIR = SCRIPT_PATH.parent
    CLAWD_ROOT = SCRIPT_DIR.parent.parent  # tools/reflect -> tools -> clawd
REFLECTIONS_DIR = CLAWD_ROOT / "memory" / "reflections" / "daily"

# Emoji mapping for reflection types
TYPE_EMOJI = {
    "well": "🟢",
    "improve": "🔴", 
    "interesting": "🤔",
    "feedback": "💬",
}

TYPE_LABELS = {
    "well": "Did Well",
    "improve": "Could Improve",
    "interesting": "Interesting",
    "feedback": "Feedback",
}


def get_reflection_file(date_str: Optional[str] = None) -> Path:
    """Get the reflection file path for a given date (default: today)."""
    if date_str:
        try:
            date = datetime.strptime(date_str, "%Y-%m-%d")
        except ValueError:
            print(f"Error: Invalid date format '{date_str}'. Use YYYY-MM-DD.", file=sys.stderr)
            sys.exit(1)
    else:
        date = datetime.now()
    
    filename = date.strftime("%Y-%m-%d") + ".md"
    return REFLECTIONS_DIR / filename


def ensure_file_exists(filepath: Path, date_str: str) -> None:
    """Create the reflection file with header if it doesn't exist."""
    filepath.parent.mkdir(parents=True, exist_ok=True)
    
    if not filepath.exists():
        header = f"""# Daily Reflections - {date_str}

Log notable moments throughout the day.

"""
        filepath.write_text(header)


def get_timestamp() -> str:
    """Get current timestamp in HH:MM TZ format."""
    return datetime.now().strftime("%H:%M %Z").strip() or datetime.now().strftime("%H:%M EST")


def log_entry(entry_type: str, message: str, date_str: Optional[str] = None) -> None:
    """Log a reflection entry to the daily file."""
    filepath = get_reflection_file(date_str)
    date_for_file = date_str or datetime.now().strftime("%Y-%m-%d")
    
    ensure_file_exists(filepath, date_for_file)
    
    emoji = TYPE_EMOJI.get(entry_type, "📝")
    label = TYPE_LABELS.get(entry_type, entry_type.title())
    timestamp = get_timestamp()
    
    # Build the entry line
    entry_line = f"- [{timestamp}] {emoji} **{label}:** {message}\n"
    
    # Append to file
    with open(filepath, "a") as f:
        f.write(entry_line)
    
    print(f"✓ Logged to {filepath.relative_to(CLAWD_ROOT)}")
    print(f"  {entry_line.strip()}")


def list_entries(date_str: Optional[str] = None) -> None:
    """List reflection entries for a given date."""
    filepath = get_reflection_file(date_str)
    
    if not filepath.exists():
        date_display = date_str or datetime.now().strftime("%Y-%m-%d")
        print(f"No reflections found for {date_display}")
        return
    
    content = filepath.read_text()
    print(content)


def main():
    parser = argparse.ArgumentParser(
        description="Zero-friction reflection logging",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  reflect well "Handled the outage calmly"
  reflect improve "Should have checked logs first"
  reflect interesting "User asked about X three times"
  reflect feedback "Aaron said the response was too long"
  reflect list
  reflect list --date 2026-01-15
  reflect well "Past entry" --date 2026-01-15
        """
    )
    
    parser.add_argument(
        "type",
        choices=["well", "improve", "interesting", "feedback", "list"],
        help="Type of reflection entry (or 'list' to view entries)"
    )
    
    parser.add_argument(
        "message",
        nargs="?",
        help="The reflection message (not needed for 'list')"
    )
    
    parser.add_argument(
        "--date", "-d",
        help="Date override in YYYY-MM-DD format (default: today)"
    )
    
    args = parser.parse_args()
    
    if args.type == "list":
        list_entries(args.date)
    else:
        if not args.message:
            print(f"Error: Message required for '{args.type}' entries.", file=sys.stderr)
            sys.exit(1)
        log_entry(args.type, args.message, args.date)


if __name__ == "__main__":
    main()
