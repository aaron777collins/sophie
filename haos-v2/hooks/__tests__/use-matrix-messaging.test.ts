import { renderHook, act } from '@testing-library/react';
import { useMatrixMessaging } from '../use-matrix-messaging';

// Mock MatrixClient
const mockMatrixClient = {
  sendTextMessage: jest.fn(),
  sendMessage: jest.fn(),
  sendEvent: jest.fn(),
};

describe('useMatrixMessaging', () => {
  const defaultOptions = {
    client: mockMatrixClient as any,
    roomId: 'test-room-id',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendMessage', () => {
    it('sends a text message successfully', async () => {
      mockMatrixClient.sendTextMessage.mockResolvedValue({ event_id: 'test-event-id' });
      
      const { result } = renderHook(() => useMatrixMessaging(defaultOptions));
      
      await act(async () => {
        await result.current.sendMessage('Hello, world!');
      });
      
      expect(mockMatrixClient.sendTextMessage).toHaveBeenCalledWith('test-room-id', 'Hello, world!');
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('trims whitespace from message content', async () => {
      mockMatrixClient.sendTextMessage.mockResolvedValue({ event_id: 'test-event-id' });
      
      const { result } = renderHook(() => useMatrixMessaging(defaultOptions));
      
      await act(async () => {
        await result.current.sendMessage('  Hello, world!  ');
      });
      
      expect(mockMatrixClient.sendTextMessage).toHaveBeenCalledWith('test-room-id', 'Hello, world!');
    });

    it('sets loading state during message sending', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      mockMatrixClient.sendTextMessage.mockReturnValue(promise);
      
      const { result } = renderHook(() => useMatrixMessaging(defaultOptions));
      
      act(() => {
        result.current.sendMessage('Hello, world!');
      });
      
      expect(result.current.isLoading).toBe(true);
      
      await act(async () => {
        resolvePromise({ event_id: 'test-event-id' });
        await promise;
      });
      
      expect(result.current.isLoading).toBe(false);
    });

    it('handles errors when sending message fails', async () => {
      const error = new Error('Network error');
      mockMatrixClient.sendTextMessage.mockRejectedValue(error);
      
      const { result } = renderHook(() => useMatrixMessaging(defaultOptions));
      
      await act(async () => {
        try {
          await result.current.sendMessage('Hello, world!');
        } catch (e) {
          // Expected to throw
        }
      });
      
      expect(result.current.error).toBe('Network error');
      expect(result.current.isLoading).toBe(false);
    });

    it('throws error when client is not available', async () => {
      const { result } = renderHook(() => useMatrixMessaging({
        client: undefined,
        roomId: 'test-room-id',
      }));
      
      await act(async () => {
        await expect(result.current.sendMessage('Hello, world!'))
          .rejects.toThrow('Matrix client not available');
      });
    });

    it('throws error when roomId is not provided', async () => {
      const { result } = renderHook(() => useMatrixMessaging({
        client: mockMatrixClient as any,
        roomId: '',
      }));
      
      await act(async () => {
        await expect(result.current.sendMessage('Hello, world!'))
          .rejects.toThrow('Room ID not provided');
      });
    });

    it('throws error when content is empty', async () => {
      const { result } = renderHook(() => useMatrixMessaging(defaultOptions));
      
      await act(async () => {
        await expect(result.current.sendMessage(''))
          .rejects.toThrow('Message content cannot be empty');
      });
    });

    it('throws error when content is only whitespace', async () => {
      const { result } = renderHook(() => useMatrixMessaging(defaultOptions));
      
      await act(async () => {
        await expect(result.current.sendMessage('   '))
          .rejects.toThrow('Message content cannot be empty');
      });
    });
  });

  describe('sendFormattedMessage', () => {
    it('sends a formatted message successfully', async () => {
      mockMatrixClient.sendMessage.mockResolvedValue({ event_id: 'test-event-id' });
      
      const { result } = renderHook(() => useMatrixMessaging(defaultOptions));
      
      const options = {
        content: 'Hello, world!',
        formatted_body: '<strong>Hello, world!</strong>',
        format: 'org.matrix.custom.html',
      };
      
      await act(async () => {
        await result.current.sendFormattedMessage(options);
      });
      
      expect(mockMatrixClient.sendMessage).toHaveBeenCalledWith('test-room-id', {
        msgtype: 'm.text',
        body: 'Hello, world!',
        formatted_body: '<strong>Hello, world!</strong>',
        format: 'org.matrix.custom.html',
      });
      expect(result.current.error).toBeNull();
    });

    it('uses default msgtype when not provided', async () => {
      mockMatrixClient.sendMessage.mockResolvedValue({ event_id: 'test-event-id' });
      
      const { result } = renderHook(() => useMatrixMessaging(defaultOptions));
      
      await act(async () => {
        await result.current.sendFormattedMessage({
          content: 'Hello, world!',
        });
      });
      
      expect(mockMatrixClient.sendMessage).toHaveBeenCalledWith('test-room-id', {
        msgtype: 'm.text',
        body: 'Hello, world!',
      });
    });

    it('handles custom msgtype', async () => {
      mockMatrixClient.sendMessage.mockResolvedValue({ event_id: 'test-event-id' });
      
      const { result } = renderHook(() => useMatrixMessaging(defaultOptions));
      
      await act(async () => {
        await result.current.sendFormattedMessage({
          content: 'Hello, world!',
          msgtype: 'm.notice',
        });
      });
      
      expect(mockMatrixClient.sendMessage).toHaveBeenCalledWith('test-room-id', {
        msgtype: 'm.notice',
        body: 'Hello, world!',
      });
    });
  });

  describe('sendReaction', () => {
    it('sends a reaction successfully', async () => {
      mockMatrixClient.sendEvent.mockResolvedValue({ event_id: 'reaction-event-id' });
      
      const { result } = renderHook(() => useMatrixMessaging(defaultOptions));
      
      await act(async () => {
        await result.current.sendReaction('original-event-id', '👍');
      });
      
      expect(mockMatrixClient.sendEvent).toHaveBeenCalledWith('test-room-id', 'm.reaction', {
        'm.relates_to': {
          rel_type: 'm.annotation',
          event_id: 'original-event-id',
          key: '👍',
        },
      });
      expect(result.current.error).toBeNull();
    });

    it('throws error when eventId is not provided', async () => {
      const { result } = renderHook(() => useMatrixMessaging(defaultOptions));
      
      await act(async () => {
        await expect(result.current.sendReaction('', '👍'))
          .rejects.toThrow('Room ID and Event ID are required for reactions');
      });
    });

    it('handles reaction sending errors', async () => {
      const error = new Error('Failed to send reaction');
      mockMatrixClient.sendEvent.mockRejectedValue(error);
      
      const { result } = renderHook(() => useMatrixMessaging(defaultOptions));
      
      await act(async () => {
        try {
          await result.current.sendReaction('event-id', '👍');
        } catch (e) {
          // Expected to throw
        }
      });
      
      expect(result.current.error).toBe('Failed to send reaction');
    });
  });

  describe('clearError', () => {
    it('clears error state', async () => {
      const error = new Error('Test error');
      mockMatrixClient.sendTextMessage.mockRejectedValue(error);
      
      const { result } = renderHook(() => useMatrixMessaging(defaultOptions));
      
      // Set an error first
      await act(async () => {
        try {
          await result.current.sendMessage('Hello');
        } catch (e) {
          // Expected to throw
        }
      });
      
      expect(result.current.error).toBe('Test error');
      
      // Clear the error
      act(() => {
        result.current.clearError();
      });
      
      expect(result.current.error).toBeNull();
    });
  });

  describe('initial state', () => {
    it('has correct initial values', () => {
      const { result } = renderHook(() => useMatrixMessaging(defaultOptions));
      
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.sendMessage).toBe('function');
      expect(typeof result.current.sendFormattedMessage).toBe('function');
      expect(typeof result.current.sendReaction).toBe('function');
      expect(typeof result.current.clearError).toBe('function');
    });
  });
});