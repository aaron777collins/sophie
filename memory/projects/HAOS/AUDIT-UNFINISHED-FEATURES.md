# HAOS v2 Unfinished Features Audit
Date: 2025-02-16

## Summary
- **85+ items need completion** (TODOs, stubs, incomplete features)
- **47 files contain TODOs** in production code (excluding node_modules)
- **3 components are complete stubs** (dm-list, dm-chat-header, use-spaces)
- **1 major feature unimplemented** (Server Discovery modal)
- **Build passes** ✅ (TypeScript compiles, Next.js builds successfully)

---

## Critical (Blocking Production)

### 1. Direct Messages Completely Stubbed
- **Files:** 
  - `components/navigation/dm-list.tsx` - Shows "Feature in development"
  - `components/chat/dm-chat-header.tsx` - Shows "Feature in development"
- **Impact:** Users cannot see or use DM features
- **Status:** Entire DM functionality is placeholder

### 2. Server Discovery Modal Missing
- **Files:**
  - `hooks/use-modal-store.ts:29` - Defines "serverDiscovery" modal type
  - `components/navigation/navigation-action.tsx:16` - onClick triggers it
  - `components/providers/modal-provider.tsx` - **NOT INCLUDED**
- **Impact:** "Explore Servers" button opens nothing
- **Status:** Modal referenced but never created

### 3. Two-Factor Authentication Not Implemented
- **File:** `components/settings/two-factor-form.tsx`
- **Current:** Shows "Not configured" and "Two-factor authentication setup coming soon."
- **Impact:** Security feature completely missing

### 4. Spaces/Channels Hook is Stub
- **File:** `hooks/use-spaces.ts`
- **Current:** Returns empty array `spaces: []` always
- **TODO:** "Restore full implementation from hooks-needing-migration/use-spaces.ts"
- **Impact:** Space navigation broken, mentions broken

---

## High Priority (Core Features)

### 5. Channel Permissions - Users Not Loaded
- **File:** `src/components/server/channel-permissions.tsx:80`
- **TODO:** "Load actual users from the room/server"
- **Current:** Uses hardcoded placeholder data

### 6. Space/Channel Mentions Not Working
- **File:** `hooks/use-mentions.ts:234,253`
- **TODO:** "Implement space functionality when useSpace hook is available"
- **Impact:** #channel mentions return empty results

### 7. Role Management Incomplete
- **Files:** `app/(main)/(routes)/servers/[serverId]/settings/roles/roles-page-client.tsx`
- **Issues:**
  - Line 53: `console.log("Edit role:", role)` - TODO: Implement role editing
  - Line 65: `// TODO: Implement role deletion via Matrix API`
  - Line 85: `// TODO: Implement role reordering`
- **Impact:** Roles can be created but not edited, deleted, or reordered

### 8. Recovery Key Notification Missing
- **File:** `hooks/use-cross-signing-bootstrap.ts:270`
- **TODO:** "Show notification to user about saving recovery key"
- **Impact:** Users may not know to save their recovery key

### 9. Timed Bans Not Implemented
- **File:** `lib/matrix/moderation.ts:222`
- **TODO:** "Handle timed bans if duration is specified"
- **Impact:** Temporary bans not functional

### 10. Device Verification/Blocking Incomplete
- **File:** `components/settings/device-manager.tsx`
- **Issues:**
  - Line 513: `// TODO: Implement device verification dialog`
  - Line 519: `// TODO: Implement device blocking`
  - Line 632: `// TODO: Implement revoke all other sessions`

### 11. Bulk Moderation Not Implemented
- **File:** `app/(main)/(routes)/servers/[serverId]/settings/members/members-settings-client.tsx:773-774`
- **Issues:**
  - `onBulkKick={() => {/* TODO: Implement bulk kick */}}`
  - `onBulkBan={() => {/* TODO: Implement bulk ban */}}`

---

## Medium Priority (Important but not blocking)

### 12. Email Notification Service Not Integrated
- **File:** `lib/jobs/handlers/email.ts`
- **TODOs:**
  - Line 48: "Integrate with actual email service (SendGrid, AWS SES, etc.)"
  - Line 130: "Get user email and preferences"
  - Line 141: Uses placeholder `user-${userId}@example.com`

### 13. File Processing Handlers Stubbed
- **File:** `lib/jobs/handlers/file-processing.ts`
- **TODOs:**
  - Line 214: "Integrate with actual antivirus scanner (ClamAV, VirusTotal API, etc.)"
  - Line 259: "Use file-type library to detect actual file type"
  - Line 338: "Use sharp or exifr library to extract image metadata"
  - Line 349: "Use ffprobe to extract video metadata"
  - Line 360: "Use music-metadata library"
  - Line 383: "Use sharp library for actual image processing"
  - Line 394: "Use ffmpeg to extract video thumbnail"
  - Line 402: "Use sharp for image compression"
  - Line 410: "Use ffmpeg for video compression"

### 14. Push Notification Handler Stubbed
- **File:** `lib/jobs/handlers/notification.ts:51`
- **TODO:** "Integrate with actual push service (Web Push API, FCM, etc.)"

### 15. Matrix Room Cleanup Jobs Stubbed
- **File:** `lib/jobs/handlers/matrix.ts`
- **TODOs:**
  - Line 48: "Integrate with Matrix client to perform actual cleanup"
  - Line 53: "Archive room in Matrix"
  - Line 59: "Clean up old messages and media"
  - Line 71: "Check if room is empty and delete if configured"
  - Line 108: "Use the existing data export service"
  - Line 160: "Get profile data from Matrix"

### 16. Message Reporting Not Functional
- **File:** `components/modals/report-message-modal.tsx:50`
- **TODO:** "Implement actual reporting via Matrix API"
- **Current:** Just console.logs the report

### 17. Avatar URL Extraction Incomplete (Multiple Files)
- `components/pinned-messages.tsx:108`
- `components/chat/chat-item.tsx:115,366`
- `components/voice/voice-member-list.tsx:92`
- `components/video-call/participant-list.tsx:240`
- **TODO:** "Implement proper avatar URL extraction from Matrix user profile"

### 18. Help Contact Form Not Functional
- **File:** `components/help/contact-form.tsx:40`
- **TODO:** "Implement actual support ticket submission"

### 19. Privacy Friend Checking Not Implemented
- **File:** `lib/matrix/privacy.ts:264`
- **TODO:** "Implement friend checking logic"

### 20. Invite System Page Incomplete
- **File:** `app/(invite)/(routes)/invite/[inviteCode]/page.tsx:12`
- **TODO:** "Implement Matrix-based invite system"

### 21. DM Conversation Page Incomplete
- **File:** `app/(main)/(routes)/servers/[serverId]/conversations/[memberId]/page.tsx:13`
- **TODO:** "Implement Matrix DM support"

---

## Low Priority (Polish/Enhancement)

### 22. Server Settings - Stats Not Real
- **File:** `app/(main)/(routes)/servers/[serverId]/settings/page.tsx:29`
- **TODO:** "Get actual server stats from Matrix"

### 23. Power Level Checks Incomplete
- **Files:**
  - `app/(main)/(routes)/servers/[serverId]/settings/roles/page.tsx:47`
  - `app/(main)/(routes)/servers/[serverId]/settings/layout.tsx:32`
  - `app/(main)/(routes)/servers/[serverId]/settings/audit-log/page.tsx:32`
  - `app/(main)/(routes)/servers/[serverId]/settings/bans/page.tsx:32`
- **TODO:** "Get user's actual power level in this space from Matrix"

### 24. Appearance Settings Not Synced to Matrix
- **File:** `components/settings/appearance-form.tsx:111,143`
- **TODO:** "Save to Matrix account data"

### 25. User Panel Audio Integration
- **File:** `components/navigation/user-panel.tsx:29,46,51`
- **TODO:** "Integrate with actual voice/audio system"

### 26. Server Channel Unread Detection
- **File:** `components/server/server-channel.tsx:83-84`
- **TODOs:**
  - "Implement unread detection from room data"
  - "Implement mention count from room data"

### 27. Pinned Messages Navigation
- **File:** `components/pinned-messages.tsx:84`
- **TODO:** "Implement message navigation"

### 28. Thread Routing Not Implemented
- **File:** `components/chat/message-actions.tsx:134`
- **TODO:** "Implement thread routing"

### 29. Video Controls Audio Device Selection
- **File:** `components/video-call/video-controls.tsx:110`
- **TODO:** "Integrate with audio output device selection"

### 30. Audit Log Permission Check
- **File:** `app/api/servers/[serverId]/audit-log/route.ts:42`
- **TODO:** "Check if user has moderator+ permissions for this server"

### 31. Permission Display Names
- **File:** `lib/matrix/permissions.ts:1056,1064`
- **TODOs:**
  - "Get actual role name"
  - "Get actual user display name"

### 32. Cookie Encryption
- **File:** `lib/matrix/cookies.ts:11`
- **TODO:** "add encryption layer" to session data

### 33-47. User-Facing Error Toasts (15+ locations)
Multiple locations with `// TODO: Show user-friendly error toast`:
- `components/chat/chat-input.tsx:192`
- `components/chat/chat-item.tsx:651,695,710,738,744`
- `components/chat/dm-chat-input.tsx:129`
- `components/chat/mod-actions.tsx:213,227`
- `components/mobile/mobile-emoji-reactions.tsx:90`
- `components/modals/confirm-delete-modal.tsx:61,67`
- `app/(main)/.../roles-page-client.tsx:76,95`

---

## Debug Code Left In (Console Statements - 100+ instances)
Production code contains many `console.log`, `console.warn`, `console.error` statements.
Should be replaced with proper logging service or removed for production.

**Sample locations:**
- `app/api/auth/login/route.ts` - 7 console.log statements
- `app/api/messages/route.ts` - 3 console statements
- `components/modals/*.tsx` - Many console.log statements
- `app/(main)/(routes)/servers/[serverId]/settings/roles/roles-page-client.tsx` - 6 console.log statements

---

## Complete Feature List for Task Queue

1. ~~DMList component - restore full implementation~~
2. ~~DMChatHeader component - restore full implementation~~
3. ~~Server Discovery modal - create and implement~~
4. ~~Two-Factor Authentication - implement full flow~~
5. ~~use-spaces hook - restore full implementation~~
6. ~~Channel permissions - load actual users from room/server~~
7. ~~Mentions hook - implement space functionality~~
8. ~~Role editing - implement via Matrix API~~
9. ~~Role deletion - implement via Matrix API~~
10. ~~Role reordering - implement via Matrix API~~
11. ~~Recovery key notification - show to users~~
12. ~~Timed bans - implement duration-based bans~~
13. ~~Device verification dialog - implement~~
14. ~~Device blocking - implement~~
15. ~~Revoke all other sessions - implement~~
16. ~~Bulk kick - implement~~
17. ~~Bulk ban - implement~~
18. ~~Email service - integrate with SendGrid/AWS SES~~
19. ~~File antivirus scanning - integrate ClamAV/VirusTotal~~
20. ~~Image metadata extraction - use sharp/exifr~~
21. ~~Video metadata extraction - use ffprobe~~
22. ~~Audio metadata extraction - use music-metadata~~
23. ~~Image thumbnail generation - use sharp~~
24. ~~Video thumbnail generation - use ffmpeg~~
25. ~~Image compression - use sharp~~
26. ~~Video compression - use ffmpeg~~
27. ~~Push notification service - integrate Web Push/FCM~~
28. ~~Matrix room cleanup - implement actual cleanup~~
29. ~~Message reporting - implement Matrix API~~
30. ~~Avatar URL extraction - fix across all components~~
31. ~~Help contact form - implement ticket submission~~
32. ~~Privacy friend checking - implement logic~~
33. ~~Invite code page - implement Matrix invite system~~
34. ~~DM conversation page - implement Matrix DM support~~
35. ~~Server stats - get real stats from Matrix~~
36. ~~Power level checks - implement across settings pages~~
37. ~~Appearance settings - sync to Matrix account data~~
38. ~~User panel audio - integrate with voice system~~
39. ~~Channel unread detection - implement from room data~~
40. ~~Pinned message navigation - implement~~
41. ~~Thread routing - implement~~
42. ~~Video controls audio device selection - implement~~
43. ~~Audit log permission check - implement~~
44. ~~Permission display names - get actual names~~
45. ~~Cookie encryption - add encryption layer~~
46. ~~Error toast notifications - implement across all TODOs~~
47. ~~Remove/replace console statements - use proper logging~~

---

## TypeScript Test Files
Test files in `/tests/` directory have TypeScript errors due to missing test framework types.
This is expected and not blocking production build, but should be fixed for CI/CD:
- `tests/channel-mentions.test.tsx` - Missing @testing-library/react
- `tests/crypto.test.ts` - Missing @jest/globals
- `tests/notifications.test.ts` - Missing @jest/globals

---

## Audit Methodology
- Grep for TODO/FIXME/STUB/WIP/NOT IMPLEMENTED/PLACEHOLDER markers
- Grep for empty function bodies `() => {}`
- Search for console.log statements in production code
- Check small files (<500 bytes) for stubs
- Run TypeScript compiler for type errors
- Run Next.js build for compilation errors
- Manual inspection of critical feature paths

---

## Recommendation
The "56 tasks complete" claim appears optimistic. While the main app framework is in place and builds successfully, there are significant gaps in:
1. **Core Features:** DMs, Server Discovery completely missing
2. **Security:** 2FA not implemented
3. **Backend Integration:** Email, push notifications, file processing mostly stubbed
4. **Moderation:** Bulk actions, timed bans incomplete
5. **UX Polish:** Many error toasts, avatar URLs, etc. still TODO

**Estimated remaining work:** 2-4 sprints depending on team size and priorities.
