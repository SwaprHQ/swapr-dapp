import { Pair, Percent } from '@swapr/sdk'

import { useMemo } from 'react'

import { useGetPairLiquidityMiningCampaingsQuery } from '../graphql/generated/schema'
import { useAllTokensFromActiveListsOnCurrentChain } from '../state/lists/hooks'
import {
  getBestApyPairCampaign,
  getLowerTimeLimit,
  getPairWithLiquidityMiningCampaign,
  getRewardTokenAddressFromPair,
  SubgraphPair,
} from '../utils/liquidityMining'
import { useKpiTokens } from './useKpiTokens'
import { useNativeCurrency } from './useNativeCurrency'

import { useActiveWeb3React } from '.'

export function useBestAPY(pair?: Pair | null): {
  loading: boolean
  bestAPY?: Percent
} {
  const { chainId } = useActiveWeb3React()
  const tokensInCurrentChain = useAllTokensFromActiveListsOnCurrentChain()
  const nativeCurrency = useNativeCurrency()
  const memoizedLowerTimeLimit = useMemo(() => getLowerTimeLimit(), [])

  const { loading, data, error } = useGetPairLiquidityMiningCampaingsQuery({
    variables: {
      pairId: pair?.liquidityToken.address.toLowerCase() || '',
      endsAtLowerLimit: memoizedLowerTimeLimit,
    },
  })

  const rewardTokenAddresses = useMemo(() => {
    return !data || !data.pair ? [] : getRewardTokenAddressFromPair(data.pair as SubgraphPair)
  }, [data])

  const { loading: loadingKpiTokens, kpiTokens } = useKpiTokens(rewardTokenAddresses)

  if (loadingKpiTokens || loading) return { loading: true }
  if (!chainId || error || !data || !data.pair) return { loading: false }

  const newPair = getPairWithLiquidityMiningCampaign({
    rawPair: data.pair as SubgraphPair,
    chainId,
    kpiTokens,
    nativeCurrency,
    tokensInCurrentChain,
  })

  return {
    loading: false,
    bestAPY: newPair ? getBestApyPairCampaign(newPair)?.apy : undefined,
  }
}
