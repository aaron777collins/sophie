# UI Design Lessons (CRITICAL)

> ⚠️ **READ THIS BEFORE ANY UI WORK** ⚠️

## [2026-02-18 17:24 EST] The Melo Disaster - NEVER FORGET

**What happened:** Aaron wanted a Discord clone UI. We were supposed to use nayak-nirmalya/discord-clone as the reference. Instead, we built custom UI components from scratch that look terrible. Hours wasted.

**Root causes:**
1. Delegated UI design work to Haiku - it cannot do UI design
2. Did not visually verify the output with Playwright/screenshots
3. Drifted from the reference implementation instead of preserving its styling
4. Built components "inspired by" instead of "adapted from" the reference

**Aaron's exact words:** "I wanted you to use the discord clone ui because right now for some reason your ui design skills suck. You're supposed to be using playwright, looking at images.. smh I'm upset."

---

## NON-NEGOTIABLE RULES FOR UI WORK

### 1. NEVER let Haiku do UI design
- Haiku is for execution of clear, non-visual tasks
- UI work requires Sonnet minimum, preferably Opus
- Visual judgment is a higher-order skill

### 2. ALWAYS use a reference implementation
- When cloning/adapting a UI, use the ACTUAL code from the reference
- Copy the exact color schemes, spacing, layouts
- Adapt the data layer, NOT the visual layer

### 3. ALWAYS verify visually with Playwright
- Take screenshots after every significant UI change
- Compare against reference screenshots
- If it doesn't look right, it ISN'T right

### 4. When adapting a reference:
```
✅ DO: Copy the exact JSX structure, classNames, colors
✅ DO: Keep the same component hierarchy
✅ DO: Preserve the styling wholesale
✅ DO: Only change the data fetching/state management

❌ DON'T: "Rewrite" components from scratch
❌ DON'T: "Simplify" or "improve" the UI
❌ DON'T: Trust that code "should" look right without seeing it
❌ DON'T: Delegate visual work to smaller models
```

### 5. Visual verification workflow
1. Run the app
2. Take Playwright screenshots
3. Look at what you made
4. Compare to reference
5. Iterate until pixel-perfect (or close)

---

## The Lesson

**"Look at what you make. Become perfect at this."** — Aaron, 2026-02-18

UI work is not about code. It's about what the user SEES. If you can't see it, you can't judge it. Always verify visually.

---

*This file exists because we failed. Read it before every UI task. Never repeat this mistake.*
