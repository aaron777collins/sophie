# 💜 Circle CLI

Multi-perspective thinking tool based on The Circle framework.

## Installation

```bash
sudo ln -sf /home/ubuntu/clawd/tools/circle/circle.py /usr/local/bin/circle
```

## Usage

```bash
# Quick internal check (no agents spawned)
circle "Should I add caching?" --weight internal

# Light weight (1-2 Haiku agents)
circle "Is this API design clean?" --weight light

# Standard weight (3 Sonnet agents) - DEFAULT
circle "Should I refactor this module?"

# Elevated weight (5 Sonnet agents)
circle "Is this architecture secure?" --weight elevated

# Full Council (7 Opus agents)
circle --convene "Should we migrate to self-hosted?"
# or
circle "Migration decision" --weight council
```

## Options

| Option | Short | Description |
|--------|-------|-------------|
| `--weight` | `-w` | Weight level: internal, light, standard, elevated, council |
| `--focus` | `-f` | Focus: critical, empathy, or both |
| `--perspectives` | `-p` | Specific perspectives: architect,skeptic,empath |
| `--context` | `-c` | Additional context for the question |
| `--output` | `-o` | Output format: human or json |
| `--log` | `-l` | Save to memory/counsel/ |
| `--quiet` | `-q` | Minimal output (just the decision) |
| `--debug` | `-d` | Show debug output |

## Weight Levels

| Weight | Agents | Model | Cost | Use Case |
|--------|--------|-------|------|----------|
| 💭 internal | 0 | self | $0 | Quick sanity check |
| 🟢 light | 1-2 | Haiku | ~$0.02 | Worth a second thought |
| 🟡 standard | 3 | Sonnet | ~$0.15 | Important decisions |
| 🟠 elevated | 5 | Sonnet | ~$0.30 | Complex, multi-stakeholder |
| 🔴 council | 5-7 | Opus | ~$2-3 | Mission-critical |

## Perspectives

**Critical:**
- 🏛️ architect - System design, scalability
- 🛡️ guardian - Security, risk
- 🔧 pragmatist - Implementation, feasibility
- 🔍 skeptic - Edge cases, blind spots
- 🔮 visionary - Long-term, flexibility
- 📚 historian - Precedent, patterns

**Empathy:**
- 💭 mind - Thoughts, beliefs
- 💔 heart - Emotions, feelings
- 🎯 needs - Real needs vs stated wants
- 🤝 relationship - Trust, connection
- 💜 empath - Overall emotional impact

## Examples

```bash
# Get JSON output
circle "Is this secure?" --weight standard --output json

# Focus on empathy perspectives
circle "How to deliver feedback?" --focus empathy

# Use specific perspectives
circle "Code review" --perspectives skeptic,pragmatist

# Log the decision
circle "Architecture choice" --weight elevated --log

# Convene full Council for critical decision
circle --convene "Breaking change to public API"
```

## Output

Human-readable output includes:
- Vote tally (PROCEED/ADJUST/PAUSE)
- Confidence levels per counselor
- Dissenting concerns
- Overall recommendation

JSON output includes full counselor responses and aggregation data.

## Requirements

- Python 3.8+
- claude CLI (authenticated via `anthropic:claude-cli` profile)

## See Also

- `/home/ubuntu/clawd/skills/circle/SKILL.md` - Full framework spec
- `/home/ubuntu/clawd/docs/THE-CIRCLE.md` - Conceptual documentation
