import { CurrencyAmount, Pair, Token, USD } from '@swapr/sdk'

import Decimal from 'decimal.js-light'
import { parseUnits } from 'ethers/lib/utils'
import { gql } from 'graphql-request'
import { useEffect, useMemo, useState } from 'react'

import { immediateSubgraphClients } from '../apollo/client'
import { useAllTokensFromActiveListsOnCurrentChain } from '../state/lists/hooks'
import { chainSupportsSWPR, SWPRSupportedChains } from '../utils/chainSupportsSWPR'
import {
  getLowerTimeLimit,
  getPairWithLiquidityMiningCampaign,
  getRewardTokenAddressFromPair,
  SubgraphPair,
} from '../utils/liquidityMining'
import { useKpiTokens } from './useKpiTokens'
import { useNativeCurrency } from './useNativeCurrency'

import { useActiveWeb3React } from './index'

const PAGE_SIZE = 1000

const QUERY = gql`
  query ($lowerTimeLimit: BigInt!, $userId: ID, $pageSize: Int!, $lastId: ID) {
    pairs(first: $pageSize, where: { id_gt: $lastId }) {
      address: id
      reserve0
      reserve1
      reserveUSD
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
        liquidityMiningPositions(where: { stakedAmount_gt: 0, user: $userId }) {
          id
        }
      }
    }
  }
`

interface QueryResult {
  pairs: SubgraphPair[]
}

export function useAllPairsWithNonExpiredLiquidityMiningCampaignsAndLiquidityAndStakingIndicator(tokenFilter?: Token): {
  loading: boolean
  wrappedPairs: {
    pair: Pair
    reserveUSD: CurrencyAmount
    hasFarming: boolean
    staked: boolean
  }[]
} {
  const { chainId, account } = useActiveWeb3React()
  const tokensInCurrentChain = useAllTokensFromActiveListsOnCurrentChain()
  const nativeCurrency = useNativeCurrency()

  const subgraphAccountId = account?.toLowerCase() || ''
  const filterTokenAddress = tokenFilter?.address.toLowerCase()
  const memoizedLowerTimeLimit = useMemo(() => getLowerTimeLimit(), [])

  const [loadingPairs, setLoadingPairs] = useState(false)
  const [pairs, setPairs] = useState<SubgraphPair[]>([])
  const rewardTokenAddresses = useMemo(() => pairs.flatMap(pair => getRewardTokenAddressFromPair(pair)), [pairs])
  const { loading: loadingKpiTokens, kpiTokens } = useKpiTokens(rewardTokenAddresses)

  useEffect(() => {
    let cancelled = false
    const fetchData = async () => {
      if (!chainId || !chainSupportsSWPR(chainId)) return
      const pairs = []
      let lastId = ''
      setLoadingPairs(true)
      setPairs([])
      try {
        while (1) {
          const result = await immediateSubgraphClients[chainId as SWPRSupportedChains].request<QueryResult>(QUERY, {
            lowerTimeLimit: memoizedLowerTimeLimit,
            userId: subgraphAccountId,
            lastId,
            pageSize: PAGE_SIZE,
          })
          pairs.push(...result.pairs)
          lastId = result.pairs[result.pairs.length - 1].address
          if (result.pairs.length < PAGE_SIZE) break
        }
        if (!cancelled) setPairs(pairs)
      } finally {
        setLoadingPairs(false)
      }
    }
    fetchData()
    return () => {
      cancelled = true
    }
  }, [chainId, memoizedLowerTimeLimit, subgraphAccountId])

  return useMemo(() => {
    if (!chainId) return { loading: false, wrappedPairs: [] }
    if (loadingPairs || loadingKpiTokens || pairs.length === 0) return { loading: true, wrappedPairs: [] }
    const rawPairs = filterTokenAddress
      ? pairs.filter(
          pair =>
            pair.token0.address.toLowerCase() === filterTokenAddress ||
            pair.token1.address.toLowerCase() === filterTokenAddress
        )
      : pairs
    return {
      loading: false,
      wrappedPairs: rawPairs.map(rawPair => {
        const { reserveUSD } = rawPair
        const pair = getPairWithLiquidityMiningCampaign({
          rawPair,
          chainId,
          kpiTokens,
          nativeCurrency,
          tokensInCurrentChain,
        })

        return {
          pair,
          // campaign.liquidityMiningPositions only has length > 0 if the user has staked positions in the campaign itself
          staked: rawPair.liquidityMiningCampaigns.some(campaign => campaign.liquidityMiningPositions.length > 0),
          hasFarming: pair.liquidityMiningCampaigns.some(campaign => campaign.currentlyActive),
          reserveUSD: CurrencyAmount.usd(
            parseUnits(new Decimal(reserveUSD).toFixed(USD.decimals), USD.decimals).toString()
          ),
        }
      }, []),
    }
  }, [
    chainId,
    filterTokenAddress,
    kpiTokens,
    loadingKpiTokens,
    loadingPairs,
    nativeCurrency,
    pairs,
    tokensInCurrentChain,
  ])
}
