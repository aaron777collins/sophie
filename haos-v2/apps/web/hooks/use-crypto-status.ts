'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { MatrixClient, Room, RoomEvent } from 'matrix-js-sdk';
import { useMatrix } from '@/components/providers/matrix-provider';

/**
 * Encryption verification state enum
 * - verified: Encrypted room with all devices verified (green)
 * - unverified: Encrypted room with some unverified devices (yellow)
 * - unencrypted: Room not encrypted (red)
 * - unknown: Status cannot be determined
 */
export type EncryptionVerificationState = 'verified' | 'unverified' | 'unencrypted' | 'unknown';

/**
 * Detailed encryption status with verification info
 */
export interface CryptoStatus {
  /** Current verification state for color coding */
  state: EncryptionVerificationState;
  /** Whether the room is encrypted */
  isEncrypted: boolean;
  /** Encryption algorithm used (e.g., 'm.megolm.v1.aes-sha2') */
  algorithm: string | null;
  /** Whether client can decrypt messages */
  canDecrypt: boolean;
  /** Whether all devices in the room are verified */
  allDevicesVerified: boolean;
  /** Count of unverified devices */
  unverifiedDeviceCount: number;
  /** Count of verified devices */
  verifiedDeviceCount: number;
  /** Total device count */
  totalDeviceCount: number;
  /** Whether key backup is enabled */
  keyBackupEnabled: boolean;
  /** Whether the current user's cross-signing is set up */
  crossSigningReady: boolean;
  /** Human-readable status message */
  statusMessage: string;
  /** Detailed explanation for tooltip */
  detailedMessage: string;
  /** Whether status is still loading */
  isLoading: boolean;
}

/**
 * Hook to get comprehensive encryption status for a room
 * Provides color coding info and detailed encryption state
 * 
 * @param roomId - Matrix room ID to check status for
 * @returns CryptoStatus object with all encryption details
 */
export function useCryptoStatus(roomId: string | undefined): CryptoStatus {
  const { client, isCryptoReady } = useMatrix();
  const [isLoading, setIsLoading] = useState(true);
  const [deviceCounts, setDeviceCounts] = useState({
    verified: 0,
    unverified: 0,
    total: 0,
  });
  const [keyBackupEnabled, setKeyBackupEnabled] = useState(false);
  const [crossSigningReady, setCrossSigningReady] = useState(false);

  // Get room from client
  const room = useMemo(() => {
    if (!client || !roomId) return null;
    return client.getRoom(roomId);
  }, [client, roomId]);

  // Check if room is encrypted
  const isEncrypted = useMemo(() => {
    if (!room) return false;
    const encryptionEvent = room.currentState.getStateEvents('m.room.encryption', '');
    return encryptionEvent !== null && encryptionEvent !== undefined;
  }, [room]);

  // Get encryption algorithm
  const algorithm = useMemo(() => {
    if (!room || !isEncrypted) return null;
    const encryptionEvent = room.currentState.getStateEvents('m.room.encryption', '');
    return encryptionEvent?.getContent()?.['algorithm'] || null;
  }, [room, isEncrypted]);

  // Check if client can decrypt
  const canDecrypt = useMemo(() => {
    if (!client) return false;
    return client.isCryptoEnabled() && isEncrypted;
  }, [client, isEncrypted]);

  /**
   * Fetch device verification status for all room members
   */
  const fetchDeviceStatus = useCallback(async () => {
    if (!client || !room || !isCryptoReady) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      // Get all room members
      const members = room.getMembers();
      let verifiedCount = 0;
      let unverifiedCount = 0;
      let totalCount = 0;

      // Check each member's devices
      for (const member of members) {
        const userId = member.userId;
        
        try {
          // Get devices for this user
          const devices = client.getStoredDevicesForUser(userId);
          
          if (devices && devices.length > 0) {
            for (const device of devices) {
              totalCount++;
              
              // Check if device is verified
              // In matrix-js-sdk, device.verified can be:
              // - 0: UNVERIFIED
              // - 1: VERIFIED
              // - 2: BLOCKED
              const isVerified = device.verified === 1;
              
              if (isVerified) {
                verifiedCount++;
              } else {
                unverifiedCount++;
              }
            }
          }
        } catch (err) {
          // Individual user device fetch may fail, continue with others
          console.warn(`Failed to get devices for ${userId}:`, err);
        }
      }

      setDeviceCounts({
        verified: verifiedCount,
        unverified: unverifiedCount,
        total: totalCount,
      });

      // Check key backup status
      try {
        const keyBackupInfo = await client.getKeyBackupVersion();
        setKeyBackupEnabled(keyBackupInfo !== null);
      } catch {
        setKeyBackupEnabled(false);
      }

      // Check cross-signing status
      try {
        const crossSigningStatus = client.getCrossSigningCacheCallbacks?.();
        setCrossSigningReady(!!crossSigningStatus);
      } catch {
        setCrossSigningReady(false);
      }

    } catch (err) {
      console.error('Error fetching device status:', err);
    } finally {
      setIsLoading(false);
    }
  }, [client, room, isCryptoReady]);

  // Fetch status on mount and when dependencies change
  useEffect(() => {
    fetchDeviceStatus();
  }, [fetchDeviceStatus]);

  // Listen for changes that might affect device status
  useEffect(() => {
    if (!room || !client) return;

    const handleMemberChange = () => {
      fetchDeviceStatus();
    };

    const handleDeviceVerification = () => {
      fetchDeviceStatus();
    };

    // Listen to room timeline events (which include membership changes)
    room.on(RoomEvent.Timeline, handleMemberChange);
    
    // Listen to crypto events if available
    // Using 'as any' because the types might not be perfectly aligned with runtime
    try {
      (client as any).on?.('crypto.devicesUpdated', handleDeviceVerification);
      (client as any).on?.('crypto.userTrustStatusChanged', handleDeviceVerification);
    } catch {
      // Crypto events might not be available
    }

    return () => {
      room.off(RoomEvent.Timeline, handleMemberChange);
      try {
        (client as any).off?.('crypto.devicesUpdated', handleDeviceVerification);
        (client as any).off?.('crypto.userTrustStatusChanged', handleDeviceVerification);
      } catch {
        // Cleanup may fail silently
      }
    };
  }, [room, client, fetchDeviceStatus]);

  // Calculate verification state
  const state = useMemo((): EncryptionVerificationState => {
    if (!room || !client) return 'unknown';
    
    if (!isEncrypted) {
      return 'unencrypted';
    }

    // If we're still loading, consider it unverified for now
    if (isLoading && deviceCounts.total === 0) {
      return 'unverified';
    }

    // If all devices are verified, we're fully verified
    if (deviceCounts.total > 0 && deviceCounts.unverified === 0) {
      return 'verified';
    }

    // Encrypted but with unverified devices
    return 'unverified';
  }, [room, client, isEncrypted, isLoading, deviceCounts]);

  // Generate status message
  const statusMessage = useMemo((): string => {
    switch (state) {
      case 'verified':
        return 'Fully verified';
      case 'unverified':
        return 'Encrypted';
      case 'unencrypted':
        return 'Not encrypted';
      case 'unknown':
        return 'Unknown';
    }
  }, [state]);

  // Generate detailed message for tooltip
  const detailedMessage = useMemo((): string => {
    if (state === 'unknown') {
      return 'Unable to determine encryption status';
    }

    if (state === 'unencrypted') {
      return 'Messages in this room are not end-to-end encrypted. They may be visible to the server administrator.';
    }

    const parts: string[] = [];
    
    // Encryption info
    parts.push(`🔐 End-to-end encrypted${algorithm ? ` (${algorithm})` : ''}`);

    // Device verification status
    if (deviceCounts.total > 0) {
      parts.push(`\n📱 Devices: ${deviceCounts.verified}/${deviceCounts.total} verified`);
      
      if (deviceCounts.unverified > 0) {
        parts.push(`\n⚠️ ${deviceCounts.unverified} unverified device${deviceCounts.unverified === 1 ? '' : 's'}`);
      }
    }

    // Key backup status
    if (keyBackupEnabled) {
      parts.push('\n💾 Key backup enabled');
    } else {
      parts.push('\n💾 Key backup not configured');
    }

    // Cross-signing status
    if (crossSigningReady) {
      parts.push('\n✅ Cross-signing ready');
    }

    // Verification recommendation
    if (state === 'unverified' && deviceCounts.unverified > 0) {
      parts.push('\n\n💡 Verify devices to ensure complete security');
    }

    return parts.join('');
  }, [state, algorithm, deviceCounts, keyBackupEnabled, crossSigningReady]);

  return {
    state,
    isEncrypted,
    algorithm,
    canDecrypt,
    allDevicesVerified: deviceCounts.total > 0 && deviceCounts.unverified === 0,
    unverifiedDeviceCount: deviceCounts.unverified,
    verifiedDeviceCount: deviceCounts.verified,
    totalDeviceCount: deviceCounts.total,
    keyBackupEnabled,
    crossSigningReady,
    statusMessage,
    detailedMessage,
    isLoading,
  };
}

export default useCryptoStatus;
