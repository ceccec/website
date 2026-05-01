import { NextResponse } from 'next/server'

export interface ApiResponseEnvelope<T = unknown> {
  success: boolean
  data?: T
  error?: { message: string; code: string }
  timestamp: string
}

/**
 * Standardized API response envelope for consistent error handling and response format.
 * Use instead of NextResponse.json() directly in API routes.
 *
 * @example
 * return ApiResponse.success({ id: '123' })
 * return ApiResponse.error('Not found', 'NOT_FOUND', 404)
 */
export class ApiResponse {
  static success<T = unknown>(
    data?: T,
    statusCode = 200,
  ): NextResponse<ApiResponseEnvelope<T>> {
    return NextResponse.json(
      {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      },
      { status: statusCode },
    )
  }

  static error(
    message: string,
    code: string,
    statusCode = 500,
  ): NextResponse<ApiResponseEnvelope> {
    return NextResponse.json(
      {
        success: false,
        error: { message, code },
        timestamp: new Date().toISOString(),
      },
      { status: statusCode },
    )
  }

  static unauthorized(
    message = 'Unauthorized',
  ): NextResponse<ApiResponseEnvelope> {
    return this.error(message, 'UNAUTHORIZED', 401)
  }

  static forbidden(
    message = 'Forbidden',
  ): NextResponse<ApiResponseEnvelope> {
    return this.error(message, 'FORBIDDEN', 403)
  }

  static badRequest(
    message = 'Bad request',
  ): NextResponse<ApiResponseEnvelope> {
    return this.error(message, 'BAD_REQUEST', 400)
  }

  static notFound(
    message = 'Not found',
  ): NextResponse<ApiResponseEnvelope> {
    return this.error(message, 'NOT_FOUND', 404)
  }

  static serverError(
    message = 'Internal server error',
  ): NextResponse<ApiResponseEnvelope> {
    return this.error(message, 'INTERNAL_SERVER_ERROR', 500)
  }

  static validation(
    message: string,
  ): NextResponse<ApiResponseEnvelope> {
    return this.error(message, 'VALIDATION_ERROR', 400)
  }
}
