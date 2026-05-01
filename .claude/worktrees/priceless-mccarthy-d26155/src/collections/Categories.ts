import type { CollectionConfig } from 'payload'

import { isAdmin } from '@root/access/isAdmin'

import {
  revalidateArchivesListing,
  revalidateBlogCategory,
} from '../utilities/revalidateMarketingRoutes'

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: () => true,
    update: isAdmin,
  },
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'name',
          type: 'text',
          admin: {
            width: '50%',
          },
          label: 'Name',
          required: true,
        },
        {
          name: 'slug',
          type: 'text',
          admin: {
            width: '50%',
          },
          label: 'Slug',
          required: true,
        },
      ],
    },
    {
      name: 'headline',
      type: 'text',
      label: 'Headline',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      required: true,
    },
    {
      name: 'posts',
      type: 'join',
      collection: 'posts',
      defaultLimit: 0,
      label: 'Posts',
      maxDepth: 2,
      on: 'category',
    },
  ],
  forceSelect: {
    name: true,
    slug: true,
  },
  hooks: {
    afterChange: [
      ({ doc, previousDoc }) => {
        revalidateBlogCategory(doc.slug)
        revalidateArchivesListing()

        if (previousDoc?.slug != null && doc.slug !== previousDoc.slug) {
          revalidateBlogCategory(previousDoc.slug)
        }
      },
    ],
    afterDelete: [
      ({ doc }) => {
        revalidateBlogCategory(doc.slug)
        revalidateArchivesListing()
      },
    ],
  },
}
