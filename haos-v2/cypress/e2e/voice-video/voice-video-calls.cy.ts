/**
 * Voice and Video Call End-to-End Tests
 * 
 * Tests comprehensive voice/video functionality including:
 * - Joining and leaving voice channels
 * - Voice call quality and controls
 * - Video call initiation and management
 * - Screen sharing functionality
 * - Multi-participant calls
 * - Call permissions and moderation
 * - Mobile voice/video support
 */

describe('Voice and Video Calls', () => {
  let testServer: string
  let voiceChannel: string
  let videoChannel: string

  beforeEach(() => {
    cy.login(Cypress.env('TEST_USER_EMAIL'), Cypress.env('TEST_USER_PASSWORD'))
    
    testServer = `Voice Test Server ${Date.now()}`
    voiceChannel = `voice-${Date.now()}`
    videoChannel = `video-${Date.now()}`
    
    // Create test server with voice channels
    cy.createServer(testServer, 'gaming')
    cy.createChannel(voiceChannel, 'voice')
    cy.createChannel(videoChannel, 'video')
    
    // Mock LiveKit connection
    cy.mockLiveKitConnection('test-room')
  })

  context('Voice Channel Operations', () => {
    it('should join voice channel successfully', () => {
      cy.measurePerformance('voice-channel-join')
      
      // Mock successful voice connection
      cy.intercept('POST', '/api/voice/join', {
        statusCode: 200,
        body: {
          token: 'livekit-token',
          url: 'wss://livekit.example.com',
          roomName: `voice-${voiceChannel}`
        }
      }).as('joinVoice')
      
      // Join voice channel
      cy.get(`[data-cy=voice-channel-${voiceChannel}]`).click()
      cy.get('[data-cy=join-voice-button]').click()
      
      cy.wait('@joinVoice')
      
      // Verify voice controls appear
      cy.get('[data-cy=voice-controls]').should('be.visible')
      cy.get('[data-cy=mute-button]').should('be.visible')
      cy.get('[data-cy=deafen-button]').should('be.visible')
      cy.get('[data-cy=leave-voice-button]').should('be.visible')
      
      // Verify voice indicator shows
      cy.get(`[data-cy=voice-channel-${voiceChannel}]`).should('have.class', 'voice-active')
      cy.get('[data-cy=voice-connection-status]').should('contain.text', 'Connected')
      
      cy.measurePerformance('voice-channel-join')
    })

    it('should leave voice channel properly', () => {
      // Join voice first
      cy.joinVoiceChannel(voiceChannel)
      
      // Mock leave voice API
      cy.intercept('POST', '/api/voice/leave', {
        statusCode: 200,
        body: { success: true }
      }).as('leaveVoice')
      
      // Leave voice channel
      cy.get('[data-cy=leave-voice-button]').click()
      
      cy.wait('@leaveVoice')
      
      // Verify voice controls disappear
      cy.get('[data-cy=voice-controls]').should('not.exist')
      cy.get(`[data-cy=voice-channel-${voiceChannel}]`).should('not.have.class', 'voice-active')
      cy.get('[data-cy=voice-connection-status]').should('not.exist')
    })

    it('should handle voice connection failures', () => {
      cy.intercept('POST', '/api/voice/join', {
        statusCode: 503,
        body: { error: 'Voice server unavailable' }
      }).as('voiceError')
      
      cy.get(`[data-cy=voice-channel-${voiceChannel}]`).click()
      cy.get('[data-cy=join-voice-button]').click()
      
      cy.wait('@voiceError')
      
      // Verify error handling
      cy.get('[data-cy=voice-error]').should('be.visible')
      cy.get('[data-cy=voice-error]').should('contain.text', 'Failed to connect to voice channel')
      cy.get('[data-cy=retry-voice-button]').should('be.visible')
    })

    it('should show voice participants', () => {
      cy.joinVoiceChannel(voiceChannel)
      
      // Simulate other participants joining
      cy.simulateVoiceParticipant('user2', false)
      cy.simulateVoiceParticipant('user3', true) // speaking
      
      // Verify participant list
      cy.get('[data-cy=voice-participants]').should('be.visible')
      cy.get('[data-cy=voice-participant]').should('have.length', 3) // including current user
      
      // Verify speaking indicators
      cy.get('[data-cy=voice-participant-user3]').should('have.class', 'speaking')
      cy.get('[data-cy=speaking-ring]').should('be.visible')
      
      // Verify participant info
      cy.get('[data-cy=voice-participant-user2]').within(() => {
        cy.get('[data-cy=participant-name]').should('contain.text', 'user2')
        cy.get('[data-cy=participant-mute-status]').should('be.visible')
      })
    })
  })

  context('Voice Controls and Quality', () => {
    beforeEach(() => {
      cy.joinVoiceChannel(voiceChannel)
    })

    it('should toggle microphone mute/unmute', () => {
      // Initially unmuted
      cy.get('[data-cy=mute-button]').should('have.attr', 'aria-pressed', 'false')
      cy.get('[data-cy=mic-icon]').should('not.have.class', 'muted')
      
      // Mute microphone
      cy.get('[data-cy=mute-button]').click()
      
      // Verify muted state
      cy.get('[data-cy=mute-button]').should('have.attr', 'aria-pressed', 'true')
      cy.get('[data-cy=mic-icon]').should('have.class', 'muted')
      cy.get('[data-cy=voice-status]').should('contain.text', 'Muted')
      
      // Unmute microphone
      cy.get('[data-cy=mute-button]').click()
      
      // Verify unmuted state
      cy.get('[data-cy=mute-button]').should('have.attr', 'aria-pressed', 'false')
      cy.get('[data-cy=mic-icon]').should('not.have.class', 'muted')
    })

    it('should toggle deafen/undeafen', () => {
      // Initially not deafened
      cy.get('[data-cy=deafen-button]').should('have.attr', 'aria-pressed', 'false')
      
      // Deafen audio
      cy.get('[data-cy=deafen-button]').click()
      
      // Verify deafened state
      cy.get('[data-cy=deafen-button]').should('have.attr', 'aria-pressed', 'true')
      cy.get('[data-cy=audio-icon]').should('have.class', 'deafened')
      cy.get('[data-cy=voice-status]').should('contain.text', 'Deafened')
      
      // Should also mute when deafened
      cy.get('[data-cy=mute-button]').should('have.attr', 'aria-pressed', 'true')
      
      // Undeafen
      cy.get('[data-cy=deafen-button]').click()
      cy.get('[data-cy=deafen-button]').should('have.attr', 'aria-pressed', 'false')
    })

    it('should adjust voice settings', () => {
      // Open voice settings
      cy.get('[data-cy=voice-settings-button]').click()
      cy.get('[data-cy=voice-settings-modal]').should('be.visible')
      
      // Test microphone settings
      cy.get('[data-cy=mic-device-select]').click()
      cy.get('[data-cy=mic-device-default]').click()
      
      // Test input volume
      cy.get('[data-cy=input-volume-slider]').invoke('val', 75).trigger('input')
      cy.get('[data-cy=input-volume-value]').should('contain.text', '75%')
      
      // Test voice activation
      cy.get('[data-cy=voice-activation-toggle]').click()
      cy.get('[data-cy=voice-activation-threshold]').should('be.visible')
      
      // Test push-to-talk
      cy.get('[data-cy=push-to-talk-toggle]').click()
      cy.get('[data-cy=ptt-keybind-input]').should('be.visible')
      
      // Save settings
      cy.get('[data-cy=save-voice-settings]').click()
      
      // Verify settings applied
      cy.get('[data-cy=voice-settings-saved]').should('be.visible')
    })

    it('should handle push-to-talk functionality', () => {
      // Enable push-to-talk
      cy.get('[data-cy=voice-settings-button]').click()
      cy.get('[data-cy=push-to-talk-toggle]').click()
      cy.get('[data-cy=ptt-keybind-input]').type('{ctrl}')
      cy.get('[data-cy=save-voice-settings]').click()
      
      // Test push-to-talk
      cy.get('body').type('{ctrl}', { release: false })
      cy.get('[data-cy=ptt-indicator]').should('be.visible')
      cy.get('[data-cy=ptt-indicator]').should('contain.text', 'Push to Talk Active')
      
      // Release key
      cy.get('body').type('{ctrl}', { release: true })
      cy.get('[data-cy=ptt-indicator]').should('not.be.visible')
    })

    it('should show voice quality indicators', () => {
      // Mock network quality data
      cy.window().then((win) => {
        win.dispatchEvent(new CustomEvent('voice-quality-update', {
          detail: {
            connectionQuality: 'excellent',
            latency: 45,
            packetLoss: 0.1,
            jitter: 2.3
          }
        }))
      })
      
      // Verify quality indicators
      cy.get('[data-cy=voice-quality-indicator]').should('be.visible')
      cy.get('[data-cy=connection-quality]').should('contain.text', 'Excellent')
      cy.get('[data-cy=latency-value]').should('contain.text', '45ms')
      
      // Test poor quality warning
      cy.window().then((win) => {
        win.dispatchEvent(new CustomEvent('voice-quality-update', {
          detail: {
            connectionQuality: 'poor',
            latency: 250,
            packetLoss: 5.2
          }
        }))
      })
      
      cy.get('[data-cy=voice-quality-warning]').should('be.visible')
      cy.get('[data-cy=voice-quality-warning]').should('contain.text', 'Poor connection quality')
    })
  })

  context('Video Calls', () => {
    it('should start video call successfully', () => {
      cy.measurePerformance('video-call-start')
      
      // Join voice channel first
      cy.joinVoiceChannel(videoChannel)
      
      // Mock video call API
      cy.intercept('POST', '/api/video/start', {
        statusCode: 200,
        body: {
          success: true,
          participantId: 'participant123'
        }
      }).as('startVideo')
      
      // Start video call
      cy.get('[data-cy=start-video-button]').click()
      
      cy.wait('@startVideo')
      
      // Verify video interface
      cy.get('[data-cy=video-call-container]').should('be.visible')
      cy.get('[data-cy=local-video]').should('be.visible')
      cy.get('[data-cy=video-controls]').should('be.visible')
      
      // Verify video controls
      cy.get('[data-cy=camera-toggle-button]').should('be.visible')
      cy.get('[data-cy=screen-share-button]').should('be.visible')
      cy.get('[data-cy=end-call-button]').should('be.visible')
      
      cy.measurePerformance('video-call-start')
    })

    it('should toggle camera on/off', () => {
      cy.startVideoCall()
      
      // Initially camera should be off (per requirements)
      cy.get('[data-cy=camera-toggle-button]').should('have.attr', 'aria-pressed', 'false')
      cy.get('[data-cy=local-video]').should('have.class', 'camera-off')
      
      // Turn camera on
      cy.get('[data-cy=camera-toggle-button]').click()
      
      cy.get('[data-cy=camera-toggle-button]').should('have.attr', 'aria-pressed', 'true')
      cy.get('[data-cy=local-video]').should('not.have.class', 'camera-off')
      cy.get('[data-cy=video-stream]').should('be.visible')
      
      // Turn camera off
      cy.get('[data-cy=camera-toggle-button]').click()
      
      cy.get('[data-cy=camera-toggle-button]').should('have.attr', 'aria-pressed', 'false')
      cy.get('[data-cy=local-video]').should('have.class', 'camera-off')
    })

    it('should handle multiple video participants', () => {
      cy.startVideoCall()
      
      // Simulate other participants joining video
      cy.window().then((win) => {
        win.dispatchEvent(new CustomEvent('participant-joined-video', {
          detail: {
            participantId: 'user2',
            videoTrack: { enabled: true },
            audioTrack: { enabled: true }
          }
        }))
        
        win.dispatchEvent(new CustomEvent('participant-joined-video', {
          detail: {
            participantId: 'user3',
            videoTrack: { enabled: false },
            audioTrack: { enabled: true }
          }
        }))
      })
      
      // Verify participant video grid
      cy.get('[data-cy=video-grid]').should('be.visible')
      cy.get('[data-cy=participant-video]').should('have.length', 3) // including local
      
      // Verify participant with camera off shows avatar
      cy.get('[data-cy=participant-video-user3]').within(() => {
        cy.get('[data-cy=participant-avatar]').should('be.visible')
        cy.get('[data-cy=camera-off-indicator]').should('be.visible')
      })
      
      // Verify participant with camera on shows video
      cy.get('[data-cy=participant-video-user2]').within(() => {
        cy.get('[data-cy=video-stream]').should('be.visible')
        cy.get('[data-cy=participant-name]').should('contain.text', 'user2')
      })
    })

    it('should adapt video layout for different participant counts', () => {
      cy.startVideoCall()
      
      // Test grid layouts for different participant counts
      const participantCounts = [2, 3, 4, 6, 9]
      
      participantCounts.forEach((count, index) => {
        // Simulate participants joining
        for (let i = 1; i < count; i++) {
          cy.window().then((win) => {
            win.dispatchEvent(new CustomEvent('participant-joined-video', {
              detail: { participantId: `user${i}` }
            }))
          })
        }
        
        // Verify appropriate grid layout
        cy.get('[data-cy=video-grid]').should('have.class', `grid-${count <= 4 ? count : 'many'}`)
        cy.get('[data-cy=participant-video]').should('have.length', count)
        
        if (count > 4) {
          cy.get('[data-cy=video-pagination]').should('be.visible')
        }
      })
    })

    it('should end video call properly', () => {
      cy.startVideoCall()
      
      cy.intercept('POST', '/api/video/end', {
        statusCode: 200,
        body: { success: true }
      }).as('endVideo')
      
      // End video call
      cy.get('[data-cy=end-call-button]').click()
      
      cy.wait('@endVideo')
      
      // Verify video interface is hidden
      cy.get('[data-cy=video-call-container]').should('not.exist')
      cy.get('[data-cy=local-video]').should('not.exist')
      
      // Should still be in voice channel
      cy.get('[data-cy=voice-controls]').should('be.visible')
    })
  })

  context('Screen Sharing', () => {
    beforeEach(() => {
      cy.startVideoCall()
    })

    it('should initiate screen sharing', () => {
      cy.measurePerformance('screen-share-start')
      
      // Mock screen share API
      cy.intercept('POST', '/api/screen-share/start', {
        statusCode: 200,
        body: {
          success: true,
          screenShareId: 'screen123'
        }
      }).as('startScreenShare')
      
      // Start screen sharing
      cy.get('[data-cy=screen-share-button]').click()
      
      // Mock browser screen share selection
      cy.window().then((win) => {
        // Simulate screen share permission granted
        win.dispatchEvent(new CustomEvent('screen-share-selected', {
          detail: {
            type: 'screen',
            name: 'Entire Screen'
          }
        }))
      })
      
      cy.wait('@startScreenShare')
      
      // Verify screen share active
      cy.get('[data-cy=screen-share-indicator]').should('be.visible')
      cy.get('[data-cy=screen-share-indicator]').should('contain.text', 'You are sharing your screen')
      cy.get('[data-cy=stop-screen-share-button]').should('be.visible')
      
      // Verify screen share appears in video grid
      cy.get('[data-cy=screen-share-video]').should('be.visible')
      
      cy.measurePerformance('screen-share-start')
    })

    it('should show screen share source selection', () => {
      cy.get('[data-cy=screen-share-button]').click()
      
      // Verify source selection modal
      cy.get('[data-cy=screen-share-source-modal]').should('be.visible')
      
      // Test different source options
      cy.get('[data-cy=source-entire-screen]').should('be.visible')
      cy.get('[data-cy=source-window]').should('be.visible')
      cy.get('[data-cy=source-browser-tab]').should('be.visible')
      
      // Select window sharing
      cy.get('[data-cy=source-window]').click()
      cy.get('[data-cy=window-list]').should('be.visible')
      cy.get('[data-cy=window-option]').first().click()
      
      cy.get('[data-cy=share-selected-source]').click()
      
      // Verify window sharing started
      cy.get('[data-cy=screen-share-indicator]').should('contain.text', 'sharing a window')
    })

    it('should stop screen sharing', () => {
      // Start screen sharing first
      cy.shareScreen()
      
      cy.intercept('POST', '/api/screen-share/stop', {
        statusCode: 200,
        body: { success: true }
      }).as('stopScreenShare')
      
      // Stop screen sharing
      cy.get('[data-cy=stop-screen-share-button]').click()
      
      cy.wait('@stopScreenShare')
      
      // Verify screen share stopped
      cy.get('[data-cy=screen-share-indicator]').should('not.exist')
      cy.get('[data-cy=screen-share-video]').should('not.exist')
      cy.get('[data-cy=screen-share-button]').should('be.visible')
    })

    it('should handle screen share permissions denied', () => {
      cy.get('[data-cy=screen-share-button]').click()
      
      // Simulate permission denied
      cy.window().then((win) => {
        win.dispatchEvent(new CustomEvent('screen-share-error', {
          detail: {
            error: 'Permission denied by user'
          }
        }))
      })
      
      // Verify error handling
      cy.get('[data-cy=screen-share-error]').should('be.visible')
      cy.get('[data-cy=screen-share-error]').should('contain.text', 'Screen sharing permission was denied')
      cy.get('[data-cy=screen-share-help]').should('be.visible')
    })

    it('should handle incoming screen shares from others', () => {
      // Simulate another user starting screen share
      cy.window().then((win) => {
        win.dispatchEvent(new CustomEvent('participant-screen-share', {
          detail: {
            participantId: 'user2',
            screenShareTrack: { enabled: true },
            sourceName: 'user2\'s screen'
          }
        }))
      })
      
      // Verify incoming screen share display
      cy.get('[data-cy=incoming-screen-share]').should('be.visible')
      cy.get('[data-cy=screen-share-presenter]').should('contain.text', 'user2 is sharing their screen')
      
      // Verify screen share takes priority in layout
      cy.get('[data-cy=video-grid]').should('have.class', 'screen-share-layout')
      cy.get('[data-cy=primary-screen-share]').should('be.visible')
      cy.get('[data-cy=participant-thumbnails]').should('be.visible')
    })
  })

  context('Call Permissions and Moderation', () => {
    beforeEach(() => {
      // Set up moderator permissions
      cy.window().then((win) => {
        if (win.matrixClient) {
          win.matrixClient.userPowerLevel = 75 // Moderator level
        }
      })
      
      cy.joinVoiceChannel(voiceChannel)
    })

    it('should enforce voice permissions', () => {
      // Test user with no speak permission
      cy.window().then((win) => {
        win.dispatchEvent(new CustomEvent('user-permission-check', {
          detail: {
            userId: 'restricted-user',
            permission: 'speak',
            allowed: false
          }
        }))
      })
      
      // Verify user appears muted and cannot unmute
      cy.get('[data-cy=voice-participant-restricted-user]').within(() => {
        cy.get('[data-cy=permission-muted-indicator]').should('be.visible')
        cy.get('[data-cy=participant-name]').should('have.class', 'no-speak-permission')
      })
    })

    it('should allow moderators to mute/unmute participants', () => {
      // Simulate another participant
      cy.simulateVoiceParticipant('user2', true) // speaking
      
      // Moderator actions on participant
      cy.get('[data-cy=voice-participant-user2]').rightclick()
      cy.get('[data-cy=participant-context-menu]').should('be.visible')
      
      // Mute participant
      cy.get('[data-cy=mute-participant]').click()
      
      cy.intercept('POST', '/api/voice/moderate', {
        statusCode: 200,
        body: { success: true }
      }).as('moderateUser')
      
      cy.wait('@moderateUser')
      
      // Verify user is server-muted
      cy.get('[data-cy=voice-participant-user2]').within(() => {
        cy.get('[data-cy=server-muted-indicator]').should('be.visible')
      })
      
      // Test other moderation actions
      cy.get('[data-cy=voice-participant-user2]').rightclick()
      cy.get('[data-cy=move-to-channel]').should('be.visible')
      cy.get('[data-cy=disconnect-user]').should('be.visible')
    })

    it('should manage voice channel limits', () => {
      // Set voice channel limit
      cy.get(`[data-cy=voice-channel-${voiceChannel}]`).rightclick()
      cy.get('[data-cy=channel-settings]').click()
      
      cy.get('[data-cy=user-limit-input]').clear().type('3')
      cy.get('[data-cy=save-channel-settings]').click()
      
      // Verify limit indicator
      cy.get(`[data-cy=voice-channel-${voiceChannel}]`).within(() => {
        cy.get('[data-cy=channel-limit]').should('contain.text', '1/3')
      })
      
      // Test limit enforcement
      for (let i = 2; i <= 4; i++) {
        cy.simulateVoiceParticipant(`user${i}`, false)
        
        if (i <= 3) {
          cy.get(`[data-cy=voice-channel-${voiceChannel}]`).within(() => {
            cy.get('[data-cy=channel-limit]').should('contain.text', `${i}/3`)
          })
        } else {
          // Should show channel full indicator
          cy.get(`[data-cy=voice-channel-${voiceChannel}]`).should('have.class', 'channel-full')
        }
      }
    })
  })

  context('Performance and Quality', () => {
    it('should monitor and report call quality metrics', () => {
      cy.joinVoiceChannel(voiceChannel)
      
      // Test quality monitoring
      cy.measurePerformance('voice-quality-monitor')
      
      // Simulate quality data updates
      cy.window().then((win) => {
        const qualityData = [
          { latency: 45, packetLoss: 0.1, jitter: 2.3, quality: 'excellent' },
          { latency: 89, packetLoss: 1.2, jitter: 5.1, quality: 'good' },
          { latency: 156, packetLoss: 3.8, jitter: 12.4, quality: 'poor' }
        ]
        
        qualityData.forEach((data, index) => {
          setTimeout(() => {
            win.dispatchEvent(new CustomEvent('voice-quality-update', { detail: data }))
          }, index * 1000)
        })
      })
      
      // Verify quality metrics are displayed
      cy.get('[data-cy=voice-quality-indicator]').should('be.visible')
      
      // Check quality degradation handling
      cy.wait(3100)
      cy.get('[data-cy=voice-quality-warning]').should('be.visible')
      cy.get('[data-cy=quality-improvement-suggestions]').should('be.visible')
      
      cy.measurePerformance('voice-quality-monitor')
    })

    it('should handle network disconnection gracefully', () => {
      cy.joinVoiceChannel(voiceChannel)
      
      // Simulate network disconnection
      cy.window().then((win) => {
        win.dispatchEvent(new CustomEvent('voice-disconnected', {
          detail: { reason: 'network-error' }
        }))
      })
      
      // Verify disconnection handling
      cy.get('[data-cy=voice-disconnected-notice]').should('be.visible')
      cy.get('[data-cy=voice-reconnecting]').should('be.visible')
      cy.get('[data-cy=reconnect-button]').should('be.visible')
      
      // Test manual reconnection
      cy.get('[data-cy=reconnect-button]').click()
      
      // Verify reconnection attempt
      cy.get('[data-cy=voice-connecting]').should('be.visible')
      
      // Simulate successful reconnection
      cy.window().then((win) => {
        win.dispatchEvent(new CustomEvent('voice-reconnected'))
      })
      
      cy.get('[data-cy=voice-controls]').should('be.visible')
      cy.get('[data-cy=voice-connection-status]').should('contain.text', 'Reconnected')
    })

    it('should optimize performance for large voice channels', () => {
      cy.joinVoiceChannel(voiceChannel)
      
      // Simulate large number of participants
      const participantCount = 25
      for (let i = 1; i <= participantCount; i++) {
        cy.simulateVoiceParticipant(`user${i}`, Math.random() > 0.7)
      }
      
      cy.measureNetworkPerformance()
      cy.measureMemoryUsage()
      
      // Verify performance optimizations
      cy.get('[data-cy=voice-participants]').should('be.visible')
      cy.get('[data-cy=voice-participant]').should('have.length.at.most', 20) // Virtual scrolling
      
      // Verify pagination or virtual scrolling
      cy.get('[data-cy=participants-pagination]').should('be.visible')
      cy.get('[data-cy=participant-count-indicator]').should('contain.text', `${participantCount} in voice`)
    })
  })

  context('Mobile Voice/Video Support', () => {
    beforeEach(() => {
      // Set mobile viewport
      cy.viewport(375, 667)
    })

    it('should adapt voice controls for mobile', () => {
      cy.joinVoiceChannel(voiceChannel)
      
      // Verify mobile-optimized controls
      cy.get('[data-cy=voice-controls]').should('have.class', 'mobile-layout')
      cy.get('[data-cy=voice-controls-drawer]').should('be.visible')
      
      // Test mobile gesture controls
      cy.get('[data-cy=voice-controls-drawer]').swipeUp()
      cy.get('[data-cy=expanded-voice-controls]').should('be.visible')
      
      // Test touch-friendly controls
      cy.get('[data-cy=mobile-mute-button]').should('have.css', 'min-height', '44px')
      cy.get('[data-cy=mobile-mute-button]').tap()
      
      cy.get('[data-cy=voice-status]').should('contain.text', 'Muted')
    })

    it('should handle mobile video calls efficiently', () => {
      cy.joinVoiceChannel(videoChannel)
      cy.startVideoCall()
      
      // Verify mobile video layout
      cy.get('[data-cy=video-call-container]').should('have.class', 'mobile-video-layout')
      cy.get('[data-cy=video-grid]').should('have.class', 'mobile-grid')
      
      // Test portrait/landscape orientation handling
      cy.viewport(667, 375) // landscape
      cy.get('[data-cy=video-grid]').should('have.class', 'landscape-grid')
      
      cy.viewport(375, 667) // portrait
      cy.get('[data-cy=video-grid]').should('have.class', 'portrait-grid')
      
      // Test mobile-specific controls
      cy.get('[data-cy=mobile-video-controls]').should('be.visible')
      cy.get('[data-cy=mobile-end-call-button]').should('be.visible')
    })

    it('should optimize mobile performance', () => {
      cy.joinVoiceChannel(voiceChannel)
      
      // Test reduced quality for mobile
      cy.get('[data-cy=voice-settings-button]').click()
      cy.get('[data-cy=mobile-audio-optimization]').should('be.checked')
      
      // Verify mobile-optimized settings
      cy.get('[data-cy=audio-quality-select]').should('have.value', 'mobile-optimized')
      cy.get('[data-cy=bandwidth-limit]').should('contain.text', '64kbps')
      
      // Test battery usage optimization
      cy.get('[data-cy=battery-saver-mode]').should('be.visible')
      cy.get('[data-cy=battery-saver-mode]').click()
      
      cy.get('[data-cy=voice-processing-reduced]').should('be.visible')
    })
  })

  context('Accessibility', () => {
    beforeEach(() => {
      cy.injectAxe()
    })

    it('should be accessible via keyboard navigation', () => {
      cy.joinVoiceChannel(voiceChannel)
      
      // Test voice controls keyboard navigation
      cy.get('[data-cy=mute-button]').focus()
      cy.testKeyboardNavigation('[data-cy=mute-button]')
      
      // Test keyboard shortcuts
      cy.get('body').type('{ctrl}m') // mute shortcut
      cy.get('[data-cy=voice-status]').should('contain.text', 'Muted')
      
      cy.get('body').type('{ctrl}d') // deafen shortcut
      cy.get('[data-cy=voice-status]').should('contain.text', 'Deafened')
    })

    it('should have proper ARIA labels for voice controls', () => {
      cy.joinVoiceChannel(voiceChannel)
      
      cy.get('[data-cy=mute-button]').should('have.attr', 'aria-label', 'Mute microphone')
      cy.get('[data-cy=deafen-button]').should('have.attr', 'aria-label', 'Deafen audio')
      cy.get('[data-cy=leave-voice-button]').should('have.attr', 'aria-label', 'Leave voice channel')
      
      // Test dynamic ARIA updates
      cy.get('[data-cy=mute-button]').click()
      cy.get('[data-cy=mute-button]').should('have.attr', 'aria-label', 'Unmute microphone')
    })

    it('should meet accessibility standards', () => {
      cy.joinVoiceChannel(voiceChannel)
      cy.checkAccessibility('[data-cy=voice-controls]')
      
      // Test with video call
      cy.startVideoCall()
      cy.checkAccessibility('[data-cy=video-call-container]')
    })

    it('should provide screen reader announcements', () => {
      cy.joinVoiceChannel(voiceChannel)
      
      // Test voice status announcements
      cy.get('[data-cy=mute-button]').click()
      cy.get('[data-cy=sr-announcement]').should('contain.text', 'Microphone muted')
      
      // Test participant join/leave announcements
      cy.simulateVoiceParticipant('user2', false)
      cy.get('[data-cy=sr-announcement]').should('contain.text', 'user2 joined the voice channel')
    })
  })
})