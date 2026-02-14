# SOPHIE Repo

**Repo:** https://github.com/aaron777collins/sophie
**Local:** `/home/ubuntu/repos/sophie`
**Created:** 2026-02-14

## What It Is

A complete AI agent workspace template that packages all of Sophie's systems for others to replicate.

## Included Systems

| System | Description |
|--------|-------------|
| Management Hierarchy | Person Manager → Coordinator → Task Managers → Workers |
| Planning System | Iterative plan refinement before execution |
| Verification Chain | Trust-but-verify completion validation |
| Memory System | Self-scaling: daily, projects, topics, people |
| The Circle | Multi-perspective reasoning framework |
| Self-Reflection | Daily learning and improvement |
| Hired Agents | Recursive task decomposition |

## Key Files

- `onboard.sh` — Interactive setup wizard
- `AGENTS.md` — Master coordination guide (templatized)
- `SOUL.md` — Agent personality template
- `config/clawdbot-config.template.json` — Config template

## Usage

```bash
git clone https://github.com/aaron777collins/sophie.git ~/clawd
cd ~/clawd
./onboard.sh
```

## Security

- All secrets removed
- User-specific paths templatized
- .gitignore protects runtime data
- MIT licensed

## History

- [2026-02-14] Initial creation and publication
