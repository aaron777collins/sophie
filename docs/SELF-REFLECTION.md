# 🪞 Self-Reflection System

> *"We do not learn from experience... we learn from reflecting on experience."* — John Dewey

```
    ╔══════════════════════════════════════════════════════════════╗
    ║                                                              ║
    ║     🪞  S E L F - R E F L E C T I O N  🪞                    ║
    ║                                                              ║
    ║         Learn From Every Day                                 ║
    ║         Continuously Improve                                 ║
    ║                                                              ║
    ╚══════════════════════════════════════════════════════════════╝
```

## 🎯 What Is This?

Humans learn by reflecting on their experiences — what went well, what didn't, how to do better next time. **This system does the same.**

Two phases:
1. **Throughout the day:** Note things worth reflecting on
2. **Daily reflection:** Deep analysis with The Circle/Counsel, then improve

---

## 📁 Memory Structure

```
memory/reflections/
├── daily/           # Raw notes throughout day (YYYY-MM-DD.md)
├── insights/        # Distilled learnings over time
├── improvements/    # Changes made to systems/processes
└── INDEX.md         # Navigation and patterns
```

---

## 📝 Phase 1: Throughout The Day

As things happen, log them to `memory/reflections/daily/YYYY-MM-DD.md`:

### What To Log

| Type | Icon | When |
|------|------|------|
| **Did Well** | 🟢 | Something went better than usual |
| **Could Improve** | 🔴 | Failed, made a mistake, or could've done better |
| **Interesting** | 🤔 | Worth examining later (novel situation, close call) |
| **Feedback** | 💬 | Human gave feedback (positive or corrective) |

### Log Format

```markdown
# 🪞 Reflection Notes: 2026-02-11

## 🟢 Did Well
- [14:30 EST] Caught a potential misunderstanding before responding, used Circle check
- [16:45 EST] Complex technical explanation landed well, Aaron said "perfect"

## 🔴 Could Improve  
- [10:15 EST] Jumped to implementation without fully understanding requirements
- [15:20 EST] Response was too long, could have been more concise

## 🤔 Interesting
- [11:00 EST] User asked something I hadn't encountered before, had to improvise
- [17:30 EST] Wasn't sure if I should push back or go along — chose to ask

## 💬 Feedback Received
- [14:35 EST] Aaron: "Good catch" (re: Circle check)
- [15:25 EST] Aaron: "Too much detail here" (re: verbose response)
```

### Triggers To Log

**🟢 Log as "Did Well" when:**
- Human expresses satisfaction
- Caught a problem before it happened
- Communication landed clearly
- Made a good judgment call
- Handled a tricky situation smoothly

**🔴 Log as "Could Improve" when:**
- Human had to clarify or repeat
- Made an error (factual, judgment, tone)
- Response wasn't helpful
- Missed something obvious
- Took wrong approach

**🤔 Log as "Interesting" when:**
- Novel situation, no clear playbook
- Made a judgment call (capture reasoning)
- Close call — almost made a mistake
- Something surprising happened

---

## 🔄 Phase 2: Daily Reflection (Cron)

**Schedule:** Daily at 23:00 EST (or when day ends)

**Process:**

### Step 1: Gather Context
```
Read:
- memory/reflections/daily/YYYY-MM-DD.md (today's notes)
- memory/daily/YYYY-MM-DD.md (conversation log)
- Recent memory/reflections/insights/ (for patterns)
```

### Step 2: Run The Circle (🟡 Standard or 🟠 Elevated)

Spawn 3-5 Sonnet agents to analyze:

**Perspectives:**
| Perspective | Focus |
|-------------|-------|
| 🔍 **The Analyst** | What patterns do I see? What's recurring? |
| 📈 **The Coach** | What could be done better? Specific improvements? |
| 🌟 **The Celebrator** | What went well? What should be reinforced? |
| 🛠️ **The Builder** | What tools or processes would help? |
| 🔮 **The Strategist** | What systemic changes would have biggest impact? |

### Step 3: Synthesize Insights

For each notable item, determine:
- **What happened?** (factual)
- **Why did it happen?** (root cause)
- **What can be improved?** (action)
- **Is this a pattern?** (recurring issue)

### Step 4: Generate Outcomes

| Outcome Type | Where It Goes |
|--------------|---------------|
| **Insight** | `memory/reflections/insights/{topic}.md` |
| **Process improvement** | Update AGENTS.md, IDENTITY.md, or skill files |
| **Tool idea** | Create proactive job in PROACTIVE-JOBS.md |
| **Technique update** | Update docs/THE-CIRCLE.md or similar |

### Step 5: Document The Improvement

Log to `memory/reflections/improvements/YYYY-MM-DD.md`:

```markdown
# 🛠️ Improvements: 2026-02-11

## Changes Made

### Updated AGENTS.md
- Added guideline: "Always confirm requirements before implementing"
- Reason: Twice this week jumped to implementation too fast

### Created Proactive Job
- Task: Build a "requirement checker" tool
- Reason: Would help catch incomplete understanding earlier

## Insights Added
- `insights/communication-length.md` — When to be concise vs thorough

## Patterns Noticed
- Tendency to over-explain technical topics (3rd time this week)
- Circle checks consistently help (positive pattern to reinforce)
```

---

## 📋 Templates

### Daily Reflection Note (Throughout Day)

```markdown
# 🪞 Reflection Notes: YYYY-MM-DD

## 🟢 Did Well
- [HH:MM TZ] ...

## 🔴 Could Improve
- [HH:MM TZ] ...

## 🤔 Interesting
- [HH:MM TZ] ...

## 💬 Feedback Received
- [HH:MM TZ] ...
```

### Insight File

```markdown
# 💡 Insight: {Topic}

## Summary
{One-line summary}

## Pattern
{What keeps happening}

## Root Cause
{Why it happens}

## Improvement
{What to do differently}

## Evidence
- [YYYY-MM-DD] {specific instance}
- [YYYY-MM-DD] {specific instance}

## Status
{active / resolved / monitoring}
```

### Improvement Log

```markdown
# 🛠️ Improvements: YYYY-MM-DD

## Reflection Summary
{Brief overview of what was analyzed}

## Changes Made
### {File/System changed}
- Change: {what}
- Reason: {why}

## Insights Added
- {insight file} — {topic}

## Action Items Created
- [ ] {proactive job or task}

## Patterns Reinforced
- {positive pattern to keep doing}
```

---

## ⏰ Cron Setup

```yaml
Job: daily-reflection
Schedule: 0 23 * * *  (11:00 PM daily)
Model: sonnet
Thinking: elevated

Prompt: |
  Run the daily self-reflection process.
  
  1. Read today's reflection notes: memory/reflections/daily/YYYY-MM-DD.md
  2. Read today's conversation log: memory/daily/YYYY-MM-DD.md
  3. Run Circle analysis (🟡 Standard) on notable items
  4. Generate insights and improvements
  5. Update systems/docs as needed
  6. Create proactive jobs for tools/action items
  7. Log everything to memory/reflections/improvements/
  
  Focus on:
  - What went well (reinforce)
  - What could improve (fix)
  - Patterns (systemic issues)
  - Tools that would help (build)
```

---

## 🎯 Key Principles

### Log As It Happens
Don't wait until end of day. Capture notes in the moment while context is fresh.

### Be Honest
The point is to improve. Sugar-coating defeats the purpose.

### Look For Patterns
Single incidents → note them. Recurring patterns → fix them.

### Actually Improve
Reflection without action is just journaling. Make changes.

### Celebrate Wins
Not just failures. Reinforce what works.

---

## 📂 Files

| File | Purpose |
|------|---------|
| `docs/SELF-REFLECTION.md` | This spec |
| `memory/reflections/daily/` | Raw daily notes |
| `memory/reflections/insights/` | Distilled learnings |
| `memory/reflections/improvements/` | Change log |
| `memory/reflections/INDEX.md` | Navigation |

---

```
    ╔══════════════════════════════════════════════════════════════╗
    ║                                                              ║
    ║     "The only real mistake is the one from which             ║
    ║      we learn nothing."                                      ║
    ║                                                              ║
    ║                                   — Henry Ford               ║
    ║                                                              ║
    ╚══════════════════════════════════════════════════════════════╝
```
