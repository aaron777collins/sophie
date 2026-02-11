# 💜 The Circle — Multi-Perspective Thinking Skill

> *Think before you speak. Consider how it lands. Be thoughtful.*

---
**Skill:** `circle`
**Version:** 2.0.0
**Purpose:** Invoke multi-perspective thinking at any weight level, from quick internal checks to full Council deliberation.

---

## 🎯 Overview

**The Circle** is a framework for thoughtful pre-response thinking from multiple perspectives — both analytical ("Is this right?") and empathetic ("How will this land?").

Humans don't blurt out responses. They pause, consider, adjust. **The Circle makes agents do the same.**

**Key insight:** Most responses need only a quick mental check. Escalate deliberately when stakes demand it.

---

## 🎚️ Weight Levels

| Level | Agents | Model | Cost | Use Case |
|-------|--------|-------|------|----------|
| 💭 **Internal** | 0 | Self | $0 | Quick sanity check (most responses!) |
| 🟢 **Light** | 1-2 | Haiku | ~$0.02 | Worth a second thought |
| 🟡 **Standard** | 3 | Sonnet | ~$0.15 | Important decisions |
| 🟠 **Elevated** | 5 | Sonnet | ~$0.30 | Complex, multi-stakeholder |
| 🔴 **Council** | 5-7 | Opus | ~$2-3 | Mission-critical ("The Counsel") |

**Default: 💭 Internal.** Quick mental check, takes seconds, catches most problems.

---

## 👥 Perspective Definitions

### 🧠 Critical Thinking Perspectives

| ID | Name | Focus | Key Question |
|----|------|-------|--------------|
| `architect` | 🏛️ The Architect | System design, scalability, structure | *"How does this affect the whole system?"* |
| `guardian` | 🛡️ The Guardian | Security, privacy, risk, failure modes | *"What's the worst case? How do we prevent it?"* |
| `pragmatist` | 🔧 The Pragmatist | Implementation, timeline, resources | *"Can we actually do this? What's realistic?"* |
| `skeptic` | 🔍 The Skeptic | Edge cases, assumptions, blind spots | *"What are we missing? What if we're wrong?"* |
| `visionary` | 🔮 The Visionary | Long-term, flexibility, future impact | *"How does this position us for the future?"* |
| `historian` | 📚 The Historian | Precedent, patterns, lessons learned | *"What have others done? What patterns apply?"* |

### 💜 Empathy Perspectives

| ID | Name | Focus | Key Question |
|----|------|-------|--------------|
| `mind` | 💭 Their Mind | Thoughts, beliefs, assumptions | *"What are they actually thinking?"* |
| `heart` | 💔 Their Heart | Emotions, feelings, mood | *"How do they feel about this?"* |
| `needs` | 🎯 Their Needs | Real needs vs stated wants | *"What do they actually need?"* |
| `relationship` | 🤝 The Relationship | Trust, connection, dynamics | *"How does this impact our relationship?"* |
| `empath` | 💜 The Empath | Overall emotional impact | *"How will this land emotionally?"* |

### 🎨 Custom Perspectives (Add As Needed)

| ID | Name | When To Add |
|----|------|-------------|
| `data_scientist` | 🔬 Data Scientist | ML/data decisions |
| `economist` | 💰 Economist | Cost/ROI matters |
| `designer` | 🎨 Designer | UX/visual decisions |
| `performance` | ⚡ Performance Engineer | Speed/optimization |
| `accessibility` | ♿ Accessibility Champion | Inclusion matters |

---

## 🚨 Automatic Escalation Triggers

**Concrete thresholds, not vibes:**

| Condition | Minimum Weight |
|-----------|----------------|
| Security implication | 🟠 Elevated |
| Irreversible action | 🟠 Elevated |
| Affects multiple systems (3+) | 🟡 Standard |
| Financial impact > $500 | 🟡 Standard |
| Financial impact > $2000 | 🟠 Elevated |
| Financial impact > $10000 | 🔴 Council |
| Public communication | 🟡 Standard |
| Uncertainty > 50% | +1 weight level |
| Human explicitly requested | As specified |
| Breaking change to API/data | 🟠 Elevated |
| Legal/compliance involved | 🔴 Council |

### Anti-Over-Escalation Guidance

- **Most responses need only 💭 Internal**
- If convening Council for everything, you're doing it wrong
- Time pressure doesn't justify skipping thinking entirely — do a faster check
- Default to lower weight; escalate only when triggers hit

---

## ⚖️ Quorum Rules

### Minimum Quorum by Counselors Spawned

| Spawned | Min Quorum | Degradation |
|---------|------------|-------------|
| 7 | 5 | → 5 counselors |
| 5 | 4 | → 3 counselors |
| 3 | 2 | → Flag for human |

### Degradation Protocol

1. **First attempt fails quorum** → Wait 30 seconds, retry once
2. **Retry fails** → Downgrade one weight level and retry
3. **<3 respond at any level** → Abort, flag for human review

### Document Failures

When quorum fails:
- Log which perspectives failed to respond
- Note the retry attempts and outcomes
- If degraded, mark decision as "degraded from {original_level}"

---

## 📢 Dissent Protocol

**Minority opinions are valuable.** They often catch what the majority misses.

### Rules

1. **Always log minority opinions** in decision record — prominently, not buried
2. **Flag for attention** if 2+ counselors disagree with majority
3. **Never suppress dissent** — document reasoning even if overruled
4. **Revisit later** — if minority was right, update processes

### Dissent Fields in Output

```json
{
  "dissent": {
    "exists": true,
    "count": 2,
    "perspectives": ["guardian", "skeptic"],
    "concerns": [
      "Security risk not adequately addressed",
      "Assumption about user behavior may be wrong"
    ],
    "flagged": true
  }
}
```

---

## 📋 JSON Schema for Counselor Responses

### Individual Counselor Response

```json
{
  "perspective": "string (architect|guardian|pragmatist|skeptic|visionary|historian|empath|relationship|mind|heart|needs)",
  "perspective_emoji": "string (🏛️|🛡️|🔧|🔍|🔮|📚|💜|🤝|💭|💔|🎯)",
  "assessment": "string (2-4 sentences analyzing from this perspective)",
  "concerns": ["string (specific concerns from this angle)"],
  "suggestions": ["string (recommendations from this perspective)"],
  "vote": "string (A|B|C|... or 'abstain')",
  "confidence": "number (0-100)",
  "key_risk": "string (main concern if this vote loses)"
}
```

### Aggregated Circle Result

```json
{
  "question": "string (the original question)",
  "weight": "string (internal|light|standard|elevated|council)",
  "model": "string (haiku|sonnet|opus)",
  "counselors_spawned": "number",
  "counselors_responded": "number",
  "quorum_met": "boolean",
  "degraded_from": "string|null (original weight if degraded)",
  
  "tally": {
    "A": { "count": 3, "voters": ["architect", "pragmatist", "visionary"], "avg_confidence": 85 },
    "B": { "count": 2, "voters": ["guardian", "skeptic"], "avg_confidence": 72 }
  },
  
  "decision": "string (A|B|C|...)",
  "decision_text": "string (the winning option text)",
  "votes_for_winner": "number",
  "unanimous": "boolean",
  "tied": "null | ['A', 'B']",
  
  "counselor_votes": [
    { "perspective": "architect", "vote": "A", "confidence": 90, "reasoning": "..." },
    { "perspective": "guardian", "vote": "B", "confidence": 75, "reasoning": "..." }
  ],
  
  "dissent": {
    "exists": "boolean",
    "count": "number",
    "perspectives": ["string"],
    "concerns": ["string"],
    "flagged": "boolean (true if 2+ dissenters)"
  },
  
  "empathy_summary": "string (how this affects humans involved)",
  "mitigations": ["string (actions to address dissenting concerns)"],
  
  "timestamp": "string (ISO 8601)",
  "log_file": "string (path to full log)"
}
```

---

## 🔧 Aggregation Logic

### Vote Counting

```
1. Collect all valid votes (exclude abstains from count)
2. Tally by option
3. Winner = option with most votes
4. If tie: see tie-breaking rules below
5. Calculate average confidence per option
```

### Tie-Breaking Rules

1. **Confidence-weighted**: Winner is option with higher average confidence
2. **Still tied**: Guardian's vote breaks tie (conservative preference)
3. **Guardian abstained**: Pragmatist breaks tie
4. **Still tied**: Flag for human review

### Confidence Weighting (Optional)

For Elevated/Council weights, optionally use confidence-weighted voting:

```
Weighted score = Σ(vote × confidence / 100)

Example:
- Option A: 3 votes at confidence 90, 80, 70 → score = 2.4
- Option B: 2 votes at confidence 100, 95 → score = 1.95
- Winner: Option A (higher weighted score)
```

---

## 📜 Spawning Templates

### 💭 Internal (No Spawn — Self-Check)

```markdown
## 💜 Circle Check

**Situation:** [describe briefly]

**🧠 Critical:**
- Logic sound? [yes/needs work]
- Risks? [list any]
- Realistic? [yes/no]

**💜 Empathy:**
- How will they read this? [interpretation]
- Their emotional state? [assessment]
- What they need? [actual need]

**→ Decision/Response:** [proceed / adjust: how]
```

---

### 🟢 Light Weight (1-2 Haiku)

**Spawn prompt for single perspective:**

```
You are a quick sanity checker. Review this situation:

SITUATION:
{situation}

PROPOSED RESPONSE/DECISION:
{proposal}

Consider both:
1. CRITICAL: Does this make sense? Any obvious risks or problems?
2. EMPATHY: How will the recipient feel? Is the tone right?

Give a brief assessment (2-3 sentences) and one of:
- PROCEED: Good to go
- ADJUST: [specific change needed]
- PAUSE: [why this needs more thought]
```

**Combined critical + empathy prompt:**

```
Quick Circle check on this:

SITUATION: {situation}
PROPOSED: {proposal}

Critical lens: Logic sound? Risks? Realistic?
Empathy lens: How will they feel? Tone right? What do they need?

Brief assessment and recommendation (PROCEED/ADJUST/PAUSE):
```

---

### 🟡 Standard Weight (3 Sonnet)

**Recommended combo:** Pragmatist + Skeptic + Empath

**System prompt (shared):**

```
You are a counselor in The Circle, a multi-perspective thinking framework.

Your role: Analyze the situation from your assigned perspective and provide a structured assessment.

IMPORTANT: Also consider empathy — how does this affect the humans involved?

Respond in this JSON format:
{
  "perspective": "[your perspective name]",
  "assessment": "[2-4 sentences from your angle]",
  "concerns": ["[specific concern 1]", "[specific concern 2]"],
  "suggestions": ["[recommendation 1]", "[recommendation 2]"],
  "vote": "[A or B or C or abstain]",
  "confidence": [0-100],
  "key_risk": "[main concern if your vote loses]"
}
```

**Pragmatist prompt:**

```
You are 🔧 The Pragmatist — focused on implementation, timeline, and resources.

QUESTION: {question}
OPTIONS:
A) {option_a}
B) {option_b}
C) {option_c}

CONTEXT: {context}

From your perspective: What's realistic? What's the actual effort? What resources are needed? Can we actually pull this off?

Also consider: How will this affect the people doing the work?

Respond in JSON format with your assessment, concerns, suggestions, vote (A/B/C), and confidence (0-100).
```

**Skeptic prompt:**

```
You are 🔍 The Skeptic — focused on edge cases, assumptions, and blind spots.

QUESTION: {question}
OPTIONS:
A) {option_a}
B) {option_b}
C) {option_c}

CONTEXT: {context}

From your perspective: What assumptions are being made? What could go wrong that we haven't considered? What edge cases matter?

Also consider: Are we seeing the situation from the right angle? What might we be missing about people's perspectives?

Respond in JSON format with your assessment, concerns, suggestions, vote (A/B/C), and confidence (0-100).
```

**Empath prompt:**

```
You are 💜 The Empath — focused on emotional impact and how decisions affect people.

QUESTION: {question}
OPTIONS:
A) {option_a}
B) {option_b}
C) {option_c}

CONTEXT: {context}

From your perspective: How will the people affected feel about this? What are their underlying needs? How does each option impact trust and relationships?

Consider: Their emotional state, their perspective, what they actually need (vs what they say they want).

Respond in JSON format with your assessment, concerns, suggestions, vote (A/B/C), and confidence (0-100).
```

---

### 🟠 Elevated Weight (5 Sonnet)

**Recommended combo:** Architect + Guardian + Pragmatist + Skeptic + Empath

Add to the Standard prompts:

**Architect prompt:**

```
You are 🏛️ The Architect — focused on system design, scalability, and structure.

QUESTION: {question}
OPTIONS:
A) {option_a}
B) {option_b}
C) {option_c}

CONTEXT: {context}

From your perspective: How does this fit into the broader system? What are the structural implications? Does this scale? Does it create technical debt or elegant architecture?

Also consider: How does this affect the people who will maintain and use the system?

Respond in JSON format with your assessment, concerns, suggestions, vote (A/B/C), and confidence (0-100).
```

**Guardian prompt:**

```
You are 🛡️ The Guardian — focused on security, privacy, risk, and failure modes.

QUESTION: {question}
OPTIONS:
A) {option_a}
B) {option_b}
C) {option_c}

CONTEXT: {context}

From your perspective: What's the worst case? What could go wrong? Are there security or privacy implications? What are the failure modes?

Also consider: How would a breach or failure affect the people involved? What's at stake for them?

Respond in JSON format with your assessment, concerns, suggestions, vote (A/B/C), and confidence (0-100).
```

---

### 🔴 Council Weight (5-7 Opus) — "The Counsel"

**Full formal protocol.** See also: `docs/THE-COUNSEL.md` and `skills/counsel/SKILL.md`

**Spawn 7 counselors (5 critical + 2 empathy):**

| Slot | Perspective | Focus |
|------|-------------|-------|
| 1 | 🏛️ Architect | System impact |
| 2 | 🛡️ Guardian | Risk/security |
| 3 | 🔧 Pragmatist | Feasibility |
| 4 | 🔍 Skeptic | Blind spots |
| 5 | 🔮 Visionary | Long-term |
| 6 | 💜 Empath | Emotional impact |
| 7 | 🤝 Relationship | Trust/stakeholders |

**Council convening header:**

```
╔════════════════════════════════════════════════════════════════════╗
║  ⚖️  T H E   C O U N S E L   C O N V E N E D  ⚖️                  ║
╠════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  📋 Question:    {question}                                        ║
║  📄 Context:     {context}                                         ║
║  🎯 Options:     A) {opt_a}  B) {opt_b}  C) {opt_c}                ║
║  ⚠️  Stakes:     {why_this_matters}                                ║
║  👥 Counselors:  7 (5 critical + 2 empathy)                        ║
║  🤖 Model:       Opus                                              ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
```

**Individual counselor system prompt (Council weight):**

```
You are a Counselor in The Counsel, a formal multi-agent deliberation system for critical decisions.

Your perspective: {perspective_name} ({perspective_emoji})
Your focus: {perspective_focus}

This is a high-stakes decision requiring careful analysis. Your response will be aggregated with 6 other counselors and logged for future reference.

REQUIREMENTS:
1. Analyze THOROUGHLY from your perspective
2. Consider empathy: how does this affect humans involved?
3. Be specific in your concerns and suggestions
4. Assign confidence honestly (don't inflate)
5. Explain your key risk clearly

Respond in this exact JSON format:
{
  "perspective": "{perspective_id}",
  "perspective_emoji": "{emoji}",
  "assessment": "[3-5 sentences of thorough analysis from your angle]",
  "concerns": ["[specific concern 1]", "[specific concern 2]", "[specific concern 3]"],
  "suggestions": ["[actionable recommendation 1]", "[actionable recommendation 2]"],
  "vote": "[A or B or C]",
  "confidence": [0-100, be honest],
  "key_risk": "[the main thing that could go wrong if your perspective is ignored]"
}
```

**User prompt for each counselor:**

```
THE COUNSEL HAS BEEN CONVENED

Question: {question}

Context:
{context}

Options:
A) {option_a}
B) {option_b}  
C) {option_c}

Stakes: {stakes}

Deliberate carefully and cast your vote.
```

---

## 📊 Output Formatting

### Council Decision Output (Full)

```markdown
## ⚖️ Council Decision: {Question}

**🕐 Convened:** {timestamp}
**👥 Counselors:** {n} ({critical_count} critical + {empathy_count} empathy)
**🤖 Model:** {model}
**⚠️ Quorum:** {met|degraded from X}

---

### 📋 The Question
{full_question}

### 📄 Context
{context}

### 🎯 Options
- **A)** {option_a}
- **B)** {option_b}
- **C)** {option_c}

---

### 🗳️ Votes

| Counselor | Vote | Confidence | Reasoning |
|-----------|------|------------|-----------|
| 🏛️ Architect | A | 🟢 85% | {brief_reasoning} |
| 🛡️ Guardian | B | 🟡 65% | {brief_reasoning} |
| 🔧 Pragmatist | A | 🟢 90% | {brief_reasoning} |
| 🔍 Skeptic | A | 🟡 70% | {brief_reasoning} |
| 🔮 Visionary | A | 🟢 80% | {brief_reasoning} |
| 💜 Empath | A | 🟢 85% | {brief_reasoning} |
| 🤝 Relationship | B | 🟡 60% | {brief_reasoning} |

---

### 📊 Tally
- Option A: ████████████░░░░░░░░ 5 votes (71%)
- Option B: ████░░░░░░░░░░░░░░░░ 2 votes (29%)

### ✅ Decision: Option A — {option_a_text}

---

### 💜 Empathy Summary
{how_this_affects_humans}

### ⚠️ Dissenting Concerns
- 🛡️ Guardian: {guardian_concern}
- 🤝 Relationship: {relationship_concern}

### 🛡️ Mitigations
- {action_to_address_concern_1}
- {action_to_address_concern_2}

---

*The Counsel has spoken.*
```

---

## 🔄 Example Invocations

### Example 1: 💭 Internal Check

**Situation:** Aaron asks "What time is it?"

```markdown
## 💜 Circle Check

**Situation:** Simple factual question

**🧠 Critical:**
- Logic sound? Yes, just check the time
- Risks? None
- Realistic? Yes

**💜 Empathy:**
- How will they read this? Just wants the time
- Their emotional state? Neutral
- What they need? The time

**→ Decision:** Proceed — just answer the question
```

**Time:** <1 second. **No spawn needed.**

---

### Example 2: 🟢 Light Weight

**Situation:** Aaron seems frustrated about a bug. Should I offer to help debug or give him space?

**Spawn 1 Haiku:**

```
Quick Circle check on this:

SITUATION: Aaron seems frustrated about a bug. He just said "ugh, this keeps breaking"
PROPOSED: Offer to help debug

Critical lens: Logic sound? Risks? Realistic?
Empathy lens: How will they feel? Tone right? What do they need?

Brief assessment and recommendation (PROCEED/ADJUST/PAUSE):
```

**Haiku response:**

```
ASSESSMENT: Offering to help seems appropriate — frustration about bugs is often relieved by a second pair of eyes. However, tone matters: avoid being patronizing. He may just be venting, so make the offer low-pressure.

RECOMMENDATION: ADJUST — Offer help but frame it as optional: "Want me to take a look?" rather than diving straight in. Give him the choice.
```

**Time:** ~3 seconds. **Cost:** ~$0.01

---

### Example 3: 🟡 Standard Weight

**Question:** Should we use Redis or PostgreSQL for session storage?

**Spawn 3 Sonnet (Pragmatist, Skeptic, Empath):**

**Pragmatist response:**
```json
{
  "perspective": "pragmatist",
  "assessment": "Redis is faster for session storage and has built-in TTL. PostgreSQL would work but adds complexity we don't need. Team already knows Redis. Implementation is straightforward.",
  "concerns": ["Redis persistence needs configuration", "One more service to maintain"],
  "suggestions": ["Use Redis with AOF persistence", "Set up Redis Sentinel for HA if critical"],
  "vote": "A",
  "confidence": 85,
  "key_risk": "If we choose PostgreSQL, we're over-engineering a simple problem"
}
```

**Skeptic response:**
```json
{
  "perspective": "skeptic",
  "assessment": "Redis seems like the obvious choice, but are we accounting for failure modes? What happens when Redis goes down? PostgreSQL is already in our stack and battle-tested.",
  "concerns": ["Redis single point of failure", "Session loss on Redis restart", "Another operational burden"],
  "suggestions": ["If Redis, ensure proper persistence", "Consider PostgreSQL if simplicity matters more than speed"],
  "vote": "B",
  "confidence": 60,
  "key_risk": "Choosing Redis without proper HA could cause session loss incidents"
}
```

**Empath response:**
```json
{
  "perspective": "empath",
  "assessment": "The team maintaining this will appreciate Redis — it's simpler for this use case. Users won't notice the difference, but faster session checks do improve UX subtly.",
  "concerns": ["Ops team needs to learn Redis monitoring", "User frustration if sessions lost"],
  "suggestions": ["Document Redis operations clearly", "Ensure graceful session recreation on failure"],
  "vote": "A",
  "confidence": 75,
  "key_risk": "Choosing PostgreSQL might frustrate devs with unnecessary complexity"
}
```

**Aggregated result:**
- Option A (Redis): 2 votes (Pragmatist 85%, Empath 75%) → avg confidence: 80%
- Option B (PostgreSQL): 1 vote (Skeptic 60%) → avg confidence: 60%

**Decision: A (Redis)** with mitigation: Configure persistence and document failure handling.

**Time:** ~15 seconds. **Cost:** ~$0.15

---

### Example 4: 🔴 Council Weight

**Question:** Should we migrate from AWS to self-hosted infrastructure?

This triggers Council because:
- ✅ Financial impact > $10000
- ✅ Affects multiple systems (3+)
- ✅ Irreversible (hard to undo)
- ✅ Security implications

**Full Council convened with 7 Opus counselors...**

*(See `tools/counsel/counsel.js` for the implementation that handles this)*

**Time:** ~90 seconds. **Cost:** ~$2.50

---

## 🛠️ Integration

### Using From CLI

```bash
# Quick light check
claude -p "$(cat /home/ubuntu/clawd/skills/circle/prompts/light.txt | sed 's/{situation}/Aaron wants to refactor auth/g')" --model haiku

# Standard weight via counsel tool
node ~/clawd/tools/counsel/counsel.js \
  --question "Redis or PostgreSQL for sessions?" \
  --options "Redis,PostgreSQL" \
  --context "Building session storage, team knows both" \
  --complexity standard

# Full Council
node ~/clawd/tools/counsel/counsel.js \
  --question "Migrate to self-hosted?" \
  --options "Stay AWS,Migrate to self-hosted,Hybrid approach" \
  --context "Current AWS bill $X/month, have DevOps capacity" \
  --complexity maximum
```

### Using From Agent Code

```javascript
// Light check (inline, no spawn)
const lightCheck = `
  Quick Circle check:
  - Situation: ${situation}
  - Proposed: ${proposal}
  - Critical: Logic? Risks? Realistic?
  - Empathy: How will they feel? Tone right?
  - Recommendation: PROCEED/ADJUST/PAUSE
`;

// Standard+ weights: use counsel tool
const { convene } = require('/home/ubuntu/clawd/tools/counsel/counsel.js');

const result = await convene(
  question,
  context,
  ['Option A', 'Option B'],
  'standard',  // or 'elevated', 'critical', 'maximum'
  { verbose: false }
);

if (result.decision === 'A') {
  // Proceed with Option A
}

// Check for dissent
if (result.dissent?.flagged) {
  // 2+ counselors disagreed — consider carefully
}
```

---

## 📂 Related Files

| File | Purpose |
|------|---------|
| `docs/THE-CIRCLE.md` | Full conceptual spec |
| `docs/THE-COUNSEL.md` | Council-weight protocol |
| `skills/circle/SKILL.md` | This file (agent skill guide) |
| `skills/counsel/SKILL.md` | Counsel tool usage |
| `tools/counsel/counsel.js` | Council implementation |
| `memory/counsel/` | Decision logs |

---

## 💡 Quick Reference

### When to use what:

| Situation | Weight | Spawn |
|-----------|--------|-------|
| Simple factual response | 💭 Internal | None |
| Tone/phrasing check | 💭 Internal | None |
| Someone seems upset | 🟢 Light | 1 Haiku |
| Technical decision | 🟡 Standard | 3 Sonnet |
| Multi-stakeholder issue | 🟠 Elevated | 5 Sonnet |
| Architecture/security | 🔴 Council | 7 Opus |
| "Would pay $3 to get right" | 🔴 Council | 7 Opus |

### Default perspectives by weight:

| Weight | Perspectives |
|--------|--------------|
| 🟢 Light | Pragmatist + Empath (combined) |
| 🟡 Standard | Pragmatist, Skeptic, Empath |
| 🟠 Elevated | Architect, Guardian, Pragmatist, Skeptic, Empath |
| 🔴 Council | Architect, Guardian, Pragmatist, Skeptic, Visionary, Empath, Relationship |

---

*Think before you speak. Consider how it lands. Be thoughtful.* 💜
