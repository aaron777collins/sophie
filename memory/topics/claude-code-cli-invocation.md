# Claude Code CLI Invocation

**Last Updated:** 2026-02-21 13:55 EST

## Problem Discovered
- [2026-02-21 12:30 EST] Initial theory: SIGSTOP signals causing process halt
- [2026-02-21 13:45 EST] **Root cause identified:** Claude Code requires a PTY (pseudo-terminal) to output to stdout
- Without a PTY, Claude Code connects to API, executes, but produces ZERO output to stdout
- Debug logs show "Stream started" but output is simply not written without a terminal

## Root Cause
Claude Code CLI **requires a PTY** to write output. When run without a terminal (as happens in exec tools, cron, scripts), it silently produces no output even though it's working internally.

## Working Solution
Use `script -q -c 'command' /dev/null` to provide a pseudo-terminal, then strip ANSI escape codes from output.

### Pattern 1: Simple Query (VERIFIED WORKING)
```bash
cd /tmp
timeout 60 script -q -c 'claude -p "Your question here" --output-format text' /dev/null 2>&1 | \
  perl -pe 's/\e\[[0-9;]*[mGKHF]//g; s/\e\][^\a]*\a//g; s/\e\[[^\a-~]*[\a-~]//g' | \
  tr -d '\r' | head -n -1
```

### Pattern 2: File Operations with Permissions (VERIFIED WORKING)
```bash
cd ~/clawd
timeout 120 script -q -c 'claude -p "Create a file at /tmp/test.txt with content: Hello" \
  --allowedTools "Read,Write,Edit,Bash" \
  --dangerously-skip-permissions \
  --output-format text' /dev/null 2>&1 | \
  perl -pe 's/\e\[[0-9;]*[mGKHF]//g; s/\e\][^\a]*\a//g; s/\e\[[^\a-~]*[\a-~]//g' | \
  tr -d '\r'
```

### Pattern 3: Capture to File
```bash
cd ~/clawd
timeout 120 script -q -c 'claude -p "Your complex task" \
  --allowedTools "Read,Write,Edit,Bash" \
  --dangerously-skip-permissions \
  --output-format text' /tmp/claude_raw.txt 2>&1

# Strip ANSI codes from the script output
perl -pe 's/\e\[[0-9;]*[mGKHF]//g; s/\e\][^\a]*\a//g; s/\e\[[^\a-~]*[\a-~]//g' /tmp/claude_raw.txt | \
  tr -d '\r' | grep -v "^Script " > /tmp/claude_clean.txt
cat /tmp/claude_clean.txt
```

### Helper Function (Add to ~/.bashrc)
```bash
# Claude Code wrapper that provides PTY and strips ANSI
claude_exec() {
  local timeout_sec="${CLAUDE_TIMEOUT:-120}"
  timeout "$timeout_sec" script -q -c "claude $*" /dev/null 2>&1 | \
    perl -pe 's/\e\[[0-9;]*[mGKHF]//g; s/\e\][^\a]*\a//g; s/\e\[[^\a-~]*[\a-~]//g' | \
    tr -d '\r' | head -n -1
}

# Usage:
# claude_exec -p "Your prompt" --output-format text
# CLAUDE_TIMEOUT=300 claude_exec -p "Long task" --allowedTools "Read,Write,Edit,Bash"
```

## ❌ What Does NOT Work
```bash
# These produce NO OUTPUT (require PTY):
claude -p "prompt" --output-format text
claude -p "prompt" 2>&1 | cat
nohup claude -p "prompt" > file.txt &
```

## Key CLI Flags

| Flag | Purpose |
|------|---------|
| `-p` or `--print` | Print mode (non-interactive, required for automation) |
| `--allowedTools "Read,Write,Edit,Bash"` | Auto-approve specified tools without prompting |
| `--dangerously-skip-permissions` | Skip ALL permission prompts (use carefully) |
| `--output-format text` | Plain text output (default) |
| `--output-format json` | Structured JSON with metadata |
| `--output-format stream-json` | Real-time streaming output |
| `--verbose` | Show detailed turn-by-turn output |
| `--model opus/sonnet` | Specify model alias |
| `--continue` | Continue most recent conversation |
| `--resume <session>` | Resume specific session |
| `--max-turns N` | Limit agentic turns |
| `--max-budget-usd N` | Set spending limit |
| `--append-system-prompt "..."` | Add to default prompt (safer than replacing) |
| `--system-prompt "..."` | Replace entire system prompt |

## Important Notes

1. **PTY Required:** Claude Code MUST have a PTY to output - use `script` wrapper
2. **Timing:** Claude Code can take 1-5 minutes for complex tasks
3. **ANSI Codes:** Output contains terminal escape codes - strip with perl
4. **Timeout:** Always use `timeout` to prevent hanging

## Example: Story Architect Invocation (CORRECTED)
```bash
cd ~/clawd

timeout 300 script -q -c 'claude -p "You are the Story Architect. 
Read ~/clawd/scheduler/story-architect/IDENTITY.md.
Create a User Story for [feature] following the template.
Save to ~/clawd/scheduler/stories/[project]/stories/[story-id].md" \
  --allowedTools "Read,Write,Edit,Bash" \
  --dangerously-skip-permissions \
  --model opus \
  --output-format text' /dev/null 2>&1 | \
  perl -pe 's/\e\[[0-9;]*[mGKHF]//g; s/\e\][^\a]*\a//g; s/\e\[[^\a-~]*[\a-~]//g' | \
  tr -d '\r'
```

## Testing Pattern (Quick Verification)
```bash
# Test that Claude Code is working
timeout 60 script -q -c 'claude -p "Reply: OK" --output-format text' /dev/null 2>&1 | grep -o "OK"
# Should output: OK
```

## Debugging
```bash
# Check latest debug log
tail -50 ~/.claude/debug/latest

# Check for AxiosErrors (API issues)
grep -E "AxiosError|ERROR" ~/.claude/debug/latest | tail -20

# Verify credentials
cat ~/.claude/.credentials.json | head -5
```

## Resources
- [Claude Code Docs](https://code.claude.com/docs)
- [CLI Reference](https://code.claude.com/docs/en/cli-usage)
- [Headless/SDK Mode](https://code.claude.com/docs/en/headless)
- [Common Workflows](https://code.claude.com/docs/en/common-workflows)
