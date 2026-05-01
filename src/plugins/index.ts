import type { DeploymentRuntimeOptions } from '@root/lib/deploymentTarget'
import type { Plugin } from 'payload'

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

import { googleAnalytics } from '@zubricks/plugin-google-analytics'

import { adminListSearchPlugin } from './adminListSearch'
import { googleAnalyticsConfig } from './google-analytics/config'
import { getPaymentProvider } from './payments'
import { opsCounter } from './opsCounter'
import { opsCounterConfig } from './opsCounter/config'
import { getOptionalOfficialPlugins } from './optionalOfficialPlugins'
import { getSchemaPlugins } from './schema'
import { website } from './website'

export type { DeploymentRuntimeOptions } from '@root/lib/deploymentTarget'
export { getPaymentProvider } from './payments'
export type { PaymentProvider } from './payments'

export type GetPluginsOptions = DeploymentRuntimeOptions

/**
 * Plugin pipeline: schema (blocks + collections + globals + REST routes), optional
 * `@payloadcms/*` integrations, website bundle (`seo`, nested docs, forms, storage),
 * then hooks/analytics last so `opsCounter` sees every collection.
 *
 * Called once when Payload builds config — keep factories cheap; heavy work belongs in
 * hooks/tasks (`payload-hooks.mdc`, `payload-performance.mdc`).
 *
 * @see https://payloadcms.com/docs/hooks/overview
 */
export function getPlugins(opts: GetPluginsOptions): Plugin[] {
  const schema = getSchemaPlugins()
  const optional = getOptionalOfficialPlugins()
  const site = website(opts)
  return [
    ...schema,
    ...optional,
    ...site,
    adminListSearchPlugin(),
    opsCounter(opsCounterConfig),
    googleAnalytics(googleAnalyticsConfig),
  ]
}
