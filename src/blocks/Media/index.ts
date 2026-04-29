import type { Block } from 'payload'

import { blockFields } from '../../fields/blockFields'

export const MediaBlock: Block = {
  slug: 'mediaBlock',
  dbName: 'mb',
  fields: [
    blockFields({
      name: 'mediaBlockFields',
      fields: [
        {
          name: 'position',
          type: 'select',
          enumName: 'mb_pos',
          defaultValue: 'default',
          options: [
            {
              label: 'Default',
              value: 'default',
            },
            {
              label: 'Wide',
              value: 'wide',
            },
          ],
        },
        {
          name: 'media',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'caption',
          type: 'richText',
        },
      ],
    }),
  ],
}
