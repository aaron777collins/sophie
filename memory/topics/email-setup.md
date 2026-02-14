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

## ⚠️ Email Formatting: Markdown → Plain Text
- [2026-02-14 17:32 EST] **LESSON LEARNED**: Emails are plain text, markdown doesn't render!

### Convert markdown to plain text before sending:
```bash
cat document.md | \
  sed 's/^# \(.*\)/\n\U\1\E\n===============================================================================/g' | \
  sed 's/^## \(.*\)/\n\U\1\E\n-------------------------------------------------------------------------------/g' | \
  sed 's/^### \(.*\)/\n\U\1\E\n/g' | \
  sed 's/\*\*//g' | \
  sed 's/`//g' | \
  sed 's/^- /• /g' > document-plaintext.txt
```

### What this does:
- `# Header` → `HEADER` with `===` underline
- `## Subheader` → `SUBHEADER` with `---` underline  
- `### Small header` → `SMALL HEADER` (just caps)
- `**bold**` → `bold` (remove markers)
- `` `code` `` → `code` (remove backticks)
- `- bullet` → `• bullet` (unicode bullet)

### Always remember:
- Tables with `|` won't align perfectly but are readable
- ASCII art diagrams (boxes, arrows) work fine
- Keep lines under 80 chars when possible

## ✨ HTML Emails (The Better Way!)
- [2026-02-14 17:37 EST] **USE HTML for professional emails!**

### MML Format for HTML Emails:
```bash
HTML_CONTENT=$(cat /tmp/email.html)

cat << EOF | himalaya template send
From: contact@aaroncollins.info
To: recipient@example.com
Subject: Your Subject

<#multipart type=alternative>
Plain text fallback for old email clients.
<#part type=text/html>
${HTML_CONTENT}
<#/multipart>
EOF
```

### HTML Email Tips:
- Use `<#multipart type=alternative>` for HTML with plain text fallback
- Inline CSS styles (email clients strip <style> tags sometimes)
- Use tables for layout (old school but reliable)
- Good fonts: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial
- Color-code important info: green for success, orange for warnings
- Use `<code>` for technical terms, `<table>` for data

### Example Inline Styles:
```html
<h1 style="color: #1a365d; border-bottom: 3px solid #3182ce;">Header</h1>
<table style="border-collapse: collapse; width: 100%;">
<tr><th style="background: #edf2f7; padding: 10px;">Col</th></tr>
</table>
<div style="background: #f0fff4; border-left: 4px solid #38a169; padding: 15px;">
  Key insight box
</div>
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
