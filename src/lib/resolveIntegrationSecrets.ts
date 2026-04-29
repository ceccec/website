import type { IntegrationSecret } from '@types'
import type { Payload } from 'payload'

export type ResolvedIntegrationSecrets = {
  algoliaAdminApiKey: string
  cronSecret: string
  hubspotPortalKey: string
  recaptchaSecretKey: string
  revalidationKey: string
}

function pick(v: unknown, env: string | undefined): string {
  if (typeof v === 'string' && v.trim()) {
    return v.trim()
  }
  return env?.trim() || ''
}

/**
 * Loads the `integration-secrets` global with `overrideAccess` for server-side hooks and jobs.
 * Env vars remain the fallback when a field is empty.
 */
export async function resolveIntegrationSecrets(payload: Payload): Promise<ResolvedIntegrationSecrets> {
  const doc = await payload.findGlobal({
    slug: 'integration-secrets',
    depth: 0,
    overrideAccess: true,
  })
  const g: Partial<IntegrationSecret> =
    doc && typeof doc === 'object' ? (doc as IntegrationSecret) : {}

  return {
    hubspotPortalKey: pick(g.hubspotPortalKey, process.env.NEXT_PRIVATE_HUBSPOT_PORTAL_KEY),
    recaptchaSecretKey: pick(g.recaptchaSecretKey, process.env.NEXT_PRIVATE_RECAPTCHA_SECRET_KEY),
    algoliaAdminApiKey: pick(g.algoliaAdminApiKey, process.env.NEXT_PRIVATE_ALGOLIA_API_KEY),
    revalidationKey: pick(g.revalidationKey, process.env.NEXT_PRIVATE_REVALIDATION_KEY),
    cronSecret: pick(
      g.cronSecret,
      process.env.NEXT_PRIVATE_CRON_KEY || process.env.CRON_SECRET,
    ),
  }
}
