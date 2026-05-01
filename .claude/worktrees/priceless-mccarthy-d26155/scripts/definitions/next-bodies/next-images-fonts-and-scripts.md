# Images, fonts & scripts

## Official docs

### Images

- [Image optimization](https://nextjs.org/docs/app/getting-started/images)
- Component API: [`next/image`](https://nextjs.org/docs/app/api-reference/components/image)
- Config: [`images` in next.config.js](https://nextjs.org/docs/app/api-reference/config/next-config-js/images)

### Fonts

- [Font optimization](https://nextjs.org/docs/app/getting-started/fonts)
- [`next/font`](https://nextjs.org/docs/app/api-reference/components/font)

### Scripts

- [`next/script`](https://nextjs.org/docs/app/api-reference/components/script)
- [Scripts guide](https://nextjs.org/docs/app/guides/scripts)
- Third parties: [`@next/third-parties`](https://nextjs.org/docs/app/guides/third-party-libraries)

## This repo

- **`next.config.js`** defines **`images.remotePatterns`** for CMS/asset hosts — keep aligned with Payload media URLs (**`payload-uploads-storage.mdc`**).
- **CMS-managed assets** stay in Payload collections; **Next Image** optimizes **delivery URLs** you allow in config.

## Checklist

- [ ] `sizes` / `fill` / layout props set to avoid CLS ([Image](https://nextjs.org/docs/app/api-reference/components/image)).
- [ ] Remote patterns and env-based site URLs stay in sync with deploy domains.
- [ ] Scripts use `strategy` per [Script component](https://nextjs.org/docs/app/api-reference/components/script) for performance.

**More:** **`next-metadata-and-og.mdc`** · **`next-styling.mdc`**
