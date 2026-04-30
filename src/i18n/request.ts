import localization from '@root/i18n/localization'
import { cookies } from 'next/headers'
import { getRequestConfig } from 'next-intl/server'

const allowed = new Set(localization.locales.map((l) => l.code))

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  if (!locale || !allowed.has(locale)) {
    const store = await cookies()
    const fromCookie = store.get('NEXT_LOCALE')?.value
    locale =
      fromCookie && allowed.has(fromCookie)
        ? fromCookie
        : localization.defaultLocale
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
