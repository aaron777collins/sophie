# Melo V2 - Project Vision

**Last Updated:** 2026-02-22

---

## The Vision

> "We're trying to make a Matrix client that feels like Discord, a common platform."
> — Aaron Collins

### What is Melo?

Melo is a communication platform that combines:
- **Discord's UX** - Familiar, intuitive interface that users know and love
- **Matrix's Backend** - Decentralized, open protocol for messaging
- **Element's Privacy** - Self-hosted, end-to-end encrypted, privacy-focused

### Why Melo?

**Problem:** Discord is popular but centralized, proprietary, and has privacy concerns.

**Solution:** Melo gives users:
- The Discord experience they're used to
- Control over their data (self-hosted Matrix)
- True privacy with E2EE
- Federation with other Matrix servers
- No vendor lock-in

---

## Core Principles

### 1. Feel Like Discord
- Same mental model: Servers → Channels → Messages
- Familiar UI patterns: Sidebars, modals, themes
- Same workflows: Join server, send message, react, etc.

### 2. Powered by Matrix
- Uses Matrix protocol for all communication
- Spaces = Servers
- Rooms = Channels
- Matrix IDs = User accounts
- Federation supported

### 3. Privacy First
- E2EE by default for all rooms
- Self-hostable (no third-party dependency)
- Cross-signing for device verification
- Key backup for recovery

### 4. Fully Functional
- ALL Discord features must work:
  - Servers, channels, DMs
  - Voice and video calls
  - Reactions, threads, embeds
  - Moderation tools
  - Notifications
  - Mobile and desktop

---

## Target Users

### Regular Users
- Want familiar Discord-like experience
- Care about privacy
- May be technical enough to self-host, or join an existing server

### Server Admins
- Run their own Matrix homeserver
- Manage communities
- Need full control over their data

### Moderators
- Keep communities safe
- Handle reports and violations
- Need effective moderation tools

---

## Technical Foundation

### Frontend
- Next.js 14 (App Router)
- React 18
- TailwindCSS + ShadcnUI
- TypeScript

### Backend
- Matrix protocol (Synapse homeserver)
- LiveKit for voice/video
- Matrix SDK for client operations

### Key Integrations
- Matrix JS SDK for protocol operations
- LiveKit for WebRTC voice/video
- UploadThing for file uploads
- PWA for mobile experience

---

## Success Metrics

1. **Feature Parity** - Can do everything Discord can do
2. **User Experience** - Feels as smooth as Discord
3. **Reliability** - Works consistently across devices
4. **Privacy** - E2EE enabled by default
5. **Self-Hostable** - Easy to deploy your own instance

---

## Current State (2026-02-22)

Based on audit:
- **Auth:** Working (sign-in, sign-up, 2FA)
- **Servers/Spaces:** Partially working
- **Channels/Rooms:** Partially working
- **Messaging:** Needs testing
- **Voice/Video:** LiveKit integrated, needs verification
- **Moderation:** Components exist, needs testing
- **Mobile:** PWA exists, needs testing

**Key Issue:** Build corruption causing clientModules errors. Features exist but can't be properly tested until build is stable.

---

## Next Steps

1. Comprehensive feature audit
2. Create epics and user stories for ALL features
3. Break into bite-sized tasks
4. Implement and validate with Playwright screenshots
5. Test on all device sizes

---

*This document defines the north star for Melo V2 development.*
