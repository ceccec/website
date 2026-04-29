import type { PayloadHandler } from 'payload'

import { buildReleasePostData } from './buildReleasePostData'

const GITHUB_RELEASES_URL = 'https://api.github.com/repos/payloadcms/payload/releases'

export const createReleasePostFromAdmin: PayloadHandler = async (req) => {
  try {
    if (!req.user?.roles?.includes('admin')) {
      return new Response('Unauthorized', { status: 401 })
    }

    if (typeof req.json !== 'function') {
      return new Response('Invalid request', { status: 400 })
    }
    const body: { version?: string } = await req.json()
    const rawVersion = body.version
    const version = rawVersion ? (rawVersion.startsWith('v') ? rawVersion : `v${rawVersion}`) : undefined

    const githubUrl = version
      ? `${GITHUB_RELEASES_URL}/tags/${version}`
      : `${GITHUB_RELEASES_URL}/latest`

    const githubRes = await fetch(githubUrl)
    if (!githubRes.ok) {
      const msg = version
        ? `Release ${version} not found on GitHub`
        : 'Could not fetch latest release from GitHub'
      return new Response(msg, { status: 400 })
    }

    const release: { body?: string; tag_name?: string } = await githubRes.json()

    const tagName = release.tag_name
    if (!tagName) {
      return new Response('GitHub release response missing tag_name', { status: 400 })
    }

    const data = await buildReleasePostData({
      body: release.body ?? '',
      payload: req.payload,
      version: tagName,
    })

    const post = await req.payload.create({ collection: 'posts', data, draft: true })

    return new Response(JSON.stringify({ id: post.id }), { status: 201 })
  } catch (error: unknown) {
    req.payload.logger.error({ err: error, msg: 'Failed to create release post from admin' })
    return new Response((error as Error).message || 'Failed to create release post', {
      status: 500,
    })
  }
}

