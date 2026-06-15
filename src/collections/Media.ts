import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'
import {
  mediaContentSha256BeforeChange,
  mediaDedupeBeforeOperation,
} from './hooks/mediaContentSha256Dedupe'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: () => true,
    update: isAdmin,
  },
  defaultPopulate: {
    alt: true,
    darkModeFallback: true,
    filename: true,
    height: true,
    mimeType: true,
    url: true,
    width: true,
  },
  fields: [
    {
      name: 'contentSha256',
      type: 'text',
      admin: {
        description:
          'SHA-256 of raw file bytes. Set automatically on upload; used to reject duplicate blobs (409 + duplicateOfId).',
        position: 'sidebar',
        readOnly: true,
      },
      index: true,
      label: 'Content SHA-256',
    },
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'darkModeFallback',
      type: 'upload',
      admin: {
        description: 'Choose an upload to render if the visitor is using dark mode.',
      },
      relationTo: 'media',
    },
  ],
  hooks: {
    beforeChange: [mediaContentSha256BeforeChange],
    beforeOperation: [mediaDedupeBeforeOperation],
  },
  upload: true,
}
