import { ChainId } from '@swapr/sdk'

import React, { lazy } from 'react'
import { Route, Routes as Switch } from 'react-router-dom'

import { useActiveWeb3React } from '../hooks'
import { chainSupportsSWPR } from '../utils/chainSupportsSWPR'
import { RedirectDuplicateTokenIds, RedirectOldAddLiquidityPathStructure } from './AddLiquidity/redirects'
import { RedirectOldRemoveLiquidityPathStructure } from './RemoveLiquidity/redirects'
// Dont want to lazy import swap
import Swap from './Swap'
import { RedirectToSwap } from './Swap/redirects'

// Lazy loaded routes
const Rewards = lazy(() => import(/* webpackPrefetch: true */ './Rewards'))
const Pools = lazy(() => import(/* webpackPrefetch: true */ './Pools'))
const LiquidityMiningCampaign = lazy(() => import(/* webpackPrefetch: true */ './Pools/LiquidityMiningCampaign'))
const Pair = lazy(() => import(/* webpackPrefetch: true */ './Pools/Pair'))
const MyPairs = lazy(() => import(/* webpackPrefetch: true */ './Pools/Mine'))
const Bridge = lazy(() => import(/* webpackPrefetch: true */ './Bridge'))
const AddLiquidity = lazy(() => import(/* webpackPrefetch: true */ './AddLiquidity'))
const RemoveLiquidity = lazy(() => import(/* webpackPrefetch: true */ './RemoveLiquidity'))
const CreateLiquidityMining = lazy(() => import(/* webpackPrefetch: true */ './LiquidityMining/Create'))
const Account = lazy(() => import(/* webpackPrefetch: true */ './Account'))

/**
 * A Route that is only accessible if all features available: Swapr core contract are deployed on the chain
 */
const RouteWrapper = ({ element }: { element: JSX.Element }) => {
  const { chainId } = useActiveWeb3React()
  // If all features are available, render the route
  if (chainSupportsSWPR(chainId) || ChainId.ARBITRUM_GOERLI) {
    // FIXME: fix this if's condition once SWPR is on Arb Goerli
    return element
  }
  return <RedirectToSwap />
}

export function Routes() {
  return (
    <Switch>
      <Route path="swap" element={<Swap />} />
      <Route path="swap/:outputCurrency" element={<RedirectToSwap />} />
      <Route path="bridge" element={<Bridge />} />

      <Route path="pools" element={<RouteWrapper element={<Pools />} />} />
      <Route path="pools/:currencyIdA/:currencyIdB" element={<RouteWrapper element={<Pair />} />} />
      <Route path="pools/mine" element={<RouteWrapper element={<MyPairs />} />} />
      <Route path="pools/create" element={<RouteWrapper element={<AddLiquidity />} />} />
      <Route path="pools/add" element={<RouteWrapper element={<AddLiquidity />} />} />
      <Route
        path="pools/add/:currencyIdA"
        element={<RouteWrapper element={<RedirectOldAddLiquidityPathStructure />} />}
      />
      <Route
        path="pools/add/:currencyIdA/:currencyIdB"
        element={<RouteWrapper element={<RedirectDuplicateTokenIds />} />}
      />
      <Route
        path="pools/remove/:tokens"
        element={<RouteWrapper element={<RedirectOldRemoveLiquidityPathStructure />} />}
      />
      <Route path="pools/remove/:currencyIdA/:currencyIdB" element={<RouteWrapper element={<RemoveLiquidity />} />} />

      <Route path="rewards" element={<RouteWrapper element={<Rewards />} />} />
      <Route path="rewards/:currencyIdA/:currencyIdB" element={<RouteWrapper element={<Rewards />} />} />
      <Route
        path="rewards/single-sided-campaign/:currencyIdA/:liquidityMiningCampaignId"
        element={<RouteWrapper element={<LiquidityMiningCampaign />} />}
      />
      <Route
        path="rewards/campaign/:currencyIdA/:currencyIdB/:liquidityMiningCampaignId"
        element={<RouteWrapper element={<LiquidityMiningCampaign />} />}
      />

      <Route path="/liquidity-mining/create" element={<RouteWrapper element={<CreateLiquidityMining />} />} />

      <Route path="send" element={<RedirectToSwap />} />
      <Route path="account" element={<Account />} />

      <Route path="*" element={<RedirectToSwap />} />
    </Switch>
  )
}
