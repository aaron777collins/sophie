# Claude Code CLI Invocation

**Last Updated:** 2026-02-21

## Problem Discovered
- [2026-02-21 12:30 EST] When running Claude Code via Clawdbot's `exec` tool, the process gets stopped (SIGSTOP signal)
- The process appears in state "T (stopped)" and waits on `do_signal_stop`
- Direct invocation times out without producing output

## Root Cause
The exec tool runs commands in a way that sends SIGSTOP or similar signals to subprocesses, causing Claude Code to halt.

## Working Solution
Use `nohup` to run Claude Code in the background, preventing it from being stopped.

### Pattern 1: Simple Query
```bash
cd /tmp
nohup claude -p "Say Hello" --output-format text > /tmp/output.txt 2>&1 &
```

### Pattern 2: File Creation with Full Permissions
```bash
cd ~/clawd
nohup claude -p "Create a file at path/to/file.md with content..." \
  --allowedTools "Read,Write,Edit,Bash" \
  --dangerously-skip-permissions \
  --output-format text > /tmp/output.txt 2>&1 &
```

### Pattern 3: Wait for Completion
```bash
# Start Claude
nohup claude -p "Your task" --output-format text > /tmp/output.txt 2>&1 &
CLAUDE_PID=$!

# Wait for completion
while ps -p $CLAUDE_PID > /dev/null 2>&1; do
  sleep 10
done

# Get results
cat /tmp/output.txt
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

## System Prompt Customization

| Flag | Behavior |
|------|----------|
| `--system-prompt "..."` | Replace entire system prompt |
| `--append-system-prompt "..."` | Add to default prompt (safer) |

## Important Notes

1. **Timing:** Claude Code can take 1-5 minutes for complex tasks
2. **Output buffering:** Output file may be empty until completion
3. **Process monitoring:** Check with `ps -p PID` or `pgrep -f "claude -p"`
4. **Network:** Process shows established connections when actively working

## Example: Story Architect Invocation
```bash
cd ~/clawd

nohup claude -p "You are the Story Architect. 
Read ~/clawd/scheduler/story-architect/IDENTITY.md.
Create a User Story for [feature] following the template at ~/clawd/scheduler/stories/templates/USER-STORY-TEMPLATE.md.
Save to ~/clawd/scheduler/stories/[project]/stories/[story-id].md" \
  --allowedTools "Read,Write,Edit,Bash" \
  --dangerously-skip-permissions \
  --model opus \
  --output-format text > /tmp/story-architect-output.txt 2>&1 &
```

## Resources
- [Claude Code Docs](https://code.claude.com/docs)
- [CLI Reference](https://code.claude.com/docs/en/cli-reference)
- [Headless Mode](https://code.claude.com/docs/en/headless)
- [Common Workflows](https://code.claude.com/docs/en/common-workflows)
