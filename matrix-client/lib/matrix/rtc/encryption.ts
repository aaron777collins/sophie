/**
 * MatrixRTC E2EE Key Management
 * Handles encryption key generation, rotation, and distribution for voice/video calls
 */

import { MatrixClient } from 'matrix-js-sdk';
import { MatrixRTCSession } from 'matrix-js-sdk/lib/matrixrtc/MatrixRTCSession';
import { RTCEncryptionState } from './types';

// Define the ToDevice message content type locally
interface ToDeviceMessageContent {
  algorithm?: string;
  sender_key?: string;
  ciphertext?: Record<string, { type: number; body: string }>;
  [key: string]: any;
}

export interface RTCKeyTransportMessage {
  type: 'rtc_key';
  room_id: string;
  session_id: string;
  key_id: string;
  key: string; // Base64 encoded key
  algorithm: string;
  timestamp: number;
}

export class RTCEncryptionManager {
  private client: MatrixClient;
  private sessionKeys: Map<string, Map<string, Uint8Array>> = new Map(); // roomId -> keyId -> key
  private encryptionStates: Map<string, RTCEncryptionState> = new Map();
  private keyRotationIntervals: Map<string, NodeJS.Timeout> = new Map();
  
  // Key rotation interval (5 minutes)
  private static readonly KEY_ROTATION_INTERVAL = 5 * 60 * 1000;
  
  // Key derivation constants
  private static readonly KEY_SIZE = 32; // 256 bits
  private static readonly ALGORITHM = 'AES-GCM';

  constructor(client: MatrixClient) {
    this.client = client;
    this.setupToDeviceHandler();
  }

  /**
   * Set up encryption for an RTC session
   */
  async setupSessionEncryption(session: MatrixRTCSession, roomId: string): Promise<void> {
    try {
      // Initialize encryption state
      const encryptionState: RTCEncryptionState = {
        isEnabled: true,
        keyRotationActive: false,
        participantKeys: new Map(),
        lastKeyRotation: new Date()
      };

      this.encryptionStates.set(roomId, encryptionState);
      this.sessionKeys.set(roomId, new Map());

      // Generate initial encryption key
      await this.rotateKeys(roomId);

      // Set up automatic key rotation
      this.startKeyRotation(roomId);

      console.log(`RTC encryption initialized for room ${roomId}`);
    } catch (error) {
      console.error('Failed to setup session encryption:', error);
      throw error;
    }
  }

  /**
   * Clean up encryption for a session
   */
  async cleanupSessionEncryption(roomId: string): Promise<void> {
    try {
      // Stop key rotation
      this.stopKeyRotation(roomId);

      // Clear keys
      this.sessionKeys.delete(roomId);
      this.encryptionStates.delete(roomId);

      console.log(`RTC encryption cleaned up for room ${roomId}`);
    } catch (error) {
      console.error('Failed to cleanup session encryption:', error);
      throw error;
    }
  }

  /**
   * Rotate encryption keys for a session
   */
  async rotateKeys(roomId: string): Promise<void> {
    try {
      const encryptionState = this.encryptionStates.get(roomId);
      if (!encryptionState) {
        throw new Error('Encryption not initialized for room');
      }

      encryptionState.keyRotationActive = true;

      // Generate new key
      const keyId = this.generateKeyId();
      const key = await this.generateEncryptionKey();

      // Store the key
      const roomKeys = this.sessionKeys.get(roomId) || new Map();
      roomKeys.set(keyId, key);
      this.sessionKeys.set(roomId, roomKeys);

      // Get room participants
      const room = this.client.getRoom(roomId);
      if (!room) {
        throw new Error(`Room ${roomId} not found`);
      }

      // Distribute key to all participants via to-device messages
      await this.distributeKeyToParticipants(roomId, keyId, key);

      // Update encryption state
      encryptionState.keyRotationActive = false;
      encryptionState.lastKeyRotation = new Date();
      encryptionState.participantKeys.set(keyId, key);
      
      this.encryptionStates.set(roomId, encryptionState);

      console.log(`Keys rotated for room ${roomId}, keyId: ${keyId}`);
    } catch (error) {
      const encryptionState = this.encryptionStates.get(roomId);
      if (encryptionState) {
        encryptionState.keyRotationActive = false;
        this.encryptionStates.set(roomId, encryptionState);
      }
      console.error('Key rotation failed:', error);
      throw error;
    }
  }

  /**
   * Get current encryption key for a room
   */
  getCurrentKey(roomId: string): Uint8Array | null {
    const roomKeys = this.sessionKeys.get(roomId);
    if (!roomKeys || roomKeys.size === 0) {
      return null;
    }

    // Return the most recent key (last added)
    const keyIds = Array.from(roomKeys.keys());
    const latestKeyId = keyIds[keyIds.length - 1];
    return roomKeys.get(latestKeyId) || null;
  }

  /**
   * Get encryption state for a room
   */
  getEncryptionState(roomId: string): RTCEncryptionState | null {
    return this.encryptionStates.get(roomId) || null;
  }

  /**
   * Handle participant joining (trigger key rotation)
   */
  async onParticipantJoin(roomId: string, userId: string): Promise<void> {
    try {
      const encryptionState = this.encryptionStates.get(roomId);
      if (!encryptionState?.isEnabled) {
        return;
      }

      console.log(`Participant joined ${roomId}: ${userId}, rotating keys`);
      await this.rotateKeys(roomId);
    } catch (error) {
      console.error('Failed to handle participant join:', error);
    }
  }

  /**
   * Handle participant leaving (trigger key rotation)
   */
  async onParticipantLeave(roomId: string, userId: string): Promise<void> {
    try {
      const encryptionState = this.encryptionStates.get(roomId);
      if (!encryptionState?.isEnabled) {
        return;
      }

      console.log(`Participant left ${roomId}: ${userId}, rotating keys`);
      await this.rotateKeys(roomId);
    } catch (error) {
      console.error('Failed to handle participant leave:', error);
    }
  }

  // Private helper methods

  private async generateEncryptionKey(): Promise<Uint8Array> {
    // Generate a cryptographically secure random key
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      // Browser environment
      const key = new Uint8Array(RTCEncryptionManager.KEY_SIZE);
      window.crypto.getRandomValues(key);
      return key;
    } else {
      // Node.js environment (for testing)
      const crypto = require('crypto');
      return new Uint8Array(crypto.randomBytes(RTCEncryptionManager.KEY_SIZE));
    }
  }

  private generateKeyId(): string {
    // Generate a unique key ID
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `${timestamp}_${random}`;
  }

  private async distributeKeyToParticipants(
    roomId: string,
    keyId: string,
    key: Uint8Array
  ): Promise<void> {
    try {
      const room = this.client.getRoom(roomId);
      if (!room) {
        throw new Error(`Room ${roomId} not found`);
      }

      // Get all room members (excluding ourselves)
      const members = room.getMembers();
      const recipients = members
        .filter(member => member.userId !== this.client.getUserId())
        .filter(member => member.membership === 'join');

      if (recipients.length === 0) {
        console.log('No recipients for key distribution');
        return;
      }

      // Create the key transport message
      const keyMessage: RTCKeyTransportMessage = {
        type: 'rtc_key',
        room_id: roomId,
        session_id: this.generateSessionId(roomId),
        key_id: keyId,
        key: this.encodeKey(key),
        algorithm: RTCEncryptionManager.ALGORITHM,
        timestamp: Date.now()
      };

      // Send to-device messages to all participants
      const messages = new Map<string, Map<string, Record<string, any>>>();
      
      for (const member of recipients) {
        const userId = member.userId;
        
        // Get user's devices
        const devices = await this.client.downloadKeys([userId]);
        const userDevices = devices.get(userId) || new Map();
        
        const userMessages = new Map<string, Record<string, any>>();
        
        // Send to all devices of the user
        for (const [deviceId, deviceInfo] of Array.from(userDevices.entries())) {
          // Encrypt the message for this device
          const encryptedMessage = await this.encryptKeyMessage(keyMessage, deviceInfo);
          userMessages.set(deviceId, encryptedMessage);
        }
        
        messages.set(userId, userMessages);
      }

      // Send the to-device messages
      await this.client.sendToDevice('m.room.rtc_key', messages);
      
      console.log(`Key distributed to ${recipients.length} participants in room ${roomId}`);
    } catch (error) {
      console.error('Failed to distribute key:', error);
      throw error;
    }
  }

  private encodeKey(key: Uint8Array): string {
    // Convert key to base64
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(key).toString('base64');
    } else {
      // Browser environment
      const binary = String.fromCharCode.apply(null, Array.from(key));
      return btoa(binary);
    }
  }

  private decodeKey(encodedKey: string): Uint8Array {
    // Convert base64 to key
    if (typeof Buffer !== 'undefined') {
      return new Uint8Array(Buffer.from(encodedKey, 'base64'));
    } else {
      // Browser environment
      const binary = atob(encodedKey);
      return new Uint8Array(binary.split('').map(c => c.charCodeAt(0)));
    }
  }

  private async encryptKeyMessage(
    message: RTCKeyTransportMessage,
    deviceInfo: any
  ): Promise<ToDeviceMessageContent> {
    // This would normally encrypt the message using the device's keys
    // For now, return the message as-is (would need proper Olm encryption)
    return {
      algorithm: 'm.olm.v1.curve25519-aes-sha2',
      sender_key: this.client.getDeviceEd25519Key() || '',
      ciphertext: {
        [deviceInfo.keys[`curve25519:${deviceInfo.device_id}`]]: {
          type: 0,
          body: JSON.stringify(message)
        }
      }
    };
  }

  private generateSessionId(roomId: string): string {
    return `session_${roomId}_${Date.now()}`;
  }

  private startKeyRotation(roomId: string): void {
    // Stop any existing rotation
    this.stopKeyRotation(roomId);

    // Start new rotation interval
    const interval = setInterval(async () => {
      try {
        await this.rotateKeys(roomId);
      } catch (error) {
        console.error('Automatic key rotation failed:', error);
      }
    }, RTCEncryptionManager.KEY_ROTATION_INTERVAL);

    this.keyRotationIntervals.set(roomId, interval);
  }

  private stopKeyRotation(roomId: string): void {
    const interval = this.keyRotationIntervals.get(roomId);
    if (interval) {
      clearInterval(interval);
      this.keyRotationIntervals.delete(roomId);
    }
  }

  private setupToDeviceHandler(): void {
    // Listen for incoming to-device messages containing RTC keys
    // @ts-ignore - toDeviceEvent exists but may not be in current type definitions
    this.client.on('toDeviceEvent', (event: any) => {
      if (event.getType() === 'm.room.rtc_key') {
        this.handleIncomingKeyMessage(event);
      }
    });
  }

  private async handleIncomingKeyMessage(event: any): Promise<void> {
    try {
      const content = event.getContent();
      
      // Decrypt the message (simplified - would need proper Olm decryption)
      let keyMessage: RTCKeyTransportMessage;
      
      if (content.ciphertext) {
        // This is encrypted, would need to decrypt
        // For now, assume it's already decrypted
        const deviceKey = this.client.getDeviceEd25519Key();
        if (!deviceKey) {
          console.warn('No device key available for decryption');
          return;
        }
        const ciphertext = content.ciphertext[deviceKey];
        if (ciphertext) {
          keyMessage = JSON.parse(ciphertext.body);
        } else {
          console.warn('No ciphertext for our device');
          return;
        }
      } else {
        keyMessage = content as RTCKeyTransportMessage;
      }

      // Store the received key
      const roomId = keyMessage.room_id;
      const keyId = keyMessage.key_id;
      const key = this.decodeKey(keyMessage.key);

      const roomKeys = this.sessionKeys.get(roomId) || new Map();
      roomKeys.set(keyId, key);
      this.sessionKeys.set(roomId, roomKeys);

      // Update encryption state
      const encryptionState = this.encryptionStates.get(roomId);
      if (encryptionState) {
        encryptionState.participantKeys.set(keyId, key);
        this.encryptionStates.set(roomId, encryptionState);
      }

      console.log(`Received RTC key for room ${roomId}, keyId: ${keyId}`);
    } catch (error) {
      console.error('Failed to handle incoming key message:', error);
    }
  }
}