/* eslint-disable no-console */
import { constants } from 'fs'
import { access, writeFile } from 'fs/promises'
import { join } from 'path'

import { fetchDocs } from './fetchDocs'

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath, constants.F_OK)
    return true
  } catch {
    return false
  }
}

async function generateLLMs() {
  console.log('Generating LLMs...')
  const token = process.env.GITHUB_ACCESS_TOKEN?.trim()
  if (!token) {
    const llmsPath = join(process.cwd(), 'public', 'llms.txt')
    const fullPath = join(process.cwd(), 'public', 'llms-full.txt')
    const [hasLlms, hasFull] = await Promise.all([pathExists(llmsPath), pathExists(fullPath)])
    if (hasLlms && hasFull) {
      console.log(
        '[generateLLMs] GITHUB_ACCESS_TOKEN not set — keeping committed public/llms.txt and public/llms-full.txt (set the token to refresh from GitHub).',
      )
      return
    }
    console.error(
      '[generateLLMs] GITHUB_ACCESS_TOKEN not set and baseline files are missing. Add the token (see .env.example) or commit public/llms.txt and public/llms-full.txt.',
    )
    process.exitCode = 1
    return
  }

  const output = await fetchDocs({ ref: '3.x', version: 'v3' })

  let outputStr = '# Payload\n\n'
  let fullOutputStr = `# Payload Documentation\n\n`

  for (const group of output) {
    outputStr += `## ${group.groupLabel}\n\n`
    for (const topic of group.topics) {
      outputStr += `### ${topic.label.replace('-', ' ')}\n\n`
      for (const doc of topic.docs) {
        outputStr += `- [${doc.title}](https://payloadcms.com/docs/${topic.slug}/${doc.slug})\n\n`
        fullOutputStr += `# ${doc.title}\n\nSource: https://payloadcms.com/docs/${topic.slug}/${doc.slug}\n\n${doc.content}\n\n`
      }
      outputStr += '\n'
    }
  }

  const filePath = join(process.cwd(), 'public', 'llms.txt')
  const fullFilePath = join(process.cwd(), 'public', 'llms-full.txt')
  await Promise.all([writeFile(filePath, outputStr), writeFile(fullFilePath, fullOutputStr)])
  console.log(`Wrote llms.txt to ${filePath}`)
  console.log(`Wrote llms-full.txt to ${fullFilePath}`)
}

await generateLLMs()
