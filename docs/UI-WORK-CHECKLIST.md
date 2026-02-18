# UI Work Checklist

> **READ THIS BEFORE ANY UI WORK**
> 
> This checklist exists because we wasted hours building garbage UI. 
> Created: 2026-02-18 after the Melo UI disaster.

---

## Pre-Work Checklist

Before starting ANY UI task, verify:

- [ ] **Task type is marked as UI**
- [ ] **Model assigned is Sonnet or Opus** (NEVER Haiku)
- [ ] **Visual reference exists** (screenshot, design, or existing code)
- [ ] **Reference is accessible** (cloned locally if adapting code)

If any of these are missing, **DO NOT START**. Fix the task definition first.

---

## Reference Copying Protocol

When adapting existing code (like discord-clone → melo):

### Step 1: Clone Reference
```bash
git clone <reference-repo> /tmp/<reference-name>
cd /tmp/<reference-name>
npm install  # Get it running if possible
```

### Step 2: For Each Component

1. **Open reference component file**
   ```
   /tmp/discord-clone/components/navigation/navigation-sidebar.tsx
   ```

2. **Copy EXACTLY:**
   - JSX structure
   - Tailwind/CSS classes
   - Color values (#1e1f22, #e3e5e8, etc.)
   - Spacing (py-3, gap-y-4, etc.)
   - Layout (flex, grid, positioning)

3. **Change ONLY:**
   - Data fetching (Prisma → Matrix)
   - State management
   - API calls
   - Type definitions for new data layer

4. **DO NOT:**
   - "Improve" the design
   - "Simplify" the structure
   - "Write similar code"
   - Use different colors/spacing

---

## Visual Verification Protocol

After EVERY significant change:

### Step 1: Take Screenshot
```typescript
// Using Playwright
const screenshot = await page.screenshot({ path: 'current-state.png' });
```

Or use browser automation:
```bash
# Take screenshot of current state
browser action=screenshot profile=chrome
```

### Step 2: Compare to Reference
- Open reference screenshot
- Open current screenshot
- Compare side-by-side

### Step 3: Document
In your progress file:
```markdown
### Visual Verification [HH:MM]
- Reference: /path/to/reference-screenshot.png
- Current: /path/to/current-screenshot.png
- Match: YES/NO
- Differences: {list any differences}
- Action: {what you're fixing}
```

### Step 4: Iterate
If not matching:
1. Identify specific difference
2. Find corresponding code in reference
3. Copy that code exactly
4. Take new screenshot
5. Compare again
6. Repeat until matching

---

## Completion Checklist

Before marking a UI task complete:

- [ ] **Screenshot of reference exists**
- [ ] **Screenshot of implementation exists**
- [ ] **Visual comparison documented**
- [ ] **Colors match exactly**
- [ ] **Layout matches exactly**
- [ ] **Spacing matches exactly**
- [ ] **Responsive behavior verified**
- [ ] **Dark/light mode verified** (if applicable)
- [ ] **Build passes**

**⚠️ "Build passes" alone is NOT sufficient for UI tasks.**

---

## Quick Reference: Discord Clone Colors

From nayak-nirmalya/discord-clone:

| Element | Dark Mode | Light Mode |
|---------|-----------|------------|
| Main sidebar background | `#1e1f22` | `#e3e5e8` |
| Channel sidebar | `#2b2d31` | `#f2f3f5` |
| Main content | `#313338` | `#ffffff` |
| Text primary | `#dbdee1` | `#060607` |
| Text muted | `#949ba4` | `#5c5e66` |
| Interactive hover | `#35373c` | `#e0e1e5` |
| Brand/accent | `#5865f2` | `#5865f2` |

---

## Common Mistakes to Avoid

❌ **"I'll style it differently but similar"**
→ No. Copy exactly.

❌ **"This color is close enough"**
→ No. Use the exact hex code.

❌ **"The structure is similar"**
→ No. Copy the exact JSX hierarchy.

❌ **"Build passes so it's done"**
→ No. Screenshot must match reference.

❌ **"Haiku can handle this UI task"**
→ No. Haiku cannot judge visual output.

---

## Related Documentation

- **Why this exists:** `memory/topics/ui-design-lessons.md`
- **Systemic analysis:** `memory/topics/systemic-failure-analysis-2026-02-18.md`
- **Project context:** `memory/projects/melo.md`
- **Protocol in AGENTS.md:** Search "UI Work Protocol"

---

*This checklist is mandatory for all UI work. No exceptions.*
