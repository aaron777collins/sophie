# Claude Code Integration Plan

**Created:** 2026-02-20 14:40 EST
**Status:** In Progress

## Overview

Integrate Claude Code CLI with Clawdbot's existing Anthropic authentication, install Superpowers plugin, and create a robust session tracking system.

## Phase 1: Authentication Setup ✅

### Token Configuration
The `anthropic:propertoken` from Clawdbot will be used for Claude Code.

**Environment Setup:**
```bash
# Add to ~/.bashrc or create a wrapper script
export ANTHROPIC_API_KEY="$CLAWDBOT_ANTHROPIC_TOKEN"
```

### Verification
```bash
claude --version  # ✅ 2.1.21 installed
claude -p "test" --model haiku  # Test API access
```

## Phase 2: Superpowers Installation

### Marketplace Setup
```bash
# In Claude Code interactive mode:
/plugin marketplace add obra/superpowers-marketplace
/plugin install superpowers@superpowers-marketplace
```

### What Superpowers Provides
- 20+ battle-tested skills
- `/brainstorm`, `/write-plan`, `/execute-plan` commands
- Skills-search tool for discovery
- SessionStart context injection

## Phase 3: Session Tracking System

### Problem
Claude Code sessions are ephemeral. We need to track:
- Session IDs and their purpose
- Active sessions vs completed
- Output and results
- Cost tracking

### Solution: Claude Session Registry

**File:** `memory/claude-sessions/registry.json`
```json
{
  "sessions": {
    "session-id": {
      "purpose": "description",
      "started": "timestamp",
      "ended": "timestamp",
      "status": "active|completed|failed",
      "project": "/path/to/project",
      "cost": 0.00,
      "summary": "what was accomplished"
    }
  },
  "activeCount": 0,
  "totalCost": 0.00
}
```

### Integration with Clawdbot
- Before spawning Claude Code: register session
- After completion: update registry with results
- Periodic cleanup of stale sessions

## Phase 4: Development Workflow Integration

### When to Use Claude Code
1. **Complex refactoring** - multi-file changes
2. **New feature development** - with planning mode
3. **Debugging** - with Superpowers debugging skills
4. **Code review** - independent verification

### Wrapper Script
Create `~/bin/cc` for easy invocation:
```bash
#!/bin/bash
# Claude Code wrapper with session tracking
SESSION_ID=$(date +%s)
PROJECT_DIR="${1:-$(pwd)}"

# Register session
echo "Registering session $SESSION_ID for $PROJECT_DIR"
# ... tracking logic

# Run Claude Code
cd "$PROJECT_DIR"
ANTHROPIC_API_KEY="$TOKEN" claude "$@"
```

## Execution Checklist

- [ ] Set up ANTHROPIC_API_KEY environment variable
- [ ] Test Claude Code with API key
- [ ] Install Superpowers marketplace
- [ ] Install core Superpowers plugin
- [ ] Create session registry structure
- [ ] Create wrapper script with tracking
- [ ] Document workflow in TOOLS.md
- [ ] Test end-to-end

## Notes

- Claude Code already has OAuth auth (Aaron's account)
- Using same token as Clawdbot ensures unified billing
- Superpowers skills complement Clawdbot's existing skills
