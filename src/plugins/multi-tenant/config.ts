import type { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant'

/** Options for `@payloadcms/plugin-multi-tenant` (`examples/multi-tenant`). */
export const multiTenantPluginConfig: Parameters<typeof multiTenantPlugin>[0] = {
  cleanupAfterTenantDelete: true,
  collections: {
    pages: {
      useTenantAccess: false,
    },
  },
  tenantsArrayField: {
    includeDefaultField: true,
  },
  userHasAccessToAllTenants: (user) =>
    Boolean(
      user &&
        typeof user === 'object' &&
        'roles' in user &&
        Array.isArray((user as { roles?: string[] }).roles) &&
        (user as { roles: string[] }).roles.includes('admin'),
    ),
}
