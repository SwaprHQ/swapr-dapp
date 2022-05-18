import { Pair, Percent } from '@swapr/sdk'
import { useMemo } from 'react'
import { useQuery, gql } from '@apollo/client'
import {
  getBestApyPairCampaign,
  getRewardTokenAddressFromPair,
  getLowerTimeLimit,
  SubgraphPair,
} from '../utils/liquidityMining'
import { useActiveWeb3React } from '.'
import { useAllTokensFromActiveListsOnCurrentChain } from '../state/lists/hooks'
import { useNativeCurrency } from './useNativeCurrency'
import { useKpiTokens } from './useKpiTokens'
import { getPairWithLiquidityMiningCampaign } from '../utils/liquidityMining'

const QUERY = gql`
  query($lowerTimeLimit: BigInt!, $pairAddress: ID) {
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

export function useBestAPY(
  pair?: Pair | null
): {
  loading: boolean
  bestAPY?: Percent
} {
  const { chainId } = useActiveWeb3React()
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
