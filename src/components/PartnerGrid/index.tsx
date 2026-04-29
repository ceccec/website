import type { Partner } from '@root/payload-types'

import { PartnerCard } from '@components/cards/PartnerCard'

import classes from './index.module.scss'

/** Matches directory filters: taxonomy stored as string keys, not relation ids */
type PartnerDirectoryEntry = {
  budgets: string[]
  industries: string[]
  regions: string[]
  specialties: string[]
} & Omit<Partner, 'budgets' | 'industries' | 'regions' | 'specialties'>

type PartnerGridProps = {
  featured?: boolean
  partners: (number | Partner | PartnerDirectoryEntry | string)[]
}

export const PartnerGrid = (props: PartnerGridProps) => {
  const { featured, partners } = props
  return (
    <div className={classes.PartnerGridWrap}>
      {partners?.map((partner) => {
        return (
          typeof partner === 'object' &&
          partner !== null && (
            <PartnerCard
              {...partner}
              key={`${partner.id}${featured === true ? '_featured' : ''}`}
            />
          )
        )
      })}
    </div>
  )
}
