# The Counsel - Multi-Agent Deliberation System

## Summary
A voting system for critical decisions that spawns multiple Claude instances to deliberate from different perspectives, then aggregates votes for consensus.

## Created
[2026-02-11 01:05 EST] - Aaron requested, Sophie designed and implemented

## Files
- Spec: `/home/ubuntu/clawd/docs/THE-COUNSEL.md`
- Skill: `/home/ubuntu/clawd/skills/counsel/SKILL.md`
- Script: `/home/ubuntu/clawd/tools/counsel/counsel.js`
- Logs: `/home/ubuntu/clawd/memory/counsel/`

## Complexity Levels
| Level | Counselors | Model | Est. Cost |
|-------|-----------|-------|-----------|
| standard | 3 | sonnet | ~$0.20 |
| elevated | 5 | sonnet | ~$0.35 |
| critical | 5 | opus | ~$2.00 |
| maximum | 7 | opus | ~$3.00 |

## The 7 Perspectives
1. **The Architect** - System design, scalability
2. **The Guardian** - Security, privacy, risk
3. **The Pragmatist** - Implementation, timeline
4. **The Advocate** - UX, accessibility
5. **The Skeptic** - Edge cases, failures
6. **The Visionary** - Long-term, flexibility
7. **The Historian** - Precedent, patterns

## When to Use
✅ Architecture decisions, security choices, strategic pivots, breaking changes
❌ Styling, minor bugs, documentation, easily reversible choices

## Usage Pattern
1. Agent identifies critical decision
2. Agent chooses complexity based on stakes
3. Agent spawns N counselors with perspective prompts
4. Each counselor votes with reasoning
5. Votes tallied, majority wins
6. Decision logged to memory/counsel/

## Key Design Decisions
- [2026-02-11 01:05 EST] Odd numbers only (3, 5, 7) to avoid ties
- [2026-02-11 01:05 EST] Opus for critical+, Sonnet for standard/elevated
- [2026-02-11 01:05 EST] Rate limits: 3 Opus/day, 10 Sonnet/day
- [2026-02-11 01:05 EST] 5-minute cooldown between councils

## Integration Points
- Can be invoked by any agent via skill
- Can be called via CLI: `node counsel.js --question "..." ...`
- Logs all decisions to memory/counsel/ for audit trail
