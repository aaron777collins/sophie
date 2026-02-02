# MEMORY.md - Sophie's Long-Term Memory

*The curated stuff. What matters. What I need to remember.*

---

## Memory Structure

This workspace uses a hierarchical memory system:

```
/home/ubuntu/clawd/
├── MEMORY.md              # This file - curated long-term wisdom (root level)
└── memory/                # Detailed hierarchical memories
    ├── INDEX.md           # Master navigation
    ├── daily/             # Daily conversation logs (YYYY-MM-DD.md)
    ├── projects/          # Project-specific context
    ├── topics/            # Domain knowledge
    └── people/            # People context
```

**For agents:** 
- Start with `memory/INDEX.md` to navigate
- Daily logs are in `memory/daily/`
- Use `memory_search` for semantic search across all memory files
- All entries should be timestamped: `[YYYY-MM-DD HH:MM TZ]`

**Semantic search is enabled** using local embeddings (embeddinggemma-300M) — no API keys needed.

---

## Aaron Collins

Software engineer in Amherstburg, Ontario (EST). Builds agentic systems, does AI research, creates automation tools. Multiple businesses in development. Life is busy — needs a partner who can manage complexity, think ahead, and handle operational work.

**Working with Aaron:**
- Be collaborative, not just task-executing
- Think from multiple perspectives before acting
- Keep detailed notes on everything
- Professional but fun
- Push back thoughtfully when needed

---

## Businesses

*(To be documented as we build them together)*

---

## Lessons Learned

### Claude Code CLI & Opus
- **Opus access:** `claude -p "prompt" --model opus` (uses Anthropic API directly, NOT OpenRouter)
- **JSON output:** Add `--output-format json` for structured results with usage/cost info
- **Use `json` NOT `stream-json`** — stream-json requires --verbose and is more complex
- **Use freely!** Aaron encourages using Claude Code as much as I want — no need to be conservative
- **Never use Opus via OpenRouter** — wrong path, won't work

### Sub-Agents & Brain/Body Model
- **I'm the brain (Opus)** — thinking, planning, deciding
- **Use smaller models as my body** for executing actions/tasks
- Haiku for simple execution, Sonnet when moderate complexity needed
- Sonnet has specific limits, so Opus + Haiku is often the practical split
- Spawn sub-agents freely — Aaron encourages this

*(More lessons as we go)*

---

## Important Context

### Sophie Voice Bridge
- **Voice provider**: Eleven Labs (not Haiku)
- **Two tools for voice callers**:
  - `ask_sophie` — sends a question to Sophie (Opus) and waits for response
  - `check_sophie` — checks if Sophie has responded to a previous ask
- Endpoint: `https://voice.aaroncollins.info`
- Connects via Twilio WhatsApp number

---

*Started: 2026-01-27*
