/**
 * Optional Payload packages lazy-loaded via `src/lib/nodeRequire.ts` on Node/Vercel only.
 * Keep in sync with `webpack.IgnorePlugin` in `next.config.js` (inner OpenNext + cloudflare target).
 */
export const OPENNEXT_CLOUDFLARE_IGNORED_OPTIONAL_PAYLOAD_PACKAGES = [
  '@payloadcms/db-mongodb',
  '@payloadcms/db-postgres',
  '@payloadcms/storage-s3',
  '@payloadcms/storage-vercel-blob',
]
