# MuninnDB Skill

**Layer 3 Cognitive Memory for Clawdbot**

This skill provides integration with MuninnDB, a cognitive memory database that adds biological-inspired memory features to Sophie's existing memory system.

## Quick Start

```bash
# Check system status
~/clawd/skills/muninndb/scripts/status.sh

# Store a memory
~/clawd/skills/muninndb/scripts/store.sh \
  --concept "Important Learning" \
  --content "Key insight or knowledge to remember" \
  --tags "learning,important" \
  --confidence 0.9

# List recent memories
~/clawd/skills/muninndb/scripts/list.sh --recent 10

# Search memories (requires embeddings configuration)
~/clawd/skills/muninndb/scripts/activate.sh --query "search terms"
```

## Files

- **SKILL.md** — Complete documentation and usage guide
- **scripts/store.sh** — Store memories with concept, content, tags, confidence
- **scripts/list.sh** — List recent memories from database
- **scripts/status.sh** — Check MuninnDB server status and connectivity  
- **scripts/activate.sh** — Search/activate memories (requires embeddings)

## System Requirements

- MuninnDB server running on localhost:8475
- Valid API key stored in `~/clawd/data/muninndb-token.secret`
- Web UI available at http://localhost:8476

## Current Limitations

- **Semantic search disabled** — Requires embeddings configuration for activate.sh
- **Local only** — MuninnDB runs on localhost, not accessible externally
- **Single vault** — Currently uses "default" vault

## Integration with Sophie's Memory

This provides Layer 3 (Cognitive Memory) in Sophie's three-layer memory architecture:

1. **Layer 1: Notes** — Markdown files for long-term reference
2. **Layer 2: RAG Search** — Semantic search across markdown
3. **Layer 3: Cognitive Memory** — Temporal relevance, confidence tracking, associations

See SKILL.md for complete integration guidelines and when to use each layer.