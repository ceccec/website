import type { PayloadHandler } from 'payload'

import { seedDemoContent } from '@root/seed/seedDemoContent'

/**
 * Browser-triggerable demo seed (POST `/api/seed`). Admin-only. Runs inside the Next request
 * context so the seeded collections/globals' `afterChange` hooks revalidate the page cache —
 * the new home page and globals appear immediately, no server restart needed.
 */
export const seedHandler: PayloadHandler = async (req) => {
  if (!req.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const messages = await seedDemoContent(req.payload)
    return Response.json({ messages, ok: true })
  } catch (err) {
    req.payload.logger.error({ err, msg: 'Seed failed' })
    return Response.json(
      { error: err instanceof Error ? err.message : String(err), ok: false },
      { status: 500 },
    )
  }
}
