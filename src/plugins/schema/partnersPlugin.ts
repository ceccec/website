import type { Plugin } from 'payload'

import { Budgets, Industries, Regions, Specialties } from '@root/collections/PartnerFilters'
import { Partners } from '@root/collections/Partners'
import { PartnerProgram } from '@root/globals/PartnerProgram'

import { partnersTemplateEnabled } from '../env'

/** Partner directory + program global. */
export const partnersPlugin: Plugin = (config) => {
  if (!partnersTemplateEnabled()) {return config}
  return {
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
  }
}
