'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { MatrixClient, Room, MatrixEvent, RoomEvent, Direction, EventType, ClientEvent } from 'matrix-js-sdk'
import { useMatrix } from '../components/providers/matrix-provider'
import { 
  getDecryptedMessageContent, 
  isDecryptionError, 
  setupRoomEncryptionListeners,
  isRoomEncrypted
} from '../lib/matrix/crypto/room-encryption'

// Use console instead of matrix logger for client-side compatibility
const logger = {
  info: console.log,
  warn: console.warn,
  error: console.error,
}

/**
 * Message interface with decryption support
 */
export interface DecryptedMessage {
  id: string
  eventId: string
  roomId: string
  sender: string
  senderName: string
  body: string
  formatted_body?: string
  msgtype: string
  timestamp: number
  edited?: boolean
  decryption_error?: string
  isEncrypted: boolean
  canDecrypt: boolean
  // Media/file info
  url?: string
  file?: {
    mimetype?: string
    size?: number
    url: string
  }
  // Relations (replies, edits, reactions)
  relatesToEventId?: string
  relationshipType?: string
}

/**
 * Hook for fetching and managing room messages with encryption support
 */
export function useRoomMessages(roomId: string) {
  const { client, isCryptoReady } = useMatrix()
  const [messages, setMessages] = useState<DecryptedMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [room, setRoom] = useState<Room | null>(null)
  const [isEncrypted, setIsEncrypted] = useState(false)

  // Track pagination token for loading more messages
  const paginationTokenRef = useRef<string | null>(null)
  const listenersCleanupRef = useRef<(() => void) | null>(null)

  /**
   * Convert Matrix event to DecryptedMessage interface
   */
  const eventToMessage = useCallback((event: MatrixEvent): DecryptedMessage | null => {
    // Only handle message events
    if (event.getType() !== 'm.room.message' && event.getType() !== 'm.room.encrypted') {
      return null
    }

    // Skip redacted events
    if (event.isRedacted()) {
      return null
    }

    try {
      const sender = event.getSender()
      const timestamp = event.getTs()
      const isEventEncrypted = event.getType() === 'm.room.encrypted'
      
      // Get sender display name
      let senderName = sender || 'Unknown'
      if (room) {
        const member = room.getMember(sender || '')
        if (member) {
          senderName = member.name || member.userId
        }
      }

      // Get decrypted content
      const content = getDecryptedMessageContent(event)

      // Check for relations (replies, edits, reactions)
      const relation = event.getRelation()
      
      // Get raw content for media URLs
      const rawContent = event.getContent()
      
      const message: DecryptedMessage = {
        id: event.getId() || '',
        eventId: event.getId() || '',
        roomId: event.getRoomId() || '',
        sender: sender || '',
        senderName,
        body: content.body,
        formatted_body: content.formatted_body,
        msgtype: content.msgtype,
        timestamp,
        edited: false, // TODO: Track edit history
        decryption_error: content.decryption_error,
        isEncrypted: isEventEncrypted,
        canDecrypt: !content.decryption_error && isEventEncrypted,
        // Media handling from raw content
        url: rawContent['url'],
        file: rawContent['file'],
        // Relations
        relatesToEventId: relation?.event_id,
        relationshipType: relation?.rel_type,
      }

      return message

    } catch (error) {
      logger.error('Error converting event to message:', error)
      return null
    }
  }, [room])

  /**
   * Load messages from the room timeline
   */
  const loadMessages = useCallback(async (limit: number = 50, backwards: boolean = true) => {
    if (!client || !room) {
      logger.warn('Cannot load messages: no client or room')
      return []
    }

    try {
      setLoading(true)
      setError(null)

      logger.info(`Loading ${limit} messages from room ${roomId} (backwards: ${backwards})`)

      // Get messages from room timeline
      const timeline = room.getLiveTimeline()
      const events = timeline.getEvents()
      
      // If we have no events yet, try to paginate
      if (events.length === 0 || backwards) {
        const canPaginate = await client.paginateEventTimeline(
          timeline,
          {
            backwards,
            limit
          }
        )
        
        setHasMore(canPaginate)
      }

      // Get all timeline events and convert to messages
      const timelineEvents = timeline.getEvents()
      const newMessages: DecryptedMessage[] = []

      for (const event of timelineEvents) {
        const message = eventToMessage(event)
        if (message) {
          newMessages.push(message)
        }
      }

      // Sort by timestamp (oldest first)
      newMessages.sort((a, b) => a.timestamp - b.timestamp)

      logger.info(`Loaded ${newMessages.length} messages from room ${roomId}`)
      return newMessages

    } catch (error: any) {
      logger.error('Failed to load messages:', error)
      setError(error.message || 'Failed to load messages')
      return []
    } finally {
      setLoading(false)
    }
  }, [client, room, roomId, eventToMessage])

  /**
   * Load more historical messages (pagination)
   */
  const loadMore = useCallback(async (): Promise<DecryptedMessage[]> => {
    if (!hasMore || loading) {
      return []
    }

    logger.info('Loading more messages...')
    return await loadMessages(50, true)
  }, [hasMore, loading, loadMessages])

  /**
   * Send a message to the room
   */
  const sendMessage = useCallback(async (
    content: {
      body: string
      formatted_body?: string
      msgtype?: string
    }
  ): Promise<void> => {
    if (!client || !room) {
      throw new Error('Cannot send message: no client or room')
    }

    try {
      logger.info('Sending message to room:', roomId)
      
      const messageContent: any = {
        msgtype: content.msgtype || 'm.text',
        body: content.body,
        ...(content.formatted_body && {
          format: 'org.matrix.custom.html',
          formatted_body: content.formatted_body
        })
      }

      await client.sendEvent(roomId, EventType.RoomMessage, messageContent)
      logger.info('Message sent successfully')

    } catch (error: any) {
      logger.error('Failed to send message:', error)
      throw error
    }
  }, [client, room, roomId])

  /**
   * Handle real-time message updates
   */
  const handleTimelineUpdate = useCallback((event: MatrixEvent) => {
    if (event.getRoomId() !== roomId) return

    // Handle new messages
    if (event.getType() === 'm.room.message' || event.getType() === 'm.room.encrypted') {
      const message = eventToMessage(event)
      if (message) {
        setMessages(prev => {
          // Check if message already exists (avoid duplicates)
          const exists = prev.some(m => m.eventId === message.eventId)
          if (exists) return prev
          
          // Add new message and sort
          const updated = [...prev, message].sort((a, b) => a.timestamp - b.timestamp)
          return updated
        })
      }
    }
  }, [roomId, eventToMessage])

  /**
   * Handle decryption events
   */
  const handleDecryptionUpdate = useCallback((event: MatrixEvent) => {
    if (event.getRoomId() !== roomId) return

    logger.info('Message decrypted, updating:', event.getId())
    
    // Update the existing message with decrypted content
    setMessages(prev => prev.map(msg => {
      if (msg.eventId === event.getId()) {
        const updatedContent = getDecryptedMessageContent(event)
        return {
          ...msg,
          body: updatedContent.body,
          formatted_body: updatedContent.formatted_body,
          decryption_error: updatedContent.decryption_error,
          canDecrypt: !updatedContent.decryption_error,
        }
      }
      return msg
    }))
  }, [roomId])

  /**
   * Initialize room and load initial messages
   */
  useEffect(() => {
    if (!client || !roomId) {
      setRoom(null)
      setMessages([])
      return
    }

    const foundRoom = client.getRoom(roomId)
    if (!foundRoom) {
      logger.warn('Room not found:', roomId)
      setError('Room not found')
      return
    }

    setRoom(foundRoom)
    setIsEncrypted(isRoomEncrypted(foundRoom))

    // Load initial messages
    loadMessages().then(initialMessages => {
      setMessages(initialMessages)
    })

  }, [client, roomId, loadMessages])

  /**
   * Set up event listeners
   */
  useEffect(() => {
    if (!client || !room) return

    logger.info('Setting up message listeners for room:', roomId)

    // Set up timeline listener
    room.on(RoomEvent.Timeline, handleTimelineUpdate)
    
    // TODO: Set up crypto event listeners when Matrix SDK typing issues are resolved
    
    // Set up encryption listeners if room is encrypted
    if (isEncrypted) {
      const cleanup = setupRoomEncryptionListeners(client, roomId, {
        onDecryptionError: (event, error) => {
          logger.warn('Decryption error in room:', roomId, error)
          // Trigger update for failed message
          handleDecryptionUpdate(event)
        },
        onKeyReceived: (event) => {
          logger.info('New key received, attempting to decrypt:', event.getId())
          // Trigger update for newly decryptable message  
          handleDecryptionUpdate(event)
        }
      })
      
      listenersCleanupRef.current = cleanup
    }

    // Cleanup function
    return () => {
      room.off(RoomEvent.Timeline, handleTimelineUpdate)
      
      if (listenersCleanupRef.current) {
        listenersCleanupRef.current()
        listenersCleanupRef.current = null
      }
    }
  }, [client, room, roomId, isEncrypted, handleTimelineUpdate, handleDecryptionUpdate])

  return {
    // State
    messages,
    loading,
    error,
    hasMore,
    room,
    isEncrypted,
    
    // Actions  
    loadMore,
    sendMessage,
    reload: () => loadMessages().then(setMessages),
    
    // Crypto info
    isCryptoReady,
    canDecrypt: isCryptoReady && isEncrypted,
  }
}