/**
 * Payload migration index. The previous hand-listed entries pointed at migration files that no
 * longer exist; the database adapter discovers migrations from this directory directly.
 */
export const migrations: { down: unknown; name: string; up: unknown }[] = []
