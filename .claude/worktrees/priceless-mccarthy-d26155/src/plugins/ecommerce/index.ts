import type { PaymentAdapter } from '@payloadcms/plugin-ecommerce/types'
import type { Plugin } from 'payload'

import { ecommercePlugin } from '@payloadcms/plugin-ecommerce'
import { stripeAdapter } from '@payloadcms/plugin-ecommerce/payments/stripe'

import { ecommerceEnabled, ecommerceVariantsEnabled } from '../env'
import { buildEcommercePluginConfig } from './config'

export { buildEcommercePluginConfig } from './config'

/** `templates/ecommerce` — Stripe adapter optional until keys are set. */
export function ecommerce(): null | Plugin {
  if (!ecommerceEnabled()) {return null}

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY?.trim()
  const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim()
  const stripeWebhookSecret =
    process.env.STRIPE_WEBHOOK_SECRET?.trim() || process.env.STRIPE_WEBHOOKS_SIGNING_SECRET?.trim()

  const stripe: null | PaymentAdapter =
    stripeSecretKey && stripePublishableKey
      ? stripeAdapter({
          publishableKey: stripePublishableKey,
          secretKey: stripeSecretKey,
          ...(stripeWebhookSecret ? { webhookSecret: stripeWebhookSecret } : {}),
        })
      : null

  return ecommercePlugin(
    buildEcommercePluginConfig({
      ecommerceVariantsEnabled: ecommerceVariantsEnabled(),
      stripeAdapter: stripe,
    }),
  )
}
