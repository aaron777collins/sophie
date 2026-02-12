#!/usr/bin/env python3
"""
circle - Multi-perspective thinking CLI tool

Invoke The Circle at any weight level for thoughtful pre-response thinking.

Usage:
    circle "Should I refactor the auth module?" --weight standard
    circle "How to phrase this feedback?" --weight light --focus empathy
    circle --convene "Architecture: monorepo vs polyrepo"  # Full Council

Weight Levels:
    internal  - Quick self-check (no agents, just structured thinking)
    light     - 1-2 Haiku agents (~$0.02, ~5s)
    standard  - 3 Sonnet agents (~$0.15, ~30s)
    elevated  - 5 Sonnet agents (~$0.30, ~45s)
    council   - 5-7 Opus agents (~$2-3, ~90s) - "The Counsel"
"""

import argparse
import asyncio
import json
import os
import re
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional

# ANSI color codes
class Colors:
    RESET = '\033[0m'
    BOLD = '\033[1m'
    DIM = '\033[2m'
    
    RED = '\033[91m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    MAGENTA = '\033[95m'
    CYAN = '\033[96m'
    WHITE = '\033[97m'
    
    # Weight level colors
    INTERNAL = '\033[90m'  # Gray
    LIGHT = '\033[92m'     # Green
    STANDARD = '\033[93m'  # Yellow
    ELEVATED = '\033[38;5;208m'  # Orange
    COUNCIL = '\033[91m'   # Red

# Configuration
WEIGHT_CONFIG = {
    'internal': {'agents': 0, 'model': None, 'cost': 0},
    'light': {'agents': 2, 'model': 'haiku', 'cost': 0.02},
    'standard': {'agents': 3, 'model': 'sonnet', 'cost': 0.15},
    'elevated': {'agents': 5, 'model': 'sonnet', 'cost': 0.30},
    'council': {'agents': 7, 'model': 'opus', 'cost': 2.50},
}

# Perspective definitions
CRITICAL_PERSPECTIVES = {
    'architect': {
        'emoji': '🏛️',
        'name': 'The Architect',
        'focus': 'System design, scalability, structure',
        'question': 'How does this affect the whole system?'
    },
    'guardian': {
        'emoji': '🛡️',
        'name': 'The Guardian',
        'focus': 'Security, privacy, risk, failure modes',
        'question': "What's the worst case? How do we prevent it?"
    },
    'pragmatist': {
        'emoji': '🔧',
        'name': 'The Pragmatist',
        'focus': 'Implementation, timeline, resources',
        'question': "Can we actually do this? What's realistic?"
    },
    'skeptic': {
        'emoji': '🔍',
        'name': 'The Skeptic',
        'focus': 'Edge cases, assumptions, blind spots',
        'question': "What are we missing? What if we're wrong?"
    },
    'visionary': {
        'emoji': '🔮',
        'name': 'The Visionary',
        'focus': 'Long-term, flexibility, future impact',
        'question': 'How does this position us for the future?'
    },
    'historian': {
        'emoji': '📚',
        'name': 'The Historian',
        'focus': 'Precedent, patterns, lessons learned',
        'question': 'What have others done? What patterns apply?'
    },
}

EMPATHY_PERSPECTIVES = {
    'mind': {
        'emoji': '💭',
        'name': 'Their Mind',
        'focus': 'Thoughts, beliefs, assumptions',
        'question': 'What are they actually thinking?'
    },
    'heart': {
        'emoji': '💔',
        'name': 'Their Heart',
        'focus': 'Emotions, feelings, mood',
        'question': 'How do they feel about this?'
    },
    'needs': {
        'emoji': '🎯',
        'name': 'Their Needs',
        'focus': 'Real needs vs stated wants',
        'question': 'What do they actually need?'
    },
    'relationship': {
        'emoji': '🤝',
        'name': 'The Relationship',
        'focus': 'Trust, connection, dynamics',
        'question': 'How does this impact our relationship?'
    },
    'empath': {
        'emoji': '💜',
        'name': 'The Empath',
        'focus': 'Overall emotional impact',
        'question': 'How will this land emotionally?'
    },
}

ALL_PERSPECTIVES = {**CRITICAL_PERSPECTIVES, **EMPATHY_PERSPECTIVES}

# Default perspectives by weight
DEFAULT_PERSPECTIVES = {
    'light': ['pragmatist', 'empath'],
    'standard': ['pragmatist', 'skeptic', 'empath'],
    'elevated': ['architect', 'guardian', 'pragmatist', 'skeptic', 'empath'],
    'council': ['architect', 'guardian', 'pragmatist', 'skeptic', 'visionary', 'empath', 'relationship'],
}


def get_model_name(model: str) -> str:
    """Get the full model name for Claude CLI."""
    models = {
        'haiku': 'claude-3-5-haiku-latest',
        'sonnet': 'claude-sonnet-4-20250514',
        'opus': 'opus',
    }
    return models.get(model, model)


def slugify(text: str) -> str:
    """Create a URL-friendly slug from text."""
    text = text.lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    return text[:50].strip('-')


def print_header(question: str, weight: str, perspectives: list):
    """Print a nice header for the Circle session."""
    color = getattr(Colors, weight.upper(), Colors.WHITE)
    emoji = {'internal': '💭', 'light': '🟢', 'standard': '🟡', 'elevated': '🟠', 'council': '🔴'}[weight]
    
    print()
    print(f"{Colors.BOLD}╔{'═' * 70}╗{Colors.RESET}")
    print(f"{Colors.BOLD}║{color}  {emoji} THE CIRCLE — {weight.upper()} WEIGHT{Colors.RESET}{Colors.BOLD}{' ' * (52 - len(weight))}║{Colors.RESET}")
    print(f"{Colors.BOLD}╠{'═' * 70}╣{Colors.RESET}")
    print(f"{Colors.BOLD}║{Colors.RESET} 📋 Question: {question[:53]:<53}{Colors.BOLD}║{Colors.RESET}")
    if len(question) > 53:
        remaining = question[53:]
        while remaining:
            chunk = remaining[:67]
            remaining = remaining[67:]
            print(f"{Colors.BOLD}║{Colors.RESET}    {chunk:<67}{Colors.BOLD}║{Colors.RESET}")
    
    config = WEIGHT_CONFIG[weight]
    persp_str = ', '.join([ALL_PERSPECTIVES[p]['emoji'] for p in perspectives[:7]])
    print(f"{Colors.BOLD}║{Colors.RESET} 👥 Counselors: {config['agents']} ({persp_str}){' ' * max(0, 47 - len(persp_str))}{Colors.BOLD}║{Colors.RESET}")
    if config['model']:
        print(f"{Colors.BOLD}║{Colors.RESET} 🤖 Model: {config['model'].capitalize():<57}{Colors.BOLD}║{Colors.RESET}")
    print(f"{Colors.BOLD}╚{'═' * 70}╝{Colors.RESET}")
    print()


def build_perspective_prompt(perspective_id: str, question: str, context: str = '', options: list = None) -> str:
    """Build the prompt for a specific perspective."""
    p = ALL_PERSPECTIVES[perspective_id]
    
    options_text = ''
    if options:
        options_text = '\nOPTIONS:\n' + '\n'.join([f'{chr(65+i)}) {opt}' for i, opt in enumerate(options)])
    
    context_text = f'\nCONTEXT:\n{context}' if context else ''
    
    return f"""You are {p['emoji']} {p['name']} — focused on {p['focus']}.

Your key question: "{p['question']}"

QUESTION: {question}{options_text}{context_text}

Analyze this from your perspective. Also consider empathy — how does this affect the humans involved?

Respond in this exact JSON format (and nothing else):
{{
  "perspective": "{perspective_id}",
  "perspective_emoji": "{p['emoji']}",
  "assessment": "[2-4 sentences analyzing from your perspective]",
  "concerns": ["[specific concern 1]", "[specific concern 2]"],
  "suggestions": ["[actionable recommendation 1]", "[actionable recommendation 2]"],
  "vote": "{'[A or B or C or abstain]' if options else '[PROCEED or ADJUST or PAUSE]'}",
  "confidence": [0-100],
  "key_risk": "[main concern if this perspective is ignored]"
}}"""


def run_claude_sync(prompt: str, model: str) -> dict:
    """Run Claude CLI synchronously and return the parsed response."""
    model_name = get_model_name(model)
    
    try:
        result = subprocess.run(
            ['claude', '-p', prompt, '--model', model_name, '--output-format', 'json'],
            capture_output=True,
            text=True,
            timeout=120
        )
        
        if result.returncode != 0:
            return {'error': f'Claude CLI failed: {result.stderr}'}
        
        # Parse the outer JSON from Claude CLI
        try:
            cli_response = json.loads(result.stdout)
            response_text = cli_response.get('result', '')
        except json.JSONDecodeError:
            response_text = result.stdout
        
        # Extract JSON from the response text
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            try:
                return json.loads(json_match.group())
            except json.JSONDecodeError:
                return {'error': 'Failed to parse counselor response', 'raw': response_text}
        
        return {'error': 'No JSON found in response', 'raw': response_text}
        
    except subprocess.TimeoutExpired:
        return {'error': 'Claude CLI timed out'}
    except Exception as e:
        return {'error': str(e)}


async def run_claude_async(prompt: str, model: str, perspective_id: str) -> dict:
    """Run Claude CLI asynchronously."""
    model_name = get_model_name(model)
    
    try:
        proc = await asyncio.create_subprocess_exec(
            'claude', '-p', prompt, '--model', model_name, '--output-format', 'json',
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        
        stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=120)
        
        if proc.returncode != 0:
            return {'perspective': perspective_id, 'error': f'Claude CLI failed: {stderr.decode()}'}
        
        # Parse the outer JSON from Claude CLI
        try:
            cli_response = json.loads(stdout.decode())
            response_text = cli_response.get('result', '')
        except json.JSONDecodeError:
            response_text = stdout.decode()
        
        # Extract JSON from the response text
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            try:
                result = json.loads(json_match.group())
                result['perspective'] = perspective_id  # Ensure perspective is set
                return result
            except json.JSONDecodeError:
                return {'perspective': perspective_id, 'error': 'Failed to parse', 'raw': response_text}
        
        return {'perspective': perspective_id, 'error': 'No JSON found', 'raw': response_text}
        
    except asyncio.TimeoutError:
        return {'perspective': perspective_id, 'error': 'Timed out'}
    except Exception as e:
        return {'perspective': perspective_id, 'error': str(e)}


def do_internal_check(question: str, context: str = '') -> dict:
    """Do a quick internal Circle check (no spawning)."""
    result = {
        'weight': 'internal',
        'question': question,
        'context': context,
        'timestamp': datetime.now().isoformat(),
        'recommendation': 'PROCEED',  # Will be filled in manually
        'internal_check': {
            'critical': {
                'logic_sound': '?',
                'risks': [],
                'realistic': '?'
            },
            'empathy': {
                'interpretation': '?',
                'emotional_state': '?',
                'actual_need': '?'
            }
        }
    }
    
    # Print the internal check template
    print(f"\n{Colors.BOLD}## 💭 Circle Internal Check{Colors.RESET}\n")
    print(f"{Colors.DIM}Situation:{Colors.RESET} {question}")
    if context:
        print(f"{Colors.DIM}Context:{Colors.RESET} {context}")
    print()
    print(f"{Colors.CYAN}🧠 Critical:{Colors.RESET}")
    print(f"   • Logic sound? [analyze]")
    print(f"   • Risks? [list any]")
    print(f"   • Realistic? [yes/no]")
    print()
    print(f"{Colors.MAGENTA}💜 Empathy:{Colors.RESET}")
    print(f"   • How will they read this? [interpretation]")
    print(f"   • Their emotional state? [assessment]")
    print(f"   • What they actually need? [need]")
    print()
    print(f"{Colors.GREEN}→ Decision:{Colors.RESET} [PROCEED / ADJUST: how / PAUSE: why]")
    print()
    
    return result


async def run_circle(
    question: str,
    weight: str = 'standard',
    perspectives: list = None,
    context: str = '',
    options: list = None,
    output_json: bool = False,
    log: bool = False,
    focus: str = 'both'
) -> dict:
    """Run The Circle at the specified weight level."""
    
    # Handle internal weight specially
    if weight == 'internal':
        return do_internal_check(question, context)
    
    config = WEIGHT_CONFIG[weight]
    
    # Determine perspectives to use
    if perspectives is None:
        perspectives = DEFAULT_PERSPECTIVES.get(weight, ['pragmatist', 'empath'])
    
    # Filter by focus if specified
    if focus == 'critical':
        perspectives = [p for p in perspectives if p in CRITICAL_PERSPECTIVES]
    elif focus == 'empathy':
        perspectives = [p for p in perspectives if p in EMPATHY_PERSPECTIVES]
    
    # Ensure we have at least one perspective
    if not perspectives:
        perspectives = ['pragmatist', 'empath']
    
    # Limit perspectives to configured agent count
    perspectives = perspectives[:config['agents']]
    
    if not output_json:
        print_header(question, weight, perspectives)
    
    # Build prompts and run in parallel
    tasks = []
    for p_id in perspectives:
        prompt = build_perspective_prompt(p_id, question, context, options)
        tasks.append(run_claude_async(prompt, config['model'], p_id))
    
    # Progress indicator
    if not output_json:
        print(f"{Colors.DIM}⏳ Consulting {len(perspectives)} counselors...{Colors.RESET}", flush=True)
    
    # Run all perspectives in parallel
    responses = await asyncio.gather(*tasks)
    
    # Aggregate results
    result = aggregate_responses(question, weight, config['model'], perspectives, responses, options)
    result['context'] = context
    
    # Print results
    if not output_json:
        print_results(result)
    
    # Log if requested
    if log:
        log_path = save_log(result)
        result['log_file'] = str(log_path)
        if not output_json:
            print(f"\n{Colors.DIM}📝 Logged to: {log_path}{Colors.RESET}")
    
    return result


def aggregate_responses(question: str, weight: str, model: str, perspectives: list, responses: list, options: list = None) -> dict:
    """Aggregate counselor responses into a final result."""
    
    valid_responses = [r for r in responses if 'error' not in r]
    failed_responses = [r for r in responses if 'error' in r]
    
    # Count votes
    tally = {}
    counselor_votes = []
    
    for resp in valid_responses:
        vote = resp.get('vote', 'abstain')
        confidence = resp.get('confidence', 50)
        p_id = resp.get('perspective', 'unknown')
        
        if vote not in tally:
            tally[vote] = {'count': 0, 'voters': [], 'confidences': []}
        tally[vote]['count'] += 1
        tally[vote]['voters'].append(p_id)
        tally[vote]['confidences'].append(confidence)
        
        counselor_votes.append({
            'perspective': p_id,
            'emoji': ALL_PERSPECTIVES.get(p_id, {}).get('emoji', '❓'),
            'vote': vote,
            'confidence': confidence,
            'assessment': resp.get('assessment', ''),
            'concerns': resp.get('concerns', []),
            'suggestions': resp.get('suggestions', []),
            'key_risk': resp.get('key_risk', '')
        })
    
    # Calculate average confidences
    for vote_key in tally:
        confs = tally[vote_key]['confidences']
        tally[vote_key]['avg_confidence'] = sum(confs) / len(confs) if confs else 0
        del tally[vote_key]['confidences']  # Clean up
    
    # Determine winner
    decision = None
    max_votes = 0
    tied = []
    
    for vote_key, data in tally.items():
        if vote_key == 'abstain':
            continue
        if data['count'] > max_votes:
            max_votes = data['count']
            decision = vote_key
            tied = []
        elif data['count'] == max_votes:
            tied.append(vote_key)
    
    if tied:
        tied.insert(0, decision)
        # Tie-breaker: use confidence
        best_conf = 0
        for t in tied:
            if tally[t]['avg_confidence'] > best_conf:
                best_conf = tally[t]['avg_confidence']
                decision = t
    
    # Check for dissent
    dissenting = [cv for cv in counselor_votes if cv['vote'] != decision and cv['vote'] != 'abstain']
    dissent = {
        'exists': len(dissenting) > 0,
        'count': len(dissenting),
        'perspectives': [d['perspective'] for d in dissenting],
        'concerns': [d['key_risk'] for d in dissenting if d['key_risk']],
        'flagged': len(dissenting) >= 2
    }
    
    # Quorum check
    min_quorum = {7: 5, 5: 4, 3: 2, 2: 1, 1: 1}
    required = min_quorum.get(len(perspectives), 1)
    quorum_met = len(valid_responses) >= required
    
    # Collect all suggestions as mitigations
    mitigations = []
    for cv in counselor_votes:
        if cv['vote'] != decision:
            mitigations.extend(cv['suggestions'])
    
    # Empathy summary
    empathy_assessments = [cv['assessment'] for cv in counselor_votes 
                          if cv['perspective'] in EMPATHY_PERSPECTIVES]
    empathy_summary = ' '.join(empathy_assessments) if empathy_assessments else None
    
    return {
        'question': question,
        'weight': weight,
        'model': model,
        'timestamp': datetime.now().isoformat(),
        'counselors_spawned': len(perspectives),
        'counselors_responded': len(valid_responses),
        'counselors_failed': [r.get('perspective', 'unknown') for r in failed_responses],
        'quorum_met': quorum_met,
        'tally': tally,
        'decision': decision,
        'decision_text': decision,
        'votes_for_winner': max_votes,
        'unanimous': max_votes == len(valid_responses) and len(valid_responses) > 0,
        'tied': tied if len(tied) > 1 else None,
        'counselor_votes': counselor_votes,
        'dissent': dissent,
        'empathy_summary': empathy_summary,
        'mitigations': mitigations[:3],  # Top 3
    }


def print_results(result: dict):
    """Print the Circle results in a nice format."""
    
    print(f"\n{Colors.BOLD}─── 🗳️ Votes ───{Colors.RESET}\n")
    
    for cv in result['counselor_votes']:
        conf_color = Colors.GREEN if cv['confidence'] >= 75 else (Colors.YELLOW if cv['confidence'] >= 50 else Colors.RED)
        print(f"  {cv['emoji']} {cv['perspective'].capitalize():12} │ {cv['vote']:8} │ {conf_color}{cv['confidence']:3}%{Colors.RESET} │ {cv['assessment'][:50]}...")
    
    print(f"\n{Colors.BOLD}─── 📊 Tally ───{Colors.RESET}\n")
    
    total_votes = sum(v['count'] for k, v in result['tally'].items() if k != 'abstain')
    for vote, data in sorted(result['tally'].items(), key=lambda x: -x[1]['count']):
        if vote == 'abstain':
            continue
        pct = int((data['count'] / total_votes) * 100) if total_votes > 0 else 0
        bar = '█' * (pct // 5) + '░' * (20 - pct // 5)
        print(f"  {vote}: {bar} {data['count']} votes ({pct}%) - avg conf: {data['avg_confidence']:.0f}%")
    
    decision_color = Colors.GREEN if result['unanimous'] else Colors.YELLOW
    print(f"\n{Colors.BOLD}✅ Decision: {decision_color}{result['decision']}{Colors.RESET}")
    
    if result['unanimous']:
        print(f"   {Colors.GREEN}(Unanimous){Colors.RESET}")
    
    if result['dissent']['exists']:
        print(f"\n{Colors.BOLD}─── ⚠️ Dissent ───{Colors.RESET}")
        print(f"  {result['dissent']['count']} counselor(s) disagreed: {', '.join(result['dissent']['perspectives'])}")
        for concern in result['dissent']['concerns']:
            print(f"  • {concern}")
    
    if result['empathy_summary']:
        print(f"\n{Colors.BOLD}─── 💜 Empathy Summary ───{Colors.RESET}")
        print(f"  {result['empathy_summary'][:200]}...")
    
    if result['mitigations']:
        print(f"\n{Colors.BOLD}─── 🛡️ Mitigations ───{Colors.RESET}")
        for m in result['mitigations']:
            print(f"  • {m}")
    
    if not result['quorum_met']:
        print(f"\n{Colors.RED}⚠️ WARNING: Quorum not met! Only {result['counselors_responded']}/{result['counselors_spawned']} responded.{Colors.RESET}")
    
    print()


def save_log(result: dict) -> Path:
    """Save the Circle result to the counsel log directory."""
    log_dir = Path.home() / 'clawd' / 'memory' / 'counsel'
    log_dir.mkdir(parents=True, exist_ok=True)
    
    timestamp = datetime.now().strftime('%Y-%m-%d-%H-%M')
    slug = slugify(result['question'])
    filename = f"{timestamp}-{slug}.md"
    filepath = log_dir / filename
    
    # Build markdown content
    content = f"""# Circle Decision: {result['question']}

**Weight:** {result['weight']}
**Model:** {result['model']}
**Timestamp:** {result['timestamp']}
**Counselors:** {result['counselors_responded']}/{result['counselors_spawned']} responded
**Quorum:** {'✅ Met' if result['quorum_met'] else '❌ Not Met'}

## Decision: {result['decision']}

{'**(Unanimous)**' if result['unanimous'] else ''}

## Votes

| Counselor | Vote | Confidence | Key Risk |
|-----------|------|------------|----------|
"""
    
    for cv in result['counselor_votes']:
        content += f"| {cv['emoji']} {cv['perspective']} | {cv['vote']} | {cv['confidence']}% | {cv.get('key_risk', 'N/A')} |\n"
    
    content += f"""
## Tally

"""
    for vote, data in sorted(result['tally'].items(), key=lambda x: -x[1]['count']):
        content += f"- **{vote}**: {data['count']} votes (avg confidence: {data['avg_confidence']:.0f}%)\n"
        content += f"  - Voters: {', '.join(data['voters'])}\n"
    
    if result['dissent']['exists']:
        content += f"""
## Dissent

**{result['dissent']['count']} counselor(s) disagreed:** {', '.join(result['dissent']['perspectives'])}

Concerns:
"""
        for concern in result['dissent']['concerns']:
            content += f"- {concern}\n"
    
    if result['empathy_summary']:
        content += f"""
## Empathy Summary

{result['empathy_summary']}
"""
    
    if result['mitigations']:
        content += """
## Mitigations

"""
        for m in result['mitigations']:
            content += f"- {m}\n"
    
    # Add full assessments
    content += """
## Full Assessments

"""
    for cv in result['counselor_votes']:
        content += f"""### {cv['emoji']} {cv['perspective'].capitalize()}

**Vote:** {cv['vote']} (Confidence: {cv['confidence']}%)

{cv['assessment']}

**Concerns:**
"""
        for c in cv.get('concerns', []):
            content += f"- {c}\n"
        content += "\n**Suggestions:**\n"
        for s in cv.get('suggestions', []):
            content += f"- {s}\n"
        content += "\n"
    
    # Add JSON for machine readability
    content += f"""
---

## Raw JSON

```json
{json.dumps(result, indent=2)}
```
"""
    
    filepath.write_text(content)
    return filepath


def main():
    parser = argparse.ArgumentParser(
        description='The Circle - Multi-perspective thinking CLI',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  circle "Should I refactor the auth module?" --weight standard
  circle "How to phrase this feedback?" --weight light --focus empathy
  circle --convene "Architecture: monorepo vs polyrepo"
  circle "Redis or PostgreSQL?" --options "Redis,PostgreSQL" --weight standard
  circle "Deploy now?" --weight elevated --log
        """
    )
    
    parser.add_argument('question', nargs='?', help='The question or situation to analyze')
    parser.add_argument('--convene', '-C', metavar='QUESTION', help='Convene full Council (weight=council)')
    parser.add_argument('--weight', '-w', 
                        choices=['internal', 'light', 'standard', 'elevated', 'council'],
                        default='standard',
                        help='Weight level (default: standard)')
    parser.add_argument('--focus', '-f',
                        choices=['critical', 'empathy', 'both'],
                        default='both',
                        help='Focus on critical thinking, empathy, or both (default: both)')
    parser.add_argument('--perspectives', '-p',
                        help='Comma-separated list of specific perspectives to use')
    parser.add_argument('--context', '-c',
                        default='',
                        help='Additional context for the question')
    parser.add_argument('--options', '-o',
                        help='Comma-separated list of options to vote on')
    parser.add_argument('--output', 
                        choices=['text', 'json'],
                        default='text',
                        help='Output format (default: text)')
    parser.add_argument('--log', '-l',
                        action='store_true',
                        help='Save result to memory/counsel/')
    
    args = parser.parse_args()
    
    # Handle --convene shortcut
    if args.convene:
        question = args.convene
        weight = 'council'
    elif args.question:
        question = args.question
        weight = args.weight
    else:
        parser.print_help()
        sys.exit(1)
    
    # Parse perspectives
    perspectives = None
    if args.perspectives:
        perspectives = [p.strip() for p in args.perspectives.split(',')]
        # Validate perspectives
        invalid = [p for p in perspectives if p not in ALL_PERSPECTIVES]
        if invalid:
            print(f"{Colors.RED}Error: Unknown perspectives: {', '.join(invalid)}{Colors.RESET}")
            print(f"Valid perspectives: {', '.join(ALL_PERSPECTIVES.keys())}")
            sys.exit(1)
    
    # Parse options
    options = None
    if args.options:
        options = [o.strip() for o in args.options.split(',')]
    
    # Run the Circle
    try:
        result = asyncio.run(run_circle(
            question=question,
            weight=weight,
            perspectives=perspectives,
            context=args.context,
            options=options,
            output_json=(args.output == 'json'),
            log=args.log,
            focus=args.focus
        ))
        
        if args.output == 'json':
            print(json.dumps(result, indent=2))
            
    except KeyboardInterrupt:
        print(f"\n{Colors.YELLOW}Cancelled.{Colors.RESET}")
        sys.exit(130)
    except Exception as e:
        print(f"{Colors.RED}Error: {e}{Colors.RESET}")
        sys.exit(1)


if __name__ == '__main__':
    main()
