import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const vercelPath = path.join(root, 'vercel.json')
JSON.parse(fs.readFileSync(vercelPath, 'utf8'))
console.log('vercel.json: OK')
