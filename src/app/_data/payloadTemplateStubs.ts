import type { Footer, GetStarted, MainMenu, TopBar } from '@types'

/** Nav/footer globals are registered only when `PAYLOAD_TEMPLATE_MARKETING` is on (`marketingPlugin`). */
export function emptyMarketingLayoutGlobals(): {
  footer: Footer
  mainMenu: MainMenu
  topBar: TopBar
} {
  const stubID = '00000000-0000-0000-0000-000000000000'

  return {
    footer: { id: stubID, columns: [] },
    mainMenu: {
      id: stubID,
      menuCta: { label: '' },
      tabs: [],
    },
    topBar: { id: stubID, enableTopBar: false },
  }
}

export function emptyGetStartedGlobal(): GetStarted {
  return { id: '00000000-0000-0000-0000-000000000000' }
}
