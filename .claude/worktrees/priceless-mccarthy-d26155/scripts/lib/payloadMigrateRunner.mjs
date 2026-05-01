/**
 * Shared `payload migrate` behavior for `scripts/migrate-production.mjs`.
 */
import { execSync } from 'node:child_process'

/**
 * @param {NodeJS.ProcessEnv} env
 */
export function runPayloadMigratePipeline(env) {
  const migrateEnv = {
    ...env,
    NODE_ENV: 'production',
    PAYLOAD_SECRET: env.PAYLOAD_SECRET || 'ignore',
  }

  if (env.SKIP_DATABASE_MIGRATE === '1' || env.SKIP_DATABASE_MIGRATE === 'true') {
    console.warn(
      '[migrate-production] SKIP_DATABASE_MIGRATE set — skipping payload migrate. Prefer running migrations so schema matches src/migrations.',
    )
    return
  }

  const assumeNo =
    env.PAYLOAD_MIGRATE_ASSUME_NO === '1' || env.PAYLOAD_MIGRATE_ASSUME_NO === 'true'

  const ci =
    env.CI === '1' || env.CI === 'true' || env.CONTINUOUS_INTEGRATION === 'true'

  const assumeYes =
    !assumeNo &&
    (env.PAYLOAD_MIGRATE_ASSUME_YES === '1' ||
      env.PAYLOAD_MIGRATE_ASSUME_YES === 'true' ||
      ci)

  if (assumeYes && ci && !env.PAYLOAD_MIGRATE_ASSUME_YES) {
    console.warn(
      '[migrate-production] CI detected — running migrate non-interactively (set PAYLOAD_MIGRATE_ASSUME_NO=1 to fail instead of auto-yes).',
    )
  }

  if (assumeYes) {
    execSync('printf "y\\n" | payload migrate', { stdio: 'inherit', env: migrateEnv, shell: true })
    return
  }

  execSync('payload migrate', { stdio: 'inherit', env: migrateEnv })
}
