import type { ImageLoaderProps } from 'next/image'

/**
 * Next.js [`loader`](https://nextjs.org/docs/app/api-reference/components/image#loader) for
 * [Cloudflare Image Transformations](https://developers.cloudflare.com/images/transform-images/transform-via-url/)
 * (`/cdn-cgi/image/<OPTIONS>/<SOURCE>`). Loaded only when **`NEXT_PUBLIC_CF_IMAGE_RESIZING=true`** in
 * `next.config.js`; otherwise the app uses the **default** Next.js image pipeline (free path on any host).
 * Use this opt-in when the zone has transformations enabled.
 *
 * Resolves relative `/api/media/...` URLs against `NEXT_PUBLIC_SITE_URL` / `NEXT_PUBLIC_CMS_URL`.
 */
export default function cloudflareImageLoader({ quality, src, width }: ImageLoaderProps): string {
  const q = quality ?? 75
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_CMS_URL?.trim() ||
    process.env.PAYLOAD_PUBLIC_APP_URL?.trim()

  if (!base) {
    return src
  }

  const zoneOrigin = new URL(base.startsWith('http') ? base : `https://${base}`).origin

  let absolute = src
  if (!src.startsWith('http://') && !src.startsWith('https://')) {
    absolute = new URL(src, base.endsWith('/') ? base : `${base}/`).toString()
  }

  const options = [`width=${width}`, `quality=${q}`, 'fit=scale-down', 'format=auto'].join(',')
  const encodedSource = encodeURIComponent(absolute)

  return `${zoneOrigin}/cdn-cgi/image/${options}/${encodedSource}`
}
