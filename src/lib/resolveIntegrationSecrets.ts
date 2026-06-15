import type { IntegrationSecret } from '@types'
import type { Payload } from 'payload'

import { INTEGRATION_SECRETS_SLUG } from '@root/globals/globalSlugs'

import { resolveGlobalField, resolveGlobalFieldChain } from './resolveGlobalField'

export type ResolvedIntegrationSecrets = {
  algoliaAdminApiKey: string
  cronSecret: string
  hubspotPortalKey: string
  recaptchaSecretKey: string
  revalidationKey: string
}

/**
 * Loads the `integration-secrets` global with `overrideAccess` for server-side hooks and jobs.
 * Env vars remain the fallback when a field is empty.
 */
export async function resolveIntegrationSecrets(payload: Payload): Promise<ResolvedIntegrationSecrets> {
  const doc = await payload.findGlobal({
    slug: INTEGRATION_SECRETS_SLUG,
    depth: 0,
    overrideAccess: true,
  })
  const globalDoc: Partial<IntegrationSecret> =
    doc && typeof doc === 'object' ? (doc) : {}

  return {
    algoliaAdminApiKey: resolveGlobalField(
      globalDoc.algoliaAdminApiKey,
      process.env.NEXT_PRIVATE_ALGOLIA_API_KEY,
    ),
    cronSecret: resolveGlobalFieldChain(
      globalDoc.cronSecret,
      process.env.NEXT_PRIVATE_CRON_KEY,
      process.env.CRON_SECRET,
    ),
    hubspotPortalKey: resolveGlobalField(
      globalDoc.hubspotPortalKey,
      process.env.NEXT_PRIVATE_HUBSPOT_PORTAL_KEY,
    ),
    recaptchaSecretKey: resolveGlobalField(
      globalDoc.recaptchaSecretKey,
      process.env.NEXT_PRIVATE_RECAPTCHA_SECRET_KEY,
    ),
    revalidationKey: resolveGlobalField(
      globalDoc.revalidationKey,
      process.env.NEXT_PRIVATE_REVALIDATION_KEY,
    ),
  }
}
