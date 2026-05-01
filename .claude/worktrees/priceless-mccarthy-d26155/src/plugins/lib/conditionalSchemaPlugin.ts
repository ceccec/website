import type { Config, Plugin } from 'payload'

/**
 * Conventional gated schema plugin: no-op when `enabled()` is false; otherwise merges via `extend`.
 * Keeps `if (!flag) return config` out of every plugin body (payload-plugins / hooks stay lightweight).
 */
export function conditionalSchemaPlugin(enabled: () => boolean, extend: (config: Config) => Config): Plugin {
  return (config) => (enabled() ? extend(config) : config)
}
