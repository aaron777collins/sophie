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

### ⚠️ CRITICAL: Heredoc Quoting Rules
- [2026-02-14 17:28 EST] **LESSON LEARNED THE HARD WAY**
- `<< 'EOF'` (quoted) = NO variable expansion, $(cmd) appears literally
- `<< EOF` (unquoted) = Variables and commands EXPAND
- **ALWAYS use unquoted EOF when including file content or variables!**

### Correct Pattern (with file content):
```bash
# Load content into variable first, then use unquoted heredoc
CONTENT=$(cat /path/to/file.md)

cat << EOF | himalaya template send
From: contact@aaroncollins.info
To: recipient@example.com
Subject: Your Subject

${CONTENT}
EOF
```

### Simple message (no variables):
```bash
cat << EOF | himalaya template send
From: contact@aaroncollins.info
To: recipient@example.com
Subject: Your Subject

Your message body here.
EOF
```

### Check account is working:
```bash
himalaya account list
himalaya folder list
```

### ❌ WRONG - Do NOT do this:
```bash
# This will NOT expand the cat command!
cat << 'EMAILEOF' | himalaya template send
...
$(cat /tmp/file.md)   # <-- This appears LITERALLY in the email!
EMAILEOF
```

## Aaron's Email Addresses
- **Primary (receiving):** aaron777collins@gmail.com
- **Sending (Fastmail):** contact@aaroncollins.info
- **University:** colli11s@uwindsor.ca
