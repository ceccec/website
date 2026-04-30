import type { CollectionConfig } from 'payload'

import { PAGE_LAYOUT_BLOCK_SLUGS } from '@root/plugins/schema/layoutBlockReferences'

import { isAdmin } from '../access/isAdmin'
import { publishedOnly } from '../access/publishedOnly'
import { fullTitle } from '../fields/fullTitle'
import { hero } from '../fields/hero'
import { slugField } from '../fields/slug'
import { formatPreviewURL } from '../utilities/formatPreviewURL'
import { revalidateDocumentIdCache } from '../utilities/revalidateDocumentIdCache'
import { revalidatePagePublicUrls } from '../utilities/revalidatePageRoutes'

export const Pages: CollectionConfig = {
  slug: 'pages',
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: publishedOnly,
    readVersions: isAdmin,
    update: isAdmin,
  },
  admin: {
    defaultColumns: ['fullTitle', 'slug', 'createdAt', 'updatedAt'],
    livePreview: {
      url: ({ data }) => formatPreviewURL('pages', data),
    },
    preview: (doc) => formatPreviewURL('pages', doc),
    useAsTitle: 'fullTitle',
  },
  defaultPopulate: {
    slug: true,
    breadcrumbs: true,
    title: true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    fullTitle,
    {
      name: 'noindex',
      type: 'checkbox',
      admin: {
        position: 'sidebar',
      },
      label: 'No Index',
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [hero],
          label: 'Hero',
        },
        {
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              blockReferences: [...PAGE_LAYOUT_BLOCK_SLUGS],
              blocks: [],
              required: true,
            },
          ],
          label: 'Content',
        },
      ],
    },
    slugField(),
  ],
  hooks: {
    afterChange: [
      ({ doc, previousDoc }) => {
        if (doc._status === 'published' || doc._status !== previousDoc?._status) {
          revalidateDocumentIdCache('pages', doc.id)
          revalidatePagePublicUrls(doc)
        }
      },
    ],
    afterDelete: [
      ({ doc }) => {
        revalidateDocumentIdCache('pages', doc.id)
        revalidatePagePublicUrls(doc)
      },
    ],
  },
  versions: {
    drafts: true,
  },
}
