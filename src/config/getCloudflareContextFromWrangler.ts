import type { CloudflareContext } from '@opennextjs/cloudflare'
import type { GetPlatformProxyOptions } from 'wrangler'

export function getCloudflareContextFromWrangler(): Promise<CloudflareContext> {
  return import(/* webpackIgnore: true */ `${'__wrangler'.replaceAll('_', '')}`).then(
    ({ getPlatformProxy }) =>
      getPlatformProxy({
        envFiles: [],
        environment: process.env.CLOUDFLARE_ENV,
        remoteBindings: process.env.CLOUDFLARE_REMOTE_BINDINGS === 'true',
      } satisfies GetPlatformProxyOptions),
  )
}
