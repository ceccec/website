import { type CloudflareContext, getCloudflareContext } from '@opennextjs/cloudflare'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
/**
 * Payload Config — central definition for Collections, Globals, Fields (via plugins),
 * Database adapter, Admin UI, and Hooks scope.
 *
 * Data retrieval in app code: Local API (`getPayload` from `@root/lib/getPayload`),
 * REST (`/api`), GraphQL (`/api/graphql`). CLI / `payload run` scripts typically use
 * `getPayload({ config })` with `@payload-config` (see `fetchDiscord.ts`, `clearDuplicateThreads.ts`).
 * Lexical slate migration: `src/migrate.ts` uses `@root/lib/getPayload` like Next (same singleton).
 *
 * Doc areas ↔ repo:
 * - Configuration — this file; plugins `src/plugins`; env-driven URL/origins `src/config/trustedOrigins.ts`, `utilities/getURL.ts`
 * - Database — `resolvePayloadDb` (`src/lib/payloadDb.ts`), Cloudflare bindings `assertCloudflarePayloadBindings`
 * - Admin UI — `admin.*` below; nav/dashboard slots `components/AfterNavActions`, `components/BeforeDashboard`
 * - Live preview — `admin.livePreview`; draft route `app/(frontend)/api/preview/route.ts` (secret cookie — `.env.example`)
 * - Local API — `src/lib/getPayload.ts`, `app/_data`, `utilities/getDocument`, docs pages under `app/(frontend)/(pages)/docs`
 * - Lexical — `config/payloadLexicalEditor.ts`
 * - Email — `email/sendgridMailTransport.ts`, `email/nodemailer` adapter below
 * - Jobs queue — `jobs` below; access `config/jobsAccess.ts`
 * - TypeScript types — `typescript.outputFile` → generated `payload-types.ts`
 * - Fields — shared field defs `src/fields`, blocks `src/blocks`, plugin schema `src/plugins/schema`
 * - Access control — collection `access` in `src/collections`, Cloud helpers `src/access`, tenant checks in plugins
 * - Hooks — collection/plugin `hooks` in schema plugins; pipeline entry `src/plugins/index.ts`
 *
 * @see https://payloadcms.com/docs/getting-started/concepts
 * @see https://payloadcms.com/docs/configuration/overview
 * @see https://payloadcms.com/docs/database/overview
 * @see https://payloadcms.com/docs/fields/overview
 * @see https://payloadcms.com/docs/access-control/overview
 * @see https://payloadcms.com/docs/hooks/overview
 * @see https://payloadcms.com/docs/local-api/overview
 */
import fs from 'fs'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Users } from './collections/Users'
import { createCloudflareLogger } from './config/cloudflareLogger'
import { getCloudflareContextFromWrangler } from './config/getCloudflareContextFromWrangler'
import { jobsCanRun } from './config/jobsAccess'
import { payloadLexicalEditor } from './config/payloadLexicalEditor'
import { getTrustedOrigins } from './config/trustedOrigins'
import { createSendGridMailTransport } from './email/sendgridMailTransport'
import localization from './i18n/localization'
import { assertCloudflarePayloadBindings } from './lib/assertCloudflarePayloadBindings'
import { getDeploymentTarget } from './lib/deploymentTarget'
import { resolvePayloadDb } from './lib/payloadDb'
import { getPlugins } from './plugins'
import { getServerSideURL } from './utilities/getURL'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const sendGridAPIKey = process.env.SENDGRID_API_KEY

/** Web API (HTTPS), same as legacy nodemailer-sendgrid; works when SMTP :587 is blocked. */
const sendgridConfig = {
  skipVerify: true,
  transportOptions: createSendGridMailTransport({ apiKey: sendGridAPIKey }),
}

/** SMTP (e.g. Mailpit / Docker) overrides SendGrid when `SMTP_HOST` is set. */
const nodemailerArgs =
  process.env.SMTP_HOST?.trim()
    ? {
        defaultFromAddress: process.env.SMTP_FROM_EMAIL?.trim() || 'noreply@localhost',
        defaultFromName: process.env.SMTP_FROM_NAME?.trim() || 'Payload',
        skipVerify: true,
        transportOptions: {
          host: process.env.SMTP_HOST.trim(),
          port: Number(process.env.SMTP_PORT || '1025'),
          secure: process.env.SMTP_SECURE === 'true',
          ...(process.env.SMTP_USER?.trim()
            ? {
                auth: {
                  user: process.env.SMTP_USER.trim(),
                  pass: process.env.SMTP_PASS?.trim() || '',
                },
              }
            : {}),
        },
      }
    : {
        defaultFromAddress: 'info@payloadcms.com',
        defaultFromName: 'Payload',
        ...sendgridConfig,
      }

const emailAdapter = await nodemailerAdapter(nodemailerArgs)

const realpath = (value: string) => (fs.existsSync(value) ? fs.realpathSync(value) : undefined)

const isCLI = process.argv.some((value) => realpath(value)?.endsWith(path.join('payload', 'bin.js')))
const isProduction = process.env.NODE_ENV === 'production'

const deploymentTarget = getDeploymentTarget()

const cloudflare: CloudflareContext | undefined =
  deploymentTarget === 'cloudflare'
    ? isCLI || !isProduction
      ? await getCloudflareContextFromWrangler()
      : await getCloudflareContext({ async: true })
    : undefined

assertCloudflarePayloadBindings(deploymentTarget, cloudflare)

const trustedOrigins = getTrustedOrigins()

const adminMetaIcons =
  process.env.PAYLOAD_ADMIN_FAVICON_URL?.trim()
    ? [
        {
          type: 'image/png',
          rel: 'icon' as const,
          url: process.env.PAYLOAD_ADMIN_FAVICON_URL.trim(),
        },
      ]
    : undefined

export default buildConfig({
  admin: {
    ...(process.env.NODE_ENV !== 'production'
      ? {
          autoLogin: {
            email: 'dev2@payloadcms.com',
            password: 'test',
          },
        }
      : {}),
    ...(process.env.PAYLOAD_ADMIN_TITLE_SUFFIX?.trim() ||
    process.env.PAYLOAD_ADMIN_META_DESCRIPTION?.trim() ||
    adminMetaIcons
      ? {
          meta: {
            ...(process.env.PAYLOAD_ADMIN_META_DESCRIPTION?.trim()
              ? { description: process.env.PAYLOAD_ADMIN_META_DESCRIPTION.trim() }
              : {}),
            ...(process.env.PAYLOAD_ADMIN_TITLE_SUFFIX?.trim()
              ? { titleSuffix: process.env.PAYLOAD_ADMIN_TITLE_SUFFIX.trim() }
              : {}),
            ...(adminMetaIcons ? { icons: adminMetaIcons } : {}),
          },
        }
      : {}),
    components: {
      afterNavLinks: ['@root/components/AfterNavActions'],
      beforeDashboard: ['@root/components/BeforeDashboard'],
    },
    importMap: {
      baseDir: dirname,
    },
    livePreview: {
      breakpoints: [
        { name: 'mobile', height: 667, label: 'Mobile', width: 375 },
        { name: 'tablet', height: 1024, label: 'Tablet', width: 768 },
        { name: 'desktop', height: 900, label: 'Desktop', width: 1440 },
      ],
    },
    user: Users.slug,
  },
  blocks: [],
  collections: [],
  cors: trustedOrigins,
  csrf: trustedOrigins,
  db: resolvePayloadDb({ cloudflare, deploymentTarget }),
  localization,
  serverURL: getServerSideURL(),
  // Cloudflare Workers: JSON line logging (not full PayloadLogger / pino surface).
   
  logger:
    isProduction && deploymentTarget === 'cloudflare' ? (createCloudflareLogger() as any) : undefined,
  ...(deploymentTarget === 'vercel' ? { sharp } : {}),
  defaultDepth: 1,
  editor: payloadLexicalEditor,
  email: emailAdapter,
  endpoints: [],
  globals: [],
  graphQL: {
    disablePlaygroundInProduction: true,
  },
  jobs: {
    access: {
      run: jobsCanRun,
    },
    tasks: [],
  },
  plugins: getPlugins({ cloudflare, deploymentTarget }),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
