# TOOLS.md - Local Notes

Skills define *how* tools work. This file is for *your* specifics — the stuff that's unique to your setup.

## 🔑 Credentials & Access

*Document your credentials and access methods here. Keep it organized.*

| Service | Config Location | Notes |
|---------|-----------------|-------|
| **Email** | `~/.config/himalaya/config.toml` | IMAP/SMTP settings |
| **GitHub** | `~/.config/gh/hosts.yml` | gh CLI auth |
| **SSH** | `~/.ssh/config` | Remote hosts |
| **AWS** | `~/.aws/credentials` | If configured |

## Claude Code CLI (Opus Thinking)

**Purpose:** Extra brainpower, second opinions, and deeper thinking. Use freely!

**Basic usage:**
```bash
claude -p "your problem/question" --model opus
```

**JSON output format:**
```bash
claude -p "your question" --model opus --output-format json
```

**When to use:** Whenever it would be helpful! Examples:
- Thinking through complex problems
- Getting a second opinion
- Architecture decisions
- Debugging tricky issues

## Sub-Agents

Spawn sub-agents freely for parallel work or isolated tasks:
- **Haiku** — lightweight tasks, quick lookups, simple operations
- **Sonnet** — moderate complexity, research, code generation
- **Opus** — complex reasoning, architecture, nuanced decisions

Size the model to the task. Use `sessions_spawn` to spin them up.

## Web Search

- **Brave Search** — Primary search via Clawdbot's web_search tool
- **DuckDuckGo** — Fallback: `https://duckduckgo.com/html/?q=<query>`

## Browser Automation

*Document your browser automation setup here if you use it.*

## What Goes Here

Things like:
- Camera names and locations
- SSH hosts and aliases  
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

*Add whatever helps you do your job. This is your cheat sheet.*
