import { useState, useEffect } from 'react';
import { MatrixClient } from 'matrix-js-sdk';
import { useTypingEvents } from './use-typing-events';

interface TypingUser {
  userId: string;
  displayName: string;
  avatarUrl?: string;
}

interface UseRoomHook {
  typingUsers: TypingUser[];
  sendTypingNotification: (isTyping: boolean) => void;
}

export function useRoom(roomId: string, client?: MatrixClient): UseRoomHook {
  const { typingUsers, sendTypingNotification } = useTypingEvents(
    client!, 
    roomId
  );

  return {
    typingUsers,
    sendTypingNotification
  };
}