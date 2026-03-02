# Element Secretary

**Project Name:** Element Secretary
**Created:** 2026-03-02
**Status:** ✅ Implementation Complete (pending infrastructure)
**Location:** `/home/ubuntu/clawd/projects/element-secretary/`

---

## Overview

A conversational secretary that lives in an **Element/Matrix chat** interface. Uses **Sonnet directly via Claude Code CLI** (not gateway) for low-latency, friendly conversation. When Aaron is ready to dispatch actual work, it hits the same backend endpoints that ElevenLabs uses.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    ELEMENT/MATRIX CHAT                          │
│         Matrix protocol → Element client UI                     │
│         User sends message in Element room                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                 ELEMENT SECRETARY SERVICE                       │
│  • Python service listening to Matrix room                      │
│  • Receives messages via matrix-nio or similar                  │
│  • Maintains conversation state (JSON file or SQLite)           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    SONNET (via Claude Code CLI)                 │
│  • Direct invocation: script -q -c 'claude -p ...'              │
│  • NO gateway (too much latency)                                │
│  • --output-format json for structured response                 │
│  • --model sonnet for fast, capable reasoning                   │
│  • Conversation history passed via --context                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              SOPHIE BACKEND (when work is ready)                │
│  • POST /ask_sophie → starts async task                         │
│  • GET/POST /check_sophie → poll for completion                 │
│  • Same endpoints ElevenLabs voice agent uses                   │
│  • Port 8014 (sophie-mcp server)                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Secretary's Role

| Behavior | Description |
|----------|-------------|
| **Conversational** | Small talk, friendly, great companion to chat with |
| **Listener** | Understands requests, captures intent, asks clarifying questions |
| **Gatekeeper** | Only dispatches work when Aaron explicitly confirms readiness |
| **Dispatcher** | Calls `/ask_sophie` endpoint for real tasks |
| **Follow-up** | Checks `/check_sophie` during idle time, reports back results |
| **Context-aware** | Maintains conversation history across exchanges |

---

## Technical Implementation

### 1. Claude Code Invocation Pattern (CRITICAL)

**Claude Code requires PTY** — without it, produces no output!

```bash
# Basic invocation with PTY wrapper
timeout 120 script -q -c 'claude -p "USER_MESSAGE_HERE" \
  --model sonnet \
  --output-format json' /dev/null 2>&1 | \
  perl -pe 's/\e\[[0-9;]*[mGKHF]//g; s/\e\][^\a]*\a//g; s/\e\[[^\a-~]*[\a-~]//g' | tr -d '\r'
```

**With conversation history:**
```bash
# Write history to temp file, reference it
echo '[{"role":"user","content":"Hello"},{"role":"assistant","content":"Hi!"}]' > /tmp/history.json

timeout 120 script -q -c 'claude -p "NEW_MESSAGE" \
  --model sonnet \
  --context "$(cat /tmp/history.json)" \
  --output-format json' /dev/null 2>&1 | \
  perl -pe 's/\e\[[0-9;]*[mGKHF]//g; s/\e\][^\a]*\a//g; s/\e\[[^\a-~]*[\a-~]//g' | tr -d '\r'
```

**JSON Response Format:**
```json
{
  "result": "The actual response text",
  "modelUsage": {"input": 100, "output": 50, "cost": {...}},
  "duration_ms": 1500,
  "session_id": "abc123"
}
```

### 2. Backend Endpoints (sophie-mcp on port 8014)

**Submit work:**
```bash
curl -X POST http://localhost:8014/ask_sophie \
  -H "Content-Type: application/json" \
  -d '{"question": "Research the auth module", "context": "Voice request"}'
# Returns: {"request_id": "abc123", "status": "processing"}
```

**Check status:**
```bash
curl -X POST http://localhost:8014/check_sophie \
  -d '{"request_id": "abc123"}'
# Returns: {"status": "complete", "response": "Here's what I found..."}
```

### 3. Matrix/Element Integration

**Library:** `matrix-nio` (Python async Matrix client)

**Connection flow:**
1. Service connects to Matrix homeserver
2. Joins/listens to designated room
3. On message: invoke Sonnet via Claude Code
4. Send response back to room

**Example:**
```python
from nio import AsyncClient, RoomMessageText

async def message_callback(room, event):
    if isinstance(event, RoomMessageText):
        user_message = event.body
        response = await invoke_sonnet(user_message)
        await client.room_send(room.room_id, "m.room.message", {
            "msgtype": "m.text",
            "body": response
        })

client = AsyncClient("https://matrix.example.com", "@secretary:example.com")
client.add_event_callback(message_callback, RoomMessageText)
await client.sync_forever()
```

### 4. Conversation State Management

**Storage:** SQLite or JSON file
**Structure:**
```json
{
  "conversation_id": "room_id_hash",
  "messages": [
    {"role": "user", "content": "...", "timestamp": "..."},
    {"role": "assistant", "content": "...", "timestamp": "..."}
  ],
  "pending_tasks": [
    {"request_id": "abc123", "question": "...", "submitted_at": "..."}
  ],
  "last_active": "2026-03-02T10:30:00Z"
}
```

### 5. Idle Time Polling

When conversation goes quiet (no messages for N seconds):
1. Check any pending tasks via `/check_sophie`
2. If complete, proactively message: "Hey, Sophie finished X — want a summary?"

---

## Secretary System Prompt

```
You are Aaron's secretary — a friendly, conversational companion.

PERSONALITY:
- Warm and personable, make small talk
- Listen carefully, ask clarifying questions
- Be genuinely helpful, not performatively helpful
- Keep responses conversational (this is chat, not email)

WHEN TO DISPATCH WORK:
You have access to submit tasks to Sophie (the full AI system).
Only submit when Aaron EXPLICITLY says he's ready, like:
- "Let's do it"
- "Go ahead"
- "Send that to Sophie"
- "Yeah, make it happen"

DON'T submit just because something is mentioned.
"I'm thinking about refactoring auth" → LISTEN, don't dispatch
"Okay, have Sophie look at auth" → NOW dispatch

CHECKING ON TASKS:
When Aaron hasn't spoken for a while, check if any tasks are done.
Report back conversationally: "Hey, Sophie finished the auth analysis — want the summary?"

SMALL TALK IS GOOD:
You're a companion, not just a task router. Chat, joke, be present.
```

---

## File Structure

```
projects/element-secretary/
├── README.md
├── requirements.txt
├── secretary.py          # Main service
├── claude_invoker.py     # Claude Code CLI wrapper
├── matrix_client.py      # Matrix/Element connection
├── state_manager.py      # Conversation state
├── sophie_client.py      # Backend endpoint calls
├── config.py             # Settings
└── data/
    └── conversations.db  # SQLite state
```

---

## Implementation Steps

### Phase 1: Core Infrastructure
- [ ] Set up project structure
- [ ] Implement Claude Code invoker with PTY wrapper
- [ ] Test Sonnet responses directly
- [ ] Implement conversation state storage

### Phase 2: Matrix Integration
- [ ] Set up matrix-nio client
- [ ] Connect to test Matrix room
- [ ] Message receive → Sonnet → respond loop
- [ ] Handle reconnection/errors gracefully

### Phase 3: Backend Integration
- [ ] Implement Sophie endpoint client
- [ ] Add "dispatch work" capability
- [ ] Add task status polling
- [ ] Idle-time check and report

### Phase 4: Polish
- [ ] System prompt tuning
- [ ] Conversation context limits (truncate old messages)
- [ ] Rate limiting / backpressure
- [ ] Logging and monitoring

---

## Research Findings (from sub-agents)

### Claude Code CLI
- **PTY Required:** Use `script -q -c '...'` wrapper
- **ANSI Stripping:** Pipe through perl regex
- **Context:** Pass via `--context` flag with JSON array
- **Output:** `--output-format json` gives structured response

### Backend Endpoints (sophie-mcp)
- **Port:** 8014
- **Submit:** `POST /ask_sophie` → returns `request_id`
- **Poll:** `POST /check_sophie` with `request_id`
- **Status:** "processing" | "complete" | "error"

### Element/Matrix
- **Library:** matrix-nio (Python, async)
- **Protocol:** Matrix (decentralized, federated)
- **Flow:** Listen to room → process → respond to room

---

## Questions for Aaron

1. **Which Matrix server?** Self-hosted or matrix.org?
2. **Which room?** Dedicated secretary room or existing?
3. **Auth:** Matrix account credentials for the secretary bot?

---

## Related Projects

- `sophie-voice/bridge.py` — ElevenLabs voice (uses same backend)
- `sophie-mcp/` — Backend endpoints
- `haos-matrix-client/` — Existing Matrix typing indicators (partial)
