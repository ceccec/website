import type { GlobalConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'

import { revalidateTagImmediate } from '../utilities/revalidateTagImmediate'

/**
 * Non-secret site configuration editable in Admin without redeploying.
 * `access.read` is open so server components can merge these with env (env wins when empty).
 * Do not store secrets here — use `integration-secrets`.
 */
export const PublicSiteSettings: GlobalConfig = {
  slug: 'public-site-settings',
  label: 'Public site settings',
  admin: {
    description:
      'URLs, analytics IDs, and Algolia search-app settings. Leave blank to use environment variables. This global is readable anonymously for public pages; keep secrets in **Integration secrets**.',
    group: 'Site',
  },
  access: {
    read: () => true,
    update: isAdmin,
  },
  hooks: {
    afterChange: [
      () => {
        revalidateTagImmediate('global-public-site-settings')
      },
    ],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'URLs',
          fields: [
            {
              name: 'siteUrl',
              type: 'text',
              label: 'Canonical site URL',
              admin: {
                description: 'Overrides `NEXT_PUBLIC_SITE_URL` / metadata base when set.',
              },
            },
            {
              name: 'cmsUrl',
              type: 'text',
              label: 'CMS public URL',
              admin: {
                description: 'Overrides `NEXT_PUBLIC_CMS_URL` for media and API links when set.',
              },
            },
            {
              name: 'cloudCmsUrl',
              type: 'text',
              label: 'Payload Cloud API URL',
              admin: {
                description: 'Overrides `NEXT_PUBLIC_CLOUD_CMS_URL` for Cloud onboarding when set.',
              },
            },
          ],
        },
        {
          label: 'Analytics & tags',
          fields: [
            {
              name: 'gaMeasurementId',
              type: 'text',
              label: 'Google Analytics measurement ID',
              admin: { description: 'Overrides `NEXT_PUBLIC_GA_MEASUREMENT_ID` when set.' },
            },
            {
              name: 'gtmContainerId',
              type: 'text',
              label: 'Google Tag Manager container ID',
              admin: { description: 'Overrides `NEXT_PUBLIC_GTM_MEASUREMENT_ID` when set.' },
            },
            {
              name: 'facebookPixelId',
              type: 'text',
              label: 'Meta / Facebook Pixel ID',
              admin: { description: 'Overrides `NEXT_PUBLIC_FACEBOOK_PIXEL_ID` when set.' },
            },
          ],
        },
        {
          label: 'Docs & search',
          fields: [
            {
              name: 'enableBetaDocs',
              type: 'checkbox',
              defaultValue: false,
              label: 'Enable beta docs surfaces',
              admin: { description: 'Overrides `NEXT_PUBLIC_ENABLE_BETA_DOCS` when checked.' },
            },
            {
              name: 'enableLegacyDocs',
              type: 'checkbox',
              defaultValue: false,
              label: 'Enable legacy (v2) docs routes',
              admin: { description: 'Overrides `NEXT_PUBLIC_ENABLE_LEGACY_DOCS` when checked.' },
            },
            {
              name: 'newsletterFormId',
              type: 'text',
              label: 'Newsletter form ID',
              admin: { description: 'Overrides `NEXT_PUBLIC_NEWSLETTER_FORM_ID` when set.' },
            },
            {
              name: 'recaptchaSiteKey',
              type: 'text',
              label: 'reCAPTCHA site key (public)',
              admin: { description: 'Overrides `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` when set.' },
            },
            {
              name: 'algoliaApplicationId',
              type: 'text',
              label: 'Algolia application ID (community help)',
              admin: { description: 'Overrides `NEXT_PUBLIC_ALGOLIA_CH_ID` when set.' },
            },
            {
              name: 'algoliaCommunityIndexName',
              type: 'text',
              label: 'Algolia community help index name',
              admin: { description: 'Overrides `NEXT_PUBLIC_ALGOLIA_CH_INDEX_NAME` when set.' },
            },
            {
              name: 'algoliaDocsearchKey',
              type: 'text',
              label: 'Algolia Docsearch API key (search-only)',
              admin: { description: 'Overrides `NEXT_PUBLIC_ALGOLIA_DOCSEARCH_KEY` for the header doc search.' },
            },
          ],
        },
      ],
    },
  ],
}
