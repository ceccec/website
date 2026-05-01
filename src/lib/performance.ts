/**
 * Performance Monitoring & Optimization
 *
 * Tracks:
 * - API response times
 * - Database query performance
 * - Cache effectiveness
 * - Memory usage
 * - Third-party service latency
 *
 * Rule 9: Production Excellence — Performance is a feature
 */

import { metrics } from '@root/lib/metrics'

/**
 * Performance benchmarks and thresholds
 */
export const PERFORMANCE_TARGETS = {
  api: {
    p50: 50, // 50ms at p50
    p95: 200, // 200ms at p95
    p99: 500, // 500ms at p99
  },
  database: {
    p50: 10, // 10ms at p50
    p95: 50, // 50ms at p95
    p99: 100, // 100ms at p99
  },
  cache: {
    hitRate: 0.8, // 80% hit rate target
    p95: 5, // 5ms at p95
  },
  memory: {
    maxHeap: 512 * 1024 * 1024, // 512MB
    warningThreshold: 0.8, // Warn at 80%
  },
}

/**
 * Performance profiler for tracking operations
 */
export class PerformanceProfiler {
  private startTime: number
  private marks: Map<string, number> = new Map()
  private measures: Map<string, number[]> = new Map()

  constructor() {
    this.startTime = performance.now()
  }

  /**
   * Mark a point in time
   */
  mark(label: string): void {
    this.marks.set(label, performance.now())
  }

  /**
   * Measure elapsed time between marks
   */
  measure(label: string, startMark: string, endMark?: string): number {
    const start = this.marks.get(startMark)
    const end = endMark ? this.marks.get(endMark) : performance.now()

    if (!start) {
      throw new Error(`Mark "${startMark}" not found`)
    }

    const duration = (end || performance.now()) - start
    const measurements = this.measures.get(label) || []
    measurements.push(duration)
    this.measures.set(label, measurements)

    return duration
  }

  /**
   * Get all measurements
   */
  getAll(): Record<string, { count: number; total: number; avg: number }> {
    const result: Record<string, { count: number; total: number; avg: number }> = {}

    for (const [label, values] of this.measures) {
      const total = values.reduce((a, b) => a + b, 0)
      result[label] = {
        count: values.length,
        total,
        avg: total / values.length,
      }
    }

    return result
  }

  /**
   * Get elapsed time since profiler started
   */
  elapsed(): number {
    return performance.now() - this.startTime
  }
}

/**
 * Measure function execution time
 */
export async function measurePerformance<T>(
  name: string,
  fn: () => Promise<T>,
): Promise<{ result: T; duration: number }> {
  const start = performance.now()
  try {
    const result = await fn()
    const duration = performance.now() - start
    metrics.recordHistogram('function_duration_ms', duration, { function: name })
    return { result, duration }
  } catch (error) {
    const duration = performance.now() - start
    metrics.recordHistogram('function_duration_ms', duration, { function: name, error: 'true' })
    throw error
  }
}

/**
 * Measure synchronous function execution
 */
export function measureSync<T>(name: string, fn: () => T): { result: T; duration: number } {
  const start = performance.now()
  try {
    const result = fn()
    const duration = performance.now() - start
    metrics.recordHistogram('function_duration_ms', duration, { function: name })
    return { result, duration }
  } catch (error) {
    const duration = performance.now() - start
    metrics.recordHistogram('function_duration_ms', duration, { function: name, error: 'true' })
    throw error
  }
}

/**
 * API response time analyzer
 */
export class APIPerformanceAnalyzer {
  private durations: Map<string, number[]> = new Map()

  /**
   * Record API request duration
   */
  recordDuration(path: string, method: string, duration: number, statusCode: number): void {
    const key = `${method} ${path}`
    const values = this.durations.get(key) || []
    values.push(duration)
    this.durations.set(key, values)

    // Check if exceeds targets
    const target = PERFORMANCE_TARGETS.api
    if (duration > target.p99) {
      console.warn(`[PERF] ${key} took ${duration}ms (exceeds p99 target of ${target.p99}ms)`)
    }
  }

  /**
   * Get performance report for endpoint
   */
  getReport(path: string, method: string) {
    const key = `${method} ${path}`
    const values = this.durations.get(key) || []

    if (values.length === 0) {
      return null
    }

    const sorted = [...values].sort((a, b) => a - b)
    const sum = values.reduce((a, b) => a + b, 0)

    return {
      endpoint: key,
      requests: values.length,
      avgTime: sum / values.length,
      minTime: sorted[0],
      maxTime: sorted[sorted.length - 1],
      p50: sorted[Math.floor(values.length * 0.5)],
      p95: sorted[Math.floor(values.length * 0.95)],
      p99: sorted[Math.floor(values.length * 0.99)],
      meetsTargets: {
        p95: sorted[Math.floor(values.length * 0.95)] <= PERFORMANCE_TARGETS.api.p95,
        p99: sorted[Math.floor(values.length * 0.99)] <= PERFORMANCE_TARGETS.api.p99,
      },
    }
  }

  /**
   * Get all endpoint reports
   */
  getAllReports() {
    const reports = []
    for (const [key] of this.durations) {
      const [method, ...pathParts] = key.split(' ')
      const path = pathParts.join(' ')
      const report = this.getReport(path, method)
      if (report) {
        reports.push(report)
      }
    }
    return reports
  }
}

/**
 * Database query performance analyzer
 */
export class DatabasePerformanceAnalyzer {
  private queryDurations: Map<string, number[]> = new Map()
  private collectionDurations: Map<string, number[]> = new Map()

  /**
   * Record query duration
   */
  recordQuery(queryType: string, collection: string, duration: number): void {
    // By query type
    const queryValues = this.queryDurations.get(queryType) || []
    queryValues.push(duration)
    this.queryDurations.set(queryType, queryValues)

    // By collection
    const collectionValues = this.collectionDurations.get(collection) || []
    collectionValues.push(duration)
    this.collectionDurations.set(collection, collectionValues)

    // Check if exceeds targets
    const target = PERFORMANCE_TARGETS.database
    if (duration > target.p99) {
      console.warn(
        `[PERF] ${queryType} on ${collection} took ${duration}ms (exceeds p99 target of ${target.p99}ms)`,
      )
    }
  }

  /**
   * Get slowest queries
   */
  getSlowestQueries(limit = 10) {
    const queries: Array<{
      type: string
      avgTime: number
      maxTime: number
      count: number
    }> = []

    for (const [type, values] of this.queryDurations) {
      const sum = values.reduce((a, b) => a + b, 0)
      queries.push({
        type,
        avgTime: sum / values.length,
        maxTime: Math.max(...values),
        count: values.length,
      })
    }

    return queries.sort((a, b) => b.avgTime - a.avgTime).slice(0, limit)
  }

  /**
   * Get collection performance report
   */
  getCollectionReport(collection: string) {
    const values = this.collectionDurations.get(collection) || []

    if (values.length === 0) {
      return null
    }

    const sorted = [...values].sort((a, b) => a - b)
    const sum = values.reduce((a, b) => a + b, 0)

    return {
      collection,
      queries: values.length,
      avgTime: sum / values.length,
      minTime: sorted[0],
      maxTime: sorted[sorted.length - 1],
      p95: sorted[Math.floor(values.length * 0.95)],
      p99: sorted[Math.floor(values.length * 0.99)],
    }
  }

  /**
   * Get all collection reports
   */
  getAllCollectionReports() {
    const reports = []
    for (const [collection] of this.collectionDurations) {
      const report = this.getCollectionReport(collection)
      if (report) {
        reports.push(report)
      }
    }
    return reports.sort((a, b) => b.avgTime - a.avgTime)
  }
}

/**
 * Cache performance analyzer
 */
export class CachePerformanceAnalyzer {
  private hits = 0
  private misses = 0
  private hitDurations: number[] = []

  /**
   * Record cache hit
   */
  recordHit(duration: number): void {
    this.hits++
    this.hitDurations.push(duration)
  }

  /**
   * Record cache miss
   */
  recordMiss(): void {
    this.misses++
  }

  /**
   * Get cache performance report
   */
  getReport() {
    const total = this.hits + this.misses
    const hitRate = total === 0 ? 0 : this.hits / total

    let hitStats = null
    if (this.hitDurations.length > 0) {
      const sorted = [...this.hitDurations].sort((a, b) => a - b)
      const sum = this.hitDurations.reduce((a, b) => a + b, 0)

      hitStats = {
        avgTime: sum / this.hitDurations.length,
        minTime: sorted[0],
        maxTime: sorted[sorted.length - 1],
        p95: sorted[Math.floor(this.hitDurations.length * 0.95)],
      }
    }

    return {
      hits: this.hits,
      misses: this.misses,
      total,
      hitRate: (hitRate * 100).toFixed(2) + '%',
      meetsTarget: hitRate >= PERFORMANCE_TARGETS.cache.hitRate,
      hitDuration: hitStats,
    }
  }
}

/**
 * Memory usage monitor
 */
export class MemoryMonitor {
  /**
   * Get current memory usage
   */
  static getUsage() {
    if (typeof process === 'undefined' || !process.memoryUsage) {
      return null
    }

    const usage = process.memoryUsage()

    return {
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      external: usage.external,
      rss: usage.rss,
      heapUsedPercent: (usage.heapUsed / usage.heapTotal) * 100,
      meetsTarget: usage.heapUsed <= PERFORMANCE_TARGETS.memory.maxHeap,
      warning:
        usage.heapUsed / usage.heapTotal > PERFORMANCE_TARGETS.memory.warningThreshold,
    }
  }

  /**
   * Monitor memory over time
   */
  static monitorMemory(intervalMs = 60000): NodeJS.Timer | null {
    if (typeof process === 'undefined' || !process.memoryUsage) {
      return null
    }

    return setInterval(() => {
      const usage = this.getUsage()
      if (usage?.warning) {
        console.warn(`[PERF] High memory usage: ${(usage.heapUsedPercent).toFixed(1)}%`)
      }
    }, intervalMs)
  }
}

/**
 * Performance report generator
 */
export function generatePerformanceReport() {
  return {
    timestamp: new Date().toISOString(),
    targets: PERFORMANCE_TARGETS,
    memory: MemoryMonitor.getUsage(),
    metrics: metrics ? metrics.getAllMetrics() : null,
    note: 'Use analyzers (APIPerformanceAnalyzer, DatabasePerformanceAnalyzer, etc.) for detailed insights',
  }
}
