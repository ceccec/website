import { withPayload } from '@payloadcms/next/withPayload'
import path from 'path'
import { fileURLToPath } from 'node:url'
const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

import { redirects } from './redirects.js'
import { OPENNEXT_CLOUDFLARE_IGNORED_OPTIONAL_PAYLOAD_PACKAGES } from './scripts/lib/opennextCloudflareIgnoredPayloadPackages.mjs'
import { getDeploymentTargetFromEnv } from './scripts/lib/deploymentTarget.mjs'

import bundleAnalyzer from '@next/bundle-analyzer'

function resourceRegExpForExactPackageName(pkg) {
  return new RegExp(`^${pkg.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&')}$`)
}

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const localhost = process.env.NEXT_PUBLIC_IS_LIVE
  ? []
  : [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
      },
      {
        protocol: 'http',
        hostname: 'local.payloadcms.com',
        port: '3000',
      },
      {
        protocol: 'http',
        hostname: 'cms.local.payloadcms.com',
        port: '8000',
      },
      {
        protocol: 'http',
        hostname: 'cms.local.payloadcms.com',
        port: '8001',
      },
    ]

/**
 * Mirrors `tsconfig.json` `paths`. Webpack uses absolute targets; Turbopack needs **project-relative**
 * `./src/...` strings — absolute `path.resolve` values break resolution (`./Users/...` server-import errors).
 */
const aliasPairs = [
  ['@blocks', 'src/components/blocks'],
  ['@cloud', 'src/app/(frontend)/(cloud)/cloud'],
  ['@components', 'src/components'],
  ['@data', 'src/app/_data'],
  ['@docs', 'src/docs'],
  ['@forms', 'src/forms'],
  ['@graphics', 'src/graphics'],
  ['@hooks', 'src/hooks'],
  ['@icons', 'src/icons'],
  ['@payload-config', 'src/payload.config.ts'],
  ['@providers', 'src/providers'],
  ['@root', 'src'],
  ['@scss', 'src/css'],
  ['@types', 'src/payload-types.ts'],
  ['@utilities', 'src/utilities'],
]

const webpackAliases = Object.fromEntries(
  aliasPairs.map(([key, rel]) => [key, path.resolve(dirname, rel)]),
)

const turbopackAliases = Object.fromEntries(
  aliasPairs.map(([key, rel]) => [key, `./${rel}`]),
)

function imageRemotePatternsFromEnv() {
  const patterns = []
  for (const key of ['NEXT_PUBLIC_SITE_URL', 'NEXT_PUBLIC_CLOUD_CMS_URL']) {
    const raw = process.env[key]
    if (!raw?.trim()) continue
    try {
      const u = new URL(raw)
      patterns.push({
        protocol: u.protocol === 'http:' ? 'http' : 'https',
        hostname: u.hostname,
        port: u.port || '',
        pathname: '/**',
      })
    } catch {
      // ignore
    }
  }
  const extra = process.env.NEXT_PUBLIC_IMAGE_REMOTE_HOSTS
  if (extra?.trim()) {
    for (const hostname of extra.split(',').map((s) => s.trim()).filter(Boolean)) {
      patterns.push({
        protocol: 'https',
        hostname,
        port: '',
        pathname: '/**',
      })
    }
  }
  return patterns
}

const nextConfig = withBundleAnalyzer({
  /** Prefer this app’s lockfile when a parent directory has another (e.g. npm + pnpm). */
  outputFileTracingRoot: dirname,
  ...(process.env.OPEN_NEXT_INNER_BUILD === '1'
    ? {
        /**
         * OpenNext’s nested `next build` uses local Miniflare D1 (SQLite). Parallel SSG → SQLITE_BUSY / locked DB.
         * Next’s “Collecting page data using N workers” comes from `experimental.cpus` (see `next/dist/build/index.js`
         * `getNumberOfWorkers`); `staticGenerationMaxConcurrency` only limits pages **per** worker.
         */
        experimental: {
          cpus: 1,
          staticGenerationMaxConcurrency: 1,
          staticGenerationRetryCount: 8,
        },
      }
    : {}),
  reactStrictMode: true,
  images: {
    // Default: built-in Next.js loader (no CF /cdn-cgi/image/). Opt-in paid zone transforms via env.
    ...(process.env.NEXT_PUBLIC_CF_IMAGE_RESIZING === 'true'
      ? {
          loader: 'custom',
          loaderFile: './src/lib/cloudflareImageLoader.ts',
        }
      : {}),
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year,
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
    remotePatterns: [
      ...localhost,
      ...imageRemotePatternsFromEnv(),
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: '**.public.blob.vercel-storage.com',
        pathname: '/**',
      },
    ].filter(Boolean),
  },
  sassOptions: {
    silenceDeprecations: ['legacy-js-api', 'import'], // https://github.com/vercel/next.js/issues/71638
  },
  turbopack: {
    resolveAlias: turbopackAliases,
  },
  webpack: (config, { webpack }) => {
    const configCopy = { ...config }
    configCopy.plugins = [...(config.plugins ?? [])]
    if (
      process.env.OPEN_NEXT_INNER_BUILD === '1' &&
      getDeploymentTargetFromEnv(process.env) === 'cloudflare'
    ) {
      for (const pkg of OPENNEXT_CLOUDFLARE_IGNORED_OPTIONAL_PAYLOAD_PACKAGES) {
        configCopy.plugins.push(
          new webpack.IgnorePlugin({ resourceRegExp: resourceRegExpForExactPackageName(pkg) }),
        )
      }
    }
    configCopy.resolve = {
      ...config.resolve,
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      extensionAlias: {
        '.js': ['.ts', '.js', '.tsx', '.jsx'],
        '.mjs': ['.mts', '.mjs'],
      },
      alias: {
        ...config.resolve.alias,
        ...webpackAliases,
      },
    }
    return configCopy
  },
  redirects,
  async headers() {
    const headers = [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Content-Security-Policy',
            value: "object-src 'none';base-uri 'self';form-action 'self';",
          },
        ],
      },
    ]

    if (!process.env.NEXT_PUBLIC_IS_LIVE) {
      headers.push({
        source: '/(.*)',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex',
          },
        ],
      })
    }
    return headers
  },
})

export default withPayload(nextConfig, { devBundleServerPackages: false })

if (process.env.PAYLOAD_HOSTING !== 'vercel' && process.env.VERCEL !== '1') {
  import('@opennextjs/cloudflare').then((m) =>
    m.initOpenNextCloudflareForDev({
      remoteBindings: process.env.CLOUDFLARE_REMOTE_BINDINGS === 'true',
      envFiles: [],
    }),
  )
}
