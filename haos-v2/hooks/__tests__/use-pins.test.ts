import { renderHook, act } from '@testing-library/react';
import { usePins } from '../use-pins';

// Mock window and console
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

// Mock window object for testing
const mockWindow = {
  matrixClient: null as any
};

Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true
});

describe('usePins', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWindow.matrixClient = null;
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  describe('Basic functionality', () => {
    it('returns empty state for no roomId', async () => {
      const { result } = renderHook(() => usePins(''));
      
      await act(async () => {
        // Wait for useEffect to complete
      });

      expect(result.current).toEqual({
        pinnedMessages: [],
        isLoading: false,
        error: null,
      });
    });

    it('returns empty pinned messages for room without pins', async () => {
      mockWindow.matrixClient = {
        rooms: new Map([
          ['!test:matrix.org', { roomId: '!test:matrix.org' }]
        ])
      };

      const { result } = renderHook(() => usePins('!test:matrix.org'));
      
      await act(async () => {
        // Wait for useEffect to complete
      });

      expect(result.current).toEqual({
        pinnedMessages: [],
        isLoading: false,
        error: null,
      });
    });

    it('returns pinned messages when available', async () => {
      const mockPinnedMessages = [
        {
          id: '1',
          content: 'Test pinned message',
          sender: '@user:matrix.org',
          timestamp: new Date('2023-01-01'),
          eventId: '$test1'
        }
      ];

      mockWindow.matrixClient = {
        rooms: new Map([
          ['!test:matrix.org', {
            roomId: '!test:matrix.org',
            pinnedMessages: mockPinnedMessages
          }]
        ])
      };

      const { result } = renderHook(() => usePins('!test:matrix.org'));
      
      await act(async () => {
        // Wait for useEffect to complete
      });

      expect(result.current.pinnedMessages).toEqual(mockPinnedMessages);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Loading states', () => {
    it('starts with loading state', () => {
      const { result } = renderHook(() => usePins('!test:matrix.org'));
      
      expect(result.current.isLoading).toBe(true);
    });

    it('sets loading to false after completion', async () => {
      const { result } = renderHook(() => usePins('!test:matrix.org'));
      
      await act(async () => {
        // Wait for useEffect to complete
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Error handling', () => {
    it('handles missing room gracefully', async () => {
      mockWindow.matrixClient = {
        rooms: new Map()
      };

      const { result } = renderHook(() => usePins('!nonexistent:matrix.org'));
      
      await act(async () => {
        // Wait for useEffect to complete
      });

      expect(result.current).toEqual({
        pinnedMessages: [],
        isLoading: false,
        error: null,
      });
    });

    it('handles missing matrix client gracefully', async () => {
      delete (window as any).matrixClient;

      const { result } = renderHook(() => usePins('!test:matrix.org'));
      
      await act(async () => {
        // Wait for useEffect to complete
      });

      expect(result.current).toEqual({
        pinnedMessages: [],
        isLoading: false,
        error: null,
      });
    });
  });

  describe('Room ID changes', () => {
    it('updates when roomId changes', async () => {
      const mockPinnedMessages1 = [
        {
          id: '1',
          content: 'Room 1 pin',
          sender: '@user:matrix.org',
          timestamp: new Date('2023-01-01'),
          eventId: '$test1'
        }
      ];

      const mockPinnedMessages2 = [
        {
          id: '2',
          content: 'Room 2 pin',
          sender: '@user:matrix.org',
          timestamp: new Date('2023-01-02'),
          eventId: '$test2'
        }
      ];

      mockWindow.matrixClient = {
        rooms: new Map([
          ['!room1:matrix.org', {
            roomId: '!room1:matrix.org',
            pinnedMessages: mockPinnedMessages1
          }],
          ['!room2:matrix.org', {
            roomId: '!room2:matrix.org',
            pinnedMessages: mockPinnedMessages2
          }]
        ])
      };

      const { result, rerender } = renderHook(
        ({ roomId }) => usePins(roomId),
        { initialProps: { roomId: '!room1:matrix.org' } }
      );
      
      await act(async () => {
        // Wait for initial load
      });

      expect(result.current.pinnedMessages).toEqual(mockPinnedMessages1);

      // Change room ID
      await act(async () => {
        rerender({ roomId: '!room2:matrix.org' });
      });

      expect(result.current.pinnedMessages).toEqual(mockPinnedMessages2);
    });

    it('clears data when roomId becomes empty', async () => {
      mockWindow.matrixClient = {
        rooms: new Map([
          ['!test:matrix.org', {
            roomId: '!test:matrix.org',
            pinnedMessages: [
              {
                id: '1',
                content: 'Test pin',
                sender: '@user:matrix.org',
                timestamp: new Date('2023-01-01'),
                eventId: '$test1'
              }
            ]
          }]
        ])
      };

      const { result, rerender } = renderHook(
        ({ roomId }) => usePins(roomId),
        { initialProps: { roomId: '!test:matrix.org' } }
      );
      
      await act(async () => {
        // Wait for initial load
      });

      expect(result.current.pinnedMessages).toHaveLength(1);

      // Clear room ID
      await act(async () => {
        rerender({ roomId: '' });
      });

      expect(result.current.pinnedMessages).toEqual([]);
      expect(result.current.isLoading).toBe(false);
    });
  });
});