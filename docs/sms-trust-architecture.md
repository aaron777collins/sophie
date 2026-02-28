# SMS + Trust System Architecture

**Created:** 2026-02-28 17:17 EST
**Author:** Sophie (Opus)
**Status:** Implementation In Progress

## Overview

Integrate Twilio SMS with Sophie's trust system, enabling:
1. **Inbound SMS** - Receive texts, route to Sophie with trust verification
2. **Outbound SMS** - Sophie can text others on Aaron's request
3. **Unified Identity** - Phone, email, Slack, Telegram all linked per person

## Architecture

```
┌─────────────────┐     Webhook      ┌──────────────────┐
│    Twilio       │ ───────────────> │  SMS Webhook     │
│  (SMS Gateway)  │                  │  Server (8089)   │
└─────────────────┘                  └────────┬─────────┘
        ↑                                     │
        │                              POST to Gateway
   SMS Send                              /agent API
        │                                     │
        │                                     ↓
┌───────┴─────────┐                  ┌──────────────────┐
│  sms-cli.sh     │ <─────────────── │    Clawdbot      │
│  (Outbound)     │    Tool/Exec     │    (Sophie)      │
└─────────────────┘                  └──────────────────┘
```

## Trust Model

### Phone Trust Levels

| Phone | Trust Level | Permissions |
|-------|-------------|-------------|
| +15175150233 (Aaron) | **FULL** | Full access, commands, private info |
| Known contacts | **PARTIAL** | Limited - relay messages, general help |
| Unknown numbers | **NONE** | Minimal - leave message, no actions |

### Identity Unification

Each person can have multiple identifiers:
- Phone number(s)
- Email address(es)  
- Slack User ID
- Telegram User ID

All linked in contact DB → same trust level applies across all channels.

## Implementation Components

### 1. Twilio Credentials (✅ DONE)
- Stored: `~/clawd/data/twilio-credentials.secret`
- Gitignored: ✅
- Number: +13655139030

### 2. Contact DB Schema Upgrade

Add platform identifiers table:
```sql
CREATE TABLE IF NOT EXISTS contact_identifiers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_id INTEGER NOT NULL,
    platform TEXT NOT NULL,  -- phone, email, slack, telegram
    identifier TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT 0,
    verified_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
    UNIQUE(platform, identifier)
);

CREATE INDEX idx_contact_identifiers ON contact_identifiers(platform, identifier);
```

### 3. SMS Webhook Server

Simple Express server on port 8089:
- Receives POST from Twilio on `/sms/inbound`
- Validates Twilio signature
- Looks up sender in contact DB for trust level
- Routes to Clawdbot gateway API with trust context
- Returns TwiML response

### 4. Outbound SMS CLI

`~/clawd/tools/sms/sms-cli.sh`:
```bash
sms-cli.sh send +1234567890 "Message here"
sms-cli.sh status  # check account
```

### 5. Public URL for Webhook

Options:
- **ngrok** - Easy, free tier available
- **Tailscale Funnel** - If tailscale enabled
- **Cloudflare Tunnel** - Alternative

Current gateway is loopback-only, so we need a tunnel.

### 6. Twilio Webhook Configuration

Set in Twilio console:
- Messaging webhook URL: `https://<public-url>/sms/inbound`
- Method: POST

## Security Considerations

### SMS Spoofing
- **Risk:** Phone numbers CAN be spoofed in SMS
- **Mitigation:** 
  - SMS messages get PARTIAL trust max (not FULL)
  - Commands require confirmation via other channel
  - Aaron's phone still gets higher trust than unknown

### Rate Limiting
- Track message frequency per number
- Block suspicious patterns

### Logging
- All SMS interactions logged to `~/clawd/data/sms/logs/`
- Include timestamp, from, to, message, trust level

## Files Created

| Path | Purpose |
|------|---------|
| `~/clawd/data/twilio-credentials.secret` | Twilio API credentials |
| `~/clawd/tools/sms/sms-cli.sh` | Outbound SMS CLI |
| `~/clawd/tools/sms/webhook-server.js` | Inbound webhook server |
| `~/clawd/tools/sms/start-sms.sh` | Service startup script |
| `~/clawd/data/sms/logs/` | Message logs |

## Aaron's Verified Phone

**Number:** +15175150233
**Trust:** FULL (same as his Slack/Telegram)

## Implementation Order

1. ✅ Store credentials
2. Upgrade contact DB schema  
3. Add Aaron to verified phones
4. Create outbound SMS CLI
5. Create webhook server
6. Set up ngrok tunnel
7. Configure Twilio webhook
8. Test inbound
9. Test outbound
10. Document in TOOLS.md

## Contingencies

### Twilio webhook fails
- Logs in `~/clawd/data/sms/logs/errors.log`
- Fallback: manual check via Twilio console

### Gateway unreachable from webhook
- Queue messages in SQLite for retry
- Max retry: 3 attempts, 30s apart

### Unknown number texts
- Log but don't escalate immediately
- Batch notify Aaron of unknowns daily

### Rate limit hit
- Twilio has soft limits
- Monitor usage, alert at 80%
