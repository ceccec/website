import { draftMode } from 'next/headers'

export async function GET(): Promise<Response> {
  try {
    const parsedDraftMode = await draftMode()
    parsedDraftMode.disable()
    return new Response('Draft mode is disabled')
  } catch (error) {
    console.error('Exit preview error:', error)
    return new Response('Failed to disable draft mode', { status: 500 })
  }
}
