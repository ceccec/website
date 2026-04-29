import type { Plugin } from 'payload'

import { Tenants } from '@root/collections/Tenants'

import { multiTenantEnabled } from '../env'

/** `examples/multi-tenant` — `tenants` collection when env is on. */
export const tenantsPlugin: Plugin = (config) => {
  if (!multiTenantEnabled()) {return config}
  return {
    ...config,
    collections: [...(config.collections ?? []), Tenants],
  }
}
