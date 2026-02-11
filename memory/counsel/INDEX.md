# ⚖️ Counsel Decision Index

> Master index of all Council decisions — The Circle at maximum weight.

```
╔══════════════════════════════════════════════════════════════════╗
║  📚  C O U N S E L   D E C I S I O N   I N D E X               ║
╚══════════════════════════════════════════════════════════════════╝
```

**Last Updated:** 2026-02-11 06:15 EST

---

## 📊 Decision Log

| Date | Slug | Topic | Options | Result | Votes | Revisited? | Tags |
|------|------|-------|---------|--------|-------|------------|------|
| 2026-02-11 | [postgresql-vs-sqlite](2026-02-11-06-38-should-we-use-postgresql-or-sqlite-for-t.md) | Database for Clawdbot memory | A) PostgreSQL B) SQLite | **B** ✅ | 3-0 (unanimous) | No | `#storage` `#architecture` `#core` |
| 2026-02-11 | [structured-vs-readable-logs](2026-02-11-06-40-should-clawdbot-use-structured-logging-j.md) | Logging format for Clawdbot | A) JSON B) Human-readable C) Hybrid | **C** ✅ | 4-1 | No | `#process` `#architecture` `#core` |

---

## 🏷️ By Tag

### Architecture Decisions (`#architecture`)
*Decisions affecting system structure and design*

- [2026-02-11: PostgreSQL vs SQLite](2026-02-11-06-38-should-we-use-postgresql-or-sqlite-for-t.md) — Chose SQLite for zero operational complexity
- [2026-02-11: Structured vs Readable Logs](2026-02-11-06-40-should-clawdbot-use-structured-logging-j.md) — Chose hybrid approach for future flexibility

### Security & Privacy (`#security`, `#privacy`)
*Decisions involving security choices and risk mitigation*

- *None yet*

### Data & Storage (`#data`, `#storage`)
*Decisions about data models, storage, and persistence*

- [2026-02-11: PostgreSQL vs SQLite](2026-02-11-06-38-should-we-use-postgresql-or-sqlite-for-t.md) — SQLite for single-user, low-volume system

### Integration & APIs (`#integration`, `#api`)
*Decisions about external services and integrations*

- *None yet*

### Strategy & Direction (`#strategy`, `#direction`)
*Decisions about strategic pivots and long-term direction*

- *None yet*

### Breaking Changes (`#breaking-change`)
*Decisions that impact existing users or partners*

- *None yet*

### Process & Workflow (`#process`, `#workflow`)
*Decisions about how we work and operate*

- [2026-02-11: Structured vs Readable Logs](2026-02-11-06-40-should-clawdbot-use-structured-logging-j.md) — Hybrid logging for dev ergonomics + future analysis

### Core Systems (`#core`)
*Decisions affecting core functionality*

- [2026-02-11: PostgreSQL vs SQLite](2026-02-11-06-38-should-we-use-postgresql-or-sqlite-for-t.md)
- [2026-02-11: Structured vs Readable Logs](2026-02-11-06-40-should-clawdbot-use-structured-logging-j.md)

---

## 🔄 Patterns Observed

### Recurring Themes
*Common decision patterns and what they reveal*

| Theme | Observations |
|-------|--------------|
| **Simplicity wins** | Both decisions favored simpler solutions (SQLite over Postgres, hybrid over pure JSON) |
| **Future-proofing** | Counselors consistently recommend abstraction layers for migration paths |
| **Dev experience** | Pragmatist perspective heavily weights single-developer ergonomics |

### Counselor Voting Patterns

| Counselor | Alignment Pattern | Notes |
|-----------|------------------|-------|
| 🏛️ Architect | Aligns with Guardian on security | Values clean abstraction boundaries |
| 🛡️ Guardian | Favors reduced attack surface | Consistently warns about network exposure |
| 🔧 Pragmatist | Most likely to dissent | Weights immediate dev needs over future scale |
| 🔍 Skeptic | Favors hybrid/flexible options | Challenges hidden assumptions |
| 🔮 Visionary | Aligns with Architect | Focuses on evolution paths |

### Dissent Patterns

| Counselor | Frequent Dissent Topics | Notable Concerns |
|-----------|------------------------|------------------|
| 🔧 Pragmatist | Complexity/tooling | "Don't over-engineer for needs that may never materialize" |

### Revisited Decisions
*Decisions we've reconsidered and why*

- *No decisions revisited yet*

---

## 📈 Statistics

| Metric | Count |
|--------|-------|
| **Total Decisions** | 2 |
| Unanimous (all votes) | 1 (50%) |
| Strong Majority (5+) | 1 (50%) |
| Close Calls (≤1 vote margin) | 0 |
| Revisited | 0 |
| Escalated to Human | 0 |

### By Category
| Tag | Count |
|-----|-------|
| `#architecture` | 2 |
| `#core` | 2 |
| `#storage` | 1 |
| `#process` | 1 |

### Council Composition Used
| Config | Count |
|--------|-------|
| 3 counselors (light) | 1 |
| 5 counselors (elevated) | 1 |
| 7 counselors (full) | 0 |

---

## 📋 Index Maintenance Process

### After Every Council Decision

1. **Add row to Decision Log**
   ```markdown
   | YYYY-MM-DD | [slug](filename.md) | Topic | Options | Result | Votes | No | `#tag1` `#tag2` |
   ```

2. **Update By Tag sections**
   - Add link under each relevant tag category
   - Include brief summary of decision

3. **Update Statistics**
   - Increment Total Decisions
   - Update category counts
   - Note if unanimous, close call, etc.

4. **Check for patterns** (every 5 decisions)
   - Review voting patterns
   - Note recurring themes
   - Update Patterns Observed section

### When Revisiting a Decision

1. Update "Revisited?" column → "Yes → YYYY-MM-DD"
2. Add entry to Revisited Decisions section
3. Create new decision file linking to original

### Tag Taxonomy

| Tag | Use When |
|-----|----------|
| `#architecture` | System structure, patterns, scalability |
| `#security` | Security choices, authentication, authorization |
| `#privacy` | Data privacy, user consent, PII handling |
| `#data` | Data models, schemas, migrations |
| `#storage` | Databases, file systems, caching |
| `#integration` | External services, APIs, webhooks |
| `#api` | API design, endpoints, contracts |
| `#strategy` | Long-term direction, vision, priorities |
| `#breaking-change` | Changes affecting existing users |
| `#process` | Internal workflows, how we work |
| `#core` | Core functionality, critical systems |
| `#ux` | User experience decisions |
| `#performance` | Speed, efficiency, optimization |

---

## 📂 File Reference

| Location | Purpose |
|----------|---------|
| `memory/counsel/INDEX.md` | This index (master navigation) |
| `memory/counsel/YYYY-MM-DD-HH-MM-slug.md` | Individual decision logs |
| `docs/THE-COUNSEL.md` | Council protocol reference |
| `docs/THE-CIRCLE.md` | Full Circle framework |
| `skills/circle/SKILL.md` | Agent implementation guide |

---

```
╔══════════════════════════════════════════════════════════════════╗
║  "Those who do not learn from history are doomed to repeat it." ║
╚══════════════════════════════════════════════════════════════════╝
```
