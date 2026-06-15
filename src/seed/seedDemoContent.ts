import type { Payload } from 'payload'

import type { Content } from '@root/payload-types'

import { uuidTags } from '@uuid'
import { marketingContentEnabled } from '@root/plugins/env'
import { revalidateTagImmediate } from '@utilities/revalidateTagImmediate'
import { safeRevalidatePath } from '@utilities/safeRevalidate'

/**
 * Reusable, idempotent demo seed shared by the CLI script (`src/scripts/seed.ts`) and the
 * browser-triggered endpoint (`src/endpoints/seed.ts`). Pass the request/runtime `payload` so that,
 * inside a request, the seeded docs' `afterChange` hooks revalidate the Next.js cache (the CLI runs
 * no-op revalidation via `safeRevalidate`).
 *
 * Contract: creates MISSING pages/category/post and initializes globals only when clearly empty.
 * Never overwrites existing documents (same slug) or globals that already have content.
 *
 * Uploads are intentionally avoided: pages use a content block, the demo post is a guest-authored
 * video post (`featuredMedia: 'videoUrl'` + `dynamicThumbnail`), so no Media file is required.
 */

type Lexical = Content['contentFields']['columnOne']

/** Minimal Lexical root holding a single paragraph of `text`. */
function paragraph(text: string): Lexical {
  return {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            { type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text, version: 1 },
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

async function ensurePage(
  payload: Payload,
  log: string[],
  page: { slug: string; text: string; title: string },
): Promise<void> {
  if (await pageWithSlugExists(payload, page.slug)) {
    log.push(`Skip page — slug "${page.slug}" already exists (no overwrite)`)
    return
  }

  await payload.create({
    collection: 'pages',
    data: {
      slug: page.slug,
      _status: 'published',
      hero: { type: 'default' },
      layout: [
        {
          blockType: 'content',
          contentFields: { columnOne: paragraph(page.text), layout: 'oneColumn' },
        },
      ],
      title: page.title,
    },
    overrideAccess: true,
  })
  log.push(`Created published page: ${page.title} (/${page.slug === 'home' ? '' : page.slug})`)
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

async function ensureCategory(payload: Payload, log: string[]): Promise<null | string> {
  const existing = await payload.find({
    collection: 'categories',
    limit: 1,
    overrideAccess: true,
    where: { slug: { equals: 'tutorials' } },
  })
  if (existing.totalDocs > 0) {
    log.push('Skip category — slug "tutorials" already exists (no overwrite)')
    return String(existing.docs[0].id)
  }

  const created = await payload.create({
    collection: 'categories',
    data: {
      name: 'Tutorials',
      slug: 'tutorials',
      description: 'Guides, how-tos, and walkthroughs.',
      headline: 'Tutorials',
    },
    overrideAccess: true,
  })
  log.push('Created category: Tutorials')
  return String(created.id)
}

async function ensureDemoPost(payload: Payload, log: string[], categoryId: null | string): Promise<void> {
  if (!categoryId) {
    return
  }
  const existing = await payload.find({
    collection: 'posts',
    limit: 1,
    overrideAccess: true,
    where: { slug: { equals: 'hello-world' } },
  })
  if (existing.totalDocs > 0) {
    log.push('Skip post — slug "hello-world" already exists (no overwrite)')
    return
  }

  // Guest author + video featuredMedia avoids the otherwise-required author relationship and image
  // upload. Gated: a content-block/schema mismatch logs a warning instead of failing the whole seed.
  try {
    await payload.create({
      collection: 'posts',
      data: {
        slug: 'hello-world',
        _status: 'published',
        authorType: 'guest',
        category: categoryId,
        excerpt: paragraph('A demo post seeded into the site.'),
        content: [
          {
            blockType: 'blogMarkdown',
            blogMarkdownFields: {
              markdown: 'A demo post seeded into the site. Edit it in the Payload admin.',
            },
          },
        ],
        dynamicThumbnail: true,
        featuredMedia: 'videoUrl',
        guestAuthor: 'Demo Author',
        publishedOn: new Date().toISOString(),
        title: 'Hello World',
        videoUrl: 'https://www.youtube.com/watch?v=ZK-rNEhJIDs',
      },
      overrideAccess: true,
    })
    log.push('Created post: Hello World (/posts/tutorials/hello-world)')
  } catch (err) {
    log.push(`Skip post — could not create (${err instanceof Error ? err.message : 'unknown error'})`)
  }
}

export async function seedDemoContent(payload: Payload): Promise<string[]> {
  const log: string[] = ['Starting…']

  await ensureMarketingShell(payload, log)

  await ensurePage(payload, log, {
    slug: 'home',
    text: 'Welcome. Edit this page in the Payload admin.',
    title: 'Home',
  })
  await ensurePage(payload, log, {
    slug: 'about',
    text: 'About this demo site — seeded content you can edit in the Payload admin.',
    title: 'About',
  })
  await ensurePage(payload, log, {
    slug: 'features',
    text: 'Features of this demo site, seeded for a fuller starting point.',
    title: 'Features',
  })
  await ensurePage(payload, log, {
    slug: 'pricing',
    text: 'Pricing for this demo site. Replace this placeholder copy in the admin.',
    title: 'Pricing',
  })

  const categoryId = await ensureCategory(payload, log)
  await ensureDemoPost(payload, log, categoryId)

  // Refresh frontend caches so seeded content shows immediately. No-ops outside a request (CLI);
  // real inside the /api/seed endpoint.
  revalidateTagImmediate(uuidTags.collectionSlug('pages', 'home'))
  safeRevalidatePath('/', 'layout')
  log.push('Done — revalidated home page cache.')
  return log
}
