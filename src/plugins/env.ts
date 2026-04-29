/**
 * Feature flags aligned with Payload `examples/*` and `templates/*`, plus
 * optional content slices. Set a var to `false` to turn a slice off (default: on).
 */

export function multiTenantEnabled(): boolean {
  return process.env.PAYLOAD_MULTI_TENANT === 'true'
}

export function ecommerceEnabled(): boolean {
  return process.env.PAYLOAD_ECOMMERCE === 'true'
}

export function ecommerceVariantsEnabled(): boolean {
  return ecommerceEnabled() && process.env.PAYLOAD_ECOMMERCE_VARIANTS === 'true'
}

export function mcpEnabled(): boolean {
  return process.env.PAYLOAD_MCP === 'true'
}

/** `templates/website` marketing collections: posts, case studies, community, categories. */
export function marketingContentEnabled(): boolean {
  return process.env.PAYLOAD_TEMPLATE_MARKETING !== 'false'
}

/** Docs collection, doc blocks, MDX / sync endpoints (docs site template). */
export function docsTemplateEnabled(): boolean {
  return process.env.PAYLOAD_TEMPLATE_DOCS !== 'false'
}

/** Partners, program global, filter collections. */
export function partnersTemplateEnabled(): boolean {
  return process.env.PAYLOAD_TEMPLATE_PARTNERS !== 'false'
}

/** Redeploy + release-post admin/CI endpoints (not documentation sync). */
export function releaseAutomationEnabled(): boolean {
  return process.env.PAYLOAD_TEMPLATE_RELEASE_AUTOMATION !== 'false'
}
