import { commaSeparatedEnv } from '@root/lib/commaEnv'
import { getServerSideURL } from '@root/utilities/getURL'

/**
 * CORS + CSRF allowlist (examples/auth + website templates).
 * Optional comma-separated full origins for live preview / draft UI when they differ from the main site (`payload-security-deployment`).
 */
export function getTrustedOrigins(): string[] {
  return [
    ...new Set(
      [
        getServerSideURL(),
        ...commaSeparatedEnv(process.env.PAYLOAD_CORS_ORIGINS),
        process.env.PAYLOAD_PUBLIC_APP_URL || '',
        ...commaSeparatedEnv(process.env.PAYLOAD_TRUSTED_PREVIEW_ORIGINS),
        'https://payloadcms.com',
        'https://discord.com/api',
      ].filter(Boolean),
    ),
  ]
}
