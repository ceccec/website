import type { Plugin } from 'payload'

import { Tenants } from '@root/collections/Tenants'

import { multiTenantEnabled } from '../env'
import { conditionalSchemaPlugin } from '../lib/conditionalSchemaPlugin'

/** `examples/multi-tenant` — `tenants` collection when env is on. */
export const tenantsPlugin: Plugin = conditionalSchemaPlugin(multiTenantEnabled, (config) => ({
  ...config,
  collections: [...(config.collections ?? []), Tenants],
}))
