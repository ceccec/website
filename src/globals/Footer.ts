import type { GlobalConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'
import link from '../fields/link'
import { revalidateRootLayout } from '../utilities/revalidateMarketingRoutes'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true,
    update: isAdmin,
  },
  fields: [
    {
      name: 'columns',
      type: 'array',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'navItems',
          type: 'array',
          fields: [
            link({
              appearances: false,
            }),
          ],
        },
      ],
      maxRows: 3,
      minRows: 1,
    },
  ],
  hooks: {
    afterChange: [() => revalidateRootLayout()],
  },
}
