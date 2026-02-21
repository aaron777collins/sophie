# Validation Report: [{US-ID}] {Story Title}

**Validator:** {name/role}
**Validation Level:** L1 Self | L2 Manager | L3 Peer
**Date:** {YYYY-MM-DD HH:MM TZ}
**Test Server:** {URL}
**Git Commit:** {hash}

---

## Overall Verdict

# ✅ PASS | ❌ FAIL

---

## Acceptance Criteria Results

### AC-1: {title}

| Aspect | Result |
|--------|--------|
| **Status** | ✅ PASS / ❌ FAIL |
| **Screenshot** | `scheduler/validation/screenshots/{project}/{US-ID}-AC-1.png` |

**Validation Steps Performed:**
1. {step 1}
2. {step 2}
3. {step 3}

**Observations:**
{What was observed during validation}

---

### AC-2: {title}

| Aspect | Result |
|--------|--------|
| **Status** | ✅ PASS / ❌ FAIL |
| **Screenshot** | `scheduler/validation/screenshots/{project}/{US-ID}-AC-2.png` |

**Validation Steps Performed:**
1. {step 1}
2. {step 2}
3. {step 3}

**Observations:**
{What was observed during validation}

---

### AC-3: {title}

| Aspect | Result |
|--------|--------|
| **Status** | ✅ PASS / ❌ FAIL |
| **Screenshot** | `scheduler/validation/screenshots/{project}/{US-ID}-AC-3.png` |

**Validation Steps Performed:**
1. {step 1}
2. {step 2}
3. {step 3}

**Observations:**
{What was observed during validation}

---

## Error Checks

### Browser Console
- [ ] Checked for JavaScript errors
- **Errors Found:** {none | list errors}

### Server Logs (pm2)
- [ ] Checked pm2 logs
- **Errors Found:** {none | list errors}

### Network Requests
- [ ] Checked for failed requests (4xx/5xx)
- **Failed Requests:** {none | list failures}

---

## Issues Found

| # | Severity | Description | AC Affected |
|---|----------|-------------|-------------|
| 1 | {Critical/High/Medium/Low} | {description} | AC-{n} |
| 2 | | | |

---

## Evidence Files

| File | Description |
|------|-------------|
| `{US-ID}-AC-1.png` | Screenshot for AC-1 |
| `{US-ID}-AC-2.png` | Screenshot for AC-2 |
| `{US-ID}-AC-3.png` | Screenshot for AC-3 |
| `{US-ID}-console.log` | Browser console output |
| `{US-ID}-server.log` | Server log excerpt |

---

## Environment

| Aspect | Value |
|--------|-------|
| Test Server | {URL} |
| Browser | Playwright Chromium |
| Git Commit | {hash} |
| Validated At | {timestamp} |

---

## Validator Certification

I certify that:
- [ ] I actually deployed and tested on the test server
- [ ] I performed each validation step manually or via Playwright
- [ ] Screenshots are real, taken during this validation
- [ ] All issues found are documented above
- [ ] I did NOT copy results from a previous validation

**Validator:** {name}
**Date:** {date}

---
*Template version: 1.0*
