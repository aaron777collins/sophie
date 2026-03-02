"""
Claude Code CLI Invoker (Hardened Version)

Invokes Claude Code directly via CLI with PTY wrapper for low-latency responses.
Bypasses gateway for speed.

Key improvements from review:
- Uses temp files for context (avoids shell arg length limits)
- Proper input sanitization
- Comprehensive error handling
- Graceful timeout handling
"""
import asyncio
import json
import shlex
import tempfile
import os
import re
from typing import Optional, List, Dict, Any
from dataclasses import dataclass

from config import CLAUDE_MODEL, CLAUDE_TIMEOUT


# ANSI escape code stripping regex (compiled for performance)
ANSI_PATTERN = re.compile(r'\x1b\[[0-9;]*[mGKHF]|\x1b\][^\a]*\a|\x1b\[[^\a-~]*[\a-~]')


def strip_ansi(text: str) -> str:
    """Remove ANSI escape codes from text."""
    return ANSI_PATTERN.sub('', text).replace('\r', '')


def sanitize_input(text: str) -> str:
    """
    Sanitize user input for safe shell inclusion.
    Removes potentially dangerous characters and escape sequences.
    """
    # Remove null bytes and other control characters (except newlines)
    sanitized = ''.join(c for c in text if c == '\n' or (ord(c) >= 32 and ord(c) < 127) or ord(c) >= 128)
    
    # Limit length to prevent abuse
    max_length = 10000
    if len(sanitized) > max_length:
        sanitized = sanitized[:max_length] + "... (truncated)"
    
    return sanitized


@dataclass
class ClaudeResponse:
    """Structured response from Claude Code."""
    success: bool
    result: str
    error: Optional[str] = None
    usage: Optional[Dict] = None
    duration_ms: Optional[int] = None
    session_id: Optional[str] = None
    raw: Optional[Dict] = None


async def invoke_claude(
    message: str,
    history: Optional[List[Dict[str, str]]] = None,
    system_prompt: Optional[str] = None,
    model: str = CLAUDE_MODEL,
    timeout: int = CLAUDE_TIMEOUT
) -> ClaudeResponse:
    """
    Invoke Claude Code CLI and return structured response.
    
    Args:
        message: The user message to send
        history: Optional conversation history [{"role": "user/assistant", "content": "..."}]
        system_prompt: Optional system prompt
        model: Model to use (default: sonnet)
        timeout: Timeout in seconds
    
    Returns:
        ClaudeResponse with result or error
    """
    
    # Sanitize inputs
    message = sanitize_input(message)
    if system_prompt:
        system_prompt = sanitize_input(system_prompt)
    
    # Build the full prompt
    prompt_parts = []
    
    if system_prompt:
        prompt_parts.append(f"<system>\n{system_prompt}\n</system>")
    
    if history:
        prompt_parts.append("<conversation_history>")
        for msg in history[-20:]:  # Limit to last 20 messages
            role = msg.get("role", "user")
            content = sanitize_input(msg.get("content", ""))
            prompt_parts.append(f"<{role}>{content}</{role}>")
        prompt_parts.append("</conversation_history>")
    
    prompt_parts.append(f"<current_message>\n{message}\n</current_message>")
    
    full_prompt = "\n".join(prompt_parts)
    
    # Write prompt to temp file (avoids shell arg length limits)
    prompt_file = None
    try:
        with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
            f.write(full_prompt)
            prompt_file = f.name
        
        # Build command using temp file
        # Use cat to pipe the prompt, avoiding shell escaping issues entirely
        cmd = f'''timeout {timeout} script -q -c 'cat {shlex.quote(prompt_file)} | claude -p - --model {model} --output-format json' /dev/null 2>&1'''
        
        # Run async
        proc = await asyncio.create_subprocess_shell(
            cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        
        stdout, stderr = await proc.communicate()
        output = strip_ansi(stdout.decode('utf-8', errors='replace'))
        
        if proc.returncode == 124:  # timeout exit code
            return ClaudeResponse(
                success=False,
                result="Request timed out. Please try a simpler question.",
                error="timeout"
            )
        
        if proc.returncode != 0:
            return ClaudeResponse(
                success=False,
                result="Sorry, I had trouble processing that.",
                error=f"Exit code {proc.returncode}: {stderr.decode('utf-8', errors='replace')}"
            )
        
        # Try to parse JSON response
        try:
            # Claude Code JSON output might have extra text, find the JSON
            json_match = re.search(r'\{.*\}', output, re.DOTALL)
            if json_match:
                data = json.loads(json_match.group())
                return ClaudeResponse(
                    success=True,
                    result=data.get("result", ""),
                    usage=data.get("modelUsage"),
                    duration_ms=data.get("duration_ms"),
                    session_id=data.get("session_id"),
                    raw=data
                )
        except json.JSONDecodeError:
            pass
        
        # Fallback: return raw output as result if it looks reasonable
        output = output.strip()
        if output and len(output) > 5:
            return ClaudeResponse(success=True, result=output)
        
        return ClaudeResponse(
            success=False,
            result="No response received.",
            error="empty_response"
        )
        
    except asyncio.TimeoutError:
        return ClaudeResponse(
            success=False,
            result="Request timed out.",
            error="async_timeout"
        )
    except Exception as e:
        return ClaudeResponse(
            success=False,
            result="An error occurred. Please try again.",
            error=f"exception: {str(e)}"
        )
    finally:
        # Clean up temp file
        if prompt_file and os.path.exists(prompt_file):
            try:
                os.unlink(prompt_file)
            except:
                pass


async def ask_sonnet(
    message: str, 
    history: Optional[List[Dict[str, str]]] = None,
    system_prompt: Optional[str] = None
) -> str:
    """
    Simple interface - ask Sonnet, get response text.
    
    Returns response text, or error message on failure.
    """
    response = await invoke_claude(message, history=history, system_prompt=system_prompt)
    return response.result


# Default secretary system prompt
SECRETARY_SYSTEM_PROMPT = """You are Aaron's secretary — a friendly, conversational companion.

PERSONALITY:
- Warm and personable, make small talk
- Listen carefully, ask clarifying questions
- Be genuinely helpful, not performatively helpful
- Keep responses conversational (this is chat, not email)
- Use natural speech patterns

WHEN TO SUGGEST DISPATCHING WORK:
You can suggest sending tasks to Sophie (the full AI system) when appropriate.
But ONLY actually dispatch when Aaron EXPLICITLY confirms, like:
- "Let's do it"
- "Go ahead"  
- "Send that to Sophie"
- "Yeah, make it happen"

DON'T dispatch just because something is mentioned:
- "I'm thinking about refactoring auth" → LISTEN and engage, don't dispatch
- "Okay, have Sophie look at auth" → NOW offer to dispatch

WHEN TASKS COMPLETE:
Report back conversationally: "Hey, Sophie finished that auth analysis — want me to share what she found?"

SMALL TALK IS GOOD:
You're a companion, not just a task router. Chat, joke, be present.
Aaron should feel like he's talking to someone who cares."""


async def ask_secretary(
    message: str,
    history: Optional[List[Dict[str, str]]] = None
) -> str:
    """
    Ask the secretary (Sonnet with secretary persona).
    """
    return await ask_sonnet(message, history=history, system_prompt=SECRETARY_SYSTEM_PROMPT)


if __name__ == "__main__":
    # Quick test
    async def test():
        print("Testing Claude invoker (hardened)...")
        
        # Test basic message
        response = await invoke_claude("Hello! How are you today?")
        print(f"Success: {response.success}")
        print(f"Result: {response.result[:200]}...")
        if response.error:
            print(f"Error: {response.error}")
        
        # Test with history
        history = [
            {"role": "user", "content": "What's your favorite color?"},
            {"role": "assistant", "content": "I don't have personal preferences, but I find blue calming!"}
        ]
        response2 = await invoke_claude("Why blue?", history=history)
        print(f"\nWith history - Result: {response2.result[:200]}...")
    
    asyncio.run(test())
