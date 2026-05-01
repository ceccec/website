import type { TextField } from 'payload'

import {
  BlocksFeature,
  EXPERIMENTAL_TableFeature,
  lexicalEditor,
  LinkFeature,
  UploadFeature,
} from '@payloadcms/richtext-lexical'
import link from '@root/fields/link'
import { LabelFeature } from '@root/fields/richText/features/label/server'
import { LargeBodyFeature } from '@root/fields/richText/features/largeBody/server'

/** Rich-text editor for `buildConfig({ editor })` — Lexical + media upload fields. */
export const payloadLexicalEditor = lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures.filter((feature) => feature.key !== 'link'),
    LinkFeature({
      fields({ defaultFields }) {
        return [
          ...defaultFields.filter((field) => field.name !== 'url'),
          {
            name: 'url',
            type: 'text',
            label: ({ t }) => t('fields:enterURL'),
            required: true,
            validate: () => true,
          } as TextField,
        ]
      },
    }),
    EXPERIMENTAL_TableFeature(),
    UploadFeature({
      collections: {
        media: {
          fields: [
            {
              name: 'enableLink',
              type: 'checkbox',
              label: 'Enable Link',
            },
            link({
              appearances: false,
              disableLabel: true,
              overrides: {
                admin: {
                  condition: (_, data) => Boolean(data?.enableLink),
                },
              },
            }),
          ],
        },
      },
    }),
    LabelFeature(),
    LargeBodyFeature(),
    BlocksFeature({
      blocks: [
        'spotlight',
        'video',
        'br',
        'Banner',
        'VideoDrawer',
        'templateCards',
        'Code',
        'downloadBlock',
        'commandLine',
      ],
    }),
  ],
})
