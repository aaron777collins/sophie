## Claude Code Invocation Patterns

### 1. Check TOOLS.md for Existing Patterns

Looking at `~/clawd/TOOLS.md`, I found the following relevant information about using the Claude Code CLI:

**PTY Requirement (Critical):**
Claude Code requires a PTY (pseudo-terminal) to output properly. Without a PTY, it runs but produces no output. The recommended pattern is to use the `script` command to provide a PTY:

```bash
timeout 60 script -q -c 'claude -p "your question" --output-format text' /dev/null 2>&1 | \
  perl -pe 's/\e\[[0-9;]*[mGKHF]//g; s/\e\][^\a]*\a//g; s/\e\[[^\a-~]*[\a-~]//g' | tr -d '\r'
```

This runs Claude Code within a PTY, and the `perl` command strips ANSI escape codes from the output.

**Key Flags:**
- `-p`: Print mode (non-interactive)
- `--allowedTools`: Auto-approve tool access
- `--dangerously-skip-permissions`: Skip permission prompts
- `--output-format json`: Get structured JSON output
- `--model opus/sonnet`: Select the desired model

### 2. Passing Conversation History

To pass conversation history to Claude Code, you can use the `--context` flag to provide a list of previous messages. The format should be a JSON array of objects, where each object has `role` and `content` fields:

```json
[
  {"role": "user", "content": "Hello, how are you?"},
  {"role": "assistant", "content": "I'm doing well, thank you for asking."},
  {"role": "user", "content": "Can you help me with something?"}
]
```

This context will be used by the model to maintain conversation state and provide a more coherent response.

### 3. JSON Output Parsing

When using `--output-format json`, the response will be in a structured JSON format with the following fields:

- `result`: The actual response from the model
- `modelUsage`: Information about the model usage, including tokens and cost
- `duration_ms`: The latency of the API call
- `session_id`: The unique ID of the conversation session

You can parse this JSON in your code to extract the relevant information, such as the response text and metadata.

### 4. Streaming vs. Non-Streaming

By default, Claude Code will return the full response at once (non-streaming). If you need to handle streaming responses, you can use the `--stream` flag. This will return the response in a streaming format, where each chunk of text is separated by a newline character (`\n`).

To handle streaming, you'll need to continuously read the output and process each chunk as it comes in. This can be useful for building a real-time conversational interface, where you want to display the response as it's being generated.

**Summary:**
1. Use `script` to provide a PTY, and `perl` to strip ANSI codes for reliable Claude Code CLI output.
2. Pass conversation history using the `--context` flag with a JSON array of messages.
3. Parse the `--output-format json` response to extract the model's text output and metadata.
4. Use `--stream` to handle streaming responses for real-time conversational interfaces.