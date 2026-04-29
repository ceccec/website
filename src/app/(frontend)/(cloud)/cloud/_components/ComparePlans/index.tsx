import type { Plan } from '@root/payload-cloud-types'

import { PricingCard } from '@components/cards/PricingCard/index'
import { Drawer, DrawerToggler } from '@components/Drawer/index'
import { useModal } from '@faceless-ui/modal'
import { ArrowIcon } from '@root/icons/ArrowIcon/index'
import { CheckIcon } from '@root/icons/CheckIcon/index'
import { CloseIcon } from '@root/icons/CloseIcon/index'
import { handleActivationKeydown } from '@utilities/keyboardActivation'
import React, { Fragment } from 'react'

import classes from './index.module.scss'

function comparePlanPriceLabel(plan: Plan): string {
  if (typeof plan !== 'object' || plan === null || !('priceJSON' in plan)) {
    return ''
  }
  const raw = plan.priceJSON?.toString() || ''
  try {
    const parsed = JSON.parse(raw) as { unit_amount?: number }
    const cents = parsed?.unit_amount
    if (cents === undefined) {
      return ''
    }
    return (cents / 100).toLocaleString('en-US', {
      currency: 'USD',
      style: 'currency',
    })
  } catch {
    return ''
  }
}

type ComparePlansProps = {
  handlePlanChange: (value?: null | Plan) => void
  plans: Plan[]
}

export const ComparePlans: React.FC<ComparePlansProps> = (props) => {
  const { handlePlanChange, plans } = props
  const { closeModal } = useModal()

  const handleSelect = (plan: Plan) => {
    handlePlanChange(plan)
    closeModal(`comparePlans`)
  }

  return (
    <Fragment>
      <DrawerToggler className={classes.drawerToggle} slug={`comparePlans`}>
        Compare Plans
        <ArrowIcon />
      </DrawerToggler>
      <Drawer size={plans.length > 2 ? 'l' : 'm'} slug={`comparePlans`} title={'Compare Plans'}>
        <div className={classes.compareTable}>
          {plans?.map((plan, i) => {
            const highlight = plan.highlight ? classes.highlight : ''

            return (
              <div
                className={classes.planCard}
                key={i}
                onClick={() => handleSelect(plan)}
                onKeyDown={(event) => handleActivationKeydown(event, () => handleSelect(plan))}
                role="button"
                tabIndex={0}
              >
                <PricingCard
                  className={[classes.pricingCard, highlight].join(' ')}
                  description={plan.description}
                  key={plan.name}
                  leader={plan.name}
                  price={comparePlanPriceLabel(plan)}
                />
                <ul className={classes.features}>
                  {plan?.features?.map((feature, i) => {
                    return (
                      <li className={classes.feature} key={i}>
                        <div className={feature.icon && classes[feature.icon]}>
                          {feature.icon === 'check' && <CheckIcon size="medium" />}
                          {feature.icon === 'x' && <CloseIcon />}
                        </div>
                        {feature.feature}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </div>
      </Drawer>
    </Fragment>
  )
}
