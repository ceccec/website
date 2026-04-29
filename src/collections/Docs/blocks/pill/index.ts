import type { Block } from 'payload'

export const PillBlock: Block = {
  slug: 'Pill',
  fields: [
    {
      name: 'text',
      type: 'text',
      admin: {
        description: 'E.g., "1. DEFINE WORK" or "2. QUEUE JOBS"',
      },
      label: 'Text',
      required: true,
    },
  ],
  interfaceName: 'PillBlock',
  jsx: {
    export: ({ fields }) => {
      return {
        props: {
          text: fields.text,
        },
      }
    },
    import: ({ props }) => {
      return {
        text: props.text,
      }
    },
  },
}
