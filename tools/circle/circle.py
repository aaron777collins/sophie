#!/usr/bin/env python3
"""
💜 The Circle — Multi-Perspective CLI Tool

Invoke multi-perspective thinking at any weight level.

Usage:
    circle "Should I refactor the auth module?" --weight standard
    circle "How to phrase this feedback?" --weight light --focus empathy
    circle --convene "Architecture: monorepo vs polyrepo"  # Full Council
"""

import argparse
import json
import os
import subprocess
import sys
import time
import uuid
import re
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from concurrent.futures import ThreadPoolExecutor, as_completed

# ════════════════════════════════════════════════════════════════════════════
# Configuration
# ════════════════════════════════════════════════════════════════════════════

PERSPECTIVES = {
    # Critical perspectives
    "architect": {"emoji": "🏛️", "name": "The Architect", "focus": "System design, scalability, structure", "type": "critical"},
    "guardian": {"emoji": "🛡️", "name": "The Guardian", "focus": "Security, privacy, risk, failure modes", "type": "critical"},
    "pragmatist": {"emoji": "🔧", "name": "The Pragmatist", "focus": "Implementation, timeline, resources", "type": "critical"},
    "skeptic": {"emoji": "🔍", "name": "The Skeptic", "focus": "Edge cases, assumptions, blind spots", "type": "critical"},
    "visionary": {"emoji": "🔮", "name": "The Visionary", "focus": "Long-term, flexibility, future impact", "type": "critical"},
    "historian": {"emoji": "📚", "name": "The Historian", "focus": "Precedent, patterns, lessons learned", "type": "critical"},
    # Empathy perspectives
    "mind": {"emoji": "💭", "name": "Their Mind", "focus": "Thoughts, beliefs, assumptions", "type": "empathy"},
    "heart": {"emoji": "💔", "name": "Their Heart", "focus": "Emotions, feelings, mood", "type": "empathy"},
    "needs": {"emoji": "🎯", "name": "Their Needs", "focus": "Real needs vs stated wants", "type": "empathy"},
    "relationship": {"emoji": "🤝", "name": "The Relationship", "focus": "Trust, connection, dynamics", "type": "empathy"},
    "empath": {"emoji": "💜", "name": "The Empath", "focus": "Overall emotional impact", "type": "empathy"},
}

WEIGHT_CONFIG = {
    "internal": {"agents": 0, "model": "self", "perspectives": []},
    "light": {"agents": 2, "model": "haiku", "perspectives": ["pragmatist", "empath"]},
    "standard": {"agents": 3, "model": "sonnet", "perspectives": ["pragmatist", "skeptic", "empath"]},
    "elevated": {"agents": 5, "model": "sonnet", "perspectives": ["architect", "guardian", "pragmatist", "skeptic", "empath"]},
    "council": {"agents": 7, "model": "opus", "perspectives": ["architect", "guardian", "pragmatist", "skeptic", "visionary", "empath", "relationship"]},
}

MEMORY_DIR = Path(os.path.expanduser("~/clawd/memory/counsel"))

# ════════════════════════════════════════════════════════════════════════════
# Prompt Templates
# ════════════════════════════════════════════════════════════════════════════

def get_counselor_system_prompt(perspective_id: str, weight: str) -> str:
    """Generate system prompt for a counselor."""
    p = PERSPECTIVES[perspective_id]
    
    if weight == "council":
        return f"""You are a Counselor in The Counsel, a formal multi-agent deliberation system for critical decisions.

Your perspective: {p['name']} ({p['emoji']})
Your focus: {p['focus']}

This is a high-stakes decision requiring careful analysis. Your response will be aggregated with other counselors and logged for future reference.

REQUIREMENTS:
1. Analyze THOROUGHLY from your perspective
2. Consider empathy: how does this affect humans involved?
3. Be specific in your concerns and suggestions
4. Assign confidence honestly (don't inflate)
5. Explain your key risk clearly

Respond ONLY with valid JSON in this exact format:
{{
  "perspective": "{perspective_id}",
  "perspective_emoji": "{p['emoji']}",
  "assessment": "[3-5 sentences of thorough analysis from your angle]",
  "concerns": ["[specific concern 1]", "[specific concern 2]"],
  "suggestions": ["[actionable recommendation 1]", "[actionable recommendation 2]"],
  "vote": "[PROCEED or PAUSE or ADJUST]",
  "confidence": [0-100],
  "key_risk": "[the main thing that could go wrong if your perspective is ignored]"
}}"""
    else:
        return f"""You are a counselor in The Circle, a multi-perspective thinking framework.

Your perspective: {p['name']} ({p['emoji']})
Your focus: {p['focus']}

IMPORTANT: Also consider empathy — how does this affect the humans involved?

Respond ONLY with valid JSON in this format:
{{
  "perspective": "{perspective_id}",
  "perspective_emoji": "{p['emoji']}",
  "assessment": "[2-4 sentences from your angle]",
  "concerns": ["[specific concern 1]", "[specific concern 2]"],
  "suggestions": ["[recommendation 1]", "[recommendation 2]"],
  "vote": "[PROCEED or PAUSE or ADJUST]",
  "confidence": [0-100],
  "key_risk": "[main concern if your perspective is ignored]"
}}"""


def get_counselor_user_prompt(question: str, context: Optional[str] = None) -> str:
    """Generate user prompt for counselor."""
    ctx = f"\n\nCONTEXT:\n{context}" if context else ""
    return f"""THE CIRCLE HAS BEEN CONVENED

QUESTION/SITUATION:
{question}{ctx}

Analyze from your perspective and cast your vote:
- PROCEED: Good to go as-is
- ADJUST: Needs modification (explain how)
- PAUSE: Needs more thought or human input

Deliberate carefully and provide your assessment."""


def get_light_combined_prompt(question: str, context: Optional[str] = None) -> str:
    """Get combined prompt for light weight (single agent doing both perspectives)."""
    ctx = f"\nContext: {context}" if context else ""
    return f"""You are a quick sanity checker. Analyze this and respond with ONLY a JSON object, no other text.

Question: {question}{ctx}

Check: 1) Is this logical/realistic? 2) How will people feel about it?

RESPOND WITH ONLY THIS JSON (replace bracketed text with your analysis):
{{"critical_assessment":"[2 sentences on logic]","empathy_assessment":"[2 sentences on feelings]","concerns":["concern1"],"suggestions":["suggestion1"],"vote":"PROCEED","confidence":75,"recommendation":"[brief advice]"}}"""


# ════════════════════════════════════════════════════════════════════════════
# Agent Spawning
# ════════════════════════════════════════════════════════════════════════════

def run_claude_cli(prompt: str, model: str, timeout: int = 60) -> Tuple[bool, str]:
    """Run claude CLI and return (success, output)."""
    model_map = {
        "haiku": "claude-3-5-haiku-latest",
        "sonnet": "claude-sonnet-4-20250514",
        "opus": "claude-opus-4-20250514",
    }
    
    actual_model = model_map.get(model, model)
    
    try:
        result = subprocess.run(
            ["claude", "-p", prompt, "--model", actual_model, "--output-format", "json"],
            capture_output=True,
            text=True,
            timeout=timeout,
            env={**os.environ, "ANTHROPIC_AUTH_PROFILE": "anthropic:claude-cli"}
        )
        
        if result.returncode == 0:
            try:
                response = json.loads(result.stdout)
                return True, response.get("result", "")
            except json.JSONDecodeError:
                return True, result.stdout
        else:
            return False, result.stderr
            
    except subprocess.TimeoutExpired:
        return False, "Timeout expired"
    except Exception as e:
        return False, str(e)


def spawn_counselor(perspective_id: str, question: str, context: Optional[str], weight: str, model: str) -> Dict:
    """Spawn a single counselor and get their response."""
    system_prompt = get_counselor_system_prompt(perspective_id, weight)
    user_prompt = get_counselor_user_prompt(question, context)
    full_prompt = f"{system_prompt}\n\n---\n\n{user_prompt}"
    
    p = PERSPECTIVES[perspective_id]
    
    timeout = 120 if weight == "council" else 60
    success, output = run_claude_cli(full_prompt, model, timeout=timeout)
    
    if not success:
        return {
            "perspective": perspective_id,
            "perspective_emoji": p["emoji"],
            "error": output,
            "vote": "abstain",
            "confidence": 0
        }
    
    # Parse JSON from output
    try:
        # Try to extract JSON from the response - handle nested objects/arrays
        # Look for outermost braces
        brace_count = 0
        start_idx = None
        for i, char in enumerate(output):
            if char == '{':
                if brace_count == 0:
                    start_idx = i
                brace_count += 1
            elif char == '}':
                brace_count -= 1
                if brace_count == 0 and start_idx is not None:
                    json_str = output[start_idx:i+1]
                    return json.loads(json_str)
        # Fallback: try parsing whole output
        return json.loads(output)
    except json.JSONDecodeError:
        return {
            "perspective": perspective_id,
            "perspective_emoji": p["emoji"],
            "assessment": output[:500],
            "vote": "abstain",
            "confidence": 50,
            "error": "Failed to parse JSON response"
        }


def run_light_check(question: str, context: Optional[str], debug: bool = False) -> Dict:
    """Run a lightweight combined check."""
    prompt = get_light_combined_prompt(question, context)
    success, output = run_claude_cli(prompt, "haiku", timeout=90)  # Increased timeout
    
    if debug:
        print(f"DEBUG: success={success}, output_len={len(output) if output else 0}", file=sys.stderr)
        print(f"DEBUG: output={output[:500] if output else 'None'}...", file=sys.stderr)
    
    if not success:
        return {"error": output, "vote": "PAUSE", "confidence": 0}
    
    try:
        # Handle nested objects/arrays
        brace_count = 0
        start_idx = None
        for i, char in enumerate(output):
            if char == '{':
                if brace_count == 0:
                    start_idx = i
                brace_count += 1
            elif char == '}':
                brace_count -= 1
                if brace_count == 0 and start_idx is not None:
                    json_str = output[start_idx:i+1]
                    if debug:
                        print(f"DEBUG: extracted json={json_str[:200]}...", file=sys.stderr)
                    return json.loads(json_str)
        return json.loads(output)
    except json.JSONDecodeError as e:
        if debug:
            print(f"DEBUG: JSON parse error: {e}", file=sys.stderr)
        return {
            "assessment": output[:500] if output else "No output",
            "vote": "PAUSE",
            "confidence": 50,
            "error": f"Failed to parse response: {str(e)}"
        }


def run_internal_check(question: str) -> Dict:
    """Format for internal check (no spawn)."""
    return {
        "weight": "internal",
        "note": "Internal check - no agents spawned. Use your own judgment with quick critical/empathy lens.",
        "checklist": {
            "critical": "Logic sound? Risks? Realistic?",
            "empathy": "How will they feel? Tone right? What do they need?"
        },
        "question": question
    }


# ════════════════════════════════════════════════════════════════════════════
# Aggregation
# ════════════════════════════════════════════════════════════════════════════

def aggregate_votes(responses: List[Dict]) -> Dict:
    """Aggregate counselor votes and produce summary."""
    votes = {"PROCEED": [], "PAUSE": [], "ADJUST": [], "abstain": []}
    
    for r in responses:
        vote = r.get("vote", "abstain").upper()
        if vote in votes:
            votes[vote].append(r)
        else:
            votes["abstain"].append(r)
    
    # Determine winner
    vote_counts = {k: len(v) for k, v in votes.items() if k != "abstain"}
    if not vote_counts or all(c == 0 for c in vote_counts.values()):
        winner = "PAUSE"
        winner_count = 0
    else:
        winner = max(vote_counts, key=vote_counts.get)
        winner_count = vote_counts[winner]
    
    # Check for tie
    tied = [k for k, v in vote_counts.items() if v == winner_count and v > 0]
    is_tied = len(tied) > 1
    
    # Calculate confidence
    total_confidence = sum(r.get("confidence", 50) for r in responses if r.get("vote", "").upper() != "ABSTAIN")
    responding = len([r for r in responses if r.get("vote", "").upper() != "ABSTAIN"])
    avg_confidence = total_confidence / responding if responding > 0 else 0
    
    # Check for dissent
    dissenting = [r for r in responses if r.get("vote", "").upper() != winner and r.get("vote", "").upper() != "ABSTAIN"]
    
    return {
        "decision": winner,
        "votes_for_winner": winner_count,
        "total_responding": responding,
        "tied": tied if is_tied else None,
        "unanimous": len(dissenting) == 0 and responding > 0,
        "avg_confidence": round(avg_confidence, 1),
        "tally": {k: len(v) for k, v in votes.items()},
        "dissent": {
            "exists": len(dissenting) > 0,
            "count": len(dissenting),
            "perspectives": [r.get("perspective") for r in dissenting],
            "concerns": [r.get("key_risk") for r in dissenting if r.get("key_risk")],
            "flagged": len(dissenting) >= 2
        }
    }


# ════════════════════════════════════════════════════════════════════════════
# Output Formatting
# ════════════════════════════════════════════════════════════════════════════

def format_human_output(question: str, weight: str, model: str, responses: List[Dict], aggregation: Dict, elapsed: float) -> str:
    """Format output for human reading."""
    
    # Header based on weight
    if weight == "council":
        header = """
╔════════════════════════════════════════════════════════════════════╗
║  ⚖️  T H E   C O U N S E L   C O N V E N E D  ⚖️                  ║
╚════════════════════════════════════════════════════════════════════╝
"""
    else:
        emoji_map = {"light": "🟢", "standard": "🟡", "elevated": "🟠", "council": "🔴"}
        header = f"\n{emoji_map.get(weight, '💜')} Circle Analysis ({weight.title()} Weight)\n{'═' * 50}\n"
    
    lines = [header]
    lines.append(f"📋 Question: {question}")
    lines.append(f"🤖 Model: {model} | ⏱️ Elapsed: {elapsed:.1f}s")
    lines.append("")
    
    # Votes table
    lines.append("┌─────────────────────┬────────┬────────────┬─────────────────────────────────────────┐")
    lines.append("│ Counselor           │ Vote   │ Confidence │ Key Risk                                │")
    lines.append("├─────────────────────┼────────┼────────────┼─────────────────────────────────────────┤")
    
    for r in responses:
        emoji = r.get("perspective_emoji", "❓")
        perspective = r.get("perspective", "unknown")[:12]
        vote = r.get("vote", "?")[:7]
        conf = r.get("confidence", 0)
        conf_bar = "🟢" if conf >= 70 else "🟡" if conf >= 40 else "🔴"
        risk = (r.get("key_risk", "") or "")[:38]
        lines.append(f"│ {emoji} {perspective:<12} │ {vote:<6} │ {conf_bar} {conf:>3}%    │ {risk:<39} │")
    
    lines.append("└─────────────────────┴────────┴────────────┴─────────────────────────────────────────┘")
    lines.append("")
    
    # Tally
    tally = aggregation["tally"]
    lines.append("📊 Tally:")
    for vote_type in ["PROCEED", "ADJUST", "PAUSE"]:
        count = tally.get(vote_type, 0)
        bar = "█" * count + "░" * (7 - count)
        lines.append(f"   {vote_type}: {bar} {count}")
    
    lines.append("")
    
    # Decision
    decision = aggregation["decision"]
    decision_emoji = {"PROCEED": "✅", "ADJUST": "⚠️", "PAUSE": "🛑"}.get(decision, "❓")
    lines.append(f"{decision_emoji} Decision: {decision}")
    
    if aggregation["unanimous"]:
        lines.append("   (Unanimous)")
    elif aggregation["tied"]:
        lines.append(f"   ⚠️ TIE between: {', '.join(aggregation['tied'])}")
    
    lines.append(f"   Avg Confidence: {aggregation['avg_confidence']}%")
    
    # Dissent
    if aggregation["dissent"]["exists"]:
        lines.append("")
        lines.append("⚠️ Dissenting Concerns:")
        for perspective, concern in zip(aggregation["dissent"]["perspectives"], aggregation["dissent"]["concerns"]):
            if concern:
                emoji = PERSPECTIVES.get(perspective, {}).get("emoji", "❓")
                lines.append(f"   {emoji} {perspective}: {concern}")
    
    lines.append("")
    return "\n".join(lines)


def format_light_output(question: str, result: Dict, elapsed: float) -> str:
    """Format light-weight check output."""
    lines = [
        "\n🟢 Circle Quick Check (Light Weight)",
        "═" * 40,
        f"📋 Question: {question}",
        f"⏱️ Elapsed: {elapsed:.1f}s",
        "",
        "🔧 Critical Assessment:",
        f"   {result.get('critical_assessment', 'N/A')}",
        "",
        "💜 Empathy Assessment:",
        f"   {result.get('empathy_assessment', 'N/A')}",
        "",
    ]
    
    if result.get("concerns"):
        lines.append("⚠️ Concerns:")
        for c in result["concerns"]:
            lines.append(f"   • {c}")
        lines.append("")
    
    if result.get("suggestions"):
        lines.append("💡 Suggestions:")
        for s in result["suggestions"]:
            lines.append(f"   • {s}")
        lines.append("")
    
    vote = result.get("vote", "PAUSE")
    vote_emoji = {"PROCEED": "✅", "ADJUST": "⚠️", "PAUSE": "🛑"}.get(vote, "❓")
    lines.append(f"{vote_emoji} Recommendation: {vote}")
    lines.append(f"   Confidence: {result.get('confidence', 50)}%")
    
    if result.get("recommendation"):
        lines.append(f"   {result['recommendation']}")
    
    lines.append("")
    return "\n".join(lines)


# ════════════════════════════════════════════════════════════════════════════
# Logging
# ════════════════════════════════════════════════════════════════════════════

def save_log(question: str, weight: str, model: str, responses: List[Dict], aggregation: Dict, elapsed: float) -> str:
    """Save deliberation log to memory/counsel/."""
    MEMORY_DIR.mkdir(parents=True, exist_ok=True)
    
    timestamp = datetime.now()
    slug = re.sub(r'[^a-z0-9]+', '-', question.lower()[:30]).strip('-')
    filename = f"{timestamp.strftime('%Y-%m-%d-%H-%M')}-{slug}.md"
    filepath = MEMORY_DIR / filename
    
    content = [
        f"# 💜 Circle Decision: {question[:60]}...",
        "",
        f"**Timestamp:** {timestamp.isoformat()}",
        f"**Weight:** {weight}",
        f"**Model:** {model}",
        f"**Elapsed:** {elapsed:.1f}s",
        "",
        "## Question",
        question,
        "",
        "## Counselor Responses",
        ""
    ]
    
    for r in responses:
        emoji = r.get("perspective_emoji", "❓")
        perspective = r.get("perspective", "unknown")
        content.append(f"### {emoji} {perspective}")
        content.append(f"**Vote:** {r.get('vote', 'N/A')} | **Confidence:** {r.get('confidence', 0)}%")
        content.append("")
        content.append(f"**Assessment:** {r.get('assessment', 'N/A')}")
        content.append("")
        if r.get("concerns"):
            content.append("**Concerns:**")
            for c in r["concerns"]:
                content.append(f"- {c}")
            content.append("")
        if r.get("key_risk"):
            content.append(f"**Key Risk:** {r['key_risk']}")
        content.append("")
    
    content.extend([
        "## Aggregated Decision",
        "",
        f"**Decision:** {aggregation['decision']}",
        f"**Votes for winner:** {aggregation['votes_for_winner']}/{aggregation['total_responding']}",
        f"**Unanimous:** {aggregation['unanimous']}",
        f"**Avg Confidence:** {aggregation['avg_confidence']}%",
        "",
    ])
    
    if aggregation["dissent"]["exists"]:
        content.append("### Dissent")
        content.append(f"**Count:** {aggregation['dissent']['count']}")
        content.append(f"**Flagged:** {aggregation['dissent']['flagged']}")
        for perspective, concern in zip(aggregation["dissent"]["perspectives"], aggregation["dissent"]["concerns"]):
            if concern:
                content.append(f"- **{perspective}:** {concern}")
        content.append("")
    
    filepath.write_text("\n".join(content))
    return str(filepath)


# ════════════════════════════════════════════════════════════════════════════
# Main
# ════════════════════════════════════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(
        description="💜 The Circle — Multi-Perspective Thinking CLI",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  circle "Should I refactor the auth module?" --weight standard
  circle "How to phrase this feedback?" --weight light --focus empathy
  circle --convene "Architecture: monorepo vs polyrepo"
  circle "Is this secure?" --weight elevated --perspectives guardian,skeptic
        """
    )
    
    parser.add_argument("question", nargs="?", help="The question or situation to analyze")
    parser.add_argument("--convene", metavar="QUESTION", help="Convene full Council (shorthand for --weight council)")
    parser.add_argument("--weight", "-w", choices=["internal", "light", "standard", "elevated", "council"],
                        default="standard", help="Weight level (default: standard)")
    parser.add_argument("--focus", "-f", choices=["critical", "empathy", "both"],
                        default="both", help="Which perspective group to emphasize")
    parser.add_argument("--perspectives", "-p", help="Comma-separated list of specific perspectives")
    parser.add_argument("--context", "-c", help="Additional context for the question")
    parser.add_argument("--output", "-o", choices=["human", "json"], default="human",
                        help="Output format (default: human)")
    parser.add_argument("--log", "-l", action="store_true", help="Save log to memory/counsel/")
    parser.add_argument("--quiet", "-q", action="store_true", help="Minimal output (just decision)")
    parser.add_argument("--debug", "-d", action="store_true", help="Show debug output")
    
    args = parser.parse_args()
    
    # Handle --convene shorthand
    if args.convene:
        question = args.convene
        weight = "council"
    elif args.question:
        question = args.question
        weight = args.weight
    else:
        parser.print_help()
        sys.exit(1)
    
    # Handle internal weight
    if weight == "internal":
        result = run_internal_check(question)
        if args.output == "json":
            print(json.dumps(result, indent=2))
        else:
            print("\n💭 Internal Check (no agents spawned)")
            print("═" * 40)
            print(f"📋 Question: {question}")
            print("\n🧠 Critical: Logic sound? Risks? Realistic?")
            print("💜 Empathy: How will they feel? Tone right? What do they need?")
            print("\n→ Use your own judgment with these lenses.\n")
        return
    
    # Get configuration
    config = WEIGHT_CONFIG[weight]
    model = config["model"]
    
    # Determine perspectives
    if args.perspectives:
        perspectives = [p.strip() for p in args.perspectives.split(",")]
        # Validate
        for p in perspectives:
            if p not in PERSPECTIVES:
                print(f"Error: Unknown perspective '{p}'", file=sys.stderr)
                print(f"Available: {', '.join(PERSPECTIVES.keys())}", file=sys.stderr)
                sys.exit(1)
    else:
        perspectives = config["perspectives"]
        # Filter by focus
        if args.focus == "critical":
            perspectives = [p for p in perspectives if PERSPECTIVES[p]["type"] == "critical"]
        elif args.focus == "empathy":
            perspectives = [p for p in perspectives if PERSPECTIVES[p]["type"] == "empathy"]
    
    # Light weight uses combined prompt
    if weight == "light" and not args.perspectives:
        print("🟢 Spawning quick checker...", file=sys.stderr)
        start = time.time()
        result = run_light_check(question, args.context, debug=args.debug)
        elapsed = time.time() - start
        
        if args.output == "json":
            result["weight"] = weight
            result["model"] = model
            result["elapsed"] = elapsed
            print(json.dumps(result, indent=2))
        elif args.quiet:
            print(result.get("vote", "PAUSE"))
        else:
            print(format_light_output(question, result, elapsed))
        
        if args.log:
            # Simple log for light weight
            MEMORY_DIR.mkdir(parents=True, exist_ok=True)
            timestamp = datetime.now()
            slug = re.sub(r'[^a-z0-9]+', '-', question.lower()[:30]).strip('-')
            filename = f"{timestamp.strftime('%Y-%m-%d-%H-%M')}-{slug}.md"
            filepath = MEMORY_DIR / filename
            filepath.write_text(f"# Light Check: {question}\n\n```json\n{json.dumps(result, indent=2)}\n```\n")
            print(f"📝 Logged to: {filepath}", file=sys.stderr)
        return
    
    # Spawn counselors in parallel
    n_counselors = len(perspectives)
    print(f"{'🔴' if weight == 'council' else '🟡'} Spawning {n_counselors} counselors ({weight}/{model})...", file=sys.stderr)
    
    start = time.time()
    responses = []
    
    with ThreadPoolExecutor(max_workers=min(n_counselors, 7)) as executor:
        futures = {
            executor.submit(spawn_counselor, p, question, args.context, weight, model): p
            for p in perspectives
        }
        
        for i, future in enumerate(as_completed(futures), 1):
            perspective = futures[future]
            emoji = PERSPECTIVES[perspective]["emoji"]
            print(f"   {emoji} {perspective} responded ({i}/{n_counselors})", file=sys.stderr)
            try:
                responses.append(future.result())
            except Exception as e:
                responses.append({
                    "perspective": perspective,
                    "perspective_emoji": PERSPECTIVES[perspective]["emoji"],
                    "error": str(e),
                    "vote": "abstain",
                    "confidence": 0
                })
    
    elapsed = time.time() - start
    
    # Aggregate
    aggregation = aggregate_votes(responses)
    aggregation["weight"] = weight
    aggregation["model"] = model
    aggregation["counselors_spawned"] = n_counselors
    aggregation["counselors_responded"] = len([r for r in responses if r.get("vote", "").upper() != "ABSTAIN"])
    aggregation["quorum_met"] = aggregation["counselors_responded"] >= max(2, n_counselors // 2)
    aggregation["elapsed"] = elapsed
    
    # Output
    if args.output == "json":
        output = {
            "question": question,
            **aggregation,
            "counselor_votes": responses
        }
        print(json.dumps(output, indent=2))
    elif args.quiet:
        print(aggregation["decision"])
    else:
        print(format_human_output(question, weight, model, responses, aggregation, elapsed))
    
    # Log if requested
    if args.log:
        logfile = save_log(question, weight, model, responses, aggregation, elapsed)
        print(f"📝 Logged to: {logfile}", file=sys.stderr)


if __name__ == "__main__":
    main()
