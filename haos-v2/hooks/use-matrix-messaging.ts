'use client';

import { useCallback, useState } from 'react';
import { MatrixClient } from 'matrix-js-sdk';

export interface UseMatrixMessagingOptions {
  client?: MatrixClient;
  roomId: string;
}

export interface SendMessageOptions {
  content: string;
  msgtype?: string;
  formatted_body?: string;
  format?: string;
}

/**
 * Hook for sending messages to Matrix rooms
 * Provides a clean interface for message sending with loading states and error handling
 */
export function useMatrixMessaging({ client, roomId }: UseMatrixMessagingOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Send a text message to the Matrix room
   */
  const sendMessage = useCallback(async (content: string): Promise<void> => {
    if (!client) {
      throw new Error('Matrix client not available');
    }

    if (!roomId) {
      throw new Error('Room ID not provided');
    }

    if (!content.trim()) {
      throw new Error('Message content cannot be empty');
    }

    setIsLoading(true);
    setError(null);

    try {
      await client.sendTextMessage(roomId, content.trim());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      console.error('Failed to send message:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [client, roomId]);

  /**
   * Send a formatted message (HTML) to the Matrix room
   */
  const sendFormattedMessage = useCallback(async (options: SendMessageOptions): Promise<void> => {
    if (!client) {
      throw new Error('Matrix client not available');
    }

    if (!roomId) {
      throw new Error('Room ID not provided');
    }

    if (!options.content.trim()) {
      throw new Error('Message content cannot be empty');
    }

    setIsLoading(true);
    setError(null);

    try {
      const messageContent: any = {
        msgtype: options.msgtype || 'm.text',
        body: options.content.trim(),
      };

      // Add formatted content if provided
      if (options.formatted_body && options.format) {
        messageContent.formatted_body = options.formatted_body;
        messageContent.format = options.format;
      }

      await client.sendMessage(roomId, messageContent);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send formatted message';
      setError(errorMessage);
      console.error('Failed to send formatted message:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [client, roomId]);

  /**
   * Send an emoji reaction to a message
   */
  const sendReaction = useCallback(async (eventId: string, reaction: string): Promise<void> => {
    if (!client) {
      throw new Error('Matrix client not available');
    }

    if (!roomId || !eventId) {
      throw new Error('Room ID and Event ID are required for reactions');
    }

    setIsLoading(true);
    setError(null);

    try {
      await client.sendEvent(roomId, 'm.reaction' as any, {
        'm.relates_to': {
          rel_type: 'm.annotation',
          event_id: eventId,
          key: reaction,
        },
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send reaction';
      setError(errorMessage);
      console.error('Failed to send reaction:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [client, roomId]);

  /**
   * Clear any existing error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    sendMessage,
    sendFormattedMessage,
    sendReaction,
    isLoading,
    error,
    clearError,
  };
}