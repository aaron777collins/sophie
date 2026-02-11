# The Counsel - Multi-Agent Deliberation Skill

> Use when facing mission-critical decisions that need diverse perspectives.

## Quick Reference

| Complexity | Counselors | Model | Cost | Use For |
|------------|-----------|-------|------|---------|
| standard | 3 | sonnet | ~$0.20 | Important, recoverable |
| elevated | 5 | sonnet | ~$0.35 | Complex, multi-stakeholder |
| critical | 5 | opus | ~$2.00 | Mission-critical |
| maximum | 7 | opus | ~$3.00 | Existential decisions |

## How to Convene The Counsel

### Step 1: Determine if Counsel is Needed

Ask yourself:
- Is this decision hard to reverse? 
- Could being wrong cost significant time/money/security?
- Are there multiple valid approaches with tradeoffs?
- Would I pay $2+ to get this right?

If YES to 2+, convene The Counsel.

### Step 2: Choose Complexity

- **standard (3 sonnet)**: "This matters but we can adjust later"
- **elevated (5 sonnet)**: "This is important and affects multiple areas"
- **critical (5 opus)**: "Getting this wrong would be very costly"
- **maximum (7 opus)**: "This could make or break the project"

### Step 3: Spawn Counselors

Use `sessions_spawn` for each counselor with their perspective:

```
Counselor 1 - The Architect (system design, scalability)
Counselor 2 - The Guardian (security, privacy, risk)
Counselor 3 - The Pragmatist (complexity, timeline, resources)
Counselor 4 - The Advocate (UX, accessibility, adoption)
Counselor 5 - The Skeptic (edge cases, failure modes)
Counselor 6 - The Visionary (long-term, flexibility) [if 7]
Counselor 7 - The Historian (precedent, patterns) [if 7]
```

### Step 4: Counselor Prompt Template

```
You are a Counselor in The Counsel, a multi-agent deliberation system.

YOUR PERSPECTIVE: [The Architect/Guardian/Pragmatist/etc.]
- Focus on: [perspective-specific concerns]

THE QUESTION:
[Question to decide]

CONTEXT:
[Relevant background]

OPTIONS:
A) [Option A]
B) [Option B]
C) [Option C]

YOUR TASK:
1. Analyze this decision from your perspective
2. Consider contingencies and dependencies
3. Identify risks for each option
4. Cast your vote

OUTPUT FORMAT (exactly):
VOTE: [A/B/C]
CONFIDENCE: [high/medium/low]
REASONING: [2-3 sentences from your perspective]
KEY CONCERN: [Main risk if your non-preferred option is chosen]
```

### Step 5: Collect and Tally Votes

Wait for all counselors to respond, then:

1. Count votes for each option
2. Majority wins (that's why odd numbers)
3. Document dissenting concerns
4. Propose mitigations for minority concerns

### Step 6: Log the Decision

Create: `memory/counsel/YYYY-MM-DD-HH-MM-{slug}.md`

```markdown
# Counsel Decision: {Question Summary}

**Convened:** {timestamp}
**Complexity:** {level}
**Counselors:** {N}

## Question
{Full question}

## Context
{Context provided}

## Options
{List options}

## Votes
| Counselor | Vote | Confidence | Reasoning |
|-----------|------|------------|-----------|
| Architect | B | high | ... |
| Guardian | B | medium | ... |
| ... | ... | ... | ... |

## Tally
- Option A: X votes
- Option B: Y votes
- Option C: Z votes

## Decision: {Winner}

## Key Concerns from Dissenters
- {concern 1}
- {concern 2}

## Mitigations Applied
- {mitigation 1}
- {mitigation 2}
```

## Perspective Definitions

### The Architect
Focus: System design, scalability, technical debt, architecture patterns
Ask: "How does this affect our system's structure and maintainability?"

### The Guardian  
Focus: Security, privacy, compliance, risk mitigation, access control
Ask: "What could go wrong? How could this be exploited?"

### The Pragmatist
Focus: Implementation complexity, timeline, resources, team capabilities
Ask: "Can we actually build this? What's the realistic effort?"

### The Advocate
Focus: User experience, accessibility, adoption, stakeholder needs
Ask: "How will users experience this? Will they adopt it?"

### The Skeptic
Focus: Edge cases, failure modes, what-ifs, stress testing assumptions
Ask: "What are we missing? What happens when X fails?"

### The Visionary (5+ counselors)
Focus: Long-term implications, future flexibility, strategic alignment
Ask: "How does this position us for the future?"

### The Historian (7 counselors)
Focus: Precedent, patterns, industry standards, lessons learned
Ask: "What have others done? What patterns apply here?"

## Abuse Prevention

**DO NOT convene Counsel for:**
- Code style decisions
- Minor refactoring
- Documentation updates
- UI color choices
- Anything easily reversible

**Rate Limits:**
- Max 3 Opus councils per day
- Max 10 Sonnet councils per day  
- 5-minute cooldown between councils

**If someone convenes Counsel inappropriately:**
The Counsel should vote "DISMISS - not worthy of deliberation" and log the misuse.

## Example: Quick 3-Counselor Standard Decision

```javascript
// You're deciding whether to use REST or GraphQL for an API

// Spawn 3 counselors
spawn("counsel-architect", perspectivePrompt("Architect", question, options));
spawn("counsel-guardian", perspectivePrompt("Guardian", question, options));  
spawn("counsel-pragmatist", perspectivePrompt("Pragmatist", question, options));

// Wait for responses, tally, decide
// Log to memory/counsel/
```

## Full Spec

See: `/home/ubuntu/clawd/docs/THE-COUNSEL.md`
