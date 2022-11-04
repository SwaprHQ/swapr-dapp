// Landing Page Imports
import './../../theme/landingPageTheme/stylesheet.css'
import { useEffect, useState } from 'react'
import styled from 'styled-components'

import Hero from '../../components/LandingPageComponents/layout/Hero'
import { Tabs } from '../../components/Swap/Tabs'
import { useRouter } from '../../hooks/useRouter'
import { SwapContext, SwapTab } from '../../modules/swap/context'
import { useUpdateSelectedSwapTab } from '../../state/user/hooks'
import { SwapTabs } from '../../state/user/reducer'
import { AdvancedTradingView } from './partials/AdvancedTradingView'
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
  const [activeTab, setActiveTab] = useState(SwapTab.Swap)
  const { pathname } = useRouter()
  const [, setAdvancedView] = useUpdateSelectedSwapTab()

  useEffect(() => {
    if (pathname.includes('/pro')) {
      setActiveTab(SwapTab.AdvancedTradingView)
      setAdvancedView(SwapTabs.SWAP)
    } else if (pathname.includes('swap')) {
      setActiveTab(SwapTab.Swap)
    }
  }, [pathname, setAdvancedView])

  return (
    <SwapContext.Provider
      value={{
        activeTab,
        setActiveTab,
      }}
    >
      <Hero>
        <AppBodyContainer>
          {activeTab !== SwapTab.AdvancedTradingView && <Tabs />}
          {activeTab === SwapTab.Swap && <SwapBox />}
          {activeTab === SwapTab.AdvancedTradingView && <AdvancedTradingView />}
          {activeTab === SwapTab.LimitOrder && <LimitOrderBox />}
        </AppBodyContainer>
      </Hero>
      <LandingSections key="hello" />
    </SwapContext.Provider>
  )
}
