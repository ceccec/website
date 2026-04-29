import type { Payload } from 'payload'

import config from '@payload-config'
import { getPayload as getPayloadFromPayload } from 'payload'

/**
 * Local API entrypoint for Next server code — thin wrapper around Payload’s official API:
 * `import { getPayload } from 'payload'` + `{ config }` from `@payload-config`.
 *
 * Payload 3 already caches the initialized instance internally; do not add a second cache here.
 * CLI scripts (`payload run`) may call `getPayload({ config })` directly — same underlying cache.
 *
 * @see https://payloadcms.com/docs/local-api/overview
 */
export async function getPayload(): Promise<Payload> {
  return getPayloadFromPayload({ config })
}
