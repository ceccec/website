import type { Plugin } from 'payload'

import { Budgets, Industries, Regions, Specialties } from '@root/collections/PartnerFilters'
import { Partners } from '@root/collections/Partners'
import { PartnerProgram } from '@root/globals/PartnerProgram'

import { partnersTemplateEnabled } from '../env'

import { conditionalSchemaPlugin } from '../lib/conditionalSchemaPlugin'

/** Partner directory + program global. */
export const partnersPlugin: Plugin = conditionalSchemaPlugin(partnersTemplateEnabled, (config) => ({
  ...config,
  collections: [
    ...(config.collections ?? []),
    Partners,
    Industries,
    Specialties,
    Regions,
    Budgets,
  ],
  globals: [...(config.globals ?? []), PartnerProgram],
}))
