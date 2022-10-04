import { lazy } from 'react'
import { Route, Routes as Switch } from 'react-router-dom'

import { BaseRedirect } from '../components/Routing/BaseRedirect'
import { RouteCheck } from '../components/Routing/RouteCheck'
import { RedirectDuplicateTokenIds, RedirectOldAddLiquidityPathStructure } from './Pools/AddLiquidity/redirects'
import { RedirectOldRemoveLiquidityPathStructure } from './Pools/RemoveLiquidity/redirects'
// Dont want to lazy import swap
import Swap from './Swap'

// Lazy loaded routes
const Rewards = lazy(() => import(/* webpackPrefetch: true */ './Rewards'))
const Pools = lazy(() => import(/* webpackPrefetch: true */ './Pools'))
const LiquidityMiningCampaign = lazy(() => import(/* webpackPrefetch: true */ './Pools/LiquidityMiningCampaign'))
const Pair = lazy(() => import(/* webpackPrefetch: true */ './Pools/Pair'))
const MyPairs = lazy(() => import(/* webpackPrefetch: true */ './Pools/Mine'))
const Bridge = lazy(() => import(/* webpackPrefetch: true */ './Bridge'))
const AddLiquidity = lazy(() => import(/* webpackPrefetch: true */ './Pools/AddLiquidity'))
const RemoveLiquidity = lazy(() => import(/* webpackPrefetch: true */ './Pools/RemoveLiquidity'))
const CreateLiquidityMining = lazy(() => import(/* webpackPrefetch: true */ './LiquidityMining/Create'))
const Account = lazy(() => import(/* webpackPrefetch: true */ './Account'))

export function Routes() {
  return (
    <Switch>
      <Route path="swap" element={<Swap />} />
      <Route path="swap/:outputCurrency" element={<BaseRedirect />} />
      <Route path="bridge" element={<Bridge />} />

      <Route path="pools" element={<RouteCheck element={<Pools />} />} />
      <Route path="pools/:currencyIdA/:currencyIdB" element={<RouteCheck element={<Pair />} />} />
      <Route path="pools/mine" element={<RouteCheck element={<MyPairs />} />} />
      <Route path="pools/create" element={<RouteCheck element={<AddLiquidity />} />} />
      <Route path="pools/add" element={<RouteCheck element={<AddLiquidity />} />} />
      <Route
        path="pools/add/:currencyIdA"
        element={<RouteCheck element={<RedirectOldAddLiquidityPathStructure />} />}
      />
      <Route
        path="pools/add/:currencyIdA/:currencyIdB"
        element={<RouteCheck element={<RedirectDuplicateTokenIds />} />}
      />
      <Route
        path="pools/remove/:tokens"
        element={<RouteCheck element={<RedirectOldRemoveLiquidityPathStructure />} />}
      />
      <Route path="pools/remove/:currencyIdA/:currencyIdB" element={<RouteCheck element={<RemoveLiquidity />} />} />

      <Route path="rewards" element={<RouteCheck element={<Rewards />} />} />
      <Route path="rewards/:currencyIdA/:currencyIdB" element={<RouteCheck element={<Rewards />} />} />
      <Route
        path="rewards/single-sided-campaign/:currencyIdA/:liquidityMiningCampaignId"
        element={<RouteCheck element={<LiquidityMiningCampaign />} />}
      />
      <Route
        path="rewards/campaign/:currencyIdA/:currencyIdB/:liquidityMiningCampaignId"
        element={<RouteCheck element={<LiquidityMiningCampaign />} />}
      />

      <Route path="/liquidity-mining/create" element={<RouteCheck element={<CreateLiquidityMining />} />} />

      <Route path="send" element={<BaseRedirect />} />
      <Route path="account" element={<Account />} />

      <Route path="*" element={<BaseRedirect />} />
    </Switch>
  )
}
