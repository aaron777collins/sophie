import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login page with form elements', async ({ page }) => {
    // Check page title and heading
    await expect(page.getByRole('heading', { name: /sign in to your account/i })).toBeVisible();
    
    // Check form elements are present
    await expect(page.getByTestId('username-input')).toBeVisible();
    await expect(page.getByTestId('password-input')).toBeVisible();
    await expect(page.getByTestId('login-button')).toBeVisible();
    
    // Check labels
    await expect(page.getByText('Username')).toBeVisible();
    await expect(page.getByText('Password')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    // Try to submit empty form
    await page.getByTestId('login-button').click();
    
    // Check validation errors appear
    await expect(page.getByTestId('username-error')).toContainText('Username is required');
    await expect(page.getByTestId('password-error')).toContainText('Password is required');
  });

  test('should clear validation errors when typing', async ({ page }) => {
    // Submit empty form to trigger validation
    await page.getByTestId('login-button').click();
    await expect(page.getByTestId('username-error')).toBeVisible();
    
    // Type in username field
    await page.getByTestId('username-input').fill('testuser');
    
    // Username error should disappear
    await expect(page.getByTestId('username-error')).not.toBeVisible();
  });

  test('should mask password input', async ({ page }) => {
    const passwordInput = page.getByTestId('password-input');
    
    // Check that input type is password
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Type password and verify it's masked
    await passwordInput.fill('secretpassword');
    const inputValue = await passwordInput.inputValue();
    expect(inputValue).toBe('secretpassword'); // Value should be there
    
    // But visually it should be masked (can't directly test this with Playwright)
    // The browser handles the masking based on input type="password"
  });

  test('should show loading state during submission', async ({ page }) => {
    // Fill in valid form data
    await page.getByTestId('username-input').fill('demo');
    await page.getByTestId('password-input').fill('demo');
    
    // Click submit and immediately check loading state
    const loginButton = page.getByTestId('login-button');
    await loginButton.click();
    
    // Button should show loading text (briefly)
    await expect(loginButton).toContainText('Signing in...');
    
    // Inputs should be disabled during loading
    await expect(page.getByTestId('username-input')).toBeDisabled();
    await expect(page.getByTestId('password-input')).toBeDisabled();
  });

  test('should show error message for invalid credentials', async ({ page }) => {
    // Fill in invalid credentials
    await page.getByTestId('username-input').fill('invalid');
    await page.getByTestId('password-input').fill('wrong');
    
    // Submit form
    await page.getByTestId('login-button').click();
    
    // Wait for error message
    await expect(page.getByTestId('error-message')).toBeVisible();
    await expect(page.getByText('Invalid credentials')).toBeVisible();
    
    // Should remain on login page
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('should handle successful login', async ({ page }) => {
    // Fill in valid credentials (based on our demo implementation)
    await page.getByTestId('username-input').fill('demo');
    await page.getByTestId('password-input').fill('demo');
    
    // Submit form
    await page.getByTestId('login-button').click();
    
    // Should redirect to dashboard
    await page.waitForURL(/.*\/dashboard/);
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test('should be keyboard accessible', async ({ page }) => {
    // Tab navigation should work
    await page.keyboard.press('Tab');
    await expect(page.getByTestId('username-input')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.getByTestId('password-input')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.getByTestId('login-button')).toBeFocused();
    
    // Should be able to submit with Enter
    await page.getByTestId('username-input').fill('demo');
    await page.getByTestId('password-input').fill('demo');
    await page.getByTestId('password-input').press('Enter');
    
    // Should redirect on successful login via keyboard
    await page.waitForURL(/.*\/dashboard/);
  });

  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Page should still be usable
    await expect(page.getByRole('heading', { name: /sign in to your account/i })).toBeVisible();
    await expect(page.getByTestId('username-input')).toBeVisible();
    await expect(page.getByTestId('password-input')).toBeVisible();
    await expect(page.getByTestId('login-button')).toBeVisible();
    
    // Form should work on mobile
    await page.getByTestId('username-input').fill('demo');
    await page.getByTestId('password-input').fill('demo');
    await page.getByTestId('login-button').click();
    
    await page.waitForURL(/.*\/dashboard/);
    await expect(page).toHaveURL(/.*\/dashboard/);
  });
});