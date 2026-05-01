/**
 * Unit Tests for Cache Backend Abstraction
 *
 * Tests the cache backend interface and implementations.
 */

import {
  MemoryCacheBackend,
  getCacheBackend,
  initializeCacheBackend,
  invalidateTags,
  clearCache,
  getCacheStats,
} from '@root/lib/cache'

describe('MemoryCacheBackend', () => {
  let backend: MemoryCacheBackend

  beforeEach(() => {
    backend = new MemoryCacheBackend()
  })

  describe('get/invalidate', () => {
    it('should return null for non-existent tag', async () => {
      const result = await backend.get('non-existent-tag')
      expect(result).toBeNull()
    })

    it('should invalidate and retrieve tag', async () => {
      await backend.invalidate('user:123')
      const result = await backend.get('user:123')

      expect(result).toBeInstanceOf(Date)
      expect(result?.getTime()).toBeLessThanOrEqual(Date.now())
    })

    it('should update invalidation timestamp on re-invalidate', async () => {
      await backend.invalidate('project:456')
      const first = await backend.get('project:456')

      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 10))

      await backend.invalidate('project:456')
      const second = await backend.get('project:456')

      expect(second!.getTime()).toBeGreaterThanOrEqual(first!.getTime())
    })
  })

  describe('invalidateMany', () => {
    it('should invalidate multiple tags', async () => {
      const tags = ['tag1', 'tag2', 'tag3']
      await backend.invalidateMany(tags)

      for (const tag of tags) {
        const result = await backend.get(tag)
        expect(result).not.toBeNull()
      }
    })

    it('should handle empty array', async () => {
      await expect(backend.invalidateMany([])).resolves.not.toThrow()
    })
  })

  describe('hasBeenInvalidated', () => {
    it('should return false for non-existent tag', async () => {
      const result = await backend.hasBeenInvalidated('missing')
      expect(result).toBe(false)
    })

    it('should return true for invalidated tag', async () => {
      await backend.invalidate('exists')
      const result = await backend.hasBeenInvalidated('exists')
      expect(result).toBe(true)
    })
  })

  describe('getAllEntries', () => {
    it('should return empty array initially', async () => {
      const entries = await backend.getAllEntries()
      expect(entries).toEqual([])
    })

    it('should return all cached entries', async () => {
      await backend.invalidateMany(['tag1', 'tag2', 'tag3'])
      const entries = await backend.getAllEntries()

      expect(entries).toHaveLength(3)
      expect(entries.map((e) => e.tag)).toEqual(
        expect.arrayContaining(['tag1', 'tag2', 'tag3']),
      )
    })

    it('should have valid invalidation dates', async () => {
      await backend.invalidate('dated-tag')
      const entries = await backend.getAllEntries()

      expect(entries[0].invalidatedAt).toBeInstanceOf(Date)
      expect(entries[0].invalidatedAt.getTime()).toBeLessThanOrEqual(Date.now())
    })
  })

  describe('clear', () => {
    it('should remove all entries', async () => {
      await backend.invalidateMany(['tag1', 'tag2'])
      await backend.clear()

      const entries = await backend.getAllEntries()
      expect(entries).toHaveLength(0)
    })
  })

  describe('getStats', () => {
    it('should return zero entries initially', async () => {
      const stats = await backend.getStats()
      expect(stats.totalEntries).toBe(0)
      expect(stats.oldestEntry).toBeUndefined()
      expect(stats.newestEntry).toBeUndefined()
    })

    it('should track entry count', async () => {
      await backend.invalidateMany(['a', 'b', 'c'])
      const stats = await backend.getStats()

      expect(stats.totalEntries).toBe(3)
    })

    it('should track oldest and newest entries', async () => {
      await backend.invalidate('first')
      await new Promise((resolve) => setTimeout(resolve, 10))
      await backend.invalidate('second')

      const stats = await backend.getStats()

      expect(stats.oldestEntry).toBeDefined()
      expect(stats.newestEntry).toBeDefined()
      expect(stats.newestEntry!.getTime()).toBeGreaterThanOrEqual(
        stats.oldestEntry!.getTime(),
      )
    })
  })
})

describe('Global Cache Backend', () => {
  beforeEach(() => {
    // Use a fresh backend for each test
    initializeCacheBackend(new MemoryCacheBackend())
  })

  describe('invalidateTags', () => {
    it('should invalidate single tag as string', async () => {
      await invalidateTags('user:123')
      const backend = getCacheBackend()
      const result = await backend.get('user:123')

      expect(result).not.toBeNull()
    })

    it('should invalidate multiple tags as array', async () => {
      const tags = ['project:1', 'project:2', 'project:3']
      await invalidateTags(tags)

      const backend = getCacheBackend()
      for (const tag of tags) {
        const result = await backend.get(tag)
        expect(result).not.toBeNull()
      }
    })
  })

  describe('clearCache', () => {
    it('should clear all cached entries', async () => {
      const backend = getCacheBackend()
      await backend.invalidateMany(['a', 'b', 'c'])

      let entries = await backend.getAllEntries()
      expect(entries.length).toBeGreaterThan(0)

      await clearCache()

      entries = await backend.getAllEntries()
      expect(entries).toHaveLength(0)
    })
  })

  describe('getCacheStats', () => {
    it('should return stats from current backend', async () => {
      const backend = getCacheBackend()
      await backend.invalidateMany(['tag1', 'tag2'])

      const stats = await getCacheStats()

      expect(stats.totalEntries).toBe(2)
    })
  })
})
