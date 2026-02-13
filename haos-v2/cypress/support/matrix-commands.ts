// Matrix SDK Integration Commands

Cypress.Commands.add('matrixLogin', (userId: string, password: string) => {
  cy.window().then((win) => {
    // Mock Matrix client login
    const mockClient = {
      userId: userId,
      accessToken: 'mock-access-token',
      deviceId: 'mock-device-id',
      isLoggedIn: () => true,
      getUserId: () => userId,
      getAccessToken: () => 'mock-access-token'
    }
    
    // Store in window for app to use
    win.matrixClient = mockClient
    win.localStorage.setItem('mx_access_token', 'mock-access-token')
    win.localStorage.setItem('mx_user_id', userId)
    win.localStorage.setItem('mx_device_id', 'mock-device-id')
  })
})

Cypress.Commands.add('joinMatrixRoom', (roomId: string) => {
  cy.window().then((win) => {
    // Mock joining a Matrix room
    const mockRoom = {
      roomId: roomId,
      name: `Test Room ${roomId}`,
      members: [],
      timeline: [],
      joinRule: 'public'
    }
    
    // Add to mock client rooms
    if (!win.matrixClient.rooms) {
      win.matrixClient.rooms = new Map()
    }
    win.matrixClient.rooms.set(roomId, mockRoom)
  })
})

Cypress.Commands.add('createMatrixRoom', (roomName: string) => {
  cy.window().then((win) => {
    const roomId = `!${Math.random().toString(36).substr(2, 9)}:matrix.org`
    const mockRoom = {
      roomId: roomId,
      name: roomName,
      members: [win.matrixClient.userId],
      timeline: [],
      joinRule: 'invite',
      powerLevels: {
        [win.matrixClient.userId]: 100
      }
    }
    
    if (!win.matrixClient.rooms) {
      win.matrixClient.rooms = new Map()
    }
    win.matrixClient.rooms.set(roomId, mockRoom)
    
    return cy.wrap(roomId)
  })
})

Cypress.Commands.add('sendMatrixMessage', (roomId: string, message: string) => {
  cy.window().then((win) => {
    const room = win.matrixClient.rooms?.get(roomId)
    if (room) {
      const event = {
        eventId: `$${Math.random().toString(36).substr(2, 9)}`,
        roomId: roomId,
        sender: win.matrixClient.userId,
        type: 'm.room.message',
        content: {
          msgtype: 'm.text',
          body: message
        },
        timestamp: Date.now()
      }
      
      if (!room.timeline) room.timeline = []
      room.timeline.push(event)
    }
  })
})

// Matrix State Management Commands
Cypress.Commands.add('setMatrixServerConfig', (config: any) => {
  cy.window().then((win) => {
    win.localStorage.setItem('mx_hs_url', config.homeserverUrl || 'https://matrix.org')
    win.localStorage.setItem('mx_is_url', config.identityServerUrl || 'https://vector.im')
  })
})

Cypress.Commands.add('mockMatrixSync', (syncData: any) => {
  cy.intercept('GET', '**/_matrix/client/r0/sync*', {
    statusCode: 200,
    body: {
      next_batch: `s${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      rooms: {
        join: syncData.joinedRooms || {},
        invite: syncData.invitedRooms || {},
        leave: syncData.leftRooms || {}
      },
      presence: {
        events: syncData.presence || []
      },
      account_data: {
        events: syncData.accountData || []
      }
    }
  }).as('matrixSync')
})

Cypress.Commands.add('mockMatrixRoomMessages', (roomId: string, messages: any[]) => {
  cy.intercept('GET', `**/_matrix/client/r0/rooms/${encodeURIComponent(roomId)}/messages*`, {
    statusCode: 200,
    body: {
      start: 't1-start',
      end: 't1-end',
      chunk: messages.map((msg, index) => ({
        event_id: `$event_${index}`,
        type: 'm.room.message',
        room_id: roomId,
        sender: msg.sender || '@test:matrix.org',
        content: {
          msgtype: 'm.text',
          body: msg.body
        },
        origin_server_ts: Date.now() - (messages.length - index) * 1000
      }))
    }
  }).as('matrixRoomMessages')
})

Cypress.Commands.add('mockMatrixUserProfile', (userId: string, profile: any) => {
  cy.intercept('GET', `**/_matrix/client/r0/profile/${encodeURIComponent(userId)}`, {
    statusCode: 200,
    body: {
      displayname: profile.displayName || userId,
      avatar_url: profile.avatarUrl || null
    }
  }).as('matrixUserProfile')
})

// Voice/Video Mock Commands
Cypress.Commands.add('mockLiveKitConnection', (roomName: string) => {
  cy.window().then((win) => {
    // Mock LiveKit Room connection
    const mockLiveKitRoom = {
      name: roomName,
      state: 'connected',
      participants: new Map(),
      localParticipant: {
        identity: win.matrixClient?.userId || 'test-user',
        isMicrophoneEnabled: true,
        isCameraEnabled: false,
        isScreenShareEnabled: false
      },
      connect: cy.stub().resolves(),
      disconnect: cy.stub().resolves(),
      on: cy.stub(),
      off: cy.stub()
    }
    
    win.liveKitRoom = mockLiveKitRoom
  })
})

Cypress.Commands.add('simulateVoiceParticipant', (participantId: string, speaking: boolean = false) => {
  cy.window().then((win) => {
    const room = win.liveKitRoom
    if (room && room.participants) {
      const mockParticipant = {
        identity: participantId,
        isMicrophoneEnabled: true,
        isCameraEnabled: false,
        isSpeaking: speaking,
        audioTracks: speaking ? new Map([['audio', { enabled: true }]]) : new Map(),
        videoTracks: new Map()
      }
      
      room.participants.set(participantId, mockParticipant)
    }
  })
})

// Declare Matrix command types
declare global {
  namespace Cypress {
    interface Chainable {
      matrixLogin(userId: string, password: string): Chainable<void>
      joinMatrixRoom(roomId: string): Chainable<void>
      createMatrixRoom(roomName: string): Chainable<string>
      sendMatrixMessage(roomId: string, message: string): Chainable<void>
      setMatrixServerConfig(config: any): Chainable<void>
      mockMatrixSync(syncData: any): Chainable<void>
      mockMatrixRoomMessages(roomId: string, messages: any[]): Chainable<void>
      mockMatrixUserProfile(userId: string, profile: any): Chainable<void>
      mockLiveKitConnection(roomName: string): Chainable<void>
      simulateVoiceParticipant(participantId: string, speaking?: boolean): Chainable<void>
    }
  }
}