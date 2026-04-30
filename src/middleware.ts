import type { NextRequest } from 'next/server'

import localization from '@root/i18n/localization'
import { NextResponse } from 'next/server'

const allowed = new Set(localization.locales.map((l) => l.code))

/**
 * Sets locale from the **`locale` search param** (e.g. `?locale=bg`) without changing paths:
 * writes the `NEXT_LOCALE` cookie (same name next-intl uses) and redirects to the same URL
 * with that param removed (other query params preserved).
 */
export function middleware(request: NextRequest) {
  const localeParam = request.nextUrl.searchParams.get('locale')
  if (!localeParam || !allowed.has(localeParam)) {
    return NextResponse.next()
  }

  const url = request.nextUrl.clone()
  url.searchParams.delete('locale')

  const response = NextResponse.redirect(url)
  response.cookies.set('NEXT_LOCALE', localeParam, {
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
    sameSite: 'lax',
  })
  return response
}

export const config = {
  matcher: ['/((?!api|admin|_next|_vercel|.*\\..*).*)'],
}
