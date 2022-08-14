// Landing Page Imports
import './../../theme/landingPageTheme/stylesheet.css'
import React, { useState } from 'react'
import styled from 'styled-components'

import Hero from '../../components/LandingPageComponents/layout/Hero'
import { Tabs } from '../../components/swap/Tabs'
import { SwapContext, SwapTab } from '../../modules/swap/context'
import { LandingSections } from './partials/LandingSections'
import { LimitOrderBox } from './partials/LimitOrderBox'
import { SwapBox } from './partials/SwapBox/SwapBox.component'

const AppBodyContainer = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 3;
  min-height: calc(100vh - 340px);
`
/**
 * Swap page component
 */
export function Swap() {
  // Control the active tab
  const [activeTab, setActiveTab] = useState(SwapTab.EcoRouter)

  return (
    <SwapContext.Provider
      value={{
        activeTab,
        setActiveTab,
      }}
    >
      <Hero>
        <AppBodyContainer>
          <Tabs />
          {activeTab === SwapTab.EcoRouter && <SwapBox />}
          {activeTab === SwapTab.LimitOrder && <LimitOrderBox />}
        </AppBodyContainer>
      </Hero>
      <LandingSections />
    </SwapContext.Provider>
  )
}
