import type { Metadata } from 'next'

import { fetchMe } from '@cloud/_api/fetchMe'
import { mergeOpenGraph } from '@root/seo/mergeOpenGraph'
import { notFound } from 'next/navigation'

import { SettingsPage } from './page_client'

export default async () => {
  const { user } = await fetchMe({
    nullUserRedirect: `/login?error=${encodeURIComponent(
      'You must be logged in to visit this page',
    )}`,
  })
  if (!user) {
    return notFound()
  }
  return <SettingsPage user={user} />
}

export const metadata: Metadata = {
  openGraph: mergeOpenGraph({
    title: 'My Account',
    url: `/cloud/settings`,
  }),
  title: 'My Account',
}
