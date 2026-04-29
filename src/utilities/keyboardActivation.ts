import type { KeyboardEvent as ReactKeyboardEvent } from 'react'

/** Enter / Space — for `role="button"` and similar non-native controls. */
export function isKeyboardActivation(event: ReactKeyboardEvent): boolean {
  return event.key === 'Enter' || event.key === ' '
}

/**
 * Run `action` on Enter/Space; prevents default so Space does not scroll the page.
 */
export function handleActivationKeydown<E extends HTMLElement>(
  event: ReactKeyboardEvent<E>,
  action: () => void,
): void {
  if (!isKeyboardActivation(event)) {
    return
  }
  event.preventDefault()
  action()
}
