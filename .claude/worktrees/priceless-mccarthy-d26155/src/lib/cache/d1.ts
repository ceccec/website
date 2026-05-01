/**
 * Cloudflare D1 Cache Backend
 *
 * Stores cache invalidation timestamps in Cloudflare D1 (SQLite).
 * Provides persistent cache invalidation across worker deployments.
 */

import type { CacheBackend, CacheEntry } from '.'

/**
 * D1 Cache Backend implementation for Cloudflare
 *
 * Creates a simple table to track cache tag invalidation timestamps:
 * ```
 * CREATE TABLE IF NOT EXISTS cache_tags (
 *   tag TEXT PRIMARY KEY,
 *   invalidated_at DATETIME DEFAULT CURRENT_TIMESTAMP
 * )
 * ```
 */
export class D1CacheBackend implements CacheBackend {
  private db: any // D1Database

  constructor(database: any) {
    this.db = database
  }

  private async ensureTable(): Promise<void> {
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS cache_tags (
        tag TEXT PRIMARY KEY,
        invalidated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
  }

  async get(tag: string): Promise<Date | null> {
    await this.ensureTable()
    const result = await this.db
      .prepare('SELECT invalidated_at FROM cache_tags WHERE tag = ?')
      .bind(tag)
      .first()

    if (!result) return null
    return new Date(result.invalidated_at)
  }

  async invalidate(tag: string): Promise<void> {
    await this.ensureTable()
    await this.db
      .prepare(
        'INSERT INTO cache_tags (tag, invalidated_at) VALUES (?, CURRENT_TIMESTAMP) ON CONFLICT(tag) DO UPDATE SET invalidated_at = CURRENT_TIMESTAMP',
      )
      .bind(tag)
      .run()
  }

  async invalidateMany(tags: string[]): Promise<void> {
    if (tags.length === 0) return

    await this.ensureTable()

    // Use a transaction for multiple invalidations
    const queries = tags
      .map(
        (tag) =>
          `INSERT INTO cache_tags (tag, invalidated_at) VALUES ('${tag}', CURRENT_TIMESTAMP) ON CONFLICT(tag) DO UPDATE SET invalidated_at = CURRENT_TIMESTAMP;`,
      )
      .join('\n')

    await this.db.exec(queries)
  }

  async hasBeenInvalidated(tag: string): Promise<boolean> {
    const result = await this.get(tag)
    return result !== null
  }

  async getAllEntries(): Promise<CacheEntry[]> {
    await this.ensureTable()
    const results = await this.db.prepare('SELECT tag, invalidated_at FROM cache_tags').all()

    return results.results.map((row: any) => ({
      tag: row.tag,
      invalidatedAt: new Date(row.invalidated_at),
    }))
  }

  async clear(): Promise<void> {
    await this.ensureTable()
    await this.db.prepare('DELETE FROM cache_tags').run()
  }

  async getStats(): Promise<{
    totalEntries: number
    oldestEntry?: Date
    newestEntry?: Date
  }> {
    await this.ensureTable()
    const result = await this.db
      .prepare(
        'SELECT COUNT(*) as count, MIN(invalidated_at) as oldest, MAX(invalidated_at) as newest FROM cache_tags',
      )
      .first()

    return {
      totalEntries: result.count || 0,
      oldestEntry: result.oldest ? new Date(result.oldest) : undefined,
      newestEntry: result.newest ? new Date(result.newest) : undefined,
    }
  }
}
