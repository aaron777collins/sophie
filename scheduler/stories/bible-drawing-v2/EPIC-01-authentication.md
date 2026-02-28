# Epic 01: Authentication System

**Epic ID:** BDV2-EPIC-01  
**Priority:** P0 (MVP)  
**Status:** Draft  
**Dependencies:** None  

## Description

Implement a secure authentication system for the Bible Drawing Video Pipeline V2. The system must support username/password authentication (not HTTP Basic Auth), secure session management, and provide a foundation for future multi-user support.

## Business Value

- Protects Aaron's video content and editing work
- Prevents unauthorized access to the video processing system
- Enables personalized settings and project management
- Provides audit trail for actions taken

## Acceptance Criteria (Epic Level)

- [ ] User can securely log in with username/password
- [ ] Sessions persist across browser refreshes
- [ ] Sessions expire after inactivity
- [ ] Protected routes redirect to login
- [ ] Password is never stored in plain text

---

## User Stories

### Story 1.1: User Login

**Story ID:** BDV2-US-1.1  
**Points:** 5  
**Priority:** P0  

> As Aaron, I want to log in with a username and password so that I can access my video projects securely.

#### Acceptance Criteria

```gherkin
Feature: User Login

  Background:
    Given the application is running
    And a user account exists with username "aaron" and valid password

  Scenario: Successful login with valid credentials
    Given I am on the login page
    When I enter username "aaron"
    And I enter a valid password
    And I click the "Sign In" button
    Then I should be redirected to the projects dashboard
    And I should see a welcome message with my username
    And a secure session cookie should be set

  Scenario: Failed login with invalid password
    Given I am on the login page
    When I enter username "aaron"
    And I enter an invalid password
    And I click the "Sign In" button
    Then I should remain on the login page
    And I should see an error message "Invalid credentials"
    And no session cookie should be set

  Scenario: Failed login with non-existent user
    Given I am on the login page
    When I enter username "nonexistent"
    And I enter any password
    And I click the "Sign In" button
    Then I should see an error message "Invalid credentials"
    And the error should not reveal whether the user exists

  Scenario: Login form validation
    Given I am on the login page
    When I leave the username field empty
    And I click the "Sign In" button
    Then I should see a validation error "Username is required"

  Scenario: Password field is masked
    Given I am on the login page
    When I type in the password field
    Then the characters should be masked (shown as dots/asterisks)
```

#### Technical Notes
- Use NextAuth.js with credentials provider
- Hash passwords with Argon2
- Session tokens stored in httpOnly cookies
- CSRF token validation enabled

#### Playwright Test Specs

```typescript
test.describe('User Login', () => {
  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="username-input"]', 'aaron');
    await page.fill('[data-testid="password-input"]', 'validpassword');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL('/projects');
    await expect(page.locator('[data-testid="welcome-message"]')).toContainText('aaron');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="username-input"]', 'aaron');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page).toHaveURL('/login');
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/login');
    await page.click('[data-testid="login-button"]');
    await expect(page.locator('[data-testid="username-error"]')).toContainText('required');
  });
});
```

---

### Story 1.2: Session Management

**Story ID:** BDV2-US-1.2  
**Points:** 3  
**Priority:** P0  

> As a logged-in user, I want my session to persist so that I don't have to log in repeatedly.

#### Acceptance Criteria

```gherkin
Feature: Session Management

  Scenario: Session persists across page refresh
    Given I am logged in
    When I refresh the browser
    Then I should remain logged in
    And I should stay on the same page

  Scenario: Session persists when opening new tab
    Given I am logged in
    When I open a new browser tab
    And I navigate to the application
    Then I should be logged in automatically

  Scenario: Session expires after inactivity
    Given I am logged in
    And the session timeout is set to 24 hours
    When I close the browser and return after 25 hours
    Then I should be redirected to the login page
    And I should see a message "Session expired, please log in again"

  Scenario: Session refreshes on activity
    Given I am logged in
    When I perform any action in the application
    Then my session expiry should be extended
```

#### Technical Notes
- Session duration: 24 hours
- Sliding window refresh on activity
- Secure, httpOnly, sameSite cookies

---

### Story 1.3: User Logout

**Story ID:** BDV2-US-1.3  
**Points:** 2  
**Priority:** P0  

> As a logged-in user, I want to log out so that I can secure my session when I'm done.

#### Acceptance Criteria

```gherkin
Feature: User Logout

  Scenario: Successful logout
    Given I am logged in
    When I click the "Sign Out" button in the navigation
    Then I should be redirected to the login page
    And my session cookie should be invalidated
    And I should see a "You have been signed out" message

  Scenario: Cannot access protected pages after logout
    Given I have just logged out
    When I try to navigate directly to "/projects"
    Then I should be redirected to the login page

  Scenario: Logout from any page
    Given I am logged in
    And I am on the transcript editor page
    When I click "Sign Out"
    Then I should be logged out successfully
```

#### Playwright Test Specs

```typescript
test.describe('User Logout', () => {
  test('should logout successfully', async ({ page }) => {
    // Login first
    await loginAs(page, 'aaron');
    
    // Click logout
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');
    
    // Verify redirect and message
    await expect(page).toHaveURL('/login');
    await expect(page.locator('[data-testid="logout-message"]')).toBeVisible();
  });

  test('should prevent access to protected routes after logout', async ({ page }) => {
    await loginAs(page, 'aaron');
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');
    
    // Try to access protected page directly
    await page.goto('/projects');
    await expect(page).toHaveURL('/login');
  });
});
```

---

### Story 1.4: Protected Route Redirect

**Story ID:** BDV2-US-1.4  
**Points:** 2  
**Priority:** P0  

> As an unauthenticated user, I want to be redirected to login when accessing protected pages so that I understand I need to authenticate.

#### Acceptance Criteria

```gherkin
Feature: Protected Route Redirect

  Scenario: Redirect to login when not authenticated
    Given I am not logged in
    When I navigate directly to "/projects"
    Then I should be redirected to "/login"
    And the original URL should be preserved as a "callbackUrl" parameter

  Scenario: Return to original page after login
    Given I navigated to "/project/abc123/editor" while not logged in
    And I was redirected to login
    When I successfully log in
    Then I should be redirected to "/project/abc123/editor"

  Scenario: Protected API returns 401
    Given I am not logged in
    When I make an API request to "/api/projects"
    Then I should receive a 401 Unauthorized response
```

---

### Story 1.5: Rate Limiting

**Story ID:** BDV2-US-1.5  
**Points:** 3  
**Priority:** P1  

> As the system, I want to rate limit login attempts so that brute force attacks are prevented.

#### Acceptance Criteria

```gherkin
Feature: Login Rate Limiting

  Scenario: Allow normal login attempts
    Given I am on the login page
    When I make 4 failed login attempts
    Then I should still be able to attempt login
    And I should see the normal error message

  Scenario: Block after too many failed attempts
    Given I am on the login page
    When I make 5 failed login attempts within 1 minute
    Then I should see an error "Too many login attempts. Please wait 1 minute."
    And the login button should be disabled
    And additional API requests should return 429

  Scenario: Reset after cooldown period
    Given I have been blocked due to too many attempts
    When I wait 1 minute
    Then I should be able to attempt login again
```

#### Technical Notes
- 5 attempts per minute per IP
- 1 minute cooldown after exceeding limit
- Use sliding window rate limiting

---

### Story 1.6: Change Password

**Story ID:** BDV2-US-1.6  
**Points:** 3  
**Priority:** P2  

> As a logged-in user, I want to change my password so that I can maintain security.

#### Acceptance Criteria

```gherkin
Feature: Change Password

  Scenario: Successfully change password
    Given I am logged in
    And I am on the settings page
    When I enter my current password
    And I enter a new password
    And I confirm the new password
    And I click "Change Password"
    Then I should see a success message
    And I should be able to log in with the new password

  Scenario: Reject when current password is wrong
    Given I am on the change password form
    When I enter an incorrect current password
    And I submit the form
    Then I should see an error "Current password is incorrect"

  Scenario: Reject when passwords don't match
    Given I am on the change password form
    When I enter different values for new password and confirmation
    And I submit the form
    Then I should see an error "Passwords do not match"

  Scenario: Reject weak passwords
    Given I am on the change password form
    When I enter a password shorter than 8 characters
    Then I should see a validation error about password strength
```

---

## Definition of Done

- [ ] All stories have passing unit tests
- [ ] All stories have passing integration tests
- [ ] All stories have passing E2E tests (Playwright)
- [ ] E2E screenshots captured at 3 viewports (desktop, tablet, mobile)
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] Accessibility tested (keyboard navigation, screen reader)
- [ ] Security review completed (password hashing, session management)

---

## Technical Dependencies

- NextAuth.js library
- Argon2 for password hashing
- SQLite database with users table
- Rate limiting middleware

## Estimated Total Points: 18
