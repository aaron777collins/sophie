# HAOS Phase 3: Role System Implementation

**Task ID:** haos-phase3-roles
**Started:** 2026-02-10 00:30 EST
**Agent:** Opus
**Status:** In Progress

## Task Description
Implement Discord-style role system with 50+ permissions, role hierarchy, and Matrix power level mapping (Tasks P3-060 to P3-104).

## Work Log

### [00:30 EST] Started - Context Gathered
- Read AGENTS.md for memory requirements
- Read PROACTIVE-JOBS.md for task details
- Read MASTER-TODO.md for specific tasks (P3-060 to P3-104)
- Found existing `io.haos.role_names` in MemberListViewModel.tsx
- Existing RolesRoomSettingsTab.tsx handles basic Matrix power levels
- Need to build complete Discord-style role system

### Architecture Design
Key components to implement:
1. **Types & Constants** (`src/haos/roles/types.ts`)
   - HaosRole interface with 50+ Discord-style permissions
   - Permission categories (General, Text, Voice, Stage, Events, Advanced)
   - HaosPermissionFlags bitmask for efficient storage

2. **State Events** (`io.haos.roles`, `io.haos.member_roles`)
   - Custom Matrix state events for role definitions
   - Member role assignments separate from power levels

3. **RoleStore** (`src/stores/HaosRoleStore.ts`)
   - Manage role state, hierarchy, and permissions
   - Bidirectional sync with Matrix power levels
   - Calculate effective permissions with hierarchy

4. **UI Components**
   - RoleListPanel - View/manage roles
   - RoleEditor - Edit role properties
   - PermissionEditor - Toggle 50+ permissions
   - RoleColorPicker - Role color selection
   - MemberRoleAssignment - Assign roles to members

5. **Permission Calculator**
   - Hierarchy enforcement (higher roles override)
   - Channel permission overrides
   - Administrator bypass

## Files to Create/Modify

### New Files
- [ ] `src/haos/roles/types.ts` - Role and permission types
- [ ] `src/haos/roles/constants.ts` - 50+ permission definitions
- [ ] `src/haos/roles/permissions.ts` - Permission calculator
- [ ] `src/stores/HaosRoleStore.ts` - Role state management
- [ ] `src/components/views/haos/roles/HaosRoleList.tsx` - Role list
- [ ] `src/components/views/haos/roles/HaosRoleEditor.tsx` - Role editor
- [ ] `src/components/views/haos/roles/HaosPermissionEditor.tsx` - Permission toggles
- [ ] `src/components/views/haos/roles/HaosRoleColorPicker.tsx` - Color picker
- [ ] `src/hooks/useRoles.ts` - Role hooks
- [ ] `src/res/css/haos/roles/*.pcss` - Role styling

### Modified Files
- [ ] `src/components/viewmodels/memberlist/MemberListViewModel.tsx` - Use role store
- [ ] `src/components/views/settings/tabs/room/RolesRoomSettingsTab.tsx` - Link to HAOS roles

## Dependencies
- matrix-js-sdk for state events
- Existing Element color picker components
- CSS design system variables

---
*Last updated: 2026-02-10 00:30 EST*
