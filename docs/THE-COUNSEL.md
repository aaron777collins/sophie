# ⚖️ The Counsel

> *The Circle at maximum weight*

```
    ╔══════════════════════════════════════════════════════════════╗
    ║                                                              ║
    ║     ⚖️  T H E   C O U N S E L  ⚖️                            ║
    ║                                                              ║
    ║         The Circle • Maximum Weight                          ║
    ║         For Decisions That Can't Be Wrong                    ║
    ║                                                              ║
    ╚══════════════════════════════════════════════════════════════╝
```

## 🎯 What Is The Counsel?

**The Counsel is The Circle at full power.**

Same framework — critical thinking perspectives + empathy considerations — but with:
- 5-7 counselors (instead of 1-3)
- Opus model (instead of Sonnet/Haiku)
- Formal voting and documentation
- Full deliberation ceremony

**Use for:** Mission-critical decisions where being wrong is costly.

**For everyday thinking:** Use lighter Circle weights. See `docs/THE-CIRCLE.md`.

---

## 🔴 When to Convene

### ✅ Council-Worthy:

| Situation | Why |
|-----------|-----|
| 🏗️ Architecture decisions | Affects entire system |
| 🔐 Security choices | Hard to fix if wrong |
| 💾 Data model changes | Difficult to reverse |
| 🎯 Strategic pivots | Long-term consequences |
| 💔 Breaking changes | Impacts users/partners |
| 💰 Major investments | Significant resources |

### ❌ Use Lighter Circle Instead:

- Styling decisions → 💭 Internal
- Minor features → 🟢 Light  
- Standard implementation → 🟡 Standard
- Complex but recoverable → 🟠 Elevated

**Quick test:** *Would you pay $3+ to get this decision right?*

---

## 👥 The Council

### 🧠 Critical Thinking Counselors (5)

| Counselor | Focus |
|-----------|-------|
| 🏛️ **The Architect** | System design, scalability, structure |
| 🛡️ **The Guardian** | Security, privacy, risk mitigation |
| 🔧 **The Pragmatist** | Implementation, timeline, resources |
| 🔍 **The Skeptic** | Edge cases, assumptions, blind spots |
| 🔮 **The Visionary** | Long-term, flexibility, future impact |

### 💜 Empathy Counselors (2)

| Counselor | Focus |
|-----------|-------|
| 💜 **The Empath** | How affected parties feel, emotional impact |
| 🤝 **The Relationship Guardian** | Trust, communication, stakeholder dynamics |

### 🎨 Custom Counselors

Add domain experts as needed:
- 🔬 The Data Scientist
- 💰 The Economist  
- 🎨 The Designer
- ⚡ The Performance Engineer
- 📚 The Historian

---

## 📜 The Protocol

### Phase 1: Convening

```
╔════════════════════════════════════════════════════════════════════╗
║  ⚖️  T H E   C O U N S E L   C O N V E N E D  ⚖️                  ║
╠════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  📋 Question:    [The decision to be made]                         ║
║  📄 Context:     [Relevant background]                             ║
║  🎯 Options:     [A] ... [B] ... [C] ...                           ║
║  ⚠️  Stakes:      [Why this matters]                               ║
║  👥 Counselors:  7                                                 ║
║  🤖 Model:       Opus                                              ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
```

### Phase 2: Deliberation

Each counselor analyzes from their perspective and votes.

**Counselor Output Format:**
```
┌────────────────────────────────────────────────────────────┐
│  🗳️  COUNSELOR VOTE                                       │
├────────────────────────────────────────────────────────────┤
│  PERSPECTIVE: [Name]                                       │
│  VOTE:        [A / B / C]                                  │
│  CONFIDENCE:  [🟢 high / 🟡 medium / 🔴 low]               │
│  REASONING:   [2-3 sentences from their perspective]       │
│  KEY RISK:    [Main concern if their vote loses]           │
│  EMPATHY:     [How this affects the humans involved]       │
└────────────────────────────────────────────────────────────┘
```

### Phase 3: Decision

```
╔════════════════════════════════════════════════════════════════════╗
║  ⚖️  T H E   C O U N S E L   H A S   D E C I D E D  ⚖️            ║
╠════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  📊 TALLY                                                          ║
║  Option A: ████████████░░░░░░░░  4 votes (57%)                     ║
║  Option B: ██████░░░░░░░░░░░░░░  2 votes (29%)                     ║
║  Option C: ████░░░░░░░░░░░░░░░░  1 vote  (14%)                     ║
║                                                                    ║
║  ✅ DECISION: Option A                                             ║
║                                                                    ║
║  💜 EMPATHY SUMMARY:                                               ║
║  [How this affects the people involved]                            ║
║                                                                    ║
║  ⚠️  DISSENTING CONCERNS:                                          ║
║  [Key points from minority votes]                                  ║
║                                                                    ║
║  🛡️ MITIGATIONS:                                                   ║
║  [Actions to address concerns]                                     ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
```

---

## ⚠️ Quorum & Degradation Rules

### Minimum Quorum

| Counselors Spawned | Minimum Quorum |
|--------------------|----------------|
| 7 | 5 |
| 5 | 4 |
| 3 | 2 |

A decision requires quorum to be valid. Without quorum, the result is advisory only.

### Degradation Protocol

When counselors fail to spawn or respond:

1. **Try twice** — Network issues happen, retry before degrading
2. **If below quorum:**
   - Downgrade to 🟠 Elevated weight (5 Sonnet)
   - Document which counselors failed and why
   - Log the degradation in the decision record
3. **If still can't reach quorum:**
   - Downgrade to 🟡 Standard weight (3 Sonnet)
   - Flag for human review
   - Do NOT proceed as if full Council was convened

### Agent Failure Handling

| Failure Type | Action |
|--------------|--------|
| Spawn timeout | Retry once, then exclude from quorum |
| Invalid response | Log error, retry, count as missing |
| Partial response | Use if substantive, else exclude |
| All agents fail | Abort Council, flag for human review |

---

## 🗣️ Dissent Protocol

### When Dissent Matters

Not all minority votes are equal. Pay special attention when:
- **2+ counselors** vote against the majority
- **Guardian or Skeptic** dissent (safety/risk perspectives)
- **High-confidence dissent** against low-confidence majority
- **Empathy counselors** raise concerns about human impact

### Handling Dissent

| Dissent Level | Action |
|---------------|--------|
| 1 counselor, low confidence | Note in record, proceed |
| 1 counselor, high confidence | Document concerns, add mitigation |
| 2+ counselors | Prominent warning, consider human review |
| Guardian/Skeptic dissent on safety | **MUST** address before proceeding |
| Empathy dissent on impact | Plan communication/support for affected parties |

### Dissent Documentation

Every Council decision must document:

```markdown
## ⚠️ Dissenting Concerns
| Counselor | Vote | Concern |
|-----------|------|---------|
| 🛡️ Guardian | B | Security risk if... |
| 🤝 Relationship | B | Partners may feel... |

## 🛡️ Mitigations
- [Action to address Guardian's concern]
- [Communication plan for stakeholder concerns]
```

### When to Escalate to Human

Flag for Aaron's review when:
- Guardian/Skeptic dissent on safety with high confidence
- No clear majority (4-3 split or worse)
- Empathy counselors warn of significant human impact
- You're uncertain if mitigations are sufficient

---

## 📋 Log Template

Every Council decision → `memory/counsel/YYYY-MM-DD-HH-MM-{slug}.md`

```markdown
# ⚖️ Council Decision: {Question}

**🕐 Convened:** {timestamp}
**👥 Counselors:** 7 (5 critical + 2 empathy)
**🤖 Model:** Opus

---

## 📋 The Question
{Full question}

## 📄 Context  
{Background}

## 🎯 Options
- **A)** {Option A}
- **B)** {Option B}
- **C)** {Option C}

---

## 🗳️ Votes

### 🧠 Critical Counselors

| Counselor | Vote | Confidence | Reasoning |
|-----------|------|------------|-----------|
| 🏛️ Architect | A | 🟢 | ... |
| 🛡️ Guardian | B | 🟡 | ... |
| 🔧 Pragmatist | A | 🟢 | ... |
| 🔍 Skeptic | A | 🟡 | ... |
| 🔮 Visionary | A | 🟢 | ... |

### 💜 Empathy Counselors

| Counselor | Vote | Confidence | Reasoning |
|-----------|------|------------|-----------|
| 💜 Empath | A | 🟢 | Users will appreciate... |
| 🤝 Relationship | B | 🟡 | Partners may feel... |

---

## 📊 Tally
- Option A: 5 votes (71%) ✅
- Option B: 2 votes (29%)

## ✅ Decision: Option A

---

## 💜 Empathy Summary
[How this decision affects the humans involved, their feelings, needs]

## ⚠️ Dissenting Concerns
- 🛡️ Guardian: {concern}
- 🤝 Relationship: {concern}

## 🛡️ Mitigations
- {Action to address Guardian's concern}
- {Communication plan for partners}

---

*The Counsel has spoken.*
```

---

## 🔗 Relationship to The Circle

| Weight | Name | Agents | Model | Formality |
|--------|------|--------|-------|-----------|
| 💭 | Internal | 0 | You | None |
| 🟢 | Light | 1-2 | Haiku | Minimal |
| 🟡 | Standard | 3 | Sonnet | Light |
| 🟠 | Elevated | 5 | Sonnet | Moderate |
| 🔴 | **Council** | 5-7 | **Opus** | **Full** |

**The Counsel = The Circle at 🔴 Council weight**

For the full Circle framework (all weights): `docs/THE-CIRCLE.md`

---

## 📂 Files

| File | Purpose |
|------|---------|
| 📄 `docs/THE-CIRCLE.md` | Full Circle framework (all weights) |
| 📄 `docs/THE-COUNSEL.md` | This file (Council weight reference) |
| 📄 `skills/circle/SKILL.md` | Agent skill guide |
| 📁 `memory/counsel/` | Council decision logs |

---

```
    ╔══════════════════════════════════════════════════════════════╗
    ║                                                              ║
    ║     "The Counsel has spoken."                                ║
    ║                                                              ║
    ╚══════════════════════════════════════════════════════════════╝
```
