/**
 * Generates `.cursor/rules/payload-*.mdc` from inline definitions.
 * Run: node scripts/generate-payload-cursor-rules.mjs
 */
import fs from 'fs'
import { fileURLToPath } from 'url'

const rootDir = fileURLToPath(new URL('..', import.meta.url))
const rulesDir = `${rootDir}/.cursor/rules`

/** Third column: backtick-wrapped rule filename for markdown */
function ruleMdc(name) {
  return `\`${name}\``
}

function hubTable3(headerLine, separatorLine, rows) {
  const body = rows.map(([a, b, c]) => `| ${a} | ${b} | ${c} |`).join('\n')
  return `${headerLine}\n${separatorLine}\n${body}`
}

function moreLine(parts) {
  return `**More:** ${parts.join(' · ')}`
}

const REGEN_FOOTER_FEATURES = `Regenerate this file via \`pnpm generate:cursor-rules:payload\` after editing \`scripts/generate-payload-cursor-rules.mjs\`.`

const REGEN_FOOTER_SHORT = `Regenerate via \`pnpm generate:cursor-rules:payload\` after editing \`scripts/generate-payload-cursor-rules.mjs\`.`

const FEATURE_HUB_ROWS = [
  ['**Custom admin components**', '[Custom components](https://payloadcms.com/docs/custom-components/overview)', ruleMdc('payload-custom-components.mdc')],
  ['**Authentication**', '[Authentication](https://payloadcms.com/docs/authentication/overview)', ruleMdc('payload-auth.mdc')],
  ['**Rich text (Lexical)**', '[Rich text](https://payloadcms.com/docs/rich-text/overview)', ruleMdc('payload-richtext-lexical.mdc')],
  ['**Live preview**', '[Live preview](https://payloadcms.com/docs/live-preview/overview)', ruleMdc('payload-preview-drafts.mdc')],
  ['**Versions**', '[Versions](https://payloadcms.com/docs/versions/overview)', ruleMdc('payload-versions.mdc')],
  ['**Upload / media**', '[Upload](https://payloadcms.com/docs/upload/overview)', ruleMdc('payload-uploads-storage.mdc')],
  ['**Folders**', '[Folders](https://payloadcms.com/docs/folders/overview)', ruleMdc('payload-folders-trash-presets.mdc')],
  ['**Email**', '[Email](https://payloadcms.com/docs/email/overview)', ruleMdc('payload-email.mdc')],
  ['**Jobs queue**', '[Jobs queue](https://payloadcms.com/docs/jobs-queue/overview)', ruleMdc('payload-jobs.mdc')],
  ['**Query presets**', '[Query presets](https://payloadcms.com/docs/query-presets/overview)', ruleMdc('payload-folders-trash-presets.mdc')],
  ['**Trash**', '[Trash](https://payloadcms.com/docs/trash/overview)', ruleMdc('payload-folders-trash-presets.mdc')],
  ['**Troubleshooting**', '[Troubleshooting](https://payloadcms.com/docs/troubleshooting/troubleshooting)', ruleMdc('payload-docs-support.mdc')],
  ['**TypeScript**', '[TypeScript](https://payloadcms.com/docs/typescript/overview)', ruleMdc('payload-typescript.mdc')],
]

const DEPLOYMENT_HUB_ROWS = [
  [
    '**Building without a DB**',
    '[Building without a database connection](https://payloadcms.com/docs/production/building-without-a-db-connection)',
    'This hub — **build/config** below',
  ],
  ['**Deployment**', '[Deployment](https://payloadcms.com/docs/production/deployment)', ruleMdc('payload-security-deployment.mdc')],
  ['**Preventing abuse**', '[Preventing abuse](https://payloadcms.com/docs/production/preventing-abuse)', ruleMdc('payload-security-deployment.mdc')],
  ['**Performance**', '[Performance overview](https://payloadcms.com/docs/performance/overview)', ruleMdc('payload-performance.mdc')],
]

const ECOSYSTEM_HUB_ROWS = [
  ['**Plugins**', '[Plugins overview](https://payloadcms.com/docs/plugins/overview)', ruleMdc('payload-plugins.mdc')],
  ['**Ecommerce**', '[Ecommerce overview](https://payloadcms.com/docs/ecommerce/overview)', ruleMdc('payload-ecommerce.mdc')],
  ['**Examples**', '[Examples overview](https://payloadcms.com/docs/examples/overview)', ruleMdc('payload-examples.mdc')],
  [
    '**Vercel Content Link** (integration)',
    '[Vercel Content Link](https://payloadcms.com/docs/integrations/vercel-content-link)',
    ruleMdc('payload-docs-support.mdc'),
  ],
]

const MORE_FEATURES_HUB = moreLine([
  'Deployment → `payload-deployment.mdc`',
  'Ecosystem → `payload-ecosystem.mdc`',
  'Admin shell → `payload-admin.mdc`',
  'APIs → `payload-apis.mdc`',
  'Hooks → `payload-hooks.mdc`',
  'Plugins → `payload-plugins.mdc`',
  'Security → `payload-security-deployment.mdc`',
  'Performance → `payload-performance.mdc`',
  'Basics → `payload-basics.mdc` (always-on)',
])

const MORE_DEPLOYMENT_HUB = moreLine([
  'Feature index → `payload-features-overview.mdc`',
  'Ecosystem → `payload-ecosystem.mdc`',
  'Basics → `payload-basics.mdc` (always-on)',
])

const MORE_ECOSYSTEM_HUB = moreLine([
  'Deployment → `payload-deployment.mdc`',
  'Feature index → `payload-features-overview.mdc`',
  'Basics → `payload-basics.mdc` (always-on)',
])

const rules = [
  {
    file: 'payload-apis.mdc',
    yaml: `description: Payload REST vs GraphQL vs Local API — boundaries, typing, depth
globs: src/app/**/api/**/*.{ts,tsx},src/**/_api/**/*.{ts,tsx},src/**/*route.ts
alwaysApply: false`,
    body: `# Payload APIs

Pick the layer that matches runtime and typing needs.

## Local API (preferred on server)

- **Docs:** [Local API overview](https://payloadcms.com/docs/local-api/overview)
- **This repo:** \`import { getPayload } from '@root/lib/getPayload'\` in Next RSC / route handlers / server actions; then \`payload.find\`, \`findByID\`, \`create\`, \`update\`, \`delete\`, \`count\`, etc.
- **Scripts / \`payload run\`:** \`import { getPayload } from 'payload'\` + \`getPayload({ config })\` with \`@payload-config\` (see \`src/migrate.ts\`).
- Use \`depth\`, \`select\`, \`where\`, \`sort\`, \`limit\`, \`pagination\` per docs. **Types** align with \`payload-types.ts\` when using generated collection slugs.

## REST API

- **Docs:** [REST API](https://payloadcms.com/docs/rest-api/overview)
- **Use when:** browser or external service calls \`/api/{collection}\`; you do not have importable \`getPayload\` in that context.
- **Rule:** \`res.json()\` is **\`unknown\`**. Assert or validate at the boundary; do not spread \`unknown\` into components without narrowing.
- **Auth:** follow Payload’s collection \`access\` and any API key / session rules you configure.

## GraphQL

- **Docs:** [GraphQL](https://payloadcms.com/docs/graphql/overview)
- **Use when:** clients need a single graph query; ensure **depth** / field selection matches what the UI needs.
- **This repo:** GraphQL is enabled in \`payload.config.ts\` (\`graphQL\`); admin and integrations may use it.

## Do not

- Duplicating business logic in REST **and** Local API without a single source of truth for shared operations.
- Calling \`fetch(\`\${CMS_URL\}/api/...\`)\` from **server** code that could use \`getPayload\` instead (loses types, adds latency) unless there is a deliberate reason (e.g. different host, public API contract).
`,
  },
  {
    file: 'payload-auth.mdc',
    yaml: `description: Payload auth — users, sessions, collection access, API auth
globs: src/collections/Users.{ts,tsx},src/collections/Users/**/*.{ts,tsx},src/access/**/*.{ts,tsx},src/**/*access*.ts,src/**/auth/**/*.{ts,tsx}
alwaysApply: false`,
    body: `# Payload authentication

- **Docs:** [Authentication](https://payloadcms.com/docs/authentication/overview) · [Access control](https://payloadcms.com/docs/access-control/overview)
- **Users collection:** \`src/collections/Users\` (or plugin-driven users) — **\`auth: true\`** patterns, \`token\` use, and **forgot-password** / **reset** fields follow Payload’s auth field set.
- **\`req.user\`:** In Local API and Next integrated routes, use **\`Request\` + user** as documented; do not invent parallel session stores unless required.
- **\`access\` functions:** Reuse project helpers (e.g. \`src/access/isAdmin.ts\`, \`src/plugins/schema/.../access\`) and keep **read/create/update/delete** consistent for the same role model.
- **API routes** (Next): forward cookies or headers as needed for REST/GraphQL; respect **CORS** and **CSRF** from \`payload.config\` (\`src/config/trustedOrigins.ts\`).

## Checklist

- [ ] New collection: \`access\` defined for all operations that apply.
- [ ] Field-level \`access\` only when you need to hide specific fields in admin or API.
- [ ] No hard-coded user ids in app code; use \`req.user\` / session.
`,
  },
  {
    file: 'payload-admin.mdc',
    yaml: `description: Admin Panel — overview, buildConfig.admin, routes, user collection, import map
globs: src/payload.config.ts,src/app/(payload)/**/*.{ts,tsx},src/components/AfterNavActions/**/*.{ts,tsx},src/components/BeforeDashboard/**/*.{ts,tsx},src/**/importMap*.{ts,tsx},src/**/admin/**/*.{ts,tsx}
alwaysApply: false`,
    body: `# Payload Admin Panel

**Hub:** [The Admin Panel — overview](https://payloadcms.com/docs/admin/overview) — Next.js App Router, \`(payload)\` route group, REST/GraphQL as Next routes, white-labeling, **Custom Components**, Live Preview, drafts, versions.

## \`buildConfig.admin\` options (official)

From the overview: **\`avatar\`**, **\`autoLogin\`**, **\`autoRefresh\`**, **\`components\`**, **\`custom\`**, **\`dateFormat\`**, **\`livePreview\`**, **\`meta\`**, **\`routes\`** (admin-*internal* routes like login/account), **\`suppressHydrationWarning\`**, **\`theme\`**, **\`timezones\`**, **\`toast\`**, **\`user\`**. Pair with [Authentication](https://payloadcms.com/docs/authentication/overview) for \`autoLogin\` / token refresh.

**\`admin.components\`** registers **custom React UI** for the dashboard, nav, views, etc. Read the official **[Custom components — overview](https://payloadcms.com/docs/custom-components/overview)** before adding paths — then \`payload-custom-components.mdc\`.

### Root \`routes\` (not under \`admin\`)

At **top level** of \`buildConfig\`: **\`routes.admin\`**, **\`routes.api\`**, **\`routes.graphQL\`**, **\`routes.graphQLPlayground\`** — change where the admin UI, REST, and GraphQL mount ([customizing routes](https://payloadcms.com/docs/admin/overview#customizing-routes)). If you move **\`routes.admin\`**, project structure under \`app/(payload)\` must match ([customizing location](https://payloadcms.com/docs/admin/customizing-location)).

### \`admin.user\` & RBAC

**\`admin.user\`** = slug of the **auth-enabled** collection allowed to open the Admin UI ([overview — Admin User Collection](https://payloadcms.com/docs/admin/overview#the-admin-user-collection)). Other auth collections (e.g. customers) do not get admin access unless you design for it. Use **\`access\`** + roles for editor vs super-admin ([Access control](https://payloadcms.com/docs/access-control/overview), [Auth example](https://github.com/payloadcms/payload/tree/3.x/examples/auth)).

### i18n, theme, timezones, toast (admin UX)

- **Admin translations:** [Configuration / i18n](https://payloadcms.com/docs/configuration/i18n) — 30+ languages; see also \`payload-i18n.mdc\`.
- **Light / dark:** Editors choose theme on the account page; OS fallback if unset ([overview](https://payloadcms.com/docs/admin/overview#light-and-dark-modes)).
- **\`admin.timezones\`:** \`supportedTimezones\`, \`defaultTimezone\` — DB stays UTC; display for editors ([overview — Timezones](https://payloadcms.com/docs/admin/overview#timezones)).
- **\`admin.toast\`:** \`duration\`, \`limit\`, \`position\`, \`expand\` ([overview — Toast](https://payloadcms.com/docs/admin/overview#toast)).

## This repo

- **Config:** \`src/payload.config.ts\` — \`admin\` + root \`routes\` as needed; \`components.afterNavLinks\`, \`components.beforeDashboard\`, \`importMap\`, \`livePreview\`, \`meta\`, \`user\`, etc.
- **Shell routes:** \`src/app/(payload)/\` — \`layout.tsx\`, \`admin/[[...segments]]/page.tsx\` — align with Payload’s app structure; read **customizing location** before renaming paths.
- **Import map:** After changing **component paths** in config, run \`pnpm generate:importmap\`. Do **not** hand-edit generated import map output — configure paths in config ([FAQ](https://payloadcms.com/docs/admin/overview#frequently-asked-questions)).

## Related Cursor rules

- **Custom components (Payload docs):** [Custom components — overview](https://payloadcms.com/docs/custom-components/overview) · rule \`payload-custom-components.mdc\`
- **Metadata / CSS / draft preview in admin:** \`payload-admin-ui-surfaces.mdc\`
- **Live preview + Next \`/api/preview\`:** \`payload-preview-drafts.mdc\`
- **Collection field admin:** [Collection admin options](https://payloadcms.com/docs/collections/admin)

## Checklist

- [ ] \`importMap.baseDir\` matches the directory that contains \`payload.config.ts\`.
- [ ] New admin component: registered under \`admin.components\` or field \`admin.components\`, then import map regenerated.
- [ ] Changing \`routes.admin\` or admin segment paths: follow [Customizing admin location](https://payloadcms.com/docs/admin/customizing-location).
`,
  },
  {
    file: 'payload-admin-ui-surfaces.mdc',
    yaml: `description: Admin UI surfaces — metadata, preview, CSS, location, React hooks, locked docs, preferences
globs: src/payload.config.ts,src/app/(payload)/**/*.{ts,tsx},src/**/*.scss,src/components/AfterNavActions/**/*.{ts,tsx},src/components/BeforeDashboard/**/*.{ts,tsx}
alwaysApply: false`,
    body: `# Admin UI surfaces (first-party docs)

Read these **before** swapping views, metadata, or admin styling.

## Doc map

| Feature | Documentation |
|---------|----------------|
| **Page metadata** (root / collection / global / view) | [Admin — Metadata](https://payloadcms.com/docs/admin/metadata) |
| **Draft preview** from admin | [Admin — Preview](https://payloadcms.com/docs/admin/preview) |
| **Custom CSS / SCSS** (global \`custom.scss\`, BEM, layers, \`@payloadcms/ui/scss\`) | [Customizing CSS & SCSS](https://payloadcms.com/docs/admin/customizing-css) |
| **Move admin URL / folder structure** | [Customizing location](https://payloadcms.com/docs/admin/customizing-location) |
| **React hooks** (admin UI client, not config \`hooks\`) | [React hooks](https://payloadcms.com/docs/admin/react-hooks) |
| **Locked documents** (concurrent editing) | [Locked documents](https://payloadcms.com/docs/admin/locked-documents) |
| **User preferences** (stored per user) | [Preferences](https://payloadcms.com/docs/admin/preferences) |
| **Replacing admin UI (React)** | [Custom components — overview](https://payloadcms.com/docs/custom-components/overview) |

## How this differs from other rules

- **\`payload-preview-drafts.mdc\`:** Next.js **\`/api/preview\`**, \`draftMode\`, \`NEXT_PRIVATE_DRAFT_SECRET\`, and **\`@payloadcms/live-preview-react\`** on the **marketing site**.
- **\`payload-hooks.mdc\`:** Config **collection/global/field hooks** — unrelated to **React hooks** above.
- **\`payload-custom-components.mdc\`:** Replacing admin UI with **custom React components** (root, list, edit, document views).

## Checklist

- [ ] Root \`admin.meta\` (title suffix, icons, OG, robots) matches branding; env-driven favicon if used (\`PAYLOAD_ADMIN_FAVICON_URL\` pattern).
- [ ] Collection/global \`admin.meta\` used when a section needs its own titles/descriptions.
- [ ] Styling: prefer \`@layer payload\` / variables from [@payloadcms/ui scss](https://github.com/payloadcms/payload/tree/3.x/packages/ui/src/scss) over brittle deep selectors.
`,
  },
  {
    file: 'payload-richtext-lexical.mdc',
    yaml: `description: Lexical rich text — features, blocks, rendering, HTML conversion
globs: src/config/payloadLexicalEditor.ts,src/components/RichText/**/*.{ts,tsx},src/fields/richText/**/*.{ts,tsx},src/collections/Docs/**/*.{ts,tsx}
alwaysApply: false`,
    body: `# Rich text (Lexical)

- **Docs:** [Rich text overview](https://payloadcms.com/docs/rich-text/overview) · [Official features](https://payloadcms.com/docs/rich-text/official-features) · [Custom features](https://payloadcms.com/docs/rich-text/custom-features) · [Converters](https://payloadcms.com/docs/rich-text/converters) · [Rendering on demand](https://payloadcms.com/docs/rich-text/rendering-on-demand)
- **Editor config:** \`src/config/payloadLexicalEditor.ts\` — \`lexicalEditor({ features: ... })\`; **Docs** collection may use a **different** feature set (\`src/collections/Docs/index.ts\` \`contentLexicalEditorFeatures\`).
- **Blocks inside Lexical:** \`BlocksFeature\` — block slugs must match **blocks registered** in schema and **JSX converters** in \`src/components/RichText/index.tsx\` (or equivalent).
- **Serialization:** Stored as JSON (**Lexical editor state**). Do not treat as HTML unless you run official conversion utilities ([Lexical → HTML](https://payloadcms.com/docs/rich-text/converting-html)) where applicable.
- **Custom nodes:** Label / LargeBody and other custom features: keep **server + client** feature pair in \`src/fields/richText/features\` in sync.

## Checklist

- [ ] New block in editor: block config in schema + converter in \`RichText\` (or \`lexicalHTML\` if you output HTML).
- [ ] \`DefaultNodeTypes\` / \`SerializedBlockNode\` types updated or extended when adding nodes.
`,
  },
  {
    file: 'payload-uploads-storage.mdc',
    yaml: `description: Upload fields, media collections, storage adapters (S3/R2/Vercel Blob)
globs: src/**/*media*/**/*.{ts,tsx},src/**/*upload*/**/*.{ts,tsx},src/plugins/**/*storage*.{ts,tsx},src/**/*storage*.{ts,tsx}
alwaysApply: false`,
    body: `# Uploads & storage

- **Docs:** [Upload field](https://payloadcms.com/docs/fields/upload) · [Storage adapters](https://payloadcms.com/docs/upload/storage-adapters)
- **Collections:** \`media\` (and any upload-enabled collection) — **relationType**, **filterOptions**, and **storage plugin** must agree with deployment target (Cloudflare vs Vercel vs Node).
- **Plugins:** This repo may use \`@payloadcms/storage-r2\`, \`@payloadcms/storage-vercel-blob\`, etc. — configure under **plugins** in \`payload.config.ts\` via \`src/plugins\`.
- **Lexical:** \`UploadFeature\` in \`payloadLexicalEditor.ts\` references upload collections and optional extra fields (\`enableLink\`, etc.).
- **URLs:** Prefer Payload-generated URLs or your CDN domain from env; do not hard-code bucket hosts in components.

## Checklist

- [ ] New env for bucket/credentials documented in \`.env.example\`.
- [ ] Preview URLs work for both admin and frontend if using signed URLs.
`,
  },
  {
    file: 'payload-preview-drafts.mdc',
    yaml: `description: Draft preview, live preview, preview route and secrets
globs: src/app/**/preview/**/*.{ts,tsx},src/**/*live-preview*/**/*.{ts,tsx},**/.env.example
alwaysApply: false`,
    body: `# Preview & drafts

- **Docs:** [Live preview overview](https://payloadcms.com/docs/live-preview/overview) · [Client](https://payloadcms.com/docs/live-preview/client) · [Server](https://payloadcms.com/docs/live-preview/server) · [Frontend](https://payloadcms.com/docs/live-preview/frontend) · [Versions / drafts](https://payloadcms.com/docs/versions/overview)
- **Admin:** \`admin.livePreview\` in \`src/payload.config.ts\` (breakpoints, collections as configured).
- **Next route:** \`src/app/(frontend)/api/preview/route.ts\` — uses \`getPayload\` and draft secret; align with \`.env.example\` (\`NEXT_PRIVATE_DRAFT_SECRET\` or project-specific names).
- **Frontend:** \`@payloadcms/live-preview-react\` in components that opt in (e.g. \`RichText\` with \`useLivePreview\` where used).
- **Do not** commit real secrets; use **server-only** env for token validation.

## Checklist

- [ ] Preview URL and secret match between CMS, env, and route handler.
- [ ] Collection has **versions** / **draft** enabled if you expect draft Preview CMS behavior.
`,
  },
  {
    file: 'payload-versions.mdc',
    yaml: `description: Versions, drafts (_status), autosave, restore workflows
globs: src/plugins/schema/**/*.{ts,tsx},src/collections/**/*.{ts,tsx}
alwaysApply: false`,
    body: `# Versions & drafts

- **Docs:** [Versions](https://payloadcms.com/docs/versions/overview) · [Drafts](https://payloadcms.com/docs/versions/drafts)
- **Collection:** \`versions: { drafts: true, ... }\` enables **\_status** and draft lifecycle; hooks may branch on **draft vs published**.
- **Queries:** Use **\`where\`** / API params to exclude drafts from public site unless intentional (\`draft=true\` query patterns per REST docs).
- **Redirects / sitemap:** Only published docs should appear — align **revalidation** with publish/ unpublish hooks if you cache by tag.

## Checklist

- [ ] Public \`find\` / \`getCachedDocument\` use correct **depth** and **where** for published-only.
- [ ] After changing version settings, run migrations if Payload requires schema updates.
`,
  },
  {
    file: 'payload-jobs.mdc',
    yaml: `description: Payload jobs queue — tasks, access, runners
globs: src/config/jobsAccess.ts,src/**/*jobs*/**/*.{ts,tsx},src/payload.config.ts
alwaysApply: false`,
    body: `# Jobs queue

- **Docs:** [Overview](https://payloadcms.com/docs/jobs-queue/overview) · [Tasks](https://payloadcms.com/docs/jobs-queue/tasks) · [Queues](https://payloadcms.com/docs/jobs-queue/queues) · [Schedules](https://payloadcms.com/docs/jobs-queue/schedules) · [Workflows](https://payloadcms.com/docs/jobs-queue/workflows) · [Quick start](https://payloadcms.com/docs/jobs-queue/quick-start-example)
- **Config:** \`buildConfig({ jobs: { access: { run: ... }, tasks: [...] } })\` — **this repo:** \`src/config/jobsAccess.ts\` for **who can run** jobs (\`jobsCanRun\`).
- **Tasks:** Define in config or plugins; ensure **idempotent** handlers and safe retries.
- **Scheduling:** Use Payload-supported cron / runner deployment — do not rely on unbounded in-request work for long tasks.

## Checklist

- [ ] Production runner has credentials and **access** allows scheduled execution context only if desired.
- [ ] Tasks registered match migrations after schema/plugin updates.
`,
  },
  {
    file: 'payload-email.mdc',
    yaml: `description: Email adapter, nodemailer, transactional email from Payload
globs: src/email/**/*.{ts,tsx},src/**/*mail*.{ts,tsx},src/payload.config.ts
alwaysApply: false`,
    body: `# Email

- **Docs:** [Email](https://payloadcms.com/docs/email/overview)
- **This repo:** \`nodemailerAdapter\` + SendGrid transport — \`src/email/sendgridMailTransport.ts\`, \`defaultFromAddress\` / \`defaultFromName\` in \`payload.config.ts\`.
- **Env:** \`SENDGRID_API_KEY\` and related vars — document in \`.env.example\`; never log secrets.
- **Forgot password / verification:** Rely on Payload auth email hooks and templates where configured on **Users**.

## Checklist

- [ ] Non-prod can disable or sandbox transactional sends.
- [ ] From domain aligns with SPF/DKIM for production domain.
`,
  },
  {
    file: 'payload-migrations.mdc',
    yaml: `description: Payload migrations — CLI, adapters, production workflow
globs: src/migrations/**/*.{ts,js},scripts/**/*migrate*.{mjs,js,ts},src/payload.config.ts
alwaysApply: false`,
    body: `# Migrations

- **Docs:** [Database migrations](https://payloadcms.com/docs/database/migrations)
- **CLI:** \`payload migrate\`, \`payload migrate:create\`, etc. — adapter-specific (Postgres, MongoDB, SQLite/D1).
- **Schema:** Migrations in \`src/migrations\` are the **source of truth** for the DB shape. Run \`payload migrate\` (this repo: \`pnpm deploy:database\`, wired before Workers/OpenNext builds) so **tables/columns exist before** static generation or runtime queries — incomplete schema (“no such table”, etc.) is addressed by **applying migrations**, not by skipping them.
- **This repo:** \`package.json\` scripts (\`deploy:database\`, \`migrate-lexical-script\`, etc.) — follow deployment docs for **Cloudflare vs Vercel**.
- **Order:** Ship migrations **before** relying on new columns/tables; coordinate with **generate:types** after schema codegen from migrations when applicable.
- **Escape hatches only:** \`SKIP_DATABASE_MIGRATE\`, \`PAYLOAD_MIGRATE_ASSUME_YES\` in \`scripts/migrate-production.mjs\` — use for [building without a DB](https://payloadcms.com/docs/production/building-without-a-db-connection), externally managed schema, or non-interactive CI **after** you understand the tradeoffs — **not** as a substitute for checked-in migrations on a real database.
- **Optional features** (\`src/plugins/env.ts\`): \`PAYLOAD_MULTI_TENANT\`, \`PAYLOAD_ECOMMERCE\`, \`PAYLOAD_MCP\`, etc. change which plugins register collections — schema is **env-conditional**. Ship migrations that cover the tables for features you deploy; this repo adds migrations generated with the relevant flags on (e.g. tenants + ecommerce + variants + MCP). When toggling a **new** optional plugin in production, run \`payload migrate:create\` with those env vars set, review the file, register it in \`src/migrations/index.ts\`, and deploy.

## Checklist

- [ ] Migration tested against clean DB and existing data snapshot when risky.
- [ ] Lexical / plugins: dedicated migrations (\`migrateSlateToLexical\` etc.) run in controlled maintenance windows if large.
- [ ] Optional plugins you enable in prod have corresponding migration coverage (or accept empty DB until migrate runs).
`,
  },
  {
    file: 'payload-i18n.mdc',
    yaml: `description: Localization — locales in config, localized fields, frontend routing
globs: src/i18n/**/*.{ts,tsx},src/**/*localization*.{ts,tsx},src/payload.config.ts
alwaysApply: false`,
    body: `# Localization (i18n)

- **Docs:** [Localization](https://payloadcms.com/docs/configuration/localization)
- **Config:** \`localization\` in \`payload.config.ts\` — **locales**, **defaultLocale**, **fallback**; this repo uses \`src/i18n/localization.ts\`.
- **Fields:** Mark fields **localized** where content differs per locale; **nested** localized docs follow Payload rules for **locale** query params / GraphQL.
- **Frontend:** Next.js routing (\`[locale]\` or cookie/header) must agree with **locale** passed into Local API **find** / **findGlobal**.

## Checklist

- [ ] New localized field: regenerate types; update frontend locale switcher if needed.
- [ ] SEO URLs (\`plugin-seo\`) respect locale slugs if configured.
`,
  },
  {
    file: 'payload-typescript.mdc',
    yaml: `description: Generated Payload types, strict narrowing, avoid masking schema drift
globs: "**/payload-types.ts","**/payload-cloud-types.ts"
alwaysApply: false`,
    body: `# TypeScript with Payload

- **Docs:** [TypeScript](https://payloadcms.com/docs/typescript/overview)
- **Generated:** \`payload-types.ts\` (path from \`typescript.outputFile\` in config). Run **\`pnpm generate:types\`** after collection/global/field/plugin changes.
- **Relations:** Prefer **generated unions** (\`number | Media\`) + runtime narrowing over \`as any\`.
- **Cloud types:** \`payload-cloud-types.ts\` or similar — keep separate from CMS types when APIs differ.
- **Do not** manually duplicate large interfaces that **generate:types** can produce unless bridging external APIs.

## Checklist

- [ ] CI or pre-commit runs **generate:types** when schema changes (or document manual step).
- [ ] Use **\`Config\`** collection slug unions (\`keyof Config['collections']\`) where appropriate (\`getDocument\`).
`,
  },
  {
    file: 'payload-plugins.mdc',
    yaml: `description: Official Payload plugins — ordering, env flags, plugin docs
globs: src/plugins/**/*.{ts,tsx},src/plugins/**/*.mts
alwaysApply: false`,
    body: `# Payload plugins

- **Docs:** [Plugins overview](https://payloadcms.com/docs/plugins/overview)
- **Pipeline:** \`src/plugins/index.ts\` — **schema first**, then optional MCP/multi-tenant/ecommerce, then **website** bundle (\`src/plugins/website\`), then **opsCounter** / analytics last so counters see all collections.
- **Installed (examples):** \`plugin-seo\`, \`plugin-redirects\`, \`plugin-nested-docs\`, \`plugin-form-builder\`, \`plugin-multi-tenant\`, \`plugin-ecommerce\`, \`plugin-mcp\`, storage plugins — each has official docs under **Plugins**.
- **Env:** Feature flags in \`src/plugins/env.ts\` (or similar) — enabling a plugin may require **migrate** and **generate:types**.
- **Ordering matters:** Plugins that add collections/hooks should load before code that depends on them.

## Per-plugin deep links (bookmark)

- [SEO](https://payloadcms.com/docs/plugins/seo) · [Redirects](https://payloadcms.com/docs/plugins/redirects) · [Nested docs](https://payloadcms.com/docs/plugins/nested-docs) · [Form builder](https://payloadcms.com/docs/plugins/form-builder) · [Multi-tenant](https://payloadcms.com/docs/plugins/multi-tenant) · [Ecommerce](https://payloadcms.com/docs/plugins/ecommerce) · [MCP](https://payloadcms.com/docs/plugins/mcp)

## Checklist

- [ ] New plugin: read plugin doc + add env + migrate + types.
- [ ] Cross-plugin conflicts (same slug, same route): resolved in \`getPlugins\` order or options.
`,
  },
  {
    file: 'payload-security-deployment.mdc',
    yaml: `description: Deployment, abuse prevention, secrets, CORS, CSRF, serverURL, trusted origins
globs: src/config/trustedOrigins.ts,src/utilities/getURL.ts,src/payload.config.ts
alwaysApply: false`,
    body: `# Security & deployment (Payload)

- **Docs:** [Deployment](https://payloadcms.com/docs/production/deployment) · [Preventing abuse](https://payloadcms.com/docs/production/preventing-abuse) · [Building without a DB](https://payloadcms.com/docs/production/building-without-a-db-connection) (hub: \`payload-deployment.mdc\`) · [CORS / CSRF](https://payloadcms.com/docs/security/overview)
- **Secrets:** \`PAYLOAD_SECRET\` must be strong and unique per environment; **never** client-expose. Draft / preview secrets: **server-only** (\`NEXT_PRIVATE_*\` patterns).
- **Abuse:** Rate-limit / protect public REST, GraphQL, and auth routes; lock down **GraphQL** if exposed; avoid expensive defaults on anonymous APIs (see [preventing abuse](https://payloadcms.com/docs/production/preventing-abuse)).
- **CORS / CSRF:** \`cors\` and \`csrf\` in \`payload.config.ts\` — **this repo:** \`getTrustedOrigins()\` from \`src/config/trustedOrigins.ts\`; align with **live domains** and preview URLs.
- **serverURL / cookie domain:** \`getServerSideURL()\` / utilities — must match how users reach admin and API over HTTPS in prod.
- **File / env access:** Admin and API routes should not leak \`process.env\` to the client bundle.

## Checklist

- [ ] Staging and production have distinct **secrets** and **DB** credentials.
- [ ] \`trustedOrigins\` includes admin origin, site origin, and preview origin if different.
- [ ] Public APIs and login routes reviewed for **abuse** (limits, auth, GraphQL exposure).
`,
  },
  {
    file: 'payload-performance.mdc',
    yaml: `description: depth, select, pagination, indexes — avoid over-fetching in Local API
globs: src/app/_data/**/*.{ts,tsx},src/utilities/getDocument.ts,src/utilities/getRedirects.ts,src/**/*getPayload*.{ts,tsx}
alwaysApply: false`,
    body: `# Performance

- **Docs:** [Performance](https://payloadcms.com/docs/performance/overview) · [Queries](https://payloadcms.com/docs/queries/overview) · [Query depth](https://payloadcms.com/docs/queries/depth) · [Select](https://payloadcms.com/docs/queries/select) · [Database indexes](https://payloadcms.com/docs/database/indexes)
- **Local API:** Prefer **\`select\`** to trim fields, **\`depth\` as low as** still correct for the UI, **\`limit\` + pagination** for lists. Avoid \`depth: 10\` by default. Depth does not apply to GraphQL the same way — query **shape** determines population ([depth doc](https://payloadcms.com/docs/queries/depth)).
- **Caching:** Next \`unstable_cache\` / \`revalidateTag\` — **cache keys must include** \`depth\` (and locale if localized) when caching \`find\` results (see \`getDocument.ts\`).
- **Hooks / APIs:** Keep hooks and validations lightweight; offload long work to [jobs](https://payloadcms.com/docs/jobs-queue/overview). Block references reduce admin payload ([blocks field](https://payloadcms.com/docs/fields/blocks#block-references)).

## Checklist

- [ ] List pages: measure N+1 from population; reduce **depth** or split queries.
- [ ] **\`defaultDepth\`** in config is understood project-wide (this repo sets it in \`payload.config.ts\`).
`,
  },
  {
    file: 'payload-multi-tenant.mdc',
    yaml: `description: plugin-multi-tenant — tenants, access, scoping queries
globs: src/plugins/multi-tenant/**/*.{ts,tsx},src/plugins/env.ts,src/payload.config.ts
alwaysApply: false`,
    body: `# Multi-tenant plugin

- **Docs:** [Multi-tenant plugin](https://payloadcms.com/docs/plugins/multi-tenant)
- **This repo:** Optional via env (\`package.json\` / \`src/plugins/env\`); may scope **pages** and **tenants** collection.
- **Access:** Tenant membership must gate **read/update**; default tenant for new docs as per plugin config.
- **Queries:** Every \`find\` for tenant content must pass **tenant** context (API/Local) as the plugin requires.

## Checklist

- [ ] Enabling: run \`payload migrate\` and **generate:types** (per project README / package.json descriptions).
- [ ] No cross-tenant leakage in public routes or GraphQL.
`,
  },
  {
    file: 'payload-ecommerce.mdc',
    yaml: `description: plugin-ecommerce — payments, carts, Stripe, webhooks
globs: src/plugins/ecommerce/**/*.{ts,tsx},src/plugins/env.ts,src/payload.config.ts
alwaysApply: false`,
    body: `# Ecommerce plugin

- **Docs:** [Ecommerce overview](https://payloadcms.com/docs/ecommerce/overview) · [Ecommerce plugin](https://payloadcms.com/docs/plugins/ecommerce)
- **This repo:** Optional (\`@payloadcms/plugin-ecommerce\`); Stripe keys and webhooks documented in \`package.json\` / \`.env.example\`.
- **Payments:** Webhook route must **verify** Stripe signature; use idempotent order updates.
- **Users as customers:** Align with **Users** collection and **auth**; do not store raw card data.

## Checklist

- [ ] \`PAYLOAD_ECOMMERCE\` / Stripe env vars set per environment.
- [ ] Test checkout and webhook in staging with Stripe test mode.
`,
  },
  {
    file: 'payload-form-builder.mdc',
    yaml: `description: plugin-form-builder — forms, submissions, validation
globs: src/plugins/schema/**/*form*.{ts,tsx},src/components/CMSForm/**/*.{ts,tsx},src/**/form-submissions/**/*.{ts,tsx}
alwaysApply: false`,
    body: `# Form builder plugin

- **Docs:** [Form builder](https://payloadcms.com/docs/plugins/form-builder)
- **This repo:** \`@payloadcms/plugin-form-builder\` integrated via website plugin / schema; submissions API and **CMSForm** frontend must stay in sync.
- **Validation:** Server-side validation per Payload; never trust client-only checks for PII.
- **Spam / rate limit:** Consider edge or server rate limits on public submission routes.

## Checklist

- [ ] New form field type: admin + frontend renderer + types regenerated.
- [ ] Submission storage and **PII** comply with privacy policy (e.g. \`src/providers/Privacy\`).
`,
  },
  {
    file: 'payload-hooks.mdc',
    yaml: `description: Payload hooks — root, collection, global, field, context (not React admin hooks)
globs: src/**/*hooks*/**/*.{ts,tsx},src/**/hooks/**/*.{ts,tsx},src/payload.config.ts,src/collections/**/*.ts,src/plugins/schema/**/*.ts
alwaysApply: false`,
    body: `# Hooks

Official docs are the source of truth for execution order and arguments.

- **Overview:** [Hooks](https://payloadcms.com/docs/hooks/overview) — collection, global, field, and **root** hooks (\`buildConfig({ hooks: { afterError } })\`).
- **By surface:** [Collection hooks](https://payloadcms.com/docs/hooks/collections) · [Global hooks](https://payloadcms.com/docs/hooks/globals) · [Field hooks](https://payloadcms.com/docs/hooks/fields)
- **Context:** [Context](https://payloadcms.com/docs/hooks/context) — use \`req.context\` to pass data between hooks on the same request; use flags to avoid infinite loops when calling \`payload.update\` from \`afterChange\`.
- **Performance:** [Hooks performance](https://payloadcms.com/docs/hooks/overview#performance) — keep hooks cheap; heavy work belongs in [jobs](https://payloadcms.com/docs/jobs-queue/overview).

## Do not confuse with

- **Admin React hooks** ([react-hooks](https://payloadcms.com/docs/admin/react-hooks)) — UI/client helpers, unrelated to config \`hooks\`.

## Checklist

- [ ] Hook needs \`overrideAccess\` / \`req\` usage matches Local API docs.
- [ ] Root \`afterError\` used for logging or transforming errors, not business logic that belongs in domain services.
`,
  },
  {
    file: 'payload-queries.mdc',
    yaml: `description: Where operators, depth, sort, pagination, select — same language across APIs
globs: src/**/*where*.{ts,tsx},src/app/_data/**/*.{ts,tsx},src/utilities/getDocument.ts,src/utilities/getRedirects.ts
alwaysApply: false`,
    body: `# Queries

Payload uses one querying model across [Local](https://payloadcms.com/docs/local-api/overview), [REST](https://payloadcms.com/docs/rest-api/overview), and [GraphQL](https://payloadcms.com/docs/graphql/overview).

- **Overview:** [Querying](https://payloadcms.com/docs/queries/overview) — \`Where\` type, **and** / **or**, operators (\`equals\`, \`in\`, \`like\`, …). Queries work inside [\`access\`](https://payloadcms.com/docs/access-control/overview) functions too.
- **Depth:** [Depth](https://payloadcms.com/docs/queries/depth) — controls relationship population; **GraphQL uses query shape instead** (banner in official doc).
- **Fine-tuning:** [Sort](https://payloadcms.com/docs/queries/sort) · [Pagination](https://payloadcms.com/docs/queries/pagination) · [Select](https://payloadcms.com/docs/queries/select)

## Checklist

- [ ] Frequent filters use indexed fields ([indexes](https://payloadcms.com/docs/database/indexes)).
- [ ] Public routes exclude drafts via \`where\` / \`_status\` when using versions ([drafts](https://payloadcms.com/docs/versions/drafts)).
`,
  },
  {
    file: 'payload-folders-trash-presets.mdc',
    yaml: `description: Folders (beta), trash (soft delete), query presets — collection + root config
globs: src/payload.config.ts,src/collections/**/*.ts,src/plugins/schema/**/*.ts
alwaysApply: false`,
    body: `# Folders, trash & query presets

- **Folders:** [Folders](https://payloadcms.com/docs/folders/overview) — opt-in per collection (\`folders: true\`); root \`buildConfig({ folders: { ... } })\`. **Beta** — may change in minors.
- **Trash:** [Trash](https://payloadcms.com/docs/trash/overview) — \`trash: true\` adds soft delete (\`deletedAt\`); pass \`trash: true\` on operations when you must include deleted docs ([API behavior](https://payloadcms.com/docs/trash/overview#api-support)).
- **Query presets:** [Query presets](https://payloadcms.com/docs/query-presets/overview) — \`enableQueryPresets\` on collections; optional root \`queryPresets\` for access and labels.

## Checklist

- [ ] Public \`find\` excludes trashed docs unless product requires otherwise.
- [ ] Folder-related collections migrated after enabling folders (follow migrations doc).
`,
  },
  {
    file: 'payload-custom-components.mdc',
    yaml: `description: Custom components overview + admin UI swaps — https://payloadcms.com/docs/custom-components/overview
globs: src/**/importMap*.{ts,tsx},src/components/AfterNavActions/**/*.{ts,tsx},src/components/BeforeDashboard/**/*.{ts,tsx},src/**/admin/**/*.{ts,tsx},src/payload.config.ts
alwaysApply: false`,
    body: `# Custom admin components

**Official entry:** [Custom components — overview](https://payloadcms.com/docs/custom-components/overview) — replace or extend Admin Panel UI with React; read **performance** on that page ([#performance](https://payloadcms.com/docs/custom-components/overview#performance)).

- **Surfaces:** [Root components](https://payloadcms.com/docs/custom-components/root-components) · [Custom providers](https://payloadcms.com/docs/custom-components/custom-providers) · [Dashboard](https://payloadcms.com/docs/custom-components/dashboard)
- **Views:** [List view](https://payloadcms.com/docs/custom-components/list-view) · [Edit view](https://payloadcms.com/docs/custom-components/edit-view) · [Document views](https://payloadcms.com/docs/custom-components/document-views) · [Custom views](https://payloadcms.com/docs/custom-components/custom-views)

## Repo wiring

- Register paths in \`payload.config.ts\` \`admin.components\`; run **\`pnpm generate:importmap\`** after moving or adding components.

## Checklist

- [ ] Server vs client boundaries respected for imported modules.
`,
  },
  {
    file: 'payload-local-api-advanced.mdc',
    yaml: `description: Local API — server functions, non-Next usage, access in Local API
globs: src/lib/getPayload.ts,src/**/*server*.ts,src/app/**/*.{ts,tsx}
alwaysApply: false`,
    body: `# Local API (advanced)

Core entry remains [\`getPayload\`](https://payloadcms.com/docs/local-api/overview) + config.

- **Server Functions:** [Server functions](https://payloadcms.com/docs/local-api/server-functions) — patterns outside classic route handlers where Local API is still valid.
- **Outside Next.js:** [Outside Next.js](https://payloadcms.com/docs/local-api/outside-nextjs) — standalone Node / custom servers must still load config and adapter consistently.
- **Access:** [Local API access control](https://payloadcms.com/docs/local-api/access-control) — \`overrideAccess\`, \`user\`, and when bypass applies.

## Repo

- Prefer \`@root/lib/getPayload\` in this codebase; match **depth** / **locale** to consumers.

## Checklist

- [ ] Long-running **CLI scripts** use \`getPayload({ config })\` with \`@payload-config\` (e.g. \`fetchDiscord.ts\`). \`src/migrate.ts\` uses \`@root/lib/getPayload\` like Next.
`,
  },
  {
    file: 'payload-docs-support.mdc',
    yaml: `description: Migration guides, troubleshooting, integrations — read before large upgrades
globs: src/migrations/**/*.{ts,js},scripts/**/*migrate*.{mjs,js,ts}
alwaysApply: false`,
    body: `# Migration & troubleshooting (official)

- **Migration guide:** [Overview](https://payloadcms.com/docs/migration-guide/overview) — major-version upgrades; pair with [database migrations](https://payloadcms.com/docs/database/migrations).
- **Troubleshooting:** [Troubleshooting](https://payloadcms.com/docs/troubleshooting/troubleshooting) — common errors and fixes.
- **Integrations:** [Vercel Content Link](https://payloadcms.com/docs/integrations/vercel-content-link) — optional CMS wiring for Vercel deployments.

Use these before guessing behavior changes across Payload minors/majors.

## Checklist

- [ ] After upgrade: run migrations, **\`pnpm generate:types\`**, smoke-test admin and critical APIs.
`,
  },
  {
    file: 'payload-features-overview.mdc',
    yaml: `description: Payload feature areas — official overview docs ↔ Cursor rules (hub)
alwaysApply: true`,
    body: `# Payload features — overview index

Start from the **official overview** for each feature; use the **Cursor rule** for this repo’s paths and conventions.

${hubTable3(
      '| Feature area | Official overview | Cursor rule |',
      '|--------------|-------------------|-------------|',
      FEATURE_HUB_ROWS,
    )}

${MORE_FEATURES_HUB}

${REGEN_FOOTER_FEATURES}
`,
  },
  {
    file: 'payload-deployment.mdc',
    yaml: `description: Deployment & production — build without DB, deploy, abuse prevention, performance (hub)
alwaysApply: true`,
    body: `# Payload deployment & production

Start from the **official doc** for each topic; use the **Cursor rule** for this repo’s paths.

${hubTable3('| Topic | Official doc | Cursor rule |', '|-------|--------------|-------------|', DEPLOYMENT_HUB_ROWS)}

**This repo (CI / static build):** \`next.config.js\`, \`scripts/build.mjs\`, \`scripts/lib/deploymentTarget.mjs\`. **Default:** \`pnpm build\` on the Cloudflare path runs \`deploy:database\` → \`payload migrate\` first so **D1 matches \`src/migrations\`** before OpenNext/SSG (see \`payload-migrations.mdc\`). **Optional:** follow Payload’s **[building without a DB](https://payloadcms.com/docs/production/building-without-a-db-connection)** when you intentionally disconnect or use \`SKIP_DATABASE_MIGRATE\` for special pipelines.

## Checklist

- [ ] CI either runs migrations against a real DB before SSG **or** deliberately follows **[building without a DB](https://payloadcms.com/docs/production/building-without-a-db-connection)** when no \`DATABASE_URI\` (or equivalent) is present.
- [ ] **[Deployment](https://payloadcms.com/docs/production/deployment)** and **[preventing abuse](https://payloadcms.com/docs/production/preventing-abuse)** reflected in \`payload-security-deployment.mdc\` (origins, secrets, API exposure).
- [ ] Runtime **[performance](https://payloadcms.com/docs/performance/overview)** via \`payload-performance.mdc\` (\`depth\`, \`select\`, indexes).

${MORE_DEPLOYMENT_HUB}

${REGEN_FOOTER_SHORT}
`,
  },
  {
    file: 'payload-examples.mdc',
    yaml: `description: Official examples & templates — examples/overview (reference apps)
globs: scripts/**/*.{mjs,ts,js}
alwaysApply: false`,
    body: `# Payload examples (official)

- **Docs:** [Examples overview](https://payloadcms.com/docs/examples/overview) — official templates, starters, and reference applications.
- **This repo:** When adding a feature, compare with the **closest** official example; copy patterns, not file-for-file (this codebase has its own layout).
- **Upgrades:** Example repos may track latest Payload; align version in \`package.json\` before diffing.

## Checklist

- [ ] Skim the relevant example in the overview before a large feature (auth, multi-tenant, ecommerce, etc.).
`,
  },
  {
    file: 'payload-ecosystem.mdc',
    yaml: `description: Payload ecosystem — plugins, commerce, examples, integrations (hub)
alwaysApply: true`,
    body: `# Payload ecosystem

Start from the **official overview** for each area; use the **Cursor rule** for this repo’s paths and conventions.

${hubTable3('| Area | Official overview | Cursor rule |', '|------|-------------------|-------------|', ECOSYSTEM_HUB_ROWS)}

**Note:** The [Ecommerce plugin](https://payloadcms.com/docs/plugins/ecommerce) doc is the reference for \`@payloadcms/plugin-ecommerce\`; the **Ecommerce overview** is the product-level entry for commerce on Payload.

${MORE_ECOSYSTEM_HUB}

${REGEN_FOOTER_SHORT}
`,
  },
]

function main() {
  fs.mkdirSync(rulesDir, { recursive: true })
  for (const { file, yaml, body } of rules) {
    const out = `---\n${yaml}\n---\n\n${body.trim()}\n`
    fs.writeFileSync(`${rulesDir}/${file}`, out, 'utf8')
    process.stdout.write(`Wrote .cursor/rules/${file}\n`)
  }
  process.stdout.write(`\nDone. ${rules.length} payload-* rules written (payload-basics.mdc unchanged — edit separately).\n`)
}

main()
