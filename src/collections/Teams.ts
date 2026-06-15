import type { CollectionConfig } from 'payload'

/**
 * Local billing mirror for a team's payment state (distinct from the external Payload Cloud
 * `Team` in `payload-cloud-types.ts`). Read/written by the payments `paymentMethodService`.
 */
export const Teams: CollectionConfig = {
  slug: 'teams',
  admin: {
    group: 'Billing',
    useAsTitle: 'name',
  },
  fields: [
    { name: 'name', type: 'text' },
    { name: 'defaultPaymentMethod', type: 'text' },
    { name: 'stripeCustomer', type: 'text' },
  ],
}
