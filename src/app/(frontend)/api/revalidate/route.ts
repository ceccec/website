import type { NextRequest } from 'next/server'

import { revalidateTagImmediate } from '@utilities/revalidateTagImmediate'
import { NextResponse } from 'next/server'

export function GET(request: NextRequest): NextResponse {
  const collection = request.nextUrl.searchParams.get('collection')
  const slug = request.nextUrl.searchParams.get('slug')
  const secret = request.nextUrl.searchParams.get('secret')

  if (secret !== process.env.NEXT_PRIVATE_REVALIDATION_KEY) {
    return NextResponse.json({ now: Date.now(), revalidated: false })
  }

  if (typeof collection === 'string' && typeof slug === 'string') {
    revalidateTagImmediate(`${collection}_${slug}`)
    return NextResponse.json({ now: Date.now(), revalidated: true })
  }

  return NextResponse.json({ now: Date.now(), revalidated: false })
}
