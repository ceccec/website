import type { EcommercePluginConfig, PaymentAdapter  } from '@payloadcms/plugin-ecommerce/types'

import { Users } from '../../collections/Users'
import {
  ecommerceAdminOnlyFieldAccess,
  ecommerceAdminOrPublishedStatus,
  ecommerceIsAdmin,
  ecommerceIsAuthenticated,
  ecommerceIsCustomer,
  ecommerceIsDocumentOwner,
} from '../../lib/ecommerceAccess'

export function buildEcommercePluginConfig(params: {
  ecommerceVariantsEnabled: boolean
  stripeAdapter: null | PaymentAdapter
}): EcommercePluginConfig {
  return {
    access: {
      adminOnlyFieldAccess: ecommerceAdminOnlyFieldAccess,
      adminOrPublishedStatus: ecommerceAdminOrPublishedStatus,
      isAdmin: ecommerceIsAdmin,
      isAuthenticated: ecommerceIsAuthenticated,
      isCustomer: ecommerceIsCustomer,
      isDocumentOwner: ecommerceIsDocumentOwner,
    },
    customers: { slug: Users.slug },
    payments: {
      paymentMethods: params.stripeAdapter ? [params.stripeAdapter] : [],
    },
    products: { variants: params.ecommerceVariantsEnabled },
  }
}
