/**
 * Jest Setup File
 *
 * Runs before each test suite.
 * Configure global test utilities, mocks, and environment.
 */

// Suppress console output during tests unless explicitly checking for it
const originalWarn = console.warn
const originalError = console.error

global.console.warn = (...args) => {
  // Filter out known warnings
  if (
    args[0]?.includes?.('[Cache]') ||
    args[0]?.includes?.('[Storage]') ||
    args[0]?.includes?.('[Images]')
  ) {
    return // Suppress capability warnings in tests
  }
  originalWarn.call(console, ...args)
}

global.console.error = (...args) => {
  // Filter out known errors during initialization
  if (
    args[0]?.includes?.('Failed to initialize') ||
    args[0]?.includes?.('not available')
  ) {
    return
  }
  originalError.call(console, ...args)
}

// Mock environment variables
process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000'
process.env.PAYLOAD_SECRET = 'test-secret'

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}))

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock fetch globally if needed
if (typeof global.fetch === 'undefined') {
  global.fetch = jest.fn()
}

// Suppress specific node deprecation warnings
process.noDeprecation = true
