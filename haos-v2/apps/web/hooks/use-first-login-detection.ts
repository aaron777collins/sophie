import { useState, useEffect, useCallback } from 'react';
import { MatrixClient } from 'matrix-js-sdk';

interface DeviceInfo {
  deviceId: string;
  displayName?: string;
  lastSeenIp?: string;
  lastSeenTs?: number;
}

interface FirstLoginDetectionResult {
  isFirstLogin: boolean;
  isNewDevice: boolean;
  currentDevice?: DeviceInfo;
  otherDevices: DeviceInfo[];
  isLoading: boolean;
  error?: string;
}

const DEVICE_VERIFICATION_STORAGE_KEY = 'haos_device_verification_completed';
const DEVICE_ID_STORAGE_KEY = 'haos_current_device_id';

/**
 * Hook to detect first-time login and new device scenarios
 * Checks if this is a new device or first login to trigger device verification
 */
export function useFirstLoginDetection(
  client?: MatrixClient
): FirstLoginDetectionResult {
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [isNewDevice, setIsNewDevice] = useState(false);
  const [currentDevice, setCurrentDevice] = useState<DeviceInfo>();
  const [otherDevices, setOtherDevices] = useState<DeviceInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();

  /**
   * Check if device verification was completed for current device
   */
  const hasCompletedVerification = useCallback((deviceId: string): boolean => {
    try {
      const completedDevices = JSON.parse(
        localStorage.getItem(DEVICE_VERIFICATION_STORAGE_KEY) || '[]'
      ) as string[];
      return completedDevices.includes(deviceId);
    } catch {
      return false;
    }
  }, []);

  /**
   * Mark device verification as completed
   */
  const markVerificationCompleted = useCallback((deviceId: string): void => {
    try {
      const completedDevices = JSON.parse(
        localStorage.getItem(DEVICE_VERIFICATION_STORAGE_KEY) || '[]'
      ) as string[];
      
      if (!completedDevices.includes(deviceId)) {
        completedDevices.push(deviceId);
        localStorage.setItem(
          DEVICE_VERIFICATION_STORAGE_KEY,
          JSON.stringify(completedDevices)
        );
      }
    } catch (err) {
      console.error('Failed to mark verification as completed:', err);
    }
  }, []);

  /**
   * Check if this is a new device by comparing with stored device ID
   */
  const checkIfNewDevice = useCallback((deviceId: string): boolean => {
    const storedDeviceId = localStorage.getItem(DEVICE_ID_STORAGE_KEY);
    
    if (!storedDeviceId) {
      // First time ever - store device ID
      localStorage.setItem(DEVICE_ID_STORAGE_KEY, deviceId);
      return true;
    }
    
    if (storedDeviceId !== deviceId) {
      // Different device - update stored device ID
      localStorage.setItem(DEVICE_ID_STORAGE_KEY, deviceId);
      return true;
    }
    
    return false;
  }, []);

  /**
   * Fetch device information from Matrix client
   */
  const fetchDeviceInfo = useCallback(async () => {
    if (!client) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(undefined);

      // Get current device ID
      const currentDeviceId = client.getDeviceId();
      if (!currentDeviceId) {
        throw new Error('Unable to get current device ID');
      }

      // Check if this is a new device
      const newDevice = checkIfNewDevice(currentDeviceId);
      setIsNewDevice(newDevice);

      // Get all devices for the user
      const devicesResponse = await client.getDevices();
      const devices = devicesResponse.devices || [];

      // Find current device info
      const current = devices.find(d => d.device_id === currentDeviceId);
      if (current) {
        setCurrentDevice({
          deviceId: current.device_id,
          displayName: current.display_name,
          lastSeenIp: current.last_seen_ip,
          lastSeenTs: current.last_seen_ts
        });
      }

      // Get other devices
      const others = devices
        .filter(d => d.device_id !== currentDeviceId)
        .map(d => ({
          deviceId: d.device_id,
          displayName: d.display_name,
          lastSeenIp: d.last_seen_ip,
          lastSeenTs: d.last_seen_ts
        }));
      setOtherDevices(others);

      // Determine if this is a first login scenario
      const hasOtherDevices = others.length > 0;
      const hasNotCompletedVerification = !hasCompletedVerification(currentDeviceId);
      
      // First login if: new device AND (no other devices OR hasn't completed verification)
      const firstLogin = newDevice && (!hasOtherDevices || hasNotCompletedVerification);
      setIsFirstLogin(firstLogin);

    } catch (err) {
      console.error('Error fetching device information:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      
      // Fallback: check if new device based on local storage only
      if (client?.getDeviceId()) {
        const newDevice = checkIfNewDevice(client.getDeviceId()!);
        setIsNewDevice(newDevice);
        setIsFirstLogin(newDevice);
      }
    } finally {
      setIsLoading(false);
    }
  }, [client, checkIfNewDevice, hasCompletedVerification]);

  // Fetch device info when client becomes available
  useEffect(() => {
    if (client) {
      fetchDeviceInfo();
    }
  }, [client, fetchDeviceInfo]);

  // Expose method to mark verification as completed
  const completeVerification = useCallback(() => {
    if (currentDevice) {
      markVerificationCompleted(currentDevice.deviceId);
      setIsFirstLogin(false);
    }
  }, [currentDevice, markVerificationCompleted]);

  return {
    isFirstLogin,
    isNewDevice,
    currentDevice,
    otherDevices,
    isLoading,
    error,
    // Additional methods exposed for the modal
    completeVerification
  } as FirstLoginDetectionResult & { completeVerification: () => void };
}

/**
 * Utility function to clear all device verification data (for testing/debugging)
 */
export function clearDeviceVerificationData(): void {
  localStorage.removeItem(DEVICE_VERIFICATION_STORAGE_KEY);
  localStorage.removeItem(DEVICE_ID_STORAGE_KEY);
}