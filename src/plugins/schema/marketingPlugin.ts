import type { Plugin } from 'payload'

import { CaseStudies } from '@root/collections/CaseStudies'
import { Categories } from '@root/collections/Categories'
import { CommunityHelp } from '@root/collections/CommunityHelp'
import { Posts } from '@root/collections/Posts'
import { Footer } from '@root/globals/Footer'
import { GetStarted } from '@root/globals/GetStarted'
import { MainMenu } from '@root/globals/MainMenu'
import { TopBar } from '@root/globals/TopBar'

import { marketingContentEnabled } from '../env'

import { conditionalSchemaPlugin } from '../lib/conditionalSchemaPlugin'

/** Blog-style marketing content + primary nav globals. */
export const marketingPlugin: Plugin = conditionalSchemaPlugin(marketingContentEnabled, (config) => ({
  ...config,
  collections: [
    ...(config.collections ?? []),
    CaseStudies,
    CommunityHelp,
    Posts,
    Categories,
  ],
  globals: [...(config.globals ?? []), Footer, MainMenu, TopBar, GetStarted],
}))
