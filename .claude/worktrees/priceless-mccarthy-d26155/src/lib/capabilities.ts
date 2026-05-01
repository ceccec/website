/**
 * Platform Capability Detection
 *
 * Detects which services are available in the runtime environment and
 * provides a typed interface for conditional feature loading.
 *
 * Enables graceful degradation: features disable silently instead of crashing
 * when their backing service (R2, D1, KV, etc) is unavailable.
 *
 * @example
 * const capabilities = detectCapabilities(env)
 * if (capabilities.r2Storage) {
 *   // Use R2 for file uploads
 * } else {
 *   // Fall back to local storage or S3
 * }
 */

import type { CloudflareEnv } from '../../cloudflare-env'
import { DeploymentTarget, detectDeploymentTarget } from './deploymentTarget'

/**
 * Platform capabilities available in this runtime
 *
 * When a capability is `false`, the corresponding feature should:
 * 1. Use a fallback implementation if available
 * 2. Log a warning that the feature is degraded
 * 3. Never throw or crash the application
 */
export interface PlatformCapabilities {
  // Service availability
  r2Storage: boolean // Cloudflare R2 object storage
  d1Database: boolean // Cloudflare D1 SQLite database
  durableObjectsQueue: boolean // Cloudflare Durable Objects for queuing
  kvStorage: boolean // Cloudflare KV key-value storage
  imageOptimization: boolean // Cloudflare Image Optimization
  analyticsEngine: boolean // Cloudflare Analytics Engine

  // Fallback services (when primary unavailable)
  postgresDatabase: boolean // Postgres for SQL queries
  mongodbDatabase: boolean // MongoDB for document storage
  vercelBlob: boolean // Vercel Blob for file storage
  redisCache: boolean // Redis for caching/queuing

  // Platform info
  deploymentTarget: DeploymentTarget
  isCloudflare: boolean
  isVercel: boolean
  isDocker: boolean
  isDevelopment: boolean
}

/**
 * Detects available platform capabilities from environment
 *
 * Checks for:
 * - Cloudflare bindings (R2, D1, KV, DO, Images, Analytics Engine)
 * - Database connection strings (Postgres, MongoDB)
 * - Service credentials (Vercel Blob, Redis)
 */
export function detectCapabilities(env?: any): PlatformCapabilities {
  const deploymentTarget = detectDeploymentTarget()

  // Cloudflare bindings
  const hasR2 = !!env?.R2 || (typeof globalThis !== 'undefined' && !!(globalThis as any).__R2_BUCKET__)
  const hasD1 = !!env?.D1 || (typeof globalThis !== 'undefined' && !!(globalThis as any).__D1_DATABASE__)
  const hasKV = !!env?.KV_NAMESPACE || (typeof globalThis !== 'undefined' && !!(globalThis as any).__KV_NAMESPACE__)
  const hasDO = !!env?.NEXT_CACHE_DO_QUEUE || (typeof globalThis !== 'undefined' && !!(globalThis as any).__DO_QUEUE__)
  const hasImages = !!env?.IMAGES || (typeof globalThis !== 'undefined' && !!(globalThis as any).__IMAGES__)
  const hasAnalyticsEngine = !!env?.ANALYTICS_ENGINE || (typeof globalThis !== 'undefined' && !!(globalThis as any).__AE__)

  // Database connection strings
  const postgresUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL
  const mongoUrl = process.env.MONGODB_URL
  const hasPostgres = postgresUrl?.startsWith('postgres')
  const hasMongoDB = mongoUrl?.startsWith('mongodb')

  // Vercel services
  const hasVercelBlob = !!process.env.BLOB_READ_WRITE_TOKEN
  const hasRedis = !!process.env.REDIS_URL || !!process.env.UPSTASH_REDIS_REST_URL

  const isCloudflare = deploymentTarget === 'cloudflare'
  const isVercel = deploymentTarget === 'vercel'
  const isDocker = deploymentTarget === 'docker'
  const isDevelopment = deploymentTarget === 'docker' || !process.env.NEXT_PUBLIC_IS_LIVE

  return {
    // Cloudflare services
    r2Storage: hasR2,
    d1Database: hasD1,
    durableObjectsQueue: hasDO,
    kvStorage: hasKV,
    imageOptimization: hasImages,
    analyticsEngine: hasAnalyticsEngine,

    // Fallback services
    postgresDatabase: hasPostgres,
    mongodbDatabase: hasMongoDB,
    vercelBlob: hasVercelBlob,
    redisCache: hasRedis,

    // Platform info
    deploymentTarget,
    isCloudflare,
    isVercel,
    isDocker,
    isDevelopment,
  }
}

/**
 * Global instance of detected capabilities
 * Cached on first access for performance
 */
let cachedCapabilities: PlatformCapabilities | null = null

/**
 * Get the cached platform capabilities
 * Detects once and returns the same instance on subsequent calls
 */
export function getCapabilities(): PlatformCapabilities {
  if (!cachedCapabilities) {
    cachedCapabilities = detectCapabilities()
  }
  return cachedCapabilities
}

/**
 * Check if a specific capability is available
 *
 * @example
 * if (hasCapability('r2Storage')) {
 *   await uploadToR2(file)
 * }
 */
export function hasCapability(capability: keyof PlatformCapabilities): boolean {
  const caps = getCapabilities()
  const value = caps[capability]
  return typeof value === 'boolean' ? value : false
}

/**
 * Assert a capability is available
 * Throws if not available (for mandatory features)
 *
 * @example
 * assertCapability('d1Database', 'Cache invalidation requires D1')
 */
export function assertCapability(
  capability: keyof Omit<PlatformCapabilities, 'deploymentTarget' | 'isCloudflare' | 'isVercel' | 'isDocker' | 'isDevelopment'>,
  errorMessage?: string,
): void {
  if (!hasCapability(capability)) {
    throw new Error(
      errorMessage || `Required capability '${capability}' not available in this deployment`,
    )
  }
}

/**
 * Log capability detection results (for debugging/monitoring)
 */
export function logCapabilities(prefix = 'Platform Capabilities'): void {
  const caps = getCapabilities()
  const available = Object.entries(caps)
    .filter(([k, v]) => v === true && !k.startsWith('is') && k !== 'deploymentTarget')
    .map(([k]) => k)

  const unavailable = Object.entries(caps)
    .filter(([k, v]) => v === false && !k.startsWith('is') && k !== 'deploymentTarget')
    .map(([k]) => k)

  console.log(`[${prefix}] Deployment: ${caps.deploymentTarget}`)
  if (available.length > 0) {
    console.log(`[${prefix}] Available: ${available.join(', ')}`)
  }
  if (unavailable.length > 0) {
    console.warn(`[${prefix}] Unavailable: ${unavailable.join(', ')}`)
  }
}

/**
 * Get a summary capability string (for error messages, logs)
 * @example "Cloudflare (R2, D1, KV)" or "Vercel (Postgres, Blob)"
 */
export function getCapabilitySummary(): string {
  const caps = getCapabilities()
  const services: string[] = []

  if (caps.r2Storage) services.push('R2')
  if (caps.d1Database) services.push('D1')
  if (caps.kvStorage) services.push('KV')
  if (caps.durableObjectsQueue) services.push('DO')
  if (caps.postgresDatabase) services.push('Postgres')
  if (caps.mongodbDatabase) services.push('MongoDB')
  if (caps.vercelBlob) services.push('Blob')
  if (caps.redisCache) services.push('Redis')

  const service = caps.isCloudflare ? 'Cloudflare' : caps.isVercel ? 'Vercel' : 'Docker'
  return services.length > 0 ? `${service} (${services.join(', ')})` : service
}
