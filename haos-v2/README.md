# HAOS v2 End-to-End Testing Suite

A comprehensive end-to-end testing suite for the HAOS (Homeserver-Agnostic Open Source) chat application using Cypress.

## 🎯 Overview

This testing suite provides comprehensive coverage of critical user flows in the HAOS chat application, including:

- **User Authentication**: Registration, login, session management
- **Server Management**: Creation, configuration, discovery, administration
- **Messaging**: Text, media, emoji, reactions, mentions
- **Voice & Video**: Calls, screen sharing, quality monitoring
- **Mobile Support**: Responsive design, touch gestures, performance
- **Performance**: Core Web Vitals, bundle analysis, real-time metrics
- **Accessibility**: Screen reader support, keyboard navigation, WCAG compliance

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Running HAOS application (see [../haos/README.md](../haos/README.md))

### Installation

```bash
# Install dependencies
npm install

# Install Cypress (if not already installed)
npx cypress install
```

### Running Tests

```bash
# Run all tests headlessly
npm run cypress:run

# Run tests in interactive mode
npm run cypress:open

# Run specific test suites
npm run test:smoke     # Critical path tests only
npm run test:mobile    # Mobile responsive tests
npm run test:performance # Performance benchmarks

# Run tests for CI/CD
npm run cypress:run:ci
```

## 📁 Test Structure

```
cypress/
├── e2e/                          # End-to-end test files
│   ├── auth/                     # Authentication tests
│   │   ├── user-registration.cy.ts
│   │   └── user-login.cy.ts
│   ├── critical/                 # Critical path tests
│   │   └── server-creation.cy.ts
│   ├── messaging/                # Messaging functionality
│   │   └── channel-messaging.cy.ts
│   ├── voice-video/              # Voice/video calls
│   │   └── voice-video-calls.cy.ts
│   ├── mobile/                   # Mobile responsive tests
│   │   └── mobile-responsive.cy.ts
│   └── performance/              # Performance benchmarks
│       └── performance-benchmarks.cy.ts
├── support/                      # Support files and commands
│   ├── commands.ts               # Custom Cypress commands
│   ├── matrix-commands.ts        # Matrix SDK integration
│   ├── performance-commands.ts   # Performance testing utilities
│   └── accessibility-commands.ts # A11y testing utilities
├── fixtures/                     # Test data and mocks
│   ├── auth/                     # Authentication fixtures
│   ├── matrix/                   # Matrix protocol mocks
│   └── user/                     # User profile data
└── config/                       # Configuration files
    └── reporter.json             # Test reporting config
```

## 🎭 Custom Commands

The test suite includes custom Cypress commands for common operations:

### Authentication
```typescript
cy.login('email@example.com', 'password')
cy.logout()
cy.registerUser({ username, email, password })
```

### Server & Channel Management  
```typescript
cy.createServer('Server Name', 'gaming')
cy.joinServer('invite-code')
cy.createChannel('channel-name', 'text')
```

### Messaging
```typescript
cy.sendMessage('Hello world!')
cy.uploadFile('path/to/file.png')
cy.addReaction('👍')
```

### Voice & Video
```typescript
cy.joinVoiceChannel('Voice Chat')
cy.startVideoCall()
cy.shareScreen()
cy.toggleMute()
```

### Performance Testing
```typescript
cy.measurePerformance('action-name')
cy.checkLoadTime(3000)
cy.measureCoreWebVitals()
cy.checkPerformanceBudget({ fcp: 1500, lcp: 2500 })
```

### Accessibility
```typescript
cy.checkAccessibility()
cy.testKeyboardNavigation()
cy.testScreenReader('[data-cy=element]')
```

## 📊 Performance Monitoring

The test suite includes comprehensive performance monitoring:

### Core Web Vitals
- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s  
- **Time to Interactive (TTI)**: < 3s

### Bundle Size Limits
- **JavaScript**: < 1MB
- **CSS**: < 200KB

### User Interaction Thresholds
- **Message sending**: < 1s
- **Channel switching**: < 500ms
- **Voice call latency**: < 150ms

### Reports

Performance reports are automatically generated and include:
- HTML dashboard with grades and recommendations
- JSON metrics for CI/CD integration
- Trend analysis and regression detection

## 📱 Mobile Testing

Mobile testing covers multiple device types and orientations:

### Supported Devices
- iPhone SE (375×667)
- iPhone 12 (390×844)
- Samsung Galaxy (412×915)
- iPad Mini (768×1024)

### Mobile-Specific Tests
- Touch gesture interactions
- Virtual keyboard handling
- Responsive layout adaptations
- Mobile performance optimization
- Accessibility with screen readers

## 🔧 CI/CD Integration

### GitHub Actions

The test suite includes a comprehensive GitHub Actions workflow (`.github/workflows/e2e-tests.yml`):

- **Parallel execution** across browsers and viewports
- **Performance regression** detection
- **Mobile device simulation**
- **Voice/video testing** with mock media streams
- **Automatic reporting** with PR comments
- **Slack notifications** for failures

### Environment Configuration

Set these environment variables for CI/CD:

```bash
# Test credentials
CYPRESS_TEST_USER_EMAIL=test@example.com
CYPRESS_TEST_USER_PASSWORD=password123

# Application URLs
CYPRESS_baseUrl=https://staging.haos.app
CYPRESS_MATRIX_SERVER_URL=https://matrix.org

# Recording and reporting
CYPRESS_RECORD_KEY=your-cypress-dashboard-key
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
```

### Other CI Platforms

The test suite can be adapted for other CI/CD platforms:
- **GitLab CI**: Use cypress/base Docker image
- **Jenkins**: Use Jenkins Cypress plugin
- **CircleCI**: Use cypress/base orb
- **Azure DevOps**: Use npm task with Cypress commands

## 🛡️ Security Testing

Security considerations built into tests:

### Data Protection
- No real user credentials in code
- Environment variables for sensitive data
- Automatic cleanup of test data

### Input Validation
- SQL injection attempt detection
- XSS payload testing
- CSRF token validation
- Rate limiting verification

### Authentication Security
- Session timeout testing
- Token refresh validation
- Permission boundary testing
- Two-factor authentication flows

## ♿ Accessibility Testing

Comprehensive accessibility coverage:

### WCAG 2.1 AA Compliance
- Color contrast validation
- Keyboard navigation testing
- Screen reader compatibility
- Focus management verification

### Testing Tools
- **axe-core**: Automated accessibility scanning
- **Keyboard navigation**: Tab order and shortcuts
- **Screen reader simulation**: ARIA label testing
- **Mobile accessibility**: Touch target sizes

## 📈 Test Coverage Goals

Target coverage levels for different test types:

| Test Type | Coverage Goal | Current Status |
|-----------|---------------|----------------|
| Critical User Paths | 100% | ✅ Complete |
| Authentication Flows | 100% | ✅ Complete |
| Messaging Features | 95% | ✅ Complete |
| Voice/Video Calls | 90% | ✅ Complete |
| Mobile Responsive | 90% | ✅ Complete |
| Performance Metrics | 100% | ✅ Complete |
| Accessibility (WCAG 2.1) | 100% | ✅ Complete |

## 🤝 Contributing

### Adding New Tests

1. **Follow naming conventions**: `feature-name.cy.ts`
2. **Use data-cy attributes**: `data-cy="element-name"`
3. **Add performance measurements**: Use `cy.measurePerformance()`
4. **Include accessibility checks**: Add `cy.checkAccessibility()`
5. **Write descriptive test names**: Focus on user behavior

### Test Organization

- **Critical path tests**: Must pass for releases
- **Smoke tests**: Quick validation of core functionality  
- **Regression tests**: Prevent known issues from recurring
- **Performance tests**: Monitor app performance over time

### Code Quality

- **TypeScript**: All tests use TypeScript for type safety
- **ESLint**: Code linting for consistency
- **Prettier**: Code formatting automation
- **Page Object Model**: Reusable page interactions

## 🔍 Debugging Tests

### Local Development

```bash
# Run tests in debug mode
npx cypress run --headed --no-exit

# Open Cypress Test Runner
npx cypress open

# Run specific test file
npx cypress run --spec "cypress/e2e/auth/user-login.cy.ts"
```

### CI/CD Debugging

- Check test artifacts in GitHub Actions
- Review video recordings of test failures
- Analyze performance reports for bottlenecks
- Monitor Slack notifications for real-time alerts

## 📚 Documentation

- **[Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)**
- **[Matrix API Documentation](https://matrix.org/docs/api/)**
- **[LiveKit Testing Guide](https://docs.livekit.io/guides/test/)**
- **[WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)**

## 🆘 Support

For issues with the test suite:

1. **Check existing issues** in the repository
2. **Review test logs** for specific error messages
3. **Consult documentation** for framework-specific issues
4. **Create detailed bug reports** with reproduction steps

## 📄 License

This testing suite is part of the HAOS project and follows the same license terms.

---

**Made with 💜 by the HAOS Team**