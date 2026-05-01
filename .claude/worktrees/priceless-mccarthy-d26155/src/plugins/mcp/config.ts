import type { MCPPluginConfig } from '@payloadcms/plugin-mcp'
import type { CollectionSlug } from 'payload'

import { Users } from '../../collections/Users'

const McpCollectionReadOnly = {
  enabled: { create: false, delete: false, find: true, update: false },
} as const

const McpGlobalReadOnly = { enabled: { find: true, update: false } } as const

function mcpReadOnlyCollection(label: string) {
  return {
    description: `${label}. MCP is limited to find; create, update, and delete are disabled for this integration.`,
    ...McpCollectionReadOnly,
  }
}

function mcpReadOnlyGlobal(label: string) {
  return {
    description: `${label}. MCP allows find only; update is disabled.`,
    ...McpGlobalReadOnly,
  }
}

/** `MCPPluginConfig` from `@payloadcms/plugin-mcp`. https://payloadcms.com/docs/plugins/mcp */
export const mcpPluginConfig: MCPPluginConfig = {
  collections: {
    'case-studies': mcpReadOnlyCollection('Case studies'),
    pages: mcpReadOnlyCollection('Site pages'),
    posts: mcpReadOnlyCollection('Blog posts'),
  },
  globals: {
    footer: mcpReadOnlyGlobal('Site footer global'),
    'main-menu': mcpReadOnlyGlobal('Main navigation global'),
  },
  userCollection: Users.slug as CollectionSlug,
}
