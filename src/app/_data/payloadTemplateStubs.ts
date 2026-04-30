import type { Footer, GetStarted, MainMenu, TopBar } from '@types'

/** Nav/footer globals are registered only when `PAYLOAD_TEMPLATE_MARKETING` is on (`marketingPlugin`). */
export function emptyMarketingLayoutGlobals(): {
  footer: Footer
  mainMenu: MainMenu
  topBar: TopBar
} {
  const stubId = '00000000-0000-0000-0000-000000000000'

  return {
    footer: { id: stubId, columns: [] },
    mainMenu: {
      id: stubId,
      menuCta: { label: '' },
      tabs: [],
    },
    topBar: { id: stubId, enableTopBar: false },
  }
}

export function emptyGetStartedGlobal(): GetStarted {
  return { id: '00000000-0000-0000-0000-000000000000' }
}
