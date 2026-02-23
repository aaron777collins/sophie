# Epic: [MELO-E002] Servers (Matrix Spaces)

**Project:** Melo V2
**Status:** needs-audit
**Priority:** P0 (Critical)
**Created:** 2026-02-22
**Test Server:** https://dev2.aaroncollins.info

---

## Description

Server management (implemented as Matrix Spaces) - the container for communities. Users can create, join, configure, and leave servers. Admins can manage all server settings.

---

## Business Value

- **Core Experience:** Servers are the primary organizational unit (like Discord)
- **Community Building:** Enables users to create and manage communities
- **Monetization:** Premium server features possible in future

---

## User Stories

| Story ID | Title | Perspective | Priority | Status |
|----------|-------|-------------|----------|--------|
| MELO-US-0201 | User can see server list | User | P0 | ⏳ |
| MELO-US-0202 | User can create server | User | P0 | ⏳ |
| MELO-US-0203 | User can join server via invite | User | P0 | ⏳ |
| MELO-US-0204 | User can leave server | User | P0 | ⏳ |
| MELO-US-0205 | User can view server info | User | P1 | ⏳ |
| MELO-US-0206 | Admin can edit server settings | Admin | P0 | ⏳ |
| MELO-US-0207 | Admin can delete server | Admin | P1 | ⏳ |
| MELO-US-0208 | Admin can create invite links | Admin | P0 | ⏳ |
| MELO-US-0209 | Admin can manage invite settings | Admin | P1 | ⏳ |
| MELO-US-0210 | Admin can use server templates | Admin | P2 | ⏳ |
| MELO-US-0211 | Admin can transfer ownership | Admin | P2 | ⏳ |
| MELO-US-0212 | Server has custom icon | Admin | P1 | ⏳ |
| MELO-US-0213 | Server discovery (public) | User | P2 | ⏳ |
| MELO-US-0214 | Server reordering in sidebar | User | P2 | ⏳ |

---

## Acceptance Criteria (Epic-Level)

1. **View:** Users see their servers in sidebar, can navigate between them
2. **Create:** Users can create new servers with name, icon, and template
3. **Join:** Users can join servers via invite link
4. **Leave:** Users can leave servers they no longer want
5. **Edit:** Admins can change server name, icon, description, settings
6. **Delete:** Admins can delete servers (with confirmation)
7. **Invites:** Admins can create/revoke invite links with expiry

---

## Dependencies

### Upstream
- MELO-E001 (Authentication) - Required for all server operations

### Downstream
- MELO-E003 (Channels) - Channels exist within servers
- MELO-E004 (Messaging) - Messages exist within channels
- MELO-E007 (Moderation) - Moderation applies to servers

---

## Technical Notes

- Servers = Matrix Spaces (m.space room type)
- Server creation creates Matrix Space with initial state events
- Invites use Matrix invite token system
- Server icon stored as m.room.avatar
- Server settings stored in room state events

---

## Contingencies

| Scenario | Expected Behavior |
|----------|-------------------|
| Server creation fails | Show error, allow retry, don't leave partial state |
| Invite link expired | Clear message, option to request new invite |
| Last admin leaves | Prevent leave, require ownership transfer |
| Server at capacity | Clear message about limits |
| Matrix space sync delay | Show loading indicator, eventual consistency |

---

## Test Requirements

### Device Sizes
- Desktop (1920x1080)
- Tablet (768x1024)
- Mobile (375x667)

### Screenshot Evidence Required For
- Server list in sidebar (with servers)
- Server list empty state
- Create server modal
- Create server success
- Server settings page
- Invite creation modal
- Join via invite flow
- Leave server confirmation
- Server with custom icon

---

## Progress Tracking

| Date | Update |
|------|--------|
| 2026-02-22 | Epic created |
