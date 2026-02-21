# Research Patterns

**Last Updated:** 2026-02-21

## What is Research?

Research is a regular task where I investigate how to properly use tools, APIs, or systems by:
1. Reading documentation (web_fetch)
2. Testing approaches
3. Documenting findings
4. Creating reusable patterns

## When to Research

- [2026-02-21] Aaron: "This should be a regular task (research) and remember it"
- When something doesn't work as expected
- When integrating new tools or services
- When behavior seems inconsistent
- Before implementing complex features

## Research Process

### 1. Gather Information
```
web_fetch → Official documentation
exec → Check --help, man pages, version info
memory_search → Previous findings
```

### 2. Test Systematically
```
Start simple → Complex
Isolate variables → One change at a time
Document each attempt → What worked, what didn't
```

### 3. Document Findings
```
memory/topics/{tool-name}.md
- Problem discovered
- Root cause
- Working solution
- Key patterns
- Examples
```

### 4. Update References
```
TOOLS.md → If it's infrastructure I use
AGENTS.md → If it affects agent behavior
Relevant identity files → If role-specific
```

## Completed Research

### Claude Code CLI (2026-02-21)
- **Problem:** Claude Code produces no output when run without a PTY
- **Initial theory:** SIGSTOP signals (WRONG)
- **Root cause:** Claude Code requires a pseudo-terminal to write stdout
- **Solution:** Use `script -q -c 'command' /dev/null` to provide PTY, then strip ANSI codes
- **Verified:** Working as of 2026-02-21 13:50 EST
- **Docs:** `memory/topics/claude-code-cli-invocation.md`

## Research Queue

*(Add topics here that need investigation)*

---

*Research is proactive learning. When something breaks, don't just fix it — understand why and document it.*
