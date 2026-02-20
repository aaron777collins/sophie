# Haiku Model 404 Fix — 2026-02-20 16:00 EST

## Problem Detected
Multiple sub-agent sessions failing with 404 errors:
```
404 {"type":"error","error":{"type":"not_found_error","message":"model: claude-3-5-haiku-latest"}}
```

## Root Cause
The model name `claude-3-5-haiku-latest` is no longer valid on the Anthropic API (as of 2026-02-20). The alias model names may have been deprecated.

## Fix Applied
Updated scheduler identity files to use the specific versioned model name:
- `claude-3-5-haiku-latest` → `claude-3-5-haiku-20241022`

### Files Updated
1. `scheduler/workers/IDENTITY.md`
2. `scheduler/coordinator/IDENTITY.md`

## Impact
- Several sub-agent spawns (cdp-1-5, coordinator crons) were failing
- Tasks that attempted to use haiku were erroring out
- Connected Driving Phase 1 completion may have been affected

## Verification
Will monitor next cron runs to confirm model calls succeed.

## Note
The gateway config still has both model names configured - may need a config patch to update default haiku alias. For now, scheduler docs will use explicit versioned names.
