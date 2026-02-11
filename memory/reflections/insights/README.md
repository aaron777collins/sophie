# Insights Index

This directory tracks **recurring patterns** discovered during self-reflection. Unlike daily reflection logs (which capture raw observations), this index identifies trends that appear repeatedly over time.

## Structure

- `index.json` — Master index of all patterns with schema and statistics
- `helpers/` — Scripts to query and update patterns

## Pattern Categories

| Category | Description |
|----------|-------------|
| `behavior` | How I act and respond in various situations |
| `communication` | Patterns in how I interact and express things |
| `technical` | Technical strengths, weaknesses, or tendencies |
| `process` | Workflow and methodology patterns |
| `emotional` | Patterns in emotional responses and empathy |

## Pattern Types

| Type | Description |
|------|-------------|
| `strength` | Positive patterns to maintain/leverage |
| `weakness` | Areas needing improvement |
| `tendency` | Neutral recurring behaviors |
| `insight` | Meta-observations about myself |

## Using the Helpers

### Query patterns
```bash
./helpers/query-insights.py                    # List all
./helpers/query-insights.py --category behavior
./helpers/query-insights.py --type weakness
./helpers/query-insights.py --stats
```

### Add new pattern
```bash
./helpers/add-pattern.py \
  --name "Over-explaining" \
  --category communication \
  --type tendency \
  --description "Tendency to provide more detail than needed"
```

### Log new instance of existing pattern
```bash
./helpers/add-pattern.py \
  --id pattern-001 \
  --add-instance \
  --context "User asked simple question, gave 3 paragraphs" \
  --outcome negative
```

## Workflow

1. **Daily reflection** logs observations to `memory/reflections/daily/`
2. **Nightly reflection agent** identifies recurring themes
3. **New patterns** get added here via `add-pattern.py`
4. **Repeat occurrences** logged as instances
5. **Periodic review** assesses frequency, impact, and improvement actions

## Created

2025-06-28 — Part of self-reflection system initialization
