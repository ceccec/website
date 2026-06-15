/**
 * CLI (`payload run`): Local API with explicit config — Payload's recommended pattern for scripts.
 * @see https://payloadcms.com/docs/local-api/overview
 */
// @ts-ignore
import * as discordMDX from 'discord-markdown'
const { toHTML } = discordMDX
import config from '@payload-config'
import cliProgress from 'cli-progress'
import { getPayload } from 'payload'

import { processBatch } from '../utilities/BatchProcessor'
import { httpClient } from '../utilities/HttpClient'
import sanitizeSlug from '../utilities/sanitizeSlug'

const { DISCORD_GUILD_ID, DISCORD_SCRAPE_CHANNEL_ID, DISCORD_TOKEN } = process.env
const DISCORD_API_BASE = 'https://discord.com/api/v10'
const answeredTag = '1034538089546264577'
const headers = {
  Authorization: `Bot ${DISCORD_TOKEN}`,
}

type Thread = {
  applied_tags: string[]
  guild_id: string
  id: string
  message_count: number
  name: string
  thread_metadata: {
    archived: boolean
    create_timestamp: string
  }
}

type Message = {
  attachments: any[]
  author: {
    avatar: string
    bot: boolean
    id: string
    username: string
  }
  bot: boolean
  content: string
  position: number
  timestamp: string
}

type ExistingThread = {
  discordId: string
  docId: string
  messageCount: number
}

async function fetchFromDiscord(
  endpoint: string,
  fetchType: 'messages' | 'threads',
): Promise<any[]> {
  const baseURL = `${DISCORD_API_BASE}${endpoint}`
  const allResults: (Message | Thread)[] = []
  const params: Record<string, string | undefined> =
    fetchType === 'messages' ? { limit: '100' } : {}

  while (true) {
    const url = new URL(baseURL)
    Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, String(value)))

    // Use unified HttpClient with exponential backoff for retries
    const response = await httpClient.fetch(url.toString(), { headers }, {
      maxRetries: 3,
      baseDelay: 2000,
      retryableStatuses: [429, 503],
    })

    if (!response.ok) {
      console.error(`[fetchDiscord] Failed to fetch ${endpoint}: ${response.status} ${response.statusText}`)
      throw new Error(`Failed to fetch ${endpoint}: ${response.status} ${response.statusText}`)
    }

    if (fetchType === 'threads') {
      const data = (await response.json()) as {
        has_more?: boolean
        threads?: (Thread & {
          thread_metadata: { archive_timestamp?: string }
        })[]
      }
      const threads = data.threads || []
      allResults.push(...threads)
      if (!data.has_more) {
        break
      }
      params.before = threads[threads.length - 1]?.thread_metadata?.archive_timestamp
    } else {
      const data = (await response.json()) as (Message & { id?: string })[]
      allResults.push(...data)
      if (data.length < 100) {
        break
      }
      params.before = data[data.length - 1]?.id
    }
  }

  return allResults.reverse()
}

function processMessages(messages: Message[]) {
  const mergedMessages: Message[] = []

  for (let i = 0; i < messages.length; i++) {
    const currentMessage = messages[i]

    if (!currentMessage.author || (!currentMessage.attachments && !currentMessage.content)) {
      // Skip messages without content or author
      continue
    }

    const isBot =
      currentMessage.author.bot ||
      currentMessage.author.username === 'Payload-Bot' ||
      currentMessage.author.username.includes('Bot')

    if (isBot) {
      continue
    }

    if (
      mergedMessages.length > 0 &&
      mergedMessages[mergedMessages.length - 1].author.id === currentMessage.author.id
    ) {
      const prevMessage = mergedMessages[mergedMessages.length - 1]
      prevMessage.content += `\n\n${currentMessage.content}`
      prevMessage.attachments = prevMessage.attachments.concat(currentMessage.attachments)
    } else {
      mergedMessages.push({ ...currentMessage })
    }
  }

  return mergedMessages
}

function createSanitizedThread(thread: Thread, messages: Message[]) {
  const [intro, ...combinedResponses] = processMessages(messages)
  const createdAtDate = intro
    ? new Date(intro.timestamp).toISOString()
    : new Date(thread.thread_metadata.create_timestamp).toISOString()

  return {
    slug: sanitizeSlug(thread.name),
    info: {
      id: thread.id,
      name: thread.name,
      archived: thread.thread_metadata.archived,
      createdAt: createdAtDate,
      guildId: thread.guild_id,
    },
    intro: intro
      ? {
          authorAvatar: intro.author.avatar,
          authorId: intro.author.id,
          authorName: intro.author.username,
          content: toHTML(intro.content),
        }
      : {},
    messageCount: combinedResponses.length,
    messages: combinedResponses.map(({ attachments, author, content, timestamp }) => ({
      authorAvatar: author.avatar,
      authorId: author.id,
      authorName: author.username,
      content: toHTML(content),
      createdAt: new Date(timestamp),
      fileAttachments: attachments,
    })),
    ogMessageCount: thread.message_count,
  }
}

async function fetchDiscord() {
  if (!DISCORD_TOKEN || !DISCORD_GUILD_ID || !DISCORD_SCRAPE_CHANNEL_ID) {
    const missingEnvVars = ['DISCORD_TOKEN', 'DISCORD_GUILD_ID', 'DISCORD_SCRAPE_CHANNEL_ID']
      .filter((envVar) => !process.env[envVar])
      .join(', ')
    throw new Error(`Missing required Discord variables: ${missingEnvVars}.`)
  }

  const bar = new cliProgress.SingleBar(
    {
      barCompleteChar: '=',
      barIncompleteChar: '-',
      format: 'Populating Threads | {bar} | {percentage}% | {value}/{total}',
      hideCursor: true,
    },
    cliProgress.Presets.shades_classic,
  )

  console.time('[fetchDiscord] Total duration')
  console.log('[fetchDiscord] Starting Discord sync...')

  const activeThreadsData = await fetchFromDiscord(
    `/guilds/${DISCORD_GUILD_ID}/threads/active`,
    'threads',
  )
  console.log(`[fetchDiscord] Found ${activeThreadsData.length} active threads`)

  // Only fetch archived threads if SYNC_ARCHIVED_THREADS is explicitly set to 'true'
  // This dramatically speeds up sync time by skipping 12,000+ archived threads that rarely change
  const shouldFetchArchived = process.env.SYNC_ARCHIVED_THREADS === 'true'
  let archivedThreadsData: Thread[] = []

  if (shouldFetchArchived) {
    archivedThreadsData = await fetchFromDiscord(
      `/channels/${DISCORD_SCRAPE_CHANNEL_ID}/threads/archived/public`,
      'threads',
    )
    console.log(`[fetchDiscord] Found ${archivedThreadsData.length} archived threads`)
  } else {
    console.log('[fetchDiscord] Skipping archived threads (set SYNC_ARCHIVED_THREADS=true to include them)')
  }

  const allThreads = [...activeThreadsData, ...archivedThreadsData].filter(
    (thread) => thread.applied_tags?.includes(answeredTag) && thread.message_count > 1,
  ) as Thread[]
  console.log(
    `[fetchDiscord] ${allThreads.length} threads after filtering (answered + has messages)`,
  )

  const payload = await getPayload({ config })
  const existingThreadsResult = await payload.find({
    collection: 'community-help',
    depth: 0,
    limit: 0,
    overrideAccess: true,
    where: {
      communityHelpType: {
        equals: 'discord',
      },
    },
  })

  const existingThreadIds: ExistingThread[] = existingThreadsResult.docs.map((thread) => ({
    discordId: thread.discordId as string,
    docId: thread.id,
    messageCount: (thread.communityHelpJSON as any)?.messageCount || 0,
  }))

  const filteredThreads = allThreads.filter((thread) => {
    const existingThread = existingThreadIds.find((existing) => existing.discordId === thread.id)
    return (
      !existingThread || (existingThread && existingThread.messageCount !== thread.message_count)
    )
  })

  // Apply batch limit if set
  const batchLimit = process.env.SYNC_BATCH_LIMIT
    ? parseInt(process.env.SYNC_BATCH_LIMIT, 10)
    : filteredThreads.length

  const threadsToSync = filteredThreads.slice(0, batchLimit)

  console.log(
    `[fetchDiscord] Found ${existingThreadIds.length} existing threads in CMS, ${filteredThreads.length} need to be synced${
      batchLimit < filteredThreads.length
        ? ` (processing ${batchLimit} this run due to SYNC_BATCH_LIMIT)`
        : ''
    }`,
  )

  if (threadsToSync.length === 0) {
    console.log('[fetchDiscord] No threads to sync. All up to date!')
    console.timeEnd('[fetchDiscord] Total duration')
    return
  }

  bar.start(threadsToSync.length, 0)

  // Use unified BatchProcessor with segmented strategy (10 threads per segment)
  const populatedThreads = await processBatch(
    threadsToSync,
    async (thread) => {
      const messages = await fetchFromDiscord(`/channels/${thread.id}/messages`, 'messages')
      return createSanitizedThread(thread, messages)
    },
    {
      mode: 'segmented',
      segmentSize: 10,
      onProgress: (processed) => {
        bar.update(processed)
      },
    },
  )

  bar.stop()

  // Filter out null (failed) entries
  const successfulThreads = populatedThreads.filter((t) => t !== null)

  // Upsert threads to database
  await processBatch(
    successfulThreads,
    async (thread) => {
      const existingThread = existingThreadIds.find(
        (existing) => existing.discordId === thread.info.id,
      )
      const data = {
        slug: thread.slug,
        communityHelpJSON: thread,
        communityHelpType: 'discord' as const,
        discordId: thread.info.id,
        threadCreatedAt: thread.info.createdAt,
        title: thread.info.name,
      }

      if (existingThread) {
        // Update existing thread
        await payload.update({
          id: existingThread.docId,
          collection: 'community-help',
          data,
          overrideAccess: true,
        })
        console.log(
          `[fetchDiscord] Successfully updated thread "${thread.info.name}" (${thread.info.id})`,
        )
      } else {
        // Create new thread
        await payload.create({
          collection: 'community-help',
          data,
          overrideAccess: true,
        })
        console.log(
          `[fetchDiscord] Successfully created thread "${thread.info.name}" (${thread.info.id})`,
        )
      }
    },
    {
      mode: 'sequential', // Sequential for database safety
      enableLogging: true,
    },
  )
  console.log('[fetchDiscord] Sync completed!')
  console.timeEnd('[fetchDiscord] Total duration')
}

export default fetchDiscord
