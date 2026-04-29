/**
 * Derived from Payload monorepo `templates/with-vercel-website/src/utilities/getURL.ts`.
 * Env names extended for this repo (`PAYLOAD_PUBLIC_APP_URL`, `NEXT_PUBLIC_SITE_URL`).
 *
 * @see https://github.com/payloadcms/payload/tree/main/templates/with-vercel-website
 */
export function getServerSideURL(): string {
  return (
    process.env.PAYLOAD_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_SERVER_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : '') ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
    'http://local.payloadcms.com:3000'
  )
}
