# MELO v2 Documentation

This folder contains audit and planning documents for MELO v2.

## Approach
- **Frontend:** Discord clone (Next.js 13 + shadcn/ui + Tailwind)
- **Backend:** Matrix protocol (Synapse + Matrix SDK)
- **Voice/Video:** LiveKit (already have it)
- **Auth:** Matrix login (replaces Clerk)

## Audit Documents
- FRONTEND-AUDIT.md - Component and route analysis
- BACKEND-MAPPING.md - Prisma → Matrix mapping
- AUTH-STRATEGY.md - Clerk → Matrix auth migration
- REALTIME-STRATEGY.md - Socket.io → Matrix sync
- MEDIA-STRATEGY.md - UploadThing → Matrix content API
- LIVEKIT-INTEGRATION.md - Voice/video plan
- FEATURE-GAPS.md - Missing features analysis
- SELF-HOSTING-PLAN.md - Docker + infrastructure
- MIGRATION-FROM-V1.md - Reusable code from old MELO
- IMPLEMENTATION-PLAN.md - Final comprehensive plan

