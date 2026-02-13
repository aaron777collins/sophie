// Authentication Commands
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login')
  cy.get('[data-cy=email-input]').type(email)
  cy.get('[data-cy=password-input]').type(password)
  cy.get('[data-cy=login-button]').click()
  cy.wait('@login')
  cy.url().should('not.include', '/login')
})

Cypress.Commands.add('logout', () => {
  cy.get('[data-cy=user-menu]').click()
  cy.get('[data-cy=logout-button]').click()
  cy.url().should('include', '/login')
})

Cypress.Commands.add('registerUser', (userData: any) => {
  cy.visit('/register')
  cy.get('[data-cy=username-input]').type(userData.username)
  cy.get('[data-cy=email-input]').type(userData.email)
  cy.get('[data-cy=password-input]').type(userData.password)
  cy.get('[data-cy=confirm-password-input]').type(userData.confirmPassword)
  if (userData.acceptTerms) {
    cy.get('[data-cy=terms-checkbox]').check()
  }
  cy.get('[data-cy=register-button]').click()
})

// UI Interaction Commands
Cypress.Commands.add('fillForm', (formData: Record<string, string>) => {
  Object.entries(formData).forEach(([field, value]) => {
    cy.get(`[data-cy=${field}-input]`).clear().type(value)
  })
})

Cypress.Commands.add('waitForPageLoad', () => {
  cy.window().should('have.property', 'performance')
  cy.window().then((win) => {
    return new Cypress.Promise((resolve) => {
      const checkLoaded = () => {
        if (win.document.readyState === 'complete') {
          resolve()
        } else {
          setTimeout(checkLoaded, 100)
        }
      }
      checkLoaded()
    })
  })
})

// Server/Channel Commands
Cypress.Commands.add('createServer', (serverName: string, serverType: string = 'gaming') => {
  cy.get('[data-cy=add-server-button]').click()
  cy.get('[data-cy=create-server-option]').click()
  cy.get('[data-cy=server-name-input]').type(serverName)
  cy.get(`[data-cy=template-${serverType}]`).click()
  cy.get('[data-cy=create-server-submit]').click()
  cy.get('[data-cy=server-sidebar]').should('contain.text', serverName)
})

Cypress.Commands.add('joinServer', (serverInvite: string) => {
  cy.get('[data-cy=add-server-button]').click()
  cy.get('[data-cy=join-server-option]').click()
  cy.get('[data-cy=invite-input]').type(serverInvite)
  cy.get('[data-cy=join-server-submit]').click()
})

Cypress.Commands.add('createChannel', (channelName: string, channelType: string) => {
  cy.get('[data-cy=create-channel-button]').click()
  cy.get('[data-cy=channel-name-input]').type(channelName)
  cy.get(`[data-cy=channel-type-${channelType}]`).click()
  cy.get('[data-cy=create-channel-submit]').click()
  cy.get('[data-cy=channel-list]').should('contain.text', channelName)
})

Cypress.Commands.add('sendMessage', (message: string) => {
  cy.get('[data-cy=message-input]').type(`${message}{enter}`)
  cy.get('[data-cy=message-list]').should('contain.text', message)
})

Cypress.Commands.add('uploadFile', (filePath: string) => {
  cy.get('[data-cy=file-upload-button]').click()
  cy.get('[data-cy=file-input]').selectFile(filePath, { force: true })
  cy.get('[data-cy=upload-submit]').click()
})

// Voice/Video Commands
Cypress.Commands.add('joinVoiceChannel', (channelName: string) => {
  cy.get(`[data-cy=voice-channel-${channelName}]`).click()
  cy.get('[data-cy=join-voice-button]').click()
  cy.get('[data-cy=voice-controls]').should('be.visible')
})

Cypress.Commands.add('leaveVoiceChannel', () => {
  cy.get('[data-cy=leave-voice-button]').click()
  cy.get('[data-cy=voice-controls]').should('not.exist')
})

Cypress.Commands.add('toggleMute', () => {
  cy.get('[data-cy=mute-button]').click()
})

Cypress.Commands.add('startVideoCall', () => {
  cy.get('[data-cy=start-video-button]').click()
  cy.get('[data-cy=video-call-container]').should('be.visible')
})

Cypress.Commands.add('shareScreen', () => {
  cy.get('[data-cy=screen-share-button]').click()
  // Note: Real screen sharing permissions would need to be mocked in a real test
})

// Mobile Commands
Cypress.Commands.add('swipeLeft', () => {
  cy.get('body').trigger('touchstart', { touches: [{ clientX: 300, clientY: 300 }] })
  cy.get('body').trigger('touchmove', { touches: [{ clientX: 100, clientY: 300 }] })
  cy.get('body').trigger('touchend')
})

Cypress.Commands.add('swipeRight', () => {
  cy.get('body').trigger('touchstart', { touches: [{ clientX: 100, clientY: 300 }] })
  cy.get('body').trigger('touchmove', { touches: [{ clientX: 300, clientY: 300 }] })
  cy.get('body').trigger('touchend')
})

Cypress.Commands.add('longPress', (selector: string) => {
  cy.get(selector).trigger('touchstart')
  cy.wait(1000)
  cy.get(selector).trigger('touchend')
})