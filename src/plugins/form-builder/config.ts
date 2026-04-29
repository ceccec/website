import type { Plugin } from 'payload'

import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { revalidateTagImmediate } from '@utilities/revalidateTagImmediate'

function hubspotBodyContext(body: Record<string, unknown>): Record<string, unknown> {
  return {
    ...('hubspotCookie' in body && typeof body.hubspotCookie === 'string'
      ? { hutk: body.hubspotCookie }
      : {}),
    pageName: typeof body.pageName === 'string' ? body.pageName : '',
    pageUri: typeof body.pageUri === 'string' ? body.pageUri : '',
  }
}

/** `@payloadcms/plugin-form-builder` — forms, HubSpot + reCAPTCHA overrides. */
export const formBuilder: Plugin = formBuilderPlugin({
  formOverrides: {
    fields: ({ defaultFields }) => [
      ...defaultFields,
      {
        name: 'hubSpotFormID',
        type: 'text',
        admin: {
          position: 'sidebar',
        },
        label: 'HubSpot Form ID',
      },
      {
        name: 'customID',
        type: 'text',
        admin: {
          description: 'Attached to submission button to track clicks',
          position: 'sidebar',
        },
        label: 'Custom ID',
      },
      {
        name: 'requireRecaptcha',
        type: 'checkbox',
        admin: {
          position: 'sidebar',
        },
        label: 'Require reCAPTCHA',
      },
    ],
    hooks: {
      afterChange: [
        ({ doc }) => {
          revalidateTagImmediate(`form-${doc.title}`)
        },
      ],
    },
  },
  formSubmissionOverrides: {
    fields: ({ defaultFields }) => [
      ...defaultFields,
      {
        name: 'recaptcha',
        type: 'text',
        validate: async (value, { req, siblingData }) => {
          const form = await req.payload.findByID({
            id: siblingData?.form,
            collection: 'forms',
          })

          if (!form?.requireRecaptcha) {
            return true
          }

          if (!value) {
            return 'Please complete the reCAPTCHA'
          }

          const res = await fetch(
            `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.NEXT_PRIVATE_RECAPTCHA_SECRET_KEY}&response=${value}`,
            {
              method: 'POST',
            },
          )
          const data = (await res.json()) as { success?: boolean }
          if (!data.success) {
            return 'Invalid captcha'
          }
          return true
        },
      },
    ],
    hooks: {
      afterChange: [
        async ({ doc, req }) => {
          req.payload.logger.info('Form Submission Received')
          req.payload.logger.info(Object.fromEntries(req?.headers.entries()))

          const rawBody = req.json ? await req.json() : {}
          const body: Record<string, unknown> =
            rawBody &&
            typeof rawBody === 'object' &&
            rawBody !== null &&
            !Array.isArray(rawBody)
              ? (rawBody as Record<string, unknown>)
              : {}

          const sendSubmissionToHubSpot = async (): Promise<void> => {
            const { form, submissionData: submissionDataFromDoc } = doc
            const portalID = process.env.NEXT_PRIVATE_HUBSPOT_PORTAL_KEY

            const submissionData = submissionDataFromDoc.filter(
              (field) => field.field !== 'partnerId',
            )

            const data = {
              context: hubspotBodyContext(body),
              fields: submissionData.map((key) => ({
                name: key.field,
                value: key.value,
              })),
            }

            try {
              await fetch(
                `https://api.hsforms.com/submissions/v3/integration/submit/${portalID}/${form.hubSpotFormID}`,
                {
                  body: JSON.stringify(data),
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  method: 'POST',
                },
              )
            } catch (err: unknown) {
              req.payload.logger.error({
                err,
                msg: 'Fetch to HubSpot form submissions failed',
              })
            }
          }
          await sendSubmissionToHubSpot()
        },
      ],
      beforeChange: [
        async ({ data, req }) => {
          const partnerIdField = data?.submissionData?.find(
            (field) => field.field === 'partnerId',
          )

          if (partnerIdField?.value) {
            try {
              const partner = await req.payload.findByID({
                id: partnerIdField.value,
                collection: 'partners',
                overrideAccess: true,
              })

              if (partner?.email) {
                data.submissionData.push({
                  field: 'toEmail',
                  value: partner.email,
                })
              }
            } catch (err) {
              req.payload.logger.error({
                err,
                msg: 'Failed to lookup partner email',
              })
            }
          }

          return data
        },
      ],
    },
  },
})
