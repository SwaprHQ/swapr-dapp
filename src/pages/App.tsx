import { ApolloProvider } from '@apollo/client'
import AOS from 'aos'
import 'aos/dist/aos.css'
import React, { ReactElement, Suspense, useEffect } from 'react'
import { SkeletonTheme } from 'react-loading-skeleton'
import { Route, Routes } from 'react-router-dom'
import { Slide, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import styled, { useTheme } from 'styled-components'

import { defaultSubgraphClient, subgraphClients } from '../apollo/client'
import Header from '../components/Header'
import NetworkWarningModal from '../components/NetworkWarningModal'
import Web3ReactManager from '../components/Web3ReactManager'
import { useActiveWeb3React } from '../hooks'
import { chainSupportsSWPR, SWPRSupportedChains } from '../utils/chainSupportsSWPR'
import AddLiquidity from './AddLiquidity'
import { RedirectDuplicateTokenIds, RedirectOldAddLiquidityPathStructure } from './AddLiquidity/redirects'
import Bridge from './Bridge'
import CreateLiquidityMining from './LiquidityMining/Create'
import Pools from './Pools'
import LiquidityMiningCampaign from './Pools/LiquidityMiningCampaign'
import MyPairs from './Pools/Mine'
import Pair from './Pools/Pair'
import RemoveLiquidity from './RemoveLiquidity'
import { RedirectOldRemoveLiquidityPathStructure } from './RemoveLiquidity/redirects'
import Rewards from './Rewards'
import Swap from './Swap'
import { RedirectToSwap } from './Swap/redirects'

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

const BodyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 172px);
  width: 100%;
  padding-top: 60px;
  align-items: center;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  overflow: visible;
  z-index: 10;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    /* [PR#531]: theme.mediaWidth.upToSmall does not cover all the breakpoints smoothly
    padding: 16px;
    */
    padding-top: 2rem;
  `};

  /* [PR#531] */
  padding-left: 16px;
  padding-right: 16px;

  z-index: 1;
`

const Marginer = styled.div`
  margin-top: 5rem;
`

/**
 * A Route that is only accessible if all features available: Swapr core contract are deployed on the chain
 */
const RouteWrapper = ({ children, isBeta = false }: { children: ReactElement; isBeta?: boolean }) => {
  const { chainId } = useActiveWeb3React()
  if (isBeta) {
    const isAllFeaturesEnabled = chainSupportsSWPR(chainId)
    if (isAllFeaturesEnabled) {
      return children
    }
    return <RedirectToSwap />
  }
  return children
}

export default function App() {
  const { chainId } = useActiveWeb3React()
  const theme = useTheme()

  useEffect(() => {
    document.body.classList.add('no-margin')
    setTimeout(function() {
      AOS.init({
        duration: 500,
      })
    }, 1000)
  }, [])

  return (
    <Suspense fallback={null}>
      <SkeletonTheme color={theme.bg3} highlightColor={theme.bg2}>
        <ApolloProvider client={subgraphClients[chainId as SWPRSupportedChains] || defaultSubgraphClient}>
          <NetworkWarningModal />
          <AppWrapper id="app-wrapper">
            <HeaderWrapper>
              <Header />
            </HeaderWrapper>
            <BodyWrapper>
              <Web3ReactManager>
                <Routes>
                  <Route path="swap" element={<Swap />} />
                  <Route path="swap/:outputCurrency" element={<RedirectToSwap />} />
                  <Route path="bridge" element={<Bridge />} />

                  <Route
                    path="pools"
                    element={
                      <RouteWrapper isBeta>
                        <Pools />
                      </RouteWrapper>
                    }
                  />
                  <Route
                    path="pools/:currencyIdA/:currencyIdB"
                    element={
                      <RouteWrapper isBeta>
                        <Pair />
                      </RouteWrapper>
                    }
                  />
                  <Route
                    path="pools/mine"
                    element={
                      <RouteWrapper isBeta>
                        <MyPairs />
                      </RouteWrapper>
                    }
                  />
                  <Route
                    path="pools/create"
                    element={
                      <RouteWrapper isBeta>
                        <AddLiquidity />
                      </RouteWrapper>
                    }
                  />
                  <Route
                    path="pools/add"
                    element={
                      <RouteWrapper>
                        <AddLiquidity />
                      </RouteWrapper>
                    }
                  />
                  <Route
                    path="pools/add/:currencyIdA"
                    element={
                      <RouteWrapper isBeta>
                        <RedirectOldAddLiquidityPathStructure />
                      </RouteWrapper>
                    }
                  />
                  <Route
                    path="pools/add/:currencyIdA/:currencyIdB"
                    element={
                      <RouteWrapper isBeta>
                        <RedirectDuplicateTokenIds />
                      </RouteWrapper>
                    }
                  />
                  <Route
                    path="pools/remove/:tokens"
                    element={
                      <RouteWrapper>
                        <RedirectOldRemoveLiquidityPathStructure />
                      </RouteWrapper>
                    }
                  />
                  <Route
                    path="pools/remove/:currencyIdA/:currencyIdB"
                    element={
                      <RouteWrapper isBeta>
                        <RemoveLiquidity />
                      </RouteWrapper>
                    }
                  />

                  <Route
                    path="rewards"
                    element={
                      <RouteWrapper isBeta>
                        <Rewards />
                      </RouteWrapper>
                    }
                  />
                  <Route
                    path="rewards/:currencyIdA/:currencyIdB"
                    element={
                      <RouteWrapper>
                        <Rewards />
                      </RouteWrapper>
                    }
                  />
                  <Route
                    path="rewards/single-sided-campaign/:currencyIdA/:liquidityMiningCampaignId"
                    element={
                      <RouteWrapper isBeta>
                        <LiquidityMiningCampaign />
                      </RouteWrapper>
                    }
                  />
                  <Route
                    path="rewards/campaign/:currencyIdA/:currencyIdB/:liquidityMiningCampaignId"
                    element={
                      <RouteWrapper isBeta>
                        <LiquidityMiningCampaign />
                      </RouteWrapper>
                    }
                  />

                  {/* <Route   path="/governance" element={<RouteWrapper></RouteWrapper><GovPages/>} /> */}
                  {/* <Route   path="/governance/:asset/pairs" element={<RouteWrapper></RouteWrapper><GovPages/>} /> */}

                  <Route
                    path="/liquidity-mining/create"
                    element={
                      <RouteWrapper isBeta>
                        <CreateLiquidityMining />
                      </RouteWrapper>
                    }
                  />

                  <Route path="send" element={<RedirectToSwap />} />
                  <Route path="*" element={<RedirectToSwap />} />
                </Routes>
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
