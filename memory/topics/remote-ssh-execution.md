# Remote SSH Command Execution

## The Problem

Plain `ssh user@host "command"` prompts for password interactively, which doesn't work in automated/non-TTY contexts (like agent exec calls).

## Solutions

### 1. sshpass (quick & dirty)
```bash
sshpass -p 'password' ssh -o StrictHostKeyChecking=no user@host "command"
```
- Install: `sudo apt install sshpass`
- Pros: Works immediately with password auth
- Cons: Password in command line (visible in process list)

### 2. SSH Keys (preferred for production)
```bash
# Generate key (if needed)
ssh-keygen -t ed25519 -f ~/.ssh/id_jaekel

# Copy to remote
ssh-copy-id -i ~/.ssh/id_jaekel.pub user@host

# Use without password
ssh -i ~/.ssh/id_jaekel user@host "command"
```

### 3. expect (for complex interactive sessions)
When you need to handle multiple prompts or interactive flows.

## Tips

- `-o StrictHostKeyChecking=no` — skip host key confirmation (first connect)
- `-o BatchMode=yes` — fail instead of prompting (useful for scripts)
- For long commands, consider here-docs or copying a script

## Learned

- [2026-02-04] Discovered this while setting up Jaekel Server access from dev3
