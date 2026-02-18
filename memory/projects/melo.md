# Melo Project

**Location:** `/home/ubuntu/repos/melo`
**Type:** Discord-like chat application using Matrix
**Status:** 🔴 UI Rebuild Required (2026-02-18)

---

## Project Overview

Melo is a Discord clone built on Matrix instead of Prisma/traditional databases. The goal is to have Discord's UI/UX with Matrix's decentralized, encrypted messaging backend.

### Tech Stack
- **Frontend:** Next.js 13, React, Tailwind CSS, ShadcnUI
- **Backend:** Matrix (Element/Synapse)
- **Auth:** Custom Matrix-based (not Clerk)
- **Real-time:** Matrix sync, LiveKit for voice/video
- **Reference:** nayak-nirmalya/discord-clone (UI ONLY)

---

## ⚠️ CRITICAL LESSON: UI Disaster (2026-02-18)

### What Happened
Aaron wanted the Discord clone UI. We were supposed to use nayak-nirmalya/discord-clone as the visual reference. Instead, we built custom UI components from scratch that looked terrible.

**Hours wasted. Aaron upset. Trust damaged.**

### Root Causes
1. **Delegated UI to Haiku** — Haiku cannot do visual design
2. **Never visually verified** — No Playwright screenshots, no comparisons
3. **"Inspired by" instead of "copied from"** — Built new instead of adapting
4. **No reference comparison** — Didn't look at what we made vs what it should look like

### Aaron's Exact Words
> "I wanted you to use the discord clone ui because right now for some reason your ui design skills suck. You're supposed to be using playwright, looking at images.. smh I'm upset. Redeem yourself. look at what you make. Become perfect at this. I'm serious. Actually try."

### The Fix
Complete UI replacement using the proper workflow:
1. Clone discord-clone repo as reference
2. Copy EXACT JSX, Tailwind classes, colors
3. Only change data layer (Prisma → Matrix)
4. Visually verify every component with Playwright
5. Compare screenshots to reference
6. Iterate until pixel-perfect

### Permanent Rules for This Project

```
┌─────────────────────────────────────────────────────────────────────┐
│                    MELO UI RULES (NON-NEGOTIABLE)                   │
└─────────────────────────────────────────────────────────────────────┘

1. NO HAIKU FOR UI WORK
   Haiku executes explicit steps only. It cannot judge "looks good."

2. ALWAYS VISUALLY VERIFY
   Every UI change: screenshot → compare → fix → repeat

3. USE THE DISCORD CLONE EXACTLY
   - Copy their JSX structure
   - Copy their Tailwind classes
   - Copy their color values (#1e1f22, #e3e5e8, etc.)
   - Only change: data fetching, Matrix integration

4. LOOK AT WHAT YOU MAKE
   If you can't see it, you can't judge it. Always screenshot.

5. DON'T TRUST "DONE"
   Until visually verified against reference = not done.
```

---

## Architecture

### What We Keep
- Matrix integration (authentication, rooms, messages, E2EE)
- LiveKit voice/video infrastructure
- Test infrastructure (E2E, unit tests)
- API routes and data layer

### What We Replace
- ALL UI components (visual layer)
- Layout structure
- Styling and colors
- Component hierarchy

### Reference Mapping

| Discord Clone | Melo | Notes |
|---------------|------|-------|
| `components/navigation/` | `components/navigation/` | Server list, user panel |
| `components/server/` | Multiple locations | Channel list, member list |
| `components/chat/` | `components/chat/` | Messages, input |
| `components/modals/` | `components/modals/` | All dialogs |
| `components/ui/` | `components/ui/` | ShadcnUI base |

---

## Timeline

- [2026-02-18 17:24 EST] **UI DISASTER** — Aaron discovered UI was built wrong
- [2026-02-18 17:30 EST] All work halted, comprehensive fix plan created
- [Previous] Tests passing, features working, but UI is garbage

---

## Key Files

- **Fix Plan:** `scheduler/coordinator/JOBS.md`
- **UI Lessons:** `memory/topics/ui-design-lessons.md`
- **Task Queue:** `PROACTIVE-JOBS.md`
- **Discord Clone:** `nayak-nirmalya/discord-clone` (GitHub)

---

## Reminders

- **Before ANY melo UI work:** Read `memory/topics/ui-design-lessons.md`
- **Model for UI:** Sonnet or Opus only, NEVER Haiku
- **Verification:** Playwright screenshots, compare to reference
- **Goal:** Look like Discord, work like Matrix

---

*This project taught us a hard lesson about UI work. Never forget it.*
