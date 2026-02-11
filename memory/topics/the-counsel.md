# ⚖️ The Counsel — Multi-Agent Deliberation System

## 📝 Summary

A voting system for critical decisions that spawns multiple Claude instances to deliberate from different perspectives, then aggregates votes for consensus.

**Think of it as:** Your personal board of advisors — each with a unique lens, all focused on getting the decision *right*.

## 📅 Created
- [2026-02-11 01:05 EST] Aaron requested, Sophie designed and implemented
- [2026-02-11 01:12 EST] Beautified docs, removed rate limits

---

## 📂 Files

| File | Purpose |
|------|---------|
| 📄 `/home/ubuntu/clawd/docs/THE-COUNSEL.md` | Full specification |
| 📄 `/home/ubuntu/clawd/skills/counsel/SKILL.md` | Agent skill guide |
| 📄 `/home/ubuntu/clawd/tools/counsel/counsel.js` | CLI helper tool |
| 📁 `/home/ubuntu/clawd/memory/counsel/` | Decision log archive |

---

## 🎚️ Complexity Levels

| Level | Counselors | Model | Cost | Best For |
|-------|-----------|-------|------|----------|
| 🟢 `standard` | 3 | Sonnet | ~$0.20 | Important, recoverable |
| 🟡 `elevated` | 5 | Sonnet | ~$0.35 | Complex, multi-stakeholder |
| 🟠 `critical` | 5 | Opus | ~$2.00 | Mission-critical |
| 🔴 `maximum` | 7 | Opus | ~$3.00 | Existential decisions |

---

## 👥 The 7 Default Perspectives

| # | Counselor | Focus | Core Question |
|---|-----------|-------|---------------|
| 1 | 🏛️ **The Architect** | System design, scalability | *"How does this affect our structure?"* |
| 2 | 🛡️ **The Guardian** | Security, privacy, risk | *"What could go wrong?"* |
| 3 | 🔧 **The Pragmatist** | Implementation, timeline | *"Can we actually build this?"* |
| 4 | 💚 **The Advocate** | UX, accessibility | *"How will users feel?"* |
| 5 | 🔍 **The Skeptic** | Edge cases, failures | *"What are we missing?"* |
| 6 | 🔮 **The Visionary** | Long-term, flexibility | *"How does this position us?"* |
| 7 | 📚 **The Historian** | Precedent, patterns | *"What have others done?"* |

### 🎨 Custom Perspectives

Add domain-specific experts as needed:
- 🔬 **The Data Scientist** — ML, accuracy, data quality
- 💰 **The Economist** — Cost, ROI, resources
- 🎨 **The Designer** — Visual, brand, aesthetics
- ⚡ **The Performance Engineer** — Speed, latency
- 📊 **The Product Manager** — User value, market fit
- 🧪 **The QA Engineer** — Testability, edge cases

Mix with defaults or build fully custom panels.

---

## 🚦 When to Use

### ✅ Perfect For:
- 🏗️ Architecture decisions
- 🔐 Security choices  
- 💾 Data model changes
- 🎯 Strategic pivots
- 💔 Breaking changes

### ❌ Not For:
- 🎨 Styling choices
- 📝 Documentation
- 🐛 Simple bugs
- ↩️ Reversible decisions

---

## 🔄 Usage Flow

```
1️⃣  Identify critical decision
2️⃣  Choose complexity (start with Sonnet!)
3️⃣  Spawn N counselors with perspective prompts
4️⃣  Each counselor votes with reasoning
5️⃣  Tally votes → majority wins
6️⃣  Log decision to memory/counsel/
```

---

## 🧠 Key Design Decisions

- [2026-02-11 01:05 EST] Odd numbers only (3, 5, 7) to avoid ties
- [2026-02-11 01:05 EST] Start with Sonnet — only escalate to Opus if truly needed
- [2026-02-11 01:12 EST] No rate limits — deep thinking encouraged, use judgment

---

## 🔌 Integration Points

- ✅ Invoked by any agent via skill
- ✅ CLI: `node counsel.js --question "..." ...`  
- ✅ All decisions logged to `memory/counsel/` for audit trail
- ✅ Works with proactive jobs (pause → deliberate → resume)

---

*The Counsel has spoken.* ⚖️
