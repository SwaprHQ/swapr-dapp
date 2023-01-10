// Landing Page Imports
import './../../theme/landingPageTheme/stylesheet.css'
import { Fragment, useEffect, useState } from 'react'
import { redirect } from 'react-router-dom'
import styled from 'styled-components'

import Hero from '../../components/LandingPageComponents/layout/Hero'
import { useActiveWeb3React } from '../../hooks'
import { useRouter } from '../../hooks/useRouter'
import { useUpdateSelectedSwapTab } from '../../state/user/hooks'
import { AdvancedTradingViewBox } from './AdvancedTradingViewBox'
import { Tabs } from './Components/Tabs'
import { LandingSections } from './LandingSections'
import { LimitOrderBox } from './LimitOrderBox'
import { supportedChainIdList } from './LimitOrderBox/constants'
import { SwapBox } from './SwapBox/SwapBox.component'
import { ChartOptions, SwapContext, SwapTab } from './SwapContext'

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
  const { Swap, LimitOrder } = SwapTab
  const { account, chainId } = useActiveWeb3React()

  // Control the active tab
  const [activeTab, setActiveTab] = useState(Swap)
  const [activeChartTab, setActiveChartTab] = useState(ChartOptions.OFF)
  const { pathname } = useRouter()
  const [, setAdvancedView] = useUpdateSelectedSwapTab()
  const isPro = pathname.includes('/pro')

  useEffect(() => {
    if (activeTab === LimitOrder && (!chainId || (chainId && !supportedChainIdList.includes(chainId)))) {
      setActiveTab(Swap)
      redirect('/swap')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, chainId])

  useEffect(() => {
    if (isPro) {
      setActiveChartTab(ChartOptions.PRO)
    } else if (pathname.includes('swap')) {
      setActiveChartTab(ChartOptions.OFF)
    }
  }, [Swap, isPro, setAdvancedView, setActiveChartTab, pathname])

  const AdvancedViewWrapper = isPro ? AdvancedTradingViewBox : Fragment

  return (
    <SwapContext.Provider
      value={{
        activeTab,
        setActiveTab,
        activeChartTab,
        setActiveChartTab,
      }}
    >
      <Hero showMarquee={!isPro}>
        <AppBodyContainer>
          <AdvancedViewWrapper>
            <Tabs />
            {activeTab === Swap && <SwapBox />}
            {activeTab === LimitOrder && <LimitOrderBox />}
          </AdvancedViewWrapper>
        </AppBodyContainer>
      </Hero>
      {!isPro && <LandingSections />}
    </SwapContext.Provider>
  )
}
