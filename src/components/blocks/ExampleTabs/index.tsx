'use client'

import type { PaddingProps, Settings } from '@components/BlockWrapper/index'
import type { Page } from '@root/payload-types'

import { BackgroundGrid } from '@components/BackgroundGrid/index'
import { BlockWrapper } from '@components/BlockWrapper/index'
import Code from '@components/Code/index'
import { Gutter } from '@components/Gutter/index'
import { Media } from '@components/Media/index'
import { RichText } from '@components/RichText/index'
import React, { useId, useState } from 'react'

import classes from './index.module.scss'

export type ExampleTabsProps = {
  hideBackground?: boolean
  marginAdjustment?: { marginLeft?: string; marginRight?: string }
  padding?: PaddingProps
} & Extract<Page['layout'][0], { blockType: 'exampleTabs' }>

export const ExampleTabsBlock: React.FC<ExampleTabsProps> = ({
  content,
  hideBackground,
  marginAdjustment,
  padding,
  tabs,
}) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const baseId = useId()

  if (!tabs?.length) {
    return null
  }

  const emptySettings = {} as Settings

  return (
    <BlockWrapper hideBackground={hideBackground} padding={padding} settings={emptySettings}>
      <div
        style={{
          marginLeft: marginAdjustment?.marginLeft,
          marginRight: marginAdjustment?.marginRight,
        }}
      >
        {!hideBackground && <BackgroundGrid zIndex={0} />}
        <Gutter>
        <div className={['grid'].filter(Boolean).join(' ')}>
          {content && (
            <div
              className={[classes.intro, 'cols-8 start-5 cols-m-8 start-m-1'].filter(Boolean).join(' ')}
            >
              <RichText content={content} />
            </div>
          )}
          <div
            className={[classes.tabsSection, 'cols-10 start-4 cols-m-8 start-m-1']
              .filter(Boolean)
              .join(' ')}
          >
            <div className={classes.tabList} role="tablist">
              {tabs.map((tab, index) => {
                const panelId = `${baseId}-panel-${index}`
                const tabId = `${baseId}-tab-${index}`
                const isActive = activeIndex === index
                return (
                  <button
                    aria-controls={panelId}
                    aria-selected={isActive}
                    className={[classes.tab, isActive && classes.tabActive].filter(Boolean).join(' ')}
                    id={tabId}
                    key={tab.id ?? `tab-${index}`}
                    onClick={() => setActiveIndex(index)}
                    role="tab"
                    type="button"
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>
            {tabs.map((tab, index) => {
              const panelId = `${baseId}-panel-${index}`
              const tabId = `${baseId}-tab-${index}`
              const isActive = activeIndex === index
              return (
                <div
                  aria-labelledby={tabId}
                  className={[classes.tabPanel, isActive ? classes.tabPanelActive : classes.tabPanelHidden]
                    .filter(Boolean)
                    .join(' ')}
                  hidden={!isActive}
                  id={panelId}
                  key={tab.id ?? `panel-${index}`}
                  role="tabpanel"
                >
                  {tab.content && <RichText content={tab.content} />}
                  <div className={classes.examples}>
                    {tab.examples?.map((ex, i) => {
                      if (ex.blockType === 'CodeExampleBlock') {
                        return (
                          <div className={classes.exampleCode} key={ex.id ?? `code-${i}`}>
                            <Code disableMinHeight>{ex.code}</Code>
                          </div>
                        )
                      }
                      if (ex.blockType === 'MediaExampleBlock') {
                        const m = ex.media
                        if (typeof m === 'string' || m == null) {
                          return null
                        }
                        return (
                          <div className={classes.exampleMedia} key={ex.id ?? `media-${i}`}>
                            <Media resource={m} />
                          </div>
                        )
                      }
                      return null
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Gutter>
      </div>
    </BlockWrapper>
  )
}
