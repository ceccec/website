import type { DeploymentRuntimeOptions } from '@root/lib/deploymentTarget'
import type { Plugin } from 'payload'

import { formBuilder } from '../form-builder/config'
import { nestedDocs } from '../nested-docs/config'
import { redirects } from '../redirects/config'
import { seo } from '../seo'
import { storage } from '../storage/config'

/** Default website stack (forms, SEO, nested docs, redirects, uploads). */
export function website(opts: DeploymentRuntimeOptions): Plugin[] {
  return [
    formBuilder,
    seo(),
    nestedDocs,
    redirects,
    storage(opts),
  ]
}
