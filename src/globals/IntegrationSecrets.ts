import type { GlobalConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'

import { revalidateTagImmediate } from '../utilities/revalidateTagImmediate'

/**
 * Third-party API keys and internal secrets — admin-only read/write.
 * Resolved at runtime with `overrideAccess` in server hooks (never sent to anonymous clients).
 */
export const IntegrationSecrets: GlobalConfig = {
  slug: 'integration-secrets',
  label: 'Integration secrets',
  admin: {
    description:
      'HubSpot, Algolia admin key, reCAPTCHA secret, ISR revalidation key, cron/JWT helpers. Leave blank to use Worker/env vars. Only users with the **admin** role can view or edit.',
    group: 'Site',
  },
  access: {
    read: isAdmin,
    update: isAdmin,
  },
  hooks: {
    afterChange: [
      () => {
        revalidateTagImmediate('global-integration-secrets')
      },
    ],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Forms & CRM',
          fields: [
            {
              name: 'hubspotPortalKey',
              type: 'text',
              label: 'HubSpot portal ID',
              admin: { description: 'Overrides `NEXT_PRIVATE_HUBSPOT_PORTAL_KEY` when set.' },
            },
            {
              name: 'recaptchaSecretKey',
              type: 'text',
              label: 'reCAPTCHA secret key',
              admin: { description: 'Overrides `NEXT_PRIVATE_RECAPTCHA_SECRET_KEY` when set.' },
            },
          ],
        },
        {
          label: 'Search & cache',
          fields: [
            {
              name: 'algoliaAdminApiKey',
              type: 'text',
              label: 'Algolia admin API key',
              admin: { description: 'Overrides `NEXT_PRIVATE_ALGOLIA_API_KEY` when set.' },
            },
            {
              name: 'revalidationKey',
              type: 'text',
              label: 'On-demand revalidation secret',
              admin: { description: 'Overrides `NEXT_PRIVATE_REVALIDATION_KEY` when set.' },
            },
          ],
        },
        {
          label: 'Jobs & automation',
          fields: [
            {
              name: 'cronSecret',
              type: 'text',
              label: 'Cron / jobs bearer secret',
              admin: {
                description: 'Overrides `NEXT_PRIVATE_CRON_KEY` / `CRON_SECRET` when set.',
              },
            },
          ],
        },
      ],
    },
  ],
}
