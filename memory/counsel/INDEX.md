# ⚖️ Counsel Decision Index

Track decisions for precedent lookup and pattern recognition.

## 📊 Decision Log

| Date | Question | Options | Result | Confidence | File |
|------|----------|---------|--------|------------|------|
| 2026-02-11 | Database for Clawdbot memory system | PostgreSQL, SQLite | SQLite ✅ | Unanimous | [View](2026-02-11-06-38-should-we-use-postgresql-or-sqlite-for-t.md) |
| 2026-02-11 | Logging format for Clawdbot | JSON, Text, Hybrid | Hybrid ✅ | 80% (4/5) | [View](2026-02-11-06-40-should-clawdbot-use-structured-logging-j.md) |

## 🏷️ By Category

### Architecture
- [2026-02-11: PostgreSQL vs SQLite](2026-02-11-06-38-should-we-use-postgresql-or-sqlite-for-t.md) — SQLite chosen for simplicity

### Security  
*Links to security decisions*

### Strategy
*Links to strategic decisions*

## 🔍 Quick Search

When facing a new decision, check:
1. Have we decided something similar before?
2. What was the reasoning?
3. Did it work out?

## 📈 Patterns

*Emerging patterns from decisions:*

- **Simplicity wins for single-user systems** — When there's only one user, operational simplicity (SQLite) beats feature richness (PostgreSQL)
