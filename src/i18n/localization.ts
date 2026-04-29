/**
 * Aligns with `examples/localization` in the Payload monorepo.
 * Add `localized: true` on individual fields when you want per-locale content.
 *
 * @see https://github.com/payloadcms/payload/blob/main/examples/localization/src/i18n/localization.ts
 */
const localization = {
  defaultLocale: 'en',
  fallback: true,
  locales: [
    {
      code: 'bg',
      label: 'Bulgatian (Български)',
    },
    {
      code: 'en',
      label: 'English (English)',
    },
    {
      code: 'es',
      label: 'Spanish (Español)',
    },
    {
      code: 'de',
      label: 'German (Deutsch)',
    },
    {
      code: 'ja',
      label: 'Japanese (日本語)',
    },
    {
      code: 'ar',
      label: 'Arabic (العربية)',
      rtl: true,
    },
  ],
}

export default localization
