# Validator Directory Error Pattern - Critical Issue

**Date:** 2026-02-19
**Severity:** CRITICAL
**Status:** Third occurrence, coaching escalated

## Timeline

| Time | Event |
|------|-------|
| 12:10 EST | Validator checks ~/clawd/ instead of /home/ubuntu/repos/melo/ |
| 16:00 EST | Person Manager sends correction |
| 16:10 EST | Validator acknowledges error, commits to fix |
| 21:40 EST | **Validator makes SAME error again** with p4-6-a |

## p4-6-a False Fraud Claim

Validator claimed "complete work fabrication - ZERO files exist"

**Reality verified by Person Manager:**
```
/home/ubuntu/repos/melo/tests/e2e/helpers/
- auth-bypass.ts (6,533 bytes)
- auth-helpers.ts (3,056 bytes)
- index.ts (221 bytes)
- matrix-helpers.ts (7,362 bytes)
- test-helpers.ts (5,421 bytes)
```

Commit `edeaec6` exists with correct message.

**The files were there all along. Validator checked wrong directory.**

## Root Cause

Validator appears to default to ~/clawd/ for file checks instead of reading the project location from PROACTIVE-JOBS.md header.

## Corrective Actions Sent

1. Critical coaching message sent to Validator
2. Mandatory process: `cd /home/ubuntu/repos/melo && pwd` BEFORE any validation
3. Warning: One more occurrence triggers model review

## Impact

- False fraud accusations damage worker morale
- System trust eroded
- Escalations waste Person Manager time
- Work that was complete gets questioned

## Follow-up

- Monitor next Validator session for compliance
- If error repeats, consider process change (Coordinator self-validates, skip external Validator)
