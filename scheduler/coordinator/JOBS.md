# Coordinator Jobs

**Updated:** 2026-02-18 17:30 EST  
**Priority:** 🔴 CRITICAL — ALL PREVIOUS WORK HALTED

---

## 🚨 EMERGENCY DIRECTIVE FROM AARON

**All ongoing melo work is CANCELLED.** The UI was built wrong from the start.

> "I wanted you to use the discord clone ui because right now for some reason your ui design skills suck. You're supposed to be using playwright, looking at images.. smh I'm upset. Redeem yourself. look at what you make. Become perfect at this."
> — Aaron, 2026-02-18 17:24 EST

---

## The Problem

We were supposed to use nayak-nirmalya/discord-clone as a UI reference. Instead, we built custom components from scratch that look terrible. The styling, colors, layout — all wrong.

**Root causes:**
1. Delegated UI work to Haiku (cannot do visual design)
2. Never visually verified output with Playwright/screenshots
3. "Inspired by" instead of "copied from" the reference
4. Built components from scratch instead of adapting existing ones

---

## 🔴 MELO UI FIX — COMPREHENSIVE PLAN

### Phase 1: Reference Setup (Day 1)
**Model:** Opus (planning requires visual judgment)
**Status:** pending

1. Clone discord-clone repo: `git clone https://github.com/nayak-nirmalya/discord-clone.git /tmp/discord-clone-ref`
2. Map components between repos:
   - Discord clone: `components/navigation/`, `components/chat/`, `components/server/`, `components/modals/`, `components/ui/`
   - Melo: `components/navigation/`, `components/chat/`, `components/server/`, `src/components/`
3. Document exact color scheme, typography, spacing from discord-clone
4. Take reference screenshots of discord-clone running (need npm install, env setup)

**Acceptance Criteria:**
- [ ] Discord clone repo cloned locally
- [ ] Component mapping document created
- [ ] Color/typography reference extracted
- [ ] Reference screenshots captured

---

### Phase 2: UI Component Replacement (Days 2-3)
**Model:** Sonnet/Opus ONLY (no Haiku for UI)
**Status:** pending

For EACH component, follow this workflow:
1. Read the discord-clone component source
2. Copy the EXACT JSX structure and Tailwind classes
3. Replace only the data layer (Prisma → Matrix hooks)
4. Keep the EXACT same visual styling
5. Take Playwright screenshot after implementing
6. Compare to reference screenshot
7. Iterate until visually matching

**Components to replace (priority order):**

| Discord Clone Component | Melo Equivalent | Priority |
|-------------------------|-----------------|----------|
| `navigation/navigation-sidebar.tsx` | `components/navigation/navigation-sidebar.tsx` | P0 |
| `navigation/navigation-item.tsx` | `components/navigation/navigation-item.tsx` | P0 |
| `navigation/navigation-action.tsx` | `components/navigation/navigation-action.tsx` | P0 |
| `server/server-sidebar.tsx` | `components/navigation/spaces-navigation.tsx` | P0 |
| `server/server-header.tsx` | TBD | P1 |
| `server/server-channel.tsx` | TBD | P1 |
| `chat/chat-header.tsx` | TBD | P1 |
| `chat/chat-input.tsx` | `components/chat/chat-input.tsx` | P1 |
| `chat/chat-messages.tsx` | TBD | P1 |
| `chat/chat-item.tsx` | TBD | P1 |
| All modal components | `components/modals/*` | P2 |

**Visual Verification Process (MANDATORY):**
```bash
# After each component change:
# 1. Run the app
pnpm dev

# 2. Take screenshot with Playwright
# (Use browser automation to capture)

# 3. Compare to reference
# 4. Fix any visual differences
# 5. ONLY mark done when visually verified
```

**Acceptance Criteria:**
- [ ] Each component visually matches discord-clone reference
- [ ] Screenshots taken and compared for each component
- [ ] All colors match exactly: dark:bg-[#1e1f22], bg-[#e3e5e8], etc.
- [ ] Layout structure identical to reference

---

### Phase 3: Integration & Polish (Day 4)
**Model:** Sonnet/Opus
**Status:** pending

1. Verify full application flow looks like Discord
2. Check responsive behavior matches
3. Verify dark/light mode toggle works
4. Final screenshot comparison of full application
5. Fix any remaining visual discrepancies

**Acceptance Criteria:**
- [ ] Full app screenshot matches discord-clone
- [ ] All pages/routes visually verified
- [ ] Responsive design verified (mobile, tablet, desktop)
- [ ] Dark/light mode both verified

---

## 📋 Work Rules (NON-NEGOTIABLE)

### 1. NO HAIKU FOR UI WORK
Haiku cannot judge visual design. All UI work must use:
- **Sonnet** — for implementation
- **Opus** — for planning and complex decisions

### 2. ALWAYS VISUALLY VERIFY
Every UI change must be verified with Playwright screenshots:
```
Change code → Run app → Screenshot → Compare to reference → Fix → Repeat
```

### 3. COPY, DON'T CREATE
When adapting the discord-clone:
- ✅ Copy exact JSX structure
- ✅ Copy exact Tailwind classes
- ✅ Copy exact color values
- ✅ Only change data fetching (Prisma → Matrix)
- ❌ Don't "improve" the UI
- ❌ Don't "simplify" components
- ❌ Don't invent new styling

### 4. REFERENCE DOCUMENT
See: `memory/topics/ui-design-lessons.md` — READ BEFORE ANY UI WORK

---

## Completed Phases (Reference — ARCHIVED)

> ⚠️ Previous work is archived. UI must be redone correctly.

| Phase | Status | Notes |
|-------|--------|-------|
| Phase A-E (Tests) | ✅ Keep | Test infrastructure stays |
| P0-P3 (Features) | ⚠️ Redo UI | Features work, UI must be replaced |

---

## Notes

This is a course correction. The functionality exists but looks wrong.
The goal is to preserve Matrix integration while adopting Discord's visual design exactly.

**Report to:** Person Manager
**Escalate to:** Aaron if blocked
