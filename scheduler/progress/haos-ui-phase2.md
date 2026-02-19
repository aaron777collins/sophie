# HAOS UI Phase 2: Navigation Sidebar Component

**Created:** 2026-02-18 19:15 EST
**Status:** In Progress
**Task:** Replace navigation-sidebar component with exact discord-clone styling

## Task Overview
Replace the navigation-sidebar component in HAOS to exactly match the discord-clone reference implementation. This is the first component in the HAOS UI Phase 2 work.

## Progress Log

### [2026-02-18 19:15 EST] Task Started - Investigation Phase
- ✅ Read component mapping reference: `~/repos/melo/docs/ui-redesign/component-mapping.md`
- ✅ Read design tokens reference: `~/repos/melo/docs/ui-redesign/design-tokens.md`
- ✅ Examined discord-clone reference implementation: `~/repos/discord-clone-reference/`
- ✅ Analyzed navigation-sidebar.tsx, navigation-action.tsx, navigation-item.tsx
- ✅ Reviewed globals.css with CSS variables and Discord-specific colors

### Key Findings from Investigation
1. **Discord-clone reference structure:**
   - `components/navigation/navigation-sidebar.tsx` - Main sidebar container
   - Uses specific colors: `dark:bg-[#1e1f22] bg-[#e3e5e8]` 
   - Contains: NavigationAction (+ button), server list, ModeToggle, UserButton
   - Server icons in ScrollArea with NavigationItem components

2. **CSS Variables needed:**
   - Light/dark mode variables defined in globals.css
   - Discord-specific hardcoded colors for signature look

### [2026-02-18 19:15 EST] Problem Identified - Missing HAOS Frontend
**Issue:** Cannot locate active HAOS frontend at expected path `~/repos/haos/frontend/`

**Available HAOS directories:**
- `~/repos/archived-haos-DO-NOT-USE/` - Archived
- `~/repos/haos-v2-components-needing-migration/` - Migration components
- `~/repos/haos-v2-enhanced-components-for-migration/` - Enhanced components  
- `~/repos/haos-v2-enhanced-web-components-for-migration/` - Web components

**Investigation Results:**
- None of these contain a complete navigation-sidebar component
- Structure is fragmented across migration directories
- No active HAOS frontend project found at specified location

### Next Steps
Need to determine:
1. Which is the correct active HAOS frontend repository?
2. Should I create the navigation-sidebar in one of the v2 directories?
3. Is there a separate HAOS repo that needs to be checked out?

## Reference Implementation Details

### Discord-Clone Navigation-Sidebar Structure
```jsx
<div className="space-y-4 flex flex-col h-full items-center text-primary w-full dark:bg-[#1e1f22] bg-[#e3e5e8] py-3">
  <NavigationAction />
  <Separator className="h-[2px] bg-zinc-300 dark:bg-zinc-700 rounded-md w-10 mx-auto" />
  <ScrollArea className="flex-1 w-full">
    {servers.map((server) => (
      <div key={server.id} className="mb-4">
        <NavigationItem id={server.id} imageUrl={server.imageUrl} name={server.name} />
      </div>
    ))}
  </ScrollArea>
  <div className="pb-3 mt-auto flex items-center flex-col gap-y-4">
    <ModeToggle />
    <UserButton />
  </div>
</div>
```

### Key Components to Adapt for Matrix/HAOS:
- Replace Clerk UserButton with Matrix user component
- Replace server database queries with Matrix room/space queries  
- Keep exact styling and structure
- Use same CSS variables and Discord colors

## Files to Create/Replace
- `components/navigation/navigation-sidebar.tsx`
- `components/navigation/navigation-action.tsx` 
- `components/navigation/navigation-item.tsx`
- Update `app/globals.css` with CSS variables

## Status
**BLOCKED:** Need clarification on correct HAOS frontend location before proceeding with implementation.