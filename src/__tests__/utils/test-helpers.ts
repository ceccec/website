/**
 * Test Utilities and Helpers
 *
 * Common utilities for unit, integration, and E2E tests.
 */

/**
 * Create a mock error with specific properties
 */
export function createMockError(
  message: string,
  code?: string,
  statusCode?: number,
): Error & { code?: string; $metadata?: { httpStatusCode?: number } } {
  const error = new Error(message) as any
  if (code) error.code = code
  if (statusCode) {
    error.$metadata = { httpStatusCode: statusCode }
  }
  return error
}

/**
 * Wait for a condition to be true (for async tests)
 */
export async function waitFor(
  condition: () => boolean,
  options: { timeout?: number; interval?: number } = {},
): Promise<void> {
  const { timeout = 5000, interval = 50 } = options
  const startTime = Date.now()

  while (Date.now() - startTime < timeout) {
    if (condition()) {
      return
    }
    await new Promise((resolve) => setTimeout(resolve, interval))
  }

  throw new Error(
    `waitFor timeout: condition not met within ${timeout}ms`,
  )
}

/**
 * Create a mock Date that can be advanced in tests
 */
export class MockDate {
  private currentTime: number

  constructor(initialTime: number | Date = Date.now()) {
    this.currentTime = typeof initialTime === 'number' ? initialTime : initialTime.getTime()
  }

  advance(ms: number): void {
    this.currentTime += ms
  }

  now(): number {
    return this.currentTime
  }

  toDate(): Date {
    return new Date(this.currentTime)
  }
}

/**
 * Create test fixtures for common data types
 */
export const fixtures = {
  userId: () => `user_${Math.random().toString(36).substr(2, 9)}`,
  teamId: () => `team_${Math.random().toString(36).substr(2, 9)}`,
  projectId: () => `project_${Math.random().toString(36).substr(2, 9)}`,
  email: () => `test-${Math.random().toString(36).substr(2, 9)}@example.com`,
  filename: () => `test-${Math.random().toString(36).substr(2, 9)}.txt`,
}

/**
 * Capture console output during test execution
 */
export class ConsoleCapture {
  private logs: string[] = []
  private warns: string[] = []
  private errors: string[] = []
  private originalLog: typeof console.log
  private originalWarn: typeof console.warn
  private originalError: typeof console.error

  start(): void {
    this.logs = []
    this.warns = []
    this.errors = []

    this.originalLog = console.log
    this.originalWarn = console.warn
    this.originalError = console.error

    console.log = jest.fn((...args) => {
      this.logs.push(args.join(' '))
    }) as any

    console.warn = jest.fn((...args) => {
      this.warns.push(args.join(' '))
    }) as any

    console.error = jest.fn((...args) => {
      this.errors.push(args.join(' '))
    }) as any
  }

  stop(): void {
    console.log = this.originalLog
    console.warn = this.originalWarn
    console.error = this.originalError
  }

  getLogs(): string[] {
    return this.logs
  }

  getWarns(): string[] {
    return this.warns
  }

  getErrors(): string[] {
    return this.errors
  }

  clear(): void {
    this.logs = []
    this.warns = []
    this.errors = []
  }

  hasLog(pattern: string | RegExp): boolean {
    return this.logs.some((log) => this.matches(log, pattern))
  }

  hasWarn(pattern: string | RegExp): boolean {
    return this.warns.some((warn) => this.matches(warn, pattern))
  }

  hasError(pattern: string | RegExp): boolean {
    return this.errors.some((error) => this.matches(error, pattern))
  }

  private matches(text: string, pattern: string | RegExp): boolean {
    if (typeof pattern === 'string') {
      return text.includes(pattern)
    }
    return pattern.test(text)
  }
}

/**
 * Measure function execution time
 */
export async function measureTime<T>(
  fn: () => Promise<T>,
): Promise<{ result: T; duration: number }> {
  const start = performance.now()
  const result = await fn()
  const duration = performance.now() - start
  return { result, duration }
}

/**
 * Create a resolved promise that resolves after a delay
 */
export function delayedResolve<T>(value: T, ms: number = 10): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

/**
 * Create a rejected promise that rejects after a delay
 */
export function delayedReject(error: Error, ms: number = 10): Promise<never> {
  return new Promise((_, reject) => setTimeout(() => reject(error), ms))
}
