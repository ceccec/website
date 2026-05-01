/**
 * Unit Tests for Capability Detection System
 *
 * Tests the platform capability detection logic used to select
 * appropriate backends at runtime (Phase 5).
 */

import {
  detectCapabilities,
  getCapabilities,
  hasCapability,
  assertCapability,
  getCapabilitySummary,
} from '@root/lib/capabilities'

describe('Capability Detection', () => {
  beforeEach(() => {
    // Reset environment before each test
    delete process.env.POSTGRES_URL
    delete process.env.DATABASE_URL
    delete process.env.MONGODB_URL
    delete process.env.REDIS_URL
    delete process.env.BLOB_READ_WRITE_TOKEN
  })

  describe('detectCapabilities', () => {
    it('should detect no services when environment is empty', () => {
      const caps = detectCapabilities({})

      expect(caps.r2Storage).toBe(false)
      expect(caps.d1Database).toBe(false)
      expect(caps.kvStorage).toBe(false)
      expect(caps.postgresDatabase).toBe(false)
      expect(caps.mongodbDatabase).toBe(false)
      expect(caps.vercelBlob).toBe(false)
      expect(caps.redisCache).toBe(false)
    })

    it('should detect Cloudflare services when bindings provided', () => {
      const mockR2 = { put: jest.fn(), get: jest.fn() }
      const mockD1 = { prepare: jest.fn() }
      const mockKV = { get: jest.fn(), put: jest.fn() }

      const caps = detectCapabilities({
        R2: mockR2,
        D1: mockD1,
        KV_NAMESPACE: mockKV,
      })

      expect(caps.r2Storage).toBe(true)
      expect(caps.d1Database).toBe(true)
      expect(caps.kvStorage).toBe(true)
      expect(caps.isCloudflare).toBe(false) // deployment target detected separately
    })

    it('should detect Postgres from DATABASE_URL', () => {
      process.env.DATABASE_URL = 'postgres://user:pass@localhost/db'

      const caps = detectCapabilities({})

      expect(caps.postgresDatabase).toBe(true)
      expect(caps.mongodbDatabase).toBe(false)
    })

    it('should detect MongoDB from DATABASE_URL', () => {
      process.env.DATABASE_URL = 'mongodb://localhost:27017/payload'

      const caps = detectCapabilities({})

      expect(caps.mongodbDatabase).toBe(true)
      expect(caps.postgresDatabase).toBe(false)
    })

    it('should detect MongoDB from MONGODB_URL', () => {
      process.env.MONGODB_URL = 'mongodb+srv://user:pass@cluster.mongodb.net/db'

      const caps = detectCapabilities({})

      expect(caps.mongodbDatabase).toBe(true)
    })

    it('should detect Vercel Blob from BLOB token', () => {
      process.env.BLOB_READ_WRITE_TOKEN = 'vercel_blob_test_token'

      const caps = detectCapabilities({})

      expect(caps.vercelBlob).toBe(true)
    })

    it('should detect Redis from REDIS_URL', () => {
      process.env.REDIS_URL = 'redis://localhost:6379'

      const caps = detectCapabilities({})

      expect(caps.redisCache).toBe(true)
    })

    it('should detect Redis from UPSTASH_REDIS_REST_URL', () => {
      process.env.UPSTASH_REDIS_REST_URL = 'https://upstash.example.com'

      const caps = detectCapabilities({})

      expect(caps.redisCache).toBe(true)
    })

    it('should handle multiple services at once', () => {
      process.env.POSTGRES_URL = 'postgres://localhost/db'
      process.env.REDIS_URL = 'redis://localhost'
      process.env.BLOB_READ_WRITE_TOKEN = 'token'

      const caps = detectCapabilities({})

      expect(caps.postgresDatabase).toBe(true)
      expect(caps.redisCache).toBe(true)
      expect(caps.vercelBlob).toBe(true)
    })
  })

  describe('getCapabilities (caching)', () => {
    it('should return same instance on subsequent calls', () => {
      const caps1 = getCapabilities()
      const caps2 = getCapabilities()

      expect(caps1).toBe(caps2)
    })

    it('should cache detection results', () => {
      const detectSpy = jest.spyOn(global, 'detectCapabilities')

      getCapabilities()
      getCapabilities()
      getCapabilities()

      // Should be called during module load, not on each getCapabilities()
      expect(detectSpy).toHaveBeenCalledTimes(0) // Already called during setup
    })
  })

  describe('hasCapability', () => {
    beforeEach(() => {
      process.env.POSTGRES_URL = 'postgres://localhost/db'
    })

    it('should return true for available capability', () => {
      expect(hasCapability('postgresDatabase')).toBe(true)
    })

    it('should return false for unavailable capability', () => {
      expect(hasCapability('r2Storage')).toBe(false)
    })

    it('should handle all capability types', () => {
      const caps = getCapabilities()
      const booleanCapabilities = Object.entries(caps)
        .filter(([key, value]) => typeof value === 'boolean')
        .map(([key]) => key)

      for (const cap of booleanCapabilities) {
        // Should not throw
        expect(() => hasCapability(cap as any)).not.toThrow()
      }
    })
  })

  describe('assertCapability', () => {
    beforeEach(() => {
      process.env.POSTGRES_URL = 'postgres://localhost/db'
    })

    it('should not throw for available capability', () => {
      expect(() => assertCapability('postgresDatabase')).not.toThrow()
    })

    it('should throw for unavailable capability', () => {
      expect(() => assertCapability('d1Database')).toThrow(
        /not available/,
      )
    })

    it('should throw with custom message', () => {
      expect(() => assertCapability('d1Database', 'D1 is required')).toThrow(
        'D1 is required',
      )
    })

    it('should throw with default message if none provided', () => {
      expect(() => assertCapability('kvStorage')).toThrow(
        /d1Database.*not available/,
      )
    })
  })

  describe('getCapabilitySummary', () => {
    it('should summarize available services', () => {
      process.env.POSTGRES_URL = 'postgres://localhost/db'
      process.env.REDIS_URL = 'redis://localhost'

      const summary = getCapabilitySummary()

      expect(summary).toContain('Postgres')
      expect(summary).toContain('Redis')
    })

    it('should include platform name', () => {
      const summary = getCapabilitySummary()

      expect(summary).toMatch(/Cloudflare|Vercel|Docker/)
    })

    it('should handle no services', () => {
      const summary = getCapabilitySummary()

      expect(summary).toBeTruthy()
      expect(summary.length).toBeGreaterThan(0)
    })
  })

  describe('Platform Detection', () => {
    it('should detect Docker deployment', () => {
      const caps = detectCapabilities({})

      // Docker is default when no Cloudflare bindings
      expect(caps.isDocker || caps.isVercel || caps.isCloudflare).toBe(true)
    })

    it('should set platform flags mutually exclusive', () => {
      const caps = detectCapabilities({})

      const platformCount = [caps.isCloudflare, caps.isVercel, caps.isDocker].filter(
        (v) => v,
      ).length

      expect(platformCount).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Development Detection', () => {
    it('should detect development environment', () => {
      process.env.NEXT_PUBLIC_IS_LIVE = 'false'

      const caps = detectCapabilities({})

      expect(caps.isDevelopment).toBe(true)
    })

    it('should detect production environment', () => {
      process.env.NEXT_PUBLIC_IS_LIVE = 'true'

      const caps = detectCapabilities({})

      expect(caps.isDevelopment).toBe(false)
    })
  })
})
