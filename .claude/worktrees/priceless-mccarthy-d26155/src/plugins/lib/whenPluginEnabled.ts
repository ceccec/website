import type { Plugin } from 'payload'

/** Returns a plugin only when the env flag is on; conventional optional first-party install. */
export function whenPluginEnabled<T extends Plugin>(isEnabled: () => boolean, create: () => T): null | T {
  return isEnabled() ? create() : null
}
