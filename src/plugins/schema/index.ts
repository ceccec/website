import type { Plugin } from 'payload'

import { automationPlugin } from './automationPlugin'
import { corePlugin } from './corePlugin'
import { docsPlugin } from './docsPlugin'
import { layoutBlocksPlugin } from './layoutBlocksPlugin'
import { marketingPlugin } from './marketingPlugin'
import { pagesPlugin } from './pagesPlugin'
import { partnersPlugin } from './partnersPlugin'
import { tenantsPlugin } from './tenantsPlugin'

/**
 * Registers blocks + collections + globals + REST endpoints in dependency order.
 * Runs before official `@payloadcms/*` plugins and the website bundle (`seo`, nested docs, …).
 */
export function getSchemaPlugins(): Plugin[] {
  return [
    layoutBlocksPlugin,
    tenantsPlugin,
    corePlugin,
    marketingPlugin,
    docsPlugin,
    partnersPlugin,
    pagesPlugin,
    automationPlugin,
  ]
}
