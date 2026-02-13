// Accessibility Testing Commands
import 'cypress-axe'

Cypress.Commands.add('checkAccessibility', (context?: string, options?: any) => {
  // Inject axe-core into the page
  cy.injectAxe()
  
  // Configure axe options with HAOS-specific rules
  const axeOptions = {
    rules: {
      // Disable color-contrast for now (can be enabled when colors are finalized)
      'color-contrast': { enabled: false },
      // Enable important accessibility rules
      'aria-allowed-attr': { enabled: true },
      'aria-required-children': { enabled: true },
      'aria-required-parent': { enabled: true },
      'aria-valid-attr': { enabled: true },
      'aria-valid-attr-value': { enabled: true },
      'button-name': { enabled: true },
      'bypass': { enabled: true },
      'empty-heading': { enabled: true },
      'focus-order-semantics': { enabled: true },
      'form-field-multiple-labels': { enabled: true },
      'frame-title': { enabled: true },
      'heading-order': { enabled: true },
      'image-alt': { enabled: true },
      'input-button-name': { enabled: true },
      'keyboard-navigation': { enabled: true },
      'label': { enabled: true },
      'landmark-banner-is-top-level': { enabled: true },
      'landmark-main-is-top-level': { enabled: true },
      'landmark-no-duplicate-banner': { enabled: true },
      'landmark-no-duplicate-main': { enabled: true },
      'landmark-one-main': { enabled: true },
      'link-name': { enabled: true },
      'list': { enabled: true },
      'listitem': { enabled: true },
      'nested-interactive': { enabled: true },
      'no-autoplay-audio': { enabled: true },
      'page-has-heading-one': { enabled: true },
      'role-img-alt': { enabled: true },
      'scrollable-region-focusable': { enabled: true },
      'select-name': { enabled: true },
      'skip-link': { enabled: true },
      'tabindex': { enabled: true }
    },
    tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
    ...options
  }
  
  // Run accessibility check
  cy.checkA11y(context, axeOptions, (violations) => {
    if (violations.length > 0) {
      const violationData = violations.map(violation => ({
        id: violation.id,
        impact: violation.impact,
        description: violation.description,
        help: violation.help,
        helpUrl: violation.helpUrl,
        nodes: violation.nodes.length
      }))
      
      cy.task('logPerformance', {
        type: 'accessibility-violations',
        violations: violationData,
        timestamp: Date.now()
      })
      
      // Log detailed violation information
      cy.log('Accessibility violations found:')
      violations.forEach(violation => {
        cy.log(`${violation.impact}: ${violation.description}`)
      })
    }
  })
})

// Keyboard navigation testing
Cypress.Commands.add('testKeyboardNavigation', (startElement?: string) => {
  if (startElement) {
    cy.get(startElement).focus()
  } else {
    cy.get('body').tab()
  }
  
  // Test basic tab navigation
  cy.focused().should('be.visible')
  cy.focused().tab()
  cy.focused().should('be.visible')
  
  // Test reverse tab navigation
  cy.focused().tab({ shift: true })
  cy.focused().should('be.visible')
  
  // Test Enter/Space key activation
  cy.focused().then($el => {
    if ($el.is('button') || $el.is('a') || $el.attr('role') === 'button') {
      cy.focused().type('{enter}')
      // Could add assertions here based on expected behavior
    }
  })
})

// Screen reader testing simulation
Cypress.Commands.add('testScreenReader', (element: string) => {
  cy.get(element).should('have.attr', 'aria-label').or('have.attr', 'aria-labelledby').or('contain.text')
  
  // Check for proper heading structure
  cy.get(element).find('h1, h2, h3, h4, h5, h6').should('exist')
  
  // Check for proper landmark roles
  cy.get('main').should('exist')
  cy.get('[role="navigation"], nav').should('exist')
  
  // Check for proper form labels
  cy.get('input, select, textarea').each($el => {
    const id = $el.attr('id')
    if (id) {
      cy.get(`label[for="${id}"]`).should('exist')
    } else {
      cy.wrap($el).should('have.attr', 'aria-label').or('have.attr', 'aria-labelledby')
    }
  })
})

// Focus management testing
Cypress.Commands.add('testFocusManagement', () => {
  // Test modal focus trapping
  cy.get('[role="dialog"]').should('exist').within(() => {
    cy.get('[data-cy="close-button"], button').first().focus()
    cy.focused().tab()
    cy.get('button, input, select, textarea, [tabindex]:not([tabindex="-1"])').last().tab()
    cy.get('[data-cy="close-button"], button').first().should('be.focused')
  })
})

// Test skip links
Cypress.Commands.add('testSkipLinks', () => {
  cy.get('body').tab()
  cy.focused().should('contain.text', 'Skip to main content').or('contain.text', 'Skip to content')
  cy.focused().type('{enter}')
  cy.get('main').should('be.focused').or('contain.focused')
})

// Color and contrast testing (when enabled)
Cypress.Commands.add('testColorContrast', (threshold: number = 4.5) => {
  cy.get('*').each($el => {
    const element = $el[0]
    const styles = window.getComputedStyle(element)
    const backgroundColor = styles.backgroundColor
    const color = styles.color
    
    if (backgroundColor !== 'rgba(0, 0, 0, 0)' && color !== 'rgba(0, 0, 0, 0)') {
      // Would need a contrast calculation library for real implementation
      cy.log(`Checking contrast for element: ${element.tagName}`)
    }
  })
})

// ARIA testing
Cypress.Commands.add('testARIAAttributes', () => {
  // Test required ARIA attributes
  cy.get('[aria-expanded]').each($el => {
    cy.wrap($el).should('have.attr', 'aria-expanded').and('match', /^(true|false)$/)
  })
  
  cy.get('[aria-selected]').each($el => {
    cy.wrap($el).should('have.attr', 'aria-selected').and('match', /^(true|false)$/)
  })
  
  cy.get('[aria-checked]').each($el => {
    cy.wrap($el).should('have.attr', 'aria-checked').and('match', /^(true|false|mixed)$/)
  })
  
  // Test ARIA relationships
  cy.get('[aria-describedby]').each($el => {
    const describedBy = $el.attr('aria-describedby')
    if (describedBy) {
      cy.get(`#${describedBy}`).should('exist')
    }
  })
  
  cy.get('[aria-labelledby]').each($el => {
    const labelledBy = $el.attr('aria-labelledby')
    if (labelledBy) {
      cy.get(`#${labelledBy}`).should('exist')
    }
  })
})

// Mobile accessibility testing
Cypress.Commands.add('testMobileAccessibility', () => {
  // Test touch target sizes (minimum 44px)
  cy.get('button, a, input[type="button"], input[type="submit"]').each($el => {
    cy.wrap($el).should('have.css', 'min-height').and('match', /(\d+)px/).then((minHeight) => {
      const height = parseInt(minHeight.toString().replace('px', ''))
      expect(height).to.be.at.least(44, 'Touch target should be at least 44px high')
    })
    
    cy.wrap($el).should('have.css', 'min-width').and('match', /(\d+)px/).then((minWidth) => {
      const width = parseInt(minWidth.toString().replace('px', ''))
      expect(width).to.be.at.least(44, 'Touch target should be at least 44px wide')
    })
  })
})

// Declare accessibility command types
declare global {
  namespace Cypress {
    interface Chainable {
      checkAccessibility(context?: string, options?: any): Chainable<void>
      testKeyboardNavigation(startElement?: string): Chainable<void>
      testScreenReader(element: string): Chainable<void>
      testFocusManagement(): Chainable<void>
      testSkipLinks(): Chainable<void>
      testColorContrast(threshold?: number): Chainable<void>
      testARIAAttributes(): Chainable<void>
      testMobileAccessibility(): Chainable<void>
    }
  }
}