import type { CollectionConfig } from 'payload'

/**
 * Local billing mirror for provider subscriptions (Stripe/Revolut). Written as the CMS
 * "source of truth" by `src/plugins/payments/services/subscriptionService.ts`.
 */
export const Subscriptions: CollectionConfig = {
  slug: 'subscriptions',
  admin: {
    defaultColumns: ['externalId', 'team', 'plan', 'status'],
    group: 'Billing',
    useAsTitle: 'externalId',
  },
  fields: [
    { name: 'team', type: 'text', index: true, required: true },
    { name: 'plan', type: 'text', required: true },
    { name: 'externalId', type: 'text', index: true, required: true },
    {
      name: 'status',
      type: 'select',
      options: [
        'active',
        'past_due',
        'incomplete',
        'incomplete_expired',
        'trialing',
        'succeeded',
        'canceled',
      ],
      required: true,
    },
    { name: 'currentPeriodStart', type: 'date', required: true },
    { name: 'currentPeriodEnd', type: 'date', required: true },
    { name: 'cancelAtPeriodEnd', type: 'checkbox', defaultValue: false },
    { name: 'freeTrial', type: 'checkbox', defaultValue: false },
  ],
}
