/**
 * Non-cryptographic client-only id — **not** related to `@uuid` (v5 / cache keys / integrity seals).
 * Use `@uuid` for deterministic fingerprints; use this for ephemeral UI keys only.
 */
export function randomLocalId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
