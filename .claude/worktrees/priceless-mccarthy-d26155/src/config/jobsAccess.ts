import type { PayloadRequest } from 'payload'

import { resolveFirstEnvValue } from '@root/lib/resolveGlobalField'

/** Who may run queued jobs — authenticated admin or cron bearer secret. */
export function jobsCanRun({ req }: { req: PayloadRequest }): boolean {
  if (req.user) {return true}
  const secret = resolveFirstEnvValue(process.env.CRON_SECRET, process.env.NEXT_PRIVATE_CRON_KEY)
  if (!secret) {return false}
  const authHeader = req.headers.get('authorization')
  return authHeader === `Bearer ${secret}`
}
