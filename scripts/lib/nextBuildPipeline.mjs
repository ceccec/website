/**
 * Single source for the Vercel-style pipeline (Node + Postgres or Docker/Mongo):
 * `generate:llms` → optional `payload migrate` → `next build --webpack`.
 * Used by `scripts/build.mjs`. Docker build sets `SKIP_DATABASE_MIGRATE=1` to skip migrate at image build.
 */
import { execSync } from 'node:child_process'

const NEXT_WEBPACK =
  'pnpm exec cross-env NODE_OPTIONS=--no-deprecation next build --webpack'
const WITH_MIGRATE = `pnpm run generate:llms && payload migrate && ${NEXT_WEBPACK}`
const WITHOUT_MIGRATE = `pnpm run generate:llms && ${NEXT_WEBPACK}`

/**
 * @param {NodeJS.ProcessEnv} childEnv
 * @param {boolean} skipMigrate matches `SKIP_DATABASE_MIGRATE` in `build.mjs` / Docker
 */
export function execVercelStyleBuildPipeline(childEnv, skipMigrate) {
  const cmd = skipMigrate ? WITHOUT_MIGRATE : WITH_MIGRATE
  execSync(cmd, { stdio: 'inherit', env: childEnv })
}
