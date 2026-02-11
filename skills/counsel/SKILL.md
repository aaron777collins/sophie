# ⚖️ The Counsel — Agent Skill

> *Multi-agent deliberation for decisions that matter*

---

## 🚀 Quick Start

### When to Use

Ask yourself:
- 🤔 Is this decision hard to reverse?
- 💸 Could being wrong cost significant time/money/security?
- ⚖️ Are there multiple valid approaches with real tradeoffs?

**If YES to 2+** → Convene The Counsel.

### Complexity at a Glance

| Level | Counselors | Model | Cost | Use For |
|-------|-----------|-------|------|---------|
| 🟢 `standard` | 3 | Sonnet | ~$0.20 | Important, recoverable |
| 🟡 `elevated` | 5 | Sonnet | ~$0.35 | Complex, multi-stakeholder |
| 🟠 `critical` | 5 | Opus | ~$2.00 | Mission-critical |
| 🔴 `maximum` | 7 | Opus | ~$3.00 | Existential decisions |

**Start with Sonnet** → Escalate to Opus only if truly needed.

---

## 📋 Step-by-Step

### Step 1: Define the Decision

```markdown
📋 Question:  [Clear, specific decision to make]
📄 Context:   [All relevant background]
🎯 Options:   [A, B, C — concrete choices]
⚠️ Stakes:    [Why this matters]
🎚️ Complexity: [standard|elevated|critical|maximum]
```

### Step 2: Spawn Counselors

Use `sessions_spawn` for each perspective:

| # | Counselor | Focus |
|---|-----------|-------|
| 1 | 🏛️ **The Architect** | System design, scalability, tech debt |
| 2 | 🛡️ **The Guardian** | Security, privacy, risk |
| 3 | 🔧 **The Pragmatist** | Implementation, timeline, resources |
| 4 | 💚 **The Advocate** | UX, accessibility, adoption |
| 5 | 🔍 **The Skeptic** | Edge cases, failure modes |
| 6 | 🔮 **The Visionary** | Long-term, flexibility *(5+ only)* |
| 7 | 📚 **The Historian** | Precedent, patterns *(7 only)* |

### Step 3: Counselor Prompt Template

```
You are a Counselor in The Counsel, a multi-agent deliberation system.

═══════════════════════════════════════════════════════════════
YOUR PERSPECTIVE: {emoji} {Name}
Focus: {perspective-specific concerns}
Core Question: "{the question they always ask}"
═══════════════════════════════════════════════════════════════

📋 THE QUESTION:
{Question to decide}

📄 CONTEXT:
{Relevant background}

🎯 OPTIONS:
A) {Option A}
B) {Option B}  
C) {Option C}

═══════════════════════════════════════════════════════════════
YOUR TASK:
1. Analyze this decision ONLY from your perspective
2. Consider contingencies and dependencies
3. Identify key risks for each option
4. Cast your vote
═══════════════════════════════════════════════════════════════

OUTPUT FORMAT (use exactly):
┌────────────────────────────────────────────────────────────┐
│  🗳️  COUNSELOR VOTE                                       │
├────────────────────────────────────────────────────────────┤
│  VOTE:       [A / B / C]                                   │
│  CONFIDENCE: [high / medium / low]                         │
│  REASONING:  [2-3 sentences from your perspective]         │
│  KEY RISK:   [Main concern if your vote loses]             │
└────────────────────────────────────────────────────────────┘
```

### Step 4: Collect & Tally

Wait for all counselors, then:
1. 📊 Count votes for each option
2. ✅ Majority wins (odd numbers prevent ties)
3. ⚠️ Document dissenting concerns
4. 🛡️ Propose mitigations

### Step 5: Announce & Log

**Announce the decision:**

```
╔════════════════════════════════════════════════════════════════════╗
║  ⚖️  T H E   C O U N S E L   H A S   D E C I D E D  ⚖️            ║
╠════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  📊 TALLY                                                          ║
║  Option A: ████████████░░░░░░░░  3 votes (60%)                     ║
║  Option B: ████████░░░░░░░░░░░░  2 votes (40%)                     ║
║                                                                    ║
║  ✅ DECISION: Option A                                             ║
║                                                                    ║
║  ⚠️ Key Dissent: [concern from minority]                           ║
║  🛡️ Mitigation:  [how we'll address it]                           ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
```

**Log to:** `memory/counsel/YYYY-MM-DD-HH-MM-{slug}.md`

---

## 👥 Perspective Details

### 🏛️ The Architect
- **Focus:** System design, scalability, technical debt, architecture patterns
- **Ask:** *"How does this affect our system's structure and maintainability?"*
- **Watches for:** Coupling, complexity, future flexibility

### 🛡️ The Guardian
- **Focus:** Security, privacy, compliance, risk mitigation, access control
- **Ask:** *"What could go wrong? How could this be exploited?"*
- **Watches for:** Vulnerabilities, data exposure, attack vectors

### 🔧 The Pragmatist
- **Focus:** Implementation complexity, timeline, resources, team capabilities
- **Ask:** *"Can we actually build this? What's the realistic effort?"*
- **Watches for:** Scope creep, hidden complexity, resource constraints

### 💚 The Advocate
- **Focus:** User experience, accessibility, adoption, stakeholder needs
- **Ask:** *"How will users experience this? Will they adopt it?"*
- **Watches for:** Friction, confusion, accessibility gaps

### 🔍 The Skeptic
- **Focus:** Edge cases, failure modes, what-ifs, stress testing assumptions
- **Ask:** *"What are we missing? What happens when X fails?"*
- **Watches for:** Blind spots, optimistic assumptions, untested paths

### 🔮 The Visionary *(5+ counselors)*
- **Focus:** Long-term implications, future flexibility, strategic alignment
- **Ask:** *"How does this position us for the future?"*
- **Watches for:** Short-term thinking, strategic misalignment

### 📚 The Historian *(7 counselors)*
- **Focus:** Precedent, patterns, industry standards, lessons learned
- **Ask:** *"What have others done? What patterns apply here?"*
- **Watches for:** Reinventing wheels, ignoring proven solutions

---

## 🎨 Custom Perspectives

The defaults are great, but you can **add or substitute custom perspectives** for domain-specific decisions!

### Ready-to-Use Custom Perspectives

| Counselor | Focus | Core Question |
|-----------|-------|---------------|
| 🔬 **The Data Scientist** | ML tradeoffs, accuracy, data quality | *"What does the data tell us?"* |
| 💰 **The Economist** | Cost, ROI, resource allocation | *"What's the financial impact?"* |
| 🎨 **The Designer** | Visual consistency, brand, aesthetics | *"How does this look and feel?"* |
| ⚡ **The Performance Engineer** | Speed, latency, optimization | *"How fast will this be?"* |
| 🌍 **The Internationalist** | i18n, localization, cultural fit | *"Will this work globally?"* |
| ♿ **The Accessibility Champion** | WCAG, assistive tech, inclusion | *"Can everyone use this?"* |
| 📊 **The Product Manager** | User value, market fit, priorities | *"Does this solve a real problem?"* |
| 🧪 **The QA Engineer** | Testability, edge cases, regression | *"How do we verify this works?"* |

### How to Use Custom Perspectives

**Add to defaults:** Use 3-5 defaults + 1-2 custom
```
Standard (3) + Data Scientist = 4 counselors for ML decision
```

**Replace a default:** Swap one that's less relevant
```
Replace Historian with Designer for UI decision
```

**All custom:** Build a specialized panel
```
ML Pipeline → Data Scientist, Performance Engineer, Economist, Pragmatist, Skeptic
```

### Creating Your Own

Template:
```
| {emoji} **The {Name}** | {focus areas} | *"{core question}"* |
```

Then use the standard counselor prompt structure with your custom focus.

---

## ⚠️ Usage Guidance

### ❌ Don't Convene For:
- 🎨 Code style / formatting
- 📝 Documentation updates  
- 🐛 Simple bug fixes
- ↩️ Easily reversible choices
- 🤷 Low-stakes decisions

### 🧠 Model Selection:

**Deep thinking is encouraged!** But be smart:

- **🟢🟡 Start with Sonnet** — handles most decisions beautifully
- **🟠🔴 Escalate to Opus** only when:
  - Sonnet wasn't sufficient for the complexity
  - Stakes are truly critical
  - You'd genuinely pay $3+ to get it right

No rate limits — use your judgment.

### 🚫 Trivial Invocation:

If The Counsel is convened for something trivial, counselors should vote:
```
VOTE: DISMISS
REASONING: This decision does not warrant deliberation.
```

---

## 📂 Files

| File | Purpose |
|------|---------|
| 📄 `docs/THE-COUNSEL.md` | Full specification |
| 📄 `skills/counsel/SKILL.md` | This skill guide |
| 📄 `tools/counsel/counsel.js` | CLI helper |
| 📁 `memory/counsel/` | Decision log archive |

---

## 💡 Example: Quick 3-Counselor Decision

```javascript
// Question: REST vs GraphQL for new API

// 1. Spawn 3 counselors
spawn("counsel-architect", buildPrompt("Architect", question, options));
spawn("counsel-guardian", buildPrompt("Guardian", question, options));
spawn("counsel-pragmatist", buildPrompt("Pragmatist", question, options));

// 2. Collect votes
// Architect: B (GraphQL) - high confidence
// Guardian: A (REST) - medium confidence  
// Pragmatist: A (REST) - high confidence

// 3. Tally: REST wins 2-1

// 4. Log decision with Guardian's concern about complexity
// 5. Mitigation: Start with REST, design for future GraphQL layer
```

---

*The Counsel has spoken.* ⚖️
