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
