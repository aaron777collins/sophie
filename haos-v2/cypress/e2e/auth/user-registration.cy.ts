/**
 * User Registration End-to-End Tests
 * 
 * Tests comprehensive user registration flow including:
 * - Valid registration scenarios
 * - Input validation
 * - Error handling
 * - First-run experience
 */

describe('User Registration Flow', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.waitForPageLoad()
  })

  context('Valid Registration Scenarios', () => {
    it('should successfully register a new user with valid data', () => {
      const userData = {
        username: `testuser_${Date.now()}`,
        email: `test_${Date.now()}@example.com`,
        password: 'SecurePassword123!',
        confirmPassword: 'SecurePassword123!',
        acceptTerms: true
      }

      cy.measurePerformance('user-registration')
      
      // Navigate to registration
      cy.get('[data-cy=register-link]').click()
      cy.url().should('include', '/register')
      
      // Fill registration form
      cy.fillForm({
        username: userData.username,
        email: userData.email,
        password: userData.password,
        'confirm-password': userData.confirmPassword
      })
      
      // Accept terms and conditions
      cy.get('[data-cy=terms-checkbox]').check()
      cy.get('[data-cy=privacy-checkbox]').check()
      
      // Submit registration
      cy.get('[data-cy=register-button]').click()
      
      // Verify successful registration
      cy.url().should('not.include', '/register')
      cy.get('[data-cy=welcome-message]').should('be.visible')
      cy.get('[data-cy=user-menu]').should('contain.text', userData.username)
      
      // Verify first-run experience triggers
      cy.get('[data-cy=welcome-wizard]').should('be.visible')
      cy.get('[data-cy=create-first-server]').should('be.visible')
      
      cy.measurePerformance('user-registration')
    })

    it('should handle registration with different email formats', () => {
      const emailFormats = [
        'user@domain.com',
        'user.name@domain.co.uk',
        'user+tag@domain.org',
        'user123@sub.domain.com'
      ]

      emailFormats.forEach((email, index) => {
        cy.visit('/register')
        
        const userData = {
          username: `testuser${index}_${Date.now()}`,
          email: email,
          password: 'SecurePassword123!',
          confirmPassword: 'SecurePassword123!'
        }

        cy.fillForm({
          username: userData.username,
          email: userData.email,
          password: userData.password,
          'confirm-password': userData.confirmPassword
        })
        
        cy.get('[data-cy=terms-checkbox]').check()
        cy.get('[data-cy=register-button]').click()
        
        // Should not show email validation errors
        cy.get('[data-cy=email-error]').should('not.exist')
        cy.url().should('not.include', '/register')
      })
    })

    it('should handle registration with strong password variations', () => {
      const strongPasswords = [
        'MySecurePass123!',
        'P@ssw0rd2024#',
        'ComplexPassword$99',
        'Str0ng!P@ssw0rd'
      ]

      strongPasswords.forEach((password, index) => {
        cy.visit('/register')
        
        const userData = {
          username: `testuser${index}_${Date.now()}`,
          email: `test${index}_${Date.now()}@example.com`,
          password: password,
          confirmPassword: password
        }

        cy.fillForm({
          username: userData.username,
          email: userData.email,
          password: userData.password,
          'confirm-password': userData.confirmPassword
        })
        
        cy.get('[data-cy=terms-checkbox]').check()
        cy.get('[data-cy=register-button]').click()
        
        cy.get('[data-cy=password-error]').should('not.exist')
        cy.url().should('not.include', '/register')
      })
    })
  })

  context('Input Validation', () => {
    beforeEach(() => {
      cy.visit('/register')
    })

    it('should validate required fields', () => {
      cy.get('[data-cy=register-button]').click()
      
      cy.get('[data-cy=username-error]').should('contain.text', 'Username is required')
      cy.get('[data-cy=email-error]').should('contain.text', 'Email is required')
      cy.get('[data-cy=password-error]').should('contain.text', 'Password is required')
    })

    it('should validate username format and length', () => {
      const invalidUsernames = [
        { value: 'a', error: 'Username must be at least 3 characters' },
        { value: 'ab', error: 'Username must be at least 3 characters' },
        { value: 'a'.repeat(21), error: 'Username must be 20 characters or less' },
        { value: 'user with spaces', error: 'Username cannot contain spaces' },
        { value: 'user@name', error: 'Username can only contain letters, numbers, and underscores' },
        { value: '123user', error: 'Username must start with a letter' }
      ]

      invalidUsernames.forEach(({ value, error }) => {
        cy.get('[data-cy=username-input]').clear().type(value).blur()
        cy.get('[data-cy=username-error]').should('contain.text', error)
      })
    })

    it('should validate email format', () => {
      const invalidEmails = [
        { value: 'notanemail', error: 'Please enter a valid email address' },
        { value: '@domain.com', error: 'Please enter a valid email address' },
        { value: 'user@', error: 'Please enter a valid email address' },
        { value: 'user@domain', error: 'Please enter a valid email address' },
        { value: 'user..name@domain.com', error: 'Please enter a valid email address' }
      ]

      invalidEmails.forEach(({ value, error }) => {
        cy.get('[data-cy=email-input]').clear().type(value).blur()
        cy.get('[data-cy=email-error]').should('contain.text', error)
      })
    })

    it('should validate password strength', () => {
      const weakPasswords = [
        { value: '123', error: 'Password must be at least 8 characters' },
        { value: 'password', error: 'Password must contain at least one uppercase letter' },
        { value: 'Password', error: 'Password must contain at least one number' },
        { value: 'Password123', error: 'Password must contain at least one special character' },
        { value: 'PASSWORD123!', error: 'Password must contain at least one lowercase letter' }
      ]

      weakPasswords.forEach(({ value, error }) => {
        cy.get('[data-cy=password-input]').clear().type(value).blur()
        cy.get('[data-cy=password-error]').should('contain.text', error)
      })
    })

    it('should validate password confirmation', () => {
      cy.get('[data-cy=password-input]').type('SecurePassword123!')
      cy.get('[data-cy=confirm-password-input]').type('DifferentPassword123!')
      cy.get('[data-cy=confirm-password-input]').blur()
      
      cy.get('[data-cy=confirm-password-error]').should('contain.text', 'Passwords do not match')
    })

    it('should require terms and conditions acceptance', () => {
      cy.fillForm({
        username: 'testuser',
        email: 'test@example.com',
        password: 'SecurePassword123!',
        'confirm-password': 'SecurePassword123!'
      })
      
      cy.get('[data-cy=register-button]').click()
      
      cy.get('[data-cy=terms-error]').should('contain.text', 'You must accept the terms and conditions')
    })
  })

  context('Error Handling', () => {
    it('should handle duplicate username registration', () => {
      const existingUser = {
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'SecurePassword123!',
        confirmPassword: 'SecurePassword123!'
      }

      // Mock API response for duplicate username
      cy.intercept('POST', '/api/auth/register', {
        statusCode: 409,
        body: { error: 'Username already exists' }
      }).as('duplicateUsername')

      cy.fillForm({
        username: existingUser.username,
        email: existingUser.email,
        password: existingUser.password,
        'confirm-password': existingUser.confirmPassword
      })
      
      cy.get('[data-cy=terms-checkbox]').check()
      cy.get('[data-cy=register-button]').click()
      
      cy.wait('@duplicateUsername')
      cy.get('[data-cy=registration-error]').should('contain.text', 'Username already exists')
      cy.url().should('include', '/register')
    })

    it('should handle duplicate email registration', () => {
      cy.intercept('POST', '/api/auth/register', {
        statusCode: 409,
        body: { error: 'Email already registered' }
      }).as('duplicateEmail')

      cy.fillForm({
        username: 'newuser',
        email: 'existing@example.com',
        password: 'SecurePassword123!',
        'confirm-password': 'SecurePassword123!'
      })
      
      cy.get('[data-cy=terms-checkbox]').check()
      cy.get('[data-cy=register-button]').click()
      
      cy.wait('@duplicateEmail')
      cy.get('[data-cy=registration-error]').should('contain.text', 'Email already registered')
    })

    it('should handle server errors gracefully', () => {
      cy.intercept('POST', '/api/auth/register', {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('serverError')

      cy.fillForm({
        username: 'testuser',
        email: 'test@example.com',
        password: 'SecurePassword123!',
        'confirm-password': 'SecurePassword123!'
      })
      
      cy.get('[data-cy=terms-checkbox]').check()
      cy.get('[data-cy=register-button]').click()
      
      cy.wait('@serverError')
      cy.get('[data-cy=registration-error]').should('contain.text', 'Registration failed. Please try again.')
    })

    it('should handle network connectivity issues', () => {
      cy.intercept('POST', '/api/auth/register', { forceNetworkError: true }).as('networkError')

      cy.fillForm({
        username: 'testuser',
        email: 'test@example.com',
        password: 'SecurePassword123!',
        'confirm-password': 'SecurePassword123!'
      })
      
      cy.get('[data-cy=terms-checkbox]').check()
      cy.get('[data-cy=register-button]').click()
      
      cy.wait('@networkError')
      cy.get('[data-cy=registration-error]').should('contain.text', 'Network error. Please check your connection.')
    })
  })

  context('Accessibility', () => {
    beforeEach(() => {
      cy.visit('/register')
      cy.injectAxe()
    })

    it('should be accessible via keyboard navigation', () => {
      cy.testKeyboardNavigation('[data-cy=username-input]')
      
      // Tab through all form fields
      cy.get('[data-cy=username-input]').focus().tab()
      cy.focused().should('have.attr', 'data-cy', 'email-input')
      
      cy.focused().tab()
      cy.focused().should('have.attr', 'data-cy', 'password-input')
      
      cy.focused().tab()
      cy.focused().should('have.attr', 'data-cy', 'confirm-password-input')
      
      cy.focused().tab()
      cy.focused().should('have.attr', 'data-cy', 'terms-checkbox')
      
      cy.focused().tab()
      cy.focused().should('have.attr', 'data-cy', 'register-button')
    })

    it('should have proper ARIA labels and descriptions', () => {
      cy.get('[data-cy=username-input]').should('have.attr', 'aria-label', 'Username')
      cy.get('[data-cy=email-input]').should('have.attr', 'aria-label', 'Email address')
      cy.get('[data-cy=password-input]').should('have.attr', 'aria-label', 'Password')
      cy.get('[data-cy=confirm-password-input]').should('have.attr', 'aria-label', 'Confirm password')
      
      cy.testARIAAttributes()
    })

    it('should meet accessibility standards', () => {
      cy.checkAccessibility()
    })

    it('should have proper error announcements', () => {
      cy.get('[data-cy=register-button]').click()
      
      cy.get('[data-cy=username-error]').should('have.attr', 'role', 'alert')
      cy.get('[data-cy=email-error]').should('have.attr', 'role', 'alert')
      cy.get('[data-cy=password-error]').should('have.attr', 'role', 'alert')
    })
  })

  context('Performance', () => {
    it('should load registration page within performance budget', () => {
      cy.visit('/register')
      
      cy.checkPerformanceBudget({
        fcp: 1500,        // First Contentful Paint < 1.5s
        loadTime: 3000,   // Total load time < 3s
        jsSize: 1000000,  // JS bundle < 1MB
        cssSize: 100000   // CSS bundle < 100KB
      })
    })

    it('should complete registration within acceptable time', () => {
      cy.visit('/register')
      
      const startTime = Date.now()
      
      cy.fillForm({
        username: `perftest_${Date.now()}`,
        email: `perftest_${Date.now()}@example.com`,
        password: 'SecurePassword123!',
        'confirm-password': 'SecurePassword123!'
      })
      
      cy.get('[data-cy=terms-checkbox]').check()
      cy.get('[data-cy=register-button]').click()
      
      cy.url().should('not.include', '/register').then(() => {
        const endTime = Date.now()
        const registrationTime = endTime - startTime
        
        expect(registrationTime).to.be.lessThan(5000, 'Registration should complete within 5 seconds')
        
        cy.task('logPerformance', {
          type: 'registration-performance',
          duration: registrationTime,
          timestamp: Date.now()
        })
      })
    })
  })
})