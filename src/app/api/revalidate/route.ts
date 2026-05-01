import type { NextRequest } from 'next/server'

import { ApiResponse } from '@utilities/ApiResponse'
import { authService } from '@utilities/AuthService'
import { revalidateTagImmediate } from '@utilities/revalidateTagImmediate'
import { uuidTags } from '@uuid'

export function GET(request: NextRequest) {
  try {
    const collection = request.nextUrl.searchParams.get('collection')
    const slug = request.nextUrl.searchParams.get('slug')

    // Authorize with secret
    const auth = authService.authorizeSyncSecret(request, 'NEXT_PRIVATE_REVALIDATION_KEY')
    if (!auth.authorized) {
      return ApiResponse.unauthorized('Invalid revalidation secret')
    }

    if (typeof collection === 'string' && typeof slug === 'string') {
      revalidateTagImmediate(uuidTags.collectionSlug(collection, slug))
      return ApiResponse.success({
        revalidated: true,
        collection,
        slug,
      })
    }

    return ApiResponse.badRequest('Missing required parameters: collection and slug')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[revalidate] Error:', message, error)
    return ApiResponse.serverError(message)
  }
}
