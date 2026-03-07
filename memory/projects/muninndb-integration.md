# MuninnDB Integration Project

**Created:** [2026-03-07 16:45 EST]
**Status:** 🚀 ACTIVE
**Priority:** HIGH
**Requested by:** Aaron Collins

---

## Vision: Three-Layer Memory Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SOPHIE'S MEMORY SYSTEM                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Layer 1: NOTES (Existing)                                          │
│  ├── Hierarchical markdown in memory/                               │
│  ├── 357 projects, 20+ topics, daily logs                          │
│  ├── Human-readable, version controlled                             │
│  └── Source of truth for persistent knowledge                       │
│                                                                     │
│  Layer 2: RAG SEARCH (Existing)                                     │
│  ├── Clawdbot memorySearch with local embeddings                   │
│  ├── Hybrid BM25 + vector search                                    │
│  ├── memory_search/memory_get tools                                 │
│  └── Fast semantic lookup across all markdown                       │
│                                                                     │
│  Layer 3: COGNITIVE MEMORY (NEW - MuninnDB)                         │
│  ├── Memory decay (recent > old)                                    │
│  ├── Confidence levels (certainty tracking)                         │
│  ├── Hebbian learning (auto-association from usage)                │
│  ├── Proactive triggers (push relevant memories)                    │
│  └── "Why" explainability (math, not LLM)                           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Installation & Setup

### Task 1.1: Install MuninnDB Binary
- **Command:** `curl -fsSL https://muninndb.com/install.sh | sh`
- **Expected:** Binary at `/usr/local/bin/muninn`
- **Contingency:** If install fails, manual download from GitHub releases

### Task 1.2: Initialize MuninnDB
- **Command:** `muninn init`
- **Expected:** 
  - MCP configuration auto-generated
  - Server running on ports 8475 (REST) / 8476 (Web UI)
  - Bearer token generated
- **Contingency:** Manual config if auto-detect fails

### Task 1.3: Verify Dashboard
- **URL:** http://localhost:8476
- **Verify:** Decay charts, relationship graphs, activation log visible

---

## Phase 2: Clawdbot Integration

### Task 2.1: MCP Server Registration
MuninnDB exposes 19 MCP tools. Options:
1. **Native MCP** — If Clawdbot supports MCP servers
2. **Wrapper skill** — Create a skill that wraps MuninnDB REST API
3. **Direct REST** — Use curl/fetch from agent scripts

**Approach:** Create a Clawdbot skill wrapper for MuninnDB

### Task 2.2: Create MuninnDB Skill
Location: `~/clawd/skills/muninndb/`
```
muninndb/
├── SKILL.md          # How agents use MuninnDB
├── scripts/
│   ├── store.sh      # Store memory
│   ├── activate.sh   # Retrieve memories
│   ├── decay.sh      # Check decay status
│   └── associate.sh  # Create associations
└── README.md
```

### Task 2.3: Bearer Token Management
- Store token in `~/clawd/data/muninndb-token.secret`
- Reference from skill scripts
- **Security:** Don't commit to git

---

## Phase 3: Memory Sync Strategy

### What Goes Where?

| Memory Type | Layer | Why |
|-------------|-------|-----|
| Project details | Notes (markdown) | Long-term reference |
| Technical learnings | Notes + MuninnDB | Need recall + decay |
| Conversation insights | MuninnDB | Temporal relevance matters |
| People preferences | Notes + MuninnDB | Stable + associative |
| Task history | MuninnDB | Decay naturally |
| Key decisions | Notes | Audit trail |

### Sync Triggers
1. **Session end** — Summarize key learnings → MuninnDB
2. **Markdown update** — Extract key facts → MuninnDB
3. **Periodic cron** — Refresh associations

---

## Phase 4: Documentation Updates

### Files to Update
1. **AGENTS.md** — Add Layer 3 memory section
2. **TOOLS.md** — Add MuninnDB skill reference
3. **IDENTITY.md** — Note cognitive memory capability
4. **memory/INDEX.md** — Add MuninnDB layer
5. **Scheduler docs** — How sub-agents use MuninnDB

### Sub-Agent Training
All management hierarchy agents need:
- Understanding of 3-layer memory
- When to use MuninnDB vs markdown
- How to store with confidence levels
- How to query with temporal priority

---

## Phase 5: Cron Jobs

### Proposed Jobs

| Job | Schedule | Purpose |
|-----|----------|---------|
| `muninn-daily-summary` | Daily 2am | Extract daily log insights → MuninnDB |
| `muninn-decay-check` | Weekly | Review decayed memories, archive if needed |
| `muninn-association-audit` | Monthly | Check Hebbian associations quality |

---

## Dependencies

```
┌─────────────────────────────────────────────────────────────────────┐
│ DEPENDENCY GRAPH                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Phase 1.1 (Install)                                                │
│      ↓                                                              │
│  Phase 1.2 (Init) ──→ Phase 1.3 (Verify)                            │
│      ↓                                                              │
│  Phase 2.1 (MCP Research)                                           │
│      ↓                                                              │
│  Phase 2.2 (Skill Creation) ←── Phase 2.3 (Token)                   │
│      ↓                                                              │
│  Phase 3 (Sync Strategy)                                            │
│      ↓                                                              │
│  Phase 4 (Docs) + Phase 5 (Cron)                                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Contingencies

### If MuninnDB fails to install
- Check architecture compatibility (amd64/arm64)
- Manual binary download from GitHub
- Build from source if needed

### If MCP integration not possible
- Use REST API directly (port 8475)
- Create shell wrapper scripts
- Call via exec tool

### If port conflicts
- MuninnDB uses 8475/8476
- Check: `lsof -i :8475 :8476`
- Configure alternate ports if needed

### If memory sync causes issues
- Start with manual sync only
- Add automated sync gradually
- Feature flag for auto-sync

---

## Success Criteria

- [ ] MuninnDB installed and running
- [ ] Dashboard accessible at localhost:8476
- [ ] Skill created and documented
- [ ] AGENTS.md updated with 3-layer memory
- [ ] Sub-agents can store/retrieve memories
- [ ] At least 10 memories stored successfully
- [ ] Association auto-created from usage
- [ ] Cron job for daily summary active

---

## Team Assignment

| Role | Task | Model |
|------|------|-------|
| Sophie (Main) | Coordination, oversight | Opus |
| Sub-agent 1 | Installation & setup | Sonnet |
| Sub-agent 2 | Skill creation | Sonnet |
| Sub-agent 3 | Documentation updates | Sonnet |
| Sub-agent 4 | Cron job setup | Haiku |

---

## Progress Log

- [2026-03-07 16:45 EST] Project created, plan drafted
- [2026-03-07 16:45 EST] Spawning sub-agents for execution

