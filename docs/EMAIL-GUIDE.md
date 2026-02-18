# Email Setup - Complete Guide

**READ THIS ENTIRE FILE BEFORE SENDING ANY EMAIL.**

---

## 🚀 QUICK START: Send a Professional HTML Email

**Follow these exact steps:**

### Step 1: Create your HTML content file
```bash
cat > /tmp/my-email.html << 'HTMLEOF'
<!DOCTYPE html>
<html>
<head>
<style>
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
h1 { color: #1a365d; border-bottom: 3px solid #3182ce; padding-bottom: 10px; }
h2 { color: #2c5282; border-bottom: 2px solid #90cdf4; padding-bottom: 8px; }
table { border-collapse: collapse; width: 100%; margin: 15px 0; }
th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; }
th { background: #edf2f7; }
code { background: #edf2f7; padding: 2px 6px; border-radius: 4px; }
.highlight { background: #f0fff4; border-left: 4px solid #38a169; padding: 15px; margin: 15px 0; }
</style>
</head>
<body>

<h1>Your Email Title</h1>
<p>Your content here...</p>

</body>
</html>
HTMLEOF
```

### Step 2: Load HTML into a variable
```bash
HTML_CONTENT=$(cat /tmp/my-email.html)
```

### Step 3: Send with MML multipart format
```bash
cat << EOF | himalaya template send
From: your-email@example.com
To: recipient@example.com
Subject: Your Subject Line

<#multipart type=alternative>
Plain text fallback: Your message summary here for old email clients.
<#part type=text/html>
${HTML_CONTENT}
<#/multipart>
EOF
```

### Step 4: Verify it sent
You should see: `Message successfully sent!`

---

## 📧 HIMALAYA SETUP

Himalaya is a CLI email client. Configure it at `~/.config/himalaya/config.toml`:

```toml
[accounts.default]
email = "your-email@example.com"
display-name = "Your Name"
default = true

backend.type = "imap"
backend.host = "imap.your-provider.com"
backend.port = 993
backend.encryption.type = "tls"
backend.login = "your-email@example.com"
backend.auth.type = "password"
backend.auth.cmd = "echo 'YOUR_APP_PASSWORD'"

message.send.backend.type = "smtp"
message.send.backend.host = "smtp.your-provider.com"
message.send.backend.port = 587
message.send.backend.encryption.type = "start-tls"
message.send.backend.login = "your-email@example.com"
message.send.backend.auth.type = "password"
message.send.backend.auth.cmd = "echo 'YOUR_APP_PASSWORD'"
```

### Common Provider Settings

| Provider | IMAP Host | IMAP Port | SMTP Host | SMTP Port |
|----------|-----------|-----------|-----------|-----------|
| **Fastmail** | imap.fastmail.com | 993 (TLS) | smtp.fastmail.com | 587 (STARTTLS) |
| **Gmail** | imap.gmail.com | 993 (TLS) | smtp.gmail.com | 587 (STARTTLS) |
| **Outlook** | outlook.office365.com | 993 (TLS) | smtp.office365.com | 587 (STARTTLS) |

### Test the connection:
```bash
himalaya account list
himalaya folder list
```

---

## ⚠️ CRITICAL RULES - READ THESE!

### Rule 1: ALWAYS use unquoted heredoc with variables!

```bash
# ✅ CORRECT - unquoted EOF allows ${VARIABLE} to expand
cat << EOF | himalaya template send
...
${HTML_CONTENT}
EOF

# ❌ WRONG - quoted 'EOF' makes ${VARIABLE} appear LITERALLY
cat << 'EOF' | himalaya template send
...
${HTML_CONTENT}   # <-- This shows as "${HTML_CONTENT}" in the email!
EOF
```

**The rule:** 
- `<< EOF` (no quotes) = variables EXPAND ✅
- `<< 'EOF'` (quotes) = variables appear LITERALLY ❌

### Rule 2: Use HTML for professional emails, not plain text!

Plain text emails with markdown formatting look unprofessional. Use HTML emails that render nicely.

### Rule 3: Always include plain text fallback

The MML `<#multipart type=alternative>` format includes both:
- Plain text (for old email clients)
- HTML (for modern clients)

---

## 📝 SIMPLE EMAIL (No HTML needed)

For quick plain text emails:

```bash
cat << EOF | himalaya template send
From: your-email@example.com
To: recipient@example.com
Subject: Quick Message

Hi,

Your plain text message here.

Best,
Your Name
EOF
```

---

## 🎨 HTML EMAIL TEMPLATE

Copy this complete template for professional emails:

```bash
# Step 1: Create HTML file
cat > /tmp/email-content.html << 'HTMLEOF'
<!DOCTYPE html>
<html>
<head>
<style>
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
h1 { color: #1a365d; border-bottom: 3px solid #3182ce; padding-bottom: 10px; }
h2 { color: #2c5282; border-bottom: 2px solid #90cdf4; padding-bottom: 8px; margin-top: 30px; }
h3 { color: #2b6cb0; margin-top: 20px; }
table { border-collapse: collapse; width: 100%; margin: 15px 0; }
th, td { border: 1px solid #e2e8f0; padding: 10px 12px; text-align: left; }
th { background: #edf2f7; font-weight: 600; }
tr:nth-child(even) { background: #f7fafc; }
code { background: #edf2f7; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
ul, ol { padding-left: 20px; }
li { margin: 5px 0; }
.success { background: #f0fff4; border-left: 4px solid #38a169; padding: 15px; margin: 15px 0; }
.warning { background: #fffaf0; border-left: 4px solid #dd6b20; padding: 15px; margin: 15px 0; }
.info { background: #ebf8ff; border-left: 4px solid #3182ce; padding: 15px; margin: 15px 0; }
hr { border: none; border-top: 1px solid #e2e8f0; margin: 30px 0; }
</style>
</head>
<body>

<h1>📧 Email Title Here</h1>

<p>Introduction paragraph...</p>

<h2>Section 1</h2>
<p>Content with <strong>bold</strong> and <code>code</code> formatting.</p>

<ul>
<li>Bullet point one</li>
<li>Bullet point two</li>
</ul>

<h2>Section 2</h2>
<table>
<tr><th>Column 1</th><th>Column 2</th><th>Column 3</th></tr>
<tr><td>Data</td><td>Data</td><td>Data</td></tr>
<tr><td>Data</td><td>Data</td><td>Data</td></tr>
</table>

<div class="success">
<strong>Key Point:</strong> Important success message here.
</div>

<div class="warning">
<strong>Warning:</strong> Important warning here.
</div>

<hr>

<p style="color: #718096; font-size: 0.9em;">
Best regards,<br>
Your Name
</p>

</body>
</html>
HTMLEOF

# Step 2: Load and send
HTML_CONTENT=$(cat /tmp/email-content.html)

cat << EOF | himalaya template send
From: your-email@example.com
To: recipient@example.com
Subject: Your Subject Here

<#multipart type=alternative>
Plain text version of your email for old clients.
<#part type=text/html>
${HTML_CONTENT}
<#/multipart>
EOF
```

---

## 🔧 TROUBLESHOOTING

### "Incorrect username, password or access token"
Check your `~/.config/himalaya/config.toml` has correct credentials.
Most providers require an **app-specific password**, not your main login password.

### Email shows "${HTML_CONTENT}" literally
You used quoted heredoc `<< 'EOF'`. Change to unquoted `<< EOF`.

### Email shows markdown formatting (**, #, etc.)
You sent raw markdown. Convert to HTML first (see template above).

### Check if himalaya is working:
```bash
himalaya account list
himalaya folder list
```

---

## 📚 COMMON MISTAKES TO AVOID

| Mistake | Fix |
|---------|-----|
| Used `<< 'EOF'` (quoted), variables didn't expand | Always use `<< EOF` (unquoted) |
| Sent raw markdown, looked ugly in email | Convert to HTML |
| Used main password instead of app password | Generate app-specific password from provider |

---

## ✅ CHECKLIST BEFORE SENDING

- [ ] HTML content created in temp file
- [ ] HTML loaded into variable with `$(cat ...)`
- [ ] Using unquoted heredoc `<< EOF` (NOT `<< 'EOF'`)
- [ ] MML format with `<#multipart type=alternative>`
- [ ] Plain text fallback included
- [ ] From address matches your config
- [ ] Test with yourself first before sending to others
