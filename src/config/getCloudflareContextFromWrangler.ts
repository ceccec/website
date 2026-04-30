import type { CloudflareContext } from '@opennextjs/cloudflare'
import type { GetPlatformProxyOptions } from 'wrangler'

import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
/** Slim Wrangler config (D1+R2, no DO queue) — use for Payload CLI so workerd does not load OpenNext’s DO before `.open-next/worker.js` exists. */
export const WRANGLER_PAYLOAD_CLI_CONFIG = path.resolve(here, '../../wrangler.payload-cli.jsonc')

/**
 * @param configPath - Optional; default discovers `wrangler.jsonc` (full OpenNext stack). For Payload CLI, pass `WRANGLER_PAYLOAD_CLI_CONFIG`.
 */
export function getCloudflareContextFromWrangler(configPath?: string): Promise<CloudflareContext> {
  return import(/* webpackIgnore: true */ `${'__wrangler'.replaceAll('_', '')}`).then(
    ({ getPlatformProxy }) =>
      getPlatformProxy({
        ...(configPath ? { configPath } : {}),
        envFiles: [],
        environment: process.env.CLOUDFLARE_ENV,
        remoteBindings: process.env.CLOUDFLARE_REMOTE_BINDINGS === 'true',
      } satisfies GetPlatformProxyOptions),
  )
}
