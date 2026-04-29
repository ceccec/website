import type { Plugin } from 'payload'

import createReleasePost from '@root/scripts/createReleasePost'
import { createReleasePostFromAdmin } from '@root/scripts/createReleasePostFromAdmin'
import redeployWebsite from '@root/scripts/redeployWebsite'

import { releaseAutomationEnabled } from '../env'

/** Redeploy + release note helpers (toggle without pulling docs). */
export const automationPlugin: Plugin = (config) => {
  if (!releaseAutomationEnabled()) {return config}
  return {
    ...config,
    endpoints: [
      ...(config.endpoints ?? []),
      { handler: redeployWebsite, method: 'post', path: '/redeploy/website' },
      { handler: createReleasePost, method: 'post', path: '/create-release-post' },
      {
        handler: createReleasePostFromAdmin,
        method: 'post',
        path: '/create-release-post-from-admin',
      },
    ],
  }
}
