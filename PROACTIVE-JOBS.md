# HAOS Proactive Jobs - Master Queue

> **Project:** HAOS (Discord UI + Matrix Backend)
> **Goal:** Production-ready, self-hostable, pixel-perfect Discord clone
> **Total Tasks:** ~575 (405 remaining features + 170 new infrastructure/testing)
> **Last Updated:** 2026-02-11 00:05 EST

---

## Rules

> 🔢 **MAX 2 DEV TASKS IN-PROGRESS** at any time
> 🚨 **FULL COMPLETION STANDARD** — no stubs, no placeholders, production-ready only
> 📝 **UPDATE DOCS** — check off items in HAOS-COMPREHENSIVE-TASKS.md after each task
> 🔀 **COMMIT & PUSH** — merge to main branch after each completed task
> 🚀 **DEPLOY TO DEV2** — after each feature task:
> ```bash
> cd /home/ubuntu/repos/haos/apps/web && yarn build
> rsync -avz --delete dist/ dev2:/home/ubuntu/haos/dist/
> ssh dev2 "docker restart haos-web 2>/dev/null || true"
> ```

---

## Currently Running

### haos-self-hosting-private-mode ⏳
- **Status:** in-progress
- **Agent:** Building HAOS and implementing private mode config

### haos-deploy-dev2 ⏳  
- **Status:** in-progress
- **Agent:** Setting up initial dev2 deployment

---

## ═══════════════════════════════════════════════════════════
## WAVE 0: CRITICAL INFRASTRUCTURE
## ═══════════════════════════════════════════════════════════

### haos-self-hosting-private-mode
- **Priority:** CRITICAL
- **Description:** Private deployment mode - HAOS's core value proposition
- **Status:** in-progress

### haos-self-hosting-setup-wizard
- **Priority:** CRITICAL
- **Description:** First-run setup wizard for self-hosted instances
- **Status:** pending

### haos-self-hosting-docker-stack
- **Priority:** CRITICAL
- **Description:** Complete Docker deployment stack (Synapse + HAOS + LiveKit)
- **Status:** pending

### haos-self-hosting-docs
- **Priority:** CRITICAL
- **Description:** Self-hosting documentation
- **Status:** pending

### haos-admin-dashboard
- **Priority:** high
- **Description:** Admin dashboard for instance management
- **Status:** pending

### haos-unit-testing
- **Priority:** CRITICAL
- **Description:** Unit tests for all HAOS modules
- **Status:** pending

### haos-mobile-testing
- **Priority:** high
- **Description:** Mobile responsiveness audit and fixes
- **Status:** pending

---

## ═══════════════════════════════════════════════════════════
## WAVE 1-5: FEATURE COMPLETION
## ═══════════════════════════════════════════════════════════

### haos-phase2-remaining
- **Priority:** high
- **Description:** Complete Phase 2 messaging features (52 remaining)
- **Status:** pending

### haos-phase3-server-settings
- **Priority:** high
- **Description:** Server Settings Modal (P3-019 to P3-050)
- **Status:** pending

### haos-phase4-voice-remaining
- **Priority:** high
- **Description:** Remaining voice features (P4-021, P4-091)
- **Status:** pending

### haos-phase4-stage-channels
- **Priority:** high
- **Description:** Stage Channel implementation (P4-096 to P4-105)
- **Status:** pending

### haos-phase5-user-settings
- **Priority:** high
- **Description:** User Settings (P5-028 to P5-055)
- **Status:** pending

### haos-phase5-status-system
- **Priority:** medium
- **Description:** Status System (P5-061 to P5-070)
- **Status:** pending

### haos-phase5-user-actions
- **Priority:** medium
- **Description:** User Actions (P5-119 to P5-138)
- **Status:** pending

### haos-phase6-reports-safety
- **Priority:** medium
- **Description:** Reports & Safety (P6-061 to P6-075)
- **Status:** pending

### haos-phase6-mod-tools
- **Priority:** medium
- **Description:** Moderation Tools (P6-076 to P6-085)
- **Status:** pending

### haos-phase7-user-discovery
- **Priority:** medium
- **Description:** User Discovery (P7-051 to P7-060)
- **Status:** pending

### haos-phase7-navigation
- **Priority:** medium
- **Description:** Navigation (P7-061 to P7-068)
- **Status:** pending

### haos-phase8-animations
- **Priority:** medium
- **Description:** Animations & Micro-interactions (P8-004 to P8-020)
- **Status:** pending

### haos-phase8-premium
- **Priority:** low
- **Description:** Premium Features UI (P8-051 to P8-070)
- **Status:** pending

### haos-phase8-final-polish
- **Priority:** medium
- **Description:** Final Polish (remaining items)
- **Status:** pending

---

## ═══════════════════════════════════════════════════════════
## WAVE 6: QUALITY ASSURANCE
## ═══════════════════════════════════════════════════════════

### haos-qa-visual-audit ✅ COMPLETE
- **Priority:** high
- **Description:** Pixel-perfect Discord comparison
- **Status:** complete
- **Result:** 85-90% pixel-perfect, minor fixes documented in docs/VISUAL-AUDIT.md

### haos-qa-matrix-integration
- **Priority:** high
- **Description:** Validate all features work with Matrix SDK
- **Status:** pending

### haos-qa-accessibility
- **Priority:** high
- **Description:** WCAG 2.1 AA accessibility audit
- **Status:** pending

### haos-qa-e2e-testing
- **Priority:** high
- **Description:** End-to-end test suite (Playwright)
- **Status:** pending

### haos-qa-security
- **Priority:** CRITICAL
- **Description:** Security audit and hardening
- **Status:** pending

---

## ═══════════════════════════════════════════════════════════
## WAVE 7-8: DOCUMENTATION & DEPLOYMENT
## ═══════════════════════════════════════════════════════════

### haos-documentation-user
- **Priority:** medium
- **Description:** User documentation
- **Status:** pending

### haos-documentation-developer
- **Priority:** medium
- **Description:** Developer documentation
- **Status:** pending

### haos-i18n
- **Priority:** medium
- **Description:** Internationalize HAOS strings
- **Status:** pending

### haos-deployment-production
- **Priority:** high
- **Description:** Production deployment preparation
- **Status:** pending

---

## Completed Tasks

### haos-phase6-moderation ✅
- **Completed:** 2026-02-10 22:15 EST
- **Result:** 60 moderation tasks, ~7470 lines of code

### haos-phase5-notifications ✅
- **Completed:** 2026-02-10
- **Result:** Desktop notifications, sounds, Inbox component

### haos-qa-visual-audit ✅
- **Completed:** 2026-02-11 00:02 EST
- **Result:** 85-90% pixel-perfect, audit in docs/VISUAL-AUDIT.md

---

## Summary

| Wave | Tasks | Status |
|------|-------|--------|
| Wave 0: Infrastructure | 7 | 1 running, 6 pending |
| Wave 1-5: Features | 14 | All pending |
| Wave 6: QA | 5 | 1 complete, 4 pending |
| Wave 7-8: Docs/Deploy | 4 | All pending |
| **Total** | **30** | 2 running, 1 complete |

**Next up after current tasks:** haos-self-hosting-setup-wizard
