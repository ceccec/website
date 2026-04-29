import type { Plugin } from 'payload'

import { type CloudflareContext } from '@opennextjs/cloudflare'
import { r2Storage } from '@payloadcms/storage-r2'
import { s3Storage } from '@payloadcms/storage-s3'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'

import type { DeploymentTarget } from '../../lib/deploymentTarget'

const mediaCollections = { media: true } as const

function s3StorageEnabled(): boolean {
  return Boolean(
    process.env.S3_ENDPOINT?.trim() &&
      process.env.S3_BUCKET?.trim() &&
      process.env.S3_ACCESS_KEY_ID?.trim() &&
      process.env.S3_SECRET_ACCESS_KEY?.trim(),
  )
}

export function storage(
  deploymentTarget: DeploymentTarget,
  cloudflare: CloudflareContext | undefined,
): Plugin {
  if (deploymentTarget === 'cloudflare') {
    return r2Storage({
      bucket: cloudflare!.env.R2,
      collections: mediaCollections,
    })
  }

  if (s3StorageEnabled()) {
    return s3Storage({
      bucket: process.env.S3_BUCKET!.trim(),
      collections: mediaCollections,
      config: {
        region: process.env.S3_REGION?.trim() || 'us-east-1',
        endpoint: process.env.S3_ENDPOINT!.trim(),
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID!.trim(),
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!.trim(),
        },
        forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== 'false',
      },
      acl: process.env.S3_ACL === 'private' ? 'private' : 'public-read',
    })
  }

  return vercelBlobStorage({
    collections: mediaCollections,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  })
}
