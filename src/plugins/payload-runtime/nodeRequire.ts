import { createRequire } from 'node:module'

/**
 * Shared Node `require` for optional Payload packages loaded only on non–Cloudflare Workers
 * targets. Cloudflare OpenNext builds omit those modules via `webpack.IgnorePlugin` using the
 * same package list as `scripts/lib/opennextCloudflareIgnoredPayloadPackages.mjs`.
 */
export const nodeRequire = createRequire(import.meta.url)
