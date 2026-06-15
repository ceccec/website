import type { TypedLocale } from 'payload'

import localization from '@root/i18n/localization'
import { getLocale } from 'next-intl/server'

const codes = new Set(localization.locales.map((l) => l.code))

/**
 * Active content locale code (matches Cookie / next-intl), passed to the Payload Local API.
 *
 * In this project the generated {@link TypedLocale} resolves to `null` because localization is
 * configured at runtime (see `i18n/localization`) rather than reflected in `payload-types.ts`,
 * so locale codes are plain strings. We model that as `TypedLocale | string`.
 */
export type PayloadLocale = string | TypedLocale

/**
 * Resolves the active content locale (matches Cookie / next-intl) for Payload Local API.
 * Use on every `find` / `findGlobal` that returns localized fields.
 */
export async function resolvePayloadLocale(): Promise<PayloadLocale> {
  const raw = await getLocale()
  if (codes.has(raw)) {
    return raw
  }
  return localization.defaultLocale
}
