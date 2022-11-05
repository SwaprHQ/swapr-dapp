// Landing Page Imports
import './../../theme/landingPageTheme/stylesheet.css'
import { useEffect, useState } from 'react'
import styled from 'styled-components'

import Hero from '../../components/LandingPageComponents/layout/Hero'
import { useRouter } from '../../hooks/useRouter'
import { useUpdateSelectedSwapTab } from '../../state/user/hooks'
import { SwapTabs } from '../../state/user/reducer'
import { AdvancedTradingViewBox } from './AdvancedTradingViewBox'
import { Tabs } from './Components/Tabs'
import { LandingSections } from './LandingSections'
import { LimitOrderBox } from './LimitOrderBox'
import { SwapBox } from './SwapBox/SwapBox.component'
import { SwapContext, SwapTab } from './SwapContext'

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
  const { Swap, AdvancedTradingView, LimitOrder } = SwapTab
  // Control the active tab
  const [activeTab, setActiveTab] = useState(Swap)
  const { pathname } = useRouter()
  const [, setAdvancedView] = useUpdateSelectedSwapTab()

  useEffect(() => {
    if (pathname.includes('/pro')) {
      setActiveTab(AdvancedTradingView)
      setAdvancedView(SwapTabs.SWAP)
    } else if (pathname.includes('swap')) {
      setActiveTab(Swap)
    }
  }, [AdvancedTradingView, Swap, pathname, setAdvancedView])

  return (
    <SwapContext.Provider
      value={{
        activeTab,
        setActiveTab,
      }}
    >
      <Hero>
        <AppBodyContainer>
          {activeTab !== AdvancedTradingView && <Tabs />}
          {activeTab === Swap && <SwapBox />}
          {activeTab === AdvancedTradingView && <AdvancedTradingViewBox />}
          {activeTab === LimitOrder && <LimitOrderBox />}
        </AppBodyContainer>
      </Hero>
      <LandingSections />
    </SwapContext.Provider>
  )
}
