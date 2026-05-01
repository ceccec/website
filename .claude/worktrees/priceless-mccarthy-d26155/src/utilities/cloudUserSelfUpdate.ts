import type { User } from '@root/payload-cloud-types'

import { PayloadCloudJsonError } from '@utilities/payloadCloudJson'

/** Only scalars the account settings UI may send — ignores nested User fields at the boundary. */
export type CloudUserSelfUpdateInput = Partial<Pick<User, 'email' | 'name' | 'password'>>

export function buildCloudUserSelfUpdatePayload(
  incoming: Partial<User>,
): Record<string, string> {
  const out: Record<string, string> = {}

  if (incoming.name !== undefined) {
    if (typeof incoming.name !== 'string') {
      throw new PayloadCloudJsonError('`name` must be a string when provided')
    }
    out.name = incoming.name
  }

  if (incoming.email !== undefined) {
    if (typeof incoming.email !== 'string') {
      throw new PayloadCloudJsonError('`email` must be a string when provided')
    }
    out.email = incoming.email
  }

  if (incoming.password !== undefined && incoming.password !== '') {
    if (typeof incoming.password !== 'string') {
      throw new PayloadCloudJsonError('`password` must be a string when provided')
    }
    out.password = incoming.password
  }

  if (Object.keys(out).length === 0) {
    throw new PayloadCloudJsonError('No valid fields to update')
  }

  return out
}
