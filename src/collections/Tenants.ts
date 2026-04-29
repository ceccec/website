import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'

/**
 * Required when `PAYLOAD_MULTI_TENANT=true` (`examples/multi-tenant`, `@payloadcms/plugin-multi-tenant`).
 * Fields mirror the basic usage example in the plugin docs.
 */
export const Tenants: CollectionConfig = {
  slug: 'tenants',
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: isAdmin,
    update: isAdmin,
  },
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      index: true,
      required: true,
      unique: true,
    },
    {
      name: 'domain',
      type: 'text',
      admin: {
        description: 'Used by front-end routing / filtering (see plugin docs).',
      },
      required: true,
    },
  ],
}
