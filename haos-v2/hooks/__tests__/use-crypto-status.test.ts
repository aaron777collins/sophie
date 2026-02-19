import { renderHook, act } from '@testing-library/react';
import { useCryptoStatus } from '../use-crypto-status';

// Mock console
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

// Mock window object for testing
const mockWindow = {
  matrixClient: null as any
};

Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true
});

describe('useCryptoStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWindow.matrixClient = null;
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  describe('Basic functionality', () => {
    it('returns unknown state for no roomId', async () => {
      const { result } = renderHook(() => useCryptoStatus(''));
      
      await act(async () => {
        // Wait for useEffect to complete
      });

      expect(result.current).toEqual({
        state: 'unknown',
        statusMessage: 'No room',
        detailedMessage: 'No room selected',
        isLoading: false,
        error: null,
      });
    });

    it('starts with loading state', () => {
      const { result } = renderHook(() => useCryptoStatus('!test:matrix.org'));
      
      expect(result.current.isLoading).toBe(true);
      expect(result.current.statusMessage).toBe('Checking...');
    });
  });

  describe('Encryption states', () => {
    it('returns verified state for verified room', async () => {
      mockWindow.matrixClient = {
        rooms: new Map([
          ['!test:matrix.org', {
            roomId: '!test:matrix.org',
            encrypted: true,
            verified: true
          }]
        ])
      };

      const { result } = renderHook(() => useCryptoStatus('!test:matrix.org'));
      
      await act(async () => {
        // Wait for useEffect to complete
      });

      expect(result.current).toEqual({
        state: 'verified',
        statusMessage: 'Verified & Encrypted',
        detailedMessage: 'All devices in this room have been verified. Your messages are secure.',
        isLoading: false,
        error: null,
      });
    });

    it('returns unverified state for encrypted but unverified room', async () => {
      mockWindow.matrixClient = {
        rooms: new Map([
          ['!test:matrix.org', {
            roomId: '!test:matrix.org',
            encrypted: true,
            verified: false
          }]
        ])
      };

      const { result } = renderHook(() => useCryptoStatus('!test:matrix.org'));
      
      await act(async () => {
        // Wait for useEffect to complete
      });

      expect(result.current).toEqual({
        state: 'unverified',
        statusMessage: 'Encrypted',
        detailedMessage: 'Messages are encrypted, but some devices haven\'t been verified. Verify devices for maximum security.',
        isLoading: false,
        error: null,
      });
    });

    it('returns unencrypted state for unencrypted room', async () => {
      mockWindow.matrixClient = {
        rooms: new Map([
          ['!test:matrix.org', {
            roomId: '!test:matrix.org',
            encrypted: false
          }]
        ])
      };

      const { result } = renderHook(() => useCryptoStatus('!test:matrix.org'));
      
      await act(async () => {
        // Wait for useEffect to complete
      });

      expect(result.current).toEqual({
        state: 'unencrypted',
        statusMessage: 'Not Encrypted',
        detailedMessage: 'Messages in this room are not encrypted. Anyone with access to the server can read them.',
        isLoading: false,
        error: null,
      });
    });

    it('returns unknown state for missing room', async () => {
      mockWindow.matrixClient = {
        rooms: new Map()
      };

      const { result } = renderHook(() => useCryptoStatus('!nonexistent:matrix.org'));
      
      await act(async () => {
        // Wait for useEffect to complete
      });

      expect(result.current).toEqual({
        state: 'unknown',
        statusMessage: 'Unknown',
        detailedMessage: 'Unable to determine encryption status',
        isLoading: false,
        error: null,
      });
    });
  });

  describe('Default behavior without Matrix client', () => {
    it('returns unverified state when no matrix client is available', async () => {
      delete (window as any).matrixClient;

      const { result } = renderHook(() => useCryptoStatus('!test:matrix.org'));
      
      await act(async () => {
        // Wait for useEffect to complete
      });

      expect(result.current).toEqual({
        state: 'unverified',
        statusMessage: 'Encrypted',
        detailedMessage: 'Messages are encrypted, but device verification status is unknown.',
        isLoading: false,
        error: null,
      });
    });
  });

  describe('Room ID changes', () => {
    it('updates status when roomId changes', async () => {
      mockWindow.matrixClient = {
        rooms: new Map([
          ['!room1:matrix.org', {
            roomId: '!room1:matrix.org',
            encrypted: true,
            verified: true
          }],
          ['!room2:matrix.org', {
            roomId: '!room2:matrix.org',
            encrypted: false
          }]
        ])
      };

      const { result, rerender } = renderHook(
        ({ roomId }) => useCryptoStatus(roomId),
        { initialProps: { roomId: '!room1:matrix.org' } }
      );
      
      await act(async () => {
        // Wait for initial load
      });

      expect(result.current.state).toBe('verified');

      // Change room ID
      await act(async () => {
        rerender({ roomId: '!room2:matrix.org' });
      });

      expect(result.current.state).toBe('unencrypted');
    });

    it('handles transition to empty roomId', async () => {
      mockWindow.matrixClient = {
        rooms: new Map([
          ['!test:matrix.org', {
            roomId: '!test:matrix.org',
            encrypted: true,
            verified: true
          }]
        ])
      };

      const { result, rerender } = renderHook(
        ({ roomId }) => useCryptoStatus(roomId),
        { initialProps: { roomId: '!test:matrix.org' } }
      );
      
      await act(async () => {
        // Wait for initial load
      });

      expect(result.current.state).toBe('verified');

      // Clear room ID
      await act(async () => {
        rerender({ roomId: '' });
      });

      expect(result.current.state).toBe('unknown');
      expect(result.current.statusMessage).toBe('No room');
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Error handling', () => {
    it('handles errors gracefully', async () => {
      // Mock an error in the effect
      mockWindow.matrixClient = {
        get rooms() {
          throw new Error('Network error');
        }
      };

      const { result } = renderHook(() => useCryptoStatus('!test:matrix.org'));
      
      await act(async () => {
        // Wait for useEffect to complete
      });

      expect(result.current).toEqual({
        state: 'unknown',
        statusMessage: 'Error',
        detailedMessage: 'Failed to check encryption status',
        isLoading: false,
        error: 'Network error',
      });

      expect(mockConsoleError).toHaveBeenCalledWith(
        'Failed to check crypto status:',
        expect.any(Error)
      );
    });
  });

  describe('Loading states during transitions', () => {
    it('shows loading state during room transitions', async () => {
      mockWindow.matrixClient = {
        rooms: new Map([
          ['!room1:matrix.org', {
            roomId: '!room1:matrix.org',
            encrypted: true,
            verified: true
          }],
          ['!room2:matrix.org', {
            roomId: '!room2:matrix.org',
            encrypted: false
          }]
        ])
      };

      const { result, rerender } = renderHook(
        ({ roomId }) => useCryptoStatus(roomId),
        { initialProps: { roomId: '!room1:matrix.org' } }
      );
      
      await act(async () => {
        // Wait for initial load
      });

      expect(result.current.isLoading).toBe(false);

      // Change room ID and immediately check loading state
      act(() => {
        rerender({ roomId: '!room2:matrix.org' });
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        // Wait for new load to complete
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.state).toBe('unencrypted');
    });
  });
});