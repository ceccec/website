/**
 * Single source of truth for Payload `find` / `findGlobal` `depth` in `index.ts` and for
 * `unstable_cache` key segments. Re-exported from `@data`. See `utilities/getDocument.ts`.
 */
export const CACHE_DEPTH = {
  archive: 2,
  archivesList: 0,
  blogPost: 2,
  caseStudiesList: 0,
  caseStudy: 1,
  communityHelp: 1,
  communityHelpsList: 0,
  filters: 1,
  form: 1,
  getStarted: 1,
  globalsShell: 1,
  page: 2,
  pagesList: 0,
  partner: 2,
  partnerProgram: 2,
  partnersList: 2,
  postsList: 1,
  relatedThreads: 0,
} as const
