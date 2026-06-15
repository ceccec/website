/**
 * Integration Tests for Stripe Checkout API Route
 *
 * Tests the payment checkout initiation endpoint for Stripe and Revolut payments.
 */

import { POST } from '@root/app/api/stripe/checkout-session/route'
import { NextRequest } from 'next/server'

/**
 * Mock Payload and Stripe modules
 */
jest.mock('@root/plugins/payload-runtime/getPayload', () => ({
  getPayload: jest.fn(),
}))

jest.mock('@root/plugins/site-billing/marketingCheckout', () => ({
  createMarketingCheckout: jest.fn(),
}))

import { getPayload } from '@root/plugins/payload-runtime/getPayload'
import { createMarketingCheckout } from '@root/plugins/site-billing/marketingCheckout'

/**
 * Typed view of the checkout route's JSON body. The route responds with either
 * `{ error }` on failure or `{ provider, url }` on success; this exposes those
 * fields for assertions without changing the call's runtime behavior.
 */
type CheckoutResponseBody = { error?: string; provider?: string; url?: string }
const readBody = (response: { json(): Promise<unknown> }): Promise<CheckoutResponseBody> =>
  response.json() as Promise<CheckoutResponseBody>

describe('Stripe Checkout API Route', () => {
  const mockPayload = {
    auth: jest.fn(),
    findById: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(getPayload as jest.Mock).mockResolvedValue(mockPayload)
    mockPayload.auth.mockResolvedValue({
      user: { id: 'user-123' },
    })
    mockPayload.findById.mockResolvedValue({
      id: 'user-123',
      email: 'user@example.com',
      stripeCustomerId: 'cus_123',
    })
  })

  describe('Request validation', () => {
    it('should reject invalid JSON', async () => {
      const request = new NextRequest(new URL('http://localhost:3000/api/stripe/checkout-session'), {
        method: 'POST',
        body: 'invalid json {',
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
      const data = await readBody(response)
      expect(data.error).toContain('Invalid JSON')
    })

    it('should require successUrl', async () => {
      const request = new NextRequest(new URL('http://localhost:3000/api/stripe/checkout-session'), {
        method: 'POST',
        body: JSON.stringify({
          cancelUrl: 'http://example.com/cancel',
          priceId: 'price_123',
        }),
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
      const data = await readBody(response)
      expect(data.error).toContain('successUrl')
    })

    it('should require cancelUrl', async () => {
      const request = new NextRequest(new URL('http://localhost:3000/api/stripe/checkout-session'), {
        method: 'POST',
        body: JSON.stringify({
          successUrl: 'http://example.com/success',
          priceId: 'price_123',
        }),
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
      const data = await readBody(response)
      expect(data.error).toContain('cancelUrl')
    })

    it('should require priceId or plan', async () => {
      const request = new NextRequest(new URL('http://localhost:3000/api/stripe/checkout-session'), {
        method: 'POST',
        body: JSON.stringify({
          successUrl: 'http://example.com/success',
          cancelUrl: 'http://example.com/cancel',
        }),
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
      const data = await readBody(response)
      expect(data.error).toContain('priceId')
      expect(data.error).toContain('plan')
    })

    it('should accept priceId or plan or both', async () => {
      ;(createMarketingCheckout as jest.Mock).mockResolvedValue({
        provider: 'stripe',
        url: 'https://checkout.stripe.com/...',
      })

      // Test with priceId
      let request = new NextRequest(new URL('http://localhost:3000/api/stripe/checkout-session'), {
        method: 'POST',
        body: JSON.stringify({
          successUrl: 'http://example.com/success',
          cancelUrl: 'http://example.com/cancel',
          priceId: 'price_123',
        }),
        headers: { cookie: 'auth=token' },
      })

      let response = await POST(request)
      expect(response.status).toBe(200)

      // Test with plan
      jest.clearAllMocks()
      mockPayload.auth.mockResolvedValue({ user: { id: 'user-123' } })
      ;(getPayload as jest.Mock).mockResolvedValue(mockPayload)

      request = new NextRequest(new URL('http://localhost:3000/api/stripe/checkout-session'), {
        method: 'POST',
        body: JSON.stringify({
          successUrl: 'http://example.com/success',
          cancelUrl: 'http://example.com/cancel',
          plan: 'pro',
        }),
        headers: { cookie: 'auth=token' },
      })

      ;(createMarketingCheckout as jest.Mock).mockResolvedValue({
        provider: 'revolut',
        url: 'https://revolut.com/...',
      })

      response = await POST(request)
      expect(response.status).toBe(200)
    })
  })

  describe('Authentication', () => {
    it('should reject unauthenticated requests', async () => {
      mockPayload.auth.mockResolvedValue({ user: null })

      const request = new NextRequest(new URL('http://localhost:3000/api/stripe/checkout-session'), {
        method: 'POST',
        body: JSON.stringify({
          successUrl: 'http://example.com/success',
          cancelUrl: 'http://example.com/cancel',
          priceId: 'price_123',
        }),
      })

      const response = await POST(request)

      expect(response.status).toBe(401)
      const data = await readBody(response)
      expect(data.error).toBe('Unauthorized')
    })

    it('should reject requests without user id', async () => {
      mockPayload.auth.mockResolvedValue({ user: { id: null } })

      const request = new NextRequest(new URL('http://localhost:3000/api/stripe/checkout-session'), {
        method: 'POST',
        body: JSON.stringify({
          successUrl: 'http://example.com/success',
          cancelUrl: 'http://example.com/cancel',
          priceId: 'price_123',
        }),
      })

      const response = await POST(request)

      expect(response.status).toBe(401)
      const data = await readBody(response)
      expect(data.error).toBe('Unauthorized')
    })

    it('should pass headers to payload.auth', async () => {
      ;(createMarketingCheckout as jest.Mock).mockResolvedValue({
        provider: 'stripe',
        url: 'https://checkout.stripe.com/...',
      })

      const request = new NextRequest(new URL('http://localhost:3000/api/stripe/checkout-session'), {
        method: 'POST',
        body: JSON.stringify({
          successUrl: 'http://example.com/success',
          cancelUrl: 'http://example.com/cancel',
          priceId: 'price_123',
        }),
        headers: { cookie: 'auth=token' },
      })

      await POST(request)

      expect(mockPayload.auth).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.any(Object),
        }),
      )
    })
  })

  describe('User data retrieval', () => {
    it('should fetch full user data', async () => {
      ;(createMarketingCheckout as jest.Mock).mockResolvedValue({
        provider: 'stripe',
        url: 'https://checkout.stripe.com/...',
      })

      const request = new NextRequest(new URL('http://localhost:3000/api/stripe/checkout-session'), {
        method: 'POST',
        body: JSON.stringify({
          successUrl: 'http://example.com/success',
          cancelUrl: 'http://example.com/cancel',
          priceId: 'price_123',
        }),
      })

      await POST(request)

      expect(mockPayload.findById).toHaveBeenCalledWith({
        id: 'user-123',
        collection: 'users',
        depth: 0,
        overrideAccess: true,
      })
    })

    it('should handle missing stripe customer id', async () => {
      mockPayload.findById.mockResolvedValue({
        id: 'user-123',
        email: 'user@example.com',
      })

      ;(createMarketingCheckout as jest.Mock).mockResolvedValue({
        provider: 'stripe',
        url: 'https://checkout.stripe.com/...',
      })

      const request = new NextRequest(new URL('http://localhost:3000/api/stripe/checkout-session'), {
        method: 'POST',
        body: JSON.stringify({
          successUrl: 'http://example.com/success',
          cancelUrl: 'http://example.com/cancel',
          priceId: 'price_123',
        }),
      })

      await POST(request)

      expect(createMarketingCheckout).toHaveBeenCalledWith(
        expect.objectContaining({
          existingStripeCustomerId: undefined,
        }),
      )
    })

    it('should handle missing email', async () => {
      mockPayload.findById.mockResolvedValue({
        id: 'user-123',
        stripeCustomerId: 'cus_123',
      })

      ;(createMarketingCheckout as jest.Mock).mockResolvedValue({
        provider: 'stripe',
        url: 'https://checkout.stripe.com/...',
      })

      const request = new NextRequest(new URL('http://localhost:3000/api/stripe/checkout-session'), {
        method: 'POST',
        body: JSON.stringify({
          successUrl: 'http://example.com/success',
          cancelUrl: 'http://example.com/cancel',
          priceId: 'price_123',
        }),
      })

      await POST(request)

      expect(createMarketingCheckout).toHaveBeenCalledWith(
        expect.objectContaining({
          userEmail: undefined,
        }),
      )
    })
  })

  describe('Checkout creation', () => {
    it('should create Stripe checkout with priceId', async () => {
      ;(createMarketingCheckout as jest.Mock).mockResolvedValue({
        provider: 'stripe',
        url: 'https://checkout.stripe.com/...',
      })

      const request = new NextRequest(new URL('http://localhost:3000/api/stripe/checkout-session'), {
        method: 'POST',
        body: JSON.stringify({
          successUrl: 'http://example.com/success',
          cancelUrl: 'http://example.com/cancel',
          priceId: 'price_123',
        }),
      })

      await POST(request)

      expect(createMarketingCheckout).toHaveBeenCalledWith(
        expect.objectContaining({
          priceId: 'price_123',
          plan: undefined,
        }),
      )
    })

    it('should create Revolut checkout with plan', async () => {
      ;(createMarketingCheckout as jest.Mock).mockResolvedValue({
        provider: 'revolut',
        url: 'https://revolut.com/...',
      })

      const request = new NextRequest(new URL('http://localhost:3000/api/stripe/checkout-session'), {
        method: 'POST',
        body: JSON.stringify({
          successUrl: 'http://example.com/success',
          cancelUrl: 'http://example.com/cancel',
          plan: 'pro',
        }),
      })

      await POST(request)

      expect(createMarketingCheckout).toHaveBeenCalledWith(
        expect.objectContaining({
          plan: 'pro',
        }),
      )
    })

    it('should support all plan types', async () => {
      const plans = ['starter', 'pro', 'enterprise']

      for (const plan of plans) {
        jest.clearAllMocks()
        ;(getPayload as jest.Mock).mockResolvedValue(mockPayload)
        mockPayload.auth.mockResolvedValue({ user: { id: 'user-123' } })
        ;(createMarketingCheckout as jest.Mock).mockResolvedValue({
          provider: 'revolut',
          url: 'https://revolut.com/...',
        })

        const request = new NextRequest(new URL('http://localhost:3000/api/stripe/checkout-session'), {
          method: 'POST',
          body: JSON.stringify({
            successUrl: 'http://example.com/success',
            cancelUrl: 'http://example.com/cancel',
            plan,
          }),
        })

        const response = await POST(request)

        expect(response.status).toBe(200)
        expect(createMarketingCheckout).toHaveBeenCalledWith(
          expect.objectContaining({ plan }),
        )
      }
    })

    it('should pass URLs to checkout creation', async () => {
      ;(createMarketingCheckout as jest.Mock).mockResolvedValue({
        provider: 'stripe',
        url: 'https://checkout.stripe.com/...',
      })

      const successUrl = 'http://example.com/success'
      const cancelUrl = 'http://example.com/cancel'

      const request = new NextRequest(new URL('http://localhost:3000/api/stripe/checkout-session'), {
        method: 'POST',
        body: JSON.stringify({
          successUrl,
          cancelUrl,
          priceId: 'price_123',
        }),
      })

      await POST(request)

      expect(createMarketingCheckout).toHaveBeenCalledWith(
        expect.objectContaining({
          successUrl,
          cancelUrl,
        }),
      )
    })
  })

  describe('Response handling', () => {
    it('should return checkout URL on success', async () => {
      const checkoutUrl = 'https://checkout.stripe.com/pay/cs_test_123'
      ;(createMarketingCheckout as jest.Mock).mockResolvedValue({
        provider: 'stripe',
        url: checkoutUrl,
      })

      const request = new NextRequest(new URL('http://localhost:3000/api/stripe/checkout-session'), {
        method: 'POST',
        body: JSON.stringify({
          successUrl: 'http://example.com/success',
          cancelUrl: 'http://example.com/cancel',
          priceId: 'price_123',
        }),
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      const data = await readBody(response)
      expect(data.url).toBe(checkoutUrl)
      expect(data.provider).toBe('stripe')
    })

    it('should return error when checkout creation fails', async () => {
      ;(createMarketingCheckout as jest.Mock).mockResolvedValue({
        error: 'Invalid price ID',
      })

      const request = new NextRequest(new URL('http://localhost:3000/api/stripe/checkout-session'), {
        method: 'POST',
        body: JSON.stringify({
          successUrl: 'http://example.com/success',
          cancelUrl: 'http://example.com/cancel',
          priceId: 'invalid_price',
        }),
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
      const data = await readBody(response)
      expect(data.error).toBe('Invalid price ID')
    })

    it('should handle Revolut checkout response', async () => {
      ;(createMarketingCheckout as jest.Mock).mockResolvedValue({
        provider: 'revolut',
        url: 'https://revolut.com/pay/123',
      })

      const request = new NextRequest(new URL('http://localhost:3000/api/stripe/checkout-session'), {
        method: 'POST',
        body: JSON.stringify({
          successUrl: 'http://example.com/success',
          cancelUrl: 'http://example.com/cancel',
          plan: 'pro',
        }),
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      const data = await readBody(response)
      expect(data.provider).toBe('revolut')
    })
  })

  describe('Integration scenarios', () => {
    it('should handle complete checkout flow for Stripe', async () => {
      ;(createMarketingCheckout as jest.Mock).mockResolvedValue({
        provider: 'stripe',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
      })

      const request = new NextRequest(new URL('http://localhost:3000/api/stripe/checkout-session'), {
        method: 'POST',
        body: JSON.stringify({
          successUrl: 'http://example.com/success',
          cancelUrl: 'http://example.com/cancel',
          priceId: 'price_pro_annual',
        }),
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      const data = await readBody(response)

      expect(mockPayload.auth).toHaveBeenCalled()
      expect(mockPayload.findById).toHaveBeenCalled()
      expect(createMarketingCheckout).toHaveBeenCalled()
      expect(data.url).toBeDefined()
      expect(data.provider).toBe('stripe')
    })

    it('should handle complete checkout flow for Revolut plan', async () => {
      ;(createMarketingCheckout as jest.Mock).mockResolvedValue({
        provider: 'revolut',
        url: 'https://revolut.com/pay/order_123',
      })

      const request = new NextRequest(new URL('http://localhost:3000/api/stripe/checkout-session'), {
        method: 'POST',
        body: JSON.stringify({
          successUrl: 'http://example.com/dashboard',
          cancelUrl: 'http://example.com/pricing',
          plan: 'enterprise',
        }),
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      const data = await readBody(response)

      expect(data.url).toBeDefined()
      expect(data.provider).toBe('revolut')
      expect(createMarketingCheckout).toHaveBeenCalledWith(
        expect.objectContaining({
          plan: 'enterprise',
          payloadUserId: 'user-123',
          userEmail: 'user@example.com',
        }),
      )
    })

    it('should handle multiple checkout requests for same user', async () => {
      ;(createMarketingCheckout as jest.Mock).mockResolvedValue({
        provider: 'stripe',
        url: 'https://checkout.stripe.com/...',
      })

      const priceIds = ['price_basic', 'price_pro', 'price_enterprise']

      for (const priceId of priceIds) {
        const request = new NextRequest(
          new URL('http://localhost:3000/api/stripe/checkout-session'),
          {
            method: 'POST',
            body: JSON.stringify({
              successUrl: 'http://example.com/success',
              cancelUrl: 'http://example.com/cancel',
              priceId,
            }),
          },
        )

        const response = await POST(request)

        expect(response.status).toBe(200)
      }

      expect(createMarketingCheckout).toHaveBeenCalledTimes(3)
    })
  })
})
