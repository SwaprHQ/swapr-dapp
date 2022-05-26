import { ApolloProvider } from '@apollo/client'
import React, { FC, Suspense, useContext, useEffect } from 'react'
import { Redirect, Route, RouteProps, Switch } from 'react-router-dom'
import styled, { ThemeContext } from 'styled-components'
import { defaultSubgraphClient, subgraphClients } from '../apollo/client'
import Header from '../components/Header'
import Web3ReactManager from '../components/Web3ReactManager'
import DarkModeQueryParamReader from '../theme/DarkModeQueryParamReader'
import AddLiquidity from './AddLiquidity'
import { RedirectDuplicateTokenIds, RedirectOldAddLiquidityPathStructure } from './AddLiquidity/redirects'
import Pools from './Pools'
import RemoveLiquidity from './RemoveLiquidity'
import { RedirectOldRemoveLiquidityPathStructure } from './RemoveLiquidity/redirects'
import Swap from './Swap'
import { RedirectPathToSwapOnly, RedirectToSwap } from './Swap/redirects'
import Pair from './Pools/Pair'
import CreateLiquidityMining from './LiquidityMining/Create'
import { useActiveWeb3React } from '../hooks'
import { SkeletonTheme } from 'react-loading-skeleton'
import MyPairs from './Pools/Mine'
import LiquidityMiningCampaign from './Pools/LiquidityMiningCampaign'
import NetworkWarningModal from '../components/NetworkWarningModal'
import { Slide, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import AOS from 'aos'
import 'aos/dist/aos.css'
import Bridge from './Bridge'

import Rewards from './Rewards'
import { chainSupportsSWPR, SWPRSupportedChains } from '../utils/chainSupportsSWPR'

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
const FullFeaturesRoute: FC<RouteProps> = routeProps => {
  const { chainId } = useActiveWeb3React()
  const isAllFeaturesEnabled = chainSupportsSWPR(chainId)
  if (isAllFeaturesEnabled) {
    return <Route {...routeProps} />
  }
  return <Redirect to={{ ...location, pathname: '/swap' }} />
}

export default function App() {
  const { chainId } = useActiveWeb3React()
  const theme = useContext(ThemeContext)

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
          <Route component={DarkModeQueryParamReader} />
          <AppWrapper id="app-wrapper">
            <HeaderWrapper>
              <Header />
            </HeaderWrapper>
            <BodyWrapper>
              <Web3ReactManager>
                <Switch>
                  <Route exact strict path="/swap" component={Swap} />
                  <Route exact strict path="/swap/:outputCurrency" component={RedirectToSwap} />
                  <Route exact strict path="/bridge" component={Bridge} />

                  <FullFeaturesRoute exact strict path="/send" component={RedirectPathToSwapOnly} />
                  <FullFeaturesRoute exact strict path="/pools" component={Pools} />
                  <FullFeaturesRoute exact strict path="/pools/mine" component={MyPairs} />
                  <FullFeaturesRoute exact strict path="/rewards" component={Rewards} />
                  <FullFeaturesRoute exact strict path="/rewards/:currencyIdA/:currencyIdB" component={Rewards} />
                  <FullFeaturesRoute exact strict path="/pools/:currencyIdA/:currencyIdB" component={Pair} />
                  <FullFeaturesRoute
                    exact
                    strict
                    path="/rewards/single-sided-campaign/:currencyIdA/:liquidityMiningCampaignId"
                    component={LiquidityMiningCampaign}
                  />
                  <FullFeaturesRoute
                    exact
                    strict
                    path="/rewards/campaign/:currencyIdA/:currencyIdB/:liquidityMiningCampaignId"
                    component={LiquidityMiningCampaign}
                  />
                  <FullFeaturesRoute exact strict path="/pools/create" component={AddLiquidity} />
                  <FullFeaturesRoute exact path="/pools/add" component={AddLiquidity} />
                  {/* <Route exact strict path="/governance" component={GovPages} /> */}
                  {/* <Route exact strict path="/governance/:asset/pairs" component={GovPages} /> */}
                  <FullFeaturesRoute
                    exact
                    path="/pools/add/:currencyIdA"
                    component={RedirectOldAddLiquidityPathStructure}
                  />
                  <FullFeaturesRoute
                    exact
                    path="/pools/add/:currencyIdA/:currencyIdB"
                    component={RedirectDuplicateTokenIds}
                  />
                  <FullFeaturesRoute
                    exact
                    strict
                    path="/pools/remove/:tokens"
                    component={RedirectOldRemoveLiquidityPathStructure}
                  />
                  <FullFeaturesRoute
                    exact
                    strict
                    path="/pools/remove/:currencyIdA/:currencyIdB"
                    component={RemoveLiquidity}
                  />
                  <FullFeaturesRoute exact strict path="/liquidity-mining/create" component={CreateLiquidityMining} />

                  <Route component={RedirectPathToSwapOnly} />
                </Switch>
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
