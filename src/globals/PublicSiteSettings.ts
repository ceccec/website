import type { GlobalConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'
import { revalidateTagImmediate } from '../utilities/revalidateTagImmediate'
import { PUBLIC_SITE_SETTINGS_SLUG } from './globalSlugs'

/**
 * Non-secret site configuration editable in Admin without redeploying.
 * `access.read` is open so server components can merge these with env (globals win when non-empty).
 * Do not store secrets here — use `integration-secrets`.
 */
export const PublicSiteSettings: GlobalConfig = {
  slug: PUBLIC_SITE_SETTINGS_SLUG,
  access: {
    read: () => true,
    update: isAdmin,
  },
  admin: {
    description:
      'Preferred place for site URLs and public analytics/search IDs after deploy — no Worker redeploy. Overrides environment variables when set. Same keys as optional **NEXT_PUBLIC_*** Worker vars; use Globals for day-to-day edits. This global is readable anonymously for public pages; keep secrets in **Integration secrets**.',
    group: 'Site',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          fields: [
            {
              name: 'siteUrl',
              type: 'text',
              admin: {
                description: 'Overrides `NEXT_PUBLIC_SITE_URL` / metadata base when set.',
              },
              label: 'Canonical site URL',
            },
            {
              name: 'cmsUrl',
              type: 'text',
              admin: {
                description: 'Overrides `NEXT_PUBLIC_CMS_URL` for media and API links when set.',
              },
              label: 'CMS public URL',
            },
            {
              name: 'cloudCmsUrl',
              type: 'text',
              admin: {
                description: 'Overrides `NEXT_PUBLIC_CLOUD_CMS_URL` for Cloud onboarding when set.',
              },
              label: 'Payload Cloud API URL',
            },
          ],
          label: 'URLs',
        },
        {
          fields: [
            {
              name: 'gaMeasurementId',
              type: 'text',
              admin: { description: 'Overrides `NEXT_PUBLIC_GA_MEASUREMENT_ID` when set.' },
              label: 'Google Analytics measurement ID',
            },
            {
              name: 'gtmContainerId',
              type: 'text',
              admin: { description: 'Overrides `NEXT_PUBLIC_GTM_MEASUREMENT_ID` when set.' },
              label: 'Google Tag Manager container ID',
            },
            {
              name: 'facebookPixelId',
              type: 'text',
              admin: { description: 'Overrides `NEXT_PUBLIC_FACEBOOK_PIXEL_ID` when set.' },
              label: 'Meta / Facebook Pixel ID',
            },
          ],
          label: 'Analytics & tags',
        },
        {
          fields: [
            {
              name: 'enableBetaDocs',
              type: 'checkbox',
              admin: { description: 'Overrides `NEXT_PUBLIC_ENABLE_BETA_DOCS` when checked.' },
              defaultValue: false,
              label: 'Enable beta docs surfaces',
            },
            {
              name: 'enableLegacyDocs',
              type: 'checkbox',
              admin: { description: 'Overrides `NEXT_PUBLIC_ENABLE_LEGACY_DOCS` when checked.' },
              defaultValue: false,
              label: 'Enable legacy (v2) docs routes',
            },
            {
              name: 'newsletterFormId',
              type: 'text',
              admin: { description: 'Overrides `NEXT_PUBLIC_NEWSLETTER_FORM_ID` when set.' },
              label: 'Newsletter form ID',
            },
            {
              name: 'recaptchaSiteKey',
              type: 'text',
              admin: { description: 'Overrides `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` when set.' },
              label: 'reCAPTCHA site key (public)',
            },
            {
              name: 'algoliaApplicationId',
              type: 'text',
              admin: { description: 'Overrides `NEXT_PUBLIC_ALGOLIA_CH_ID` when set.' },
              label: 'Algolia application ID (community help)',
            },
            {
              name: 'algoliaCommunityIndexName',
              type: 'text',
              admin: { description: 'Overrides `NEXT_PUBLIC_ALGOLIA_CH_INDEX_NAME` when set.' },
              label: 'Algolia community help index name',
            },
            {
              name: 'algoliaDocsearchKey',
              type: 'text',
              admin: { description: 'Overrides `NEXT_PUBLIC_ALGOLIA_DOCSEARCH_KEY` for the header doc search.' },
              label: 'Algolia Docsearch API key (search-only)',
            },
          ],
          label: 'Docs & search',
        },
      ],
    },
  ],
  hooks: {
    afterChange: [
      () => {
        revalidateTagImmediate('global-public-site-settings')
      },
    ],
  },
  label: 'Public site settings',
}
