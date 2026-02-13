import { useState, useEffect, useCallback } from 'react';
import { MatrixClient } from 'matrix-js-sdk';

interface TypingUser {
  userId: string;
  displayName: string;
  avatarUrl?: string;
}

export function useTypingEvents(client: MatrixClient, roomId: string) {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);

  const updateTypingUsers = useCallback(() => {
    if (!client || !roomId) return;

    const room = client.getRoom(roomId);
    if (!room) return;

    const typingMemberEvents = room.getTypingMembers();
    const typingUserDetails = typingMemberEvents.map(member => ({
      userId: member.userId,
      displayName: member.name || member.userId,
      avatarUrl: member.getAvatarUrl(
        client.baseUrl, 
        24, 
        24, 
        'crop', 
        false
      )
    }));

    setTypingUsers(typingUserDetails);
  }, [client, roomId]);

  useEffect(() => {
    if (!client || !roomId) return;

    // Initial typing check
    updateTypingUsers();

    // Listen for typing events
    const onTypingEvent = () => {
      updateTypingUsers();
    };

    client.on('RoomMember.typing', onTypingEvent);

    // Cleanup
    return () => {
      client.removeListener('RoomMember.typing', onTypingEvent);
    };
  }, [client, roomId, updateTypingUsers]);

  const sendTypingNotification = useCallback((isTyping: boolean) => {
    if (!client || !roomId) return;

    client.sendTyping(roomId, isTyping, 3000);
  }, [client, roomId]);

  return {
    typingUsers,
    sendTypingNotification
  };
}