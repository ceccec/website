/**
 * Single source for “which multi-* slices are compiled in” — mirrors `src/plugins/env.ts`.
 * Use in Payload access, Next layouts, and workers so branching stays consistent.
 */

import {
  docsTemplateEnabled,
  ecommerceEnabled,
  ecommerceVariantsEnabled,
  marketingContentEnabled,
  multiTenantEnabled,
  partnersTemplateEnabled,
} from '@root/plugins/env'

export type PlatformFeatureMatrix = {
  ecommerce: boolean
  ecommerceVariants: boolean
  multiTenant: boolean
  templateDocs: boolean
  templateMarketing: boolean
  templatePartners: boolean
}

export function getPlatformFeatureMatrix(): PlatformFeatureMatrix {
  return {
    ecommerce: ecommerceEnabled(),
    ecommerceVariants: ecommerceVariantsEnabled(),
    multiTenant: multiTenantEnabled(),
    templateDocs: docsTemplateEnabled(),
    templateMarketing: marketingContentEnabled(),
    templatePartners: partnersTemplateEnabled(),
  }
}
