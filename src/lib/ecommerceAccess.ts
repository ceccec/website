import type { Access, FieldAccess } from 'payload'

function userIsAdmin(user: unknown): boolean {
  return Boolean(
    user &&
      typeof user === 'object' &&
      'roles' in user &&
      Array.isArray((user as { roles?: string[] }).roles) &&
      (user as { roles: string[] }).roles.includes('admin'),
  )
}

/** Field-level: admins only (matches `templates/ecommerce` access names). */
export const ecommerceAdminOnlyFieldAccess: FieldAccess = ({ req: { user } }) => userIsAdmin(user)

export const ecommerceAdminOrPublishedStatus: Access = ({ req: { user } }) => {
  if (userIsAdmin(user)) {return true}
  return { _status: { equals: 'published' } }
}

export const ecommerceIsAdmin: Access = ({ req: { user } }) => userIsAdmin(user)

export const ecommerceIsAuthenticated: Access = ({ req: { user } }) => Boolean(user)

/** Logged-in users who are not admins (“customers” for storefront flows). */
export const ecommerceIsCustomer: FieldAccess = ({ req: { user } }) =>
  Boolean(user && !userIsAdmin(user))

export const ecommerceIsDocumentOwner: Access = ({ req: { user } }) => {
  if (!user) {return false}
  if (userIsAdmin(user)) {return true}
  return { customer: { equals: user.id } }
}
