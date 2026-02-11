# ⚖️ Council Decision: Should we use PostgreSQL or SQLite for the Clawdbot memory system?

**🕐 Convened:** 2026-02-11T06:38:52.435Z
**⚙️ Complexity:** light
**👥 Counselors:** 3
**🤖 Model:** sonnet

---

## 📋 The Question
Should we use PostgreSQL or SQLite for the Clawdbot memory system?

## 📄 Context
Clawdbot is a single-user agent system running on a dev server. Memory operations include storing daily logs, project context, and decision logs. Data volume is low (MB range). Needs to be reliable but not high-performance. Currently using plain markdown files. Considering a database for better querying and relationships. Single developer maintaining it.

## 🎯 Options
- **A)** PostgreSQL
- **B)** SQLite

---

## 🗳️ Votes

| Counselor | Vote | Confidence | Reasoning |
|-----------|------|------------|-----------|
| 🏛️ The Architect | **B** | 🟢 high | SQLite provides zero operational complexity with the same relational capabilities we need. For a single-user system with MB-scale data, SQLite elimina... |
| 🛡️ The Guardian | **B** | 🟢 high | SQLite eliminates an entire attack surface by removing network exposure, authentication mechanisms, and port-based access vectors. For a single-user s... |
| 🔧 The Pragmatist | **B** | 🟢 high | SQLite is a single-file, zero-config database that ships as a library with no separate server process - you literally just `npm install better-sqlite3... |

---

## 📊 Tally
```
Option A: ░░░░░░░░░ 0 votes (0%)
Option B: █████████ 3 votes (100%) ✅
```

## ✅ Decision: Option B
🎉 **Unanimous decision!**


---

## 💜 Empathy Considerations
*No dedicated empathy counselor in this council.*

## ⚠️ Dissenting Concerns
*None — unanimous decision!*

## 🛡️ Recommended Mitigations
*No mitigations needed.*

---

## 📝 Full Counselor Responses

### 🏛️ The Architect
**Vote:** B | **Confidence:** high

**Reasoning:** SQLite provides zero operational complexity with the same relational capabilities we need. For a single-user system with MB-scale data, SQLite eliminates an entire dependency layer (PostgreSQL server) while maintaining identical migration paths if needs change. The architecture stays simple: file-based, embedded, version-controlled alongside code, with proper ACID guarantees and SQL querying.

**Key Concern:** PostgreSQL introduces unnecessary architectural complexity—a separate service to manage, configure, backup, and version across environments—adding operational surface area for zero functional benefit at this scale.

**Mitigation:** Design the data access layer with a clean abstraction boundary from day one, making any future migration to PostgreSQL a drop-in adapter change rather than a system-wide refactor.

### 🛡️ The Guardian
**Vote:** B | **Confidence:** high

**Reasoning:** SQLite eliminates an entire attack surface by removing network exposure, authentication mechanisms, and port-based access vectors. For a single-user system with sensitive agent memory data (project context, decisions, logs), SQLite's file-based architecture means access control reduces to filesystem permissions—simpler to audit, harder to exploit remotely. PostgreSQL introduces unnecessary complexity: connection pooling vulnerabilities, SQL injection surface area across network boundaries, credential management, and potential for misconfiguration exposing the database to external access.

**Key Concern:** PostgreSQL deployment creates remote attack vectors and increases the blast radius of credential compromise—even on a "dev server," exposed ports are routinely scanned and exploited, and agent memory data could contain API keys, architectural details, or sensitive project information.

**Mitigation:** If PostgreSQL is chosen, enforce Unix socket connections only (disable TCP listeners), implement connection encryption with certificate pinning, enable audit logging for all queries, and store credentials in encrypted vaults with rotation policies—never in config files.

### 🔧 The Pragmatist
**Vote:** B | **Confidence:** high

**Reasoning:** SQLite is a single-file, zero-config database that ships as a library with no separate server process - you literally just `npm install better-sqlite3` and you're done. PostgreSQL requires installing and running a separate database server, managing connections, handling authentication, monitoring the service, and dealing with potential port conflicts or startup failures. For a single developer maintaining a personal agent system with MB-range data, the operational overhead of PostgreSQL provides zero practical benefit while adding deployment complexity, backup complexity, and another service to monitor.

**Key Concern:** If PostgreSQL is chosen, we're signing up for managing a database service that will require initial setup time, ongoing monitoring, and potential troubleshooting when connections fail or the service doesn't start - all for a use case that doesn't need it.

**Mitigation:** Use SQLite with WAL mode enabled for better concurrency, and if we ever hit real scaling needs (multiple concurrent users, GB+ data, complex queries under load), we can migrate then - SQLite and PostgreSQL share enough SQL syntax that migration would be straightforward.


---

*⚖️ The Counsel has spoken.*
