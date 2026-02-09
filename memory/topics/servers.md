# Servers

Remote servers Aaron uses, with access details.

---

## dev2.aaroncollins.info

- **Added:** [2026-02-11 13:52 EST]
- **Hostname:** vps-d12e2197
- **OS:** Ubuntu 24.04 (Linux 6.8.0-86-generic x86_64)
- **User:** `ubuntu` (lowercase!)
- **SSH Key:** `~/.ssh/id_dev2` (from dev3)
- **Config Alias:** `ssh dev2`

### Access from dev3
```bash
ssh dev2              # uses config alias
ssh -i ~/.ssh/id_dev2 ubuntu@dev2.aaroncollins.info  # explicit
```

### Setup Notes
- [2026-02-11 13:52 EST] Initial SSH setup by Sophie
- Password provided was for user 'ubuntu' (lowercase), not 'Ubuntu'
- ED25519 key generated and installed for passwordless access
- SSH config alias added for convenience

---

## dev3 (Current Machine)

This is where Sophie runs. The main workspace.

- **Hostname:** dev3
- **User:** ubuntu
- **Workspace:** /home/ubuntu/clawd

---
