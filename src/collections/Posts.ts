import type { CollectionConfig } from 'payload'

import { addToDocs } from '@root/fields/addToDocs'

import { isAdmin } from '../access/isAdmin'
import { publishedOnly } from '../access/publishedOnly'
import { Banner } from '../blocks/Banner'
import richText from '../fields/richText'
import { slugField } from '../fields/slug'
import { formatPreviewURL } from '../utilities/formatPreviewURL'
import { revalidateDocumentIdCache } from '../utilities/revalidateDocumentIdCache'
import {
  revalidateBlogCategory,
  revalidateBlogPost,
  revalidateDocsTopicDoc,
} from '../utilities/revalidateMarketingRoutes'

export const Posts: CollectionConfig = {
  slug: 'posts',
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: publishedOnly,
    readVersions: isAdmin,
    update: isAdmin,
  },
  admin: {
    livePreview: {
      url: async ({ data, req }) => {
        let categorySlug: string | undefined
        const categoryId = typeof data?.category === 'string' ? data.category : undefined
        if (categoryId) {
          try {
            const cat = await req.payload.findByID({
              id: categoryId,
              collection: 'categories',
              depth: 0,
              overrideAccess: true,
              select: { slug: true },
            })
            categorySlug = cat?.slug
          } catch {
            // ignore
          }
        }
        return formatPreviewURL('posts', data, categorySlug)
      },
    },
    preview: async (doc, { req }) => {
      let categorySlug: string | undefined
      const categoryId = typeof doc?.category === 'string' ? doc.category : undefined
      if (categoryId) {
        try {
          const cat = await req.payload.findByID({
            id: categoryId,
            collection: 'categories',
            depth: 0,
            overrideAccess: true,
            select: { slug: true },
          })
          categorySlug = cat?.slug
        } catch {
          // ignore
        }
      }
      return formatPreviewURL('posts', doc, categorySlug)
    },
    useAsTitle: 'title',
  },
  defaultPopulate: {
    slug: true,
    authors: true,
    authorType: true,
    category: true,
    dynamicThumbnail: true,
    featuredMedia: true,
    guestAuthor: true,
    guestSocials: true,
    image: true,
    publishedOn: true,
    relatedPosts: true,
    thumbnail: true,
    title: true,
    videoUrl: true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'featuredMedia',
      type: 'select',
      defaultValue: 'upload',
      options: [
        {
          label: 'Image Upload',
          value: 'upload',
        },
        {
          label: 'Video Embed',
          value: 'videoUrl',
        },
      ],
    },
    {
      name: 'image',
      type: 'upload',
      admin: {
        condition: (_, siblingData) => siblingData?.featuredMedia === 'upload',
      },
      relationTo: 'media',
      required: true,
    },
    {
      name: 'videoUrl',
      type: 'text',
      admin: {
        condition: (_, siblingData) => siblingData?.featuredMedia === 'videoUrl',
      },
      label: 'Video URL',
    },
    {
      name: 'dynamicThumbnail',
      type: 'checkbox',
      admin: {
        condition: (_, siblingData) => siblingData?.featuredMedia === 'videoUrl',
      },
      defaultValue: true,
      label: 'Use dynamic thumbnail',
    },
    {
      name: 'thumbnail',
      type: 'upload',
      admin: {
        condition: (_, siblingData) =>
          !siblingData?.dynamicThumbnail && siblingData?.featuredMedia !== 'upload',
      },
      relationTo: 'media',
      required: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'category',
          type: 'relationship',
          admin: {
            width: '50%',
          },
          hooks: {
            afterChange: [
              async ({ previousValue, req, value }) => {
                try {
                  const category = await req.payload.findByID({
                    id: value,
                    collection: 'categories',
                    select: {
                      slug: true,
                    },
                  })
                  if (!category?.slug) {
                    return
                  }

                  revalidateBlogCategory(category.slug)

                  if (previousValue != null && previousValue !== value) {
                    const previousCategory = await req.payload.findByID({
                      id: previousValue,
                      collection: 'categories',
                      select: {
                        slug: true,
                      },
                    })
                    if (previousCategory?.slug) {
                      revalidateBlogCategory(previousCategory.slug)
                    }
                  }
                } catch (error) {
                  console.error(error)
                }
              },
            ],
          },
          relationTo: 'categories',
          required: true,
        },
        {
          name: 'tags',
          type: 'text',
          admin: {
            width: '50%',
          },
          hasMany: true,
        },
      ],
    },
    richText({
      name: 'excerpt',
    }),
    {
      name: 'content',
      type: 'blocks',
      blockReferences: [
        Banner,
        'blogContent',
        'code',
        'blogMarkdown',
        'mediaBlock',
        'reusableContentBlock',
      ],
      blocks: [],
      required: true,
    },
    {
      name: 'relatedPosts',
      type: 'relationship',
      filterOptions: ({ id }) => {
        return {
          id: {
            not_in: [id],
          },
        }
      },
      hasMany: true,
      relationTo: 'posts',
    },
    {
      name: 'relatedDocs',
      type: 'relationship',
      admin: {
        description:
          'Select the docs where you want to link to this guide. Be sure to select the correct version.',
      },
      hasMany: true,
      hooks: {
        afterChange: [
          async ({ req, value }) => {
            try {
              if (!Array.isArray(value)) {
                return
              }

              await Promise.all(
                value.map(async (docID) => {
                  const d = await req.payload.findByID({
                    id: docID,
                    collection: 'docs',
                    select: {
                      slug: true,
                      topic: true,
                    },
                  })

                  if (d?.topic != null && d.slug != null) {
                    revalidateDocsTopicDoc(String(d.topic), String(d.slug))
                  }
                }),
              )
            } catch (error) {
              console.error(error)
            }
          },
        ],
      },
      relationTo: 'docs',
    },
    slugField(),
    {
      name: 'authorType',
      type: 'select',
      admin: {
        position: 'sidebar',
      },
      defaultValue: 'team',
      options: [
        { label: 'Guest', value: 'guest' },
        { label: 'Team', value: 'team' },
      ],
    },
    {
      name: 'authors',
      type: 'relationship',
      admin: {
        condition: (_, siblingData) => siblingData?.authorType === 'team',
        position: 'sidebar',
      },
      hasMany: true,
      relationTo: 'users',
      required: true,
    },
    {
      name: 'guestAuthor',
      type: 'text',
      admin: {
        condition: (_, siblingData) => siblingData?.authorType === 'guest',
        position: 'sidebar',
      },
    },
    {
      type: 'collapsible',
      admin: {
        condition: (_, siblingData) => siblingData?.authorType === 'guest',
        initCollapsed: true,
        position: 'sidebar',
      },
      fields: [
        {
          name: 'guestSocials',
          type: 'group',
          fields: [
            {
              name: 'youtube',
              type: 'text',
            },
            {
              name: 'twitter',
              type: 'text',
            },
            {
              name: 'linkedin',
              type: 'text',
            },
            {
              name: 'website',
              type: 'text',
            },
          ],
          label: false,
        },
      ],
      label: 'Guest Author Socials',
    },
    {
      name: 'publishedOn',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
      },
      required: true,
    },
    addToDocs,
  ],
  forceSelect: {
    relatedPosts: true,
  },
  hooks: {
    afterChange: [
      async ({ doc, previousDoc, req }) => {
        try {
          revalidateDocumentIdCache('posts', doc.id)
          const category = await req.payload.findByID({
            id: doc.category,
            collection: 'categories',
            select: {
              slug: true,
            },
          })

          if (!category?.slug || !doc.slug) {
            return
          }

          revalidateBlogPost(category.slug, doc.slug)

          const prev = previousDoc
          if (
            prev?.category != null &&
            prev.slug != null &&
            (prev.category !== doc.category || prev.slug !== doc.slug)
          ) {
            const prevCategory = await req.payload.findByID({
              id: prev.category,
              collection: 'categories',
              select: {
                slug: true,
              },
            })
            if (prevCategory?.slug) {
              revalidateBlogPost(prevCategory.slug, prev.slug)
            }
          }
        } catch (error) {
          console.error(error)
        }
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        try {
          revalidateDocumentIdCache('posts', doc.id)
          const category = await req.payload.findByID({
            id: doc.category,
            collection: 'categories',
            select: {
              slug: true,
            },
          })

          if (!category?.slug || !doc.slug) {
            return
          }

          revalidateBlogCategory(category.slug)
          revalidateBlogPost(category.slug, doc.slug)
        } catch (error) {
          console.error(error)
        }
      },
    ],
  },
  versions: {
    drafts: true,
  },
}
