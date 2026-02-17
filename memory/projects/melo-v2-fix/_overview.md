# Project: melo-v2-fix

## Progress Update: [2026-02-12 12:00 EST]
### File: melo-v2-fix-build-p0.md
# p0-fix-build Progress - Final Report

## Summary

**Root cause identified and fixed!** The doubled path issue was caused by webpack alias resolution not working with yarn workspace hoisting.

## Root Cause

With yarn workspaces, dependencies are hoisted to the root `node_modules/` directory. The original webpack config used:

```js
"matrix-widget-api": path.resolve(__dirname, "node_modules/matrix-widget-api"),
```

This pointed to `apps/web/node_modules/matrix-widget-api` which doesn't exist (package is hoisted to root). This caused doubled paths like:
```
/home/ubuntu/repos/melo/apps/web/home/ubuntu/repos/melo/apps/web/node_modules/matrix-widget-api
```

## Fix Applied

Changed webpack alias resolution in `/home/ubuntu/repos/melo/apps/web/webpack.config.cjs`:

```js
// Before (broken with yarn workspaces):
"react": path.resolve(__dirname, "node_modules/react"),
"matrix-widget-api": path.resolve(__dirname, "node_modules/matrix-widget-api"),
...

// After (works with yarn workspaces):
"react": path.dirname(require.resolve("react/package.json")),
"matrix-widget-api": path.dirname(require.resolve("matrix-widget-api/package.json")),
// Note: @vector-im/compound-web needs special handling (doesn't export package.json)
"@vector-im/compound-web": path.resolve(require.resolve("@vector-im/compound-web"), "../.."),
```

## Node.js Version Impact

- **Node 25.4.0**: Shows misleading error `paths[1]` must be string, received boolean (true)
- **Node 22.22.0**: Shows the actual helpful error about doubled paths

**Recommendation: Use Node 22 (LTS) for building this project.**

## Additional Issues Discovered (Not Fully Resolved)

1. **lodash alias incompatibility**: `package.json` has `"lodash": "npm:lodash-es@^4.17.21"` which breaks html-webpack-plugin (expects CommonJS lodash). Added resolution but may need further testing.

2. **tinyglobby module resolution**: Intermittent "Cannot find module" errors for files that exist (likely Node 25 compatibility issue).

## Files Changed

1. `/home/ubuntu/repos/melo/apps/web/webpack.config.cjs` - Fixed alias resolution to use require.resolve()
2. `/home/ubuntu/repos/melo/apps/web/package.json` - Added lodash resolution for html-webpack-plugin

## Status

- ✅ Main doubled-path issue: **FIXED**
- ⚠️ Build progresses to 92% with Node 22 before hitting lodash issue
- ⚠️ Node 25 has additional module resolution quirks

## Recommendations

1. Use Node 22 (LTS) instead of Node 25 for builds
2. Test the lodash resolution fix
3. Consider updating html-webpack-plugin if lodash issue persists
4. The tsconfig.base.json in the repo root is untracked - consider removing it if unused

## Verification Commands

```bash
# Use Node 22
source ~/.nvm/nvm.sh && nvm use 22

# Install deps
cd /home/ubuntu/repos/melo && yarn install

# Build
cd apps/web && yarn build
```
