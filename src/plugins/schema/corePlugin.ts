import type { Plugin } from 'payload'

import { Media } from '@root/collections/Media'
import { ReusableContent } from '@root/collections/ReusableContent'
import { Users } from '@root/collections/Users'
import { AdminSettings } from '@root/globals/AdminSettings'

/** Auth, uploads, reusable slices, admin dashboard global — baseline `templates/website`. */
export const corePlugin: Plugin = (config) => ({
  ...config,
  collections: [...(config.collections ?? []), Users, Media, ReusableContent],
  globals: [...(config.globals ?? []), AdminSettings],
})
