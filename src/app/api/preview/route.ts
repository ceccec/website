import type { NextRequest } from 'next/server'
import type { PayloadRequest } from 'payload'

import { getPayload } from '@root/lib/getPayload'
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

export async function GET(req: NextRequest): Promise<Response> {
  const { searchParams } = new URL(req.url)
  const url = searchParams.get('url')
  const secret = searchParams.get('secret')

  if (!url) {
    return new Response('No URL provided', { status: 404 })
  }

  if (secret !== process.env.NEXT_PRIVATE_DRAFT_SECRET) {
    return new Response('Invalid secret', { status: 401 })
  }

  try {
    const payload = await getPayload()

    let user

    try {
      user = await payload.auth({
        headers: req.headers,
        req: req as unknown as PayloadRequest,
      })
    } catch (err) {
      payload.logger.error({ err, msg: 'Error verifying token for preview' })
      return new Response('You are not allowed to preview this page', { status: 403 })
    }

    const draft = await draftMode()

    if (!user) {
      draft.disable()
      return new Response('You are not allowed to preview this page', { status: 403 })
    }

    draft.enable()

    redirect(url)
  } catch (err) {
    console.error('Preview route error:', err)
    return new Response('Preview initialization failed', { status: 500 })
  }
}
