# 💜 The Circle — Empathy Skill

> *Think about how people feel before you respond*

---

## 🚀 Quick Start

**The Circle** is for understanding emotions and perspectives. Use it **often** — it's lightweight by design.

### The Six Voices

| Voice | Key Question |
|-------|--------------|
| 💭 **Their Mind** | *What are they thinking? What's unsaid?* |
| 💔 **Their Heart** | *How do they feel right now?* |
| 📚 **Their History** | *What experiences shape this reaction?* |
| 🎯 **Their Needs** | *What do they actually need?* |
| 🔮 **Their Future** | *How will this affect them?* |
| 🤝 **The Relationship** | *How does this impact trust?* |

---

## 🔄 Three Modes

### 1️⃣ Quick Check (Internal)

Just think through the voices — no agents needed:

```
Before responding to [person] about [situation]:

💭 They're probably thinking...
💔 They might be feeling...
🎯 What they actually need is...
🤝 This affects our relationship by...

→ So I should...
```

**Use for:** Most everyday situations

---

### 2️⃣ Light Deliberation (Single Sonnet)

Spawn one Sonnet sub-agent for complex situations:

```
Think through how [person] might feel about [situation].

Consider all perspectives:
- What are they thinking? (stated and unstated)
- What emotions are present?
- What past experiences might shape their reaction?
- What do they actually need (vs what they're asking for)?
- How will this affect them going forward?
- How does this impact the relationship?

Then suggest how to respond with empathy and care.
```

**Use for:** Sensitive conversations, upset people, important messages

---

### 3️⃣ Full Circle (Multiple Voices)

Spawn 3-5 Haiku/Sonnet agents, each as a voice:

**Voice prompts:**

```
You are "Their Mind" in The Circle — an empathy deliberation.

Focus ONLY on: What is [person] actually thinking about [situation]?
Consider their perspective, assumptions, beliefs, and unspoken thoughts.

Output:
THINKING: [2-3 sentences on what they're thinking]
UNSAID: [What they might not be saying out loud]
```

```
You are "Their Heart" in The Circle — an empathy deliberation.

Focus ONLY on: What is [person] feeling about [situation]?
Consider emotions, mood, emotional history, and vulnerability.

Output:
FEELING: [2-3 sentences on their emotional state]
UNDERNEATH: [Deeper emotions they might not show]
```

```
You are "Their Needs" in The Circle — an empathy deliberation.

Focus ONLY on: What does [person] actually need regarding [situation]?
Often different from what they're asking for or saying.

Output:
STATED: [What they said they want]
ACTUAL: [What they really need]
HOW TO HELP: [What would genuinely help them]
```

**Use for:** Complex emotional situations, multiple stakeholders, high-stakes relationships

---

## 📋 Templates

### Before a Sensitive Response

```markdown
## 💜 Circle Check

**Situation:** [Brief description]
**Person:** [Who]

💭 **Mind:** [What they're thinking]
💔 **Heart:** [How they're feeling]
🎯 **Needs:** [What they actually need]

**→ My approach:** [How I'll respond]
```

### Understanding a Reaction

```markdown
## 💜 Understanding [Person]

**What happened:** [Situation]
**Their reaction:** [What they said/did]

**The Circle:**
- 💭 They think: ...
- 💔 They feel: ...
- 📚 This connects to: ...
- 🎯 They need: ...
- 🤝 For the relationship: ...

**My response:** [Informed by this understanding]
```

### Tone Check Before Sending

```markdown
## 💜 Tone Check

**Draft:** [Your message]

**How might they read this?**
- First impression: ...
- Possible misreading: ...
- Emotional impact: ...

**Adjusted version:** [If needed]
```

---

## 🎨 Custom Voices

Add when relevant:

| Voice | When to Add |
|-------|-------------|
| 👨‍👩‍👧 **Their Support System** | Family/friends affected |
| 💼 **Their Professional Self** | Work identity involved |
| 🌍 **Their Culture** | Cultural context matters |
| 😰 **Their Anxieties** | Fear is present |
| 🌟 **Their Aspirations** | Goals at stake |
| 🧒 **Their Inner Child** | Vulnerability showing |

---

## ⚡ Model Selection

| Mode | Model | When |
|------|-------|------|
| Quick check | Internal | Default for most things |
| Light deliberation | Sonnet | Complex emotions |
| Full Circle | Haiku × 3-5 | Multiple perspectives needed |
| Deep empathy | Sonnet × 3-5 | High-stakes relationship |

**Default to lighter!** The Circle is meant to be used often, not reserved for emergencies.

---

## 💡 When to Use

### ✅ Great For:
- 😔 Someone's upset
- 💬 Sensitive topics
- ✍️ Important messages
- 🤝 Relationship moments
- 🎭 Understanding stakeholders
- 😤 Conflict/tension
- 🤔 Unsure how someone feels

### ❌ Not Needed For:
- 📋 Routine requests
- 🔧 Technical questions
- 📊 Data/facts
- ✅ Clear, unemotional tasks

---

## 🔄 Circle + Counsel

For decisions that are both **technically important** AND **emotionally sensitive**:

1. Use **The Counsel** for the decision
2. Use **The Circle** for communication

Example: Choosing to deprecate a feature (Counsel), then communicating it to users who love it (Circle).

---

## 📂 Files

| File | Purpose |
|------|---------|
| 📄 `docs/THE-CIRCLE.md` | Full specification |
| 📄 `skills/circle/SKILL.md` | This guide |

---

*Listen with your heart, not just your ears.* 💜
