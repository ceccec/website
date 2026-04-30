import type { TypedUser } from 'payload'

/** One row of `users.tenants` including plugin-injected `tenant` and domain `roles`. */
export type TenantMembershipRow = {
  id?: string
  roles?: null | string[]
  tenant?: { id?: number | string } | null | number | string
}

/** Platform-wide admin (`users.roles` includes `admin`) — all tenants, bypass domain roles. */
export function isGlobalPlatformAdmin(user: null | TypedUser | undefined): boolean {
  return Boolean(
    user &&
      typeof user === 'object' &&
      'roles' in user &&
      Array.isArray((user as { roles?: string[] }).roles) &&
      (user as { roles: string[] }).roles.includes('admin'),
  )
}

export function getTenantIdFromMembershipRow(row: TenantMembershipRow): number | string | undefined {
  const t = row.tenant
  if (t === null || t === undefined) {return undefined}
  if (typeof t === 'object' && 'id' in t && t.id !== undefined && t.id !== null) {
    return t.id
  }
  return t as number | string
}

/**
 * Domain-scoped roles for `tenantId` from `users.tenants`. Empty if unassigned.
 * Global admin does not receive synthetic roles here — use {@link isGlobalPlatformAdmin} first.
 */
export function rolesForTenant(
  user: null | TypedUser | undefined,
  tenantId: number | string,
): string[] {
  if (!user || typeof user !== 'object') {return []}
  const rows = (user as { tenants?: null | TenantMembershipRow[] }).tenants
  if (!Array.isArray(rows)) {return []}
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
  user: null | TypedUser | undefined,
  tenantId: number | string,
  ...allowed: string[]
): boolean {
  if (isGlobalPlatformAdmin(user)) {return true}
  const assigned = rolesForTenant(user, tenantId)
  return allowed.some((role) => assigned.includes(role))
}
