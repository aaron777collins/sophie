import { useState, useEffect, useCallback } from 'react';
import { useMatrixClient } from './use-matrix-client';

export interface PinnedMessage {
  eventId: string;
  content: string;
  sender: string;
  timestamp: number;
  type: string;
}

export interface UsePinsReturn {
  pinnedMessages: PinnedMessage[];
  isLoading: boolean;
  error: string | null;
  pinMessage: (eventId: string) => Promise<void>;
  unpinMessage: (eventId: string) => Promise<void>;
  refreshPins: () => Promise<void>;
}

/**
 * Hook for managing pinned messages in a Matrix room using the Matrix protocol.
 * Implements m.room.pinned_events state events for pin/unpin functionality.
 */
export function usePins(roomId: string): UsePinsReturn {
  const [pinnedMessages, setPinnedMessages] = useState<PinnedMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { client: matrixClient } = useMatrixClient();

  /**
   * Fetch pinned messages from Matrix room state
   */
  const fetchPinnedMessages = useCallback(async () => {
    if (!matrixClient || !roomId) return;

    try {
      setIsLoading(true);
      setError(null);

      const room = matrixClient.getRoom(roomId);
      if (!room) {
        throw new Error('Room not found');
      }

      // Get pinned events state
      const pinnedEventsState = room.currentState.getStateEvents('m.room.pinned_events', '');
      if (!pinnedEventsState) {
        setPinnedMessages([]);
        return;
      }

      const pinnedEventIds = pinnedEventsState.getContent()['pinned'] || [];
      
      // Fetch the actual messages for each pinned event ID
      const messages: PinnedMessage[] = [];
      for (const eventId of pinnedEventIds) {
        try {
          const event = await matrixClient.fetchRoomEvent(roomId, eventId);
          if (event && event.type === 'm.room.message') {
            messages.push({
              eventId,
              content: event.content?.['body'] || '',
              sender: event.sender || '',
              timestamp: event.origin_server_ts || Date.now(),
              type: event.content?.['msgtype'] || 'm.text',
            });
          }
        } catch (fetchError) {
          console.warn(`Failed to fetch pinned message ${eventId}:`, fetchError);
        }
      }

      // Sort by timestamp (newest first)
      messages.sort((a, b) => b.timestamp - a.timestamp);
      setPinnedMessages(messages);
    } catch (err) {
      console.error('Failed to fetch pinned messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch pinned messages');
    } finally {
      setIsLoading(false);
    }
  }, [matrixClient, roomId]);

  /**
   * Pin a message by adding its event ID to the room's pinned_events state
   */
  const pinMessage = useCallback(async (eventId: string) => {
    if (!matrixClient || !roomId) return;

    try {
      setError(null);
      
      const room = matrixClient.getRoom(roomId);
      if (!room) {
        throw new Error('Room not found');
      }

      // Get current pinned events
      const pinnedEventsState = room.currentState.getStateEvents('m.room.pinned_events', '');
      const currentPinned = pinnedEventsState?.getContent()['pinned'] || [];
      
      // Don't pin if already pinned
      if (currentPinned.includes(eventId)) {
        return;
      }

      // Add the new event ID
      const newPinned = [...currentPinned, eventId];

      // Send the updated pinned_events state
      await matrixClient.sendStateEvent(roomId, 'm.room.pinned_events' as any, {
        pinned: newPinned
      }, '');

      // Refresh the pinned messages list
      await fetchPinnedMessages();
    } catch (err) {
      console.error('Failed to pin message:', err);
      setError(err instanceof Error ? err.message : 'Failed to pin message');
    }
  }, [matrixClient, roomId, fetchPinnedMessages]);

  /**
   * Unpin a message by removing its event ID from the room's pinned_events state
   */
  const unpinMessage = useCallback(async (eventId: string) => {
    if (!matrixClient || !roomId) return;

    try {
      setError(null);
      
      const room = matrixClient.getRoom(roomId);
      if (!room) {
        throw new Error('Room not found');
      }

      // Get current pinned events
      const pinnedEventsState = room.currentState.getStateEvents('m.room.pinned_events', '');
      const currentPinned = pinnedEventsState?.getContent()['pinned'] || [];
      
      // Remove the event ID
      const newPinned = currentPinned.filter((id: string) => id !== eventId);

      // Send the updated pinned_events state
      await matrixClient.sendStateEvent(roomId, 'm.room.pinned_events' as any, {
        pinned: newPinned
      }, '');

      // Refresh the pinned messages list
      await fetchPinnedMessages();
    } catch (err) {
      console.error('Failed to unpin message:', err);
      setError(err instanceof Error ? err.message : 'Failed to unpin message');
    }
  }, [matrixClient, roomId, fetchPinnedMessages]);

  /**
   * Refresh pinned messages (public method for external calls)
   */
  const refreshPins = useCallback(async () => {
    await fetchPinnedMessages();
  }, [fetchPinnedMessages]);

  // Load pinned messages when room changes
  useEffect(() => {
    fetchPinnedMessages();
  }, [fetchPinnedMessages]);

  // Listen for pinned_events state changes
  useEffect(() => {
    if (!matrixClient || !roomId) return;

    const handleStateChange = (event: any) => {
      if (event.getType() === 'm.room.pinned_events' && event.getRoomId() === roomId) {
        fetchPinnedMessages();
      }
    };

    matrixClient.on('RoomState.events' as any, handleStateChange);
    return () => {
      matrixClient.removeListener('RoomState.events' as any, handleStateChange);
    };
  }, [matrixClient, roomId, fetchPinnedMessages]);

  return {
    pinnedMessages,
    isLoading,
    error,
    pinMessage,
    unpinMessage,
    refreshPins,
  };
}