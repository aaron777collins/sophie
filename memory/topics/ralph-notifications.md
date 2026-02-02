# Ralph - Notification & Alerting Tool

**Created:** 2026-01-28 ~22:00 EST  
**Last Updated:** 2026-01-28 22:00 EST

---

## Summary

Ralph (PortableRalph) is a notification and alerting tool used for pipeline notifications. It integrates with Slack for sending alerts, though it was designed for webhooks rather than bot tokens, requiring a custom wrapper script to work with clawdbot's Slack configuration.

---

## Key Points

### Configuration
- [2026-01-28 ~22:00 EST] Configuration file: `~/.ralph.env`
- [2026-01-28 ~22:00 EST] Custom Slack script: `~/.ralph-slack-notify.sh` - bridges Ralph's webhook-style calls to clawdbot's bot token API
- [2026-01-28 ~22:00 EST] Uses clawdbot's Slack bot token for notifications

### Slack Integration
- [2026-01-28 ~22:00 EST] Ralph expects webhook-style Slack integration, but clawdbot has bot tokens
- [2026-01-28 ~22:00 EST] Workaround: Custom `~/.ralph-slack-notify.sh` script that uses the bot token
- [2026-01-28 ~22:00 EST] Target channel: `C0ABAU26S6N` (#aibot-chat)

### Bug Fixes Applied
- [2026-01-28 ~22:00 EST] `validation.sh` ~line 121: Null byte regex `$'\0'` doesn't work in bash `=~` → replaced with `grep -qP '\x00'`
- [2026-01-28 ~22:00 EST] `ralph.sh` lines 144-146, 641-657: Multiple `local` variable declarations outside functions → `local` only works inside functions
- [2026-01-28 ~22:00 EST] `notify.sh` line 114: `RATE_LIMIT_MAX` is `readonly` in constants.sh but notify.sh tried to reassign → removed reassignment

### Use Cases
- [2026-01-28 ~22:00 EST] Pipeline notifications (e.g., ConnectedDrivingPipelineV4)
- [2026-01-28 ~22:00 EST] Build/task progress alerts
- [2026-01-28 ~22:00 EST] `ralph plan` - Generate task breakdowns
- [2026-01-28 ~22:00 EST] `ralph build` - Run implementation with notifications

---

## Lessons Learned

- [2026-01-28 ~22:00 EST] Ralph's Slack integration assumes webhooks, not bot tokens - need custom wrapper scripts for bot token environments
- [2026-01-28 ~22:00 EST] Several bash bugs in PortableRalph related to variable scoping and regex syntax - check for these when setting up
- [2026-01-28 ~22:00 EST] Claude CLI integration with ralph may have output capture issues - needs debugging

---

## Open Issues

- [2026-01-28 ~22:00 EST] Ralph + Claude CLI integration: output not being captured properly by ralph.sh - needs investigation of prompt template and Claude invocation

---

## Related Files

- `~/.ralph.env` - Main configuration
- `~/.ralph-slack-notify.sh` - Custom Slack notification script
- `/home/ubuntu/ConnectedDrivingPipelineV4/RALPH_WYDOT_PLAN.md` - Example ralph plan
