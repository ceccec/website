import type { NextRequest } from 'next/server'

import localization from '@root/i18n/localization'
import { NextResponse } from 'next/server'

const allowed = new Set(localization.locales.map((l) => l.code))

/**
 * API Route - Sets locale from the `locale` query param
 * Example: `/api/set-locale?locale=bg&redirect=/path`
 * This replaces the middleware pattern using the proxy approach
 */
export async function GET(request: NextRequest) {
  const localeParam = request.nextUrl.searchParams.get('locale')
  const redirectPath = request.nextUrl.searchParams.get('redirect') || '/'

  if (!localeParam || !allowed.has(localeParam)) {
    return NextResponse.redirect(new URL(redirectPath, request.url))
  }

  const response = NextResponse.redirect(new URL(redirectPath, request.url))
  response.cookies.set('NEXT_LOCALE', localeParam, {
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
    sameSite: 'lax',
  })

  return response
}
