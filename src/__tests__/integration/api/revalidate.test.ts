/**
 * Integration Tests for Revalidation API Route
 *
 * Tests the cache revalidation endpoint for secure tag-based revalidation.
 */

import { GET } from '@root/app/api/revalidate/route'
import { NextRequest } from 'next/server'

/**
 * Mock the revalidateTagImmediate function
 */
jest.mock('@utilities/revalidateTagImmediate', () => ({
  revalidateTagImmediate: jest.fn(),
}))

import { revalidateTagImmediate } from '@utilities/revalidateTagImmediate'
import { uuidTags } from '@uuid'

/**
 * The route returns a NextResponse whose `.json()` body carries the revalidation
 * result. These tests read it synchronously; this typed view exposes the fields
 * under assertion without altering the call's runtime behavior.
 */
type RevalidateResponseBody = { now?: number; revalidated?: boolean }
const readBody = (response: ReturnType<typeof GET>): RevalidateResponseBody =>
  (response as unknown as { json(): RevalidateResponseBody }).json()

describe('Revalidation API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.NEXT_PRIVATE_REVALIDATION_KEY = 'test-secret-key'
  })

  describe('Authentication', () => {
    it('should reject requests without secret', () => {
      const request = new NextRequest(new URL('http://localhost:3000/api/revalidate'))

      const response = GET(request)

      expect(response.status).toBe(200)
      const data = response.json()
      expect(data).toHaveProperty('revalidated', false)
    })

    it('should reject requests with invalid secret', () => {
      const request = new NextRequest(
        new URL('http://localhost:3000/api/revalidate?secret=wrong-secret'),
      )

      const response = GET(request)

      expect(response.status).toBe(200)
      const data = response.json()
      expect(data).toHaveProperty('revalidated', false)
      expect(revalidateTagImmediate).not.toHaveBeenCalled()
    })

    it('should accept requests with valid secret', () => {
      const request = new NextRequest(
        new URL(
          'http://localhost:3000/api/revalidate?secret=test-secret-key&collection=posts&slug=hello-world',
        ),
      )

      const response = GET(request)

      expect(response.status).toBe(200)
      const data = response.json()
      expect(data).toHaveProperty('revalidated', true)
    })
  })

  describe('Tag revalidation', () => {
    it('should revalidate collection slug tag', () => {
      const request = new NextRequest(
        new URL(
          'http://localhost:3000/api/revalidate?secret=test-secret-key&collection=posts&slug=hello-world',
        ),
      )

      GET(request)

      expect(revalidateTagImmediate).toHaveBeenCalledWith(
        uuidTags.collectionSlug('posts', 'hello-world'),
      )
    })

    it('should handle different collection types', () => {
      const collections = ['posts', 'pages', 'products', 'users']

      for (const collection of collections) {
        jest.clearAllMocks()

        const request = new NextRequest(
          new URL(
            `http://localhost:3000/api/revalidate?secret=test-secret-key&collection=${collection}&slug=test-slug`,
          ),
        )

        GET(request)

        expect(revalidateTagImmediate).toHaveBeenCalledWith(
          uuidTags.collectionSlug(collection, 'test-slug'),
        )
      }
    })

    it('should handle slugs with special characters', () => {
      const slugs = [
        'hello-world',
        'test_slug',
        'multi-word-slug',
        'slug-with-123',
        'UPPERCASE-SLUG',
      ]

      for (const slug of slugs) {
        jest.clearAllMocks()

        const request = new NextRequest(
          new URL(
            `http://localhost:3000/api/revalidate?secret=test-secret-key&collection=posts&slug=${slug}`,
          ),
        )

        GET(request)

        expect(revalidateTagImmediate).toHaveBeenCalledWith(
          uuidTags.collectionSlug('posts', slug),
        )
      }
    })
  })

  describe('Parameter validation', () => {
    it('should reject request without collection parameter', () => {
      const request = new NextRequest(
        new URL('http://localhost:3000/api/revalidate?secret=test-secret-key&slug=hello-world'),
      )

      const response = GET(request)

      expect(response.status).toBe(200)
      const data = response.json()
      expect(data).toHaveProperty('revalidated', false)
      expect(revalidateTagImmediate).not.toHaveBeenCalled()
    })

    it('should reject request without slug parameter', () => {
      const request = new NextRequest(
        new URL('http://localhost:3000/api/revalidate?secret=test-secret-key&collection=posts'),
      )

      const response = GET(request)

      expect(response.status).toBe(200)
      const data = response.json()
      expect(data).toHaveProperty('revalidated', false)
      expect(revalidateTagImmediate).not.toHaveBeenCalled()
    })

    it('should require both collection and slug', () => {
      const request = new NextRequest(
        new URL('http://localhost:3000/api/revalidate?secret=test-secret-key'),
      )

      const response = GET(request)

      expect(response.status).toBe(200)
      const data = response.json()
      expect(data).toHaveProperty('revalidated', false)
    })
  })

  describe('Response format', () => {
    it('should include timestamp in response', () => {
      const request = new NextRequest(
        new URL(
          'http://localhost:3000/api/revalidate?secret=test-secret-key&collection=posts&slug=test',
        ),
      )

      const response = GET(request)
      const data = readBody(response)

      expect(data).toHaveProperty('now')
      expect(typeof data.now).toBe('number')
      expect(data.now).toBeGreaterThan(0)
    })

    it('should return JSON response', () => {
      const request = new NextRequest(
        new URL('http://localhost:3000/api/revalidate?secret=wrong'),
      )

      const response = GET(request)

      expect(response.headers.get('content-type')).toContain('application/json')
    })
  })

  describe('Security', () => {
    it('should not expose environment variable in response', () => {
      const request = new NextRequest(
        new URL('http://localhost:3000/api/revalidate?secret=wrong'),
      )

      const response = GET(request)
      const text = JSON.stringify(response)

      expect(text).not.toContain(process.env.NEXT_PRIVATE_REVALIDATION_KEY)
    })

    it('should handle missing secret environment variable gracefully', () => {
      delete process.env.NEXT_PRIVATE_REVALIDATION_KEY

      const request = new NextRequest(
        new URL(
          'http://localhost:3000/api/revalidate?secret=test-secret&collection=posts&slug=test',
        ),
      )

      const response = GET(request)

      expect(response.status).toBe(200)
      const data = response.json()
      expect(data).toHaveProperty('revalidated', false)
    })

    it('should be case-sensitive for secret', () => {
      process.env.NEXT_PRIVATE_REVALIDATION_KEY = 'TestSecret'

      const request = new NextRequest(
        new URL(
          'http://localhost:3000/api/revalidate?secret=testsecret&collection=posts&slug=test',
        ),
      )

      const response = GET(request)
      const data = response.json()

      expect(data).toHaveProperty('revalidated', false)
    })
  })

  describe('Integration scenarios', () => {
    it('should handle concurrent requests', async () => {
      const requests = [
        new NextRequest(
          new URL(
            'http://localhost:3000/api/revalidate?secret=test-secret-key&collection=posts&slug=article-1',
          ),
        ),
        new NextRequest(
          new URL(
            'http://localhost:3000/api/revalidate?secret=test-secret-key&collection=posts&slug=article-2',
          ),
        ),
        new NextRequest(
          new URL(
            'http://localhost:3000/api/revalidate?secret=test-secret-key&collection=pages&slug=about',
          ),
        ),
      ]

      const responses = requests.map((req) => GET(req))

      expect(responses).toHaveLength(3)
      expect(revalidateTagImmediate).toHaveBeenCalledTimes(3)
    })

    it('should revalidate multiple slugs in sequence', () => {
      const slugs = ['slug-1', 'slug-2', 'slug-3']

      for (const slug of slugs) {
        const request = new NextRequest(
          new URL(
            `http://localhost:3000/api/revalidate?secret=test-secret-key&collection=posts&slug=${slug}`,
          ),
        )

        GET(request)
      }

      expect(revalidateTagImmediate).toHaveBeenCalledTimes(3)
    })

    it('should track revalidation events', () => {
      const request = new NextRequest(
        new URL(
          'http://localhost:3000/api/revalidate?secret=test-secret-key&collection=posts&slug=tracked',
        ),
      )

      const before = Date.now()
      const response = GET(request)
      const after = Date.now()

      const data = readBody(response)

      expect(data.now).toBeGreaterThanOrEqual(before)
      expect(data.now).toBeLessThanOrEqual(after)
      expect(data.revalidated).toBe(true)
    })
  })
})
