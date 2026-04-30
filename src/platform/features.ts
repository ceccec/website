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
  multiTenant: boolean
  ecommerce: boolean
  ecommerceVariants: boolean
  templateMarketing: boolean
  templateDocs: boolean
  templatePartners: boolean
}

export function getPlatformFeatureMatrix(): PlatformFeatureMatrix {
  return {
    multiTenant: multiTenantEnabled(),
    ecommerce: ecommerceEnabled(),
    ecommerceVariants: ecommerceVariantsEnabled(),
    templateMarketing: marketingContentEnabled(),
    templateDocs: docsTemplateEnabled(),
    templatePartners: partnersTemplateEnabled(),
  }
}
