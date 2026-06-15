import type { Payload } from 'payload'

import type { Content } from '@root/payload-types'

import { uuidTags } from '@uuid'
import { marketingContentEnabled } from '@root/plugins/env'
import { revalidateTagImmediate } from '@utilities/revalidateTagImmediate'
import { safeRevalidatePath } from '@utilities/safeRevalidate'

/**
 * Reusable, idempotent demo seed shared by the CLI script (`src/scripts/seed.ts`) and the
 * browser-triggered endpoint (`src/endpoints/seed.ts`). Pass the request/runtime `payload`
 * instance so that, when invoked inside a request, the collection/global `afterChange` hooks
 * revalidate the Next.js cache (CLI runs no-op revalidation via `safeRevalidate`).
 *
 * Contract: creates MISSING pages and initializes globals only when clearly empty/unset.
 * Never overwrites existing documents (same slug) or globals that already have content.
 */

/** Minimal Lexical root for one paragraph (content block `columnOne`). */
const WELCOME_LEXICAL: Content['contentFields']['columnOne'] = {
  root: {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: 'Welcome. Edit this page in the Payload admin.',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        textStyle: '',
        version: 1,
      },
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  },
}

async function pageWithSlugExists(payload: Payload, slug: string): Promise<boolean> {
  const found = await payload.find({
    collection: 'pages',
    limit: 1,
    overrideAccess: true,
    where: { slug: { equals: slug } },
  })
  return found.totalDocs > 0
}

async function ensureMarketingShell(payload: Payload, log: string[]): Promise<void> {
  if (!marketingContentEnabled()) {
    log.push('PAYLOAD_TEMPLATE_MARKETING is off — skipping nav/footer globals')
    return
  }

  const footer = await payload.findGlobal({ slug: 'footer', overrideAccess: true })
  const hasFooterColumns = Array.isArray(footer.columns) && footer.columns.length > 0
  if (!hasFooterColumns) {
    await payload.updateGlobal({
      slug: 'footer',
      data: { columns: [{ label: 'Links', navItems: [] }] },
      overrideAccess: true,
    })
    log.push('Seeded global: footer (first run only)')
  } else {
    log.push('Skip footer — columns already present (no overwrite)')
  }

  const mainMenu = await payload.findGlobal({ slug: 'main-menu', overrideAccess: true })
  const m = mainMenu.menuCta
  const hasMenuCta =
    Boolean(m) &&
    typeof m === 'object' &&
    (m.type === 'custom' ? Boolean(m.url) : m.type === 'reference' && m.reference != null)
  const hasTabs = Array.isArray(mainMenu.tabs) && mainMenu.tabs.length > 0
  if (!hasMenuCta && !hasTabs) {
    await payload.updateGlobal({
      slug: 'main-menu',
      data: {
        menuCta: { type: 'custom', label: 'Home', newTab: false, url: '/' },
        tabs: mainMenu.tabs ?? [],
      },
      overrideAccess: true,
    })
    log.push('Seeded global: main-menu (empty menu only)')
  } else {
    log.push('Skip main-menu — CTA or tabs already set (no overwrite)')
  }

  const topBar = await payload.findGlobal({ slug: 'topBar', overrideAccess: true })
  const topBarToggleUnset = topBar.enableTopBar !== true && topBar.enableTopBar !== false
  if (topBarToggleUnset) {
    await payload.updateGlobal({
      slug: 'topBar',
      data: { enableTopBar: false },
      overrideAccess: true,
    })
    log.push('Seeded global: topBar default (toggle was unset)')
  } else {
    log.push('Skip topBar — enableTopBar already stored (no overwrite)')
  }
}

async function ensureHomePage(payload: Payload, log: string[]): Promise<void> {
  if (await pageWithSlugExists(payload, 'home')) {
    log.push('Skip page — slug "home" already exists (no overwrite)')
    return
  }

  await payload.create({
    collection: 'pages',
    data: {
      slug: 'home',
      _status: 'published',
      hero: { type: 'default' },
      layout: [
        {
          blockType: 'content',
          contentFields: { columnOne: WELCOME_LEXICAL, layout: 'oneColumn' },
        },
      ],
      title: 'Home',
    },
    overrideAccess: true,
  })
  log.push('Created published page: home (/)')
}

export async function seedDemoContent(payload: Payload): Promise<string[]> {
  const log: string[] = ['Starting…']
  await ensureMarketingShell(payload, log)
  await ensureHomePage(payload, log)
  // Refresh frontend caches so seeded content shows immediately. No-ops outside a request (CLI);
  // real inside the /api/seed endpoint.
  revalidateTagImmediate(uuidTags.collectionSlug('pages', 'home'))
  safeRevalidatePath('/', 'layout')
  log.push('Done — revalidated home page cache.')
  return log
}
