# Gateway Retry Lesson

**Date:** 2026-02-22
**Context:** Spawning portableralph Phase 0 workers

## Key Learning

**Gateway can be slow when lots of things are going on - retry instead of giving up.**

### Problem
- Earlier attempts to spawn Phase 0 workers hit gateway timeouts
- This caused tasks to stall and confusion about whether spawns succeeded

### Solution
1. **Don't panic on timeouts** — Gateway slowdown during busy periods is NORMAL
2. **Wait and retry** — Give it a moment, then try again
3. **Use longer timeouts** — If needed, increase timeout values for spawns
4. **Check for partial success** — Spawns may have succeeded even if response timed out

### Practical Tips
- If first spawn attempt times out, wait 5-10 seconds and retry
- Check if agent actually spawned (list sessions) before re-spawning
- Document timeout patterns for future reference
- Gateway performance varies with overall system load

### When This Applies
- Spawning multiple workers
- High-activity periods (many concurrent agents)
- Complex Opus tasks that need more resources

---

*This lesson documented per Aaron's direction after gateway slowdown incident.*
