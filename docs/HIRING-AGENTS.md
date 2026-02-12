# Hiring Agents — Creating New "People" in the Hierarchy

> *"Many hands make light work."*

This guide explains how to create a new agent ("person") at any level of the management hierarchy.

## Quick Reference

| Level | Role | Model | Cron? | Identity File |
|-------|------|-------|-------|---------------|
| 1 | Person Manager | Opus | Yes (4x/day) | `scheduler/person-manager/IDENTITY.md` |
| 2 | Coordinator | Sonnet | Yes (30 min) | `scheduler/coordinator/IDENTITY.md` |
| 3 | Task Manager | Haiku/Sonnet | Yes (15 min) | `scheduler/task-managers/IDENTITY.md` |
| 4 | Worker | Varies | No (spawned) | `scheduler/workers/IDENTITY.md` |

---

## Creating a New Person

### Step 1: Decide the Role

**Questions to ask:**
- What level? (Strategic, tactical, or execution?)
- Recurring or one-off? (Cron or spawned?)
- What model? (Complex reasoning = Opus/Sonnet, execution = Haiku)
- What's their scope? (Project? Topic? Task?)

### Step 2: Create the Identity

Every person needs an IDENTITY.md file. Create it at:
```
scheduler/{role-name}/IDENTITY.md
```

**Template:**
```markdown
# {Role Name} — Level {X}

> *"Their motto or guiding principle"*

## Role

{One paragraph describing what this person does and why they exist.}

## Key Characteristics

- **Cron:** {schedule or "Spawned on demand"}
- **Model:** {Haiku/Sonnet/Opus}
- **Jobs File:** {path to jobs file, if any}
- **Notes:** {path to notes folder}
- **Inbox:** `scheduler/inboxes/{role-name}/`

## ⚡ On Every Run

1. **Check your inbox** first: `ls ~/clawd/scheduler/inboxes/{inbox}/*.json`
2. **Process any messages** — respond, act, or delegate
3. {Role-specific steps}

## 📬 Two-Way Communication

### Check Your Inbox
\`\`\`bash
ls ~/clawd/scheduler/inboxes/{inbox}/*.json 2>/dev/null
\`\`\`

### Send Message to {Superior}
\`\`\`bash
cat > ~/clawd/scheduler/inboxes/{superior-inbox}/$(date +%s)-{role}-msg.json << 'EOF'
{
  "id": "{role}-TIMESTAMP",
  "timestamp": "ISO",
  "from": "{role-name}",
  "to": "{superior}",
  "subject": "Subject",
  "content": "Message"
}
EOF
\`\`\`

### Reply to a Message
\`\`\`bash
cat ~/clawd/scheduler/inboxes/{inbox}/{filename}
cat > ~/clawd/scheduler/inboxes/{sender-inbox}/$(date +%s)-{role}-reply.json << 'EOF'
{
  "from": "{role-name}",
  "to": "[original sender]",
  "subject": "Re: [original subject]",
  "content": "Reply",
  "replyTo": "[original id]"
}
EOF
rm ~/clawd/scheduler/inboxes/{inbox}/{filename}
\`\`\`

## 🚀 Spawning (if applicable)

### If Running as Cron
\`\`\`
sessions_spawn(
  agentId="main",
  label="{task-id}",
  model="{model}",
  task="Read ~/clawd/scheduler/{role}/IDENTITY.md first. {instructions}"
)
\`\`\`

### If Running as Sub-Agent
Use spawn queue: `scheduler/spawn-queue/requests/`

## Responsibilities

1. {List key responsibilities}
2. {Each one actionable}

## 📝 NOTE-TAKING (CRITICAL!)

Notes location: `scheduler/{role-name}/notes/`

## Interaction with Other Levels

- **Reports to:** {superior}
- **Direct reports:** {subordinates}
- **Inbox from:** {who sends them messages}
- **Messages to:** {who they message}
```

### Step 3: Create Supporting Infrastructure

```bash
# Create directories
mkdir -p ~/clawd/scheduler/{role-name}/notes
mkdir -p ~/clawd/scheduler/inboxes/{role-name}

# Create jobs file if needed
touch ~/clawd/scheduler/{role-name}/JOBS.md
```

### Step 4: Add Cron (if recurring)

For cron-based agents, add a job:

```javascript
// Use cron tool
cron.add({
  name: "{role-name}",
  enabled: true,
  schedule: { kind: "cron", expr: "*/30 * * * *" },  // Adjust timing
  sessionTarget: "isolated",
  wakeMode: "now",
  payload: {
    kind: "agentTurn",
    message: "You are the **{Role Name}**.\n\nFIRST: Read ~/clawd/scheduler/{role-name}/IDENTITY.md\n\n{instructions}",
    model: "{model}",
    deliver: true,
    channel: "slack",
    to: "channel:C0ABAU26S6N"
  }
})
```

### Step 5: Register in INDEX

Add the new person to `scheduler/INDEX.md`:

```markdown
## Active Agents

| Role | Level | Cron | Model | Status |
|------|-------|------|-------|--------|
| Person Manager | 1 | 4x/day | Opus | ✅ Active |
| Coordinator | 2 | */30 min | Sonnet | ✅ Active |
| {New Role} | {X} | {schedule} | {model} | ✅ Active |
```

---

## Spawning a One-Off Worker

For task-specific workers that don't need their own identity:

```
sessions_spawn(
  agentId="main",
  label="task-id-here",
  model="anthropic/claude-3-5-haiku-latest",
  task="You are a Worker. Read ~/clawd/scheduler/workers/IDENTITY.md first.

  YOUR TASK:
  {detailed instructions}

  WHEN DONE:
  1. Update PROACTIVE-JOBS.md
  2. Write to progress file
  3. Send completion message to task-manager inbox
  4. Delete your heartbeat"
)
```

---

## Hiring for a Specific Project

When a project needs dedicated management:

### 1. Create Project Manager Identity

```
scheduler/projects/{project-name}/IDENTITY.md
```

### 2. Give Them a Jobs File

```
scheduler/projects/{project-name}/JOBS.md
```

### 3. Add to Coordinator's Scope

Update `scheduler/coordinator/JOBS.md`:
```markdown
## Active Projects
- {project-name} — Manager: `scheduler/projects/{project-name}/`
```

### 4. Spawn or Cron

- **Small project:** Spawn on demand from Coordinator
- **Large project:** Add dedicated cron

---

## Model Selection Guide

| Complexity | Model | When to Use |
|------------|-------|-------------|
| **Simple** | Haiku | Clear instructions, execution-only, no ambiguity |
| **Moderate** | Sonnet | Needs reasoning, some decisions, implementation |
| **Complex** | Opus | Architecture, strategy, ambiguous scope, critical decisions |

**Rule of thumb:** If you can write step-by-step instructions, use Haiku. If they need to figure out *how*, use Sonnet. If they need to figure out *what*, use Opus.

---

## Communication Patterns

### Downward (Manager → Worker)
```
Manager spawns worker with task in the prompt
OR
Manager writes to worker's inbox with instructions
```

### Upward (Worker → Manager)
```
Worker writes to manager's inbox with:
- Status updates
- Questions/blockers
- Escalations
- Completion notices
```

### Lateral (Peer → Peer)
```
Generally avoid — go through shared manager
Exception: Shared project context in progress files
```

---

## Checklist: New Person

- [ ] IDENTITY.md created with full template
- [ ] Inbox directory exists
- [ ] Notes directory exists
- [ ] Jobs file created (if applicable)
- [ ] Cron added (if recurring)
- [ ] Registered in scheduler/INDEX.md
- [ ] Superior knows about them (updated in their scope)
- [ ] Test run completed

---

## Example: Creating a "Research Manager"

```bash
# 1. Create structure
mkdir -p ~/clawd/scheduler/research-manager/notes
mkdir -p ~/clawd/scheduler/inboxes/research-manager
touch ~/clawd/scheduler/research-manager/JOBS.md

# 2. Create IDENTITY.md (use template above)

# 3. Add cron (if recurring)
# cron add with appropriate schedule

# 4. Update INDEX.md

# 5. Test
sessions_spawn(
  agentId="main",
  label="research-mgr-test",
  model="anthropic/claude-sonnet-4-20250514",
  task="Read ~/clawd/scheduler/research-manager/IDENTITY.md. Report your role and capabilities."
)
```

---

## Firing / Retiring an Agent

1. Disable their cron (if any)
2. Move their folder to `scheduler/archive/{role-name}/`
3. Update INDEX.md
4. Notify their manager

Don't delete — archive for context.
