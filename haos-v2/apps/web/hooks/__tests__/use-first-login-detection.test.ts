import { renderHook, act, waitFor } from '@testing-library/react';
import { MatrixClient } from 'matrix-js-sdk';
import { useFirstLoginDetection, clearDeviceVerificationData } from '../use-first-login-detection';

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// Mock Matrix client
const createMockMatrixClient = (deviceId: string = 'TEST_DEVICE_123') => {
  return {
    getDeviceId: jest.fn(() => deviceId),
    getDevices: jest.fn(() => Promise.resolve({
      devices: [
        {
          device_id: deviceId,
          display_name: 'Test Device',
          last_seen_ip: '192.168.1.1',
          last_seen_ts: Date.now() - 1000 * 60 * 60 // 1 hour ago
        }
      ]
    }))
  } as unknown as MatrixClient;
};

describe('useFirstLoginDetection', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  describe('when no client is provided', () => {
    it('should return loading false and no device info', () => {
      const { result } = renderHook(() => useFirstLoginDetection());
      
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isFirstLogin).toBe(false);
      expect(result.current.isNewDevice).toBe(false);
      expect(result.current.currentDevice).toBeUndefined();
      expect(result.current.otherDevices).toEqual([]);
    });
  });

  describe('when client is provided', () => {
    it('should detect first login on first device', async () => {
      const mockClient = createMockMatrixClient('DEVICE_001');
      
      const { result } = renderHook(() => useFirstLoginDetection(mockClient));
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isFirstLogin).toBe(true);
      expect(result.current.isNewDevice).toBe(true);
      expect(result.current.currentDevice).toBeDefined();
      expect(result.current.currentDevice?.deviceId).toBe('DEVICE_001');
      expect(result.current.otherDevices).toEqual([]);
    });

    it('should detect new device when device ID changes', async () => {
      const firstClient = createMockMatrixClient('DEVICE_001');
      
      // First login
      const { result: firstResult } = renderHook(() => 
        useFirstLoginDetection(firstClient)
      );
      
      await waitFor(() => {
        expect(firstResult.current.isLoading).toBe(false);
      });

      // Mark first device as verified
      act(() => {
        firstResult.current.completeVerification();
      });

      // Second device
      const secondClient = createMockMatrixClient('DEVICE_002');
      (secondClient.getDevices as jest.Mock).mockResolvedValue({
        devices: [
          {
            device_id: 'DEVICE_001',
            display_name: 'First Device',
            last_seen_ip: '192.168.1.1',
            last_seen_ts: Date.now() - 1000 * 60 * 60 * 24 // 1 day ago
          },
          {
            device_id: 'DEVICE_002',
            display_name: 'Second Device',
            last_seen_ip: '192.168.1.2',
            last_seen_ts: Date.now() - 1000 * 60 * 5 // 5 minutes ago
          }
        ]
      });

      const { result: secondResult } = renderHook(() => 
        useFirstLoginDetection(secondClient)
      );
      
      await waitFor(() => {
        expect(secondResult.current.isLoading).toBe(false);
      });

      expect(secondResult.current.isFirstLogin).toBe(true);
      expect(secondResult.current.isNewDevice).toBe(true);
      expect(secondResult.current.currentDevice?.deviceId).toBe('DEVICE_002');
      expect(secondResult.current.otherDevices).toHaveLength(1);
      expect(secondResult.current.otherDevices[0].deviceId).toBe('DEVICE_001');
    });

    it('should not show first login prompt for verified device', async () => {
      const mockClient = createMockMatrixClient('DEVICE_001');
      
      // Pre-populate verification data
      mockLocalStorage.setItem(
        'haos_device_verification_completed',
        JSON.stringify(['DEVICE_001'])
      );
      mockLocalStorage.setItem('haos_current_device_id', 'DEVICE_001');
      
      const { result } = renderHook(() => useFirstLoginDetection(mockClient));
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isFirstLogin).toBe(false);
      expect(result.current.isNewDevice).toBe(false);
    });

    it('should handle API errors gracefully', async () => {
      const mockClient = createMockMatrixClient('DEVICE_001');
      (mockClient.getDevices as jest.Mock).mockRejectedValue(
        new Error('API Error')
      );
      
      const { result } = renderHook(() => useFirstLoginDetection(mockClient));
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('API Error');
      // Should still detect new device based on localStorage
      expect(result.current.isNewDevice).toBe(true);
      expect(result.current.isFirstLogin).toBe(true);
    });

    it('should complete verification correctly', async () => {
      const mockClient = createMockMatrixClient('DEVICE_001');
      
      const { result } = renderHook(() => useFirstLoginDetection(mockClient));
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isFirstLogin).toBe(true);

      // Complete verification
      act(() => {
        result.current.completeVerification();
      });

      expect(result.current.isFirstLogin).toBe(false);
      
      // Verify localStorage was updated
      const completedDevices = JSON.parse(
        mockLocalStorage.getItem('haos_device_verification_completed') || '[]'
      );
      expect(completedDevices).toContain('DEVICE_001');
    });
  });

  describe('clearDeviceVerificationData', () => {
    it('should clear all verification data', () => {
      // Set up some data
      mockLocalStorage.setItem(
        'haos_device_verification_completed',
        JSON.stringify(['DEVICE_001'])
      );
      mockLocalStorage.setItem('haos_current_device_id', 'DEVICE_001');
      
      // Clear data
      clearDeviceVerificationData();
      
      // Verify cleared
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        'haos_device_verification_completed'
      );
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        'haos_current_device_id'
      );
    });
  });

  describe('device display logic', () => {
    it('should handle multiple devices correctly', async () => {
      const mockClient = createMockMatrixClient('DEVICE_NEW');
      (mockClient.getDevices as jest.Mock).mockResolvedValue({
        devices: [
          {
            device_id: 'DEVICE_001',
            display_name: 'Desktop',
            last_seen_ip: '192.168.1.1',
            last_seen_ts: Date.now() - 1000 * 60 * 60 * 24 * 7 // 1 week ago
          },
          {
            device_id: 'DEVICE_002',
            display_name: 'Mobile',
            last_seen_ip: '10.0.0.1',
            last_seen_ts: Date.now() - 1000 * 60 * 60 // 1 hour ago
          },
          {
            device_id: 'DEVICE_NEW',
            display_name: 'New Device',
            last_seen_ip: '192.168.1.100',
            last_seen_ts: Date.now() - 1000 * 60 // 1 minute ago
          }
        ]
      });
      
      const { result } = renderHook(() => useFirstLoginDetection(mockClient));
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.currentDevice?.deviceId).toBe('DEVICE_NEW');
      expect(result.current.otherDevices).toHaveLength(2);
      expect(result.current.otherDevices.map(d => d.deviceId)).toEqual([
        'DEVICE_001',
        'DEVICE_002'
      ]);
    });
  });
});