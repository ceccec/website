import type { Plugin } from 'payload'

import {
  revalidateRedirects,
  revalidateRedirectsAfterDelete,
} from '@hooks/revalidateRedirects'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'

export const redirects: Plugin = redirectsPlugin({
  collections: ['case-studies', 'pages', 'posts'],
  overrides: {
    hooks: {
      afterChange: [revalidateRedirects],
      afterDelete: [revalidateRedirectsAfterDelete],
    },
  },
})
