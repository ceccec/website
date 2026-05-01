import type { Metadata } from 'next'

import { SectionHeader } from '@cloud/[team-slug]/[project-slug]/(tabs)/settings/_layoutComponents/SectionHeader/index'
import { fetchInvoices } from '@cloud/_api/fetchInvoices'
import { fetchMe } from '@cloud/_api/fetchMe'
import { fetchTeamWithCustomer } from '@cloud/_api/fetchTeam'
import { Message } from '@components/Message/index'
import { notFound } from 'next/navigation'
import React from 'react'

import { TeamInvoicesPage } from './page_client'

const loginRedirectError = 'You must be logged in to visit this page'

export default async ({
  params,
}: {
  params: Promise<{
    'team-slug': string
  }>
}) => {
  const { 'team-slug': teamSlug } = await params
  const { user } = await fetchMe({
    nullUserRedirect: `/login?error=${encodeURIComponent(loginRedirectError)}`,
  })
  if (!user) {
    return notFound()
  }
  const team = await fetchTeamWithCustomer(teamSlug)
  const invoices = await fetchInvoices(team)

  const hasCustomerId = team?.stripeCustomerId

  return (
    <React.Fragment>
      <SectionHeader title="Invoices" />
      {!hasCustomerId && (
        <Message error="This team does not have a billing account. Please contact support to resolve this issue." />
      )}
      <TeamInvoicesPage invoices={invoices} team={team} user={user} />
    </React.Fragment>
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{
    'team-slug': string
  }>
}): Promise<Metadata> {
  const { 'team-slug': teamSlug } = await params
  return {
    openGraph: {
      title: `${teamSlug} - Team Invoices`,
      url: `/cloud/${teamSlug}/invoices`,
    },
    title: `${teamSlug} - Team Invoices`,
  }
}
