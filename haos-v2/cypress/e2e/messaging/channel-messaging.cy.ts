/**
 * Channel Messaging End-to-End Tests
 * 
 * Tests comprehensive messaging functionality including:
 * - Text message sending and receiving
 * - Emoji reactions and custom emojis
 * - Mentions and notifications
 * - File and media uploads
 * - Message editing and deletion
 * - Message threading and replies
 * - Real-time message synchronization
 */

describe('Channel Messaging', () => {
  let testServer: string
  let testChannel: string

  beforeEach(() => {
    cy.login(Cypress.env('TEST_USER_EMAIL'), Cypress.env('TEST_USER_PASSWORD'))
    
    testServer = `Test Server ${Date.now()}`
    testChannel = `test-channel-${Date.now()}`
    
    // Create test server and channel
    cy.createServer(testServer, 'gaming')
    cy.createChannel(testChannel, 'text')
    
    // Navigate to the test channel
    cy.get(`[data-cy=channel-${testChannel}]`).click()
    cy.get('[data-cy=message-input]').should('be.visible')
  })

  context('Basic Text Messaging', () => {
    it('should send and display text messages', () => {
      const testMessage = `Hello World! ${Date.now()}`
      
      cy.measurePerformance('send-message')
      
      // Send message
      cy.get('[data-cy=message-input]').type(`${testMessage}{enter}`)
      
      // Verify message appears in chat
      cy.get('[data-cy=message-list]').should('contain.text', testMessage)
      cy.get('[data-cy=message-item]').last().within(() => {
        cy.get('[data-cy=message-content]').should('contain.text', testMessage)
        cy.get('[data-cy=message-author]').should('contain.text', 'testuser')
        cy.get('[data-cy=message-timestamp]').should('be.visible')
      })
      
      cy.measurePerformance('send-message')
    })

    it('should handle long messages', () => {
      const longMessage = 'A'.repeat(2000) // 2000 character message
      
      cy.get('[data-cy=message-input]').type(longMessage)
      cy.get('[data-cy=character-count]').should('contain.text', '2000/2000')
      
      cy.get('[data-cy=send-button]').click()
      
      cy.get('[data-cy=message-list]').should('contain.text', longMessage)
      cy.get('[data-cy=message-item]').last().within(() => {
        cy.get('[data-cy=message-content]').should('contain.text', longMessage)
      })
    })

    it('should prevent sending empty messages', () => {
      // Try to send empty message
      cy.get('[data-cy=message-input]').type('{enter}')
      
      // Message should not appear
      cy.get('[data-cy=message-list] [data-cy=message-item]').should('not.exist')
      
      // Try with just whitespace
      cy.get('[data-cy=message-input]').type('   {enter}')
      cy.get('[data-cy=message-list] [data-cy=message-item]').should('not.exist')
    })

    it('should support markdown formatting', () => {
      const markdownMessage = '**Bold text** *italic text* `code block` ~~strikethrough~~'
      
      cy.get('[data-cy=message-input]').type(`${markdownMessage}{enter}`)
      
      cy.get('[data-cy=message-list]').should('contain.text', 'Bold text')
      cy.get('[data-cy=message-item]').last().within(() => {
        cy.get('strong').should('contain.text', 'Bold text')
        cy.get('em').should('contain.text', 'italic text')
        cy.get('code').should('contain.text', 'code block')
        cy.get('del').should('contain.text', 'strikethrough')
      })
    })

    it('should support link previews', () => {
      const messageWithLink = 'Check this out: https://example.com'
      
      // Mock link preview API
      cy.intercept('GET', '/api/link-preview*', {
        statusCode: 200,
        body: {
          title: 'Example Website',
          description: 'An example website',
          image: 'https://example.com/image.jpg',
          url: 'https://example.com'
        }
      }).as('linkPreview')
      
      cy.get('[data-cy=message-input]').type(`${messageWithLink}{enter}`)
      
      cy.wait('@linkPreview')
      
      cy.get('[data-cy=message-item]').last().within(() => {
        cy.get('[data-cy=link-preview]').should('be.visible')
        cy.get('[data-cy=link-title]').should('contain.text', 'Example Website')
        cy.get('[data-cy=link-description]').should('contain.text', 'An example website')
      })
    })
  })

  context('Emoji Support', () => {
    it('should send and display standard emojis', () => {
      const emojiMessage = 'Hello 😀 World! 🚀 Amazing! 🎉'
      
      cy.get('[data-cy=message-input]').type(`${emojiMessage}{enter}`)
      
      cy.get('[data-cy=message-list]').should('contain.text', emojiMessage)
      cy.get('[data-cy=message-item]').last().within(() => {
        cy.get('[data-cy=message-content]').should('contain.text', '😀')
        cy.get('[data-cy=message-content]').should('contain.text', '🚀')
        cy.get('[data-cy=message-content]').should('contain.text', '🎉')
      })
    })

    it('should open emoji picker and insert emojis', () => {
      cy.get('[data-cy=emoji-picker-button]').click()
      cy.get('[data-cy=emoji-picker]').should('be.visible')
      
      // Search for emoji
      cy.get('[data-cy=emoji-search]').type('smile')
      cy.get('[data-cy=emoji-results]').should('contain', '😊')
      
      // Click emoji to insert
      cy.get('[data-cy=emoji-😊]').click()
      
      // Verify emoji inserted in input
      cy.get('[data-cy=message-input]').should('contain.value', '😊')
      
      // Send message
      cy.get('[data-cy=message-input]').type(' Hello!{enter}')
      
      cy.get('[data-cy=message-list]').should('contain.text', '😊 Hello!')
    })

    it('should add emoji reactions to messages', () => {
      // Send a message first
      cy.sendMessage('React to this message!')
      
      // Add reaction
      cy.get('[data-cy=message-item]').last().within(() => {
        cy.get('[data-cy=add-reaction-button]').click()
      })
      
      cy.get('[data-cy=emoji-picker]').should('be.visible')
      cy.get('[data-cy=emoji-👍]').click()
      
      // Verify reaction added
      cy.get('[data-cy=message-item]').last().within(() => {
        cy.get('[data-cy=reaction-👍]').should('be.visible')
        cy.get('[data-cy=reaction-count]').should('contain.text', '1')
      })
      
      // Add same reaction again (toggle)
      cy.get('[data-cy=message-item]').last().within(() => {
        cy.get('[data-cy=reaction-👍]').click()
      })
      
      // Verify reaction removed
      cy.get('[data-cy=message-item]').last().within(() => {
        cy.get('[data-cy=reaction-👍]').should('not.exist')
      })
    })

    it('should support custom server emojis', () => {
      // Mock custom emoji
      cy.intercept('GET', '/api/servers/*/emojis', {
        statusCode: 200,
        body: {
          emojis: [
            {
              id: 'custom_emoji_1',
              name: 'haos_logo',
              url: '/images/haos_logo.png',
              animated: false
            }
          ]
        }
      }).as('customEmojis')
      
      cy.get('[data-cy=emoji-picker-button]').click()
      cy.wait('@customEmojis')
      
      // Navigate to custom emoji tab
      cy.get('[data-cy=emoji-tab-custom]').click()
      cy.get('[data-cy=custom-emoji-haos_logo]').click()
      
      cy.get('[data-cy=message-input]').should('contain.value', ':haos_logo:')
      cy.get('[data-cy=message-input]').type(' Custom emoji test!{enter}')
      
      cy.get('[data-cy=message-item]').last().within(() => {
        cy.get('[data-cy=custom-emoji]').should('be.visible')
        cy.get('[data-cy=custom-emoji]').should('have.attr', 'alt', 'haos_logo')
      })
    })
  })

  context('Mentions and Notifications', () => {
    it('should mention users with @ syntax', () => {
      const mentionMessage = '@testuser hello there!'
      
      cy.get('[data-cy=message-input]').type(mentionMessage)
      
      // Should show mention autocomplete
      cy.get('[data-cy=mention-autocomplete]').should('be.visible')
      cy.get('[data-cy=mention-suggestion]').should('contain.text', 'testuser')
      
      // Select mention
      cy.get('[data-cy=mention-suggestion]').first().click()
      
      cy.get('[data-cy=message-input]').type(' How are you?{enter}')
      
      cy.get('[data-cy=message-item]').last().within(() => {
        cy.get('[data-cy=user-mention]').should('be.visible')
        cy.get('[data-cy=user-mention]').should('contain.text', '@testuser')
        cy.get('[data-cy=user-mention]').should('have.class', 'mention-highlight')
      })
    })

    it('should mention everyone with @everyone', () => {
      const everyoneMessage = '@everyone Important announcement!'
      
      cy.get('[data-cy=message-input]').type(`${everyoneMessage}{enter}`)
      
      cy.get('[data-cy=message-item]').last().within(() => {
        cy.get('[data-cy=everyone-mention]').should('be.visible')
        cy.get('[data-cy=everyone-mention]').should('contain.text', '@everyone')
        cy.get('[data-cy=everyone-mention]').should('have.class', 'everyone-mention')
      })
    })

    it('should mention roles', () => {
      // Mock role mention
      cy.intercept('GET', '/api/servers/*/roles', {
        statusCode: 200,
        body: {
          roles: [
            { id: 'moderator', name: 'Moderator', color: '#ff5733' },
            { id: 'member', name: 'Member', color: '#33ff57' }
          ]
        }
      }).as('serverRoles')
      
      cy.get('[data-cy=message-input]').type('@Moderator')
      cy.wait('@serverRoles')
      
      cy.get('[data-cy=mention-autocomplete]').should('be.visible')
      cy.get('[data-cy=role-mention-suggestion]').should('contain.text', 'Moderator')
      
      cy.get('[data-cy=role-mention-suggestion]').first().click()
      cy.get('[data-cy=message-input]').type(' please help!{enter}')
      
      cy.get('[data-cy=message-item]').last().within(() => {
        cy.get('[data-cy=role-mention]').should('be.visible')
        cy.get('[data-cy=role-mention]').should('contain.text', '@Moderator')
      })
    })

    it('should show notification indicators for mentions', () => {
      // Simulate receiving a mention (would come from real-time sync)
      cy.window().then((win) => {
        // Mock incoming mention message
        const mentionEvent = {
          type: 'new-message',
          data: {
            channelId: testChannel,
            message: {
              id: 'msg123',
              content: '@testuser you have been mentioned!',
              author: 'otheruser',
              timestamp: Date.now(),
              mentions: ['@testuser:matrix.org']
            }
          }
        }
        
        win.dispatchEvent(new CustomEvent('matrix-event', { detail: mentionEvent }))
      })
      
      // Check for mention notification
      cy.get(`[data-cy=channel-${testChannel}]`).should('have.class', 'mention-indicator')
      cy.get('[data-cy=notification-badge]').should('be.visible')
      cy.get('[data-cy=notification-badge]').should('contain.text', '1')
    })
  })

  context('File and Media Uploads', () => {
    beforeEach(() => {
      // Create test files for upload
      cy.writeFile('cypress/fixtures/test-image.png', 'fake image data')
      cy.writeFile('cypress/fixtures/test-document.pdf', 'fake pdf data')
      cy.writeFile('cypress/fixtures/test-video.mp4', 'fake video data')
    })

    it('should upload and display images', () => {
      cy.measurePerformance('file-upload')
      
      // Mock file upload API
      cy.intercept('POST', '/api/upload', {
        statusCode: 200,
        body: {
          url: '/uploads/test-image.png',
          filename: 'test-image.png',
          size: 1024,
          type: 'image/png'
        }
      }).as('fileUpload')
      
      cy.get('[data-cy=file-upload-button]').click()
      cy.get('[data-cy=file-input]').selectFile('cypress/fixtures/test-image.png', { force: true })
      
      cy.wait('@fileUpload')
      
      // Verify upload preview
      cy.get('[data-cy=upload-preview]').should('be.visible')
      cy.get('[data-cy=upload-filename]').should('contain.text', 'test-image.png')
      cy.get('[data-cy=upload-size]').should('contain.text', '1 KB')
      
      // Add message with upload
      cy.get('[data-cy=message-input]').type('Check out this image!')
      cy.get('[data-cy=send-button]').click()
      
      // Verify message with attachment
      cy.get('[data-cy=message-item]').last().within(() => {
        cy.get('[data-cy=message-content]').should('contain.text', 'Check out this image!')
        cy.get('[data-cy=image-attachment]').should('be.visible')
        cy.get('[data-cy=image-attachment]').should('have.attr', 'src', '/uploads/test-image.png')
      })
      
      cy.measurePerformance('file-upload')
    })

    it('should upload multiple files', () => {
      cy.intercept('POST', '/api/upload', (req) => {
        req.reply({
          statusCode: 200,
          body: {
            url: `/uploads/${req.body.get('file').name}`,
            filename: req.body.get('file').name,
            size: 1024,
            type: 'image/png'
          }
        })
      }).as('multiFileUpload')
      
      cy.get('[data-cy=file-upload-button]').click()
      cy.get('[data-cy=file-input]').selectFile([
        'cypress/fixtures/test-image.png',
        'cypress/fixtures/test-document.pdf'
      ], { force: true })
      
      cy.wait('@multiFileUpload')
      cy.wait('@multiFileUpload')
      
      // Verify multiple upload previews
      cy.get('[data-cy=upload-preview]').should('have.length', 2)
      cy.get('[data-cy=upload-filename]').should('contain.text', 'test-image.png')
      cy.get('[data-cy=upload-filename]').should('contain.text', 'test-document.pdf')
      
      cy.get('[data-cy=send-button]').click()
      
      cy.get('[data-cy=message-item]').last().within(() => {
        cy.get('[data-cy=file-attachment]').should('have.length', 2)
      })
    })

    it('should handle file upload errors', () => {
      cy.intercept('POST', '/api/upload', {
        statusCode: 413,
        body: { error: 'File too large' }
      }).as('fileUploadError')
      
      cy.get('[data-cy=file-upload-button]').click()
      cy.get('[data-cy=file-input]').selectFile('cypress/fixtures/test-video.mp4', { force: true })
      
      cy.wait('@fileUploadError')
      
      cy.get('[data-cy=upload-error]').should('be.visible')
      cy.get('[data-cy=upload-error]').should('contain.text', 'File too large')
    })

    it('should support drag and drop file uploads', () => {
      const dataTransfer = new DataTransfer()
      
      // Create a mock file
      cy.readFile('cypress/fixtures/test-image.png').then((fileContent) => {
        const file = new File([fileContent], 'dragged-image.png', { type: 'image/png' })
        dataTransfer.items.add(file)
        
        // Simulate drag and drop
        cy.get('[data-cy=message-input-container]')
          .trigger('dragenter', { dataTransfer })
          .trigger('dragover', { dataTransfer })
          .trigger('drop', { dataTransfer })
        
        // Should show drop zone
        cy.get('[data-cy=drop-zone]').should('be.visible')
        cy.get('[data-cy=drop-zone-text]').should('contain.text', 'Drop files to upload')
      })
    })

    it('should validate file types and sizes', () => {
      // Test forbidden file type
      cy.get('[data-cy=file-upload-button]').click()
      
      // Create a mock .exe file
      const forbiddenFile = new File(['fake exe'], 'virus.exe', { type: 'application/x-msdownload' })
      
      cy.get('[data-cy=file-input]').then(input => {
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(forbiddenFile)
        input[0].files = dataTransfer.files
        input[0].dispatchEvent(new Event('change', { bubbles: true }))
      })
      
      cy.get('[data-cy=file-type-error]').should('contain.text', 'File type not allowed')
      
      // Test file size limit
      const largeFile = new File(['x'.repeat(50 * 1024 * 1024)], 'large.png', { type: 'image/png' })
      
      cy.get('[data-cy=file-input]').then(input => {
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(largeFile)
        input[0].files = dataTransfer.files
        input[0].dispatchEvent(new Event('change', { bubbles: true }))
      })
      
      cy.get('[data-cy=file-size-error]').should('contain.text', 'File size exceeds limit')
    })
  })

  context('Message Management', () => {
    beforeEach(() => {
      // Send a test message to work with
      cy.sendMessage('Test message for management')
    })

    it('should edit messages', () => {
      cy.get('[data-cy=message-item]').last().within(() => {
        // Hover to show message menu
        cy.get('[data-cy=message-content]').trigger('mouseover')
        cy.get('[data-cy=message-menu]').click()
        cy.get('[data-cy=edit-message]').click()
      })
      
      // Edit message
      cy.get('[data-cy=edit-input]').should('be.visible')
      cy.get('[data-cy=edit-input]').clear().type('Edited test message')
      cy.get('[data-cy=save-edit-button]').click()
      
      // Verify message edited
      cy.get('[data-cy=message-item]').last().within(() => {
        cy.get('[data-cy=message-content]').should('contain.text', 'Edited test message')
        cy.get('[data-cy=edited-indicator]').should('contain.text', '(edited)')
      })
    })

    it('should delete messages', () => {
      cy.get('[data-cy=message-item]').last().within(() => {
        cy.get('[data-cy=message-content]').trigger('mouseover')
        cy.get('[data-cy=message-menu]').click()
        cy.get('[data-cy=delete-message]').click()
      })
      
      // Confirm deletion
      cy.get('[data-cy=delete-confirmation-modal]').should('be.visible')
      cy.get('[data-cy=confirm-delete-button]').click()
      
      // Verify message deleted
      cy.get('[data-cy=message-list]').should('not.contain.text', 'Test message for management')
    })

    it('should pin messages', () => {
      cy.get('[data-cy=message-item]').last().within(() => {
        cy.get('[data-cy=message-content]').trigger('mouseover')
        cy.get('[data-cy=message-menu]').click()
        cy.get('[data-cy=pin-message]').click()
      })
      
      // Verify message pinned
      cy.get('[data-cy=pinned-messages-indicator]').should('be.visible')
      cy.get('[data-cy=pinned-messages-indicator]').should('contain.text', '1')
      
      // View pinned messages
      cy.get('[data-cy=pinned-messages-indicator]').click()
      cy.get('[data-cy=pinned-messages-modal]').should('be.visible')
      cy.get('[data-cy=pinned-message]').should('contain.text', 'Test message for management')
    })

    it('should reply to messages', () => {
      cy.get('[data-cy=message-item]').last().within(() => {
        cy.get('[data-cy=message-content]').trigger('mouseover')
        cy.get('[data-cy=message-menu]').click()
        cy.get('[data-cy=reply-message]').click()
      })
      
      // Verify reply context shows
      cy.get('[data-cy=reply-context]').should('be.visible')
      cy.get('[data-cy=reply-context]').should('contain.text', 'Replying to testuser')
      
      // Send reply
      cy.get('[data-cy=message-input]').type('This is a reply{enter}')
      
      // Verify reply structure
      cy.get('[data-cy=message-item]').last().within(() => {
        cy.get('[data-cy=reply-reference]').should('be.visible')
        cy.get('[data-cy=reply-reference]').should('contain.text', 'Test message for management')
        cy.get('[data-cy=message-content]').should('contain.text', 'This is a reply')
      })
    })
  })

  context('Real-time Synchronization', () => {
    it('should receive messages in real-time', () => {
      // Simulate receiving a message from another user
      cy.window().then((win) => {
        const incomingMessage = {
          id: `msg_${Date.now()}`,
          content: 'Hello from another user!',
          author: {
            id: 'otheruser',
            username: 'otheruser',
            displayName: 'Other User'
          },
          timestamp: Date.now(),
          channelId: testChannel
        }
        
        // Simulate Matrix sync event
        win.dispatchEvent(new CustomEvent('matrix-message', { 
          detail: { 
            type: 'm.room.message',
            content: { body: incomingMessage.content },
            sender: incomingMessage.author.id,
            origin_server_ts: incomingMessage.timestamp
          }
        }))
      })
      
      // Verify message appears without refresh
      cy.get('[data-cy=message-list]').should('contain.text', 'Hello from another user!')
      cy.get('[data-cy=message-item]').last().within(() => {
        cy.get('[data-cy=message-author]').should('contain.text', 'otheruser')
      })
    })

    it('should show typing indicators', () => {
      // Simulate someone typing
      cy.window().then((win) => {
        win.dispatchEvent(new CustomEvent('user-typing', {
          detail: {
            userId: 'otheruser',
            username: 'otheruser',
            channelId: testChannel,
            typing: true
          }
        }))
      })
      
      // Verify typing indicator shows
      cy.get('[data-cy=typing-indicator]').should('be.visible')
      cy.get('[data-cy=typing-indicator]').should('contain.text', 'otheruser is typing...')
      
      // Simulate typing stopped
      cy.window().then((win) => {
        win.dispatchEvent(new CustomEvent('user-typing', {
          detail: {
            userId: 'otheruser',
            typing: false
          }
        }))
      })
      
      // Verify typing indicator disappears
      cy.get('[data-cy=typing-indicator]').should('not.exist')
    })

    it('should handle message conflicts gracefully', () => {
      const conflictMessage = 'Conflict test message'
      
      // Send message
      cy.get('[data-cy=message-input]').type(`${conflictMessage}{enter}`)
      
      // Simulate conflict response
      cy.intercept('POST', '/api/messages', {
        statusCode: 409,
        body: { error: 'Message conflict', retryAfter: 1000 }
      }).as('messageConflict')
      
      // Verify retry mechanism
      cy.wait('@messageConflict')
      cy.get('[data-cy=message-retry-indicator]').should('be.visible')
      
      // Should auto-retry after delay
      cy.wait(1100)
      cy.get('[data-cy=message-list]').should('contain.text', conflictMessage)
    })
  })

  context('Performance and Accessibility', () => {
    it('should handle large message history efficiently', () => {
      // Mock large message history
      cy.intercept('GET', `/api/channels/${testChannel}/messages*`, {
        statusCode: 200,
        body: {
          messages: Array.from({ length: 100 }, (_, i) => ({
            id: `msg_${i}`,
            content: `Message ${i}`,
            author: { username: 'testuser' },
            timestamp: Date.now() - (100 - i) * 1000
          })),
          hasMore: true
        }
      }).as('messageHistory')
      
      cy.visit(`/channels/${testChannel}`)
      cy.wait('@messageHistory')
      
      // Verify virtual scrolling performance
      cy.measurePerformance('large-message-list')
      
      cy.get('[data-cy=message-list]').should('be.visible')
      cy.get('[data-cy=message-item]').should('have.length.at.most', 50) // Virtual scrolling
      
      // Scroll to top to load more messages
      cy.get('[data-cy=message-list]').scrollTo('top')
      cy.get('[data-cy=loading-more-messages]').should('be.visible')
      
      cy.measurePerformance('large-message-list')
    })

    it('should be accessible via keyboard navigation', () => {
      cy.injectAxe()
      
      // Test message input accessibility
      cy.get('[data-cy=message-input]').focus()
      cy.testKeyboardNavigation('[data-cy=message-input]')
      
      // Test message navigation with arrow keys
      cy.sendMessage('First message')
      cy.sendMessage('Second message')
      
      cy.get('[data-cy=message-input]').type('{uparrow}')
      cy.get('[data-cy=message-input]').should('have.value', 'Second message')
      
      cy.get('[data-cy=message-input]').type('{uparrow}')
      cy.get('[data-cy=message-input]').should('have.value', 'First message')
    })

    it('should meet accessibility standards', () => {
      cy.injectAxe()
      cy.checkAccessibility('[data-cy=message-container]')
      
      // Test screen reader support
      cy.get('[data-cy=message-item]').first().within(() => {
        cy.get('[data-cy=message-content]').should('have.attr', 'role', 'text')
        cy.get('[data-cy=message-author]').should('have.attr', 'aria-label')
        cy.get('[data-cy=message-timestamp]').should('have.attr', 'aria-label')
      })
    })

    it('should handle message sending performance', () => {
      const startTime = Date.now()
      const testMessage = 'Performance test message'
      
      cy.sendMessage(testMessage)
      
      cy.get('[data-cy=message-list]').should('contain.text', testMessage).then(() => {
        const sendTime = Date.now() - startTime
        
        expect(sendTime).to.be.lessThan(2000, 'Message sending should complete within 2 seconds')
        
        cy.task('logPerformance', {
          type: 'message-send-performance',
          duration: sendTime,
          timestamp: Date.now()
        })
      })
    })
  })
})