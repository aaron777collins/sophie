'use client'

import { MatrixClient, Room, MatrixEvent, RoomEvent, EventType, Preset, Visibility } from 'matrix-js-sdk'

// Use console instead of matrix logger for client-side compatibility
const logger = {
  info: console.log,
  warn: console.warn,
  error: console.error,
}

/**
 * Room encryption utilities for Matrix E2EE rooms
 * Handles room encryption setup, status checking, and message encryption/decryption
 */

/**
 * Enable encryption for a Matrix room
 */
export async function enableRoomEncryption(client: MatrixClient, roomId: string): Promise<void> {
  try {
    logger.info('Enabling encryption for room:', roomId)
    
    const room = client.getRoom(roomId)
    if (!room) {
      throw new Error(`Room ${roomId} not found`)
    }

    // Check if encryption is already enabled
    if (isRoomEncrypted(room)) {
      logger.info('Room is already encrypted:', roomId)
      return
    }

    // Check if crypto is available
    if (!client.isCryptoEnabled()) {
      throw new Error('Crypto is not enabled on this client')
    }

    // Send encryption event to enable E2EE
    await client.sendStateEvent(
      roomId,
      EventType.RoomEncryption,
      {
        algorithm: 'm.megolm.v1.aes-sha2', // Standard Megolm algorithm
        rotation_period_ms: 604800000, // 7 days (default rotation period)
        rotation_period_msgs: 100, // Rotate after 100 messages (default)
      },
      '' // Empty state key for room-wide encryption
    )

    logger.info('Encryption enabled for room:', roomId)

  } catch (error) {
    logger.error('Failed to enable room encryption:', error)
    throw error
  }
}

/**
 * Check if a room is encrypted
 */
export function isRoomEncrypted(room: Room): boolean {
  const encryptionEvent = room.currentState.getStateEvents(EventType.RoomEncryption, '')
  return encryptionEvent !== null && encryptionEvent !== undefined
}

/**
 * Get room encryption algorithm
 */
export function getRoomEncryptionAlgorithm(room: Room): string | null {
  const encryptionEvent = room.currentState.getStateEvents(EventType.RoomEncryption, '')
  return encryptionEvent?.getContent()?.algorithm || null
}

/**
 * Check if the client can decrypt messages in this room
 */
export function canDecryptInRoom(client: MatrixClient, room: Room): boolean {
  // Must have crypto enabled and room must be encrypted
  return client.isCryptoEnabled() && isRoomEncrypted(room)
}

/**
 * Create a new encrypted room with encryption enabled by default
 */
export async function createEncryptedRoom(
  client: MatrixClient, 
  options: {
    name?: string
    topic?: string 
    invite?: string[]
    preset?: Preset
    visibility?: Visibility
    room_alias_name?: string
    power_level_content_override?: any
    initial_state?: any[]
  } = {}
): Promise<Room> {
  try {
    logger.info('Creating encrypted room with options:', options)

    // Check if crypto is available
    if (!client.isCryptoEnabled()) {
      throw new Error('Crypto is not enabled on this client')
    }

    // Create the room first
    const { room_id } = await client.createRoom({
      name: options.name,
      topic: options.topic,
      invite: options.invite,
      preset: options.preset,
      visibility: options.visibility,
      room_alias_name: options.room_alias_name,
      power_level_content_override: options.power_level_content_override,
      // Add encryption to the initial state
      initial_state: [
        ...(options.initial_state || []),
        {
          type: EventType.RoomEncryption,
          state_key: '',
          content: {
            algorithm: 'm.megolm.v1.aes-sha2',
            rotation_period_ms: 604800000, // 7 days
            rotation_period_msgs: 100, // 100 messages
          }
        }
      ]
    })

    // Wait for the room to appear in the client
    let room = client.getRoom(room_id)
    let retries = 0
    while (!room && retries < 10) {
      await new Promise(resolve => setTimeout(resolve, 100))
      room = client.getRoom(room_id)
      retries++
    }

    if (!room) {
      throw new Error('Failed to get created room')
    }

    logger.info('Created encrypted room:', room_id)
    return room

  } catch (error) {
    logger.error('Failed to create encrypted room:', error)
    throw error
  }
}

/**
 * Handle decryption errors gracefully
 */
export function handleDecryptionError(event: MatrixEvent, error: any): string {
  logger.warn('Decryption failed for event:', event.getId(), error)

  // Different error messages based on error type
  if (error?.name === 'DecryptionError') {
    const errorCode = typeof error === 'object' && 'code' in error ? error.code : null
    switch (errorCode) {
      case 'MEGOLM_NO_SESSION':
        return 'Unable to decrypt: missing session keys'
      case 'MEGOLM_BAD_SESSION':
        return 'Unable to decrypt: corrupted session'
      case 'MEGOLM_UNKNOWN_INBOUND_SESSION_ID':
        return 'Unable to decrypt: unknown session'
      default:
        return 'Unable to decrypt: session error'
    }
  }

  const errorMessage = typeof error === 'object' && error !== null && 'message' in error 
    ? (error as { message: string }).message 
    : String(error)

  if (errorMessage.includes('not supported')) {
    return 'Unable to decrypt: unsupported algorithm'
  }

  // Generic fallback
  return 'Unable to decrypt this message'
}

/**
 * Get the decrypted content of a message event, handling errors gracefully
 */
export function getDecryptedMessageContent(event: MatrixEvent): {
  body: string
  formatted_body?: string
  msgtype: string
  decryption_error?: string
} {
  try {
    // If event is not encrypted, return content directly
    if (event.getType() !== 'm.room.encrypted') {
      const content = event.getContent()
      return {
        body: content.body || '',
        formatted_body: content.formatted_body,
        msgtype: content.msgtype || 'm.text'
      }
    }

    // Try to get decrypted content
    const decryptedContent = event.getClearContent()
    
    if (decryptedContent && decryptedContent.body) {
      return {
        body: decryptedContent.body,
        formatted_body: decryptedContent.formatted_body,
        msgtype: decryptedContent.msgtype || 'm.text'
      }
    }

    // If no decrypted content, this is likely a decryption failure
    const error = event.decryptionFailureReason || new Error('Unknown decryption error')
    const errorMessage = typeof error === 'object' && error !== null && 'message' in error 
      ? (error as { message: string }).message 
      : 'Decryption failed'
    return {
      body: handleDecryptionError(event, error),
      msgtype: 'm.text',
      decryption_error: errorMessage
    }

  } catch (error) {
    logger.error('Error getting message content:', error)
    const errorMessage = typeof error === 'object' && error !== null && 'message' in error 
      ? (error as { message: string }).message 
      : 'Content processing failed'
    return {
      body: handleDecryptionError(event, error),
      msgtype: 'm.text', 
      decryption_error: errorMessage
    }
  }
}

/**
 * Check if a message event failed to decrypt
 */
export function isDecryptionError(event: MatrixEvent): boolean {
  return event.getType() === 'm.room.encrypted' && 
         (!event.getClearContent() || !!event.decryptionFailureReason)
}

/**
 * Set up event listeners for room encryption events
 */
export function setupRoomEncryptionListeners(
  client: MatrixClient,
  roomId: string,
  callbacks: {
    onEncryptionEnabled?: () => void
    onDecryptionError?: (event: MatrixEvent, error: any) => void
    onKeyReceived?: (event: MatrixEvent) => void
  } = {}
) {
  const room = client.getRoom(roomId)
  if (!room) {
    logger.warn('Cannot set up encryption listeners: room not found:', roomId)
    return () => {} // Return no-op cleanup
  }

  const handleStateEvent = (event: MatrixEvent) => {
    if (event.getType() === EventType.RoomEncryption && event.getRoomId() === roomId) {
      logger.info('Encryption enabled for room:', roomId)
      callbacks.onEncryptionEnabled?.()
    }
  }

  const handleDecryptionFailure = (event: MatrixEvent) => {
    if (event.getRoomId() === roomId) {
      const error = event.decryptionFailureReason || new Error('Unknown decryption error')
      logger.warn('Decryption failed for event in room:', roomId, event.getId())
      callbacks.onDecryptionError?.(event, error)
    }
  }

  const handleEventDecrypted = (event: MatrixEvent) => {
    if (event.getRoomId() === roomId && event.getType() === 'm.room.encrypted') {
      logger.info('Event decrypted in room:', roomId, event.getId())
      callbacks.onKeyReceived?.(event)
    }
  }

  // Set up listeners
  room.on(RoomEvent.Timeline, handleStateEvent)
  
  // Note: Crypto event listeners would need specific Matrix SDK version
  // For now, just handle timeline events
  // TODO: Add crypto event listeners when Matrix SDK is properly typed

  // Return cleanup function
  return () => {
    room.off(RoomEvent.Timeline, handleStateEvent)
  }
}

/**
 * Room encryption status interface
 */
export interface RoomEncryptionStatus {
  isEncrypted: boolean
  algorithm: string | null
  canDecrypt: boolean
  hasUnverifiedDevices: boolean
  keyBackupEnabled: boolean
}

/**
 * Get comprehensive encryption status for a room
 */
export function getRoomEncryptionStatus(client: MatrixClient, room: Room): RoomEncryptionStatus {
  const isEncrypted = isRoomEncrypted(room)
  const algorithm = getRoomEncryptionAlgorithm(room)
  const canDecrypt = canDecryptInRoom(client, room)

  // TODO: Implement device verification checking
  const hasUnverifiedDevices = false

  // TODO: Implement key backup status checking
  const keyBackupEnabled = false

  return {
    isEncrypted,
    algorithm,
    canDecrypt,
    hasUnverifiedDevices,
    keyBackupEnabled
  }
}