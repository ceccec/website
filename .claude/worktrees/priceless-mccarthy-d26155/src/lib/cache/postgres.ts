/**
 * Postgres Cache Backend
 *
 * Stores cache invalidation timestamps in Postgres.
 * Provides persistent cache invalidation for Vercel and self-hosted deployments.
 */

import type { CacheBackend, CacheEntry } from '.'
import { sql } from '@vercel/postgres'

/**
 * Postgres Cache Backend implementation
 *
 * Uses Vercel's postgres client or a standard postgres client.
 * Creates a simple table to track cache tag invalidation timestamps.
 */
export class PostgresCacheBackend implements CacheBackend {
  private pool: any
  private tableCreated = false

  constructor(pool: any) {
    this.pool = pool
  }

  private async ensureTable(): Promise<void> {
    if (this.tableCreated) return

    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS cache_tags (
        tag TEXT PRIMARY KEY,
        invalidated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `)

    this.tableCreated = true
  }

  async get(tag: string): Promise<Date | null> {
    await this.ensureTable()

    const result = await this.pool.query('SELECT invalidated_at FROM cache_tags WHERE tag = $1', [
      tag,
    ])

    if (!result.rows || result.rows.length === 0) return null
    return new Date(result.rows[0].invalidated_at)
  }

  async invalidate(tag: string): Promise<void> {
    await this.ensureTable()

    await this.pool.query(
      `
      INSERT INTO cache_tags (tag, invalidated_at)
      VALUES ($1, CURRENT_TIMESTAMP)
      ON CONFLICT (tag) DO UPDATE SET invalidated_at = CURRENT_TIMESTAMP
    `,
      [tag],
    )
  }

  async invalidateMany(tags: string[]): Promise<void> {
    if (tags.length === 0) return

    await this.ensureTable()

    // Build parameterized query for multiple tags
    const placeholders = tags.map((_, i) => `($${i + 1})`).join(',')
    const query = `
      INSERT INTO cache_tags (tag, invalidated_at)
      VALUES ${placeholders}
      ON CONFLICT (tag) DO UPDATE SET invalidated_at = CURRENT_TIMESTAMP
    `

    await this.pool.query(query, tags)
  }

  async hasBeenInvalidated(tag: string): Promise<boolean> {
    const result = await this.get(tag)
    return result !== null
  }

  async getAllEntries(): Promise<CacheEntry[]> {
    await this.ensureTable()

    const result = await this.pool.query('SELECT tag, invalidated_at FROM cache_tags')

    return result.rows.map((row: any) => ({
      tag: row.tag,
      invalidatedAt: new Date(row.invalidated_at),
    }))
  }

  async clear(): Promise<void> {
    await this.ensureTable()
    await this.pool.query('DELETE FROM cache_tags')
  }

  async getStats(): Promise<{
    totalEntries: number
    oldestEntry?: Date
    newestEntry?: Date
  }> {
    await this.ensureTable()

    const result = await this.pool.query(
      'SELECT COUNT(*) as count, MIN(invalidated_at) as oldest, MAX(invalidated_at) as newest FROM cache_tags',
    )

    const row = result.rows[0]
    return {
      totalEntries: parseInt(row.count, 10) || 0,
      oldestEntry: row.oldest ? new Date(row.oldest) : undefined,
      newestEntry: row.newest ? new Date(row.newest) : undefined,
    }
  }
}
