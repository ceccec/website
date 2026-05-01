import type { NextRequest, NextResponse } from 'next/server'

import { runAuthorizedSyncGet } from '@root/utilities/runAuthorizedSyncGet'
import { syncToAlgolia } from '@root/scripts/syncToAlgolia'

export async function GET(req: NextRequest): Promise<NextResponse> {
  return runAuthorizedSyncGet(req, () => syncToAlgolia())
}
