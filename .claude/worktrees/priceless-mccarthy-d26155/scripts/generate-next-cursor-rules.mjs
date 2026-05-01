/**
 * Generates `.cursor/rules/next-*.mdc` from:
 *   - `scripts/definitions/next-bodies/*.md` (topic & hub markdown bodies)
 *   - Hub table rows in this file (`NEXT_FEATURE_HUB_ROWS`) for `next-features-overview.mdc`
 *   - `scripts/definitions/next-cursor-rules.manifest.json` (per-file YAML + body filename)
 *
 * Does **not** overwrite `next-basics.mdc` — edit that file by hand (same idea as `payload-basics.mdc`).
 *
 * Run: node scripts/generate-next-cursor-rules.mjs
 *      pnpm generate:cursor-rules:next
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import { hubTable3, moreLine, ruleMdc } from './lib/cursorRulesFormat.mjs'

const rootDir = fileURLToPath(new URL('..', import.meta.url))
const rulesDir = path.join(rootDir, '.cursor/rules')
const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const definitionsDir = path.join(scriptDir, 'definitions')
const bodiesDir = path.join(definitionsDir, 'next-bodies')
const manifestPath = path.join(definitionsDir, 'next-cursor-rules.manifest.json')

const REGEN_FOOTER = `
Regenerate via \`pnpm generate:cursor-rules:next\` after editing \`scripts/definitions/next-bodies/*.md\`, \`scripts/definitions/next-cursor-rules.manifest.json\`, or the hub table in \`scripts/generate-next-cursor-rules.mjs\`.
`.trim()

/** Third column must stay aligned with files in manifest + `next-basics.mdc` */
const NEXT_FEATURE_HUB_ROWS = [
  [
    '**Routing & layouts**',
    '[Project structure](https://nextjs.org/docs/app/getting-started/project-structure), [Layouts and pages](https://nextjs.org/docs/app/getting-started/layouts-and-pages), [Linking and navigating](https://nextjs.org/docs/app/getting-started/linking-and-navigating), [File conventions](https://nextjs.org/docs/app/api-reference/file-conventions)',
    ruleMdc('next-app-router-routing.mdc'),
  ],
  [
    '**Server & Client Components / rendering**',
    '[Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components), [Streaming](https://nextjs.org/docs/app/guides/streaming)',
    ruleMdc('next-server-client-and-rendering.mdc'),
  ],
  [
    '**Data fetching & mutations**',
    '[Fetching data](https://nextjs.org/docs/app/getting-started/fetching-data), [Mutating data](https://nextjs.org/docs/app/getting-started/mutating-data), [Forms](https://nextjs.org/docs/app/guides/forms)',
    ruleMdc('next-data-fetching-and-actions.mdc'),
  ],
  [
    '**Caching & revalidation**',
    '[Caching](https://nextjs.org/docs/app/getting-started/caching), [Revalidating](https://nextjs.org/docs/app/getting-started/revalidating), [How revalidation works](https://nextjs.org/docs/app/guides/how-revalidation-works)',
    ruleMdc('next-caching-revalidation.mdc'),
  ],
  [
    '**Styling**',
    '[CSS](https://nextjs.org/docs/app/getting-started/css), [Tailwind v3](https://nextjs.org/docs/app/guides/tailwind-v3-css), [Sass](https://nextjs.org/docs/app/guides/sass)',
    ruleMdc('next-styling.mdc'),
  ],
  [
    '**Images, fonts, third-party scripts**',
    '[Image optimization](https://nextjs.org/docs/app/getting-started/images), [Font optimization](https://nextjs.org/docs/app/getting-started/fonts), [Scripts](https://nextjs.org/docs/app/guides/scripts), [Third-party libraries](https://nextjs.org/docs/app/guides/third-party-libraries)',
    ruleMdc('next-images-fonts-and-scripts.mdc'),
  ],
  [
    '**Metadata & SEO**',
    '[Metadata and OG images](https://nextjs.org/docs/app/getting-started/metadata-and-og-images), [JSON-LD](https://nextjs.org/docs/app/guides/json-ld)',
    ruleMdc('next-metadata-and-og.mdc'),
  ],
  [
    '**Route Handlers & Proxy**',
    '[Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers), [Proxy](https://nextjs.org/docs/app/getting-started/proxy)',
    ruleMdc('next-route-handlers-and-proxy.mdc'),
  ],
  [
    '**Config, CLI, bundlers, adapters**',
    '[next.config.js](https://nextjs.org/docs/app/api-reference/config/next-config-js), [CLI](https://nextjs.org/docs/app/api-reference/cli), [Turbopack](https://nextjs.org/docs/app/api-reference/turbopack), [Adapters](https://nextjs.org/docs/app/api-reference/adapters)',
    ruleMdc('next-config-adapters-turbopack.mdc'),
  ],
  [
    '**Directives & runtime APIs**',
    '[Directives](https://nextjs.org/docs/app/api-reference/directives), [Functions](https://nextjs.org/docs/app/api-reference/functions), [Edge Runtime](https://nextjs.org/docs/app/api-reference/edge)',
    ruleMdc('next-api-directives-and-functions.mdc'),
  ],
  ['**Guides (topic tutorials)**', '[Guides](https://nextjs.org/docs/app/guides)', ruleMdc('next-guides-index.mdc')],
  [
    '**Deploy & production**',
    '[Deploying](https://nextjs.org/docs/app/getting-started/deploying), [Production checklist](https://nextjs.org/docs/app/guides/production-checklist), [Self-hosting](https://nextjs.org/docs/app/guides/self-hosting)',
    ruleMdc('next-deployment.mdc'),
  ],
]

function buildFeaturesOverviewBody() {
  return `# Next.js features — overview index

Start from the **official** page for each area ([nextjs.org/docs](https://nextjs.org/docs/)); use the **Cursor rule** for this repo’s paths.

${hubTable3(
  '| Feature area | Official overview | Cursor rule |',
  '|--------------|-------------------|-------------|',
  NEXT_FEATURE_HUB_ROWS,
)}

${moreLine([
  'Basics → `next-basics.mdc` (always-on)',
  'Payload integration → `payload-basics.mdc`',
  'This repo’s migrate & workers → `payload-deployment.mdc`',
])}

${REGEN_FOOTER}
`
}

function writeMdc(file, yaml, body) {
  const out = `---\n${yaml}\n---\n\n${body.trim()}\n`
  fs.writeFileSync(path.join(rulesDir, file), out, 'utf8')
  process.stdout.write(`Wrote .cursor/rules/${file}\n`)
}

function main() {
  fs.mkdirSync(rulesDir, { recursive: true })

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))

  writeMdc(
    'next-features-overview.mdc',
    `description: Next.js App Router — official overview docs ↔ Cursor rules (hub)
alwaysApply: true`,
    buildFeaturesOverviewBody(),
  )

  for (const entry of manifest) {
    const bodyPath = path.join(bodiesDir, entry.bodyFile)
    if (!fs.existsSync(bodyPath)) {
      throw new Error(`Missing body file: ${bodyPath}`)
    }
    const body = `${fs.readFileSync(bodyPath, 'utf8').trimEnd()}\n\n${REGEN_FOOTER}`
    writeMdc(entry.file, entry.yaml, body)
  }

  process.stdout.write(
    `\nDone. ${manifest.length + 1} next-* rules written (next-basics.mdc unchanged — edit by hand).\n`,
  )
}

main()
