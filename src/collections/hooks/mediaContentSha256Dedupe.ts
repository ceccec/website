import type {
  CollectionBeforeChangeHook,
  CollectionBeforeOperationHook,
  PayloadRequest,
} from 'payload'
import type { File } from 'payload/uploads/types'

import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { APIError } from 'payload'

export const MEDIA_CONTENT_SHA256_CONTEXT_KEY = 'mediaContentSha256'

async function bufferFromUploadFile(file: File): Promise<Buffer> {
  if (file.data && file.data.length > 0) {
    return file.data
  }
  if (file.tempFilePath) {
    return readFile(file.tempFilePath)
  }
  throw new APIError('Could not read upload bytes for hashing.', 400, undefined, true)
}

export async function sha256HexFromRequestFile(req: PayloadRequest): Promise<string | undefined> {
  const file = req.file
  if (!file) {
    return undefined
  }
  const buf = await bufferFromUploadFile(file)
  return createHash('sha256').update(buf).digest('hex')
}

/** Runs before create / updateByID when a new file is present — blocks a second blob for identical bytes. */
export const mediaDedupeBeforeOperation: CollectionBeforeOperationHook<'media'> = async (input) => {
  const { context, operation, req } = input
  if ((operation !== 'create' && operation !== 'updateByID') || !req.file) {
    return
  }

  const hash = await sha256HexFromRequestFile(req)
  if (!hash) {
    return
  }

  ;(context as Record<string, unknown>)[MEDIA_CONTENT_SHA256_CONTEXT_KEY] = hash

  const currentID = operation === 'updateByID' ? String(input.args.id) : undefined

  const where =
    currentID !== undefined
      ? {
          and: [
            { contentSha256: { equals: hash } },
            { id: { not_equals: currentID } },
          ],
        }
      : { contentSha256: { equals: hash } }

  const existing = await req.payload.find({
    collection: 'media',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where,
  })

  const match = existing.docs[0]
  if (!match) {
    return
  }

  throw new APIError(
    'This file is already in the media library (same SHA-256). Use the existing asset instead of uploading again.',
    409,
    {
      collectionSlug: 'media',
      duplicateAlt: typeof match.alt === 'string' ? match.alt : undefined,
      duplicateFilename:
        typeof match.filename === 'string' ? match.filename : undefined,
      duplicateOfID: match.id,
    },
    true,
  )
}

/** Persists the hash computed in `mediaDedupeBeforeOperation` onto the document. */
export const mediaContentSha256BeforeChange: CollectionBeforeChangeHook<'media'> = ({
  context,
  data,
}) => {
  const hash = (context as Record<string, unknown>)[MEDIA_CONTENT_SHA256_CONTEXT_KEY]
  if (typeof hash !== 'string' || !hash) {
    return data
  }
  if (!data || typeof data !== 'object') {
    return data
  }
  return { ...data, contentSha256: hash }
}
