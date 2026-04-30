import { randomBytes } from 'node:crypto'

import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'

/**
 * Time-limited public links to **posts** / **pages** / **case-studies** (e.g. share gated marketing
 * content). Resolve with `GET /api/share/[token]` (Local API `overrideAccess` — no public REST list).
 */
export const Shares: CollectionConfig = {
  slug: 'shares',
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: isAdmin,
    update: isAdmin,
  },
  admin: {
    defaultColumns: ['token', 'resource', 'expiresAt', 'updatedAt'],
    useAsTitle: 'token',
  },
  fields: [
    {
      name: 'token',
      type: 'text',
      index: true,
      unique: true,
      admin: {
        description: 'Opaque secret segment for `/api/share/[token]` — filled automatically on create.',
        readOnly: true,
      },
    },
    {
      name: 'resource',
      type: 'relationship',
      relationTo: ['posts', 'pages', 'case-studies'],
      required: true,
    },
    {
      name: 'expiresAt',
      type: 'date',
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
        description: 'Optional. After this instant the share URL responds with 410.',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if (operation !== 'create') return data
        const existing = data?.token
        if (typeof existing === 'string' && existing.trim() !== '') return data
        return {
          ...data,
          token: randomBytes(24).toString('base64url'),
        }
      },
    ],
  },
}
