import type { Footer, GetStarted, MainMenu, TopBar } from '@types'

/** Nav/footer globals are registered only when `PAYLOAD_TEMPLATE_MARKETING` is on (`marketingPlugin`). */
export function emptyMarketingLayoutGlobals(): {
  footer: Footer
  mainMenu: MainMenu
  topBar: TopBar
} {
  return {
    footer: { id: 0, columns: [] },
    mainMenu: {
      id: 0,
      menuCta: { label: '' },
      tabs: [],
    },
    topBar: { id: 0, enableTopBar: false },
  }
}

export function emptyGetStartedGlobal(): GetStarted {
  return { id: 0 }
}
