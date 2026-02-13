// Import Cypress commands
import './commands'
import './matrix-commands'
import './performance-commands'
import './accessibility-commands'

// Import external plugins
import 'cypress-real-events'
import 'cypress-file-upload'
import 'cypress-axe'
import '@testing-library/cypress/add-commands'

// Global test configuration
beforeEach(() => {
  // Clear localStorage and sessionStorage
  cy.clearLocalStorage()
  cy.clearCookies()
  
  // Set up performance monitoring
  cy.window().then((win) => {
    // Monitor Core Web Vitals
    win.performance.mark('test-start')
  })
  
  // Intercept common API calls
  cy.intercept('GET', '/api/health', { fixture: 'health-check.json' }).as('healthCheck')
  cy.intercept('POST', '/api/auth/login', { fixture: 'auth/login-success.json' }).as('login')
  cy.intercept('GET', '/api/user/profile', { fixture: 'user/profile.json' }).as('userProfile')
  
  // Mock Matrix SDK calls
  cy.intercept('GET', '**/_matrix/client/versions', { fixture: 'matrix/versions.json' }).as('matrixVersions')
  cy.intercept('POST', '**/_matrix/client/r0/login', { fixture: 'matrix/login.json' }).as('matrixLogin')
  cy.intercept('GET', '**/_matrix/client/r0/sync*', { fixture: 'matrix/sync.json' }).as('matrixSync')
})

afterEach(() => {
  // Capture performance metrics
  cy.window().then((win) => {
    const navigation = win.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    const paint = win.performance.getEntriesByType('paint')
    
    const metrics = {
      loadTime: navigation.loadEventEnd - navigation.loadEventStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
      firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0
    }
    
    cy.task('logPerformance', metrics)
  })
})

// Configure Cypress to handle uncaught exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
  // Don't fail tests on Matrix SDK connection errors during testing
  if (err.message.includes('Matrix') || err.message.includes('Network')) {
    return false
  }
  
  // Let other errors fail the test
  return true
})

// Global custom commands type declarations
declare global {
  namespace Cypress {
    interface Chainable {
      // Authentication commands
      login(email: string, password: string): Chainable<void>
      logout(): Chainable<void>
      registerUser(userData: any): Chainable<void>
      
      // Matrix commands  
      matrixLogin(userId: string, password: string): Chainable<void>
      joinMatrixRoom(roomId: string): Chainable<void>
      createMatrixRoom(roomName: string): Chainable<void>
      sendMatrixMessage(roomId: string, message: string): Chainable<void>
      
      // UI interaction commands
      fillForm(formData: Record<string, string>): Chainable<void>
      waitForPageLoad(): Chainable<void>
      checkAccessibility(): Chainable<void>
      
      // Server/Channel commands
      createServer(serverName: string, serverType?: string): Chainable<void>
      joinServer(serverInvite: string): Chainable<void>
      createChannel(channelName: string, channelType: string): Chainable<void>
      sendMessage(message: string): Chainable<void>
      uploadFile(filePath: string): Chainable<void>
      
      // Voice/Video commands
      joinVoiceChannel(channelName: string): Chainable<void>
      leaveVoiceChannel(): Chainable<void>
      toggleMute(): Chainable<void>
      startVideoCall(): Chainable<void>
      shareScreen(): Chainable<void>
      
      // Performance commands
      measurePerformance(actionName: string): Chainable<void>
      checkLoadTime(threshold: number): Chainable<void>
      
      // Mobile specific commands
      swipeLeft(): Chainable<void>
      swipeRight(): Chainable<void>
      longPress(selector: string): Chainable<void>
    }
  }
}