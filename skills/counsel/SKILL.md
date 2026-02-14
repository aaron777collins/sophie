# ⚖️ The Counsel - Multi-Agent Deliberation System

> **The Circle at maximum weight** — For decisions that can't be wrong.

## Quick Start

```bash
# From command line
node ~/clawd/tools/counsel/counsel.js \
  --question "Your decision question" \
  --options "Option A,Option B,Option C" \
  --context "Relevant background and constraints" \
  --complexity standard

# From Node.js
const { convene } = require('~/clawd/tools/counsel/counsel.js');
const result = await convene(question, context, optionsArray, 'standard');
```

## Complexity Levels

| Level | Counselors | Model | Cost | Use When |
|-------|------------|-------|------|----------|
| `light` | 3 | Sonnet | ~$0.15 | Quick gut check |
| `standard` | 3 | Sonnet | ~$0.20 | Normal decisions |
| `elevated` | 5 | Sonnet | ~$0.35 | Multiple stakeholders |
| `critical` | 5 | Opus | ~$2.00 | Important architecture |
| `maximum` | 7 | Opus | ~$3.00 | Mission-critical |

## The Counselors

| Counselor | Focus |
|-----------|-------|
| 🏛️ **The Architect** | System design, scalability, maintainability |
| 🛡️ **The Guardian** | Security, privacy, risk, failure modes |
| 🔧 **The Pragmatist** | Implementation, timeline, resources |
| 🔍 **The Skeptic** | Edge cases, assumptions, what-ifs |
| 🔮 **The Visionary** | Long-term, future flexibility, strategy |
| 💜 **The Empath** | User experience, adoption, emotional impact |
| 📚 **The Historian** | Precedent, patterns, lessons learned |

Counselors are assigned based on complexity level (3, 5, or 7).

## CLI Usage

```bash
# Required arguments
--question    The decision to be made
--options     Comma-separated list of options
--context     Background information

# Optional arguments
--complexity  light|standard|elevated|critical|maximum (default: standard)
--sequential  Query counselors one at a time (slower but cleaner)
--quiet       JSON output only (for scripting)
```

### Examples

```bash
# Quick 3-counselor decision
node tools/counsel/counsel.js \
  --question "Redis or Memcached for caching?" \
  --options "Redis,Memcached" \
  --context "Simple session caching, no persistence needed" \
  --complexity light

# Full 7-counselor council for critical decision
node tools/counsel/counsel.js \
  --question "Which cloud provider for new infrastructure?" \
  --options "AWS,GCP,Azure" \
  --context "New project, need ML capabilities, team has AWS experience" \
  --complexity maximum
```

## Programmatic Usage

```javascript
const { convene } = require('~/workspace/tools/counsel/counsel.js');

async function makeDecision() {
  const result = await convene(
    "Should we use TypeScript or JavaScript?",  // question
    "Building a new backend service, team has mixed TS experience",  // context
    ["TypeScript", "JavaScript"],  // options array
    "standard",  // complexity
    { verbose: true, parallel: false }  // options
  );

  console.log(`Decision: ${result.decision}) ${result.option}`);
  console.log(`Votes: ${result.votes}/${result.total}`);
  console.log(`Unanimous: ${result.unanimous}`);
  console.log(`Log file: ${result.logFile}`);
  
  // Full vote breakdown
  result.counselorVotes.forEach(v => {
    console.log(`${v.perspective}: ${v.vote} (${v.confidence})`);
  });
}
```

### Return Object

```javascript
{
  decision: 'B',           // Winning option letter
  option: 'SQLite',        // Winning option text
  votes: 3,                // Votes for winner
  total: 3,                // Total counselors
  unanimous: true,         // All agreed?
  tied: null,              // ['A', 'B'] if tie
  noVotes: false,          // No valid votes?
  tally: {                 // Full breakdown
    A: { count: 0, voters: [], confidence: [] },
    B: { count: 3, voters: [...], confidence: ['high', 'high', 'high'] }
  },
  counselorVotes: [...],   // Full vote objects
  logFile: '/path/to/log.md',
  timestamp: '2026-02-11T...'
}
```

## Decision Logs

All decisions are logged to: `memory/counsel/YYYY-MM-DD-HH-MM-{slug}.md`

Logs include:
- Full question, context, and options
- Each counselor's vote with reasoning
- Vote tally with visualization
- Dissenting concerns and recommended mitigations
- Complete counselor responses

## When to Use The Counsel

### ✅ Council-Worthy
- Architecture decisions (affects entire system)
- Security choices (hard to fix if wrong)
- Data model changes (difficult to reverse)
- Technology selection (long-term commitment)
- Breaking changes (impacts users)

### ❌ Use Lighter Approaches
- Styling decisions → Just decide
- Minor features → Quick discussion
- Reversible choices → Try it and see
- Time-sensitive → Make a call

**Quick test:** Would you pay $1+ to get this decision right?

## Integration with Agents

Other agents can call The Counsel:

```javascript
// In an agent context
const { convene } = require('~/workspace/tools/counsel/counsel.js');

// Convene council and get decision
const result = await convene(
  userQuestion,
  relevantContext,
  ['Option A', 'Option B'],
  'standard',
  { verbose: false }  // Quiet mode for agent use
);

// Use the decision
if (result.decision === 'A') {
  // Proceed with Option A
}
```

## Technical Notes

- Uses Claude CLI (`claude -p`) for sub-agent queries
- Sequential execution by default for reliability
- Prompts avoid Unicode emoji (causes credential issues with Claude CLI)
- Temp files used for prompt delivery (cleaned up after)
- 3-minute timeout per counselor query

## Related Files

| File | Purpose |
|------|---------|
| `docs/THE-COUNSEL.md` | Full specification |
| `docs/THE-CIRCLE.md` | Broader framework |
| `tools/counsel/counsel.js` | Implementation |
| `memory/counsel/` | Decision logs |

---

*⚖️ The Counsel has spoken.*
