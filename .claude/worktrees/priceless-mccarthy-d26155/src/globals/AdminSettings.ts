import type { GlobalConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'

/**
 * Singleton editable in the admin UI — operational notices without a deploy.
 * Read by `BeforeDashboard`; extend fields here as needed (contact links, flags, etc.).
 */
export const AdminSettings: GlobalConfig = {
  slug: 'admin-settings',
  access: {
    read: isAdmin,
    update: isAdmin,
  },
  admin: {
    description:
      'Dashboard workspace settings (visible only to admins). Changes apply immediately after save.',
    group: 'Admin',
  },
  fields: [
    {
      name: 'showDashboardNotice',
      type: 'checkbox',
      defaultValue: false,
      label: 'Show dashboard notice',
    },
    {
      name: 'dashboardNotice',
      type: 'textarea',
      admin: {
        condition: (_, siblingData) => Boolean(siblingData?.showDashboardNotice),
        description: 'Shown at the top of the Payload dashboard for all admin users.',
      },
      label: 'Dashboard notice',
    },
  ],
}
