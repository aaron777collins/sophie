# Cognitive Framework Project

Operationalizing Sophie's thinking and learning systems: The Circle, The Counsel, and Self-Reflection.

## Status: Active 🟢

**Started:** 2026-02-11
**Source:** Counsel session evaluating the framework architecture

## Components

### The Circle
Multi-perspective thinking framework with weight-based scaling (Internal → Council).
- **Status:** ✅ Documented + skill file complete, needs CLI tooling
- **Docs:** `docs/THE-CIRCLE.md`
- **Skill:** `skills/circle/SKILL.md` (created 2026-02-11 07:15 EST)

### The Counsel
Maximum-weight Circle invocation (5-7 Opus counselors) for mission-critical decisions.
- **Status:** Documented, implemented, needs quorum rules + dissent protocol
- **Docs:** `docs/THE-COUNSEL.md`

### Self-Reflection
Daily learning loop: log → reflect → improve.
- **Status:** Documented, nightly cron set up, needs tooling for low-friction logging
- **Docs:** `docs/SELF-REFLECTION.md`

## Current Phase: Operationalization

The Counsel identified these gaps on 2026-02-11:
1. ~~No skill file for programmatic Circle invocation~~ ✅ DONE (cog-01)
2. Friction in daily logging (needs `reflect` CLI)
3. ~~Missing escalation triggers and quorum rules~~ ✅ Added to SKILL.md
4. No improvement validation tracking
5. No decision index for pattern recognition

## Task Queue

See `PROACTIVE-JOBS.md` → Cognitive Framework Tasks section (cog-01 through cog-09).

## Timeline

- [2026-02-11 01:30 EST] Counsel session initiated to evaluate framework
- [2026-02-11 01:42 EST] Perspectives received: Architect, Skeptic, Builder
- [2026-02-11 01:45 EST] 9 proactive tasks queued for implementation
- [2026-02-11] Aaron: "Fix it all, make it fully operational"
- [2026-02-11 07:15 EST] ✅ cog-01-circle-skill COMPLETE - Comprehensive SKILL.md created

## Key Insights from Counsel

**Architect:** Architecture is sound, needs operationalization — explicit escalation triggers, quorum rules, decision index.

**Skeptic:** Validation gaps — how do we know improvements worked? Human feedback should override self-assessment. Need regression detection.

**Builder:** "A system that's used imperfectly beats a perfect system too cumbersome to invoke." Needs `reflect` and `circle` CLIs to reduce friction.

## Files

```
docs/
├── THE-CIRCLE.md
├── THE-COUNSEL.md
└── SELF-REFLECTION.md

skills/
└── circle/SKILL.md ✅ (created 2026-02-11)

tools/
├── reflect/ (to be created)
└── circle/ (to be created)

memory/
├── counsel/INDEX.md (to be created)
└── reflections/
    ├── daily/
    ├── insights/index.json (to be created)
    └── validation/INDEX.md (to be created)
```
