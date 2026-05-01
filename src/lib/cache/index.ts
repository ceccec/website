/**
 * Cache Backend Abstraction
 *
 * Abstracts different cache implementations across platforms:
 * - Cloudflare D1 (SQLite) for primary caching
 * - Postgres for Vercel deployments
 * - In-memory for development/Docker
 * - Redis for high-performance caching (optional)
 *
 * Enables platform-agnostic cache invalidation and management.
 */

/**
 * Cache entry representing when a tag was invalidated
 */
export interface CacheEntry {
  tag: string
  invalidatedAt: Date
}

/**
 * Abstract cache backend interface
 *
 * All methods should handle missing tags gracefully:
 * - get() returns null for missing tags
 * - set() creates or updates tags silently
 * - delete() doesn't error on missing tags
 * - invalidate() succeeds even if tag doesn't exist
 */
export interface CacheBackend {
  /**
   * Get the last invalidation timestamp for a tag
   * Returns null if tag has never been invalidated
   */
  get(tag: string): Promise<Date | null>

  /**
   * Record an invalidation for a tag with current timestamp
   */
  invalidate(tag: string): Promise<void>

  /**
   * Invalidate multiple tags at once
   */
  invalidateMany(tags: string[]): Promise<void>

  /**
   * Check if a tag has been invalidated
   */
  hasBeenInvalidated(tag: string): Promise<boolean>

  /**
   * Get all entries in the cache (for debugging)
   * Warning: may be expensive on large caches
   */
  getAllEntries(): Promise<CacheEntry[]>

  /**
   * Clear all cached entries (for reset/cleanup)
   */
  clear(): Promise<void>

  /**
   * Get cache statistics (for monitoring)
   */
  getStats(): Promise<{
    totalEntries: number
    oldestEntry?: Date
    newestEntry?: Date
  }>
}

/**
 * In-memory cache backend for development
 *
 * Stores cache entries in a Map. Data is lost on process restart.
 * Good for local development but not suitable for production.
 */
export class MemoryCacheBackend implements CacheBackend {
  private cache = new Map<string, Date>()

  async get(tag: string): Promise<Date | null> {
    return this.cache.get(tag) || null
  }

  async invalidate(tag: string): Promise<void> {
    this.cache.set(tag, new Date())
  }

  async invalidateMany(tags: string[]): Promise<void> {
    const now = new Date()
    for (const tag of tags) {
      this.cache.set(tag, now)
    }
  }

  async hasBeenInvalidated(tag: string): Promise<boolean> {
    return this.cache.has(tag)
  }

  async getAllEntries(): Promise<CacheEntry[]> {
    const entries: CacheEntry[] = []
    for (const [tag, date] of this.cache.entries()) {
      entries.push({ tag, invalidatedAt: date })
    }
    return entries
  }

  async clear(): Promise<void> {
    this.cache.clear()
  }

  async getStats(): Promise<{
    totalEntries: number
    oldestEntry?: Date
    newestEntry?: Date
  }> {
    if (this.cache.size === 0) {
      return { totalEntries: 0 }
    }

    let oldest: Date | undefined
    let newest: Date | undefined

    for (const date of this.cache.values()) {
      if (!oldest || date < oldest) oldest = date
      if (!newest || date > newest) newest = date
    }

    return {
      totalEntries: this.cache.size,
      oldestEntry: oldest,
      newestEntry: newest,
    }
  }
}

/**
 * Global cache backend instance
 * Set during runtime initialization based on platform capabilities
 */
let globalCacheBackend: CacheBackend | null = null

/**
 * Initialize the global cache backend
 * Called during app startup in src/plugins/payload-runtime/getPayload.ts
 */
export function initializeCacheBackend(backend: CacheBackend): void {
  globalCacheBackend = backend
}

/**
 * Get the active cache backend
 * Falls back to in-memory if not initialized
 */
export function getCacheBackend(): CacheBackend {
  if (!globalCacheBackend) {
    globalCacheBackend = new MemoryCacheBackend()
  }
  return globalCacheBackend
}

/**
 * Invalidate cache tags using the active backend
 *
 * @example
 * await invalidateTags([uuidTags.cloud.user, uuidTags.cloud.projects])
 */
export async function invalidateTags(tags: string | string[]): Promise<void> {
  const backend = getCacheBackend()
  const tagList = Array.isArray(tags) ? tags : [tags]
  await backend.invalidateMany(tagList)
}

/**
 * Clear all cache entries (for reset/testing)
 */
export async function clearCache(): Promise<void> {
  const backend = getCacheBackend()
  await backend.clear()
}

/**
 * Get cache statistics for monitoring/debugging
 */
export async function getCacheStats(): Promise<{
  totalEntries: number
  oldestEntry?: Date
  newestEntry?: Date
}> {
  const backend = getCacheBackend()
  return backend.getStats()
}
