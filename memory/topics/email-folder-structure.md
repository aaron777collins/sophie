# Email Folder Structure

**Created:** [2026-02-27 12:15 EST]
**Purpose:** Document where emails live so monitors don't miss things

---

## ⚠️ CRITICAL: Two Inbox Folders

| Folder | Contains | Check Command |
|--------|----------|---------------|
| **AaronCollins.Info** | **NEWER emails** (primary) | `himalaya envelope list -f "AaronCollins.Info"` |
| **INBOX** | Older emails | `himalaya envelope list -f "INBOX"` |

**ALWAYS check BOTH folders when looking for emails!**

---

## Why Two Folders?

Fastmail routes emails differently based on configuration. The `AaronCollins.Info` folder receives newer incoming mail, while `INBOX` has historical emails.

---

## Checking Both (Script Pattern)

```bash
# In process-emails.sh and any email checking:
echo "=== RECENT EMAILS - AaronCollins.Info folder ==="
himalaya envelope list -f "AaronCollins.Info" --page-size 20

echo ""
echo "=== RECENT EMAILS - INBOX folder ==="
himalaya envelope list -f "INBOX" --page-size 10
```

---

## Bug History

| Date | Issue | Fix |
|------|-------|-----|
| 2026-02-27 | Email monitor only checked INBOX, missed Crossroads reply in AaronCollins.Info | Updated `process-emails.sh` to check both folders |

---

## Related Files

- `scheduler/email-monitor/process-emails.sh` — Main email checking script
- `memory/topics/email-setup.md` — Complete email guide
