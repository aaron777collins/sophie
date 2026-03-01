# PROACTIVE-JOBS.md

## Authentication Epic (18 points)
* **Description:** Implement secure authentication system with NextAuth.js credentials provider. Includes user login, session management, logout, protected routes, rate limiting, and password change.
* **Acceptance Criteria:** 
  - All user authentication flows work as expected
  - Session management handles login, logout, and expiration correctly
  - Protected routes restrict access to authorized users
  - Rate limiting prevents brute force attacks 
  - Password change functionality is secure and effective
* **Testing Requirements:**
  - Unit tests for all authentication components
  - Integration tests for end-to-end flows
  - E2E tests covering all user authentication scenarios
  - Playwright screenshots for key screens at desktop, tablet, and mobile sizes
  - Test evidence stored in scheduler/validation/authentication-epic/
* **Deliverables:**
  - Implemented authentication system per acceptance criteria
  - Comprehensive test suite with passing results
  - Validation screenshots and reports
* **Dependencies:** None (this is the initial authentication work)
* **Estimated Complexity:** 18 points
* **Assigned To:** Person Manager