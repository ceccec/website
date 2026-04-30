import type { TypedLocale } from 'payload'

import localization from '@root/i18n/localization'
import { getLocale } from 'next-intl/server'

const codes = new Set(localization.locales.map((l) => l.code))

/**
 * Resolves the active content locale (matches Cookie / next-intl) for Payload Local API.
 * Use on every `find` / `findGlobal` that returns localized fields.
 */
export async function resolvePayloadLocale(): Promise<TypedLocale> {
  const raw = await getLocale()
  if (codes.has(raw)) {
    return raw as TypedLocale
  }
  return localization.defaultLocale as TypedLocale
}
