import type { Plugin } from 'payload'

import { Docs } from '@root/collections/Docs'
import { refreshMdxToLexical, syncDocs } from '@root/scripts/syncDocs'

import { docsTemplateEnabled } from '../env'

import { conditionalSchemaPlugin } from '../lib/conditionalSchemaPlugin'

/** Documentation collection + MDX / content sync routes. */
export const docsPlugin: Plugin = conditionalSchemaPlugin(docsTemplateEnabled, (config) => ({
  ...config,
  collections: [...(config.collections ?? []), Docs],
  endpoints: [
    ...(config.endpoints ?? []),
    { handler: syncDocs, method: 'get', path: '/sync/docs' },
    { handler: refreshMdxToLexical, method: 'get', path: '/refresh/mdx-to-lexical' },
  ],
}))
