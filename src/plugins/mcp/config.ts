import type { MCPPluginConfig } from '@payloadcms/plugin-mcp'
import type { CollectionSlug } from 'payload'

import { Users } from '../../collections/Users'

/** `MCPPluginConfig` from `@payloadcms/plugin-mcp`. https://payloadcms.com/docs/plugins/mcp */
export const mcpPluginConfig: MCPPluginConfig = {
  collections: {
    'case-studies': {
      description:
        'Case studies. MCP is limited to find; create, update, and delete are disabled for this integration.',
      enabled: { create: false, delete: false, find: true, update: false },
    },
    pages: {
      description:
        'Site pages. MCP is limited to find; create, update, and delete are disabled for this integration.',
      enabled: { create: false, delete: false, find: true, update: false },
    },
    posts: {
      description:
        'Blog posts. MCP is limited to find; create, update, and delete are disabled for this integration.',
      enabled: { create: false, delete: false, find: true, update: false },
    },
  },
  globals: {
    footer: {
      description: 'Site footer global. MCP allows find only; update is disabled.',
      enabled: { find: true, update: false },
    },
    'main-menu': {
      description: 'Main navigation global. MCP allows find only; update is disabled.',
      enabled: { find: true, update: false },
    },
  },
  userCollection: Users.slug as CollectionSlug,
}
