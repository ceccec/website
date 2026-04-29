import type { Plugin } from 'payload'

import { mcpPlugin } from '@payloadcms/plugin-mcp'

import { mcpEnabled } from '../env'
import { mcpPluginConfig } from './config'

export { mcpPluginConfig } from './config'

export function mcp(): null | Plugin {
  if (!mcpEnabled()) {return null}
  return mcpPlugin(mcpPluginConfig)
}
