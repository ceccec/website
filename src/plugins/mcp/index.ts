import { mcpPlugin } from '@payloadcms/plugin-mcp'

import { mcpEnabled } from '../env'
import { whenPluginEnabled } from '../lib/whenPluginEnabled'
import { mcpPluginConfig } from './config'

export { mcpPluginConfig } from './config'

export const mcp = () => whenPluginEnabled(mcpEnabled, () => mcpPlugin(mcpPluginConfig))
