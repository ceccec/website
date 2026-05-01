/**
 * Redis Cache Backend
 *
 * Uses Redis for high-speed cache invalidation tracking.
 * Ideal for Docker and Vercel deployments with Redis add-ons.
 */

import type { CacheBackend, CacheEntry } from '.'

/**
 * Redis Cache Backend implementation
 *
 * Stores cache tags with their invalidation timestamps in Redis.
 * Uses a simple key-value approach: `cache:tag` → timestamp
 */
export class RedisCacheBackend implements CacheBackend {
  private redis: any

  constructor(redis: any) {
    this.redis = redis
  }

  private key(tag: string): string {
    return `cache:${tag}`
  }

  async get(tag: string): Promise<Date | null> {
    const value = await this.redis.get(this.key(tag))
    if (!value) return null
    try {
      return new Date(parseInt(value, 10))
    } catch {
      return null
    }
  }

  async invalidate(tag: string): Promise<void> {
    await this.redis.set(this.key(tag), Date.now().toString())
  }

  async invalidateMany(tags: string[]): Promise<void> {
    if (tags.length === 0) return

    const now = Date.now().toString()
    const pipeline = this.redis.pipeline()

    for (const tag of tags) {
      pipeline.set(this.key(tag), now)
    }

    await pipeline.exec()
  }

  async hasBeenInvalidated(tag: string): Promise<boolean> {
    const result = await this.get(tag)
    return result !== null
  }

  async getAllEntries(): Promise<CacheEntry[]> {
    // Get all keys matching pattern cache:*
    const keys = await this.redis.keys('cache:*')

    const entries: CacheEntry[] = []
    for (const key of keys) {
      const tag = key.replace('cache:', '')
      const timestamp = await this.redis.get(key)

      if (timestamp) {
        entries.push({
          tag,
          invalidatedAt: new Date(parseInt(timestamp, 10)),
        })
      }
    }

    return entries
  }

  async clear(): Promise<void> {
    const keys = await this.redis.keys('cache:*')

    if (keys.length > 0) {
      const pipeline = this.redis.pipeline()
      for (const key of keys) {
        pipeline.del(key)
      }
      await pipeline.exec()
    }
  }

  async getStats(): Promise<{
    totalEntries: number
    oldestEntry?: Date
    newestEntry?: Date
  }> {
    const entries = await this.getAllEntries()

    if (entries.length === 0) {
      return { totalEntries: 0 }
    }

    let oldest = entries[0].invalidatedAt
    let newest = entries[0].invalidatedAt

    for (const entry of entries) {
      if (entry.invalidatedAt < oldest) oldest = entry.invalidatedAt
      if (entry.invalidatedAt > newest) newest = entry.invalidatedAt
    }

    return {
      totalEntries: entries.length,
      oldestEntry: oldest,
      newestEntry: newest,
    }
  }
}
