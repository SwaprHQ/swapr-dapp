// Landing Page Imports
import './../../theme/landingPageTheme/stylesheet.css'
import { Fragment, useEffect, useState } from 'react'
import { redirect } from 'react-router-dom'
import styled from 'styled-components'

import Hero from '../../components/LandingPageComponents/layout/Hero'
import { useActiveWeb3React } from '../../hooks'
import { useRouter } from '../../hooks/useRouter'
import { ChartOption, SwapTab } from '../../state/user/reducer'

import { AdvancedTradingViewBox } from './AdvancedTradingViewBox'
import { Tabs } from './Components/Tabs'
import { LandingSections } from './LandingSections'
import LimitOrderUI from './LimitOrder'
import { LimitOrderBox } from './LimitOrderBox'
import { supportedChainIdList } from './LimitOrderBox/constants'
import { SwapBox } from './SwapBox/SwapBox.component'
import { SwapTabContext } from './SwapContext'

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
  const { SWAP, LIMIT_ORDER, LIMIT_ORDER_NEW } = SwapTab
  const { account, chainId } = useActiveWeb3React()

  // Control the active tab
  const [activeTab, setActiveTab] = useState(SWAP)
  const [activeChartTab, setActiveChartTab] = useState(ChartOption.OFF)
  const { pathname } = useRouter()

  const isPro = pathname.includes('/pro')

  useEffect(() => {
    if (activeTab === LIMIT_ORDER && (!chainId || (chainId && !supportedChainIdList.includes(chainId)))) {
      setActiveTab(SWAP)
      redirect('/swap')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, chainId])

  useEffect(() => {
    if (isPro) {
      setActiveChartTab(ChartOption.PRO)
    } else if (pathname.includes('swap')) {
      setActiveChartTab(ChartOption.OFF)
    }
  }, [isPro, setActiveChartTab, pathname])

  const AdvancedViewWrapper = isPro ? AdvancedTradingViewBox : Fragment

  return (
    <SwapTabContext.Provider
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
            {activeTab === SWAP && <SwapBox />}
            {activeTab === LIMIT_ORDER && <LimitOrderBox />}
            {activeTab === LIMIT_ORDER_NEW && <LimitOrderUI />}
          </AdvancedViewWrapper>
        </AppBodyContainer>
      </Hero>
      {!isPro && <LandingSections />}
    </SwapTabContext.Provider>
  )
}
