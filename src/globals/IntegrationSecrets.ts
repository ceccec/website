import type { GlobalConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'
import { revalidateTagImmediate } from '../utilities/revalidateTagImmediate'
import { INTEGRATION_SECRETS_SLUG } from './globalSlugs'

/**
 * Third-party API keys and internal secrets — admin-only read/write.
 * Resolved at runtime with `overrideAccess` in server hooks (never sent to anonymous clients).
 */
export const IntegrationSecrets: GlobalConfig = {
  slug: INTEGRATION_SECRETS_SLUG,
  access: {
    read: isAdmin,
    update: isAdmin,
  },
  admin: {
    description:
      'Preferred place for integration secrets after deploy (no redeploy). Overrides Worker **NEXT_PRIVATE_*** / **CRON_SECRET** when set. Use one-click Worker env only for bootstrap or secrets that must stay outside Admin.',
    group: 'Site',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          fields: [
            {
              name: 'hubspotPortalKey',
              type: 'text',
              admin: { description: 'Overrides `NEXT_PRIVATE_HUBSPOT_PORTAL_KEY` when set.' },
              label: 'HubSpot portal ID',
            },
            {
              name: 'recaptchaSecretKey',
              type: 'text',
              admin: { description: 'Overrides `NEXT_PRIVATE_RECAPTCHA_SECRET_KEY` when set.' },
              label: 'reCAPTCHA secret key',
            },
          ],
          label: 'Forms & CRM',
        },
        {
          fields: [
            {
              name: 'algoliaAdminApiKey',
              type: 'text',
              admin: { description: 'Overrides `NEXT_PRIVATE_ALGOLIA_API_KEY` when set.' },
              label: 'Algolia admin API key',
            },
            {
              name: 'revalidationKey',
              type: 'text',
              admin: { description: 'Overrides `NEXT_PRIVATE_REVALIDATION_KEY` when set.' },
              label: 'On-demand revalidation secret',
            },
          ],
          label: 'Search & cache',
        },
        {
          fields: [
            {
              name: 'cronSecret',
              type: 'text',
              admin: {
                description: 'Overrides `NEXT_PRIVATE_CRON_KEY` / `CRON_SECRET` when set.',
              },
              label: 'Cron / jobs bearer secret',
            },
          ],
          label: 'Jobs & automation',
        },
      ],
    },
  ],
  hooks: {
    afterChange: [
      () => {
        revalidateTagImmediate('global-integration-secrets')
      },
    ],
  },
  label: 'Integration secrets',
}
