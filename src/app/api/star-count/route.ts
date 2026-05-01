import { NextResponse } from 'next/server'

export const revalidate = 900

function githubStarsPayload(data: unknown): data is { stargazers_count: number } {
  return (
    typeof data === 'object' &&
    data !== null &&
    'stargazers_count' in data &&
    typeof (data as { stargazers_count: unknown }).stargazers_count === 'number'
  )
}

export async function GET(): Promise<NextResponse> {
  try {
    const res = await fetch('https://api.github.com/repos/payloadcms/payload')
    const data: unknown = await res.json()

    if (!res.ok || !githubStarsPayload(data)) {
      return NextResponse.json({ totalStars: null })
    }

    return NextResponse.json({ totalStars: data.stargazers_count })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch GitHub stars'
    console.error('GitHub API error:', message, error)
    return NextResponse.json({ totalStars: null })
  }
}
