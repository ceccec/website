/* eslint-disable no-console */
/**
 * CLI demo seed. Shares the idempotent logic in `@root/seed/seedDemoContent` with the
 * browser endpoint (`/api/seed`). Run with: `pnpm exec payload run src/scripts/seed.ts`.
 *
 * Note: revalidation in the seeded hooks no-ops here (no request context — see
 * `safeRevalidate`). Use the admin "Seed Demo Content" button to seed AND bust the page
 * cache so changes appear immediately on a running server.
 */
import 'dotenv/config'

import { getPayload } from '@root/plugins/payload-runtime/getPayload'
import { seedDemoContent } from '@root/seed/seedDemoContent'

try {
  const messages = await seedDemoContent(await getPayload())
  for (const message of messages) {
    console.log(`[seed] ${message}`)
  }
  process.exit(0)
} catch (e: unknown) {
  console.error('[seed] Failed:', e)
  process.exit(1)
}
