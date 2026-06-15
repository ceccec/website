import type { NextRequest } from 'next/server'

import { getPayload } from '@root/plugins/payload-runtime/getPayload'
import { formatPagePath } from '@root/utilities/formatPagePath'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

function expiresMs(value: unknown): null | number {
  if (value == null || value === '') {return null}
  if (value instanceof Date) {return value.getTime()}
  if (typeof value === 'string') {
    const t = Date.parse(value)
    return Number.isNaN(t) ? null : t
  }
  return null
}

/**
 * Public resolver for {@link Shares} — validates token + optional **expiresAt**, then redirects to
 * the canonical marketing path (`formatPagePath`). Uses Local API with **`overrideAccess`** so links
 * work for anonymous visitors while collection REST access stays admin-only.
 */
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ token: string }> },
): Promise<NextResponse> {
  const { token: raw } = await context.params
  const token = typeof raw === 'string' ? raw.trim() : ''
  if (!token) {
    return new NextResponse('Not found', { status: 404 })
  }

  const payload = await getPayload()
  const found = await payload.find({
    collection: 'shares',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: {
      token: {
        equals: token,
      },
    },
  })

  const row = found.docs[0]
  if (!row || typeof row !== 'object') {
    return new NextResponse('Not found', { status: 404 })
  }

  const exp = expiresMs((row as { expiresAt?: unknown }).expiresAt)
  if (exp != null && exp < Date.now()) {
    return new NextResponse('Gone', { status: 410 })
  }

  const resource = (row as { resource?: unknown }).resource
  if (
    resource === null ||
    typeof resource !== 'object' ||
    !('relationTo' in resource) ||
    !('value' in resource)
  ) {
    return new NextResponse('Invalid share', { status: 404 })
  }

  const relationTo = (resource as { relationTo: string }).relationTo
  const value = (resource as { value: unknown }).value
  const idRaw =
    typeof value === 'object' && value !== null && 'id' in value
      ? (value as { id: unknown }).id
      : value
  const id =
    typeof idRaw === 'string' || typeof idRaw === 'number' ? idRaw : null

  if (id == null || typeof relationTo !== 'string') {
    return new NextResponse('Invalid share', { status: 404 })
  }

  const doc = await payload.findByID({
    id,
    collection: relationTo as 'case-studies' | 'pages' | 'posts',
    depth: 2,
    overrideAccess: true,
  })

  if (!doc || typeof doc !== 'object') {
    return new NextResponse('Not found', { status: 404 })
  }

  let categorySlug: string | undefined
  if (relationTo === 'posts') {
    const cat = (doc as { category?: unknown }).category
    if (typeof cat === 'object' && cat !== null && 'slug' in cat) {
      categorySlug = String((cat as { slug?: string }).slug ?? '')
    } else if (typeof cat === 'string' || typeof cat === 'number') {
      const c = await payload.findByID({
        id: cat,
        collection: 'categories',
        depth: 0,
        overrideAccess: true,
        select: { slug: true },
      })
      categorySlug = typeof c?.slug === 'string' ? c.slug : undefined
    }
  }

  const path = formatPagePath(relationTo, doc as Parameters<typeof formatPagePath>[1], categorySlug)
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
    new URL(_req.url).origin.replace(/\/$/, '')

  return NextResponse.redirect(new URL(path, base).toString(), 302)
}
