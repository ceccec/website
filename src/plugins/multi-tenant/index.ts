import type { Plugin } from 'payload'

import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant'

import { multiTenantEnabled } from '../env'
import { multiTenantPluginConfig } from './config'

export { multiTenantPluginConfig } from './config'

/** `examples/multi-tenant` */
export function multiTenant(): null | Plugin {
  if (!multiTenantEnabled()) {return null}
  return multiTenantPlugin(multiTenantPluginConfig)
}
