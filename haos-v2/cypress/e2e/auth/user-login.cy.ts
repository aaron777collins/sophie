/**
 * User Login End-to-End Tests
 * 
 * Tests comprehensive user login flow including:
 * - Valid login scenarios
 * - Credential validation
 * - Error handling
 * - Session management
 * - Remember me functionality
 */

describe('User Login Flow', () => {
  const validUser = {
    email: 'test@example.com',
    password: 'SecurePassword123!'
  }

  beforeEach(() => {
    cy.visit('/login')
    cy.waitForPageLoad()
  })

  context('Valid Login Scenarios', () => {
    it('should successfully login with valid credentials', () => {
      cy.measurePerformance('user-login')
      
      // Mock successful login
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: {
          user: {
            id: 'user123',
            email: validUser.email,
            username: 'testuser',
            displayName: 'Test User'
          },
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token'
        }
      }).as('successfulLogin')
      
      cy.intercept('GET', '/api/user/profile', {
        statusCode: 200,
        body: {
          id: 'user123',
          email: validUser.email,
          username: 'testuser',
          displayName: 'Test User',
          avatar: null
        }
      }).as('userProfile')

      // Enter credentials
      cy.get('[data-cy=email-input]').type(validUser.email)
      cy.get('[data-cy=password-input]').type(validUser.password)
      cy.get('[data-cy=login-button]').click()
      
      // Verify API calls
      cy.wait('@successfulLogin')
      cy.wait('@userProfile')
      
      // Verify successful login
      cy.url().should('not.include', '/login')
      cy.get('[data-cy=user-menu]').should('be.visible')
      cy.get('[data-cy=user-menu]').should('contain.text', 'testuser')
      
      // Verify tokens are stored
      cy.window().its('localStorage.mx_access_token').should('exist')
      cy.window().its('localStorage.mx_user_id').should('exist')
      
      cy.measurePerformance('user-login')
    })

    it('should login with remember me functionality', () => {
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: {
          user: { id: 'user123', email: validUser.email, username: 'testuser' },
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token'
        }
      }).as('loginWithRememberMe')

      cy.get('[data-cy=email-input]').type(validUser.email)
      cy.get('[data-cy=password-input]').type(validUser.password)
      cy.get('[data-cy=remember-me-checkbox]').check()
      cy.get('[data-cy=login-button]').click()
      
      cy.wait('@loginWithRememberMe')
      
      // Verify remember me token is stored
      cy.getCookie('remember_token').should('exist')
      cy.window().its('localStorage.rememberMe').should('equal', 'true')
    })

    it('should auto-login with valid session', () => {
      // Set up existing session
      cy.window().then((win) => {
        win.localStorage.setItem('mx_access_token', 'valid-token')
        win.localStorage.setItem('mx_user_id', '@testuser:matrix.org')
        win.localStorage.setItem('mx_device_id', 'device123')
      })

      cy.intercept('GET', '/api/auth/verify', {
        statusCode: 200,
        body: { valid: true, user: { username: 'testuser' } }
      }).as('sessionVerify')

      cy.visit('/')
      cy.wait('@sessionVerify')
      
      // Should skip login and go to main app
      cy.url().should('not.include', '/login')
      cy.get('[data-cy=user-menu]').should('be.visible')
    })

    it('should handle Matrix server login flow', () => {
      cy.intercept('POST', '**/_matrix/client/r0/login', {
        statusCode: 200,
        body: {
          access_token: 'matrix-access-token',
          user_id: '@testuser:matrix.org',
          device_id: 'device123',
          home_server: 'matrix.org'
        }
      }).as('matrixLogin')

      // Select Matrix server login option
      cy.get('[data-cy=matrix-server-toggle]').click()
      cy.get('[data-cy=homeserver-input]').type('matrix.org')
      cy.get('[data-cy=username-input]').type('testuser')
      cy.get('[data-cy=password-input]').type(validUser.password)
      cy.get('[data-cy=login-button]').click()
      
      cy.wait('@matrixLogin')
      
      // Verify Matrix-specific login success
      cy.url().should('not.include', '/login')
      cy.window().its('localStorage.mx_hs_url').should('equal', 'https://matrix.org')
    })
  })

  context('Credential Validation', () => {
    it('should validate required fields', () => {
      cy.get('[data-cy=login-button]').click()
      
      cy.get('[data-cy=email-error]').should('contain.text', 'Email is required')
      cy.get('[data-cy=password-error]').should('contain.text', 'Password is required')
      cy.url().should('include', '/login')
    })

    it('should validate email format', () => {
      const invalidEmails = [
        'not-an-email',
        '@domain.com',
        'user@',
        'user@domain',
        'user..name@domain.com'
      ]

      invalidEmails.forEach(email => {
        cy.get('[data-cy=email-input]').clear().type(email).blur()
        cy.get('[data-cy=email-error]').should('contain.text', 'Please enter a valid email address')
      })
    })

    it('should handle invalid credentials', () => {
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 401,
        body: { error: 'Invalid credentials' }
      }).as('invalidLogin')

      cy.get('[data-cy=email-input]').type('wrong@example.com')
      cy.get('[data-cy=password-input]').type('wrongpassword')
      cy.get('[data-cy=login-button]').click()
      
      cy.wait('@invalidLogin')
      cy.get('[data-cy=login-error]').should('contain.text', 'Invalid email or password')
      cy.url().should('include', '/login')
      
      // Form should remain populated except password
      cy.get('[data-cy=email-input]').should('have.value', 'wrong@example.com')
      cy.get('[data-cy=password-input]').should('have.value', '')
    })

    it('should handle account lockout', () => {
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 423,
        body: { 
          error: 'Account temporarily locked due to too many failed attempts',
          retryAfter: 300
        }
      }).as('accountLocked')

      cy.get('[data-cy=email-input]').type(validUser.email)
      cy.get('[data-cy=password-input]').type('wrongpassword')
      cy.get('[data-cy=login-button]').click()
      
      cy.wait('@accountLocked')
      cy.get('[data-cy=login-error]').should('contain.text', 'Account temporarily locked')
      cy.get('[data-cy=retry-timer]').should('be.visible')
      cy.get('[data-cy=login-button]').should('be.disabled')
    })

    it('should handle unverified email', () => {
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 403,
        body: { error: 'Email not verified' }
      }).as('unverifiedEmail')

      cy.get('[data-cy=email-input]').type('unverified@example.com')
      cy.get('[data-cy=password-input]').type(validUser.password)
      cy.get('[data-cy=login-button]').click()
      
      cy.wait('@unverifiedEmail')
      cy.get('[data-cy=verification-notice]').should('be.visible')
      cy.get('[data-cy=resend-verification-button]').should('be.visible')
    })
  })

  context('Session Management', () => {
    it('should handle session expiry gracefully', () => {
      // Login first
      cy.login(validUser.email, validUser.password)
      
      // Mock expired session
      cy.intercept('GET', '/api/user/profile', {
        statusCode: 401,
        body: { error: 'Token expired' }
      }).as('expiredSession')

      // Trigger API call that requires authentication
      cy.visit('/dashboard')
      cy.wait('@expiredSession')
      
      // Should redirect to login with appropriate message
      cy.url().should('include', '/login')
      cy.get('[data-cy=session-expired-notice]').should('contain.text', 'Session expired. Please log in again.')
    })

    it('should handle automatic token refresh', () => {
      cy.intercept('POST', '/api/auth/refresh', {
        statusCode: 200,
        body: {
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token'
        }
      }).as('tokenRefresh')

      // Set up near-expired session
      cy.window().then((win) => {
        win.localStorage.setItem('mx_access_token', 'expiring-token')
        win.localStorage.setItem('mx_refresh_token', 'refresh-token')
      })

      cy.visit('/dashboard')
      cy.wait('@tokenRefresh')
      
      // Should continue to dashboard with new tokens
      cy.url().should('include', '/dashboard')
      cy.window().its('localStorage.mx_access_token').should('equal', 'new-access-token')
    })

    it('should handle logout properly', () => {
      cy.login(validUser.email, validUser.password)
      
      cy.intercept('POST', '/api/auth/logout', {
        statusCode: 200,
        body: { success: true }
      }).as('logout')

      cy.get('[data-cy=user-menu]').click()
      cy.get('[data-cy=logout-button]').click()
      
      cy.wait('@logout')
      
      // Verify cleanup
      cy.url().should('include', '/login')
      cy.window().its('localStorage').should('not.have.property', 'mx_access_token')
      cy.window().its('localStorage').should('not.have.property', 'mx_user_id')
      cy.getAllCookies().should('be.empty')
    })
  })

  context('Error Handling', () => {
    it('should handle server errors', () => {
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('serverError')

      cy.get('[data-cy=email-input]').type(validUser.email)
      cy.get('[data-cy=password-input]').type(validUser.password)
      cy.get('[data-cy=login-button]').click()
      
      cy.wait('@serverError')
      cy.get('[data-cy=login-error]').should('contain.text', 'Server error. Please try again later.')
    })

    it('should handle network connectivity issues', () => {
      cy.intercept('POST', '/api/auth/login', { forceNetworkError: true }).as('networkError')

      cy.get('[data-cy=email-input]').type(validUser.email)
      cy.get('[data-cy=password-input]').type(validUser.password)
      cy.get('[data-cy=login-button]').click()
      
      cy.wait('@networkError')
      cy.get('[data-cy=login-error]').should('contain.text', 'Network error. Please check your connection.')
      
      // Should offer retry option
      cy.get('[data-cy=retry-button]').should('be.visible')
    })

    it('should handle Matrix server unavailable', () => {
      cy.intercept('POST', '**/_matrix/client/r0/login', {
        statusCode: 503,
        body: { error: 'Service unavailable' }
      }).as('matrixUnavailable')

      cy.get('[data-cy=matrix-server-toggle]').click()
      cy.get('[data-cy=homeserver-input]').type('unavailable.matrix.org')
      cy.get('[data-cy=username-input]').type('testuser')
      cy.get('[data-cy=password-input]').type(validUser.password)
      cy.get('[data-cy=login-button]').click()
      
      cy.wait('@matrixUnavailable')
      cy.get('[data-cy=matrix-server-error]').should('contain.text', 'Matrix server unavailable')
    })
  })

  context('Security Features', () => {
    it('should implement rate limiting', () => {
      // Mock rate limit response
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 429,
        body: { 
          error: 'Too many requests',
          retryAfter: 60
        }
      }).as('rateLimited')

      // Attempt multiple logins quickly
      for (let i = 0; i < 5; i++) {
        cy.get('[data-cy=email-input]').clear().type(validUser.email)
        cy.get('[data-cy=password-input]').clear().type('wrongpassword')
        cy.get('[data-cy=login-button]').click()
        
        if (i === 4) {
          cy.wait('@rateLimited')
          cy.get('[data-cy=rate-limit-error]').should('be.visible')
          cy.get('[data-cy=login-button]').should('be.disabled')
        }
      }
    })

    it('should handle two-factor authentication', () => {
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: {
          requiresTwoFactor: true,
          tempToken: 'temp-2fa-token'
        }
      }).as('requires2FA')

      cy.get('[data-cy=email-input]').type(validUser.email)
      cy.get('[data-cy=password-input]').type(validUser.password)
      cy.get('[data-cy=login-button]').click()
      
      cy.wait('@requires2FA')
      
      // Should show 2FA input
      cy.get('[data-cy=two-factor-input]').should('be.visible')
      cy.get('[data-cy=verify-2fa-button]').should('be.visible')
      
      // Mock successful 2FA verification
      cy.intercept('POST', '/api/auth/verify-2fa', {
        statusCode: 200,
        body: {
          user: { id: 'user123', username: 'testuser' },
          accessToken: 'access-token'
        }
      }).as('verify2FA')

      cy.get('[data-cy=two-factor-input]').type('123456')
      cy.get('[data-cy=verify-2fa-button]').click()
      
      cy.wait('@verify2FA')
      cy.url().should('not.include', '/login')
    })

    it('should prevent password field inspection', () => {
      cy.get('[data-cy=password-input]').should('have.attr', 'type', 'password')
      cy.get('[data-cy=password-input]').should('have.attr', 'autocomplete', 'current-password')
      
      // Test password visibility toggle
      cy.get('[data-cy=password-visibility-toggle]').click()
      cy.get('[data-cy=password-input]').should('have.attr', 'type', 'text')
      
      cy.get('[data-cy=password-visibility-toggle]').click()
      cy.get('[data-cy=password-input]').should('have.attr', 'type', 'password')
    })
  })

  context('Accessibility', () => {
    beforeEach(() => {
      cy.injectAxe()
    })

    it('should be accessible via keyboard navigation', () => {
      cy.testKeyboardNavigation('[data-cy=email-input]')
      
      // Tab through form elements
      cy.get('[data-cy=email-input]').focus().tab()
      cy.focused().should('have.attr', 'data-cy', 'password-input')
      
      cy.focused().tab()
      cy.focused().should('have.attr', 'data-cy', 'remember-me-checkbox')
      
      cy.focused().tab()
      cy.focused().should('have.attr', 'data-cy', 'login-button')
    })

    it('should meet accessibility standards', () => {
      cy.checkAccessibility()
    })

    it('should have proper form labels and descriptions', () => {
      cy.get('[data-cy=email-input]').should('have.attr', 'aria-label', 'Email address')
      cy.get('[data-cy=password-input]').should('have.attr', 'aria-label', 'Password')
      
      cy.testARIAAttributes()
    })

    it('should announce errors properly', () => {
      cy.get('[data-cy=login-button]').click()
      
      cy.get('[data-cy=email-error]').should('have.attr', 'role', 'alert')
      cy.get('[data-cy=password-error]').should('have.attr', 'role', 'alert')
    })
  })

  context('Performance', () => {
    it('should load login page within performance budget', () => {
      cy.checkPerformanceBudget({
        fcp: 1500,
        loadTime: 3000,
        jsSize: 500000,
        cssSize: 100000
      })
    })

    it('should complete login within acceptable time', () => {
      const startTime = Date.now()
      
      cy.login(validUser.email, validUser.password)
      
      cy.url().should('not.include', '/login').then(() => {
        const loginTime = Date.now() - startTime
        
        expect(loginTime).to.be.lessThan(3000, 'Login should complete within 3 seconds')
        
        cy.task('logPerformance', {
          type: 'login-performance',
          duration: loginTime,
          timestamp: Date.now()
        })
      })
    })

    it('should maintain performance with remember me', () => {
      // Set remember me cookie
      cy.setCookie('remember_token', 'valid-remember-token')
      
      cy.intercept('POST', '/api/auth/remember-me', {
        statusCode: 200,
        body: {
          user: { id: 'user123', username: 'testuser' },
          accessToken: 'access-token'
        }
      }).as('rememberMeLogin')

      const startTime = Date.now()
      cy.visit('/')
      
      cy.wait('@rememberMeLogin')
      cy.url().should('not.include', '/login').then(() => {
        const autoLoginTime = Date.now() - startTime
        
        expect(autoLoginTime).to.be.lessThan(1000, 'Auto-login should be under 1 second')
      })
    })
  })
})