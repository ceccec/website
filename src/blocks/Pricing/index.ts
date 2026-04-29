import type { Block } from 'payload'

import { blockFields } from '../../fields/blockFields'
import link from '../../fields/link'

export const Pricing: Block = {
  slug: 'pricing',
  dbName: 'prc',
  fields: [
    blockFields({
      name: 'pricingFields',
      fields: [
        {
          name: 'plans',
          type: 'array',
          dbName: 'tiers',
          fields: [
            {
              name: 'name',
              type: 'text',
              required: true,
            },
            {
              name: 'hasPrice',
              type: 'checkbox',
            },
            {
              name: 'enableCreatePayload',
              type: 'checkbox',
            },
            {
              name: 'price',
              type: 'text',
              admin: {
                condition: (_, { hasPrice }) => Boolean(hasPrice),
              },
              label: 'Price per month',
              required: true,
            },
            {
              name: 'title',
              type: 'text',
              admin: {
                condition: (_, { hasPrice }) => !hasPrice,
              },
              label: 'Title',
              required: true,
            },
            {
              name: 'description',
              type: 'textarea',
            },
            {
              name: 'enableLink',
              type: 'checkbox',
            },
            link({
              appearances: false,
              overrides: {
                admin: {
                  condition: (_, { enableLink }) => enableLink,
                },
              },
            }),
            {
              name: 'features',
              type: 'array',
              dbName: 'feats',
              fields: [
                {
                  name: 'icon',
                  type: 'radio',
                  enumName: 'pf_icon',
                  options: [
                    {
                      label: 'Check',
                      value: 'check',
                    },
                    {
                      label: 'X',
                      value: 'x',
                    },
                  ],
                },
                {
                  name: 'feature',
                  type: 'text',
                  label: false,
                },
              ],
            },
          ],
          maxRows: 4,
          minRows: 1,
        },
        {
          name: 'disclaimer',
          type: 'text',
        },
      ],
    }),
  ],
}
