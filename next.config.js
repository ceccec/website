import { withPayload } from '@payloadcms/next/withPayload'
import path from 'path'
import { fileURLToPath } from 'node:url'
const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

import { redirects } from './redirects.js'

import bundleAnalyzer from '@next/bundle-analyzer'

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
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: true,
  images: {
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
    resolveAlias: {
      '@scss': path.resolve(dirname, './src/css/'),
      '@components': path.resolve(dirname, './src/components.js'),
      '@cloud': path.resolve(dirname, './src/app/cloud'),
      '@forms': path.resolve(dirname, './src/forms'),
      '@blocks': path.resolve(dirname, './src/blocks'),
      '@providers': path.resolve(dirname, './src/providers'),
      '@icons': path.resolve(dirname, './src/icons'),
      '@utilities': path.resolve(dirname, './src/utilities'),
      '@types': path.resolve(dirname, './payload-types.ts'),
      '@graphics': path.resolve(dirname, './src/graphics'),
      '@graphql': path.resolve(dirname, './src/graphql'),
    },
  },
  webpack: (config) => {
    const configCopy = { ...config }
    configCopy.resolve = {
      ...config.resolve,
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      extensionAlias: {
        '.js': ['.ts', '.js', '.tsx', '.jsx'],
        '.mjs': ['.mts', '.mjs'],
      },
      alias: {
        ...config.resolve.alias,
        '@scss': path.resolve(dirname, './src/css/'),
        '@components': path.resolve(dirname, './src/components.js'),
        '@cloud': path.resolve(dirname, './src/app/cloud'),
        '@forms': path.resolve(dirname, './src/forms'),
        '@blocks': path.resolve(dirname, './src/blocks'),
        '@providers': path.resolve(dirname, './src/providers'),
        '@icons': path.resolve(dirname, './src/icons'),
        '@utilities': path.resolve(dirname, './src/utilities'),
        '@types': path.resolve(dirname, './payload-types.ts'),
        '@graphics': path.resolve(dirname, './src/graphics'),
        '@graphql': path.resolve(dirname, './src/graphql'),
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
      remoteBindings: false,
      envFiles: [],
    }),
  )
}
