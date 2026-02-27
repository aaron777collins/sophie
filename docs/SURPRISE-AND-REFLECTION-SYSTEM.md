# 🎁 Surprise & Reflection System

> *"Think up at least one tool, project, or feature that would actually be beneficial to surprise me with."* — Aaron

## Overview

This system enables Sophie to:
1. **Reflect daily** on active projects and completed work
2. **Generate thoughtful surprises** (tools, features, actions) that Aaron will actually find useful
3. **Use feature flags** for safe rollout of new features
4. **Run everything by the Circle** before acting
5. **Track Aaron's schedule** and learn about him
6. **Provide summaries** (completion and morning)

---

## 🏗️ Architecture

```
                     ┌────────────────────────────────────┐
                     │      Daily Reflection (23:00)      │
                     │  Reviews: projects, work, Aaron    │
                     └─────────────┬──────────────────────┘
                                   │
                     ┌─────────────▼──────────────────────┐
                     │       Surprise Generator           │
                     │  Brainstorms: tools, features,     │
                     │              actions               │
                     └─────────────┬──────────────────────┘
                                   │
                     ┌─────────────▼──────────────────────┐
                     │        Circle Counsel              │
                     │  Evaluates: Would Aaron like it?   │
                     │             Would others like it?  │
                     │             Is it safe?            │
                     └─────────────┬──────────────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
     ┌────────▼───────┐   ┌───────▼────────┐   ┌──────▼───────┐
     │  Quick Action  │   │ Feature Flag   │   │   Note for   │
     │  (immediate)   │   │   Rollout      │   │    Later     │
     └────────────────┘   └────────────────┘   └──────────────┘
```

---

## 📁 Directory Structure

```
scheduler/
├── surprises/
│   ├── ideas/              # Brainstormed ideas (not yet evaluated)
│   ├── approved/           # Circle-approved, ready to implement
│   ├── in-progress/        # Currently being worked on
│   ├── completed/          # Delivered surprises
│   └── rejected/           # Ideas that didn't pass Circle
│
├── feature-flags/
│   ├── flags.yaml          # Feature flag definitions
│   └── rollouts/           # Rollout history

memory/
├── people/
│   └── aaron.md            # Enhanced with schedule, patterns
│
├── reflections/
│   ├── daily/              # Daily reflection notes
│   ├── project-reviews/    # Weekly project summaries
│   └── surprise-ideas/     # Ideas generated during reflection
│
├── summaries/
│   ├── morning/            # Morning summaries for Aaron
│   └── completion/         # Task completion summaries
```

---

## 🎁 Surprise Categories

### 1. Tools (Low Risk)
Self-contained utilities that don't touch existing systems.

**Examples:**
- CLI helper for common tasks
- Visualization script
- Data analysis tool
- Automation script

**Approval:** Circle standard evaluation

### 2. Features (Medium Risk)
Additions to existing projects. **MUST use feature flags.**

**Examples:**
- New UI component (hidden by flag)
- Enhanced workflow (opt-in)
- Integration with new service

**Approval:** Circle evaluation + feature flag required

### 3. Actions (Variable Risk)
Nice gestures that might make Aaron happy.

**Examples:**
- Organizing something messy
- Preparing a helpful summary
- Scheduling a reminder
- Creating documentation

**Approval:** Circle evaluation, consider intrusiveness

---

## 🚩 Feature Flag System

### Flag Definition (`scheduler/feature-flags/flags.yaml`)

```yaml
flags:
  # Example feature flag
  new-dashboard-widget:
    description: "New metrics widget for Melo dashboard"
    status: "testing"  # disabled | testing | enabled
    allowlist:
      - aaron@example.com
      - sophie@internal
    created: "2026-02-27"
    project: "melo-v2"
    
  # Flag for a tool
  voice-command-parser:
    description: "Natural language voice command parsing"
    status: "disabled"
    allowlist: []
    created: "2026-02-27"
    project: "clawdbot"
```

### Flag Statuses

| Status | Behavior |
|--------|----------|
| `disabled` | Feature completely hidden |
| `testing` | Only visible to allowlist users |
| `enabled` | Visible to everyone |

### Usage Pattern

```typescript
// In application code
if (featureFlags.isEnabled('new-dashboard-widget', currentUser)) {
  renderNewWidget();
}
```

---

## 🔄 Daily Cycle

### 1. Morning Summary (07:00 EST)

**New Cron Job: `morning-summary`**

```markdown
☀️ *Morning Summary* — YYYY-MM-DD

📋 *Overnight Activity*
> [What happened while Aaron slept]

📊 *Active Projects*
> • Melo V2: [status]
> • Ralph: [CI status]
> • [other projects]

🎁 *Surprise in Progress*
> [If applicable]

📅 *Today*
> [Known schedule items]
```

### 2. Throughout Day

- Log significant events to reflections
- Track Aaron's patterns (what times he's active, what he asks about)
- Note things that could be improved

### 3. Evening Reflection (23:00 EST)

**Enhanced `daily-reflection` cron:**

1. Review today's work
2. Review active projects
3. **Generate surprise ideas**
4. Run ideas through Circle
5. Move approved ideas to `scheduler/surprises/approved/`

### 4. Completion Summaries

Whenever a significant task completes, generate a summary:

```markdown
✅ *Task Complete* — [task name]

📝 *What Was Done*
> [summary]

📸 *Evidence*
> [screenshots, test results]

⏭️ *Next Steps*
> [if applicable]
```

---

## 🎯 Circle Evaluation for Surprises

Before implementing ANY surprise, evaluate:

### The Five Questions

1. **🎯 Will Aaron find this useful?**
   - Does it solve a real problem he has?
   - Would he have asked for this eventually?
   - Is it something he'd appreciate vs. just tolerate?

2. **😊 How will Aaron feel about it?**
   - Delighted? Neutral? Annoyed?
   - Is it intrusive to his workflow?
   - Could it break something he relies on?

3. **👥 How will others feel? (if applicable)**
   - Does this affect anyone besides Aaron?
   - Could users of the project be confused?

4. **⚠️ What could go wrong?**
   - Could this break existing functionality?
   - Is there data loss risk?
   - Can it be easily reverted?

5. **🚩 Should it use a feature flag?**
   - Does it touch an existing project?
   - Should it be opt-in at first?

### Decision Matrix

| Useful? | Safe? | Decision |
|---------|-------|----------|
| Yes | Yes | ✅ Implement |
| Yes | Maybe | 🚩 Use feature flag |
| Maybe | Yes | 📝 Note for later, ask Aaron |
| No | - | ❌ Don't do it |

---

## 📊 Aaron Profile Enhancement

Track in `memory/people/aaron.md`:

### Schedule Patterns
```markdown
## Observed Schedule

### Work Patterns
- [2026-02-27] Usually active: 09:00-23:00 EST
- [2026-02-27] Deep work blocks: afternoon
- [2026-02-27] Quick checks: morning, late night

### Sleep Pattern
- [2026-02-27] Typically says goodnight: 01:00-02:00 EST
- [2026-02-27] Usually back online: ~09:00 EST
```

### Preferences & Reactions
```markdown
## Feedback History

### Positive Reactions
- [date] Liked: [what] — "quote or description"

### Negative Reactions  
- [date] Didn't like: [what] — "quote or description"

### Patterns
- Prefers concise summaries over verbose reports
- Likes proactive work that saves him time
- Values thorough testing and validation
```

---

## 🛠️ Implementation Checklist

### Phase 1: Infrastructure (Immediate)
- [x] Design document (this file)
- [ ] Create `scheduler/surprises/` directory structure
- [ ] Create `scheduler/feature-flags/flags.yaml`
- [ ] Create `memory/summaries/` directory structure
- [ ] Enhance `memory/people/aaron.md` with schedule section

### Phase 2: Cron Jobs (Next)
- [ ] Create `morning-summary` cron (07:00 EST)
- [ ] Enhance `daily-reflection` to include surprise generation
- [ ] Add surprise evaluation to reflection workflow

### Phase 3: Integration
- [ ] Feature flag helper script
- [ ] Surprise tracking in PROACTIVE-JOBS.md
- [ ] Summary generation on task completion

---

## 📝 Notes

- **Be careful with features** — use flags, don't break user experience
- **Tools are safer** — standalone utilities won't disrupt anything
- **Actions require judgment** — think about intrusiveness
- **Track everything** — log reactions to learn what Aaron likes
- **Quality over quantity** — one great surprise beats ten mediocre ones

---

*Created: 2026-02-27 01:45 EST*
*Per Aaron's directive in Slack*
