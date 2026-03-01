# Verified Spec-Driven Development (VSDD) Methodology

**Created:** 2026-03-01
**Status:** MANDATORY for all projects

---

## Overview

VSDD combines spec-driven development with formal verification and modular, testable architecture. Every line of code traces back to a spec requirement through a full contract chain.

```
┌─────────────────────────────────────────────────────────────────────┐
│   VSDD PRINCIPLES (NON-NEGOTIABLE)                                  │
│                                                                     │
│   1. Spec-First: No code without a spec requirement                 │
│   2. Verification Architecture: Design to BE verifiable             │
│   3. Full Contract Chain: Traceability from spec to code            │
│   4. Adversarial Review: Harsh, fresh-context validation            │
│   5. Purity Boundaries: Pure core / effectful shell (DDD)           │
│   6. All Code Maps to Specs: Modular = testable = debuggable        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 1. Purity Boundary Map (DDD-Inspired)

**Design systems to BE verifiable from day 1.**

### Architecture Pattern

```
┌─────────────────────────────────────────────────────────────────────┐
│                        EFFECTFUL SHELL                              │
│  (I/O, API calls, database, localStorage, event handlers)           │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                       PURE CORE                                │  │
│  │  (Business logic, state reducers, transformations, validators) │  │
│  │  • Deterministic                                               │  │
│  │  • No side effects                                             │  │
│  │  • Easy to test                                                │  │
│  │  • Can be formally verified                                    │  │
│  └───────────────────────────────────────────────────────────────┘  │
│  Thin adapters connecting pure core to effectful operations         │
└─────────────────────────────────────────────────────────────────────┘
```

### For Frontend (React/Next.js)

| Layer | Type | Examples | Testing |
|-------|------|----------|---------|
| **Pure Core** | Pure functions | State reducers, validators, transformers, business logic | Unit tests, property tests |
| **Effectful Shell** | Side effects | API calls, localStorage, event handlers, navigation | Integration tests, mocks |
| **Adapters** | Thin wrappers | Custom hooks connecting pure logic to effects | Integration tests |

### Implementation Rules

1. **Business logic = Pure functions**
   ```typescript
   // ✅ PURE - Easy to test and verify
   function calculateDiscount(price: number, userTier: Tier): number {
     const rates = { bronze: 0, silver: 0.1, gold: 0.2 };
     return price * (1 - rates[userTier]);
   }
   
   // ❌ IMPURE - Side effects make testing hard
   function calculateAndSaveDiscount(price: number, userTier: Tier) {
     const discounted = price * (1 - rates[userTier]);
     localStorage.setItem('lastDiscount', discounted); // Side effect!
     return discounted;
   }
   ```

2. **State reducers = Pure**
   ```typescript
   // ✅ PURE - Deterministic state transformation
   function authReducer(state: AuthState, action: AuthAction): AuthState {
     switch (action.type) {
       case 'LOGIN_SUCCESS':
         return { ...state, user: action.payload, isAuthenticated: true };
       case 'LOGOUT':
         return { ...state, user: null, isAuthenticated: false };
       default:
         return state;
     }
   }
   ```

3. **Effects in shell only**
   ```typescript
   // Shell: handles the effect
   async function loginUser(credentials: Credentials) {
     const response = await api.post('/auth/login', credentials);
     dispatch({ type: 'LOGIN_SUCCESS', payload: response.data });
   }
   
   // Pure core: just transforms data
   function authReducer(state, action) { /* pure transformation */ }
   ```

### Purity Boundary Checklist

For every module, document:

```markdown
## Purity Boundary Map: {Module Name}

### Pure Core (MUST be deterministic, no side effects)
- [ ] `calculateX()` - Business logic
- [ ] `validateY()` - Validation rules
- [ ] `transformZ()` - Data transformation
- [ ] `reducer()` - State transitions

### Effectful Shell (Side effects allowed)
- [ ] API calls
- [ ] Database operations
- [ ] localStorage/sessionStorage
- [ ] Event handlers
- [ ] Navigation/routing

### Adapters (Thin wrappers connecting core to shell)
- [ ] `useAuthHook()` - Connects authReducer to API calls
- [ ] `useDataFetch()` - Connects transform to fetch
```

---

## 2. Full Contract Chain (Traceability)

**Every line of code traces back to a spec requirement.**

### The Chain

```
Spec Requirement
    ↓
Verification Property (what MUST be true)
    ↓
Bead (issue tracking)
    ↓
Test (TDD - proves property)
    ↓
Code (implements behavior)
    ↓
Review (adversarial verification)
    ↓
Proof (tests pass, validation complete)
```

### Implementation

**1. Spec Requirements** (`scheduler/stories/{project}/`)
```markdown
# US-AUTH-01: User Login

**As a** user
**I need to** log in with email and password
**So that** I can access my account

## Acceptance Criteria
- AC-1: Valid credentials → logged in
- AC-2: Invalid credentials → error message
- AC-3: Session persists across page refresh
```

**2. Verification Properties** (`scheduler/stories/{project}/properties/`)
```markdown
# Verification Properties: US-AUTH-01

## VP-AUTH-01-1: Login Determinism
**Property:** Given same credentials, login always produces same result
**Testable:** Unit test with mocked API
**Coverage:** AC-1, AC-2

## VP-AUTH-01-2: Session Persistence
**Property:** After login, session survives page refresh
**Testable:** E2E test with page reload
**Coverage:** AC-3
```

**3. Beads** (issue tracking)
```bash
bd create "US-AUTH-01.1: Implement login form" -t task \
  --description "VP: VP-AUTH-01-1, VP-AUTH-01-2" \
  --deps discovered-from:US-AUTH-01
```

**4. Tests** (TDD)
```typescript
// tests/auth.test.ts
// Traces to: VP-AUTH-01-1

describe('authReducer (PURE)', () => {
  it('LOGIN_SUCCESS sets user and isAuthenticated', () => {
    const state = authReducer(initialState, { type: 'LOGIN_SUCCESS', payload: user });
    expect(state.user).toEqual(user);
    expect(state.isAuthenticated).toBe(true);
  });
});

// tests/e2e/auth.spec.ts
// Traces to: VP-AUTH-01-2

test('session persists across page refresh', async ({ page }) => {
  await loginAs(page, testUser);
  await page.reload();
  await expect(page.getByText('Welcome')).toBeVisible();
});
```

**5. Code** (implementation)
```typescript
// lib/auth/reducer.ts
// Implements: VP-AUTH-01-1
// Bead: bd-123

export function authReducer(state: AuthState, action: AuthAction): AuthState {
  // PURE - no side effects
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return { ...state, user: action.payload, isAuthenticated: true };
    // ...
  }
}
```

**6. Review** (adversarial)
- Validator reviews with fresh context
- Harsh, zero-tolerance stance
- Must trace code back to specs

**7. Proof**
- All tests pass (unit + E2E)
- Validator approves
- Bead closed with evidence

### Traceability Comments (MANDATORY)

Every significant code block must have traceability:

```typescript
/**
 * @spec US-AUTH-01
 * @property VP-AUTH-01-1
 * @bead bd-123
 * @tests auth.test.ts:15-30
 */
function authReducer(state, action) {
  // implementation
}
```

---

## 3. Verification Tools

**Use formal verification for critical paths.**

### When to Use Formal Verification

| Use Case | Tool | Example |
|----------|------|---------|
| **Authentication logic** | Property-based testing | Login, session, permissions |
| **Financial calculations** | Mutation testing | Pricing, discounts, payments |
| **State machines** | State transition tests | Auth states, workflow states |
| **Data validation** | Schema validation | Input validation, API contracts |
| **Critical business logic** | Property tests | Core domain rules |

### Available Tools

| Tool | Purpose | When to Use |
|------|---------|-------------|
| **fast-check** | Property-based testing (JS/TS) | Test pure functions with random inputs |
| **Zod/Yup** | Runtime schema validation | Validate data at boundaries |
| **TypeScript strict** | Static type checking | Always enabled |
| **Stryker** | Mutation testing | Verify tests catch bugs |
| **Playwright** | E2E testing | User flow verification |

### Property-Based Testing Example

```typescript
import fc from 'fast-check';

describe('calculateDiscount (PURE)', () => {
  // Property: discount is always less than or equal to original price
  it('never increases price', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10000 }),
        fc.constantFrom('bronze', 'silver', 'gold'),
        (price, tier) => {
          const discounted = calculateDiscount(price, tier);
          return discounted <= price;
        }
      )
    );
  });
  
  // Property: same inputs always produce same output (determinism)
  it('is deterministic', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10000 }),
        fc.constantFrom('bronze', 'silver', 'gold'),
        (price, tier) => {
          const result1 = calculateDiscount(price, tier);
          const result2 = calculateDiscount(price, tier);
          return result1 === result2;
        }
      )
    );
  });
});
```

### Mutation Testing

```bash
# Install Stryker
npm install --save-dev @stryker-mutator/core @stryker-mutator/jest-runner

# Run mutation tests on critical files
npx stryker run --files "lib/auth/**/*.ts,lib/pricing/**/*.ts"

# Target: 80%+ mutation score for critical paths
```

---

## 4. The Red Gate (TDD Enforcement)

**All tests must fail before any implementation begins.**

```
┌─────────────────────────────────────────────────────────────────────┐
│   THE RED GATE (MANDATORY)                                          │
│                                                                     │
│   1. Write ALL tests first                                          │
│   2. Run tests - they MUST ALL FAIL                                 │
│   3. Screenshot/log the failing tests                               │
│   4. ONLY THEN start implementing                                   │
│   5. If a test passes without implementation - THE TEST IS SUSPECT  │
│                                                                     │
│   "If a test passes without code, it's testing nothing."            │
└─────────────────────────────────────────────────────────────────────┘
```

### Red Gate Evidence

Workers must provide:

```markdown
## Red Gate Evidence

### Tests Written (Before Implementation)
- `auth.test.ts` - 5 tests
- `auth.spec.ts` - 3 E2E tests

### Red Phase Output
```
$ pnpm test
FAIL auth.test.ts
  ✕ LOGIN_SUCCESS sets user (expected function not defined)
  ✕ LOGOUT clears session (expected function not defined)
  ✕ Invalid credentials return error (expected function not defined)
  
Tests: 0 passed, 5 failed
```

### Timestamp
Red phase completed: 2026-03-01 10:00 EST
Implementation started: 2026-03-01 10:05 EST
```

---

## 5. Convergence Criteria

**Four dimensions must converge for completion.**

| Dimension | Question | Evidence |
|-----------|----------|----------|
| **Spec** | Does the code match the spec? | Traceability comments, AC validation |
| **Test** | Do tests prove the spec? | Test coverage, property tests |
| **Implementation** | Does the code work? | Build passes, no runtime errors |
| **Verification** | Is it independently verified? | Validator approval, E2E pass |

```
    Spec ←──────────────→ Test
      ↑                    ↑
      │   CONVERGENCE      │
      ↓        ✓           ↓
Implementation ←────→ Verification
```

**All four must agree. Any divergence = not complete.**

---

## 6. Modular = Testable = Debuggable

**All code should map to specs. Modular code is testable code.**

### Module Structure

```
feature/
├── types.ts          # Type definitions (pure)
├── reducer.ts        # State logic (pure)
├── validators.ts     # Validation logic (pure)
├── transformers.ts   # Data transformation (pure)
├── api.ts            # API calls (effectful)
├── hooks.ts          # React hooks (adapters)
└── __tests__/
    ├── reducer.test.ts       # Unit tests for pure
    ├── validators.test.ts    # Unit tests for pure
    └── feature.spec.ts       # E2E tests
```

### Testing by Layer

| Layer | Test Type | Tool | Coverage Target |
|-------|-----------|------|-----------------|
| **Pure Core** | Unit + Property | Jest + fast-check | 90%+ |
| **Adapters** | Integration | Jest + React Testing Library | 80%+ |
| **Effectful Shell** | E2E | Playwright | All user flows |

### Debugging Benefits

When something breaks:
1. **Check pure core first** - Unit tests isolate logic issues
2. **Check adapters** - Integration tests find connection issues
3. **Check E2E** - Validates full user flow

**Modular boundaries = clear fault isolation = fast debugging**

---

## Checklist: VSDD Compliance

### Project Setup
- [ ] Purity Boundary Map documented
- [ ] Verification Properties defined for all specs
- [ ] Traceability structure established
- [ ] Testing tools configured (Jest, Playwright, fast-check)

### Per Feature
- [ ] Pure core identified and isolated
- [ ] Effectful shell separated
- [ ] Verification properties written
- [ ] Tests written FIRST (Red Gate)
- [ ] Traceability comments added
- [ ] Property-based tests for critical logic
- [ ] E2E tests for user flows

### Per Task
- [ ] Bead created with spec reference
- [ ] Red Gate evidence provided
- [ ] All four convergence criteria met
- [ ] Adversarial review passed

---

*This methodology is MANDATORY for all projects effective 2026-03-01.*
