import algoliasearch from 'algoliasearch'

const {
  NEXT_PRIVATE_ALGOLIA_API_KEY,
  NEXT_PUBLIC_ALGOLIA_CH_ID,
  NEXT_PUBLIC_ALGOLIA_CH_INDEX_NAME,
  NEXT_PUBLIC_CMS_URL,
} = process.env

const appId = NEXT_PUBLIC_ALGOLIA_CH_ID || ''
const apiKey = NEXT_PRIVATE_ALGOLIA_API_KEY || ''
const indexName = NEXT_PUBLIC_ALGOLIA_CH_INDEX_NAME || ''

const client = algoliasearch(appId, apiKey)

const index = client.initIndex(indexName)

interface DiscordDoc {
  author: string
  createdAt: string
  helpful: boolean
  messageCount: number
  messages: unknown[]
  name: string
  objectId: string
  platform: 'Discord' | 'Github'
  slug: string
}

/** Payload REST `community-help` row — `communityHelpJSON` shape differs for Discord vs GitHub. */
type CommunityHelpRestDoc = {
  communityHelpJSON: {
    [key: string]: unknown
    author?: { name?: string }
    body?: string
    comments?: GithubThreadComment[]
    commentTotal?: number
    createdAt?: string
    id?: string
    info?: { createdAt?: string; id?: string; name?: string }
    intro?: { authorName?: string }
    messageCount?: number
    messages?: { authorName?: string; content?: string }[]
    slug?: string
    title?: string
    upvotes?: number
  }
  discordId?: string
  githubId?: string
  helpful?: boolean
  threadCreatedAt?: string
}

type GithubReply = { author?: { name?: string }; body?: string }

type GithubThreadComment = {
  author?: { name?: string }
  body?: string
  replies?: GithubReply[]
}

interface GithubDoc {
  author: string
  comments: unknown[]
  createdAt: string
  description: string
  helpful: boolean
  messageCount: number
  name: string
  objectId: string
  platform: 'Discord' | 'Github'
  slug: string
  upvotes: number
}
export const syncToAlgolia = async (): Promise<void> => {
  if (!appId || !apiKey || !indexName) {
    throw new Error('Algolia environment variables are not set')
  }

  const communityHelpThreads: { docs?: CommunityHelpRestDoc[] } = await fetch(
    `${NEXT_PUBLIC_CMS_URL}/api/community-help?limit=0`,
  ).then((res) => res.json())

  const docs = communityHelpThreads?.docs ?? []

  const discordDocs: DiscordDoc[] = []
  const githubDocs: GithubDoc[] = []

  docs.forEach((doc: CommunityHelpRestDoc) => {
    const { communityHelpJSON, discordId, githubId, helpful, threadCreatedAt } = doc

    if (discordId) {
      const { slug, info, intro, messageCount, messages } = communityHelpJSON
      if (!info?.id || !info.name || !intro?.authorName) {
        return
      }

      const formattedDate = new Date(threadCreatedAt || info.createdAt || 0).toISOString()

      discordDocs.push({
        name: info.name,
        slug: slug ?? '',
        author: intro.authorName,
        createdAt: formattedDate,
        helpful: helpful ?? false,
        messageCount: messageCount ?? 0,
        messages: (messages ?? []).map((message) => {
          if (message) {
            return {
              author: message.authorName,
              content: message.content,
            }
          }
        }),
        objectId: info.id,
        platform: 'Discord',
      })
    }

    if (githubId) {
      const { id, slug, author, body, comments, commentTotal, createdAt, title, upvotes } =
        communityHelpJSON

      githubDocs.push({
        name: title ?? '',
        slug: slug ?? '',
        author: author?.name ?? '',
        comments: (comments ?? []).map((comment) => {
          const replies = comment.replies?.map((reply) => {
            return {
              author: reply.author?.name ?? '',
              content: reply.body ?? '',
            }
          })

          return {
            author: comment.author?.name ?? '',
            content: comment.body ?? '',
            replies: replies ?? [],
          }
        }),
        createdAt: createdAt ?? '',
        description: body ?? '',
        helpful: helpful ?? false,
        messageCount: commentTotal ?? 0,
        objectId: id ?? '',
        platform: 'Github',
        upvotes: upvotes ?? 0,
      })
    }
  })

  const records = [...discordDocs, ...githubDocs]

  await index.saveObjects(records).wait()
}

