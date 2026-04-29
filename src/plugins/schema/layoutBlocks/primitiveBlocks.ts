import type { Block } from 'payload'

import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { VideoDrawerBlock } from '@root/collections/Docs/blocks/VideoDrawer'
import link from '@root/fields/link'

/** Small inline-defined blocks + shared doc drawer (no separate component file). */
export const primitiveBlocks: Block[] = [
  {
    slug: 'spotlight',
    fields: [
      {
        name: 'element',
        type: 'select',
        options: [
          { label: 'H1', value: 'h1' },
          { label: 'H2', value: 'h2' },
          { label: 'H3', value: 'h3' },
          { label: 'Paragraph', value: 'p' },
        ],
      },
      {
        name: 'richText',
        type: 'richText',
        editor: lexicalEditor(),
      },
    ],
    interfaceName: 'SpotlightBlock',
  },
  {
    slug: 'video',
    fields: [{ name: 'url', type: 'text' }],
    interfaceName: 'VideoBlock',
  },
  {
    slug: 'br',
    fields: [{ name: 'ignore', type: 'text' }],
    interfaceName: 'BrBlock',
  },
  VideoDrawerBlock,
  {
    slug: 'commandLine',
    fields: [{ name: 'command', type: 'text' }],
    interfaceName: 'CommandLineBlock',
  },
  {
    slug: 'command',
    fields: [{ name: 'command', type: 'text', required: true }],
    labels: { plural: 'Command Lines', singular: 'Command Line' },
  },
  {
    slug: 'link',
    fields: [link()],
    labels: { plural: 'Links', singular: 'Link' },
  },
  {
    slug: 'templateCards',
    fields: [
      {
        name: 'templates',
        type: 'array',
        fields: [
          { name: 'name', type: 'text', required: true },
          { name: 'description', type: 'textarea', required: true },
          { name: 'image', type: 'text', required: true },
          { name: 'slug', type: 'text', required: true },
          { name: 'order', type: 'number', required: true },
        ],
        labels: { plural: 'Templates', singular: 'Template' },
      },
    ],
    interfaceName: 'TemplateCardsBlock',
  },
]
