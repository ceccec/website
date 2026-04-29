/**
 * Feature flags aligned with Payload `examples/*` and `templates/*`, plus
 * optional content slices. Set a var to `false` to turn a slice off (default: on).
 */

/** Template slice defaults: unset env → feature **on**; explicit `false` turns off. */
function templateSliceEnabled(key: string): boolean {
  const v = process.env[key]
  return v !== 'false'
}

/** Opt-in plugins: unset → **off**; must be `'true'` to enable. */
function explicitTrue(key: string): boolean {
  return process.env[key] === 'true'
}

export function multiTenantEnabled(): boolean {
  return explicitTrue('PAYLOAD_MULTI_TENANT')
}

export function ecommerceEnabled(): boolean {
  return explicitTrue('PAYLOAD_ECOMMERCE')
}

export function ecommerceVariantsEnabled(): boolean {
  return ecommerceEnabled() && explicitTrue('PAYLOAD_ECOMMERCE_VARIANTS')
}

export function mcpEnabled(): boolean {
  return explicitTrue('PAYLOAD_MCP')
}

/** `templates/website` marketing collections: posts, case studies, community, categories. */
export function marketingContentEnabled(): boolean {
  return templateSliceEnabled('PAYLOAD_TEMPLATE_MARKETING')
}

/** Docs collection, doc blocks, MDX / sync endpoints (docs site template). */
export function docsTemplateEnabled(): boolean {
  return templateSliceEnabled('PAYLOAD_TEMPLATE_DOCS')
}

/** Partners, program global, filter collections. */
export function partnersTemplateEnabled(): boolean {
  return templateSliceEnabled('PAYLOAD_TEMPLATE_PARTNERS')
}

/** Redeploy + release-post admin/CI endpoints (not documentation sync). */
export function releaseAutomationEnabled(): boolean {
  return templateSliceEnabled('PAYLOAD_TEMPLATE_RELEASE_AUTOMATION')
}
