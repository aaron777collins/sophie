# Claude Code Setup

Last updated: 2026-02-20

## Authentication

Claude Code uses Clawdbot's 1-year token for authentication.

**Token location:** `~/.claude/.credentials.json`

The token is the same `anthropic:propertoken` used by Clawdbot, stored in:
- Clawdbot: `~/.clawdbot/agents/main/agent/auth-profiles.json`
- Claude Code: `~/.claude/.credentials.json`
- Backup in: `~/.bashrc` as `ANTHROPIC_API_KEY` (env var fallback)

**Important:** This is an OAuth-style token that expires in ~1 year. If authentication fails:
1. Check if the token in `~/.claude/.credentials.json` matches Clawdbot's `anthropic:propertoken`
2. If Clawdbot is working, copy its token to Claude Code's credentials file

## Installed Plugins

### Core Plugins

| Plugin | Source | Version | Description |
|--------|--------|---------|-------------|
| **superpowers** | claude-plugins-official | 4.3.0 | Brainstorming, subagent development, code review, TDD |
| **claude-session-driver** | superpowers-marketplace | 1.0.0 | Launch/control other Claude Code sessions via tmux |
| **double-shot-latte** | superpowers-marketplace | 1.1.5 | Auto-continue without "Would you like me to continue?" |

### Marketplace Added

- **superpowers-marketplace** (`obra/superpowers-marketplace`) - Additional plugins for Claude Code

## Usage

### Basic Commands

```bash
# Simple prompt
claude -p "your question"

# With JSON output
claude -p "your question" --output-format json

# Interactive mode
claude

# With specific model (uses Opus by default with Max subscription)
claude -p "complex problem" --model opus
```

### Superpowers Features

With the superpowers plugin, Claude Code can:
- **Brainstorm** systematically
- **Spawn subagents** for parallel work
- **Code review** with multiple specialists
- **TDD** with red/green workflow
- **Debug** systematically

### Session Driver

The claude-session-driver enables:
- Launching worker Claude Code sessions in tmux
- Monitoring and controlling multiple sessions
- Coordinating parallel development work

## Configuration Files

| File | Purpose |
|------|---------|
| `~/.claude.json` | Main Claude Code config |
| `~/.claude/.credentials.json` | OAuth credentials |
| `~/.claude/plugins/installed_plugins.json` | Installed plugins |
| `~/.claude/plugins/known_marketplaces.json` | Added marketplaces |

## Troubleshooting

### Token Expired

If Claude Code shows "Invalid API key" or hangs:

1. Check Clawdbot's working token:
   ```bash
   cat ~/.clawdbot/agents/main/agent/auth-profiles.json | jq '.profiles["anthropic:propertoken"].token'
   ```

2. Update Claude Code credentials:
   ```bash
   # Get current timestamp + 1 year in ms
   EXPIRY=$(($(date +%s) * 1000 + 365 * 24 * 60 * 60 * 1000))
   TOKEN="<token from step 1>"
   
   cat > ~/.claude/.credentials.json << EOF
   {"claudeAiOauth":{"accessToken":"$TOKEN","refreshToken":"","expiresAt":$EXPIRY,"scopes":["user:inference","user:profile"],"subscriptionType":"max","rateLimitTier":"default_claude_max_20x"}}
   EOF
   ```

### Plugins Not Loading

1. Verify plugins are installed:
   ```bash
   cat ~/.claude/plugins/installed_plugins.json | jq '.plugins | keys'
   ```

2. Restart Claude Code to load new plugins

### Performance Issues

Claude Code with plugins may take longer to start. This is normal as plugins load their hooks and configurations.
