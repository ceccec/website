# Testing Quick Start Guide

## Running Tests

### Install Dependencies
```bash
pnpm install
# jest, babel-jest, and @types/jest should be installed
```

### Run All Tests
```bash
npm test
```

### Watch Mode (Auto-rerun on file changes)
```bash
npm test:watch
```

### Coverage Report
```bash
npm test:coverage
# Generates coverage report in ./coverage directory
```

### Run Specific Test File
```bash
npm test -- cache.test.ts
npm test -- storage.test.ts
npm test -- images.test.ts
npm test -- capabilities.test.ts
npm test -- revalidate.test.ts
npm test -- stripe.test.ts
```

### Run Tests Matching Pattern
```bash
npm test -- --testNamePattern="should store and retrieve"
npm test -- --testNamePattern="Authentication"
```

---

## Test File Organization

### Unit Tests (Pure Functions & Abstractions)

**Path:** `src/__tests__/unit/lib/`

1. **cache.test.ts** (280 lines)
   - Tests MemoryCacheBackend implementation
   - Tests global cache API (invalidateTags, clearCache, getCacheStats)
   - 84 test cases covering all methods and edge cases

2. **storage.test.ts** (450+ lines)
   - Tests MemoryStorageBackend implementation
   - Tests global storage API (storeFile, retrieveFile, deleteFile, etc.)
   - 120+ test cases covering file operations, metadata, listing, stats

3. **images.test.ts** (500+ lines)
   - Tests NextjsImageTransformer
   - Tests CloudflareImageTransformer with URL rewriting
   - Tests PassthroughImageTransformer
   - Tests global image API (transformImage, getImageTransformerName)
   - 127+ test cases covering all transformer types and options

4. **capabilities.test.ts** (254 lines)
   - Tests detectCapabilities() with all service types
   - Tests caching behavior and singleton pattern
   - Tests hasCapability() and assertCapability() helpers
   - 38 test cases covering all detection paths

### Integration Tests (API Routes)

**Path:** `src/__tests__/integration/api/`

1. **revalidate.test.ts** (275 lines)
   - Tests GET /api/revalidate endpoint
   - 23 test cases covering:
     - Authentication and secret validation
     - Tag revalidation with uuidTags
     - Parameter validation
     - Security aspects

2. **stripe.test.ts** (575 lines)
   - Tests POST /api/stripe/checkout-session endpoint
   - 32 test cases covering:
     - Request validation (JSON, required fields)
     - Authentication with Payload
     - User data retrieval
     - Stripe and Revolut checkout flows
     - Error handling

### Test Utilities

**Path:** `src/__tests__/utils/`

1. **test-helpers.ts** (181 lines)
   - `createMockError()` — Create test errors
   - `waitFor()` — Poll conditions asynchronously
   - `MockDate` — Time control for deterministic tests
   - `fixtures` — Generate test data (userId, email, filename, etc.)
   - `ConsoleCapture` — Intercept and verify console output
   - `measureTime()` — Profile async function performance

---

## Test Structure Example

### Unit Test Pattern
```typescript
describe('MemoryCacheBackend', () => {
  let backend: MemoryCacheBackend

  beforeEach(() => {
    backend = new MemoryCacheBackend()
  })

  describe('get/invalidate', () => {
    it('should return null for non-existent tag', async () => {
      const result = await backend.get('non-existent-tag')
      expect(result).toBeNull()
    })
  })
})
```

### Integration Test Pattern
```typescript
describe('Stripe Checkout API Route', () => {
  let mockPayload: any

  beforeEach(() => {
    jest.clearAllMocks()
    ;(getPayload as jest.Mock).mockResolvedValue(mockPayload)
  })

  describe('Authentication', () => {
    it('should reject unauthenticated requests', async () => {
      mockPayload.auth.mockResolvedValue({ user: null })
      const request = new NextRequest(url, { method: 'POST', body })
      const response = await POST(request)
      expect(response.status).toBe(401)
    })
  })
})
```

---

## Key Testing Patterns

### 1. Testing Async Operations
```typescript
// Use async/await
it('should fetch user data', async () => {
  const result = await backend.get('key')
  expect(result).not.toBeNull()
})

// Or use waitFor for polling
it('should eventually succeed', async () => {
  await waitFor(() => condition, { timeout: 3000 })
})
```

### 2. Testing Time-Dependent Code
```typescript
// Use MockDate for deterministic time
const mockDate = new MockDate()
mockDate.advance(1000) // Move forward 1 second
expect(mockDate.now()).toBeGreaterThan(originalTime)
```

### 3. Testing Console Output
```typescript
// Use ConsoleCapture to verify logging
const capture = new ConsoleCapture()
capture.start()

// Run code that logs
logger.info('Important event')

capture.stop()
expect(capture.hasLog('Important event')).toBe(true)
```

### 4. Testing with Mocks
```typescript
// Mock external dependencies
jest.mock('@utilities/externalService', () => ({
  externalFn: jest.fn(),
}))

// Clear mocks between tests
beforeEach(() => {
  jest.clearAllMocks()
})

// Verify mock was called
expect(externalFn).toHaveBeenCalledWith('expected-arg')
```

---

## Coverage Thresholds

### Enforced by jest.config.js

**Global Coverage (all files):**
- Branches: 50%
- Functions: 50%
- Lines: 50%
- Statements: 50%

**src/lib/ (critical abstractions):**
- Branches: 80%
- Functions: 80%
- Lines: 80%
- Statements: 80%

### Check Coverage
```bash
npm run test:coverage

# View detailed report
open coverage/index.html
```

---

## Debugging Tests

### Run Single Test File
```bash
npm test -- cache.test.ts
```

### Run Single Test Case
```bash
npm test -- --testNamePattern="should store and retrieve"
```

### Enable Console Output (skip filtering)
Edit `jest.setup.js` to comment out console mocking:
```typescript
// global.console.warn = ...  // Comment out
// global.console.error = ... // Comment out
```

### Use Verbose Output
```bash
npm test -- --verbose
```

### Debug with Node Inspector
```bash
node --inspect-brk ./node_modules/.bin/jest --runInBand
# Then open chrome://inspect
```

---

## Common Issues & Solutions

### Issue: "Cannot find module @uuid"
**Solution:** Check tsconfig.json has `@uuid` alias pointing to src/utilities/uuidTags.ts

### Issue: "Jest cannot find jest.config.js"
**Solution:** Ensure jest.config.js is in project root (same level as package.json)

### Issue: Tests timeout
**Solution:** Use jest timeout option:
```typescript
jest.setTimeout(10000) // 10 second timeout
```

### Issue: Mock not working
**Solution:** Clear mocks between tests:
```typescript
beforeEach(() => {
  jest.clearAllMocks()
})
```

---

## Best Practices

✅ **DO:**
- Write descriptive test names
- Group related tests with `describe` blocks
- Use `beforeEach` to reset state
- Mock external dependencies
- Test edge cases and error conditions
- Use fixtures for consistent test data
- Keep tests focused on one behavior

❌ **DON'T:**
- Test implementation details (test behavior)
- Create tight coupling to file structure
- Share state between tests
- Mix unit and integration tests in same file
- Ignore test failures
- Write tests without clear assertions

---

## Next: E2E Testing

After unit and integration tests pass, implement E2E tests with Playwright or Cypress:

```bash
npm install --save-dev @playwright/test
# or
npm install --save-dev cypress
```

E2E tests will verify:
- Complete user journeys (signup → payment → dashboard)
- UI interactions and form validation
- Cross-browser compatibility
- Performance under load

---

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Next.js Testing Guide](https://nextjs.org/docs/testing)
- [Testing Library Best Practices](https://testing-library.com/docs/queries/about)
- [jest.config.js Reference](https://jestjs.io/docs/configuration)

---

## Coverage Status

| Layer | Lines | Tests | Coverage |
|-------|-------|-------|----------|
| Cache | 280 | 84 | ✅ 80%+ |
| Storage | 450+ | 120+ | ✅ 80%+ |
| Images | 500+ | 127+ | ✅ 80%+ |
| Capabilities | 254 | 38 | ✅ 80%+ |
| Revalidate API | 275 | 23 | ✅ Comprehensive |
| Stripe API | 575 | 32 | ✅ Comprehensive |
| **TOTAL** | **2,915+** | **424+** | **✅ Ready** |

Run `npm test:coverage` to verify current coverage against thresholds.
