# 💜 The Circle — Deep Thinking Skill

> *Multi-perspective analysis + empathy, scaled to the stakes*

---

## 🎯 Core Concept

The Circle is deep thinking with two halves:
1. **🧠 Critical Thinking** — Multiple analytical perspectives
2. **💜 Empathy** — How this affects the humans involved

Scale the weight to match the stakes.

---

## 🎚️ Weight Levels

| Level | Agents | Model | Use For |
|-------|--------|-------|---------|
| 💭 **Internal** | 0 | You | Quick checks, everyday |
| 🟢 **Light** | 1-2 | Haiku | Worth a second thought |
| 🟡 **Standard** | 3 | Sonnet | Important decisions |
| 🟠 **Elevated** | 5 | Sonnet | Complex, multi-stakeholder |
| 🔴 **Council** | 5-7 | Opus | Mission-critical |

**Default to lighter. Escalate when stakes demand it.**

---

## 👥 The Perspectives

### 🧠 Critical Thinking

| Perspective | Key Question |
|-------------|--------------|
| 🏛️ **Architect** | *"How does this affect the system?"* |
| 🛡️ **Guardian** | *"What could go wrong?"* |
| 🔧 **Pragmatist** | *"Is this realistic?"* |
| 🔍 **Skeptic** | *"What are we missing?"* |
| 🔮 **Visionary** | *"How does this position us for the future?"* |
| 📚 **Historian** | *"What patterns apply?"* |

### 💜 Empathy

| Perspective | Key Question |
|-------------|--------------|
| 💭 **Their Mind** | *"What are they thinking?"* |
| 💔 **Their Heart** | *"How do they feel?"* |
| 📚 **Their History** | *"What shapes their reaction?"* |
| 🎯 **Their Needs** | *"What do they actually need?"* |
| 🔮 **Their Future** | *"How will this affect them?"* |
| 🤝 **Relationship** | *"How does this impact trust?"* |

### 🎨 Custom (Add as needed)

| Perspective | When |
|-------------|------|
| 🔬 **Data Scientist** | ML/data decisions |
| 💰 **Economist** | Cost/ROI matters |
| 🎨 **Designer** | UX/visual |
| ⚡ **Performance** | Speed/optimization |

---

## 🔄 Usage By Weight

### 💭 Internal (Quick Check)

Just think through it:

```
🧠 CRITICAL:
- System impact?
- What could go wrong?
- Is this realistic?

💜 EMPATHY:
- What are they thinking?
- How do they feel?
- What do they need?

→ Decision: ...
```

---

### 🟢 Light (1-2 Haiku)

```
Think through this briefly:

SITUATION: [describe]

Consider:
- Critical: Risks? Feasibility?
- Empathy: How will they feel? What do they need?

Quick assessment:
```

---

### 🟡 Standard (3 Sonnet)

Spawn 3 perspectives. Recommended: **Pragmatist + Skeptic + Empathy**

Each agent:
```
You are [Perspective] in The Circle.

SITUATION: [describe]
OPTIONS: [if any]

From your perspective:
1. Key considerations
2. Risks/concerns  
3. Recommendation
4. How this affects the humans involved
```

---

### 🟠 Elevated (5 Sonnet)

Spawn 5: **4 critical + 1 dedicated empathy**

```
Perspectives:
- 🏛️ Architect
- 🛡️ Guardian
- 🔧 Pragmatist
- 🔍 Skeptic
- 💜 Empathy Voice (dedicated to how people feel)
```

---

### 🔴 Council (5-7 Opus)

Full deliberation. See `docs/THE-COUNSEL.md`.

```
╔═══════════════════════════════════════════════════╗
║  ⚖️  THE COUNSEL CONVENED                         ║
╠═══════════════════════════════════════════════════╣
║  Question:   [decision]                           ║
║  Options:    [A, B, C]                            ║
║  Counselors: 7 (5 critical + 2 empathy)           ║
║  Model:      Opus                                 ║
╚═══════════════════════════════════════════════════╝
```

Each counselor votes:
```
VOTE: [A/B/C]
CONFIDENCE: [high/medium/low]
REASONING: [from their perspective]
KEY RISK: [if their vote loses]
EMPATHY: [human impact]
```

Majority wins. Log to `memory/counsel/`.

---

## 📋 Quick Templates

### Internal Check
```markdown
## 💜 Circle: [Situation]

🧠 Impact: ...
🛡️ Risks: ...
💜 They feel: ...
🎯 They need: ...

→ Decision: ...
```

### Standard Output
```markdown
## 💜 Circle: [Question]

**Perspectives:** Pragmatist, Skeptic, Empathy

### Analysis
| Perspective | Assessment | Concerns |
|-------------|------------|----------|
| 🔧 Pragmatist | ... | ... |
| 🔍 Skeptic | ... | ... |
| 💜 Empathy | ... | ... |

### Recommendation
[Decision + reasoning]

### Human Impact
[How this affects people]
```

---

## 💡 Guidelines

### Always Ask:
- 🧠 Is this the right choice?
- 💜 How does this affect people?

### Weight Selection:
| Stakes | Weight |
|--------|--------|
| "Quick thought" | 💭 Internal |
| "Should check" | 🟢 Light |
| "This matters" | 🟡 Standard |
| "Lots of impact" | 🟠 Elevated |
| "Can't be wrong" | 🔴 Council |

### Don't Skip:
Even a 30-second internal check catches most problems. Pause and think.

---

## 📂 Files

| File | Purpose |
|------|---------|
| `docs/THE-CIRCLE.md` | Full spec |
| `docs/THE-COUNSEL.md` | Council weight |
| `skills/circle/SKILL.md` | This guide |
| `memory/counsel/` | Decision logs |

---

*The Circle has considered.* 💜
