import type { TypedUser } from 'payload'

/** One row of `users.tenants` including plugin-injected `tenant` and domain `roles`. */
export type TenantMembershipRow = {
  id?: string
  tenant?: number | string | { id?: number | string } | null
  roles?: string[] | null
}

/** Platform-wide admin (`users.roles` includes `admin`) — all tenants, bypass domain roles. */
export function isGlobalPlatformAdmin(user: TypedUser | null | undefined): boolean {
  return Boolean(
    user &&
      typeof user === 'object' &&
      'roles' in user &&
      Array.isArray((user as { roles?: string[] }).roles) &&
      (user as { roles: string[] }).roles.includes('admin'),
  )
}

export function getTenantIdFromMembershipRow(row: TenantMembershipRow): string | number | undefined {
  const t = row.tenant
  if (t === null || t === undefined) return undefined
  if (typeof t === 'object' && 'id' in t && t.id !== undefined && t.id !== null) {
    return t.id as number | string
  }
  return t as number | string
}

/**
 * Domain-scoped roles for `tenantId` from `users.tenants`. Empty if unassigned.
 * Global admin does not receive synthetic roles here — use {@link isGlobalPlatformAdmin} first.
 */
export function rolesForTenant(
  user: TypedUser | null | undefined,
  tenantId: string | number,
): string[] {
  if (!user || typeof user !== 'object') return []
  const rows = (user as { tenants?: TenantMembershipRow[] | null }).tenants
  if (!Array.isArray(rows)) return []
  const want = String(tenantId)
  for (const row of rows) {
    const tid = getTenantIdFromMembershipRow(row)
    if (tid !== undefined && String(tid) === want) {
      const r = row.roles
      return Array.isArray(r) ? r : []
    }
  }
  return []
}

/** True if global admin, or the user has any of `allowed` domain roles for this tenant. */
export function userHasTenantRole(
  user: TypedUser | null | undefined,
  tenantId: string | number,
  ...allowed: string[]
): boolean {
  if (isGlobalPlatformAdmin(user)) return true
  const assigned = rolesForTenant(user, tenantId)
  return allowed.some((role) => assigned.includes(role))
}
