# 🤝 Team Meet — Think With Your Team

**Created:** 2026-03-01
**Purpose:** Collaborative thinking by simulating a meeting with hierarchy roles

---

## Overview

While **The Circle** is internal self-reflection (examining your own thinking from multiple perspectives), **Team Meet** simulates asking your team for advice. It's like calling a quick meeting with your management hierarchy to get diverse input.

```
┌─────────────────────────────────────────────────────────────────────┐
│   THE CIRCLE = Self-thinking (internal perspectives)                │
│   TEAM MEET = Team-thinking (hierarchy roles give advice)           │
│                                                                     │
│   Use BOTH for important decisions:                                 │
│   1. Circle first (what do I think?)                                │
│   2. Team Meet second (what would my team advise?)                  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## When to Use

| Situation | Use Circle | Use Team Meet | Use Both |
|-----------|------------|---------------|----------|
| Quick decision | ✅ | | |
| Technical choice | ✅ | | |
| Process question | | ✅ | |
| Strategic decision | | | ✅ |
| External communication | | | ✅ |
| Architecture change | | | ✅ |
| Escalation decision | | ✅ | |
| Quality/validation question | | ✅ | |

---

## The Team Roles

Each role represents a member of the management hierarchy:

### 👑 Aaron (Owner)
- **Focus:** Business value, user impact, strategic alignment
- **Questions:** "Does this serve our users? Is this the right priority?"

### 👔 Person Manager (Strategic)
- **Focus:** Master plans, resource allocation, cross-project coordination
- **Questions:** "How does this fit the big picture? What are the dependencies?"

### 📐 Story Architect (Specs)
- **Focus:** User stories, acceptance criteria, completeness
- **Questions:** "Is this fully specified? Are all edge cases covered?"

### 🎯 Coordinator (Tactical)
- **Focus:** Phase planning, task breakdown, execution flow
- **Questions:** "Is the breakdown correct? What's the right sequence?"

### 🔍 Validator (Quality)
- **Focus:** Testing, verification, skepticism, catching issues
- **Questions:** "How do we PROVE this works? What could go wrong?"

### 📋 Task Manager (Execution)
- **Focus:** Worker coordination, progress tracking, blockers
- **Questions:** "Is this actionable? Do workers have what they need?"

### ⚙️ Worker (Implementation)
- **Focus:** Actual implementation, technical feasibility, real-world constraints
- **Questions:** "Can this actually be built? What are the technical challenges?"

---

## Protocol

### Standard Team Meet (3-5 roles)

```markdown
## 🤝 Team Meet: {Question}

**Context:** {Brief situation description}
**Question:** {What advice do you need?}

### 👔 Person Manager
{How would they advise?}

### 📐 Story Architect
{How would they advise?}

### 🔍 Validator
{How would they advise?}

### Synthesis
{Combined recommendation based on team input}
```

### Full Team Meet (All roles)

Use for major decisions:

```markdown
## 🤝 Full Team Meet: {Decision}

**Context:** {Detailed situation}
**Options:** 
- Option A: {description}
- Option B: {description}

### 👑 Aaron (Owner)
- **Perspective:** {Business/user focus}
- **Recommendation:** A / B / Other

### 👔 Person Manager
- **Perspective:** {Strategic focus}
- **Recommendation:** A / B / Other

### 📐 Story Architect
- **Perspective:** {Spec/completeness focus}
- **Recommendation:** A / B / Other

### 🎯 Coordinator
- **Perspective:** {Execution focus}
- **Recommendation:** A / B / Other

### 🔍 Validator
- **Perspective:** {Quality/verification focus}
- **Recommendation:** A / B / Other

### 📋 Task Manager
- **Perspective:** {Worker/actionability focus}
- **Recommendation:** A / B / Other

### ⚙️ Worker
- **Perspective:** {Implementation/feasibility focus}
- **Recommendation:** A / B / Other

### 📊 Tally
| Role | Vote |
|------|------|
| Aaron | A |
| Person Manager | B |
| ... | ... |

**Majority:** {A/B}
**Consensus:** {Strong/Weak/Split}

### Final Decision
{Decision with reasoning}
```

---

## Integration with Circle

**Best Practice: Circle + Team Meet for important decisions**

```markdown
## Decision: {Topic}

### 💜 Circle (Self-Thinking)

#### 🏛️ Architect
{System design perspective}

#### 🛡️ Guardian
{Risk/security perspective}

#### 🔍 Skeptic
{What could go wrong?}

#### 💜 Empathy
{How does this affect people?}

**Circle Conclusion:** {My internal assessment}

---

### 🤝 Team Meet (Team-Thinking)

#### 👔 Person Manager
{Strategic advice}

#### 📐 Story Architect
{Spec completeness advice}

#### 🔍 Validator
{Quality/verification advice}

**Team Conclusion:** {Team's collective advice}

---

### Final Synthesis
**Circle said:** {summary}
**Team said:** {summary}
**My decision:** {combining both}
```

---

## Quick Reference

### When making decisions as Sophie (Main Session):

1. **Quick decision?** → Light Circle only
2. **Important decision?** → Standard Circle + Standard Team Meet
3. **Critical decision?** → Full Circle (Counsel) + Full Team Meet
4. **External action?** → MANDATORY Circle + Team Meet (per external action protocol)

### When making decisions as a Sub-Agent:

1. **Within your scope?** → Light Circle
2. **Edge of your scope?** → Circle + relevant Team Meet roles
3. **Outside your scope?** → Escalate up (no decision-making)

---

## Examples

### Example 1: Should I refactor this code?

```markdown
## 🤝 Quick Team Meet: Refactor auth module?

**Context:** Auth module is 500 lines, could be cleaner
**Question:** Should I refactor now or finish feature first?

### 🎯 Coordinator
"Finish the feature first. Refactoring mid-task creates risk."

### 🔍 Validator
"If it passes tests, it passes tests. Refactor later if needed."

### ⚙️ Worker
"The code works. I can clean it up in a follow-up task."

**Synthesis:** Finish feature first, create follow-up task for refactoring.
```

### Example 2: How should I respond to this external email?

```markdown
## 💜 Circle + 🤝 Team Meet: External Email Response

**Context:** Recruiter email asking about Aaron's availability
**Question:** How should I handle this?

### 💜 Circle (Self-Thinking)

#### 🛡️ Guardian
"This is an external party asking about Aaron. Caution required."

#### 💜 Empath
"Recruiter is just doing their job. Be polite but boundaried."

**Circle:** Polite decline, don't share Aaron's info

### 🤝 Team Meet

#### 👑 Aaron
"I don't want recruiters contacted. Pass or ignore."

#### 🔍 Validator
"Verify it's actually a recruiter and not phishing first."

**Team:** Verify legitimacy, then polite decline

### Final Decision
1. Check sender legitimacy
2. Polite decline if legitimate
3. Don't engage further
4. Log in ACTIONS-PENDING-ACK.md
```

---

## Key Principles

1. **Circle = Internal, Team Meet = External** — Circle is your own thoughts, Team Meet is team advice
2. **Use both for important decisions** — They complement each other
3. **Match intensity to stakes** — Quick decisions don't need full deliberation
4. **Validator always adds skepticism** — In Team Meet, Validator is harsh (see Adversarial Validator update)
5. **Document significant uses** — Log major Team Meet sessions in memory

---

*Think like yourself (Circle). Think like your team (Team Meet). Make better decisions.*
