"""
Sophie Backend Client

Handles communication with Sophie MCP server for task dispatch and status checks.
Same endpoints used by ElevenLabs voice agent.
"""
import asyncio
from typing import Optional, Dict, Any, List
from dataclasses import dataclass, field
from datetime import datetime

import httpx

from config import SOPHIE_MCP_URL, SOPHIE_MCP_SECRET


@dataclass
class PendingTask:
    """Represents a task submitted to Sophie."""
    request_id: str
    question: str
    context: str
    submitted_at: datetime = field(default_factory=datetime.now)
    status: str = "processing"
    response: Optional[str] = None


class SophieClient:
    """Client for Sophie MCP backend."""
    
    def __init__(self, base_url: str = SOPHIE_MCP_URL, secret: str = SOPHIE_MCP_SECRET):
        self.base_url = base_url.rstrip('/')
        self.secret = secret
        self.pending_tasks: Dict[str, PendingTask] = {}
    
    async def submit_task(self, question: str, context: str = "Element Secretary") -> Optional[str]:
        """
        Submit a task to Sophie.
        
        Returns request_id if successful, None if failed.
        """
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.post(
                    f"{self.base_url}/ask_sophie",
                    json={
                        "question": question,
                        "context": context,
                        "secret": self.secret
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    request_id = data.get("request_id")
                    
                    if request_id:
                        # Track the pending task
                        self.pending_tasks[request_id] = PendingTask(
                            request_id=request_id,
                            question=question,
                            context=context
                        )
                        return request_id
                
                return None
                
            except Exception as e:
                print(f"[Sophie] Error submitting task: {e}")
                return None
    
    async def check_task(self, request_id: str) -> Dict[str, Any]:
        """
        Check the status of a submitted task.
        
        Returns dict with 'status' and optionally 'response'.
        """
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.post(
                    f"{self.base_url}/check_sophie",
                    json={
                        "request_id": request_id,
                        "secret": self.secret
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    
                    # Update our tracked task
                    if request_id in self.pending_tasks:
                        task = self.pending_tasks[request_id]
                        task.status = data.get("status", "unknown")
                        if data.get("response"):
                            task.response = data["response"]
                    
                    return data
                
                return {"status": "error", "error": f"HTTP {response.status_code}"}
                
            except Exception as e:
                return {"status": "error", "error": str(e)}
    
    async def check_all_pending(self) -> List[Dict[str, Any]]:
        """
        Check all pending tasks and return any that completed.
        
        Returns list of completed task info.
        """
        completed = []
        
        for request_id, task in list(self.pending_tasks.items()):
            if task.status == "processing":
                result = await self.check_task(request_id)
                
                if result.get("status") in ("complete", "error"):
                    completed.append({
                        "request_id": request_id,
                        "question": task.question,
                        "status": result.get("status"),
                        "response": result.get("response")
                    })
                    
                    # Remove from pending
                    if result.get("status") == "complete":
                        del self.pending_tasks[request_id]
        
        return completed
    
    def get_pending_count(self) -> int:
        """Return number of pending tasks."""
        return len([t for t in self.pending_tasks.values() if t.status == "processing"])


# Global client instance
_client: Optional[SophieClient] = None


def get_sophie_client() -> SophieClient:
    """Get or create Sophie client singleton."""
    global _client
    if _client is None:
        _client = SophieClient()
    return _client


if __name__ == "__main__":
    # Quick test
    async def test():
        client = get_sophie_client()
        print(f"Sophie client: {client.base_url}")
        print(f"Pending tasks: {client.get_pending_count()}")
    
    asyncio.run(test())
