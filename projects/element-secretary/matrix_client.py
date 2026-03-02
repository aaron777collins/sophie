"""
Matrix/Element Client

Handles connection to Matrix homeserver and message handling.
Uses matrix-nio for async Matrix protocol support.

Presence-aware behavior:
- Joins Sophie room when Aaron joins
- Goes idle (leaves) after 5 minutes of empty room
"""
import asyncio
import logging
from typing import Optional, Callable, Awaitable, Set
from datetime import datetime

from nio import (
    AsyncClient,
    AsyncClientConfig,
    RoomMessageText,
    RoomMemberEvent,
    InviteMemberEvent,
    SyncError,
    LoginError,
    JoinError,
)

from config import (
    MATRIX_HOMESERVER,
    MATRIX_USER_ID,
    MATRIX_PASSWORD,
    MATRIX_ROOM_ID,
    DATA_DIR,
    AARON_USER_ID,
    EMPTY_ROOM_TIMEOUT,
)

logger = logging.getLogger(__name__)


# Type alias for message callback
MessageCallback = Callable[[str, str, str, str], Awaitable[str]]
# Args: room_id, sender_id, sender_name, message
# Returns: response text


class MatrixClient:
    """
    Matrix client for Element Secretary.
    
    Connects to Matrix homeserver, listens for messages in designated room,
    and calls the provided callback to generate responses.
    
    Presence-aware: Joins when Aaron joins, leaves after 5min empty.
    """
    
    def __init__(
        self,
        homeserver: str = MATRIX_HOMESERVER,
        user_id: str = MATRIX_USER_ID,
        password: str = MATRIX_PASSWORD,
        room_id: str = MATRIX_ROOM_ID,
        aaron_user_id: str = AARON_USER_ID,
    ):
        self.homeserver = homeserver
        self.user_id = user_id
        self.password = password
        self.room_id = room_id
        self.aaron_user_id = aaron_user_id
        
        self.client: Optional[AsyncClient] = None
        self.message_callback: Optional[MessageCallback] = None
        self._running = False
        self._reconnect_delay = 5  # seconds
        self._max_reconnect_delay = 300  # 5 minutes
        
        # Presence tracking
        self._room_members: Set[str] = set()
        self._last_aaron_activity: Optional[datetime] = None
        self._is_active = False  # Are we actively processing messages?
        self._empty_room_task: Optional[asyncio.Task] = None
        
    async def setup(self):
        """Initialize the Matrix client."""
        config = AsyncClientConfig(
            max_limit_exceeded=0,
            max_timeouts=0,
            store_sync_tokens=True,
        )
        
        self.client = AsyncClient(
            homeserver=self.homeserver,
            user=self.user_id,
            config=config,
            store_path=DATA_DIR,
        )
        
        # Add event callbacks
        self.client.add_event_callback(self._on_message, RoomMessageText)
        self.client.add_event_callback(self._on_member_event, RoomMemberEvent)
        self.client.add_event_callback(self._on_invite, InviteMemberEvent)
        
    def set_message_callback(self, callback: MessageCallback):
        """Set the callback for handling messages."""
        self.message_callback = callback
        
    async def login(self) -> bool:
        """Login to Matrix homeserver."""
        if not self.client:
            await self.setup()
        
        try:
            response = await self.client.login(self.password)
            
            if isinstance(response, LoginError):
                logger.error(f"Login failed: {response.message}")
                return False
                
            logger.info(f"Logged in as {self.user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Login exception: {e}")
            return False
    
    async def join_room(self) -> bool:
        """Join the designated room."""
        if not self.room_id:
            logger.warning("No room ID configured")
            return True  # Not an error if room not set
            
        try:
            response = await self.client.join(self.room_id)
            
            if isinstance(response, JoinError):
                logger.error(f"Failed to join room: {response.message}")
                return False
                
            logger.info(f"Joined room {self.room_id}")
            self._is_active = True
            return True
            
        except Exception as e:
            logger.error(f"Join room exception: {e}")
            return False
    
    async def leave_room(self):
        """Leave the room (go idle to save tokens)."""
        if not self.room_id:
            return
            
        try:
            await self.client.room_leave(self.room_id)
            logger.info(f"Left room {self.room_id} (going idle)")
            self._is_active = False
        except Exception as e:
            logger.error(f"Leave room exception: {e}")
    
    async def _on_member_event(self, room, event):
        """Handle room membership changes."""
        if room.room_id != self.room_id:
            return
            
        member_id = event.state_key
        membership = event.membership
        
        logger.debug(f"Member event: {member_id} -> {membership}")
        
        if membership == "join":
            self._room_members.add(member_id)
            
            # Aaron joined! Make sure we're active
            if member_id == self.aaron_user_id:
                logger.info("Aaron joined - activating secretary")
                self._last_aaron_activity = datetime.now()
                
                if not self._is_active:
                    await self.join_room()
                    
                # Cancel any pending leave task
                if self._empty_room_task:
                    self._empty_room_task.cancel()
                    self._empty_room_task = None
                    
        elif membership in ("leave", "ban"):
            self._room_members.discard(member_id)
            
            # Check if room is now empty (just us)
            other_members = self._room_members - {self.user_id}
            if not other_members:
                logger.info("Room empty - scheduling idle timeout")
                self._schedule_empty_room_check()
    
    def _schedule_empty_room_check(self):
        """Schedule a check to leave room if still empty."""
        if self._empty_room_task:
            self._empty_room_task.cancel()
            
        async def check_and_leave():
            await asyncio.sleep(EMPTY_ROOM_TIMEOUT)
            
            # Check if still empty
            other_members = self._room_members - {self.user_id}
            if not other_members:
                logger.info(f"Room empty for {EMPTY_ROOM_TIMEOUT}s - leaving to save tokens")
                await self.leave_room()
        
        self._empty_room_task = asyncio.create_task(check_and_leave())
    
    async def _on_message(self, room, event):
        """Handle incoming room messages."""
        # Ignore our own messages
        if event.sender == self.user_id:
            return
            
        # Only process messages from configured room (if set)
        if self.room_id and room.room_id != self.room_id:
            return
        
        # Don't process if we're not active
        if not self._is_active:
            logger.debug("Ignoring message - not active")
            return
            
        # Ignore old messages (from before we connected)
        event_time = datetime.fromtimestamp(event.server_timestamp / 1000)
        now = datetime.now()
        if (now - event_time).total_seconds() > 60:
            logger.debug(f"Ignoring old message from {event_time}")
            return
        
        message = event.body
        sender_id = event.sender
        sender_name = room.user_name(sender_id) or sender_id
        
        # Track Aaron's activity
        if sender_id == self.aaron_user_id:
            self._last_aaron_activity = datetime.now()
        
        logger.info(f"Message from {sender_name}: {message[:50]}...")
        
        if self.message_callback:
            try:
                # Show typing indicator
                await self._send_typing(room.room_id, True)
                
                # Get response from callback
                response = await self.message_callback(
                    room.room_id,
                    sender_id,
                    sender_name,
                    message
                )
                
                # Stop typing indicator
                await self._send_typing(room.room_id, False)
                
                # Send response
                if response:
                    await self.send_message(room.room_id, response)
                    
            except Exception as e:
                logger.error(f"Error handling message: {e}")
                await self._send_typing(room.room_id, False)
                await self.send_message(
                    room.room_id,
                    "Sorry, I had trouble processing that. Could you try again?"
                )
    
    async def _on_invite(self, room, event):
        """Handle room invites."""
        logger.info(f"Received invite to room {room.room_id}")
        # Only auto-join if it's from Aaron
        if event.sender == self.aaron_user_id:
            await self.client.join(room.room_id)
    
    async def _send_typing(self, room_id: str, typing: bool, timeout: int = 30000):
        """Send typing indicator."""
        try:
            await self.client.room_typing(room_id, typing, timeout)
        except Exception as e:
            logger.debug(f"Failed to send typing indicator: {e}")
    
    async def send_message(self, room_id: str, message: str):
        """Send a text message to a room."""
        if not self._is_active:
            logger.warning("Can't send message - not active in room")
            return
            
        try:
            await self.client.room_send(
                room_id=room_id,
                message_type="m.room.message",
                content={
                    "msgtype": "m.text",
                    "body": message
                }
            )
            logger.debug(f"Sent message to {room_id}")
        except Exception as e:
            logger.error(f"Failed to send message: {e}")
    
    async def start_sync(self):
        """Start the sync loop."""
        self._running = True
        reconnect_delay = self._reconnect_delay
        
        while self._running:
            try:
                logger.info("Starting sync...")
                
                # Run sync loop
                await self.client.sync_forever(
                    timeout=30000,
                    full_state=True,
                )
                
            except SyncError as e:
                logger.error(f"Sync error: {e}")
                
            except Exception as e:
                logger.error(f"Sync exception: {e}")
            
            if self._running:
                logger.info(f"Reconnecting in {reconnect_delay}s...")
                await asyncio.sleep(reconnect_delay)
                
                # Exponential backoff
                reconnect_delay = min(reconnect_delay * 2, self._max_reconnect_delay)
                
                # Try to re-login
                if await self.login():
                    reconnect_delay = self._reconnect_delay
    
    async def stop(self):
        """Stop the client."""
        self._running = False
        
        if self._empty_room_task:
            self._empty_room_task.cancel()
            
        if self.client:
            await self.client.close()
            logger.info("Matrix client stopped")
    
    @property
    def is_active(self) -> bool:
        """Check if secretary is actively processing."""
        return self._is_active


# Factory function
async def create_matrix_client(
    message_callback: Optional[MessageCallback] = None
) -> MatrixClient:
    """
    Create and initialize a Matrix client.
    """
    client = MatrixClient()
    
    if message_callback:
        client.set_message_callback(message_callback)
    
    await client.setup()
    
    if await client.login():
        await client.join_room()
    
    return client


if __name__ == "__main__":
    # Test connection
    logging.basicConfig(level=logging.INFO)
    
    async def test_callback(room_id, sender_id, sender_name, message):
        print(f"[{room_id}] {sender_name}: {message}")
        return f"Echo: {message}"
    
    async def main():
        client = await create_matrix_client(test_callback)
        print("Starting sync...")
        await client.start_sync()
    
    asyncio.run(main())
