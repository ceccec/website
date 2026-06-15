/* eslint-disable no-console */
/**
 * **Seed contract (idempotent, safe re-runs):**
 * - Creates **missing** pages and initializes globals only when they are clearly **empty / unset**.
 * - **Never** updates or replaces documents that already exist (same slug), or globals that already
 *   have editor content (footer columns, menu tabs/CTA, top bar toggle once set in the DB).
 * - Run again after editing CMS content → existing rows are skipped; nothing is overwritten.
 */
import 'dotenv/config'

import type { Payload } from 'payload'

import type { Content } from '@root/payload-types'

import { marketingContentEnabled } from '@root/plugins/env'
import { getPayload } from '@root/plugins/payload-runtime/getPayload'

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

async function ensureMarketingShell() {
  if (!marketingContentEnabled()) {
    console.log('[seed] PAYLOAD_TEMPLATE_MARKETING is off — skipping nav/footer globals')
    return
  }

  const payload = await getPayload()

  const footer = await payload.findGlobal({ slug: 'footer', overrideAccess: true })
  const hasFooterColumns = Array.isArray(footer.columns) && footer.columns.length > 0
  if (!hasFooterColumns) {
    await payload.updateGlobal({
      slug: 'footer',
      data: {
        columns: [{ label: 'Links', navItems: [] }],
      },
      overrideAccess: true,
    })
    console.log('[seed] Seeded empty global: footer (first run only)')
  } else {
    console.log('[seed] Skip footer — columns already present (no overwrite)')
  }

  const mainMenu = await payload.findGlobal({ slug: 'main-menu', overrideAccess: true })
  const m = mainMenu.menuCta
  const hasMenuCta =
    Boolean(m) &&
    typeof m === 'object' &&
    (m.type === 'custom'
      ? Boolean(m.url)
      : m.type === 'reference' && m.reference != null)
  const hasTabs = Array.isArray(mainMenu.tabs) && mainMenu.tabs.length > 0
  if (!hasMenuCta && !hasTabs) {
    await payload.updateGlobal({
      slug: 'main-menu',
      data: {
        menuCta: {
          type: 'custom',
          label: 'Home',
          newTab: false,
          url: '/',
        },
        tabs: mainMenu.tabs ?? [],
      },
      overrideAccess: true,
    })
    console.log('[seed] Seeded global: main-menu (empty menu only)')
  } else {
    console.log('[seed] Skip main-menu — CTA or tabs already set (no overwrite)')
  }

  const topBar = await payload.findGlobal({ slug: 'topBar', overrideAccess: true })
  const topBarToggleUnset = topBar.enableTopBar !== true && topBar.enableTopBar !== false
  if (topBarToggleUnset) {
    await payload.updateGlobal({
      slug: 'topBar',
      data: { enableTopBar: false },
      overrideAccess: true,
    })
    console.log('[seed] Seeded global: topBar default (toggle was unset)')
  } else {
    console.log('[seed] Skip topBar — enableTopBar already stored (no overwrite)')
  }
}

async function ensureHomePage() {
  const payload = await getPayload()

  if (await pageWithSlugExists(payload, 'home')) {
    console.log('[seed] Skip page — slug "home" already exists (no overwrite)')
    return
  }

  await payload.create({
    collection: 'pages',
    data: {
      slug: 'home',
      _status: 'published',
      hero: {
        type: 'default',
      },
      layout: [
        {
          blockType: 'content',
          contentFields: {
            columnOne: WELCOME_LEXICAL,
            layout: 'oneColumn',
          },
        },
      ],
      title: 'Home',
    },
    overrideAccess: true,
  })
  console.log('[seed] Created published page: home (/)')
}

async function run() {
  console.log('[seed] Starting…')
  await ensureMarketingShell()
  await ensureHomePage()
  console.log('[seed] Done.')
}

try {
  await run()
  process.exit(0)
} catch (e: unknown) {
  console.error('[seed] Failed:', e)
  process.exit(1)
}
