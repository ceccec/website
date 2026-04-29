import type { Plugin } from 'payload'

import { type CloudflareContext } from '@opennextjs/cloudflare'
import { r2Storage } from '@payloadcms/storage-r2'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'

import type { DeploymentTarget } from '../../lib/deploymentTarget'

export function storage(
  deploymentTarget: DeploymentTarget,
  cloudflare: CloudflareContext | undefined,
): Plugin {
  if (deploymentTarget === 'cloudflare') {
    return r2Storage({
      bucket: cloudflare!.env.R2,
      collections: { media: true },
    })
  }
  return vercelBlobStorage({
    collections: { media: true },
    token: process.env.BLOB_READ_WRITE_TOKEN,
  })
}
