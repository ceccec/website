'use server'

import { payloadCloudToken } from '@cloud/_api/token'
import { payloadCloudJwtUserId } from '@utilities/parsePayloadCloudJwt'
import { uuidTags } from '@uuid'
import { cookies } from 'next/headers'

import { revalidateCache } from './revalidateCache'

/** Invalidate Cloud session–scoped Data Cache tags (`me`, …) using the HttpOnly JWT when present. */
export async function revalidateCloudSessionCache(): Promise<void> {
  const token = (await cookies()).get(payloadCloudToken)?.value
  const uid = payloadCloudJwtUserId(token)
  await revalidateCache({
    tags: [uuidTags.cloud.user, ...(uid ? [uuidTags.cloud.userById(uid)] : [])],
  })
}
