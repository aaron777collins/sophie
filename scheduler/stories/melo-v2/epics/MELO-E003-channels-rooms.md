# Epic: [MELO-E003] Channels (Matrix Rooms)

**Project:** Melo V2
**Status:** needs-audit
**Priority:** P0 (Critical)
**Created:** 2026-02-22
**Test Server:** https://dev2.aaroncollins.info

---

## Description

Channel management (implemented as Matrix Rooms within Spaces). Channels are where conversations happen - text channels for messaging, voice channels for calls.

---

## Business Value

- **Core Experience:** Channels are where all communication happens
- **Organization:** Categories help organize large servers
- **Flexibility:** Different channel types for different needs

---

## User Stories

| Story ID | Title | Perspective | Priority | Status |
|----------|-------|-------------|----------|--------|
| MELO-US-0301 | User can see channel list | User | P0 | ⏳ |
| MELO-US-0302 | User can navigate to channel | User | P0 | ⏳ |
| MELO-US-0303 | User can see channel categories | User | P1 | ⏳ |
| MELO-US-0304 | Admin can create text channel | Admin | P0 | ⏳ |
| MELO-US-0305 | Admin can create voice channel | Admin | P0 | ⏳ |
| MELO-US-0306 | Admin can edit channel | Admin | P0 | ⏳ |
| MELO-US-0307 | Admin can delete channel | Admin | P1 | ⏳ |
| MELO-US-0308 | Admin can create category | Admin | P1 | ⏳ |
| MELO-US-0309 | Admin can reorder channels | Admin | P2 | ⏳ |
| MELO-US-0310 | Admin can set channel permissions | Admin | P1 | ⏳ |
| MELO-US-0311 | Channel shows unread indicator | User | P1 | ⏳ |
| MELO-US-0312 | Admin can set slowmode | Admin | P2 | ⏳ |
| MELO-US-0313 | Admin can archive channel | Admin | P2 | ⏳ |
| MELO-US-0314 | Channel has topic/description | Admin | P2 | ⏳ |

---

## Acceptance Criteria (Epic-Level)

1. **View:** Users see channels organized by category in server sidebar
2. **Navigate:** Clicking channel opens it for viewing/chatting
3. **Create:** Admins can create text and voice channels
4. **Edit:** Admins can change channel name, topic, permissions
5. **Delete:** Admins can delete channels (with confirmation)
6. **Categories:** Channels can be organized into collapsible categories
7. **Indicators:** Unread channels show visual indicator

---

## Dependencies

### Upstream
- MELO-E001 (Authentication) - Required for channel access
- MELO-E002 (Servers) - Channels exist within servers

### Downstream
- MELO-E004 (Messaging) - Messages are sent in channels
- MELO-E006 (Voice/Video) - Voice channels use LiveKit

---

## Technical Notes

- Channels = Matrix Rooms with m.space.child relationship to parent Space
- Voice channels flagged with custom state event or room type
- Categories = Nested Spaces or room state organization
- Permissions via Matrix power levels
- E2EE mandatory for all channels

---

## Contingencies

| Scenario | Expected Behavior |
|----------|-------------------|
| Channel creation fails | Show error, allow retry |
| User lacks permission | Grayed out channel, tooltip explaining |
| Category collapse state | Persist preference locally |
| Channel sync delay | Show loading, then update |
| Deleted channel in URL | Redirect to server default channel |

---

## Test Requirements

### Device Sizes
- Desktop (1920x1080)
- Tablet (768x1024)  
- Mobile (375x667)

### Screenshot Evidence Required For
- Channel list with categories
- Channel list collapsed category
- Create channel modal
- Edit channel modal
- Channel with unread indicator
- Voice channel (separate from text)
- Channel permissions settings
- Delete channel confirmation

---

## Progress Tracking

| Date | Update |
|------|--------|
| 2026-02-22 | Epic created |
