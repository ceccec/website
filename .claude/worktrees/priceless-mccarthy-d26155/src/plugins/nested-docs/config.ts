import type { Plugin } from 'payload'

import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'

export const nestedDocs: Plugin = nestedDocsPlugin({
  collections: ['pages'],
  generateLabel: (_, doc) => doc.title as string,
  generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug as string}`, ''),
})
