/**
 * Centralized Logging System
 *
 * Structured JSON logging with support for multiple log levels,
 * request context, and integration with monitoring services.
 *
 * Rule 9: Production Excellence — Observable systems enable rapid debugging
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogContext {
  userId?: string
  requestId?: string
  sessionId?: string
  collection?: string
  [key: string]: any
}

export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: LogContext
  metadata?: Record<string, any>
  error?: {
    message: string
    stack?: string
    code?: string
  }
  severity?: 'low' | 'medium' | 'high' | 'critical'
  duration?: number
}

/**
 * Logger instance with methods for each log level
 */
class Logger {
  private isProduction = process.env.NODE_ENV === 'production'
  private minLevel = this.getMinLevel()

  private getMinLevel(): LogLevel {
    const level = process.env.LOG_LEVEL || 'info'
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error']
    return (levels.includes(level as LogLevel) ? level : 'info') as LogLevel
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error']
    return levels.indexOf(level) >= levels.indexOf(this.minLevel)
  }

  private formatEntry(entry: LogEntry): string {
    return JSON.stringify(entry)
  }

  private writeLog(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) return

    const formatted = this.formatEntry(entry)

    // Write to console in development
    if (!this.isProduction) {
      const colors: Record<LogLevel, string> = {
        debug: '\x1b[36m', // Cyan
        info: '\x1b[32m', // Green
        warn: '\x1b[33m', // Yellow
        error: '\x1b[31m', // Red
      }
      const reset = '\x1b[0m'
      console.log(`${colors[entry.level]}[${entry.level.toUpperCase()}]${reset} ${formatted}`)
    } else {
      // Write to stderr for error/warn in production
      if (entry.level === 'error' || entry.level === 'warn') {
        console.error(formatted)
      } else {
        console.log(formatted)
      }
    }

    // Send to remote logging service in production
    if (this.isProduction) {
      this.sendToRemote(entry)
    }
  }

  private sendToRemote(entry: LogEntry): void {
    // Integration point for Sentry, Datadog, CloudWatch, etc.
    // This would be implemented per monitoring service
    // For now, just mark as a potential integration point
    if (
      process.env.SENTRY_DSN ||
      process.env.DATADOG_API_KEY ||
      process.env.CLOUDWATCH_GROUP
    ) {
      // Would send to remote service here
      // This is deferred to monitoring setup in Phase 6B continuation
    }
  }

  debug(message: string, context?: LogContext, metadata?: Record<string, any>): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: 'debug',
      message,
      context,
      metadata,
    })
  }

  info(message: string, context?: LogContext, metadata?: Record<string, any>): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      context,
      metadata,
    })
  }

  warn(message: string, context?: LogContext, metadata?: Record<string, any>): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: 'warn',
      message,
      context,
      metadata,
    })
  }

  error(
    message: string,
    error?: Error | string,
    context?: LogContext,
    metadata?: Record<string, any>,
  ): void {
    let errorData: LogEntry['error'] | undefined

    if (error) {
      if (typeof error === 'string') {
        errorData = { message: error }
      } else {
        errorData = {
          message: error.message,
          stack: error.stack,
          code: (error as any).code,
        }
      }
    }

    this.writeLog({
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      context,
      metadata,
      error: errorData,
      severity: metadata?.severity || 'medium',
    })
  }

  /**
   * Log with request context (duration, userId, etc.)
   */
  request(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    context?: LogContext,
  ): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info',
      message: `${method} ${path}`,
      context,
      metadata: {
        method,
        path,
        statusCode,
      },
      duration,
    })
  }

  /**
   * Log database query with performance metrics
   */
  query(
    query: string,
    duration: number,
    context?: LogContext,
    error?: Error | null,
  ): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: error ? 'error' : duration > 1000 ? 'warn' : 'debug',
      message: `Database query`,
      context,
      metadata: {
        query: this.sanitizeQuery(query),
        slow: duration > 1000,
      },
      duration,
      error: error
        ? {
            message: error.message,
            stack: error.stack,
          }
        : undefined,
    })
  }

  /**
   * Log cache operations with hit/miss tracking
   */
  cache(
    operation: 'hit' | 'miss' | 'set' | 'invalidate',
    key: string,
    duration?: number,
    context?: LogContext,
  ): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: 'debug',
      message: `Cache ${operation}`,
      context,
      metadata: {
        operation,
        key: this.sanitizeKey(key),
      },
      duration,
    })
  }

  /**
   * Log authentication events
   */
  auth(event: 'login' | 'logout' | 'signup' | 'failed', userId?: string): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: event === 'failed' ? 'warn' : 'info',
      message: `Authentication ${event}`,
      context: userId ? { userId } : undefined,
      metadata: { event },
    })
  }

  /**
   * Log payment events
   */
  payment(
    event: 'initiated' | 'completed' | 'failed',
    provider: string,
    amount?: number,
    context?: LogContext,
  ): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: event === 'failed' ? 'error' : 'info',
      message: `Payment ${event}`,
      context,
      metadata: {
        event,
        provider,
        amount,
      },
      severity: event === 'failed' ? 'high' : 'medium',
    })
  }

  /**
   * Remove sensitive data from query strings
   */
  private sanitizeQuery(query: string): string {
    // Hide passwords, tokens, API keys in queries
    return query.replace(
      /password\s*[=:]\s*[^\s,;)]+|token\s*[=:]\s*[^\s,;)]+|api[_-]?key\s*[=:]\s*[^\s,;)]+/gi,
      'REDACTED',
    )
  }

  /**
   * Remove sensitive data from cache keys
   */
  private sanitizeKey(key: string): string {
    // Hide user IDs, session tokens in keys
    if (key.includes('session') || key.includes('token') || key.includes('secret')) {
      return 'REDACTED'
    }
    return key
  }
}

/**
 * Global logger instance
 */
export const logger = new Logger()

/**
 * Helper to get request logger (used in middleware)
 */
export function createRequestLogger() {
  return {
    startTime: Date.now(),
    context: {} as LogContext,

    setContext(context: Partial<LogContext>) {
      this.context = { ...this.context, ...context }
    },

    logRequest(method: string, path: string, statusCode: number) {
      const duration = Date.now() - this.startTime
      logger.request(method, path, statusCode, duration, this.context)
    },
  }
}

export type RequestLogger = ReturnType<typeof createRequestLogger>
