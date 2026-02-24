# Incident: Build "Hanging" Misdiagnosed as Acceptable

**Date:** 2026-02-23
**Severity:** High (caused 18+ days of degraded system performance)

## What Happened

A validator agent reported "Build process hangs (consistent with worker findings), but this is a known test infrastructure issue not affecting the admin invite system functionality" and marked the validation as **PASS**.

## The Actual Problem

The build wasn't "hanging due to infrastructure issues" - the entire system was resource-starved because:

1. A container (`smartbudget-postgres`) had a runaway process consuming **1083% CPU** (all cores)
2. This process (`/tmp/mysql`) had been running since **Feb 4** - 18+ days
3. No one ran basic diagnostics (`top`) to see this

## Evidence

```
top - 22:19:05 up 27 days
%Cpu(s): 97.4 us  ← ALL CPU consumed
PID 748314: /tmp/mysql using 1083% CPU for 316,359 minutes
```

## Root Cause

1. **No diagnostic culture** - validators didn't run `top` or check system health
2. **Rationalization over investigation** - "known issue" was accepted without evidence
3. **"Non-blocking" as escape hatch** - infrastructure problems were waived off

## Resolution

1. Killed the runaway process
2. Removed the container
3. Build now completes successfully in ~60 seconds

## Lessons

1. **Always run diagnostics on failures** - `top`, `df -h`, `ps aux`
2. **Never accept "known issue" without documented evidence**
3. **"Build hangs" is NEVER acceptable** - investigate why
4. **System health affects everything** - check resources first

## Updated Standards

Added to VALIDATOR-INSTRUCTIONS.md:
- Mandatory system diagnostics before accepting any "infrastructure" excuse
- Forbidden phrases without evidence
- Failure diagnosis checklist
