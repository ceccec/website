import type { GlobalConfig } from 'payload'

import { PARTNER_PROGRAM_DIRECTORY_BLOCK_SLUGS } from '@root/plugins/schema/layoutBlockReferences'

import { isAdmin } from '../access/isAdmin'
import linkGroup from '../fields/linkGroup'
import { revalidatePartnersProgramLayout } from '../utilities/revalidateMarketingRoutes'

export const PartnerProgram: GlobalConfig = {
  slug: 'partner-program',
  access: {
    read: () => true,
    update: isAdmin,
  },
  admin: {
    group: 'Partner Program',
  },
  fields: [
    {
      name: 'contactForm',
      type: 'relationship',
      admin: {
        description: 'Select the form that should be used for the contact form.',
      },
      relationTo: 'forms',
      required: true,
    },
    {
      name: 'hero',
      type: 'group',
      fields: [
        {
          name: 'richText',
          type: 'richText',
          label: 'Hero Text',
        },
        linkGroup({
          appearances: false,
          overrides: {
            name: 'breadcrumbBarLinks',
          },
        }),
        linkGroup({
          appearances: false,
          overrides: {
            name: 'heroLinks',
          },
        }),
      ],
    },
    {
      name: 'featuredPartners',
      type: 'group',
      fields: [
        {
          name: 'description',
          type: 'textarea',
        },
        {
          name: 'partners',
          type: 'relationship',
          hasMany: true,
          hooks: {
            afterChange: [
              async ({ previousValue, req, value }) => {
                if (value !== previousValue) {
                  const { payload } = req
                  await payload.update({
                    collection: 'partners',
                    data: {
                      featured: false,
                    },
                    where: {
                      featured: {
                        equals: true,
                      },
                    },
                  })
                  await payload.update({
                    collection: 'partners',
                    data: {
                      featured: true,
                    },
                    where: {
                      id: {
                        in: value,
                      },
                    },
                  })
                }
              },
            ],
          },
          maxRows: 4,
          minRows: 4,
          relationTo: 'partners',
          required: true,
        },
      ],
    },
    {
      name: 'contentBlocks',
      type: 'group',
      fields: [
        {
          name: 'beforeDirectory',
          type: 'blocks',
          blocks: [...PARTNER_PROGRAM_DIRECTORY_BLOCK_SLUGS],
          label: 'Before Directory Blocks',
          labels: {
            plural: 'Blocks',
            singular: 'Block',
          },
        },
        {
          name: 'afterDirectory',
          type: 'blocks',
          blocks: [...PARTNER_PROGRAM_DIRECTORY_BLOCK_SLUGS],
          label: 'After Directory Blocks',
          labels: {
            plural: 'Blocks',
            singular: 'Block',
          },
        },
      ],
      label: false,
    },
  ],
  hooks: {
    afterChange: [() => revalidatePartnersProgramLayout()],
  },
  label: 'Partner Program Directory',
}
