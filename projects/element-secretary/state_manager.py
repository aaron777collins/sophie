"""
Conversation State Manager

Manages conversation history and state persistence using SQLite.
"""
import json
import aiosqlite
from datetime import datetime
from typing import Optional, List, Dict, Any
from dataclasses import dataclass, field, asdict

from config import DB_PATH, MAX_HISTORY_MESSAGES


@dataclass
class Message:
    """A single message in conversation."""
    role: str  # "user" or "assistant"
    content: str
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())


@dataclass  
class Conversation:
    """Conversation state for a room."""
    room_id: str
    messages: List[Message] = field(default_factory=list)
    pending_tasks: List[Dict[str, Any]] = field(default_factory=list)
    last_active: str = field(default_factory=lambda: datetime.now().isoformat())
    
    def add_message(self, role: str, content: str):
        """Add a message and trim if needed."""
        self.messages.append(Message(role=role, content=content))
        self.last_active = datetime.now().isoformat()
        
        # Trim old messages
        if len(self.messages) > MAX_HISTORY_MESSAGES:
            self.messages = self.messages[-MAX_HISTORY_MESSAGES:]
    
    def get_history_for_claude(self) -> List[Dict[str, str]]:
        """Get message history in format for Claude."""
        return [{"role": m.role, "content": m.content} for m in self.messages]
    
    def add_pending_task(self, request_id: str, question: str):
        """Track a pending task."""
        self.pending_tasks.append({
            "request_id": request_id,
            "question": question,
            "submitted_at": datetime.now().isoformat()
        })
    
    def remove_pending_task(self, request_id: str):
        """Remove a completed task."""
        self.pending_tasks = [t for t in self.pending_tasks if t["request_id"] != request_id]


class StateManager:
    """Manages conversation state with SQLite persistence."""
    
    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path
        self._conversations: Dict[str, Conversation] = {}
    
    async def init_db(self):
        """Initialize database schema."""
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute('''
                CREATE TABLE IF NOT EXISTS conversations (
                    room_id TEXT PRIMARY KEY,
                    messages TEXT,
                    pending_tasks TEXT,
                    last_active TEXT
                )
            ''')
            await db.commit()
    
    async def get_conversation(self, room_id: str) -> Conversation:
        """Get or create conversation for room."""
        if room_id in self._conversations:
            return self._conversations[room_id]
        
        # Try to load from DB
        async with aiosqlite.connect(self.db_path) as db:
            cursor = await db.execute(
                'SELECT messages, pending_tasks, last_active FROM conversations WHERE room_id = ?',
                (room_id,)
            )
            row = await cursor.fetchone()
            
            if row:
                messages_data = json.loads(row[0] or "[]")
                messages = [Message(**m) for m in messages_data]
                pending_tasks = json.loads(row[1] or "[]")
                
                conv = Conversation(
                    room_id=room_id,
                    messages=messages,
                    pending_tasks=pending_tasks,
                    last_active=row[2] or datetime.now().isoformat()
                )
            else:
                conv = Conversation(room_id=room_id)
        
        self._conversations[room_id] = conv
        return conv
    
    async def save_conversation(self, conv: Conversation):
        """Persist conversation to database."""
        messages_json = json.dumps([asdict(m) for m in conv.messages])
        tasks_json = json.dumps(conv.pending_tasks)
        
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute('''
                INSERT OR REPLACE INTO conversations (room_id, messages, pending_tasks, last_active)
                VALUES (?, ?, ?, ?)
            ''', (conv.room_id, messages_json, tasks_json, conv.last_active))
            await db.commit()
    
    async def add_message(self, room_id: str, role: str, content: str):
        """Add message to conversation and save."""
        conv = await self.get_conversation(room_id)
        conv.add_message(role, content)
        await self.save_conversation(conv)
    
    async def get_all_rooms_with_pending(self) -> List[str]:
        """Get room IDs that have pending tasks."""
        async with aiosqlite.connect(self.db_path) as db:
            cursor = await db.execute(
                "SELECT room_id FROM conversations WHERE pending_tasks != '[]'"
            )
            rows = await cursor.fetchall()
            return [row[0] for row in rows]


# Global instance
_manager: Optional[StateManager] = None


async def get_state_manager() -> StateManager:
    """Get or create state manager singleton."""
    global _manager
    if _manager is None:
        _manager = StateManager()
        await _manager.init_db()
    return _manager


if __name__ == "__main__":
    import asyncio
    
    async def test():
        manager = await get_state_manager()
        print(f"State manager initialized: {manager.db_path}")
        
        # Test conversation
        conv = await manager.get_conversation("test_room")
        conv.add_message("user", "Hello!")
        conv.add_message("assistant", "Hi there!")
        await manager.save_conversation(conv)
        
        print(f"Messages: {len(conv.messages)}")
    
    asyncio.run(test())
