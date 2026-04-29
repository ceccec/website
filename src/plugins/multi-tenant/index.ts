import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant'

import { multiTenantEnabled } from '../env'
import { whenPluginEnabled } from '../lib/whenPluginEnabled'
import { multiTenantPluginConfig } from './config'

export { multiTenantPluginConfig } from './config'

/** `examples/multi-tenant` */
export const multiTenant = () => whenPluginEnabled(multiTenantEnabled, () => multiTenantPlugin(multiTenantPluginConfig))
