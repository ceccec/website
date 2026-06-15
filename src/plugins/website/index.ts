import type { DeploymentRuntimeOptions } from '@root/lib/deploymentTarget'
import type { Plugin } from 'payload'

import { formBuilder } from '../form-builder/config'
import { nestedDocs } from '../nested-docs/config'
import { redirects } from '../redirects/config'
import { seo } from '../seo'

/**
 * Default website stack (forms, SEO, nested docs, redirects). In Payload 4 storage adapters are
 * applied via the top-level `storage` config key (see `payload.config.ts`), not as plugins.
 */
export function website(_opts: DeploymentRuntimeOptions): Plugin[] {
  return [formBuilder, seo(), nestedDocs, redirects]
}
