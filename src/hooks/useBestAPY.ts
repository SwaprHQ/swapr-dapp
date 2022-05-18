import { Pair, Percent } from '@swapr/sdk'
import { useMemo } from 'react'
import { DateTime, Duration } from 'luxon'
import { useQuery, gql } from '@apollo/client'
import { getBestApyPairCampaign } from '../utils/liquidityMining'
import { useActiveWeb3React } from '.'
import { SubgraphLiquidityMiningCampaign } from '../apollo'
import { useAllTokensFromActiveListsOnCurrentChain } from '../state/lists/hooks'
import { useNativeCurrency } from './useNativeCurrency'
import { useKpiTokens } from './useKpiTokens'
import { SubgraphToken } from '../utils'
import { getTokenAmount, getPairWithLiquidityMiningCampaign } from '../utils/index'

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

interface SubgraphPair {
  address: string
  reserve0: string
  reserve1: string
  reserveNativeCurrency: string
  reserveUSD: string
  totalSupply: string
  token0: SubgraphToken
  token1: SubgraphToken
  liquidityMiningCampaigns: SubgraphLiquidityMiningCampaign[]
}

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

  const memoizedLowerTimeLimit = useMemo(
    () =>
      Math.floor(
        DateTime.utc()
          .minus(Duration.fromObject({ days: 150 }))
          .toSeconds()
      ),
    []
  )

  const { loading, data, error } = useQuery<QueryResult>(QUERY, {
    variables: {
      pairAddress: pair?.liquidityToken.address.toLowerCase(),
      lowerTimeLimit: memoizedLowerTimeLimit,
    },
  })

  const rewardTokenAddresses = useMemo(() => {
    return !data
      ? []
      : data.pair.liquidityMiningCampaigns.flatMap(campaign =>
          campaign.rewards.map(reward => reward.token.address.toLowerCase())
        )
  }, [data])

  const { loading: loadingKpiTokens, kpiTokens } = useKpiTokens(rewardTokenAddresses)

  if (loadingKpiTokens || loading) return { loading: true }
  if (!chainId || error || !data) return { loading: false }

  const { reserveNativeCurrency, totalSupply, token0, token1, reserve0, reserve1, liquidityMiningCampaigns } = data.pair

  const tokenAmountA = getTokenAmount({ token: token0, tokensInCurrentChain, chainId, reserve: reserve0 })
  const tokenAmountB = getTokenAmount({ token: token1, tokensInCurrentChain, chainId, reserve: reserve1 })

  const newPair = getPairWithLiquidityMiningCampaign({
    pair: new Pair(tokenAmountA, tokenAmountB),
    chainId,
    totalSupply,
    reserveNativeCurrency,
    kpiTokens,
    nativeCurrency,
    liquidityMiningCampaigns,
  })

  return {
    loading: false,
    bestAPY: newPair ? getBestApyPairCampaign(newPair)?.apy : undefined,
  }
}
