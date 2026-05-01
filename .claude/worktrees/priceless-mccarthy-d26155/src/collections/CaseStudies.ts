// import { slateEditor } from '@payloadcms/richtext-slate'
import type { CollectionConfig } from 'payload'

import { CASE_STUDY_LAYOUT_BLOCK_SLUGS } from '@root/plugins/schema/layoutBlockReferences'

import { isAdmin } from '../access/isAdmin'
import { publishedOnly } from '../access/publishedOnly'
import richText from '../fields/richText'
import { slugField } from '../fields/slug'
import { formatPreviewURL } from '../utilities/formatPreviewURL'
import {
  revalidateCaseStudy,
  revalidateMarketingDocument,
} from '../utilities/revalidateMarketingRoutes'

export const CaseStudies: CollectionConfig = {
  slug: 'case-studies',
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: publishedOnly,
    readVersions: isAdmin,
    update: isAdmin,
  },
  admin: {
    livePreview: {
      url: ({ data }) => formatPreviewURL('case-studies', data),
    },
    preview: (doc) => formatPreviewURL('case-studies', doc),
    useAsTitle: 'title',
  },
  defaultPopulate: {
    slug: true,
    featuredImage: true,
    title: true,
    url: true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    richText({
      name: 'introContent',
    }),
    {
      type: 'row',
      fields: [
        {
          name: 'industry',
          type: 'text',
        },
        {
          name: 'useCase',
          type: 'text',
        },
      ],
    },
    {
      name: 'partner',
      type: 'relationship',
      relationTo: 'partners',
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'layout',
      type: 'blocks',
      blockReferences: [...CASE_STUDY_LAYOUT_BLOCK_SLUGS],
      blocks: [],
    },
    slugField(),
    {
      name: 'url',
      type: 'text',
      admin: {
        position: 'sidebar',
      },
      label: 'URL',
    },
  ],
  hooks: {
    afterChange: [
      ({ doc }) => {
        revalidateMarketingDocument('case-studies', doc.id, () => revalidateCaseStudy(doc.slug))
      },
    ],
    afterDelete: [
      ({ doc }) => {
        revalidateMarketingDocument('case-studies', doc.id, () => revalidateCaseStudy(doc.slug))
      },
    ],
  },
  versions: {
    drafts: true,
  },
}
