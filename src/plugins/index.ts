import type { CloudflareContext } from '@opennextjs/cloudflare'
import type { DeploymentTarget } from '@root/lib/deploymentTarget'
import type { Plugin } from 'payload'

import { googleAnalytics } from '@zubricks/plugin-google-analytics'

import { ecommerce } from './ecommerce'
import { googleAnalyticsConfig } from './google-analytics/config'
import { mcp } from './mcp'
import { multiTenant } from './multi-tenant'
import { opsCounter } from './opsCounter'
import { opsCounterConfig } from './opsCounter/config'
import { getSchemaPlugins } from './schema'
import { website } from './website'

export {
  docsTemplateEnabled,
  ecommerceEnabled,
  ecommerceVariantsEnabled,
  marketingContentEnabled,
  mcpEnabled,
  multiTenantEnabled,
  partnersTemplateEnabled,
  releaseAutomationEnabled,
} from './env'

export type GetPluginsOptions = {
  cloudflare: CloudflareContext | undefined
  deploymentTarget: DeploymentTarget
}

/**
 * Plugin pipeline: schema (blocks + collections + globals + REST routes), optional
 * `@payloadcms/*` integrations, website bundle (`seo`, nested docs, forms, storage),
 * then hooks/analytics last so `opsCounter` sees every collection.
 *
 * @see https://payloadcms.com/docs/hooks/overview
 */
export function getPlugins(opts: GetPluginsOptions): Plugin[] {
  const plugins: Plugin[] = [...getSchemaPlugins()]

  const mcpPlugin = mcp()
  if (mcpPlugin) {plugins.push(mcpPlugin)}

  const multiTenantPlugin = multiTenant()
  if (multiTenantPlugin) {plugins.push(multiTenantPlugin)}

  const ecommercePlugin = ecommerce()
  if (ecommercePlugin) {plugins.push(ecommercePlugin)}

  plugins.push(...website(opts))

  plugins.push(opsCounter(opsCounterConfig))
  plugins.push(googleAnalytics(googleAnalyticsConfig))

  return plugins
}
