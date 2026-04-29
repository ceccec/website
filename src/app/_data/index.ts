import { getPayload } from '@root/lib/getPayload'
import { marketingContentEnabled, partnersTemplateEnabled } from '@root/plugins/env'
import { draftMode } from 'next/headers'

import { CACHE_DEPTH } from './cacheDepths'

import type {
  Budget,
  CaseStudy,
  Category,
  CommunityHelp,
  Footer,
  Form,
  GetStarted,
  Industry,
  MainMenu,
  Page,
  Partner,
  PartnerProgram,
  Post,
  Region,
  Specialty,
  TopBar,
} from '../../payload-types'

import { emptyGetStartedGlobal, emptyMarketingLayoutGlobals } from './payloadTemplateStubs'

/** Shared `where.and` fragment: published docs only when not in draft preview. */
function publishedUnlessDraft(draft: boolean): { _status: { equals: 'published' } }[] {
  return draft ? [] : [{ _status: { equals: 'published' } }]
}

export const fetchGlobals = async (): Promise<{
  footer: Footer
  mainMenu: MainMenu
  topBar: TopBar
}> => {
  if (!marketingContentEnabled()) {
    return emptyMarketingLayoutGlobals()
  }

  const payload = await getPayload()
  const mainMenu = await payload.findGlobal({
    slug: 'main-menu',
    depth: CACHE_DEPTH.globalsShell,
  })
  const footer = await payload.findGlobal({
    slug: 'footer',
    depth: CACHE_DEPTH.globalsShell,
  })
  const topBar = await payload.findGlobal({
    slug: 'topBar',
    depth: CACHE_DEPTH.globalsShell,
  })

  return {
    footer,
    mainMenu,
    topBar,
  }
}

export const fetchPage = async (incomingSlugSegments: string[]): Promise<null | Page> => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload()
  const slugSegments = incomingSlugSegments || ['home']
  const slug = slugSegments.at(-1)

  const data = await payload.find({
    collection: 'pages',
    depth: CACHE_DEPTH.page,
    draft,
    limit: 1,
    where: {
      and: [
        {
          slug: {
            equals: slug,
          },
        },
        ...publishedUnlessDraft(draft),
      ],
    },
  })

  const pagePath = `/${slugSegments.join('/')}`

  const page = data.docs.find(({ breadcrumbs }: Page) => {
    if (!breadcrumbs) {
      return false
    }
    const { url } = breadcrumbs[breadcrumbs.length - 1]
    return url === pagePath
  })

  if (page) {
    return page
  }

  return null
}

export const fetchPages = async (): Promise<Partial<Page>[]> => {
  const payload = await getPayload()
  const data = await payload.find({
    collection: 'pages',
    depth: CACHE_DEPTH.pagesList,
    limit: 300,
    select: {
      breadcrumbs: true,
    },
    where: {
      and: [
        {
          slug: {
            not_equals: 'cloud',
          },
        },
        {
          _status: {
            equals: 'published',
          },
        },
      ],
    },
  })

  return data.docs
}

export const fetchPosts = async (): Promise<Partial<Post>[]> => {
  if (!marketingContentEnabled()) {
    return []
  }

  const payload = await getPayload()
  const data = await payload.find({
    collection: 'posts',
    depth: CACHE_DEPTH.postsList,
    limit: 300,
    select: {
      slug: true,
      category: true,
    },
  })

  return data.docs
}

export const fetchBlogPosts = async (): Promise<Partial<Post>[]> => {
  if (!marketingContentEnabled()) {
    return []
  }

  const currentDate = new Date()
  const payload = await getPayload()

  const data = await payload.find({
    collection: 'posts',
    depth: CACHE_DEPTH.postsList,
    limit: 300,
    select: {
      slug: true,
      authors: true,
      image: true,
      publishedOn: true,
      title: true,
    },
    sort: '-publishedOn',
    where: {
      and: [
        { publishedOn: { less_than_equal: currentDate } },
        { _status: { equals: 'published' } },
      ],
    },
  })
  return data.docs
}

export const fetchArchive = async (
  slug: string,
  draft?: boolean,
): Promise<Partial<Category> | undefined> => {
  if (!marketingContentEnabled()) {
    return undefined
  }

  const payload = await getPayload()
  const currentDate = new Date()

  const data = await payload.find({
    collection: 'categories',
    depth: CACHE_DEPTH.archive,
    draft,
    joins: {
      posts: {
        sort: '-publishedOn',
        where: {
          and: [
            { publishedOn: { less_than_equal: currentDate } },
            { _status: { equals: 'published' } },
          ],
        },
      },
    },
    limit: 1,
    select: {
      name: true,
      slug: true,
      description: true,
      headline: true,
      posts: true,
    },
    where: {
      and: [{ slug: { equals: slug } }],
    },
  })
  return data.docs[0]
}

export const fetchArchives = async (slug?: string): Promise<Partial<Category>[]> => {
  if (!marketingContentEnabled()) {
    return []
  }

  const payload = await getPayload()

  const data = await payload.find({
    collection: 'categories',
    depth: CACHE_DEPTH.archivesList,
    select: {
      name: true,
      slug: true,
    },
    sort: 'name',
    ...(slug && {
      where: {
        slug: {
          not_equals: slug,
        },
      },
    }),
  })

  return data.docs
}

export const fetchBlogPost = async (
  slug: string,
  category,
): Promise<Partial<Post> | undefined> => {
  if (!marketingContentEnabled()) {
    return undefined
  }

  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload()

  const data = await payload.find({
    collection: 'posts',
    depth: CACHE_DEPTH.blogPost,
    draft,
    limit: 1,
    overrideAccess: draft,
    select: {
      authors: true,
      authorType: true,
      category: true,
      content: true,
      excerpt: true,
      featuredMedia: true,
      guestAuthor: true,
      guestSocials: true,
      image: true,
      meta: true,
      publishedOn: true,
      relatedPosts: true,
      title: true,
      videoUrl: true,
    },
    where: {
      and: [
        { slug: { equals: slug } },
        { 'category.slug': { equals: category } },
        ...publishedUnlessDraft(draft),
      ],
    },
  })

  return data.docs[0]
}

export const fetchCaseStudies = async (): Promise<Partial<CaseStudy>[]> => {
  if (!marketingContentEnabled()) {
    return []
  }

  const payload = await getPayload()
  const data = await payload.find({
    collection: 'case-studies',
    depth: CACHE_DEPTH.caseStudiesList,
    limit: 300,
    select: {
      slug: true,
    },
  })

  return data.docs
}

export const fetchCaseStudy = async (slug: string): Promise<CaseStudy | undefined> => {
  if (!marketingContentEnabled()) {
    return undefined
  }

  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload()

  const data = await payload.find({
    collection: 'case-studies',
    depth: CACHE_DEPTH.caseStudy,
    draft,
    limit: 1,
    where: {
      and: [
        { slug: { equals: slug } },
        ...publishedUnlessDraft(draft),
      ],
    },
  })

  return data.docs[0]
}

export const fetchCommunityHelps = async (
  communityHelpType: CommunityHelp['communityHelpType'],
): Promise<Pick<CommunityHelp, 'slug'>[]> => {
  if (!marketingContentEnabled()) {
    return []
  }

  const payload = await getPayload()

  const data = await payload.find({
    collection: 'community-help',
    depth: CACHE_DEPTH.communityHelpsList,
    limit: 0,
    select: { slug: true },
    where: {
      and: [{ communityHelpType: { equals: communityHelpType } }, { helpful: { equals: true } }],
    },
  })

  return data.docs
}

export const fetchCommunityHelp = async (slug: string): Promise<CommunityHelp | undefined> => {
  if (!marketingContentEnabled()) {
    return undefined
  }

  const payload = await getPayload()

  const data = await payload.find({
    collection: 'community-help',
    depth: CACHE_DEPTH.communityHelp,
    limit: 1,
    where: { slug: { equals: slug } },
  })

  return data.docs[0]
}

export const fetchRelatedThreads = async (path: string): Promise<Partial<CommunityHelp>[]> => {
  if (!marketingContentEnabled()) {
    return []
  }

  const payload = await getPayload()

  const data = await payload.find({
    collection: 'community-help',
    depth: CACHE_DEPTH.relatedThreads,
    limit: 3,
    select: {
      slug: true,
      communityHelpType: true,
      title: true,
    },
    where: { 'relatedDocs.path': { equals: path } },
  })

  return data.docs
}

export const fetchPartners = async (): Promise<Partner[]> => {
  if (!partnersTemplateEnabled()) {
    return []
  }

  const payload = await getPayload()

  const data = await payload.find({
    collection: 'partners',
    depth: CACHE_DEPTH.partnersList,
    limit: 300,
    overrideAccess: false, // Respect field-level access control (excludes email and hubspotID)
    sort: 'slug',
    where: {
      AND: [{ agency_status: { equals: 'active' } }, { _status: { equals: 'published' } }],
    },
  })

  return data.docs
}

export const fetchPartner = async (slug: string): Promise<Partial<Partner> | undefined> => {
  if (!partnersTemplateEnabled()) {
    return undefined
  }

  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload()

  const data = await payload.find({
    collection: 'partners',
    depth: CACHE_DEPTH.partner,
    draft,
    limit: 1,
    populate: {
      'case-studies': {
        slug: true,
        featuredImage: true,
        meta: {
          description: true,
        },
        title: true,
      },
    },
    select: {
      name: true,
      budgets: true,
      city: true,
      content: {
        bannerImage: true,
        caseStudy: true,
        contributions: true,
        idealProject: true,
        overview: true,
        projects: true,
        services: true,
      },
      featured: true,
      industries: true,
      regions: true,
      social: true,
      specialties: true,
      topContributor: true,
      website: true,
    },
    where: {
      and: [{ slug: { equals: slug } }, ...publishedUnlessDraft(draft)],
    },
  })

  return data.docs[0]
}

export const fetchPartnerProgram = async (): Promise<Partial<PartnerProgram> | undefined> => {
  if (!partnersTemplateEnabled()) {
    return undefined
  }

  const payload = await getPayload()
  const data = await payload.findGlobal({
    slug: 'partner-program',
    depth: CACHE_DEPTH.partnerProgram,
  })

  return data
}

export const fetchFilters = async (): Promise<{
  budgets: Budget[]
  industries: Industry[]
  regions: Region[]
  specialties: Specialty[]
}> => {
  if (!partnersTemplateEnabled()) {
    return { budgets: [], industries: [], regions: [], specialties: [] }
  }

  const payload = await getPayload()

  const industries = await payload.find({
    collection: 'industries',
    depth: CACHE_DEPTH.filters,
    limit: 100,
  })

  const specialties = await payload.find({
    collection: 'specialties',
    depth: CACHE_DEPTH.filters,
    limit: 100,
  })

  const regions = await payload.find({
    collection: 'regions',
    depth: CACHE_DEPTH.filters,
    limit: 100,
  })

  const budgets = await payload.find({
    collection: 'budgets',
    depth: CACHE_DEPTH.filters,
    limit: 100,
  })

  return {
    budgets: budgets.docs,
    industries: industries.docs,
    regions: regions.docs,
    specialties: specialties.docs,
  }
}

export const fetchGetStarted = async (): Promise<GetStarted> => {
  if (!marketingContentEnabled()) {
    return emptyGetStartedGlobal()
  }

  const payload = await getPayload()
  const data = await payload.findGlobal({
    slug: 'get-started',
    depth: CACHE_DEPTH.getStarted,
  })

  return data
}

export const fetchForm = async (name: string): Promise<Form> => {
  const payload = await getPayload()

  const data = await payload.find({
    collection: 'forms',
    depth: CACHE_DEPTH.form,
    limit: 1,
    where: {
      title: {
        equals: name,
      },
    },
  })

  return data.docs[0]
}

export { CACHE_DEPTH } from './cacheDepths'
