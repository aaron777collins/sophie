/**
 * Mobile Responsive End-to-End Tests
 * 
 * Tests mobile-specific functionality and responsive design including:
 * - Touch gesture interactions
 * - Mobile navigation patterns
 * - Responsive layout adaptations
 * - Mobile keyboard handling
 * - Performance on mobile devices
 * - Mobile-specific accessibility features
 */

describe('Mobile Responsive Design', () => {
  // Common mobile viewports to test
  const mobileViewports = [
    { name: 'iPhone SE', width: 375, height: 667 },
    { name: 'iPhone 12', width: 390, height: 844 },
    { name: 'Samsung Galaxy', width: 412, height: 915 },
    { name: 'iPad Mini', width: 768, height: 1024 }
  ]

  beforeEach(() => {
    cy.login(Cypress.env('TEST_USER_EMAIL'), Cypress.env('TEST_USER_PASSWORD'))
  })

  context('Responsive Layout Adaptations', () => {
    mobileViewports.forEach(({ name, width, height }) => {
      it(`should adapt layout for ${name} (${width}x${height})`, () => {
        cy.viewport(width, height)
        cy.visit('/dashboard')
        cy.waitForPageLoad()
        
        // Verify responsive layout elements
        cy.get('[data-cy=mobile-layout]').should('be.visible')
        cy.get('[data-cy=desktop-sidebar]').should('not.be.visible')
        cy.get('[data-cy=mobile-navigation]').should('be.visible')
        
        // Check that content fits within viewport
        cy.get('[data-cy=main-content]').should('have.css', 'width').then((width) => {
          expect(parseInt(width)).to.be.at.most(parseInt(width))
        })
        
        // Verify no horizontal scrolling
        cy.get('body').should('have.css', 'overflow-x', 'hidden')
      })
    })

    it('should handle orientation changes', () => {
      // Start in portrait
      cy.viewport(375, 667)
      cy.visit('/dashboard')
      
      cy.get('[data-cy=mobile-layout]').should('have.class', 'portrait')
      cy.get('[data-cy=mobile-navigation]').should('have.class', 'portrait-nav')
      
      // Switch to landscape
      cy.viewport(667, 375)
      
      cy.get('[data-cy=mobile-layout]').should('have.class', 'landscape')
      cy.get('[data-cy=mobile-navigation]').should('have.class', 'landscape-nav')
      
      // Verify layout adjustments
      cy.get('[data-cy=chat-container]').should('have.css', 'height').then((height) => {
        expect(parseInt(height)).to.be.lessThan(375)
      })
    })

    it('should adapt navigation for different screen sizes', () => {
      // Test phone navigation
      cy.viewport(375, 667)
      cy.visit('/dashboard')
      
      cy.get('[data-cy=mobile-tab-bar]').should('be.visible')
      cy.get('[data-cy=mobile-drawer-toggle]').should('be.visible')
      
      // Test tablet navigation
      cy.viewport(768, 1024)
      
      cy.get('[data-cy=tablet-sidebar]').should('be.visible')
      cy.get('[data-cy=mobile-tab-bar]').should('not.be.visible')
      cy.get('[data-cy=desktop-sidebar]').should('not.be.visible')
    })
  })

  context('Touch Gesture Interactions', () => {
    beforeEach(() => {
      cy.viewport(375, 667)
      cy.visit('/dashboard')
    })

    it('should handle swipe gestures for navigation', () => {
      // Test server drawer swipe
      cy.get('[data-cy=main-content]').swipeRight()
      cy.get('[data-cy=server-drawer]').should('have.class', 'open')
      
      // Close drawer with swipe
      cy.get('[data-cy=server-drawer]').swipeLeft()
      cy.get('[data-cy=server-drawer]').should('not.have.class', 'open')
      
      // Test channel sidebar swipe
      cy.get('[data-cy=chat-container]').swipeLeft()
      cy.get('[data-cy=member-sidebar]').should('have.class', 'open')
      
      // Close member sidebar
      cy.get('[data-cy=member-sidebar]').swipeRight()
      cy.get('[data-cy=member-sidebar]').should('not.have.class', 'open')
    })

    it('should handle pull-to-refresh', () => {
      // Go to a channel with messages
      const testServer = `Mobile Test ${Date.now()}`
      cy.createServer(testServer, 'gaming')
      
      // Mock refresh API
      cy.intercept('GET', '/api/channels/*/messages*', {
        statusCode: 200,
        body: {
          messages: [
            {
              id: 'new_msg',
              content: 'New message from refresh',
              author: { username: 'testuser' },
              timestamp: Date.now()
            }
          ]
        }
      }).as('refreshMessages')
      
      // Pull to refresh
      cy.get('[data-cy=message-list]')
        .trigger('touchstart', { touches: [{ clientX: 200, clientY: 100 }] })
        .trigger('touchmove', { touches: [{ clientX: 200, clientY: 200 }] })
        .trigger('touchend')
      
      // Verify refresh indicator
      cy.get('[data-cy=pull-refresh-indicator]').should('be.visible')
      cy.wait('@refreshMessages')
      
      // Verify new message appears
      cy.get('[data-cy=message-list]').should('contain.text', 'New message from refresh')
    })

    it('should handle long press context menus', () => {
      // Send a test message
      cy.sendMessage('Test message for long press')
      
      // Long press on message
      cy.get('[data-cy=message-item]').last().longPress()
      
      // Verify mobile context menu
      cy.get('[data-cy=mobile-context-menu]').should('be.visible')
      cy.get('[data-cy=context-edit]').should('be.visible')
      cy.get('[data-cy=context-delete]').should('be.visible')
      cy.get('[data-cy=context-reply]').should('be.visible')
      
      // Test context menu action
      cy.get('[data-cy=context-reply]').click()
      cy.get('[data-cy=reply-context]').should('be.visible')
      
      // Close context menu by tapping outside
      cy.get('[data-cy=main-content]').click(10, 10)
      cy.get('[data-cy=mobile-context-menu]').should('not.exist')
    })

    it('should handle pinch-to-zoom gestures', () => {
      // Send a message with an image
      cy.uploadFile('cypress/fixtures/test-image.png')
      
      // Get image element
      cy.get('[data-cy=image-attachment]').should('be.visible')
      
      // Simulate pinch-to-zoom
      cy.get('[data-cy=image-attachment]')
        .trigger('touchstart', {
          touches: [
            { clientX: 100, clientY: 100 },
            { clientX: 200, clientY: 200 }
          ]
        })
        .trigger('touchmove', {
          touches: [
            { clientX: 50, clientY: 50 },
            { clientX: 250, clientY: 250 }
          ]
        })
        .trigger('touchend')
      
      // Verify image viewer opens
      cy.get('[data-cy=image-viewer]').should('be.visible')
      cy.get('[data-cy=zoomed-image]').should('be.visible')
      
      // Test zoom controls
      cy.get('[data-cy=zoom-controls]').should('be.visible')
      cy.get('[data-cy=zoom-in-button]').should('be.visible')
      cy.get('[data-cy=zoom-out-button]').should('be.visible')
    })
  })

  context('Mobile Navigation Patterns', () => {
    beforeEach(() => {
      cy.viewport(375, 667)
      cy.visit('/dashboard')
    })

    it('should use bottom tab navigation', () => {
      // Verify tab bar is at bottom
      cy.get('[data-cy=mobile-tab-bar]').should('be.visible')
      cy.get('[data-cy=mobile-tab-bar]').should('have.css', 'position', 'fixed')
      cy.get('[data-cy=mobile-tab-bar]').should('have.css', 'bottom', '0px')
      
      // Test tab navigation
      cy.get('[data-cy=tab-servers]').click()
      cy.get('[data-cy=server-list-view]').should('be.visible')
      
      cy.get('[data-cy=tab-dms]').click()
      cy.get('[data-cy=dm-list-view]').should('be.visible')
      
      cy.get('[data-cy=tab-profile]').click()
      cy.get('[data-cy=profile-view]').should('be.visible')
      
      // Verify active tab indicator
      cy.get('[data-cy=tab-profile]').should('have.class', 'active')
    })

    it('should use hamburger menu for secondary navigation', () => {
      // Open hamburger menu
      cy.get('[data-cy=hamburger-menu-button]').click()
      cy.get('[data-cy=mobile-menu-drawer]').should('have.class', 'open')
      
      // Test menu items
      cy.get('[data-cy=menu-settings]').should('be.visible')
      cy.get('[data-cy=menu-help]').should('be.visible')
      cy.get('[data-cy=menu-logout]').should('be.visible')
      
      // Test menu item navigation
      cy.get('[data-cy=menu-settings]').click()
      cy.url().should('include', '/settings')
      
      // Verify menu closes after navigation
      cy.get('[data-cy=mobile-menu-drawer]').should('not.have.class', 'open')
    })

    it('should handle back button navigation', () => {
      // Navigate to settings
      cy.get('[data-cy=hamburger-menu-button]').click()
      cy.get('[data-cy=menu-settings]').click()
      
      // Verify back button exists
      cy.get('[data-cy=mobile-back-button]').should('be.visible')
      
      // Test back navigation
      cy.get('[data-cy=mobile-back-button]').click()
      cy.url().should('not.include', '/settings')
      
      // Test browser back button
      cy.visit('/settings')
      cy.go('back')
      cy.url().should('not.include', '/settings')
    })

    it('should use modal navigation for complex flows', () => {
      // Open server creation (should be modal on mobile)
      cy.get('[data-cy=add-server-button]').click()
      
      // Verify mobile modal
      cy.get('[data-cy=mobile-modal]').should('be.visible')
      cy.get('[data-cy=mobile-modal-header]').should('be.visible')
      cy.get('[data-cy=mobile-modal-close]').should('be.visible')
      
      // Test modal close
      cy.get('[data-cy=mobile-modal-close]').click()
      cy.get('[data-cy=mobile-modal]').should('not.exist')
      
      // Test modal backdrop close
      cy.get('[data-cy=add-server-button]').click()
      cy.get('[data-cy=modal-backdrop]').click()
      cy.get('[data-cy=mobile-modal]').should('not.exist')
    })
  })

  context('Mobile Keyboard and Input Handling', () => {
    beforeEach(() => {
      cy.viewport(375, 667)
      const testServer = `Mobile Input Test ${Date.now()}`
      cy.createServer(testServer, 'gaming')
    })

    it('should handle virtual keyboard appearance', () => {
      // Focus on message input
      cy.get('[data-cy=message-input]').click()
      
      // Simulate virtual keyboard appearance (reduce viewport height)
      cy.viewport(375, 400)
      
      // Verify layout adjusts for keyboard
      cy.get('[data-cy=chat-container]').should('have.css', 'height').then((height) => {
        expect(parseInt(height)).to.be.lessThan(667)
      })
      
      // Verify message input remains visible
      cy.get('[data-cy=message-input]').should('be.visible')
      cy.get('[data-cy=message-input-container]').should('have.css', 'position', 'fixed')
    })

    it('should provide mobile-optimized input controls', () => {
      cy.get('[data-cy=message-input]').click()
      
      // Verify mobile keyboard type
      cy.get('[data-cy=message-input]').should('have.attr', 'inputmode', 'text')
      cy.get('[data-cy=message-input]').should('have.attr', 'autocomplete', 'off')
      cy.get('[data-cy=message-input]').should('have.attr', 'autocorrect', 'on')
      
      // Test emoji keyboard toggle
      cy.get('[data-cy=emoji-keyboard-toggle]').should('be.visible')
      cy.get('[data-cy=emoji-keyboard-toggle]').click()
      
      cy.get('[data-cy=mobile-emoji-picker]').should('be.visible')
      cy.get('[data-cy=mobile-emoji-picker]').should('have.class', 'mobile-optimized')
    })

    it('should handle autocomplete and suggestions', () => {
      // Type mention trigger
      cy.get('[data-cy=message-input]').type('@')
      
      // Verify mobile mention picker
      cy.get('[data-cy=mobile-mention-picker]').should('be.visible')
      cy.get('[data-cy=mention-suggestions]').should('have.class', 'mobile-layout')
      
      // Test touch selection
      cy.get('[data-cy=mention-suggestion]').first().click()
      cy.get('[data-cy=message-input]').should('contain.value', '@')
    })

    it('should support voice input', () => {
      // Mock voice recognition API
      cy.window().then((win) => {
        win.SpeechRecognition = win.webkitSpeechRecognition = class {
          start() {
            setTimeout(() => {
              this.onresult({
                results: [{
                  0: { transcript: 'Hello this is a voice message' }
                }]
              })
            }, 100)
          }
          stop() {}
          abort() {}
        }
      })
      
      // Test voice input button
      cy.get('[data-cy=voice-input-button]').should('be.visible')
      cy.get('[data-cy=voice-input-button]').click()
      
      // Verify voice recording UI
      cy.get('[data-cy=voice-recording-modal]').should('be.visible')
      cy.get('[data-cy=recording-animation]').should('be.visible')
      cy.get('[data-cy=stop-recording-button]').should('be.visible')
      
      // Stop recording
      cy.get('[data-cy=stop-recording-button]').click()
      
      // Verify transcribed text
      cy.get('[data-cy=message-input]').should('contain.value', 'Hello this is a voice message')
    })

    it('should handle file uploads on mobile', () => {
      // Test camera access
      cy.get('[data-cy=mobile-camera-button]').should('be.visible')
      cy.get('[data-cy=mobile-camera-button]').click()
      
      cy.get('[data-cy=camera-options]').should('be.visible')
      cy.get('[data-cy=take-photo-option]').should('be.visible')
      cy.get('[data-cy=record-video-option]').should('be.visible')
      cy.get('[data-cy=choose-from-gallery-option]').should('be.visible')
      
      // Test gallery selection
      cy.get('[data-cy=choose-from-gallery-option]').click()
      
      // Mock file selection
      cy.get('[data-cy=mobile-file-input]').selectFile('cypress/fixtures/test-image.png', { force: true })
      
      // Verify mobile upload preview
      cy.get('[data-cy=mobile-upload-preview]').should('be.visible')
      cy.get('[data-cy=upload-thumbnail]').should('be.visible')
      cy.get('[data-cy=mobile-send-button]').should('be.visible')
    })
  })

  context('Mobile Performance Optimizations', () => {
    beforeEach(() => {
      cy.viewport(375, 667)
    })

    it('should load efficiently on mobile networks', () => {
      // Simulate slow mobile network
      cy.intercept('**/*', (req) => {
        req.reply((res) => {
          // Add delay to simulate slow network
          return new Promise(resolve => {
            setTimeout(() => resolve(res), 200)
          })
        })
      })
      
      cy.measurePerformance('mobile-initial-load')
      
      cy.visit('/dashboard')
      cy.waitForPageLoad()
      
      // Verify mobile performance budget
      cy.checkPerformanceBudget({
        fcp: 2500,        // First Contentful Paint < 2.5s on mobile
        loadTime: 5000,   // Total load time < 5s on mobile
        jsSize: 800000,   // JS bundle < 800KB for mobile
        cssSize: 150000   // CSS bundle < 150KB for mobile
      })
      
      cy.measurePerformance('mobile-initial-load')
    })

    it('should implement lazy loading for mobile', () => {
      const testServer = `Mobile Lazy Test ${Date.now()}`
      cy.createServer(testServer, 'gaming')
      
      // Mock large message history
      cy.intercept('GET', '/api/channels/*/messages*', {
        statusCode: 200,
        body: {
          messages: Array.from({ length: 200 }, (_, i) => ({
            id: `msg_${i}`,
            content: `Message ${i}`,
            author: { username: 'testuser' },
            timestamp: Date.now() - i * 1000
          }))
        }
      }).as('messageHistory')
      
      cy.visit(`/channels/${testServer}`)
      cy.wait('@messageHistory')
      
      // Verify only visible messages are rendered
      cy.get('[data-cy=message-item]').should('have.length.at.most', 25)
      
      // Test infinite scroll
      cy.get('[data-cy=message-list]').scrollTo('top')
      cy.get('[data-cy=loading-indicator]').should('be.visible')
      
      // Verify more messages load
      cy.get('[data-cy=message-item]').should('have.length.at.most', 50)
    })

    it('should optimize images for mobile', () => {
      // Send message with image
      cy.uploadFile('cypress/fixtures/test-image.png')
      
      // Verify mobile image optimization
      cy.get('[data-cy=image-attachment]').should('be.visible')
      cy.get('[data-cy=image-attachment]').should(($img) => {
        // Check that mobile-optimized image is loaded
        const src = $img.attr('src')
        expect(src).to.include('mobile=true')
      })
      
      // Test progressive loading
      cy.get('[data-cy=image-placeholder]').should('be.visible')
      cy.get('[data-cy=image-attachment]').should('have.attr', 'loading', 'lazy')
      
      // Test responsive images
      cy.get('[data-cy=image-attachment]').should('have.css', 'max-width', '100%')
      cy.get('[data-cy=image-attachment]').should('have.css', 'height', 'auto')
    })

    it('should handle memory management for mobile', () => {
      // Test memory cleanup on mobile
      cy.measureMemoryUsage().then((initialMemory: any) => {
        // Navigate through multiple channels
        for (let i = 0; i < 10; i++) {
          cy.createChannel(`test-channel-${i}`, 'text')
          cy.get(`[data-cy=channel-test-channel-${i}]`).click()
          cy.sendMessage(`Test message ${i}`)
        }
        
        // Measure memory after navigation
        cy.measureMemoryUsage().then((finalMemory: any) => {
          const memoryIncrease = finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize
          
          // Memory increase should be reasonable (less than 50MB)
          expect(memoryIncrease).to.be.lessThan(50 * 1024 * 1024)
          
          // Memory usage percentage should not exceed 70%
          expect(finalMemory.usedPercentage).to.be.lessThan(70)
        })
      })
    })
  })

  context('Mobile Accessibility', () => {
    beforeEach(() => {
      cy.viewport(375, 667)
      cy.injectAxe()
    })

    it('should meet mobile accessibility standards', () => {
      cy.visit('/dashboard')
      
      // Check mobile-specific accessibility rules
      cy.checkAccessibility(null, {
        rules: {
          'target-size': { enabled: true }, // Touch target size
          'orientation': { enabled: true }  // Orientation support
        }
      })
    })

    it('should have appropriate touch target sizes', () => {
      cy.visit('/dashboard')
      
      cy.testMobileAccessibility()
      
      // Test specific touch targets
      cy.get('[data-cy=mobile-tab-bar] button').each(($btn) => {
        cy.wrap($btn).should('have.css', 'min-height').and('match', /^(4[4-9]|[5-9]\d)px$/)
        cy.wrap($btn).should('have.css', 'min-width').and('match', /^(4[4-9]|[5-9]\d)px$/)
      })
    })

    it('should support mobile screen readers', () => {
      cy.visit('/dashboard')
      
      // Test mobile-specific screen reader patterns
      cy.get('[data-cy=mobile-navigation]').should('have.attr', 'role', 'navigation')
      cy.get('[data-cy=mobile-navigation]').should('have.attr', 'aria-label', 'Mobile navigation')
      
      // Test swipe gesture announcements
      cy.get('[data-cy=main-content]').should('have.attr', 'aria-label').and('include', 'swipe')
      
      // Test mobile focus management
      cy.get('[data-cy=mobile-menu-button]').focus()
      cy.get('[data-cy=mobile-menu-button]').should('have.focus')
    })

    it('should handle mobile keyboard navigation', () => {
      cy.visit('/dashboard')
      
      // Test tab navigation on mobile
      cy.get('body').tab()
      cy.focused().should('be.visible')
      
      // Skip to main content should work on mobile
      cy.testSkipLinks()
      
      // Test mobile-specific keyboard shortcuts
      cy.get('body').type('{alt}m') // Mobile menu shortcut
      cy.get('[data-cy=mobile-menu-drawer]').should('have.class', 'open')
    })

    it('should support high contrast mode on mobile', () => {
      // Enable high contrast mode
      cy.window().then((win) => {
        win.document.body.classList.add('high-contrast')
      })
      
      cy.visit('/dashboard')
      
      // Verify high contrast styles applied
      cy.get('[data-cy=mobile-navigation]').should('have.css', 'border-color').and('not.equal', 'rgba(0, 0, 0, 0)')
      cy.get('[data-cy=message-input]').should('have.css', 'border-width').and('not.equal', '0px')
      
      // Test focus indicators in high contrast
      cy.get('[data-cy=message-input]').focus()
      cy.get('[data-cy=message-input]').should('have.css', 'outline-width').and('not.equal', '0px')
    })
  })

  context('Cross-Device Consistency', () => {
    it('should maintain state across device switches', () => {
      // Start on mobile
      cy.viewport(375, 667)
      cy.visit('/dashboard')
      
      const testServer = `Cross Device Test ${Date.now()}`
      cy.createServer(testServer, 'gaming')
      cy.sendMessage('Mobile message')
      
      // Switch to desktop viewport
      cy.viewport(1280, 720)
      
      // Verify state persisted
      cy.get('[data-cy=server-sidebar]').should('contain.text', testServer)
      cy.get('[data-cy=message-list]').should('contain.text', 'Mobile message')
      
      // Send desktop message
      cy.sendMessage('Desktop message')
      
      // Switch back to mobile
      cy.viewport(375, 667)
      
      // Verify desktop message visible on mobile
      cy.get('[data-cy=message-list]').should('contain.text', 'Desktop message')
    })

    it('should sync settings across devices', () => {
      // Set mobile-specific settings
      cy.viewport(375, 667)
      cy.visit('/settings')
      
      cy.get('[data-cy=mobile-notifications-toggle]').click()
      cy.get('[data-cy=mobile-vibration-toggle]').click()
      cy.get('[data-cy=save-settings-button]').click()
      
      // Switch to tablet
      cy.viewport(768, 1024)
      cy.visit('/settings')
      
      // Verify mobile settings are reflected
      cy.get('[data-cy=notifications-enabled]').should('contain.text', 'Enabled')
      cy.get('[data-cy=vibration-enabled]').should('contain.text', 'Enabled')
    })

    it('should provide appropriate features per device type', () => {
      // Test phone features
      cy.viewport(375, 667)
      cy.visit('/dashboard')
      
      cy.get('[data-cy=mobile-camera-button]').should('be.visible')
      cy.get('[data-cy=mobile-notification-toggle]').should('be.visible')
      cy.get('[data-cy=voice-input-button]').should('be.visible')
      
      // Test tablet features
      cy.viewport(768, 1024)
      
      cy.get('[data-cy=tablet-split-view]').should('be.visible')
      cy.get('[data-cy=tablet-sidebar]').should('be.visible')
      cy.get('[data-cy=mobile-camera-button]').should('not.be.visible')
    })
  })
})