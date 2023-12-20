import { ApolloProvider } from '@apollo/client'
import AOS from 'aos'
import { Suspense, useEffect, useState } from 'react'
import { SkeletonTheme } from 'react-loading-skeleton'
import { useLocation } from 'react-router-dom'
import { Slide, ToastContainer } from 'react-toastify'
import { Text } from 'rebass'
import styled, { useTheme } from 'styled-components'

import { defaultSubgraphClient, subgraphClients } from '../apollo/client'
import Header from '../components/Header'
import { FallbackLoader } from '../components/Loader/FallbackLoader'
import NetworkWarningModal from '../components/NetworkWarningModal'
import { PageMetaData } from '../components/PageMetaData'
import { SpaceBg } from '../components/SpaceBg/SpaceBg'
import Web3ReactManager from '../components/Web3ReactManager'
import { useActiveWeb3React } from '../hooks'
import { useRangeLiquidityPopup } from '../state/application/hooks'
import { CloseIcon } from '../theme'
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

const WarningBanner = styled.div`
  display: flex;
  min-height: 30px;
  width: 100%;
  background-color: ${({ theme }) => theme.bg1And2};
  font-size: 12px;
  z-index: 2;
  align-items: center;
  padding: 0 14px;
`

const TextBanner = styled.p`
  margin: 0 auto;
`

const showStacklyPopup = process.env.REACT_APP_SHOW_STACKLY_POPUP === 'true'

export default function App() {
  const { chainId } = useActiveWeb3React()
  const location = useLocation()
  const theme = useTheme()
  const [isSwapPage, setIsSwapPage] = useState(false)
  const [isOpenBanner, setIsOpenBanner] = useState(true)
  const isAdvancedTradeMode = location.pathname.includes('/swap/pro')
  const rangeLiquidityPopup = useRangeLiquidityPopup()

  useEffect(() => {
    setIsSwapPage(!!location.pathname.includes('swap'))
  }, [location])

  const isSwapPageAdvancedTradeMode = isSwapPage && isAdvancedTradeMode

  useEffect(() => {
    document.body.classList.add('no-margin')
    setTimeout(function () {
      AOS.init({
        duration: 500,
      })
    }, 1000)
  }, [])

  useEffect(() => {
    rangeLiquidityPopup()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <PageMetaData />
      <Suspense fallback={null}>
        <SkeletonTheme baseColor={theme.bg3} highlightColor={theme.bg2}>
          <ApolloProvider client={subgraphClients[chainId as SWPRSupportedChains] || defaultSubgraphClient}>
            <NetworkWarningModal />
            <Web3ReactManager>
              <AppWrapper id="app-wrapper">
                {isOpenBanner && (
                  <WarningBanner>
                    <TextBanner>
                      Make sure you are on&nbsp;
                      <Text as="span" fontWeight="bold">
                        swapr.eth.limo
                      </Text>
                    </TextBanner>
                    <CloseIcon height={16} width={16} onClick={() => setIsOpenBanner(false)} />
                  </WarningBanner>
                )}
                <HeaderWrapper>
                  <Header />
                </HeaderWrapper>
                <BodyWrapper isAdvancedTradeMode={isSwapPageAdvancedTradeMode}>
                  <SpaceBg isAdvancedTradeMode={isSwapPageAdvancedTradeMode}>
                    <Suspense fallback={<FallbackLoader />}>
                      <Routes />
                    </Suspense>
                  </SpaceBg>
                  <Marginer />
                </BodyWrapper>
              </AppWrapper>
            </Web3ReactManager>
            <ToastContainer
              draggable={false}
              className="custom-toast-root"
              toastClassName="custom-toast-container"
              bodyClassName="custom-toast-body"
              position="top-right"
              limit={1}
              transition={Slide}
              closeOnClick
            ></ToastContainer>
          </ApolloProvider>
        </SkeletonTheme>
      </Suspense>
    </>
  )
}
