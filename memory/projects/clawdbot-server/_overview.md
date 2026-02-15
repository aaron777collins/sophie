# Clawdbot Server Project Overview

[2026-02-15 16:45 EST] **Started by:** p10-9-role-assignment sub-agent

## Project Context
- **Repository:** ~/clawd/apps/web (Next.js application)
- **Type:** Discord-style server with Matrix backend
- **Current Name:** @haos/web (appears to be the main server application)

## Architecture
- **Frontend:** Next.js with React, TypeScript
- **UI Components:** Custom component library in components/ui/
- **Settings System:** Organized by tabs with individual setting components
- **Type System:** Comprehensive types in lib/types/server.ts
- **State Management:** React hooks and state

## Role Management System (Current)
- **Individual Role Editing:** ✅ Comprehensive interface (roles-settings.tsx)
- **Permission System:** ✅ Bitwise permission flags (bigint)
- **Role Categories:** ✅ General, membership, text, voice, advanced permissions
- **Role Display:** ✅ Color, hoist, mentionable settings

## Member Management System (Complete)
- **Individual Management:** ✅ Available via member management interface
- **Bulk Operations:** ✅ Complete (p10-9-role-assignment task)
- **Role Assignment:** ✅ Individual + bulk role assignment available
- **Audit Trail:** ✅ Role-specific audit trail implemented with undo capability

## Current Status (2026-02-15)
- **Phase 10 (Server Features):** In progress
- **Role System:** Complete (individual management)
- **Channel Permissions:** p10-7-channel-permissions (in progress by another agent)
- **Bulk Role Assignment:** p10-9-role-assignment (this task) - ✅ COMPLETE

## Key Files Structure
```
apps/web/
├── components/
│   ├── settings/
│   │   ├── roles-settings.tsx (complete)
│   │   ├── moderation-settings.tsx 
│   │   ├── audit-log-settings.tsx (has MEMBER_ROLE_UPDATE)
│   │   └── member-management.tsx ✅ (COMPLETE)
│   ├── modals/
│   │   ├── bulk-role-assignment-modal.tsx ✅ (NEW)
│   │   └── permission-preview-modal.tsx ✅ (NEW)
│   └── ui/ (component library)
├── lib/types/server.ts (extended with bulk role types ✅)
└── app/ (Next.js routing)
```

## Success Metrics
- [x] Bulk role assignment interface ✅
- [x] Multi-select users for role changes ✅  
- [x] Role assignment audit trail ✅
- [x] Permission preview before applying changes ✅
- [x] Undo/rollback recent role changes ✅
- [ ] Build passes: `pnpm build` must exit 0 ❌ (blocked by existing media utility issues)

## Next Agent Notes
The codebase is well-structured with a solid foundation. The role system is mature, and audit logging infrastructure exists. Focus on building the bulk management interface as an extension to the existing settings system.