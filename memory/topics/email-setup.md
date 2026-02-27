# Email Setup - Complete Guide

**READ THIS ENTIRE FILE BEFORE SENDING ANY EMAIL.**

---

## ⚡ PRE-SEND CHECKLIST (MANDATORY)

Before sending ANY email, verify:

### 1. Personal Info Check
- [ ] **Check `memory/people/aaron.md`** for current address, phone, email
- [ ] If address changed, TELL THEM about the new address
- [ ] Use info FROM MY NOTES, don't ask Aaron for things I should know

### 2. Thread Continuity
- [ ] **Who did they email?** Check the incoming "To:" field
- [ ] **Reply FROM that address** to maintain thread
- [ ] Don't assume - READ the email headers

### 3. BCC BOTH ADDRESSES (ALWAYS)
- [ ] `Bcc: aaron777collins@gmail.com, contact@aaroncollins.info`
- [ ] This is NON-NEGOTIABLE — Aaron needs copies at BOTH addresses
- [ ] [2026-02-27] I forgot this once. Don't forget again.

### 4. Folder Check
- [ ] **New emails go to `AaronCollins.Info` folder** (not INBOX)
- [ ] Always check: `himalaya envelope list -f "AaronCollins.Info"`
- [ ] Also check INBOX for older threads

### 5. Note-Taking
- [ ] Create note in `scheduler/email-monitor/notes/`
- [ ] Update `pending-responses.md` if tracking
- [ ] Log external action in `ACTIONS-PENDING-ACK.md`
- [ ] Notify Person Manager if significant

### 6. Learning
- [ ] Update `memory/people/aaron.md` with any new info learned
- [ ] Document lessons in this file's "Lessons Learned" section

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
Bcc: aaron777collins@gmail.com, contact@aaroncollins.info
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
| **From addresses** | `contact@aaroncollins.info` OR `aaron777collins@gmail.com` |
| **Display name** | `Aaron Collins` |
| **App password** | `749n8f4k755l4r32` (dev3 app password) |
| **IMAP host** | `imap.fastmail.com` |
| **IMAP port** | `993` (TLS) |
| **SMTP host** | `smtp.fastmail.com` |
| **SMTP port** | `587` (STARTTLS) |

### Aaron's Email Addresses
| Purpose | Address |
|---------|---------|
| **Professional sending** | contact@aaroncollins.info |
| **Personal sending** | aaron777collins@gmail.com |
| **University** | colli11s@uwindsor.ca |

**⚠️ Both `contact@aaroncollins.info` AND `aaron777collins@gmail.com` are configured for SENDING.**
When replying to a thread, match the From address to the original email!

**⚠️ BCC RULE:** Always Bcc both addresses for visibility:
- `Bcc: aaron777collins@gmail.com, contact@aaroncollins.info`
- This lets Aaron see it from either inbox AND lets Sophie monitor it
- Do NOT use CC — recipients can see CC addresses (awkward!)

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
Bcc: aaron777collins@gmail.com, contact@aaroncollins.info
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
| 2026-02-27 02:22 | Sent follow-up from different address than original | **Match the From address to the thread** |
| 2026-02-27 02:25 | Used CC instead of BCC for visibility copies | **Use BCC** — recipients see CC addresses! |

---

## ⚠️ THREAD CONTINUITY RULE (CRITICAL)

**When replying to an email thread, use the address THEY REPLIED TO.**

Aaron has BOTH addresses configured for sending:
- `contact@aaroncollins.info` — Professional domain
- `aaron777collins@gmail.com` — Personal Gmail

**Before sending a reply:**
1. Check the incoming email's "To:" field - who did THEY email?
2. Reply FROM that address to maintain the thread from their perspective
3. If original was sent with CC, they might reply to the CC address - that's fine, use it

**Example (Crossroads 2026-02-27):**
- Original FROM: contact@aaroncollins.info (CC: aaron777collins@gmail.com)
- They replied TO: aaron777collins@gmail.com
- Reply FROM: aaron777collins@gmail.com ✅ (matches their expectation) SAME address in your reply
3. This ensures proper threading and looks professional

---

## ✅ CHECKLIST BEFORE SENDING

- [ ] HTML content created in temp file
- [ ] HTML loaded into variable with `$(cat ...)`
- [ ] Using unquoted heredoc `<< EOF` (NOT `<< 'EOF'`)
- [ ] MML format with `<#multipart type=alternative>`
- [ ] Plain text fallback included
- [ ] From address is `contact@aaroncollins.info`
- [ ] CC to `aaron777collins@gmail.com` if Aaron should see it
- [ ] **VERIFY ALL LINKS** with `curl -sI <url>` — check for 200 response!
