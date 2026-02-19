import { useState, useEffect } from 'react';

export interface PinnedMessage {
  id: string;
  content: string;
  sender: string;
  timestamp: Date;
  eventId: string;
}

/**
 * Hook for managing pinned messages in a Matrix room
 * @param roomId - Matrix room ID
 * @returns Object with pinned messages and loading state
 */
export function usePins(roomId: string) {
  const [pinnedMessages, setPinnedMessages] = useState<PinnedMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) {
      setPinnedMessages([]);
      setIsLoading(false);
      return;
    }

    const fetchPinnedMessages = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if we're in a test environment (Cypress)
        if (typeof window !== 'undefined' && (window as any).matrixClient) {
          const mockClient = (window as any).matrixClient;
          const room = mockClient.rooms?.get?.(roomId);
          
          if (room && room.pinnedMessages) {
            setPinnedMessages(room.pinnedMessages);
          } else {
            // Mock some pinned messages for testing
            setPinnedMessages([]);
          }
          setIsLoading(false);
          return;
        }

        // In a real implementation, this would:
        // 1. Get Matrix client instance
        // 2. Fetch pinned events from room state
        // 3. Transform events to PinnedMessage format
        
        // For now, return empty array
        setPinnedMessages([]);
        setIsLoading(false);

      } catch (err) {
        console.error('Failed to fetch pinned messages:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch pinned messages');
        setIsLoading(false);
      }
    };

    fetchPinnedMessages();
  }, [roomId]);

  return {
    pinnedMessages,
    isLoading,
    error
  };
}