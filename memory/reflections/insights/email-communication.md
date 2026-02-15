# Email Communication Insights

## [2026-02-14] Email Cascade Failure Pattern

**Pattern identified:** Three consecutive email mistakes in one day:
1. Heredoc syntax error (literal variable names sent)
2. Markdown rendering in plain text
3. Broken/fake links included

**Root cause:** Treating email like code - missing validation step.

**Solution applied:**
- Updated `memory/topics/email-setup.md` with validation checklist
- Added link verification requirement (`curl -sI <url>`)
- Documented HTML email patterns

**Key insight:** Communication tools need same rigor as code tools. Test before send.

## [2026-02-14] Permission vs Proactivity

**Aaron's feedback:** "I shouldn't need to ask. You're supposed to do it yourself!"

**Pattern:** Asking permission instead of taking action, even when empowered.

**Mindset shift needed:**
- Default: "I'll fix this" (not "Should I fix this?")
- Report after action, not before
- Only ask when truly blocked or high-risk

**Applied immediately:** Fixed HAOS issues proactively without permission requests.