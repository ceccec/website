import { migrateSlateToLexical } from '@payloadcms/richtext-lexical/migrate'
import { getPayload } from '@root/lib/getPayload'

/**
 * Slate → Lexical migration runner.
 * Uses `@root/lib/getPayload` — same cached Local API instance as Next server code.
 *
 * @see https://payloadcms.com/docs/local-api/overview
 */
async function run() {
  const payload = await getPayload()

  await migrateSlateToLexical({ payload })
  process.exit(0)
}

void run()
