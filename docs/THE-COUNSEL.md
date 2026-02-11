# The Counsel - Multi-Agent Deliberation System

> *"In the multitude of counselors there is safety."* - Proverbs 11:14

## Overview

The Counsel is a high-stakes decision-making framework that spawns multiple Claude instances to deliberate from different perspectives, vote, and reach consensus. It's designed for **mission-critical decisions only** where the cost of being wrong significantly outweighs the cost of deliberation.

## When to Use The Counsel

### ✅ USE for:
- Architecture decisions that affect the entire system
- Security-critical choices (auth, encryption, access control)
- Data model changes that are hard to reverse
- Strategic pivots (like HAOS v2 decision)
- Deployment decisions for production systems
- Breaking changes to APIs or interfaces
- Decisions with significant financial implications

### ❌ DO NOT USE for:
- Routine code changes
- Styling decisions
- Documentation updates
- Simple bug fixes
- Decisions that are easily reversible
- Low-stakes choices

## Configuration

### Complexity Levels

| Level | Counselors | Model | Use When |
|-------|-----------|-------|----------|
| **Standard** | 3 | Sonnet | Important but recoverable decisions |
| **Elevated** | 5 | Sonnet | Complex with multiple stakeholders |
| **Critical** | 5 | Opus | Mission-critical, hard to reverse |
| **Maximum** | 7 | Opus | Existential decisions, highest stakes |

### Cost Awareness

| Config | Est. Cost per Decision |
|--------|----------------------|
| 3x Sonnet | ~$0.15-0.30 |
| 5x Sonnet | ~$0.25-0.50 |
| 5x Opus | ~$1.50-3.00 |
| 7x Opus | ~$2.00-4.00 |

**Rule:** If you wouldn't pay $3 to get this decision right, don't use Opus mode.

## Perspectives (Assigned to Counselors)

Each counselor is assigned a distinct perspective to ensure diverse thinking:

1. **The Architect** - System design, scalability, technical debt
2. **The Guardian** - Security, privacy, risk mitigation
3. **The Advocate** - User experience, accessibility, adoption
4. **The Pragmatist** - Implementation complexity, timeline, resources
5. **The Visionary** - Long-term implications, future flexibility
6. **The Skeptic** - Edge cases, failure modes, what could go wrong
7. **The Historian** - Precedent, patterns, lessons from past decisions

## Protocol

### 1. Convening The Counsel

```
COUNSEL CONVENED
================
Question: [The decision to be made]
Context: [Relevant background]
Options: [A, B, C, ...]
Stakes: [Why this matters]
Complexity: [standard|elevated|critical|maximum]
```

### 2. Deliberation Phase

Each counselor receives:
- The question and context
- Their assigned perspective
- Instructions to:
  1. Analyze from their perspective
  2. Consider contingencies and dependencies
  3. Identify risks and mitigations
  4. Cast a vote with reasoning

### 3. Voting Phase

Each counselor outputs:
```
VOTE: [Option]
CONFIDENCE: [high|medium|low]
REASONING: [2-3 sentences]
KEY CONCERN: [Main risk if this choice is wrong]
```

### 4. Tallying & Decision

```
COUNSEL DECISION
================
Votes: A=3, B=2, C=0
Winner: Option A (60% consensus)

Summary of reasoning:
- [Aggregated key points]

Dissenting concerns:
- [Key points from minority votes]

Recommended mitigations:
- [Actions to address minority concerns]

DECISION: [Final choice]
```

## Implementation

### Invocation (from agent code)

```javascript
// In a sub-agent or main agent
const decision = await counsel({
  question: "Should we use PostgreSQL or SQLite for local storage?",
  context: "Building a self-hosted app that needs to work offline...",
  options: ["PostgreSQL", "SQLite", "Both with sync"],
  stakes: "Database choice affects deployment complexity and offline capability",
  complexity: "elevated" // 5 counselors, Sonnet
});

// Returns: { decision: "SQLite", votes: {...}, reasoning: "...", concerns: [...] }
```

### As a Skill (invoked by agents)

Agents can invoke The Counsel by:
1. Reading this spec
2. Spawning N sub-agents with perspective assignments
3. Collecting votes
4. Aggregating and deciding

### As a CLI Tool (future)

```bash
counsel ask \
  --question "Should we migrate to microservices?" \
  --context "Current monolith is getting hard to maintain..." \
  --options "microservices,modular-monolith,keep-current" \
  --complexity critical
```

## Abuse Prevention

### Automatic Triggers (must use Counsel)
- Changes to authentication/authorization systems
- Database schema migrations in production
- API breaking changes
- Security-related decisions

### Rate Limiting
- Max 3 Opus councils per day per agent
- Max 10 Sonnet councils per day per agent
- Cooldown: 5 minutes between councils

### Audit Trail
Every council decision is logged to:
- `memory/counsel/YYYY-MM-DD-HH-MM-question-slug.md`
- Includes: question, votes, reasoning, final decision

## Integration with Proactive Jobs

When a proactive task encounters a critical decision:

1. Task pauses and documents the decision needed
2. Task spawns The Counsel with appropriate complexity
3. Counsel deliberates and returns decision
4. Task resumes with the decided path
5. Decision is logged to memory

## Example Council Session

```markdown
COUNSEL CONVENED
================
Question: Should HAOS use Element Web reskinning or Discord clone + Matrix backend?
Context: We've been struggling with Element Web's complex architecture...
Options: [A] Continue Element reskinning, [B] Discord clone + Matrix
Stakes: This determines months of development direction
Complexity: critical (5 Opus counselors)

---

COUNSELOR 1 (The Architect):
VOTE: B
CONFIDENCE: high
REASONING: Discord clone has clean separation of concerns. Element's architecture 
fights against Discord-style UI. Technical debt of reskinning will compound.
KEY CONCERN: Matrix SDK integration complexity in new frontend.

COUNSELOR 2 (The Guardian):
VOTE: B
CONFIDENCE: high
REASONING: Both approaches use Matrix, so E2EE is preserved. Clean codebase 
is easier to audit for security issues.
KEY CONCERN: Must ensure Matrix SDK is properly integrated for encryption.

COUNSELOR 3 (The Pragmatist):
VOTE: B
CONFIDENCE: high
REASONING: 847 remaining tasks in current approach vs fresh start. 
Sunk cost fallacy shouldn't drive decision.
KEY CONCERN: Learning curve for new codebase.

COUNSELOR 4 (The Advocate):
VOTE: B
CONFIDENCE: medium
REASONING: Discord clone already looks like Discord - better UX faster.
KEY CONCERN: May need to add accessibility features Discord clone lacks.

COUNSELOR 5 (The Skeptic):
VOTE: A
CONFIDENCE: low
REASONING: We've invested significant work. Pivot means starting over.
KEY CONCERN: What if Discord clone has hidden complexity we haven't found?

---

COUNSEL DECISION
================
Votes: A=1, B=4
Winner: Option B (80% consensus)

Summary: Clean architecture, faster path to Discord UX, security preserved.

Dissenting concern: Sunk cost and unknown complexity in new approach.

Mitigations:
- Thorough audit of Discord clone before committing
- Port reusable code from Element work
- Validate Matrix SDK integration early

DECISION: Proceed with Discord clone + Matrix backend approach.
```

## Files

- Spec: `/home/ubuntu/clawd/docs/THE-COUNSEL.md` (this file)
- Skill: `/home/ubuntu/clawd/skills/counsel/SKILL.md`
- Logs: `/home/ubuntu/clawd/memory/counsel/`
- Script: `/home/ubuntu/clawd/tools/counsel/counsel.js`

## Version History

- v1.0 (2026-02-11): Initial design and implementation
