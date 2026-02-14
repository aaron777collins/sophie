# Email Setup

## Himalaya Configuration
- [2026-02-14 17:25 EST] Configured himalaya for sending emails

### Account: Fastmail
- **Config file:** `~/.config/himalaya/config.toml`
- **Email:** contact@aaroncollins.info
- **Display name:** Aaron Collins
- **Provider:** Fastmail
- **App password:** ***REMOVED*** (dev3 app password)

### Server Settings
| Protocol | Host | Port | Encryption |
|----------|------|------|------------|
| IMAP | imap.fastmail.com | 993 | TLS |
| SMTP | smtp.fastmail.com | 587 | STARTTLS |

## How to Send Email

```bash
# Simple send with template
cat << 'EOF' | himalaya template send
From: contact@aaroncollins.info
To: recipient@example.com
Subject: Your Subject

Your message body here.
EOF

# Check account is working
himalaya account list
himalaya folder list
```

## Aaron's Email Addresses
- **Primary (receiving):** aaron777collins@gmail.com
- **Sending (Fastmail):** contact@aaroncollins.info
- **University:** colli11s@uwindsor.ca
