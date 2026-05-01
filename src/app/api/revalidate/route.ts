import type { NextRequest } from 'next/server'

import { revalidateTagImmediate } from '@utilities/revalidateTagImmediate'
import { uuidTags } from '@uuid'
import { NextResponse } from 'next/server'

export function GET(request: NextRequest): NextResponse {
  try {
    const collection = request.nextUrl.searchParams.get('collection')
    const slug = request.nextUrl.searchParams.get('slug')
    const secret = request.nextUrl.searchParams.get('secret')

    if (secret !== process.env.NEXT_PRIVATE_REVALIdATION_KEY) {
      return NextResponse.json({ now: Date.now(), revalidated: false })
    }

    if (typeof collection === 'string' && typeof slug === 'string') {
      revalidateTagImmediate(uuidTags.collectionSlug(collection, slug))
      return NextResponse.json({ now: Date.now(), revalidated: true })
    }

    return NextResponse.json({ now: Date.now(), revalidated: false })
  } catch (error) {
    console.error('Revalidate error:', error)
    return NextResponse.json(
      { error: 'Cache revalidation failed', now: Date.now(), revalidated: false },
      { status: 500 },
    )
  }
}
