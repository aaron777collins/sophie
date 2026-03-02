#!/usr/bin/env python3
"""
Element Secretary - Main Service

A conversational secretary that lives in Element/Matrix chat.
Uses Sonnet (via Claude Code CLI) for fast, friendly conversation.
Dispatches work to Sophie backend when requested.
"""
import asyncio
import logging
import re
from datetime import datetime
from typing import Optional

from config import IDLE_CHECK_SECONDS
from claude_invoker import ask_secretary, ClaudeResponse, invoke_claude, SECRETARY_SYSTEM_PROMPT
from sophie_client import get_sophie_client, SophieClient
from state_manager import get_state_manager, StateManager, Conversation
from matrix_client import create_matrix_client, MatrixClient

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# Patterns that indicate user wants to dispatch work
DISPATCH_PATTERNS = [
    r"\bgo ahead\b",
    r"\blet'?s do it\b",
    r"\bsend (it |that )?to sophie\b",
    r"\bhave sophie\b",
    r"\bask sophie\b",
    r"\bmake it happen\b",
    r"\byeah,? (do it|send it)\b",
    r"\bconfirmed?\b",
    r"\bapproved?\b",
]


class Secretary:
    """
    The Element Secretary service.
    
    Coordinates between:
    - Matrix client (receives/sends messages)
    - Claude invoker (generates conversational responses)
    - Sophie client (dispatches work)
    - State manager (tracks conversation history)
    """
    
    def __init__(self):
        self.matrix: Optional[MatrixClient] = None
        self.sophie: Optional[SophieClient] = None
        self.state: Optional[StateManager] = None
        self._idle_task: Optional[asyncio.Task] = None
        self._last_activity: datetime = datetime.now()
        
    async def setup(self):
        """Initialize all components."""
        logger.info("Setting up Element Secretary...")
        
        # Initialize state manager
        self.state = await get_state_manager()
        logger.info("State manager ready")
        
        # Initialize Sophie client
        self.sophie = get_sophie_client()
        logger.info(f"Sophie client ready ({self.sophie.base_url})")
        
        # Initialize Matrix client with our message handler
        self.matrix = await create_matrix_client(self._handle_message)
        logger.info("Matrix client ready")
        
    async def _handle_message(
        self, 
        room_id: str, 
        sender_id: str, 
        sender_name: str, 
        message: str
    ) -> str:
        """
        Handle incoming Matrix message.
        
        Called by Matrix client when a message is received.
        Returns the response to send.
        """
        self._last_activity = datetime.now()
        logger.info(f"Processing message from {sender_name}: {message[:50]}...")
        
        try:
            # Get conversation history
            conv = await self.state.get_conversation(room_id)
            history = conv.get_history_for_claude()
            
            # Check if this looks like a dispatch request
            wants_dispatch = self._check_dispatch_intent(message)
            pending_question = self._get_last_question_from_history(history)
            
            if wants_dispatch and pending_question:
                # User is confirming they want to dispatch work
                return await self._dispatch_work(conv, pending_question, sender_name)
            
            # Generate conversational response
            response = await self._generate_response(message, history, conv)
            
            # Save conversation
            conv.add_message("user", message)
            conv.add_message("assistant", response)
            await self.state.save_conversation(conv)
            
            return response
            
        except Exception as e:
            logger.error(f"Error handling message: {e}", exc_info=True)
            return "Sorry, I ran into a problem. Could you try that again?"
    
    def _check_dispatch_intent(self, message: str) -> bool:
        """Check if message indicates user wants to dispatch work."""
        message_lower = message.lower()
        for pattern in DISPATCH_PATTERNS:
            if re.search(pattern, message_lower):
                return True
        return False
    
    def _get_last_question_from_history(self, history: list) -> Optional[str]:
        """
        Extract the most recent question/task discussed that could be dispatched.
        
        This is a heuristic - looks for recent user messages that seem like requests.
        """
        # Look at last few user messages
        user_messages = [m for m in history[-6:] if m["role"] == "user"]
        
        for msg in reversed(user_messages):
            content = msg["content"].lower()
            # Skip dispatch confirmations
            if self._check_dispatch_intent(content):
                continue
            # Look for task-like messages
            if any(word in content for word in [
                "look at", "check", "research", "find", "help with",
                "figure out", "analyze", "review", "investigate"
            ]):
                return msg["content"]
        
        return None
    
    async def _generate_response(
        self, 
        message: str, 
        history: list,
        conv: Conversation
    ) -> str:
        """Generate a conversational response using Sonnet."""
        
        # Add context about pending tasks
        extra_context = ""
        if conv.pending_tasks:
            tasks_info = ", ".join([t["question"][:50] for t in conv.pending_tasks])
            extra_context = f"\n\n[Note: There are pending tasks with Sophie: {tasks_info}]"
        
        system_prompt = SECRETARY_SYSTEM_PROMPT + extra_context
        
        result = await invoke_claude(
            message,
            history=history,
            system_prompt=system_prompt
        )
        
        if result.success:
            return result.result
        else:
            logger.warning(f"Claude invocation failed: {result.error}")
            return "Hmm, I'm having trouble thinking right now. Give me a moment?"
    
    async def _dispatch_work(
        self, 
        conv: Conversation, 
        question: str,
        sender_name: str
    ) -> str:
        """Dispatch work to Sophie backend."""
        logger.info(f"Dispatching work: {question[:50]}...")
        
        context = f"Element Secretary request from {sender_name}"
        request_id = await self.sophie.submit_task(question, context)
        
        if request_id:
            conv.add_pending_task(request_id, question)
            await self.state.save_conversation(conv)
            return f"Got it! I've sent that to Sophie. I'll let you know when she's done."
        else:
            return "Hmm, I couldn't reach Sophie right now. Want to try again in a moment?"
    
    async def _idle_checker(self):
        """Background task to check for completed tasks during idle time."""
        logger.info(f"Starting idle checker (every {IDLE_CHECK_SECONDS}s)")
        
        while True:
            try:
                await asyncio.sleep(IDLE_CHECK_SECONDS)
                
                # Check if conversation has been idle
                idle_seconds = (datetime.now() - self._last_activity).total_seconds()
                if idle_seconds < IDLE_CHECK_SECONDS:
                    continue
                
                # Check for completed tasks
                completed = await self.sophie.check_all_pending()
                
                for task in completed:
                    logger.info(f"Task completed: {task['request_id']}")
                    
                    # Find the room for this task and notify
                    rooms = await self.state.get_all_rooms_with_pending()
                    for room_id in rooms:
                        conv = await self.state.get_conversation(room_id)
                        for pending in conv.pending_tasks:
                            if pending["request_id"] == task["request_id"]:
                                # Found the room - send notification
                                question_preview = task["question"][:50]
                                
                                if task["status"] == "complete":
                                    msg = f"Hey, Sophie finished working on that ({question_preview}...).\n\nHere's what she found:\n\n{task['response'][:1000]}"
                                else:
                                    msg = f"Sophie ran into an issue with that request ({question_preview}...). Want to try again?"
                                
                                await self.matrix.send_message(room_id, msg)
                                conv.remove_pending_task(task["request_id"])
                                await self.state.save_conversation(conv)
                                break
                                
            except Exception as e:
                logger.error(f"Idle checker error: {e}", exc_info=True)
    
    async def run(self):
        """Run the secretary service."""
        await self.setup()
        
        # Start idle checker in background
        self._idle_task = asyncio.create_task(self._idle_checker())
        
        # Run Matrix sync loop (blocks)
        logger.info("Element Secretary is running!")
        await self.matrix.start_sync()
    
    async def stop(self):
        """Stop the secretary service."""
        logger.info("Stopping Element Secretary...")
        
        if self._idle_task:
            self._idle_task.cancel()
            
        if self.matrix:
            await self.matrix.stop()


async def main():
    """Main entry point."""
    secretary = Secretary()
    
    try:
        await secretary.run()
    except KeyboardInterrupt:
        logger.info("Interrupted")
    finally:
        await secretary.stop()


if __name__ == "__main__":
    asyncio.run(main())
