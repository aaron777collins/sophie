# BDV2 Playwright E2E Tests

This directory contains comprehensive end-to-end tests for the Bible Drawing Video Pipeline V2 project.

## Test Structure

The tests are organized by Epic and cover all user stories defined in the BDV2 project:

### Test Files

- **`authentication.spec.ts`** - Tests for EPIC-01 Authentication System (BDV2-US-1.1 to BDV2-US-1.6)
- **`video-upload.spec.ts`** - Tests for EPIC-02 Video Upload & Management (BDV2-US-2.1 to BDV2-US-2.6) 
- **`video-processing.spec.ts`** - Tests for EPIC-03 Video Processing Pipeline (BDV2-US-3.1 to BDV2-US-3.7)
- **`transcript-editor.spec.ts`** - Tests for EPIC-04 Transcript Editor (BDV2-US-4.1 to BDV2-US-4.7)
- **`video-export.spec.ts`** - Tests for EPIC-08 Video Export & Publishing (BDV2-US-8.1 to BDV2-US-8.7)
- **`smoke-test.spec.ts`** - Critical path smoke tests covering complete user workflows

## Test Coverage

Each test file covers:

✅ **Functional Testing**
- User story acceptance criteria validation
- Component interactions and data flow
- Form validation and error handling
- API integration points

✅ **Multi-Viewport Testing**
- Desktop (1920x1080)
- Tablet (768x1024) 
- Mobile (375x667)

✅ **Accessibility Testing**
- Keyboard navigation
- ARIA attributes and roles
- Screen reader compatibility

✅ **Visual Regression Testing**
- Screenshots at all viewports
- UI component rendering validation

## Running Tests

### All E2E Tests
```bash
pnpm test:e2e
```

### Specific Epic Tests
```bash
pnpm test:e2e tests/e2e/bdv2/authentication.spec.ts
pnpm test:e2e tests/e2e/bdv2/video-upload.spec.ts
pnpm test:e2e tests/e2e/bdv2/transcript-editor.spec.ts
```

### Smoke Tests Only
```bash
pnpm test:e2e tests/e2e/bdv2/smoke-test.spec.ts
```

### With UI (for debugging)
```bash
pnpm test:e2e:ui
```

## Test Data

Tests use mock data and fixtures located in:
- `tests/fixtures/` - Sample files for upload testing
- Mock functions injected via `page.evaluate()` for simulating backend responses

## Screenshots

Visual validation screenshots are automatically generated at:
- `tests/screenshots/` - Multi-viewport screenshots for visual regression testing

## Test Strategy

### L1: Component Testing (Unit)
- Individual component functionality
- Props validation and rendering
- User interactions (click, type, etc.)

### L2: Integration Testing  
- Component interactions
- Form workflows
- State management

### L3: E2E Testing (This Directory)
- Complete user workflows
- Cross-component integration
- Backend API integration
- Multi-viewport compatibility

## Mock Strategy

Since BDV2 is in active development, tests use extensive mocking:

- **Authentication**: Mock login/logout flows with demo credentials
- **Video Upload**: Mock file upload progress and validation
- **Processing**: Mock FFmpeg operations and progress tracking
- **Transcription**: Mock Whisper API responses
- **Export**: Mock video rendering and file generation

As real backend services are implemented, mocks should be replaced with actual API calls.

## Continuous Integration

These tests are designed to run in CI/CD pipelines:

- **Headless mode**: Default for CI environments
- **Parallel execution**: Tests run concurrently where possible
- **Retry logic**: Automatic retry on flaky test failures
- **Failure artifacts**: Screenshots and videos captured on failure

## Development Workflow

1. **Write tests first** (TDD approach)
2. **Implement components** to satisfy test requirements
3. **Validate with E2E tests** before marking stories as complete
4. **Update tests** when requirements change

## Test-ID Convention

All interactive elements should have `data-testid` attributes following the pattern:
- `{component}-{element}-{action}` (e.g., `login-button`, `username-input`)
- `{feature}-{item}-{index}` (e.g., `transcript-segment-1`)
- `{state}-{indicator}` (e.g., `processing-status`, `upload-progress`)

## Maintenance

- **Update tests** when UI changes
- **Add new tests** for new features/stories
- **Remove obsolete tests** when features are deprecated
- **Keep mocks in sync** with actual API contracts

---

*Tests created: 2025-02-28*  
*Last updated: 2025-02-28*