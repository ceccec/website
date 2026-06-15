/**
 * Versioned Cache Tags (uuidTags)
 *
 * Rule 5: Cache Smart — Use versioned cache keys for precise cache invalidation.
 * Generic tags invalidate too much cache, hurting performance. Specific tags = better perf.
 *
 * @see PHASE_4_CACHE_AUDIT.md
 */

/**
 * Generate cache key for unstable_cache
 * Encodes tenant + request shape into a stable key for memoization
 */
export function payloadCacheKey(shape: Record<string, unknown>): string {
  // Create a deterministic string from the shape object
  return JSON.stringify(shape)
}

/**
 * Versioned cache tag namespace
 *
 * Pattern: `{resource}_{version}_{id}` or `{resource}_{version}`
 * - resource: what's being cached (user, team, project, etc)
 * - version: UUID or timestamp for invalidation (forces fresh data when updated)
 * - id: optional specific entity ID
 *
 * Usage:
 * ```typescript
 * revalidateTagImmediate(uuidTags.cloud.user)  // Invalidates all user cache
 * revalidateTagImmediate(uuidTags.cloud.userById(userId))  // Invalidates specific user
 * ```
 */
export const uuidTags = {
  /**
   * Collection/slug combo for marketing + docs sites
   * Usage: revalidateTagImmediate(uuidTags.collectionSlug('blog', 'my-post'))
   */
  collectionSlug: (collection: string, slug: string): string => {
    return `collection_${collection}_${slug}`
  },

  /**
   * Cloud-specific resource tags
   */
  cloud: {
    /** Invalidates all user-related cache */
    user: 'cloud_user_all',

    /** Invalidates cache for a specific user */
    userById: (userId: string | number): string => {
      return `cloud_user_${userId}`
    },

    /** Invalidates all team-related cache */
    teams: 'cloud_teams_all',

    /** Invalidates cache for a specific team */
    teamById: (teamId: string | number): string => {
      return `cloud_team_${teamId}`
    },

    /** Invalidates all projects cache */
    projects: 'cloud_projects_all',

    /** Invalidates cache for a specific project */
    projectById: (projectId: string | number): string => {
      return `cloud_project_${projectId}`
    },

    /**
     * Projects detail page cache (settings, env vars, etc)
     * Returns array of tags that should all be invalidated together
     */
    projectDetailRevalidateTags: (args: {
      id: string | number
      slug?: string | null
    }): string[] => {
      const tags: string[] = [
        `cloud_project_${args.id}`,
        'cloud_projects_all', // Also invalidate list views
      ]
      if (args.slug) {
        tags.push(`cloud_project_slug_${args.slug}`)
      }
      return tags
    },

    /** Invalidates cache for a specific deployment */
    deploymentById: (deploymentId: string | number): string => {
      return `cloud_deployment_${deploymentId}`
    },
  },

  /**
   * Category archive listings (`fetchArchive` / `/posts/[category]`).
   * Usage: revalidateTagImmediate(uuidTags.archivesCategory('my-category'))
   */
  archivesCategory: (categorySlug: string): string => {
    return `archives_category_${categorySlug}`
  },

  /**
   * Locale-scoped zero-arg list fetchers (posts, case studies, partners, …).
   * Usage: revalidateTagImmediate(uuidTags.localeList('posts'))
   */
  localeList: (resource: string): string => {
    return `locale_list_${resource}`
  },

  /** Invalidates all community-help cache */
  communityHelp: 'community_help_all',

  /**
   * Community-help slug listings grouped by `communityHelpType`.
   * Usage: revalidateTagImmediate(uuidTags.communityHelpTypeList('discussion'))
   */
  communityHelpTypeList: (type: string): string => {
    return `community_help_type_${type}`
  },

  /**
   * Tenant/multi-tenant public site tags
   */
  tenantsPublicSite: 'tenants_public_site_all',

  /**
   * Tenant-specific content
   */
  tenantContent: (tenantId: string | number): string => {
    return `tenant_content_${tenantId}`
  },
}

/**
 * True for plain objects/arrays worth deep-traversing (not primitives or null).
 */
export function isJsonLikeNode(value: unknown): value is Record<string, unknown> | unknown[] {
  return typeof value === 'object' && value !== null
}

/**
 * Pass-through deep wrapper for Local API doc results. UUID-precise invalidation is handled by the
 * cache tags above; doc payloads are returned unchanged.
 */
export function deepUuidWrap<T>(value: T): T {
  return value
}
