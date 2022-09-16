import { ApolloProvider } from '@apollo/client'
import AOS from 'aos'
import { Suspense, useEffect, useState } from 'react'
import { SkeletonTheme } from 'react-loading-skeleton'
import { useLocation } from 'react-router-dom'
import { Slide, ToastContainer } from 'react-toastify'
import styled, { useTheme } from 'styled-components'

import { defaultSubgraphClient, subgraphClients } from '../apollo/client'
import Header from '../components/Header'
import { FallbackLoader } from '../components/Loader/FallbackLoader'
import NetworkWarningModal from '../components/NetworkWarningModal'
import { SpaceBg } from '../components/SpaceBg/SpaceBg'
import Web3ReactManager from '../components/Web3ReactManager'
import { useActiveWeb3React } from '../hooks'
import { useSelectedChartTab } from '../state/user/hooks'
import { ChartTabs } from '../state/user/reducer'
import { SWPRSupportedChains } from '../utils/chainSupportsSWPR'
import { Routes } from './Routes'

import 'react-loading-skeleton/dist/skeleton.css'
import 'aos/dist/aos.css'
import 'react-toastify/dist/ReactToastify.css'

const AppWrapper = styled.div`
  display: flex;
  flex-flow: column;
  align-items: flex-start;
  overflow: hidden;
`

const HeaderWrapper = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  width: 100%;
  justify-content: space-between;
`

const BodyWrapper = styled.div<{
  isAdvancedTradeMode?: boolean
}>`
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 172px);
  width: 100%;
  padding-top: ${({ isAdvancedTradeMode }) => (isAdvancedTradeMode ? '30px' : '60px')};
  align-items: center;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  overflow: visible;
  z-index: 10;
  ${({ theme, isAdvancedTradeMode }) => theme.mediaWidth.upToMedium`
    /* [PR#531]: theme.mediaWidth.upToSmall does not cover all the breakpoints smoothly
    padding: 16px;
    */
    padding-top: ${isAdvancedTradeMode ? '1rem' : '2rem'};
  `};

  /* [PR#531] */
  padding-left: ${({ isAdvancedTradeMode }) => (isAdvancedTradeMode ? '0' : '16px')};
  padding-right: ${({ isAdvancedTradeMode }) => (isAdvancedTradeMode ? '0' : '16px')};

  z-index: 1;
`

const Marginer = styled.div`
  margin-top: 5rem;
`

export default function App() {
  const { chainId } = useActiveWeb3React()
  const location = useLocation()
  const theme = useTheme()
  const [isSwapPage, setIsSwapPage] = useState(false)
  const selectedChartTab = useSelectedChartTab()

  useEffect(() => {
    setIsSwapPage(!!location.pathname.includes('swap'))
  }, [location])

  const isSwapPageAdvancedTradeMode = isSwapPage && selectedChartTab === ChartTabs.PRO

  useEffect(() => {
    document.body.classList.add('no-margin')
    setTimeout(function () {
      AOS.init({
        duration: 500,
      })
    }, 1000)
  }, [])

  return (
    <Suspense fallback={null}>
      <SkeletonTheme baseColor={theme.bg3} highlightColor={theme.bg2}>
        <ApolloProvider client={subgraphClients[chainId as SWPRSupportedChains] || defaultSubgraphClient}>
          <NetworkWarningModal />
          <AppWrapper id="app-wrapper">
            <HeaderWrapper>
              <Header />
            </HeaderWrapper>
            <BodyWrapper isAdvancedTradeMode={isSwapPageAdvancedTradeMode}>
              <Web3ReactManager>
                <SpaceBg isAdvancedTradeMode={isSwapPageAdvancedTradeMode}>
                  <Suspense fallback={<FallbackLoader />}>
                    <Routes />
                  </Suspense>
                </SpaceBg>
              </Web3ReactManager>
              <Marginer />
            </BodyWrapper>
          </AppWrapper>
          <ToastContainer
            draggable={false}
            className="custom-toast-root"
            toastClassName="custom-toast-container"
            bodyClassName="custom-toast-body"
            position="top-right"
            transition={Slide}
          />
        </ApolloProvider>
      </SkeletonTheme>
    </Suspense>
  )
}
