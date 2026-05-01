/**
 * CLI (`payload run`): Local API with explicit config — Payload’s recommended pattern for scripts.
 * @see https://payloadcms.com/docs/local-api/overview
 */
import config from ‘@payload-config’
import { getPayload } from ‘payload’

import { processBatch } from ‘../utilities/BatchProcessor’
import { httpClient } from ‘../utilities/HttpClient’
import sanitizeSlug from ‘../utilities/sanitizeSlug’

const { GITHUB_ACCESS_TOKEN } = process.env
const headers = {
  Authorization: `Bearer ${GITHUB_ACCESS_TOKEN}`,
  'Content-Type': 'application/json',
}

type ExistingDiscussion = {
  docId: string
  githubId: string
}

async function fetchGitHub(): Promise<void> {
  if (!GITHUB_ACCESS_TOKEN) {
    console.log('[fetchGitHub] No GitHub access token found - skipping discussions retrieval')
    return
  }

  console.time('[fetchGitHub] Total duration')
  console.log('[fetchGitHub] Starting GitHub discussions sync...')

  const discussionData: any = []

  const createQuery = (cursor = null, hasNextPage: boolean): string => {
    const queryLine =
      cursor && hasNextPage
        ? `(first: 100, categoryId: "MDE4OkRpc2N1c3Npb25DYXRlZ29yeTMyMzY4NTUw", after: "${
            cursor as string
          }")`
        : `(first: 100, categoryId: "MDE4OkRpc2N1c3Npb25DYXRlZ29yeTMyMzY4NTUw")`

    return `query {
      repository(owner:"payloadcms", name:"payload") {
        discussions${queryLine} {
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            title
            bodyHTML
            url
            number
            createdAt
            upvoteCount,
            category {
              isAnswerable
              id
            }
            author {
              login
              avatarUrl
              url
            }
            comments(first: 30) {
              totalCount,
              edges {
                node {
                  author {
                    login
                    avatarUrl
                    url
                  }
                  bodyHTML
                  createdAt
                  replies(first: 30) {
                    edges {
                      node {
                        author {
                          login
                          avatarUrl
                          url
                        }
                        bodyHTML
                        createdAt
                      }
                    }
                  }
                }
              }
            }
            answer {
              author {
                login
                avatarUrl
                url
              }
              bodyHTML
              createdAt
              replies(first: 30) {
                edges {
                  node {
                    author {
                      login
                      avatarUrl
                      url
                    }
                    bodyHTML
                    createdAt
                  }
                }
              }
            }
            answerChosenAt
            answerChosenBy {
              login
            }
          }
        }
      }
    }`
  }

  const initialResponse = await fetch('https://api.github.com/graphql', {
    body: JSON.stringify({
      query: createQuery(null, false),
    }),
    headers,
    method: 'POST',
  })

  const initialReq: any = await initialResponse.json()

  if (initialReq.errors) {
    console.error('[fetchGitHub] GitHub API returned errors:', JSON.stringify(initialReq.errors))
    throw new Error(`GitHub API error: ${initialReq.errors[0]?.message || 'Unknown error'}`)
  }

  if (!initialReq.data?.repository?.discussions) {
    console.error('[fetchGitHub] Unexpected GitHub API response:', JSON.stringify(initialReq))
    throw new Error('GitHub API returned unexpected response structure')
  }

  discussionData.push(...initialReq.data.repository.discussions.nodes)
  let hasNextPage = initialReq.data.repository.discussions.pageInfo.hasNextPage
  let cursor = initialReq.data.repository.discussions.pageInfo.endCursor

  while (hasNextPage) {
    // Use unified HttpClient with exponential backoff for retries
    const nextResponse = await httpClient.fetch('https://api.github.com/graphql', {
      body: JSON.stringify({
        query: createQuery(cursor, hasNextPage),
      }),
      headers,
      method: 'POST',
    }, {
      maxRetries: 3,
      baseDelay: 3000,
      backoffMultiplier: 1, // Use fixed 3s delay instead of exponential
    })

    const nextReq: any = await nextResponse.json()

    // Check for timeout or service errors in the response
    if (nextReq.message && nextReq.message.includes("couldn't respond")) {
      console.error('[fetchGitHub] GitHub API timeout:', nextReq.message)
      throw new Error(`GitHub API timeout: ${nextReq.message}`)
    }

    if (nextReq.errors) {
      console.error('[fetchGitHub] GitHub API returned errors:', JSON.stringify(nextReq.errors))
      throw new Error(`GitHub API error: ${nextReq.errors[0]?.message || 'Unknown error'}`)
    }

    if (!nextReq.data?.repository?.discussions) {
      console.error('[fetchGitHub] Unexpected GitHub API response:', JSON.stringify(nextReq))
      throw new Error('GitHub API returned unexpected response structure')
    }

    discussionData.push(...nextReq.data.repository.discussions.nodes)

    hasNextPage = nextReq.data.repository.discussions.pageInfo.hasNextPage
    cursor = nextReq.data.repository.discussions.pageInfo.endCursor
  }

  console.log(`[fetchGitHub] Retrieved ${discussionData.length} discussions from GitHub`)
  const formattedDiscussions = discussionData.map((discussion) => {
    const { answer, answerChosenAt, answerChosenBy, category } = discussion

    if (answer !== null && category.isAnswerable) {
      const answerReplies = answer?.replies.edges.map((replyEdge) => {
        const reply = replyEdge.node

        return {
          author: {
            name: reply.author.login,
            avatar: reply.author.avatarUrl,
            url: reply.author.url,
          },
          body: reply.bodyHTML,
          createdAt: reply.createdAt,
        }
      })

      const formattedAnswer = {
        author: {
          name: answer.author?.login,
          avatar: answer.author?.avatarUrl,
          url: answer.author?.url,
        },
        body: answer.bodyHTML,
        chosenAt: answerChosenAt,
        chosenBy: answerChosenBy?.login,
        createdAt: answer.createdAt,
        replies: answerReplies?.length > 0 ? answerReplies : null,
      }
      const comments = discussion.comments.edges.map((edge) => {
        const comment = edge.node

        const replies = comment.replies.edges.map((replyEdge) => {
          const reply = replyEdge.node

          return {
            author: {
              name: reply.author.login,
              avatar: reply.author.avatarUrl,
              url: reply.author.url,
            },
            body: reply.bodyHTML,
            createdAt: reply.createdAt,
          }
        })

        return {
          author: {
            name: comment.author.login,
            avatar: comment.author.avatarUrl,
            url: comment.author.url,
          },
          body: comment.bodyHTML,
          createdAt: comment.createdAt,
          replies: replies?.length ? replies : null,
        }
      })

      return {
        id: String(discussion.number),
        slug: sanitizeSlug(discussion.title),
        answer: formattedAnswer,
        author: {
          name: discussion.author?.login,
          avatar: discussion.author?.avatarUrl,
          url: discussion.author?.url,
        },
        body: discussion.bodyHTML,
        comments,
        commentTotal: discussion.comments.totalCount,
        createdAt: discussion.createdAt,
        title: discussion.title,
        upvotes: discussion.upvoteCount,
        url: discussion.url,
      }
    }
    return null
  })

  const filteredDiscussions = formattedDiscussions.filter((discussion) => discussion !== null)

  console.log('[fetchGitHub] Fetching existing GitHub discussions from CMS...')
  const payload = await getPayload({ config })
  const existingDiscussionsResult = await payload.find({
    collection: 'community-help',
    depth: 0,
    limit: 0,
    overrideAccess: true,
    where: {
      communityHelpType: {
        equals: 'github',
      },
    },
  })

  const existingDiscussions: ExistingDiscussion[] = existingDiscussionsResult.docs.map((thread) => ({
    docId: thread.id,
    githubId: thread.githubId as string,
  }))

  // Apply batch limit if set
  const batchLimit = process.env.SYNC_BATCH_LIMIT
    ? parseInt(process.env.SYNC_BATCH_LIMIT, 10)
    : filteredDiscussions.length

  const discussionsToSync = filteredDiscussions.slice(0, batchLimit)

  console.log(
    `[fetchGitHub] Found ${existingDiscussions.length} existing discussions in CMS, ${filteredDiscussions.length} to process${
      batchLimit < filteredDiscussions.length
        ? ` (processing ${batchLimit} this run due to SYNC_BATCH_LIMIT)`
        : ''
    }`,
  )

  // Upsert discussions to database using segmented batch processing
  await processBatch(
    discussionsToSync,
    async (discussion) => {
      if (!discussion) {
        return
      }

      const existingDiscussion = existingDiscussions.find((d) => d.githubId === discussion.id)
      const data = {
        slug: discussion.slug,
        communityHelpJSON: discussion,
        communityHelpType: 'github' as const,
        githubId: discussion.id,
        threadCreatedAt: discussion.createdAt,
        title: discussion.title,
      }

      if (existingDiscussion) {
        // Update existing discussion
        await payload.update({
          id: existingDiscussion.docId,
          collection: 'community-help',
          data,
          overrideAccess: true,
        })
        console.log(
          `[fetchGitHub] Successfully updated discussion "${discussion.title}" (#${discussion.id})`,
        )
      } else {
        // Create new discussion
        await payload.create({
          collection: 'community-help',
          data,
          overrideAccess: true,
        })
        console.log(
          `[fetchGitHub] Successfully created discussion "${discussion.title}" (#${discussion.id})`,
        )
      }
    },
    {
      mode: 'segmented', // Process in segments for database safety
      segmentSize: 10,
      enableLogging: true,
    },
  )
  console.log('[fetchGitHub] Sync completed!')
  console.timeEnd('[fetchGitHub] Total duration')
}

export default fetchGitHub
