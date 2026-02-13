/**
 * Server Creation and Management End-to-End Tests
 * 
 * Tests comprehensive server management flow including:
 * - Server creation with different templates
 * - Server configuration options
 * - Server discovery and joining
 * - Server settings and administration
 * - Server deletion and cleanup
 */

describe('Server Creation and Management', () => {
  beforeEach(() => {
    // Login first
    cy.login(Cypress.env('TEST_USER_EMAIL'), Cypress.env('TEST_USER_PASSWORD'))
    cy.waitForPageLoad()
  })

  context('Server Creation', () => {
    it('should create a new server with gaming template', () => {
      const serverName = `Gaming Server ${Date.now()}`
      
      cy.measurePerformance('server-creation-gaming')
      
      // Open server creation modal
      cy.get('[data-cy=add-server-button]').click()
      cy.get('[data-cy=create-server-option]').click()
      
      // Verify modal is open
      cy.get('[data-cy=create-server-modal]').should('be.visible')
      cy.get('[data-cy=server-templates]').should('be.visible')
      
      // Select gaming template
      cy.get('[data-cy=template-gaming]').click()
      cy.get('[data-cy=template-gaming]').should('have.class', 'selected')
      
      // Enter server name
      cy.get('[data-cy=server-name-input]').type(serverName)
      cy.get('[data-cy=server-description-input]').type('A server for gaming enthusiasts')
      
      // Create server
      cy.get('[data-cy=create-server-button]').click()
      
      // Verify server creation
      cy.get('[data-cy=server-sidebar]').should('contain.text', serverName)
      cy.get('[data-cy=channel-list]').should('contain.text', 'general')
      cy.get('[data-cy=channel-list]').should('contain.text', 'gaming')
      cy.get('[data-cy=voice-channels]').should('contain.text', 'Gaming Voice')
      
      // Verify we're in the new server
      cy.get('[data-cy=server-header]').should('contain.text', serverName)
      
      cy.measurePerformance('server-creation-gaming')
    })

    it('should create server with study template', () => {
      const serverName = `Study Group ${Date.now()}`
      
      cy.get('[data-cy=add-server-button]').click()
      cy.get('[data-cy=create-server-option]').click()
      
      cy.get('[data-cy=template-study]').click()
      cy.get('[data-cy=server-name-input]').type(serverName)
      cy.get('[data-cy=server-description-input]').type('Study group for collaborative learning')
      
      cy.get('[data-cy=create-server-button]').click()
      
      // Verify study-specific channels
      cy.get('[data-cy=channel-list]').should('contain.text', 'general')
      cy.get('[data-cy=channel-list]').should('contain.text', 'study-hall')
      cy.get('[data-cy=channel-list]').should('contain.text', 'resources')
      cy.get('[data-cy=voice-channels]').should('contain.text', 'Study Room')
    })

    it('should create server with friends template', () => {
      const serverName = `Friends Hangout ${Date.now()}`
      
      cy.get('[data-cy=add-server-button]').click()
      cy.get('[data-cy=create-server-option]').click()
      
      cy.get('[data-cy=template-friends]').click()
      cy.get('[data-cy=server-name-input]').type(serverName)
      cy.get('[data-cy=create-server-button]').click()
      
      // Verify friends-specific channels
      cy.get('[data-cy=channel-list]').should('contain.text', 'general')
      cy.get('[data-cy=channel-list]').should('contain.text', 'random')
      cy.get('[data-cy=channel-list]').should('contain.text', 'memes')
      cy.get('[data-cy=voice-channels]').should('contain.text', 'Hangout')
    })

    it('should create custom server without template', () => {
      const serverName = `Custom Server ${Date.now()}`
      
      cy.get('[data-cy=add-server-button]').click()
      cy.get('[data-cy=create-server-option]').click()
      
      // Skip template selection
      cy.get('[data-cy=skip-template]').click()
      
      cy.get('[data-cy=server-name-input]').type(serverName)
      cy.get('[data-cy=server-description-input]').type('Custom server configuration')
      cy.get('[data-cy=create-server-button]').click()
      
      // Verify minimal default setup
      cy.get('[data-cy=channel-list]').should('contain.text', 'general')
      cy.get('[data-cy=voice-channels]').should('contain.text', 'General')
    })
  })

  context('Server Configuration', () => {
    let serverName: string

    beforeEach(() => {
      serverName = `Config Test ${Date.now()}`
      cy.createServer(serverName, 'gaming')
    })

    it('should configure server settings', () => {
      // Open server settings
      cy.get('[data-cy=server-dropdown]').click()
      cy.get('[data-cy=server-settings]').click()
      
      cy.get('[data-cy=server-settings-modal]').should('be.visible')
      
      // Update server information
      cy.get('[data-cy=server-name-input]').clear().type(`${serverName} Updated`)
      cy.get('[data-cy=server-description-input]').clear().type('Updated server description')
      
      // Change server icon
      cy.get('[data-cy=server-icon-upload]').selectFile('cypress/fixtures/test-icon.png', { force: true })
      
      // Update server region
      cy.get('[data-cy=server-region-select]').click()
      cy.get('[data-cy=region-us-east]').click()
      
      // Save changes
      cy.get('[data-cy=save-server-settings]').click()
      
      // Verify changes
      cy.get('[data-cy=server-header]').should('contain.text', `${serverName} Updated`)
      cy.get('[data-cy=server-sidebar]').should('contain.text', `${serverName} Updated`)
    })

    it('should manage server roles and permissions', () => {
      cy.get('[data-cy=server-dropdown]').click()
      cy.get('[data-cy=server-settings]').click()
      
      // Navigate to roles tab
      cy.get('[data-cy=settings-tab-roles]').click()
      
      // Create new role
      cy.get('[data-cy=create-role-button]').click()
      cy.get('[data-cy=role-name-input]').type('Moderator')
      cy.get('[data-cy=role-color-input]').type('#ff5733')
      
      // Set permissions
      cy.get('[data-cy=permission-manage-messages]').check()
      cy.get('[data-cy=permission-kick-members]').check()
      cy.get('[data-cy=permission-manage-channels]').check()
      
      cy.get('[data-cy=save-role-button]').click()
      
      // Verify role was created
      cy.get('[data-cy=role-list]').should('contain.text', 'Moderator')
    })

    it('should configure server moderation settings', () => {
      cy.get('[data-cy=server-dropdown]').click()
      cy.get('[data-cy=server-settings]').click()
      
      // Navigate to moderation tab
      cy.get('[data-cy=settings-tab-moderation]').click()
      
      // Enable auto-moderation
      cy.get('[data-cy=auto-mod-enable]').check()
      cy.get('[data-cy=filter-profanity]').check()
      cy.get('[data-cy=filter-spam]').check()
      
      // Set verification level
      cy.get('[data-cy=verification-level-select]').click()
      cy.get('[data-cy=verification-medium]').click()
      
      // Configure slowmode
      cy.get('[data-cy=default-slowmode-input]').clear().type('5')
      
      cy.get('[data-cy=save-moderation-settings]').click()
      
      // Verify settings saved
      cy.get('[data-cy=moderation-status]').should('contain.text', 'Auto-moderation enabled')
    })
  })

  context('Server Discovery and Joining', () => {
    it('should discover and join public servers', () => {
      cy.measurePerformance('server-discovery')
      
      // Open server discovery
      cy.get('[data-cy=add-server-button]').click()
      cy.get('[data-cy=discover-servers-option]').click()
      
      cy.get('[data-cy=server-discovery-modal]').should('be.visible')
      
      // Browse featured servers
      cy.get('[data-cy=featured-servers]').should('be.visible')
      cy.get('[data-cy=server-card]').should('have.length.at.least', 1)
      
      // Search for servers
      cy.get('[data-cy=server-search-input]').type('gaming')
      cy.get('[data-cy=search-button]').click()
      
      // Verify search results
      cy.get('[data-cy=search-results]').should('contain.text', 'gaming')
      
      // Join a server
      cy.get('[data-cy=server-card]').first().within(() => {
        cy.get('[data-cy=server-name]').should('be.visible')
        cy.get('[data-cy=member-count]').should('be.visible')
        cy.get('[data-cy=join-server-button]').click()
      })
      
      // Verify server was joined
      cy.get('[data-cy=server-sidebar]').should('contain.text', 'Gaming')
      
      cy.measurePerformance('server-discovery')
    })

    it('should join server via invite link', () => {
      const inviteCode = 'abc123'
      
      // Mock invite validation
      cy.intercept('GET', `/api/invites/${inviteCode}`, {
        statusCode: 200,
        body: {
          serverName: 'Invited Server',
          serverIcon: null,
          memberCount: 42,
          channelCount: 5,
          inviter: 'TestUser'
        }
      }).as('validateInvite')
      
      cy.intercept('POST', `/api/invites/${inviteCode}/join`, {
        statusCode: 200,
        body: { success: true, serverId: 'server123' }
      }).as('joinViaInvite')
      
      cy.get('[data-cy=add-server-button]').click()
      cy.get('[data-cy=join-server-option]').click()
      
      cy.get('[data-cy=invite-input]').type(inviteCode)
      cy.wait('@validateInvite')
      
      // Verify invite preview
      cy.get('[data-cy=invite-preview]').should('be.visible')
      cy.get('[data-cy=invite-server-name]').should('contain.text', 'Invited Server')
      cy.get('[data-cy=invite-member-count]').should('contain.text', '42 members')
      
      cy.get('[data-cy=join-server-button]').click()
      cy.wait('@joinViaInvite')
      
      // Verify server joined
      cy.get('[data-cy=server-sidebar]').should('contain.text', 'Invited Server')
    })

    it('should handle invalid invite codes', () => {
      cy.intercept('GET', '/api/invites/invalid', {
        statusCode: 404,
        body: { error: 'Invite not found or expired' }
      }).as('invalidInvite')
      
      cy.get('[data-cy=add-server-button]').click()
      cy.get('[data-cy=join-server-option]').click()
      
      cy.get('[data-cy=invite-input]').type('invalid')
      cy.wait('@invalidInvite')
      
      cy.get('[data-cy=invite-error]').should('contain.text', 'Invite not found or expired')
      cy.get('[data-cy=join-server-button]').should('be.disabled')
    })
  })

  context('Server Administration', () => {
    let serverName: string

    beforeEach(() => {
      serverName = `Admin Test ${Date.now()}`
      cy.createServer(serverName, 'gaming')
      
      // Mock admin permissions
      cy.window().then((win) => {
        if (win.matrixClient) {
          win.matrixClient.userPowerLevel = 100 // Admin level
        }
      })
    })

    it('should manage server members', () => {
      cy.get('[data-cy=server-dropdown]').click()
      cy.get('[data-cy=server-settings]').click()
      
      cy.get('[data-cy=settings-tab-members]').click()
      
      // View member list
      cy.get('[data-cy=member-list]').should('be.visible')
      cy.get('[data-cy=member-item]').should('have.length.at.least', 1)
      
      // Search members
      cy.get('[data-cy=member-search]').type('test')
      cy.get('[data-cy=member-item]').should('contain.text', 'test')
      
      // Member actions (mock)
      cy.get('[data-cy=member-item]').first().within(() => {
        cy.get('[data-cy=member-menu]').click()
      })
      
      cy.get('[data-cy=kick-member]').should('be.visible')
      cy.get('[data-cy=ban-member]').should('be.visible')
      cy.get('[data-cy=change-role]').should('be.visible')
    })

    it('should manage server invites', () => {
      cy.get('[data-cy=server-dropdown]').click()
      cy.get('[data-cy=server-settings]').click()
      
      cy.get('[data-cy=settings-tab-invites]').click()
      
      // Create new invite
      cy.get('[data-cy=create-invite-button]').click()
      
      // Configure invite settings
      cy.get('[data-cy=invite-expires-select]').click()
      cy.get('[data-cy=expire-7-days]').click()
      
      cy.get('[data-cy=invite-max-uses-input]').clear().type('10')
      
      cy.get('[data-cy=generate-invite-button]').click()
      
      // Verify invite created
      cy.get('[data-cy=invite-list]').should('contain.text', 'discord.gg/')
      cy.get('[data-cy=invite-code]').should('be.visible')
      
      // Copy invite link
      cy.get('[data-cy=copy-invite-button]').click()
      cy.get('[data-cy=copy-success]').should('contain.text', 'Copied!')
    })

    it('should view server audit logs', () => {
      cy.get('[data-cy=server-dropdown]').click()
      cy.get('[data-cy=server-settings]').click()
      
      cy.get('[data-cy=settings-tab-audit-log]').click()
      
      // View audit log entries
      cy.get('[data-cy=audit-log]').should('be.visible')
      cy.get('[data-cy=audit-entry]').should('have.length.at.least', 1)
      
      // Filter audit log
      cy.get('[data-cy=audit-filter-select]').click()
      cy.get('[data-cy=filter-member-join]').click()
      
      cy.get('[data-cy=audit-entry]').should('contain.text', 'Member joined')
      
      // Search audit log
      cy.get('[data-cy=audit-search]').type('testuser')
      cy.get('[data-cy=audit-entry]').should('contain.text', 'testuser')
    })
  })

  context('Server Deletion', () => {
    let serverName: string

    beforeEach(() => {
      serverName = `Delete Test ${Date.now()}`
      cy.createServer(serverName, 'gaming')
    })

    it('should delete server with confirmation', () => {
      cy.get('[data-cy=server-dropdown]').click()
      cy.get('[data-cy=server-settings]').click()
      
      // Navigate to danger zone
      cy.get('[data-cy=settings-tab-advanced]').click()
      cy.get('[data-cy=danger-zone]').should('be.visible')
      
      // Delete server
      cy.get('[data-cy=delete-server-button]').click()
      
      // Confirm deletion
      cy.get('[data-cy=delete-confirmation-modal]').should('be.visible')
      cy.get('[data-cy=delete-confirmation-input]').type(serverName)
      cy.get('[data-cy=confirm-delete-button]').click()
      
      // Verify server deleted
      cy.get('[data-cy=server-sidebar]').should('not.contain.text', serverName)
      cy.get('[data-cy=server-deleted-notice]').should('contain.text', 'Server deleted successfully')
    })

    it('should leave server as non-owner', () => {
      // Mock non-owner permissions
      cy.window().then((win) => {
        if (win.matrixClient) {
          win.matrixClient.userPowerLevel = 50 // Member level
        }
      })
      
      cy.get('[data-cy=server-dropdown]').click()
      cy.get('[data-cy=leave-server]').click()
      
      cy.get('[data-cy=leave-confirmation-modal]').should('be.visible')
      cy.get('[data-cy=confirm-leave-button]').click()
      
      // Verify server left
      cy.get('[data-cy=server-sidebar]').should('not.contain.text', serverName)
    })
  })

  context('Performance and Accessibility', () => {
    it('should meet performance requirements for server creation', () => {
      cy.visit('/dashboard')
      
      const startTime = Date.now()
      cy.createServer(`Perf Test ${Date.now()}`, 'gaming')
      
      cy.get('[data-cy=channel-list]').should('be.visible').then(() => {
        const creationTime = Date.now() - startTime
        
        expect(creationTime).to.be.lessThan(5000, 'Server creation should complete within 5 seconds')
        
        cy.task('logPerformance', {
          type: 'server-creation-performance',
          duration: creationTime,
          timestamp: Date.now()
        })
      })
    })

    it('should be accessible via keyboard navigation', () => {
      cy.injectAxe()
      
      // Test server creation modal accessibility
      cy.get('[data-cy=add-server-button]').focus().click()
      cy.get('[data-cy=create-server-option]').focus().click()
      
      cy.testKeyboardNavigation('[data-cy=server-name-input]')
      cy.checkAccessibility('[data-cy=create-server-modal]')
    })

    it('should handle large server lists efficiently', () => {
      // Create multiple servers to test performance
      const serverCount = 10
      
      for (let i = 0; i < serverCount; i++) {
        cy.createServer(`Test Server ${i}`, 'gaming')
      }
      
      cy.measureNetworkPerformance()
      cy.measureMemoryUsage()
      
      // Verify all servers are visible
      cy.get('[data-cy=server-list] [data-cy=server-icon]').should('have.length', serverCount + 1) // +1 for DM server
    })
  })
})