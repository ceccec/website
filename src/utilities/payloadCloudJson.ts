/**
 * Shared helpers for Payload Cloud (`NEXT_PUBLIC_CLOUD_CMS_URL`) JSON responses —
 * GraphQL envelopes, REST `{ docs }`, `{ value }`, and Payload-style error shapes.
 * Used by `src/app/(frontend)/(cloud)/cloud/_api/*`, auth UI, and Cloud dashboard components.
 */

import type { Endpoints } from '@octokit/types'
import type { Deployment, User } from '@root/payload-cloud-types'

type GitHubInstallation = Endpoints['GET /user/installations']['response']['data']['installations'][0]

export class PayloadCloudJsonError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message)
    this.name = 'PayloadCloudJsonError'
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** REST success bodies that must be objects (e.g. PATCH project). */
export function assertRecordPayload(body: unknown): Record<string, unknown> {
  if (!isRecord(body)) {
    throw new PayloadCloudJsonError('Expected a JSON object response')
  }
  return body
}

export async function readJsonUnknown(res: Response): Promise<unknown> {
  try {
    return await res.json()
  } catch {
    throw new PayloadCloudJsonError('Response body is not valid JSON')
  }
}

export type PayloadGraphQLEnvelope = {
  data?: unknown
  errors?: { message: string }[]
}

/** Validates the standard GraphQL response envelope (`data` + optional `errors[]`). */
export function parsePayloadGraphQLBody(body: unknown): PayloadGraphQLEnvelope {
  if (!isRecord(body)) {
    throw new PayloadCloudJsonError('Payload Cloud GraphQL response must be a JSON object')
  }

  const errorsRaw = body.errors
  let errors: { message: string }[] | undefined

  if (errorsRaw !== undefined) {
    if (!Array.isArray(errorsRaw)) {
      throw new PayloadCloudJsonError('GraphQL `errors` must be an array')
    }
    errors = errorsRaw.map((err, i) => {
      if (!isRecord(err) || typeof err.message !== 'string') {
        throw new PayloadCloudJsonError(`Invalid GraphQL error entry at index ${i}`)
      }
      return { message: err.message }
    })
  }

  return {
    data: body.data,
    errors,
  }
}

export async function readPayloadGraphQLResponse(res: Response): Promise<PayloadGraphQLEnvelope> {
  const body = await readJsonUnknown(res)
  return parsePayloadGraphQLBody(body)
}

/** Successful GraphQL mutation: HTTP 2xx and no top-level `errors` array. */
export async function assertPayloadGraphQLMutationOk(res: Response): Promise<PayloadGraphQLEnvelope> {
  const envelope = await readPayloadGraphQLResponse(res)
  if (!res.ok) {
    const msg = envelope.errors?.[0]?.message ?? `HTTP ${res.status}`
    throw new PayloadCloudJsonError(msg)
  }
  if (envelope.errors?.length) {
    throw new PayloadCloudJsonError(envelope.errors[0].message)
  }
  return envelope
}

/** Required fields for a `users` document returned by Payload Cloud GraphQL. */
export function assertPayloadCloudUser(value: unknown): User {
  if (!isRecord(value)) {
    throw new PayloadCloudJsonError('User must be a JSON object')
  }
  if (
    typeof value.id !== 'string' ||
    typeof value.email !== 'string' ||
    typeof value.updatedAt !== 'string' ||
    typeof value.createdAt !== 'string'
  ) {
    throw new PayloadCloudJsonError(
      'User payload missing required id, email, updatedAt, or createdAt',
    )
  }
  return value as unknown as User
}

export function parseMeUserFromData(data: unknown): undefined | User {
  if (!isRecord(data)) {
    return undefined
  }
  const meUser = data.meUser
  if (!isRecord(meUser)) {
    return undefined
  }
  const raw = meUser.user
  if (raw === undefined || raw === null) {
    return undefined
  }
  try {
    return assertPayloadCloudUser(raw)
  } catch {
    return undefined
  }
}

export function parseLoginUserFromData(data: unknown): undefined | User {
  if (!isRecord(data)) {
    return undefined
  }
  const loginUser = data.loginUser
  if (!isRecord(loginUser)) {
    return undefined
  }
  const raw = loginUser.user
  if (raw === undefined || raw === null) {
    return undefined
  }
  return assertPayloadCloudUser(raw)
}

export function parseForgotPasswordUserFromData(data: unknown): undefined | User {
  if (!isRecord(data)) {
    return undefined
  }
  const forgot = data.forgotPasswordUser
  if (!isRecord(forgot)) {
    return undefined
  }
  const raw = forgot.user
  if (raw === undefined || raw === null) {
    return undefined
  }
  return assertPayloadCloudUser(raw)
}

export function parseResetPasswordUserFromData(data: unknown): undefined | User {
  if (!isRecord(data)) {
    return undefined
  }
  const reset = data.resetPasswordUser
  if (!isRecord(reset)) {
    return undefined
  }
  const raw = reset.user
  if (raw === undefined || raw === null) {
    return undefined
  }
  return assertPayloadCloudUser(raw)
}

export function parseUpdateUserFromData(data: unknown): undefined | User {
  if (!isRecord(data)) {
    return undefined
  }
  const raw = data.updateUser
  if (raw === undefined || raw === null) {
    return undefined
  }
  return assertPayloadCloudUser(raw)
}

/** REST: `{ value?: string }` (atlas connection, cognito password, email API key, …). */
export function parseOptionalValuePayload(body: unknown): string {
  if (!isRecord(body)) {
    return ''
  }
  const v = body.value
  return typeof v === 'string' ? v : ''
}

/** REST: `{ message?: string }` (success toasts). */
export function parseOptionalMessagePayload(body: unknown): string {
  if (!isRecord(body)) {
    return ''
  }
  return typeof body.message === 'string' ? body.message : ''
}

/** REST: Payload-style `{ errors?: { message?: string }[]; message?: string }`. */
export function parseRestMessagePayload(body: unknown): string {
  if (!isRecord(body)) {
    return 'Something went wrong.'
  }
  const direct = body.message
  if (typeof direct === 'string' && direct.length > 0) {
    return direct
  }
  const errors = body.errors
  if (Array.isArray(errors) && errors[0] && isRecord(errors[0])) {
    const m = errors[0].message
    if (typeof m === 'string') {
      return m
    }
  }
  return 'Something went wrong.'
}

/** REST: project secret payload `{ PAYLOAD_SECRET?: string }`. */
export function parsePayloadSecretPayload(body: unknown): null | string {
  if (!isRecord(body)) {
    return null
  }
  const s = body.PAYLOAD_SECRET
  if (typeof s === 'string') {
    return s
  }
  return null
}

/** REST: Paginated `deployments` collection list. */
export function parseDeploymentsDocsPayload(body: unknown): Deployment[] {
  if (!isRecord(body)) {
    return []
  }
  const docs = body.docs
  if (!Array.isArray(docs)) {
    return []
  }
  const out: Deployment[] = []
  for (const doc of docs) {
    if (!isRecord(doc)) {
      continue
    }
    if (typeof doc.id !== 'string' || typeof doc.createdAt !== 'string') {
      continue
    }
    out.push(doc as unknown as Deployment)
  }
  return out
}

/** Payload Cloud GitHub proxy wraps Octokit — validate `data.installations` is an array of objects with `id`. */
export function parseGitHubInstallationsData(data: unknown): GitHubInstallation[] {
  if (!isRecord(data)) {
    return []
  }
  const installations = data.installations
  if (!Array.isArray(installations)) {
    return []
  }
  const out: GitHubInstallation[] = []
  for (const item of installations) {
    if (!isRecord(item) || typeof item.id !== 'number') {
      continue
    }
    out.push(item as GitHubInstallation)
  }
  return out
}

/** REST: email verification status for custom domain. */
export function parseEmailVerificationStatus(
  body: unknown,
): 'not_started' | 'pending' | 'verified' | undefined {
  if (!isRecord(body)) {
    return undefined
  }
  const s = body.status
  if (s === 'not_started' || s === 'pending' || s === 'verified') {
    return s
  }
  return undefined
}
