# Pending Opus Review

**Purpose:** Haiku flags emails here. Opus reviews, does Circle thinking, then acts.

---

## Awaiting Opus Review

| Date | From | Subject | Reason to Review |
|------|------|---------|------------------|

---

## How This Works

1. **Haiku** reads emails → Sees something that might need action
2. **Haiku** adds row here → Then STOPS (no further action)
3. **Opus** runs (cron or triggered) → Reviews items here
4. **Opus** does Circle thinking for each:
   - Situation, sender perspective, Aaron's perspective
   - Trust verification, risk assessment, contingencies
5. **Opus** decides and acts:
   - Respond → Logs to ACTIONS-PENDING-ACK.md
   - Flag Aaron → Adds to escalations/for-aaron.md
   - Escalate PM → Creates inbox message
   - Ignore → Logs reason
6. **Opus** removes processed items from this file

---

## Processed by Opus

<!-- Opus moves items here after review with outcome -->
| Date | From | Subject | Opus Decision | Outcome |
|------|------|---------|---------------|---------|
