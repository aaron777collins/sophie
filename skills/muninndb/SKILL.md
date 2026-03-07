# MuninnDB Skill - Cognitive Memory (Layer 3)

**Created:** [2026-03-07 21:43 EST]
**Purpose:** MuninnDB integration for Clawdbot's Layer 3 cognitive memory
**Server:** localhost:8475 (REST), localhost:8476 (Web UI), localhost:8750 (MCP)

---

## What is MuninnDB?

MuninnDB is a **cognitive memory database** that adds biological-inspired memory features to Sophie's existing memory system. It implements:

- **Memory decay** — recent memories are stronger than old ones
- **Confidence tracking** — memories have certainty levels that affect recall
- **Hebbian learning** — frequently accessed memories strengthen their associations
- **Proactive activation** — relevant memories surface automatically during similar contexts
- **Mathematical explainability** — "why" this memory was recalled (not LLM guessing)

---

## Three-Layer Memory Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SOPHIE'S MEMORY SYSTEM                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Layer 1: NOTES (markdown files)                                    │
│  ├── Hierarchical organization in memory/                           │
│  ├── Human-readable, version controlled                             │
│  ├── Long-term reference knowledge                                  │
│  └── Source of truth for decisions and facts                        │
│                                                                     │
│  Layer 2: RAG SEARCH (Clawdbot semantic)                           │
│  ├── BM25 + vector search across markdown                          │
│  ├── Fast semantic lookup via memory_search tool                   │
│  ├── Context-aware retrieval                                        │
│  └── Query expansion and ranking                                    │
│                                                                     │
│  Layer 3: COGNITIVE MEMORY (MuninnDB) ←── THIS SKILL                │
│  ├── Temporal relevance (decay over time)                          │
│  ├── Confidence-weighted recall                                     │
│  ├── Auto-association from usage patterns                          │
│  ├── Context-triggered activation                                   │
│  └── Mathematical retrieval scoring                                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## When to Use Which Layer

### Layer 1 (Markdown Notes) — Use For:
- **Project documentation** — Architecture, requirements, decisions
- **Reference knowledge** — URLs, credentials, procedures
- **Long-term facts** — Things that don't change or decay
- **Audit trails** — What happened and when
- **Shared knowledge** — Information others need to read

**Example:** "Aaron prefers Opus for complex reasoning tasks"

### Layer 2 (RAG Search) — Use For:
- **Finding existing information** — "Where did we document X?"
- **Semantic queries** — "Anything about authentication problems?"
- **Cross-project connections** — Related work across different areas
- **Large corpus search** — When you need comprehensive results

**Example:** `memory_search "OAuth integration challenges"`

### Layer 3 (MuninnDB) — Use For:
- **Contextual insights** — "What's relevant to this conversation?"
- **Recent learnings** — Fresh knowledge that may become outdated
- **Person preferences** — Behavioral patterns that might change
- **Temporary state** — Current project focus, active concerns
- **Usage patterns** — What topics/tools get used together

**Example:** "Aaron mentioned being frustrated with Chrome automation last week"

---

## Core MuninnDB Concepts

### 1. Memory Storage
Every memory has:
- **Concept** — What this memory is about (like a title)
- **Content** — The actual information/knowledge  
- **Tags** — Categorical labels for organization
- **Confidence** — How certain we are (0.0 to 1.0)
- **Timestamp** — When this was learned

### 2. Memory Decay
- Recent memories have higher **activation strength**
- Old memories decay over time (configurable half-life)
- Frequently accessed memories decay slower
- Critical memories can be marked as non-decaying

### 3. Association Learning
- Memories accessed together strengthen their connections
- **Hebbian learning** — "neurons that fire together, wire together"
- Associations help with context-based recall
- Manual associations can be created explicitly

### 4. Activation (Recall)
- Query triggers relevant memories based on:
  - Semantic similarity (if embeddings enabled)
  - Keyword matching
  - Association strength
  - Temporal relevance (decay)
  - Confidence levels

---

## Key Commands & Scripts

### Store a Memory
```bash
~/clawd/skills/muninndb/scripts/store.sh \
  --concept "Aaron's Chrome Extension Feedback" \
  --content "Aaron said the Chrome extension relay is unreliable and basically never works. Use Playwright first." \
  --tags "automation,chrome,feedback,tools" \
  --confidence 0.9
```

### Activate Relevant Memories
```bash
~/clawd/skills/muninndb/scripts/activate.sh \
  --query "browser automation issues" \
  --limit 5
```

### Check MuninnDB Status  
```bash
~/clawd/skills/muninndb/scripts/status.sh
```

### List Recent Memories
```bash
~/clawd/skills/muninndb/scripts/list.sh --recent 10
```

---

## Common Usage Patterns

### 1. Session Start — Context Loading
```bash
# Get memories relevant to current conversation/project
activate.sh --query "Aaron feedback browser automation" --limit 3
activate.sh --query "current project HAOS debugging" --limit 5
```

### 2. Learning — Store New Insights
```bash
# Store something Aaron mentioned
store.sh \
  --concept "Aaron's Debugging Preference" \
  --content "Aaron prefers step-by-step debugging with explicit evidence over assumptions" \
  --tags "aaron,debugging,methodology" \
  --confidence 0.8

# Store technical learning
store.sh \
  --concept "PostgreSQL Connection Pool Issue" \
  --content "Connection pool exhaustion in HAOS happens when async queries don't release connections properly" \
  --tags "haos,postgresql,debugging,performance" \
  --confidence 0.9
```

### 3. Context Triggers — During Work
```bash
# Working on authentication? Get relevant memories
activate.sh --query "authentication OAuth security" --limit 3

# Debugging something? Recall similar issues  
activate.sh --query "debugging connection timeout postgres" --limit 5
```

### 4. Session End — Store Key Insights
```bash
# Store the most important things learned this session
store.sh \
  --concept "HAOS Database Issue Resolution" \
  --content "Fixed connection pool exhaustion by adding proper connection.release() calls in async/await blocks" \
  --tags "haos,fix,postgresql,async" \
  --confidence 1.0
```

---

## Integration Guidelines

### For Sub-Agents
When spawned for work:
1. **Load context** — Use `activate.sh` with relevant query terms
2. **Store learnings** — Use `store.sh` for important discoveries
3. **Update confidence** — High confidence (0.9+) for verified facts, lower for hunches

### For Main Session (Sophie)
1. **Session start** — Always check for relevant memories
2. **Conversation insights** — Store Aaron's preferences, feedback, concerns
3. **Technical discoveries** — Store solutions, workarounds, gotchas
4. **Session end** — Store summary of key learnings

### Confidence Levels
- **1.0** — Verified facts, explicit instructions from Aaron
- **0.9** — High confidence, multiple confirmations
- **0.7** — Reasonable confidence, seems reliable  
- **0.5** — Uncertain, needs verification
- **0.3** — Hunch or speculation

---

## API Reference

### REST API Base
- **URL:** `http://localhost:8475/api/v1/`
- **Auth:** `Authorization: Bearer {token}`
- **Token:** Read from `~/clawd/data/muninndb-token.secret`

### Key Endpoints
- **POST /memory** — Store new memory
- **POST /activate** — Retrieve relevant memories  
- **GET /memory/{id}** — Get specific memory
- **PUT /memory/{id}** — Update memory
- **DELETE /memory/{id}** — Delete memory
- **POST /association** — Create manual association
- **GET /health** — Server health check

---

## Error Handling

### Common Issues
1. **Server not running** — Check `muninn status`, restart with `muninn start`
2. **Authentication failed** — Verify token in `~/clawd/data/muninndb-token.secret`
3. **404 errors** — Check endpoint paths have `/api/v1/` prefix
4. **Empty results** — Low confidence threshold, try broader queries

### Troubleshooting
```bash
# Check server status
muninn status

# View recent logs  
muninn logs --no-follow

# Test basic connectivity
curl http://localhost:8475/api/health

# Test with authentication
curl -H "Authorization: Bearer $(cat ~/clawd/data/muninndb-token.secret)" \
     http://localhost:8475/api/v1/memory
```

---

## Security Notes

- **Bearer token** stored in `~/clawd/data/muninndb-token.secret`
- **Not committed to git** — token is machine-specific
- **Local only** — MuninnDB runs on localhost, not exposed externally
- **Vault access** — Requires API key for memory operations

---

## Web UI Access

**URL:** http://localhost:8476

The web dashboard provides:
- **Memory browser** — Search and view all stored memories
- **Decay visualization** — Charts showing memory strength over time
- **Association graphs** — Network view of memory connections
- **Activation logs** — History of memory retrievals
- **Vault management** — Configure memory vaults and access

---

## Examples & Templates

### Store User Preference
```bash
store.sh \
  --concept "Aaron's Communication Style" \
  --content "Aaron prefers direct, specific feedback over verbose explanations. Get to the point quickly." \
  --tags "aaron,communication,preference" \
  --confidence 0.8
```

### Store Technical Solution
```bash
store.sh \
  --concept "HAOS Docker Memory Limit Fix" \
  --content "Increased Docker memory limit to 4GB using docker-compose.override.yml with mem_limit: 4g" \
  --tags "haos,docker,memory,fix,devops" \
  --confidence 1.0
```

### Store Debugging Discovery
```bash
store.sh \
  --concept "Vite HMR Breaking on File Moves" \
  --content "Moving files while Vite dev server is running breaks HMR. Restart dev server after file moves." \
  --tags "vite,hmr,development,gotcha" \
  --confidence 0.9
```

---

## Maintenance

### Daily Maintenance
- Check `muninn status` if memory operations fail
- Monitor memory count growth via Web UI
- Review high-confidence memories for accuracy

### Weekly Maintenance  
- Review decayed memories for archival
- Check association quality in Web UI
- Clean up low-confidence memories if needed

### Monthly Maintenance
- Export backup via `muninn backup`
- Review memory organization and tagging
- Analyze usage patterns for improvement

---

**Last Updated:** [2026-03-07 21:43 EST]
**Status:** Active, ready for use
**Dependencies:** MuninnDB server running on localhost:8475