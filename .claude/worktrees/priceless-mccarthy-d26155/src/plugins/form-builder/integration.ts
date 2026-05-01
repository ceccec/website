/**
 * App + third-party integration for `@payloadcms/plugin-form-builder` (HubSpot, reCAPTCHA, partner email).
 * Keep **heavy or external I/O** here, not in `config.ts` — `config.ts` only wires the official plugin.
 *
 * @see .cursor/rules/payload-form-builder.mdc · payload-hooks.mdc · payload-security-deployment.mdc · payload-performance.mdc
 */

import type { Form, FormSubmission } from '@types'
import type { Field, PayloadRequest } from 'payload'

import { resolveIntegrationSecrets } from '@root/lib/resolveIntegrationSecrets'
import { isRecord } from '@root/utilities/payloadCloudJson'

import { partnersTemplateEnabled } from '../env'

export function hubspotBodyContext(body: Record<string, unknown>): Record<string, unknown> {
  return {
    ...('hubspotCookie' in body && typeof body.hubspotCookie === 'string'
      ? { hutk: body.hubspotCookie }
      : {}),
    pageName: typeof body.pageName === 'string' ? body.pageName : '',
    pageUri: typeof body.pageUri === 'string' ? body.pageUri : '',
  }
}

/** Sidebar fields merged onto forms via `plugin-form-builder` overrides. */
export const formBuilderExtraFormFields: Field[] = [
  {
    name: 'hubSpotFormId',
    type: 'text',
    admin: {
      position: 'sidebar',
    },
    label: 'HubSpot Form Id',
  },
  {
    name: 'customId',
    type: 'text',
    admin: {
      description: 'Attached to submission button to track clicks',
      position: 'sidebar',
    },
    label: 'Custom Id',
  },
  {
    name: 'requireRecaptcha',
    type: 'checkbox',
    admin: {
      position: 'sidebar',
    },
    label: 'Require reCAPTCHA',
  },
]

export const formBuilderRecaptchaSubmissionField: Field = {
  name: 'recaptcha',
  type: 'text',
  validate: async (value, { req, siblingData }) => {
    const form = await req.payload.findById({
      id: siblingData?.form,
      collection: 'forms',
    })

    if (
      !form ||
      typeof form !== 'object' ||
      !('requireRecaptcha' in form) ||
      !form.requireRecaptcha
    ) {
      return true
    }

    if (!value) {
      return 'Please complete the reCAPTCHA'
    }

    const { recaptchaSecretKey } = await resolveIntegrationSecrets(req.payload)
    if (!recaptchaSecretKey) {
      return 'reCAPTCHA is not configured (Admin → Integration secrets or env).'
    }

    const res = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecretKey}&response=${value}`,
      {
        method: 'POST',
      },
    )
    const data = await res.json()
    if (!isRecord(data) || data.success !== true) {
      return 'Invalid captcha'
    }
    return true
  },
}

export async function afterFormSubmissionChange({
  doc,
  req,
}: {
  doc: FormSubmission
  req: PayloadRequest
}) {
  req.payload.logger.info('Form Submission Received')
  req.payload.logger.info(Object.fromEntries(req?.headers.entries()))

  const formRef = doc.form
  if (typeof formRef !== 'object' || formRef === null) {
    return
  }
  const form = formRef
  const hubSpotFormId = form.hubSpotFormId
  if (!hubSpotFormId) {
    return
  }

  const rawBody = req.json ? await req.json() : {}
  const body: Record<string, unknown> =
    rawBody && typeof rawBody === 'object' && rawBody !== null && !Array.isArray(rawBody)
      ? (rawBody as Record<string, unknown>)
      : {}

  const { submissionData: submissionDataFromDoc } = doc
  const { hubspotPortalKey: portalId } = await resolveIntegrationSecrets(req.payload)
  if (!portalId) {
    return
  }

  const submissionData = (submissionDataFromDoc ?? []).filter((field) => field.field !== 'partnerId')

  const data = {
    context: hubspotBodyContext(body),
    fields: submissionData.map((key) => ({
      name: key.field,
      value: key.value,
    })),
  }

  try {
    await fetch(
      `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${hubSpotFormId}`,
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

export async function beforeFormSubmissionChange({
  data,
  req,
}: {
  data: {
    [key: string]: unknown
    submissionData?: { field: string; value: string }[]
  }
  req: PayloadRequest
}) {
  const partnerIdField = data?.submissionData?.find((field) => field.field === 'partnerId')

  if (partnersTemplateEnabled() && partnerIdField?.value) {
    try {
      const partner = await req.payload.findById({
        id: partnerIdField.value,
        collection: 'partners',
        overrideAccess: true,
      })

      if (partner && typeof partner === 'object' && 'email' in partner && partner.email) {
        data.submissionData = data.submissionData ?? []
        data.submissionData.push({
          field: 'toEmail',
          value: typeof partner.email === 'string' ? partner.email : String(partner.email),
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
}
