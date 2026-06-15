import type * as S3StoragePkg from '@payloadcms/storage-s3'
import type * as VercelBlobStoragePkg from '@payloadcms/storage-vercel-blob'
import type { StorageAdapter } from 'payload'

import { r2Storage } from '@payloadcms/storage-r2'

import type { DeploymentRuntimeOptions } from '../../lib/deploymentTarget'

import { nodeRequire } from '../../lib/nodeRequire'

const mediaCollections = { media: true } as const

function s3StorageEnabled(): boolean {
  return Boolean(
    process.env.S3_ENDPOINT?.trim() &&
      process.env.S3_BUCKET?.trim() &&
      process.env.S3_ACCESS_KEY_ID?.trim() &&
      process.env.S3_SECRET_ACCESS_KEY?.trim(),
  )
}

export function storage(opts: DeploymentRuntimeOptions): StorageAdapter {
  const { cloudflare, deploymentTarget } = opts
  if (deploymentTarget === 'cloudflare') {
    return r2Storage({
      bucket: cloudflare!.env.R2,
      collections: mediaCollections,
    })
  }

  if (s3StorageEnabled()) {
    const { s3Storage } = nodeRequire('@payloadcms/storage-s3') as typeof S3StoragePkg
    return s3Storage({
      acl: process.env.S3_ACL === 'private' ? 'private' : 'public-read',
      bucket: process.env.S3_BUCKET!.trim(),
      collections: mediaCollections,
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID!.trim(),
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!.trim(),
        },
        endpoint: process.env.S3_ENDPOINT!.trim(),
        forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== 'false',
        region: process.env.S3_REGION?.trim() || 'us-east-1',
      },
    })
  }

  const { vercelBlobStorage } =
    nodeRequire('@payloadcms/storage-vercel-blob') as typeof VercelBlobStoragePkg
  return vercelBlobStorage({
    collections: mediaCollections,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  })
}
