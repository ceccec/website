import { resolveFirstEnvValue } from './resolveGlobalField'

export type ResolvedIntegrationSecrets = {
  algoliaAdminApiKey: string
  cronSecret: string
  hubspotPortalKey: string
  recaptchaSecretKey: string
  revalidationKey: string
}

/**
 * Third-party and internal secrets — **environment only** (Worker / Vercel / `.env`), not the CMS.
 * @see .env.example — `NEXT_PRIVATE_*`, `CRON_SECRET`.
 */
export async function resolveIntegrationSecrets(): Promise<ResolvedIntegrationSecrets> {
  return {
    algoliaAdminApiKey: process.env.NEXT_PRIVATE_ALGOLIA_API_KEY?.trim() ?? '',
    cronSecret: resolveFirstEnvValue(
      process.env.NEXT_PRIVATE_CRON_KEY,
      process.env.CRON_SECRET,
    ),
    hubspotPortalKey: process.env.NEXT_PRIVATE_HUBSPOT_PORTAL_KEY?.trim() ?? '',
    recaptchaSecretKey: process.env.NEXT_PRIVATE_RECAPTCHA_SECRET_KEY?.trim() ?? '',
    revalidationKey: process.env.NEXT_PRIVATE_REVALIdATION_KEY?.trim() ?? '',
  }
}
