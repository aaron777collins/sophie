# ⚖️ The Counsel

> *"In the multitude of counselors there is safety."* — Proverbs 11:14

```
    ╔══════════════════════════════════════════════════════════════╗
    ║                                                              ║
    ║     🏛️  T H E   C O U N S E L  🏛️                           ║
    ║                                                              ║
    ║         Multi-Agent Deliberation System                      ║
    ║         For Decisions That Matter                            ║
    ║                                                              ║
    ╚══════════════════════════════════════════════════════════════╝
```

## 🎯 What Is The Counsel?

The Counsel is a **high-stakes decision-making framework** that spawns multiple Claude instances to deliberate from different perspectives, vote, and reach consensus.

Think of it as your personal board of advisors — each with a unique lens, all focused on getting the decision *right*.

---

## 🚦 When to Convene

### ✅ Perfect For:
| Decision Type | Example |
|--------------|---------|
| 🏗️ Architecture | "Microservices or monolith?" |
| 🔐 Security | "How should we handle auth tokens?" |
| 💾 Data Models | "Schema design that's hard to change" |
| 🎯 Strategy | "Which direction for the product?" |
| 🚀 Deployment | "Production rollout approach" |
| 💔 Breaking Changes | "API versioning strategy" |

### ❌ Not For:
- 🎨 Styling choices
- 📝 Documentation tweaks
- 🐛 Simple bug fixes
- ↩️ Easily reversible decisions
- 🤷 Low-stakes choices

**Quick test:** *Would you pay $2+ to get this decision right?* If yes, convene.

---

## 🎚️ Complexity Levels

Choose your council size based on stakes:

```
┌─────────────┬─────────────┬─────────┬───────────┬─────────────────────────────┐
│   Level     │ Counselors  │  Model  │ Est. Cost │        Best For             │
├─────────────┼─────────────┼─────────┼───────────┼─────────────────────────────┤
│ 🟢 standard │     3       │ Sonnet  │  ~$0.20   │ Important but recoverable   │
│ 🟡 elevated │     5       │ Sonnet  │  ~$0.35   │ Complex, multi-stakeholder  │
│ 🟠 critical │     5       │  Opus   │  ~$2.00   │ Mission-critical decisions  │
│ 🔴 maximum  │     7       │  Opus   │  ~$3.00   │ Existential, highest stakes │
└─────────────┴─────────────┴─────────┴───────────┴─────────────────────────────┘
```

### 🧠 Model Selection Guidance

Deep thinking is encouraged! But be smart:

- **Start with Sonnet** (🟢 standard / 🟡 elevated) — handles most decisions beautifully
- **Escalate to Opus** (🟠 critical / 🔴 maximum) only when:
  - Sonnet-level deliberation wasn't sufficient
  - Stakes are truly critical (security, architecture, irreversible)
  - You'd genuinely pay $3+ to get this decision right

No rate limits — use your judgment.

---

## 👥 The Seven Perspectives

Each counselor embodies a distinct viewpoint:

| # | Counselor | Focus | Core Question |
|---|-----------|-------|---------------|
| 1 | 🏛️ **The Architect** | System design, scalability, technical debt | *"How does this affect our structure?"* |
| 2 | 🛡️ **The Guardian** | Security, privacy, risk mitigation | *"What could go wrong?"* |
| 3 | 🔧 **The Pragmatist** | Implementation, timeline, resources | *"Can we actually build this?"* |
| 4 | 💚 **The Advocate** | User experience, accessibility | *"How will users feel about this?"* |
| 5 | 🔍 **The Skeptic** | Edge cases, failure modes | *"What are we missing?"* |
| 6 | 🔮 **The Visionary** | Long-term implications, flexibility | *"How does this position us for the future?"* |
| 7 | 📚 **The Historian** | Precedent, patterns, lessons learned | *"What have others done?"* |

*Standard (3) uses: Architect, Guardian, Pragmatist*
*Elevated (5) adds: Advocate, Skeptic*
*Maximum (7) adds: Visionary, Historian*

---

## 📜 The Protocol

### Phase 1: 🔔 Convening

```
╔════════════════════════════════════════════════════════════════════╗
║  ⚖️  T H E   C O U N S E L   C O N V E N E D  ⚖️                  ║
╠════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  📋 Question:    [The decision to be made]                         ║
║  📄 Context:     [Relevant background]                             ║
║  🎯 Options:     [A] ... [B] ... [C] ...                           ║
║  ⚠️  Stakes:      [Why this matters]                               ║
║  🎚️  Complexity:  [standard|elevated|critical|maximum]             ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
```

### Phase 2: 🗣️ Deliberation

Each counselor receives:
- The question and full context
- Their assigned perspective
- Instructions to analyze, consider contingencies, and vote

### Phase 3: 🗳️ Voting

Each counselor outputs:

```
┌────────────────────────────────────────────────────────────┐
│  🗳️  COUNSELOR VOTE                                       │
├────────────────────────────────────────────────────────────┤
│  VOTE:       [A / B / C]                                   │
│  CONFIDENCE: [🟢 high / 🟡 medium / 🔴 low]                │
│  REASONING:  [2-3 sentences from their perspective]        │
│  KEY RISK:   [Main concern if their vote loses]            │
└────────────────────────────────────────────────────────────┘
```

### Phase 4: 📊 Decision

```
╔════════════════════════════════════════════════════════════════════╗
║  ⚖️  T H E   C O U N S E L   H A S   D E C I D E D  ⚖️            ║
╠════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  📊 TALLY                                                          ║
║  ────────────────────────────────────────                          ║
║  Option A: ████████████░░░░░░░░  3 votes (60%)                     ║
║  Option B: ████████░░░░░░░░░░░░  2 votes (40%)                     ║
║  Option C: ░░░░░░░░░░░░░░░░░░░░  0 votes (0%)                      ║
║                                                                    ║
║  ✅ DECISION: Option A                                             ║
║                                                                    ║
║  💬 Summary:                                                       ║
║  [Aggregated reasoning from majority]                              ║
║                                                                    ║
║  ⚠️  Dissenting Concerns:                                          ║
║  [Key points from minority votes]                                  ║
║                                                                    ║
║  🛡️ Recommended Mitigations:                                       ║
║  [Actions to address minority concerns]                            ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
```

---

## 📁 Log Entry Template

Every decision is logged to `memory/counsel/YYYY-MM-DD-HH-MM-{slug}.md`:

```markdown
# ⚖️ Counsel Decision: {Question Summary}

**🕐 Convened:** {timestamp}
**🎚️ Complexity:** {level}
**👥 Counselors:** {N}
**🤖 Model:** {sonnet|opus}

---

## 📋 The Question
{Full question}

## 📄 Context
{Context provided}

## 🎯 Options
- **A)** {Option A}
- **B)** {Option B}
- **C)** {Option C}

---

## 🗳️ Votes

| Counselor | Vote | Confidence | Reasoning |
|-----------|------|------------|-----------|
| 🏛️ Architect | B | 🟢 high | ... |
| 🛡️ Guardian | B | 🟡 medium | ... |
| 🔧 Pragmatist | A | 🟢 high | ... |
| 💚 Advocate | B | 🟢 high | ... |
| 🔍 Skeptic | A | 🔴 low | ... |

---

## 📊 Tally
- Option A: 2 votes (40%)
- Option B: 3 votes (60%) ✅
- Option C: 0 votes (0%)

## ✅ Decision: Option B

---

## ⚠️ Dissenting Concerns
- 🔧 Pragmatist: {concern}
- 🔍 Skeptic: {concern}

## 🛡️ Mitigations Applied
- {mitigation 1}
- {mitigation 2}

---

*Logged by The Counsel • {timestamp}*
```

---

## 🔌 Integration

### From Agent Code

```javascript
const decision = await counsel({
  question: "Should we use PostgreSQL or SQLite?",
  context: "Building a self-hosted app for offline use...",
  options: ["PostgreSQL", "SQLite", "Both with sync"],
  stakes: "Affects deployment complexity and offline capability",
  complexity: "elevated"
});

// Returns: { decision: "SQLite", votes: {...}, reasoning: "...", concerns: [...] }
```

### Via CLI

```bash
node ~/clawd/tools/counsel/counsel.js \
  --question "Should we migrate to microservices?" \
  --context "Current monolith is getting hard to maintain..." \
  --options "microservices,modular-monolith,keep-current" \
  --complexity critical
```

### With Proactive Jobs

When a proactive task hits a critical decision:
1. 🛑 Task pauses, documents the decision needed
2. ⚖️ Task spawns The Counsel
3. 🗳️ Counsel deliberates and returns decision
4. ▶️ Task resumes with the decided path
5. 📝 Decision logged to memory

---

## 📂 Files

| File | Purpose |
|------|---------|
| 📄 `/home/ubuntu/clawd/docs/THE-COUNSEL.md` | This spec |
| 📄 `/home/ubuntu/clawd/skills/counsel/SKILL.md` | Agent skill guide |
| 📄 `/home/ubuntu/clawd/tools/counsel/counsel.js` | CLI tool |
| 📁 `/home/ubuntu/clawd/memory/counsel/` | Decision logs |

---

## 📜 Version History

| Version | Date | Changes |
|---------|------|---------|
| v1.0 | 2026-02-11 | Initial design and implementation |
| v1.1 | 2026-02-11 | Removed rate limits, beautified docs |

---

```
    ╔══════════════════════════════════════════════════════════════╗
    ║                                                              ║
    ║     "The Counsel has spoken."                                ║
    ║                                                              ║
    ╚══════════════════════════════════════════════════════════════╝
```
