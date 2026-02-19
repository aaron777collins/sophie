# Melo V2 Screenshot Audit Report
**Date:** 2026-02-19 11:40 EST
**Auditor:** Subagent (visual-audit-task)

## Executive Summary

The Melo V2 application is currently **NON-FUNCTIONAL** due to critical build system failures. Screenshots cannot be captured until the following issues are resolved.

## Critical Issues Identified

### 1. Route Conflicts ✅ RESOLVED
**Issue:** Duplicate route definitions causing build failures
- `app/(auth)/sign-in/` conflicting with `app/(auth)/(routes)/sign-in/[[...sign-in]]/`
- Same issue with `/sign-up`

**Resolution:** Removed duplicate routes from `app/(auth)/sign-in/` and `app/(auth)/sign-up/`

### 2. Duplicate API Route Files ✅ RESOLVED
**Issue:** Both `route.ts` and `route.tsx` existed in `app/api/channels/[channelId]/`

**Resolution:** Removed `route.tsx` (duplicate)

### 3. @OpenTelemetry/API Middleware Incompatibility ❌ BLOCKING
**Issue:** Next.js 14.2.35 has internal dependency on `@opentelemetry/api` for tracing. The Edge Runtime middleware doesn't support native Node.js modules, causing:
```
TypeError: Native module not found: @opentelemetry/api
```

**Impact:** Every middleware request fails with 500 error
**Root Cause:** Next.js's internal tracer imports @opentelemetry/api which is incompatible with Edge Runtime

**Attempted Fixes:**
1. Simplified middleware to minimal code - FAILED (Next.js still loads OpenTelemetry)
2. Removed middleware.ts entirely - PARTIAL (triggers missing manifest error)
3. Added webpack externals for @opentelemetry - FAILED

### 4. Missing middleware-manifest.json ❌ BLOCKING
**Issue:** When middleware.ts is removed, Next.js dev server crashes with:
```
Error: Cannot find module '/home/ubuntu/repos/melo/.next/server/middleware-manifest.json'
```

### 5. Missing Vendor Chunks ❌ BLOCKING
**Issue:** Server-side rendering fails with:
```
Cannot find module './vendor-chunks/@opentelemetry+api@1.9.0.js'
```

This is the original issue mentioned in the task - vendor chunks are not being generated properly.

### 6. PWA Build Issues ⚠️ DEFERRED
**Issue:** PWA configuration with `@ducanh2912/next-pwa` requires pages directory fallbacks that conflict with App Router only setup.

## Build Status Summary

| Route | Status | Notes |
|-------|--------|-------|
| `/` | ❌ | Fails after 47.7s compile |
| `/sign-in` | ❌ | 500 error (middleware crash) |
| `/sign-up` | ❌ | 500 error (middleware crash) |
| `/servers/*` | ❌ | Not reachable |

## Root Cause Analysis

The core issue is a **dependency conflict between Next.js 14.2.35 and the Edge Runtime**. Next.js 14.2.x introduced built-in OpenTelemetry support for tracing, but this module cannot run in Edge Runtime.

### Dependency Chain:
```
Next.js 14.2.35
└── @sentry/nextjs (monitoring)
    └── @opentelemetry/instrumentation
        └── @opentelemetry/api@1.9.0 ← INCOMPATIBLE WITH EDGE RUNTIME
```

## Recommended Solutions

### Option A: Downgrade Next.js (Fastest)
```bash
pnpm remove next
pnpm add next@14.1.4
```
Next.js 14.1.x doesn't have the OpenTelemetry integration built-in.

### Option B: Remove Sentry Integration (Moderate)
Remove `@sentry/nextjs` and `@sentry/node` dependencies which trigger the OpenTelemetry chain.

### Option C: Use Node.js Runtime for Middleware (Complex)
Configure middleware to use Node.js runtime instead of Edge:
```typescript
export const config = {
  runtime: 'nodejs', // experimental in 14.x
  matcher: [...]
}
```

### Option D: Full Dependency Restructure (Long-term)
1. Remove @sentry/nextjs
2. Remove @opentelemetry packages
3. Use minimal error tracking solution
4. Rebuild middleware from scratch

## Files Modified During Investigation

1. `middleware.ts` → `middleware.ts.backup` (backed up original)
2. `next.config.js` → Added webpack externals (attempted fix)
3. `app/(auth)/sign-in/` → Removed (duplicate route)
4. `app/(auth)/sign-up/` → Removed (duplicate route)
5. `app/api/channels/[channelId]/route.tsx` → Removed (duplicate file)

## Screenshot Audit Status

**Status:** BLOCKED - Cannot proceed until application is functional

### Planned Screenshot Routes (When Fixed)
1. `/sign-in` - Sign in page
2. `/sign-up` - Sign up page  
3. `/` - Root/Landing page
4. `/servers/[serverId]` - Server view
5. `/servers/[serverId]/channels/[channelId]` - Channel view
6. `/servers/[serverId]/settings` - Server settings
7. Mobile viewport versions of above

## Discord Reference Comparison

**Status:** Deferred until screenshots can be captured

## Recommendations for Main Agent

1. **Immediate:** Implement Option A (downgrade to Next.js 14.1.4) or Option B (remove Sentry)
2. **Before Screenshots:** Verify all routes load with 200 status
3. **After Fix:** Re-run this audit to capture and compare screenshots
4. **Long-term:** Consider migrating to Next.js 15 which has better Edge Runtime support

## Technical Details

### Environment
- Next.js: 14.2.35
- Node.js: v25.4.0
- Package Manager: pnpm v10.29.3
- OS: Linux 6.8.0-90-generic

### Error Logs
Full error traces saved in server console output during investigation.

---

**Next Steps:** Return to main agent with this report. Application requires fundamental dependency fixes before visual audit can proceed.
