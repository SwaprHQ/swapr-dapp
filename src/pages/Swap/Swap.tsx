// Landing Page Imports
import './../../theme/landingPageTheme/stylesheet.css'
import { useEffect, useState } from 'react'
import { redirect } from 'react-router-dom'
import styled from 'styled-components'

import Hero from '../../components/LandingPageComponents/layout/Hero'
import { useActiveWeb3React } from '../../hooks'
import { useRouter } from '../../hooks/useRouter'
import { useUpdateSelectedSwapTab } from '../../state/user/hooks'
import { ChartOptions, SwapTabs } from '../../state/user/reducer'
import { AdvancedTradingViewBox } from './AdvancedTradingViewBox'
import { ChartTabs } from './Components/ChartTabs'
import { Tabs } from './Components/Tabs'
import { LandingSections } from './LandingSections'
import { LimitOrderBox } from './LimitOrderBox'
import { supportedChainIdList } from './LimitOrderBox/constants'
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
  const { account, chainId } = useActiveWeb3React()

  // Control the active tab
  const [activeTab, setActiveTab] = useState(Swap)
  const [activeChartTab, setActiveChartTab] = useState(ChartOptions.OFF)
  const { pathname } = useRouter()
  const [, setAdvancedView] = useUpdateSelectedSwapTab()

  useEffect(() => {
    if (activeTab === LimitOrder && (!chainId || (chainId && !supportedChainIdList.includes(chainId)))) {
      setActiveTab(Swap)
      redirect('/swap')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, chainId])

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
        activeChartTab,
        setActiveChartTab,
      }}
    >
      <Hero>
        <AppBodyContainer>
          {activeTab !== AdvancedTradingView && (
            <Tabs>
              <ChartTabs setActiveChartTab={setActiveChartTab} activeChartTab={activeChartTab} />
            </Tabs>
          )}
          {activeTab === Swap && <SwapBox />}
          {activeTab === AdvancedTradingView && <AdvancedTradingViewBox />}
          {activeTab === LimitOrder && <LimitOrderBox />}
        </AppBodyContainer>
      </Hero>
      <LandingSections />
    </SwapContext.Provider>
  )
}
