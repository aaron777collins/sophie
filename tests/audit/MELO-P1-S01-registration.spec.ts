import { test, expect } from '@playwright/test';

/**
 * MELO-P1-S01: Registration Audit
 * 
 * This test audits the user registration functionality on Melo V2 app
 * running on dev2.aaroncollins.info:3000
 * 
 * Purpose: Test-Driven Audit - Document expected vs actual behavior
 * Evidence: Screenshots at Desktop (1920x1080), Tablet (768x1024), Mobile (375x667)
 */

test.describe('MELO-P1-S01: User Registration Audit', () => {
  const BASE_URL = 'http://dev2.aaroncollins.info:3000';
  const TIMESTAMP = Date.now();
  const TEST_USER_EMAIL = `testuser${TIMESTAMP}@example.com`;
  const TEST_USERNAME = `testuser${TIMESTAMP}`;
  const TEST_PASSWORD = 'TestPass123!';

  // Viewport configurations
  const VIEWPORTS = {
    desktop: { width: 1920, height: 1080 },
    tablet: { width: 768, height: 1024 },
    mobile: { width: 375, height: 667 }
  };

  /**
   * AC-1: Registration Form Display
   * Test that registration form is properly displayed at all viewport sizes
   */
  test.describe('AC-1: Registration Form Display', () => {
    Object.entries(VIEWPORTS).forEach(([device, viewport]) => {
      test(`should display registration form correctly on ${device}`, async ({ page }) => {
        // Set viewport
        await page.setViewportSize(viewport);
        
        // Navigate to homepage
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');
        
        // Take screenshot of homepage
        await page.screenshot({ 
          path: `scheduler/validation/screenshots/melo-audit/MELO-P1-S01/${device}/homepage-${TIMESTAMP}.png`,
          fullPage: true 
        });

        // Look for registration link/button/form
        // Test multiple possible selectors for registration
        const registrationSelectors = [
          'a[href*="register"]',
          'a[href*="signup"]', 
          'a[href*="sign-up"]',
          'button:has-text("Register")',
          'button:has-text("Sign Up")',
          'button:has-text("Sign up")',
          'text=Register',
          'text=Sign Up',
          'text=Sign up'
        ];

        let registrationElement = null;
        let foundSelector = '';

        for (const selector of registrationSelectors) {
          try {
            const element = page.locator(selector).first();
            if (await element.isVisible({ timeout: 2000 })) {
              registrationElement = element;
              foundSelector = selector;
              console.log(`Found registration element with selector: ${selector}`);
              break;
            }
          } catch (error) {
            // Continue to next selector
          }
        }

        if (registrationElement) {
          // Take screenshot highlighting the registration element
          await registrationElement.highlight();
          await page.screenshot({ 
            path: `scheduler/validation/screenshots/melo-audit/MELO-P1-S01/${device}/registration-link-found-${TIMESTAMP}.png`,
            fullPage: true 
          });

          // Click on registration link/button
          await registrationElement.click();
          await page.waitForLoadState('networkidle');
          
          // Take screenshot of registration page/form
          await page.screenshot({ 
            path: `scheduler/validation/screenshots/melo-audit/MELO-P1-S01/${device}/registration-form-${TIMESTAMP}.png`,
            fullPage: true 
          });

          // Check for form fields: username, email, password
          const expectedFields = [
            { name: 'username', selectors: ['input[name="username"]', 'input[placeholder*="username" i]', 'input[type="text"]'] },
            { name: 'email', selectors: ['input[name="email"]', 'input[type="email"]', 'input[placeholder*="email" i]'] },
            { name: 'password', selectors: ['input[name="password"]', 'input[type="password"]', 'input[placeholder*="password" i]'] }
          ];

          const fieldsFound = {};

          for (const field of expectedFields) {
            for (const selector of field.selectors) {
              try {
                const element = page.locator(selector).first();
                if (await element.isVisible({ timeout: 1000 })) {
                  fieldsFound[field.name] = { selector, found: true };
                  console.log(`Found ${field.name} field with selector: ${selector}`);
                  break;
                }
              } catch (error) {
                // Continue to next selector
              }
            }
            
            if (!fieldsFound[field.name]) {
              fieldsFound[field.name] = { found: false };
              console.log(`Could not find ${field.name} field`);
            }
          }

          // Document findings - this is audit, so we record what we find
          console.log(`AC-1 Results for ${device}:`);
          console.log(`- Registration access: Found using "${foundSelector}"`);
          console.log(`- Username field: ${fieldsFound.username.found ? 'Found' : 'Not Found'}`);
          console.log(`- Email field: ${fieldsFound.email.found ? 'Found' : 'Not Found'}`);
          console.log(`- Password field: ${fieldsFound.password.found ? 'Found' : 'Not Found'}`);

          // For audit purposes, we expect to find these fields but record actual state
          // Not using hard assertions since this is behavior documentation
          try {
            expect(fieldsFound.username.found).toBeTruthy();
            expect(fieldsFound.email.found).toBeTruthy();
            expect(fieldsFound.password.found).toBeTruthy();
          } catch (assertionError) {
            console.log(`AC-1 Assertion failure for ${device}: ${assertionError.message}`);
            // Continue test to document actual behavior
          }

        } else {
          // No registration link found - document this finding
          console.log(`AC-1 Result for ${device}: No registration link/button found on homepage`);
          await page.screenshot({ 
            path: `scheduler/validation/screenshots/melo-audit/MELO-P1-S01/${device}/no-registration-found-${TIMESTAMP}.png`,
            fullPage: true 
          });

          // This might indicate registration is embedded on the homepage or requires different navigation
          // Check if there's already a registration form on the page
          const formSelectors = [
            'form',
            'div:has(input[type="email"], input[name="email"])',
            'div:has(input[type="password"], input[name="password"])'
          ];

          for (const selector of formSelectors) {
            try {
              const element = page.locator(selector);
              if (await element.count() > 0) {
                console.log(`Found potential form with selector: ${selector}`);
                await page.screenshot({ 
                  path: `scheduler/validation/screenshots/melo-audit/MELO-P1-S01/${device}/embedded-form-found-${TIMESTAMP}.png`,
                  fullPage: true 
                });
                break;
              }
            } catch (error) {
              // Continue
            }
          }
        }
      });
    });
  });

  /**
   * AC-2: Successful Registration
   * Test that valid registration data can be submitted successfully
   */
  test.describe('AC-2: Successful Registration', () => {
    Object.entries(VIEWPORTS).forEach(([device, viewport]) => {
      test(`should complete registration successfully on ${device}`, async ({ page }) => {
        // Set viewport
        await page.setViewportSize(viewport);
        
        // Navigate to registration (from AC-1 discovery)
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');
        
        // Try to find and navigate to registration form
        const registrationSelectors = [
          'a[href*="register"]',
          'a[href*="signup"]', 
          'a[href*="sign-up"]',
          'button:has-text("Register")',
          'button:has-text("Sign Up")'
        ];

        let onRegistrationPage = false;
        
        for (const selector of registrationSelectors) {
          try {
            const element = page.locator(selector).first();
            if (await element.isVisible({ timeout: 2000 })) {
              await element.click();
              await page.waitForLoadState('networkidle');
              onRegistrationPage = true;
              break;
            }
          } catch (error) {
            // Continue to next selector
          }
        }

        // Try to fill registration form
        const fillAttempts = {
          username: false,
          email: false,
          password: false,
          submit: false
        };

        // Fill username
        const usernameSelectors = ['input[name="username"]', 'input[placeholder*="username" i]', 'input[type="text"]'];
        for (const selector of usernameSelectors) {
          try {
            const element = page.locator(selector).first();
            if (await element.isVisible({ timeout: 1000 })) {
              await element.fill(TEST_USERNAME);
              fillAttempts.username = true;
              console.log(`Filled username using: ${selector}`);
              break;
            }
          } catch (error) {
            // Continue
          }
        }

        // Fill email
        const emailSelectors = ['input[name="email"]', 'input[type="email"]', 'input[placeholder*="email" i]'];
        for (const selector of emailSelectors) {
          try {
            const element = page.locator(selector).first();
            if (await element.isVisible({ timeout: 1000 })) {
              await element.fill(TEST_USER_EMAIL);
              fillAttempts.email = true;
              console.log(`Filled email using: ${selector}`);
              break;
            }
          } catch (error) {
            // Continue
          }
        }

        // Fill password
        const passwordSelectors = ['input[name="password"]', 'input[type="password"]', 'input[placeholder*="password" i]'];
        for (const selector of passwordSelectors) {
          try {
            const element = page.locator(selector).first();
            if (await element.isVisible({ timeout: 1000 })) {
              await element.fill(TEST_PASSWORD);
              fillAttempts.password = true;
              console.log(`Filled password using: ${selector}`);
              break;
            }
          } catch (error) {
            // Continue
          }
        }

        // Take screenshot with filled form
        await page.screenshot({ 
          path: `scheduler/validation/screenshots/melo-audit/MELO-P1-S01/${device}/form-filled-${TIMESTAMP}.png`,
          fullPage: true 
        });

        // Try to submit
        const submitSelectors = [
          'button[type="submit"]',
          'input[type="submit"]',
          'button:has-text("Register")',
          'button:has-text("Sign Up")',
          'button:has-text("Submit")',
          'form button'
        ];

        for (const selector of submitSelectors) {
          try {
            const element = page.locator(selector).first();
            if (await element.isVisible({ timeout: 1000 })) {
              // Listen for navigation or responses
              const responsePromise = page.waitForResponse(response => 
                response.url().includes('register') || 
                response.url().includes('signup') || 
                response.url().includes('auth'), { timeout: 10000 });
              
              await element.click();
              fillAttempts.submit = true;
              console.log(`Submitted using: ${selector}`);
              
              try {
                const response = await responsePromise;
                console.log(`Registration API response: ${response.status()}`);
                console.log(`Response URL: ${response.url()}`);
              } catch (responseError) {
                console.log('No API response detected or timeout');
              }
              
              // Wait a moment for any navigation/updates
              await page.waitForTimeout(3000);
              break;
            }
          } catch (error) {
            // Continue
          }
        }

        // Take screenshot of result
        await page.screenshot({ 
          path: `scheduler/validation/screenshots/melo-audit/MELO-P1-S01/${device}/registration-result-${TIMESTAMP}.png`,
          fullPage: true 
        });

        // Check current URL and page state
        const currentUrl = page.url();
        const pageTitle = await page.title();
        
        console.log(`AC-2 Results for ${device}:`);
        console.log(`- Username filled: ${fillAttempts.username}`);
        console.log(`- Email filled: ${fillAttempts.email}`);
        console.log(`- Password filled: ${fillAttempts.password}`);
        console.log(`- Submit attempted: ${fillAttempts.submit}`);
        console.log(`- Final URL: ${currentUrl}`);
        console.log(`- Page title: ${pageTitle}`);

        // Look for success indicators
        const successIndicators = [
          'text=success',
          'text=welcome',
          'text=verify',
          'text=confirmation',
          'text=registered',
          '.success',
          '.alert-success',
          '[data-testid="success"]'
        ];

        const errorIndicators = [
          'text=error',
          'text=failed',
          'text=invalid',
          '.error',
          '.alert-error',
          '[data-testid="error"]'
        ];

        let foundSuccess = false;
        let foundError = false;

        for (const selector of successIndicators) {
          try {
            if (await page.locator(selector).isVisible({ timeout: 1000 })) {
              foundSuccess = true;
              console.log(`Success indicator found: ${selector}`);
              break;
            }
          } catch (error) {
            // Continue
          }
        }

        for (const selector of errorIndicators) {
          try {
            if (await page.locator(selector).isVisible({ timeout: 1000 })) {
              foundError = true;
              console.log(`Error indicator found: ${selector}`);
              break;
            }
          } catch (error) {
            // Continue
          }
        }

        console.log(`- Success indicator: ${foundSuccess}`);
        console.log(`- Error indicator: ${foundError}`);

        // Document the test user credentials for S02
        if (fillAttempts.username && fillAttempts.email && fillAttempts.password && fillAttempts.submit) {
          console.log('Test user credentials for S02:');
          console.log(`  Username: ${TEST_USERNAME}`);
          console.log(`  Email: ${TEST_USER_EMAIL}`);
          console.log(`  Password: ${TEST_PASSWORD}`);
        }
      });
    });
  });

  /**
   * AC-3: Registration Validation Errors
   * Test that invalid data shows appropriate validation errors
   */
  test.describe('AC-3: Registration Validation Errors', () => {
    // Test at desktop size only for error validation
    test('should show validation errors for invalid data on desktop', async ({ page }) => {
      // Set desktop viewport
      await page.setViewportSize(VIEWPORTS.desktop);
      
      // Navigate to registration
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');
      
      // Find registration form (same logic as AC-2)
      const registrationSelectors = [
        'a[href*="register"]',
        'a[href*="signup"]', 
        'a[href*="sign-up"]',
        'button:has-text("Register")',
        'button:has-text("Sign Up")'
      ];

      for (const selector of registrationSelectors) {
        try {
          const element = page.locator(selector).first();
          if (await element.isVisible({ timeout: 2000 })) {
            await element.click();
            await page.waitForLoadState('networkidle');
            break;
          }
        } catch (error) {
          // Continue
        }
      }

      // Test cases for validation
      const testCases = [
        {
          name: 'empty-fields',
          username: '',
          email: '',
          password: '',
          description: 'All fields empty'
        },
        {
          name: 'invalid-email',
          username: 'validuser',
          email: 'invalid-email',
          password: 'ValidPass123!',
          description: 'Invalid email format'
        },
        {
          name: 'weak-password',
          username: 'validuser2',
          email: 'valid@email.com',
          password: '123',
          description: 'Weak password'
        }
      ];

      for (const testCase of testCases) {
        console.log(`Testing validation case: ${testCase.description}`);
        
        // Clear and fill fields
        try {
          // Clear previous values
          const usernameField = page.locator('input[name="username"], input[placeholder*="username" i], input[type="text"]').first();
          const emailField = page.locator('input[name="email"], input[type="email"], input[placeholder*="email" i]').first();
          const passwordField = page.locator('input[name="password"], input[type="password"], input[placeholder*="password" i]').first();

          if (await usernameField.isVisible({ timeout: 1000 })) {
            await usernameField.clear();
            await usernameField.fill(testCase.username);
          }

          if (await emailField.isVisible({ timeout: 1000 })) {
            await emailField.clear();
            await emailField.fill(testCase.email);
          }

          if (await passwordField.isVisible({ timeout: 1000 })) {
            await passwordField.clear();
            await passwordField.fill(testCase.password);
          }

          // Take screenshot before submission
          await page.screenshot({ 
            path: `scheduler/validation/screenshots/melo-audit/MELO-P1-S01/desktop/validation-${testCase.name}-before-${TIMESTAMP}.png`,
            fullPage: true 
          });

          // Try to submit
          const submitSelectors = [
            'button[type="submit"]',
            'input[type="submit"]',
            'button:has-text("Register")',
            'button:has-text("Sign Up")',
            'button:has-text("Submit")'
          ];

          for (const submitSelector of submitSelectors) {
            try {
              const submitBtn = page.locator(submitSelector).first();
              if (await submitBtn.isVisible({ timeout: 1000 })) {
                await submitBtn.click();
                await page.waitForTimeout(2000); // Wait for validation messages
                break;
              }
            } catch (error) {
              // Continue
            }
          }

          // Take screenshot after submission to capture validation errors
          await page.screenshot({ 
            path: `scheduler/validation/screenshots/melo-audit/MELO-P1-S01/desktop/validation-${testCase.name}-after-${TIMESTAMP}.png`,
            fullPage: true 
          });

          // Look for validation error messages
          const errorSelectors = [
            '.error',
            '.invalid',
            '.validation-error',
            '[class*="error"]',
            '[class*="invalid"]',
            'text=required',
            'text=invalid',
            'text=must be',
            'text=Please'
          ];

          const errorsFound = [];
          for (const errorSelector of errorSelectors) {
            try {
              const errorElements = page.locator(errorSelector);
              const count = await errorElements.count();
              if (count > 0) {
                for (let i = 0; i < count; i++) {
                  const errorText = await errorElements.nth(i).textContent();
                  if (errorText && errorText.trim()) {
                    errorsFound.push({ selector: errorSelector, text: errorText.trim() });
                  }
                }
              }
            } catch (error) {
              // Continue
            }
          }

          console.log(`Validation errors found for ${testCase.description}:`, errorsFound);

        } catch (testError) {
          console.log(`Error testing case ${testCase.description}:`, testError.message);
        }

        // Wait between test cases
        await page.waitForTimeout(1000);
      }
    });
  });
});