
## CI/CD Checking Protocol
[2026-02-20 12:15 EST] **Aaron Feedback:** We were neglecting CI/CD errors during development. This is now mandatory.

### Non-Negotiable Rule
After pushing ANY code changes, check CI/CD status:
```bash
gh run list -L 5          # Check recent runs
gh run view <id> --log-failed  # If failures, see what broke
```

**CI failing = task NOT complete.** Fix before claiming done.

### Added to Documentation
- AGENTS.md: CI/CD Protocol section
- scheduler/workers/IDENTITY.md: CI/CD checking in evidence requirements
