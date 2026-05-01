import type { Plugin } from 'payload'

import { ecommerce } from './ecommerce'
import { mcp } from './mcp'
import { multiTenant } from './multi-tenant'

/** Optional `@payloadcms/*` first-party plugins (MCP, multi-tenant, ecommerce) based on env. */
export function getOptionalOfficialPlugins(): Plugin[] {
  return [mcp(), multiTenant(), ecommerce()].filter((p): p is Plugin => p != null)
}
