# Email Monitor Escalation System

## Structure

```
escalations/
├── for-aaron.md           # Human-readable queue for Aaron
├── for-person-manager/    # JSON messages sent to PM inbox
└── README.md              # This file
```

## Escalation Paths

### → Aaron (Direct)
**Use for:**
- Security concerns
- Financial matters
- Legal matters
- Personal correspondence from trusted contacts
- Time-sensitive decisions only Aaron can make
- Anything the AI shouldn't handle autonomously

**Format:** Markdown table in `for-aaron.md`

**Also notifies:** Slack #aibot-chat if urgent

### → Person Manager (Via Inbox)
**Use for:**
- CI/CD failures (GitHub Actions)
- Infrastructure alerts
- Project-related emails
- Anything requiring management decisions
- Emails that might need Opus-level thinking

**Format:** JSON file in PM inbox (`scheduler/inboxes/person-manager/`)

### → Coordinator (Via Inbox)
**Use for:**
- Task-specific issues
- Worker blockers
- Technical questions
- Implementation-related communications

**Format:** JSON file in Coordinator inbox

## How Email Monitor Creates Escalations

### To Aaron
```markdown
<!-- In for-aaron.md -->
| 2026-02-28 | sender@example.com | Important Subject | HIGH | Personal correspondence | pending |
```

### To Person Manager
```bash
# Creates JSON file in PM inbox
cat > ~/clawd/scheduler/inboxes/person-manager/$(date +%s)-email-monitor-alert.json << 'EOF'
{
  "id": "email-alert-<timestamp>",
  "timestamp": "<ISO timestamp>",
  "from": "email-monitor",
  "to": "person-manager",
  "type": "email-alert",
  "subject": "Email Alert: <brief description>",
  "priority": "normal|urgent",
  "content": {
    "alert_type": "ci-failure|email-received|security",
    "source": "email or github",
    "details": "...",
    "recommended_action": "..."
  }
}
EOF
```

## Deduplication

- `processed-emails.txt` tracks all processed email IDs
- Each entry: `<email-id>|<timestamp>|<folder>|<action>`
- Actions: `ignored`, `noted`, `flagged-aaron`, `escalated-pm`
- Never re-process an email that's already in this file
- Clean entries older than 7 days to prevent bloat
