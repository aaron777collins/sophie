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
From: contact@aaroncollins.info
To: recipient@example.com
Cc: aaron777collins@gmail.com
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

## 📧 CREDENTIALS (Fastmail)

| Setting | Value |
|---------|-------|
| **Config file** | `~/.config/himalaya/config.toml` |
| **From address** | `contact@aaroncollins.info` |
| **Display name** | `Aaron Collins` |
| **App password** | `749n8f4k755l4r32` (dev3 app password) |
| **IMAP host** | `imap.fastmail.com` |
| **IMAP port** | `993` (TLS) |
| **SMTP host** | `smtp.fastmail.com` |
| **SMTP port** | `587` (STARTTLS) |

### Aaron's Email Addresses
| Purpose | Address |
|---------|---------|
| **Primary (receiving)** | aaron777collins@gmail.com |
| **Sending from** | contact@aaroncollins.info |
| **University** | colli11s@uwindsor.ca |

### Test the connection:
```bash
himalaya account list
# Should show: fastmail | IMAP, SMTP | yes
```

### If credentials are missing:
The himalaya config at `~/.config/himalaya/config.toml` should have the app password.
Ask Aaron for the Fastmail app password if it's not configured.

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

Plain text emails with markdown formatting look unprofessional. Aaron wants HTML emails that render nicely.

### Rule 3: Always include plain text fallback

The MML `<#multipart type=alternative>` format includes both:
- Plain text (for old email clients)
- HTML (for modern clients)

---

## 📝 SIMPLE EMAIL (No HTML needed)

For quick plain text emails:

```bash
cat << EOF | himalaya template send
From: contact@aaroncollins.info
To: recipient@example.com
Subject: Quick Message

Hi,

Your plain text message here.

Best,
Aaron
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
Aaron Collins
</p>

</body>
</html>
HTMLEOF

# Step 2: Load and send
HTML_CONTENT=$(cat /tmp/email-content.html)

cat << EOF | himalaya template send
From: contact@aaroncollins.info
To: recipient@example.com
Cc: aaron777collins@gmail.com
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
The config file has wrong credentials. Check `~/.config/himalaya/config.toml`:
```bash
cat ~/.config/himalaya/config.toml
```
Password should be: `749n8f4k755l4r32`

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

## 📚 LESSONS LEARNED

| Date | Mistake | Fix |
|------|---------|-----|
| 2026-02-14 17:28 | Used `<< 'EOF'` (quoted), variables didn't expand | Always use `<< EOF` (unquoted) |
| 2026-02-14 17:32 | Sent raw markdown, looked ugly | Convert to HTML |
| 2026-02-14 17:37 | Aaron wanted fancy formatting | Use HTML with MML multipart |

---

## ✅ CHECKLIST BEFORE SENDING

- [ ] HTML content created in temp file
- [ ] HTML loaded into variable with `$(cat ...)`
- [ ] Using unquoted heredoc `<< EOF` (NOT `<< 'EOF'`)
- [ ] MML format with `<#multipart type=alternative>`
- [ ] Plain text fallback included
- [ ] From address is `contact@aaroncollins.info`
- [ ] CC to `aaron777collins@gmail.com` if Aaron should see it
