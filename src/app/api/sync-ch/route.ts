import type { NextRequest, NextResponse } from 'next/server'

import clearDuplicateThreads from '@root/scripts/clearDuplicateThreads'
import fetchDiscord from '@root/scripts/fetchDiscord'
import fetchGitHub from '@root/scripts/fetchGitHub'
import { runAuthorizedSyncGet } from '@root/utilities/runAuthorizedSyncGet'
import { syncToAlgolia } from '@root/scripts/syncToAlgolia'

export const maxDuration = 300 // 5 mins (max on vercel pro plan)
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest): Promise<NextResponse> {
  return runAuthorizedSyncGet(req, async () => {
    const tasks = [
      { name: 'clearDuplicateThreads', fn: clearDuplicateThreads },
      { name: 'fetchDiscord', fn: fetchDiscord },
      { name: 'fetchGitHub', fn: fetchGitHub },
      { name: 'syncToAlgolia', fn: syncToAlgolia },
    ]

    for (const { name, fn } of tasks) {
      try {
        await fn()
      } catch (error) {
        // eslint-disable-next-line no-console -- server task diagnostic
        console.error(`Error in ${name}:`, error)
      }
    }
  })
}
