# Element Secretary

A conversational secretary that lives in Element/Matrix chat. Uses Sonnet (via Claude Code CLI) for fast, friendly conversation. Dispatches work to Sophie backend when requested.

## Architecture

```
Element Chat (Matrix) → Secretary Service → Sonnet (Claude Code)
                                         ↓
                              Sophie Backend (MCP)
```

## Features

- **Conversational**: Small talk, friendly, genuinely helpful
- **Smart dispatch**: Only sends work when explicitly confirmed
- **Async polling**: Checks on Sophie tasks during idle time
- **Context-aware**: Maintains conversation history
- **Fast**: Direct Claude Code invocation (no gateway latency)

## Setup

### 1. Install dependencies

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your settings
```

### 3. Run

```bash
python secretary.py
```

## Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `MATRIX_HOMESERVER` | Matrix server URL | `https://matrix.example.com` |
| `MATRIX_USER_ID` | Bot user ID | `@secretary:example.com` |
| `MATRIX_PASSWORD` | Bot password | - |
| `MATRIX_ROOM_ID` | Room to listen in | - |
| `SOPHIE_MCP_URL` | Sophie backend URL | `http://localhost:8014` |
| `SOPHIE_MCP_SECRET` | Sophie API secret | - |
| `CLAUDE_MODEL` | Model for conversation | `sonnet` |
| `CLAUDE_TIMEOUT` | Timeout in seconds | `120` |
| `MAX_HISTORY_MESSAGES` | Conversation memory | `20` |
| `IDLE_CHECK_SECONDS` | Task check interval | `60` |

## How It Works

1. **Message arrives** in Element room
2. **Secretary (Sonnet)** generates conversational response
3. **User confirms** dispatch → task sent to Sophie
4. **Idle checker** polls for completed tasks
5. **Results reported** back to Element chat

## Example Interaction

```
You: Hey, thinking about the auth module
Secretary: What's on your mind about it?

You: The token refresh logic feels messy
Secretary: Yeah, that can get complicated. What specifically is bothering you?

You: It's scattered across multiple files
Secretary: Sounds like it could use some consolidation. Want me to have Sophie analyze the auth code and suggest a cleaner structure?

You: Yeah, go ahead
Secretary: Got it! I've sent that to Sophie. I'll let you know when she's done.

[... later ...]

Secretary: Hey, Sophie finished working on that auth analysis. Here's what she found: [response]
```

## Files

- `secretary.py` - Main service
- `claude_invoker.py` - Claude Code CLI wrapper (with PTY)
- `matrix_client.py` - Matrix/Element connection
- `state_manager.py` - Conversation persistence (SQLite)
- `sophie_client.py` - Backend endpoint client
- `config.py` - Configuration

## Related

- `sophie-mcp/` - Backend endpoints (port 8014)
- `sophie-voice/` - ElevenLabs voice (uses same backend)
