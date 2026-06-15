/**
 * Metrics Collection System
 *
 * Tracks performance metrics for:
 * - API response times
 * - Database query performance
 * - Cache hit/miss rates
 * - Error rates
 * - Custom business metrics
 *
 * Rule 9: Production Excellence — What gets measured gets optimized
 */

export interface MetricLabel {
  [key: string]: string | number
}

export interface MetricValue {
  timestamp: number
  value: number
  labels?: MetricLabel
}

/**
 * In-memory metric storage
 * In production, would send to Prometheus, Datadog, etc.
 */
class MetricsCollector {
  private counters = new Map<string, number>()
  private histograms = new Map<string, MetricValue[]>()
  private gauges = new Map<string, number>()
  private historySize = 1000 // Keep last 1000 values per metric

  /**
   * Increment counter
   */
  incrementCounter(name: string, value = 1, labels?: MetricLabel): void {
    const key = this.getLabeledKey(name, labels)
    const current = this.counters.get(key) || 0
    this.counters.set(key, current + value)
  }

  /**
   * Record histogram value (for distributions like response time)
   */
  recordHistogram(name: string, value: number, labels?: MetricLabel): void {
    const key = this.getLabeledKey(name, labels)
    const values = this.histograms.get(key) || []

    values.push({
      timestamp: Date.now(),
      value,
      labels,
    })

    // Keep only recent values
    if (values.length > this.historySize) {
      values.shift()
    }

    this.histograms.set(key, values)
  }

  /**
   * Set gauge value (for point-in-time measurements like CPU usage)
   */
  setGauge(name: string, value: number, labels?: MetricLabel): void {
    const key = this.getLabeledKey(name, labels)
    this.gauges.set(key, value)
  }

  /**
   * Get counter value
   */
  getCounter(name: string, labels?: MetricLabel): number {
    const key = this.getLabeledKey(name, labels)
    return this.counters.get(key) || 0
  }

  /**
   * Get histogram statistics (mean, min, max, p95, p99)
   */
  getHistogramStats(
    name: string,
    labels?: MetricLabel,
  ): {
    count: number
    mean: number
    min: number
    max: number
    p50: number
    p95: number
    p99: number
  } | null {
    const key = this.getLabeledKey(name, labels)
    const values = this.histograms.get(key)

    if (!values || values.length === 0) {
      return null
    }

    const nums = values.map((v) => v.value).sort((a, b) => a - b)
    const sum = nums.reduce((a, b) => a + b, 0)

    return {
      count: nums.length,
      mean: sum / nums.length,
      min: nums[0],
      max: nums[nums.length - 1],
      p50: nums[Math.floor(nums.length * 0.5)],
      p95: nums[Math.floor(nums.length * 0.95)],
      p99: nums[Math.floor(nums.length * 0.99)],
    }
  }

  /**
   * Get gauge value
   */
  getGauge(name: string, labels?: MetricLabel): number | null {
    const key = this.getLabeledKey(name, labels)
    return this.gauges.get(key) ?? null
  }

  /**
   * Get all metrics (for export/monitoring)
   */
  getAllMetrics(): {
    counters: Record<string, number>
    histograms: Record<string, { values: number[]; stats: any }>
    gauges: Record<string, number>
  } {
    const counters: Record<string, number> = {}
    const histograms: Record<string, { values: number[]; stats: any }> = {}
    const gauges: Record<string, number> = {}

    for (const [key, value] of this.counters) {
      counters[key] = value
    }

    for (const [key, values] of this.histograms) {
      const nums = values.map((v) => v.value)
      histograms[key] = {
        values: nums,
        stats: this.calculateStats(nums),
      }
    }

    for (const [key, value] of this.gauges) {
      gauges[key] = value
    }

    return { counters, histograms, gauges }
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.counters.clear()
    this.histograms.clear()
    this.gauges.clear()
  }

  /**
   * Create labeled key for metric
   */
  private getLabeledKey(name: string, labels?: MetricLabel): string {
    if (!labels || Object.keys(labels).length === 0) {
      return name
    }

    const labelStr = Object.entries(labels)
      .sort()
      .map(([k, v]) => `${k}=${v}`)
      .join(',')

    return `${name}{${labelStr}}`
  }

  /**
   * Calculate statistics for array of numbers
   */
  private calculateStats(values: number[]): any {
    if (values.length === 0) return null

    const sorted = [...values].sort((a, b) => a - b)
    const sum = values.reduce((a, b) => a + b, 0)
    const mean = sum / values.length

    return {
      count: values.length,
      sum,
      mean,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
    }
  }
}

/**
 * Global metrics instance
 */
const metrics = new MetricsCollector()

/**
 * API Response Time Tracking
 */
export const apiMetrics = {
  recordRequestDuration(path: string, method: string, duration: number, statusCode: number) {
    metrics.recordHistogram('http_request_duration_ms', duration, {
      path,
      method,
      status: statusCode,
    })

    metrics.incrementCounter('http_requests_total', 1, {
      path,
      method,
      status: statusCode,
    })
  },

  recordErrorRate(path: string, method: string) {
    metrics.incrementCounter('http_errors_total', 1, {
      path,
      method,
    })
  },
}

/**
 * Database Query Tracking
 */
export const databaseMetrics = {
  recordQueryDuration(
    query: string,
    duration: number,
    collection?: string,
    success = true,
  ) {
    const queryType = this.getQueryType(query)

    metrics.recordHistogram('db_query_duration_ms', duration, {
      query_type: queryType,
      collection: collection ?? 'unknown',
      status: success ? 'success' : 'error',
    })

    metrics.incrementCounter('db_queries_total', 1, {
      query_type: queryType,
      collection: collection ?? 'unknown',
      status: success ? 'success' : 'error',
    })
  },

  getQueryType(query: string): string {
    if (!query) return 'unknown'
    const firstWord = query.trim().split(/\s+/)[0].toUpperCase()
    return ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CALL'].includes(firstWord)
      ? firstWord
      : 'other'
  },
}

/**
 * Cache Performance Tracking
 */
export const cacheMetrics = {
  recordHit(key: string, duration?: number) {
    metrics.incrementCounter('cache_hits_total', 1)
    if (duration) {
      metrics.recordHistogram('cache_hit_duration_ms', duration)
    }
  },

  recordMiss(key: string) {
    metrics.incrementCounter('cache_misses_total', 1)
  },

  recordSet(key: string, duration?: number) {
    metrics.incrementCounter('cache_sets_total', 1)
    if (duration) {
      metrics.recordHistogram('cache_set_duration_ms', duration)
    }
  },

  recordInvalidate(key: string) {
    metrics.incrementCounter('cache_invalidations_total', 1)
  },

  getHitRate(): number {
    const hits = metrics.getCounter('cache_hits_total')
    const misses = metrics.getCounter('cache_misses_total')
    const total = hits + misses

    return total === 0 ? 0 : (hits / total) * 100
  },
}

/**
 * Authentication & Security Metrics
 */
export const authMetrics = {
  recordLogin(success = true) {
    metrics.incrementCounter('auth_logins_total', 1, {
      status: success ? 'success' : 'failed',
    })
  },

  recordSignup() {
    metrics.incrementCounter('auth_signups_total', 1)
  },

  recordLogout() {
    metrics.incrementCounter('auth_logouts_total', 1)
  },

  recordRateLimitHit() {
    metrics.incrementCounter('rate_limit_hits_total', 1)
  },

  recordSecurityEvent(event: string) {
    metrics.incrementCounter('security_events_total', 1, {
      event,
    })
  },
}

/**
 * Payment & Business Metrics
 */
export const paymentMetrics = {
  recordPayment(provider: string, amount: number, success = true) {
    metrics.recordHistogram('payment_amount', amount, {
      provider,
      status: success ? 'success' : 'failed',
    })

    metrics.incrementCounter('payments_total', 1, {
      provider,
      status: success ? 'success' : 'failed',
    })
  },

  recordCheckoutInitiated(provider: string) {
    metrics.incrementCounter('checkouts_initiated_total', 1, {
      provider,
    })
  },

  recordCheckoutCompleted(provider: string) {
    metrics.incrementCounter('checkouts_completed_total', 1, {
      provider,
    })
  },
}

/**
 * System Resource Metrics
 */
export const systemMetrics = {
  setMemoryUsage(bytes: number) {
    metrics.setGauge('memory_usage_bytes', bytes)
  },

  setActiveConnections(count: number) {
    metrics.setGauge('active_connections', count)
  },

  recordErrorCount(error: string) {
    metrics.incrementCounter('errors_total', 1, {
      error_type: error,
    })
  },
}

/**
 * Get metrics summary for monitoring/dashboards
 */
export function getMetricsSummary() {
  return {
    api: {
      avgResponseTime: metrics.getHistogramStats('http_request_duration_ms'),
      totalRequests: metrics.getCounter('http_requests_total'),
      totalErrors: metrics.getCounter('http_errors_total'),
    },
    cache: {
      hitRate: cacheMetrics.getHitRate(),
      totalHits: metrics.getCounter('cache_hits_total'),
      totalMisses: metrics.getCounter('cache_misses_total'),
      avgHitDuration: metrics.getHistogramStats('cache_hit_duration_ms'),
    },
    database: {
      avgQueryTime: metrics.getHistogramStats('db_query_duration_ms'),
      totalQueries: metrics.getCounter('db_queries_total'),
    },
    auth: {
      logins: metrics.getCounter('auth_logins_total', { status: 'success' }),
      failedLogins: metrics.getCounter('auth_logins_total', { status: 'failed' }),
      signups: metrics.getCounter('auth_signups_total'),
    },
    payments: {
      totalPayments: metrics.getCounter('payments_total', { status: 'success' }),
      failedPayments: metrics.getCounter('payments_total', { status: 'failed' }),
    },
    memory: {
      usage: metrics.getGauge('memory_usage_bytes'),
    },
  }
}

/**
 * Export metrics for testing and monitoring
 */
export { metrics }
