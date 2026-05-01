import type { Plugin } from 'payload'

import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { revalidateTagImmediate } from '@utilities/revalidateTagImmediate'

import {
  afterFormSubmissionChange,
  beforeFormSubmissionChange,
  formBuilderExtraFormFields,
  formBuilderRecaptchaSubmissionField,
} from './integration'

/** `@payloadcms/plugin-form-builder` — wiring only; HubSpot/reCAPTCHA/partner logic lives in utilities. */
export const formBuilder: Plugin = formBuilderPlugin({
  formOverrides: {
    fields: ({ defaultFields }) => [...defaultFields, ...formBuilderExtraFormFields],
    hooks: {
      afterChange: [
        ({ doc }) => {
          revalidateTagImmediate(`form-${doc.title}`)
        },
      ],
    },
  },
  formSubmissionOverrides: {
    fields: ({ defaultFields }) => [...defaultFields, formBuilderRecaptchaSubmissionField],
    hooks: {
      afterChange: [afterFormSubmissionChange],
      beforeChange: [beforeFormSubmissionChange],
    },
  },
})
