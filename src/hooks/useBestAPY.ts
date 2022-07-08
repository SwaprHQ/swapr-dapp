import { Pair, Percent } from '@swapr/sdk'

import { gql, useQuery } from '@apollo/client'
import { useWeb3React } from '@web3-react/core'
import { useMemo } from 'react'

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

const QUERY = gql`
  query ($lowerTimeLimit: BigInt!, $pairAddress: ID) {
    pair(id: $pairAddress) {
      address: id
      reserve0
      reserve1
      reserveNativeCurrency
      totalSupply
      token0 {
        address: id
        name
        symbol
        decimals
      }
      token1 {
        address: id
        name
        symbol
        decimals
      }
      liquidityMiningCampaigns(where: { endsAt_gt: $lowerTimeLimit }) {
        address: id
        duration
        startsAt
        endsAt
        locked
        stakingCap
        rewards {
          token {
            address: id
            name
            symbol
            decimals
            derivedNativeCurrency
          }
          amount
        }
        stakedAmount
      }
    }
  }
`

interface QueryResult {
  pair: SubgraphPair
}

export function useBestAPY(pair?: Pair | null): {
  loading: boolean
  bestAPY?: Percent
} {
  const { chainId } = useWeb3React()
  const tokensInCurrentChain = useAllTokensFromActiveListsOnCurrentChain()
  const nativeCurrency = useNativeCurrency()
  const memoizedLowerTimeLimit = useMemo(() => getLowerTimeLimit(), [])

  const { loading, data, error } = useQuery<QueryResult>(QUERY, {
    variables: {
      pairAddress: pair?.liquidityToken.address.toLowerCase(),
      lowerTimeLimit: memoizedLowerTimeLimit,
    },
  })

  const rewardTokenAddresses = useMemo(() => {
    return !data ? [] : getRewardTokenAddressFromPair(data.pair)
  }, [data])

  const { loading: loadingKpiTokens, kpiTokens } = useKpiTokens(rewardTokenAddresses)

  if (loadingKpiTokens || loading) return { loading: true }
  if (!chainId || error || !data) return { loading: false }

  const newPair = getPairWithLiquidityMiningCampaign({
    rawPair: data.pair,
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
