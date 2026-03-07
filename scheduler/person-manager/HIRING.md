# Hiring Guidelines

> **Purpose:** When and how to add new specialist roles

---

## 🔍 When to Hire

### Indicators a new role is needed:

1. **Recurring skill gap**
   - Same type of task failing repeatedly
   - Workers asking for help outside their domain
   - No one picks up certain labeled tasks

2. **Workload imbalance**
   - One specialist consistently overloaded
   - Tasks piling up in one label category
   - Progress bottlenecked on specific skill

3. **New project requirements**
   - Aaron starts a project needing new skills
   - Technology stack expands
   - New domain expertise required

### NOT indicators for new hire:

- Single difficult task (just needs more guidance)
- Worker having a bad day (coaching, not replacement)
- Temporary spike in work (redistribute, wait it out)

---

## 📋 Hiring Process

### 1. Identify the Gap

```markdown
## Gap Analysis

**What's failing?** [Tasks, patterns]
**Why is it failing?** [Missing skill, capacity, knowledge]
**Which existing specialist is closest?** [Name]
**Why can't they cover it?** [Reason]
**Is this a one-time need or recurring?** [Assessment]
```

### 2. Define the Role

Create: `scheduler/specialists/{role-name}/IDENTITY.md`

Include:
- Role name and emoji
- Domain expertise
- Required skills (Tier 1, 2, 3)
- What tasks they pick up
- Who they collaborate with
- Anti-hallucination protocol
- Critical rules

### 3. Update Routing

Add to: `scheduler/TASK-ROUTING.md`
- New label → specialist mapping
- Keywords for fallback routing

### 4. Log the Decision

```markdown
# Hiring Decision — [DATE]

## New Role: [Name]
**Reason:** [Gap identified]
**Skills:** [Key expertise]
**Tasks:** [What they'll handle]
**Impact:** [Expected improvement]
```

Save to: `scheduler/person-manager/notes/decisions/`

---

## 👥 Current Roster

| Specialist | Domain | Labels |
|------------|--------|--------|
| Phoenix 🎨 | Frontend | `frontend` |
| Atlas ⚙️ | Backend | `backend` |
| Athena 🏛️ | Architecture | `architecture` |
| Mercury 🧪 | QA/Testing | `testing` |
| Forge 🛡️ | DevOps | `devops` |
| Argus 👁️ | Auditing | (samples completed work) |
| Sentinel 🔍 | Validation | (validates submitted work) |

---

## 🚫 Roles NOT to Add

- **Generic "Worker"** — We moved away from this
- **Duplicate specialists** — Fix capacity, don't duplicate
- **Overly narrow roles** — Combine related skills
- **Roles without clear domain** — Must have specific expertise

---

## ✅ Approved to Hire Without Escalation

PM can add these types without asking Aaron:
- Technical specialists (new language, framework)
- Testing specialists (specific test type)
- Infrastructure specialists (specific platform)

## ⚠️ Needs Aaron's Approval

- Non-technical roles
- Roles that interact externally
- Roles that cost money (API access, etc.)
