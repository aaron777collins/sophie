# Web Browser Reliability Project

**Status:** APPROVED, READY FOR IMPLEMENTATION  
**Started:** 2026-02-27

---

## Decision Summary

[2026-02-27 03:00 EST] After counsel deliberation with multiple Opus agents:
- **Chosen:** rebrowser-playwright standalone
- **Deferred:** Browserless.io, Camoufox, full tiered architecture
- **Rationale:** YAGNI, 80/20 rule, language fit (JS vs Python)

## Key Documents

- **Research:** `docs/WEB-BROWSING-RESEARCH.md` — comprehensive evaluation
- **Decision:** `docs/WEB-BROWSING-DECISION.md` — rationale and plan
- **Epic:** `scheduler/epics/web-browser-reliability.md` — implementation stories

## Implementation Plan

| Phase | Description | Duration |
|-------|-------------|----------|
| 1 | Health watchdog + session persistence | 1-2 days |
| 2 | rebrowser-playwright integration | 2-3 days |
| 3 | Detection logging and monitoring | 0.5 day |

## Counsel Perspectives

**Technical Architect:**
- Preferred tiered (rebrowser + Browserless)
- Key insight: avoid Python tools

**Cost/Business:**
- Preferred rebrowser alone
- Key insight: 9-15 days for tiered = premature optimization

**Final synthesis:** Start simple with rebrowser, add complexity only if needed.

## 30-Day Review Criteria

- If detection rate >30%, evaluate Browserless.io
- If specific sites consistently fail, consider Camoufox
- If crashes >1/day, revisit health check approach

---

## Log

- [2026-02-27 02:39 EST] Research completed by Opus sub-agent
- [2026-02-27 02:42 EST] Aaron requested robust decision with counsel
- [2026-02-27 03:00 EST] Decision finalized: rebrowser-playwright standalone
