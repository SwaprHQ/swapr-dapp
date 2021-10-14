import { gql } from 'graphql-request'
import Decimal from 'decimal.js-light'
import { CurrencyAmount, Pair, Token, TokenAmount, USD } from '@swapr/sdk'
import { getAddress, parseUnits } from 'ethers/lib/utils'
import { DateTime, Duration } from 'luxon'
import { useEffect, useMemo, useState } from 'react'
import { useActiveWeb3React } from '.'
import { SubgraphLiquidityMiningCampaign } from '../apollo'
import { useAllTokensFromActiveListsOnCurrentChain } from '../state/lists/hooks'
import { toLiquidityMiningCampaigns } from '../utils/liquidityMining'
import { useNativeCurrency } from './useNativeCurrency'
import { immediateSubgraphClients } from '../apollo/client'

const PAGE_SIZE = 1000

const QUERY = gql`
  query($lowerTimeLimit: BigInt!, $userId: ID, $pageSize: Int!, $lastId: ID) {
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
        rewardTokens {
          address: id
          name
          symbol
          decimals
          derivedNativeCurrency
        }
        stakedAmount
        rewardAmounts
        liquidityMiningPositions(where: { stakedAmount_gt: 0, user: $userId }) {
          id
        }
      }
    }
  }
`

interface SubgraphToken {
  address: string
  symbol: string
  name: string
  decimals: string
}

interface SubgraphLiquidityMiningCampaignWithPositions extends SubgraphLiquidityMiningCampaign {
  liquidityMiningPositions: { id: string }[]
}

interface SubgraphPair {
  address: string
  reserve0: string
  reserve1: string
  reserveNativeCurrency: string
  reserveUSD: string
  totalSupply: string
  token0: SubgraphToken
  token1: SubgraphToken
  liquidityMiningCampaigns: SubgraphLiquidityMiningCampaignWithPositions[]
}

interface QueryResult {
  pairs: SubgraphPair[]
}

export function useAllPairsWithNonExpiredLiquidityMiningCampaignsAndLiquidityAndStakingIndicator(
  tokenFilter?: Token
): {
  loading: boolean
  wrappedPairs: {
    pair: Pair
    reserveUSD: CurrencyAmount
    staked: boolean
  }[]
} {
  const { chainId, account } = useActiveWeb3React()
  const tokensInCurrentChain = useAllTokensFromActiveListsOnCurrentChain()
  const nativeCurrency = useNativeCurrency()
  const memoizedLowerTimeLimit = useMemo(
    () =>
      Math.floor(
        DateTime.utc()
          .minus(Duration.fromObject({ days: 30 }))
          .toSeconds()
      ),
    []
  )
  const subgraphAccountId = useMemo(() => account?.toLowerCase() || '', [account])
  const filterTokenAddress = useMemo(() => tokenFilter?.address.toLowerCase(), [tokenFilter])

  const [loadingPairs, setLoadingPairs] = useState(false)
  const [pairs, setPairs] = useState<SubgraphPair[]>([])

  useEffect(() => {
    let cancelled = false
    const fetchData = async () => {
      if (!chainId) return
      const pairs = []
      let lastId = ''
      setLoadingPairs(true)
      setPairs([])
      try {
        while (1) {
          const result = await immediateSubgraphClients[chainId].request<QueryResult>(QUERY, {
            lowerTimeLimit: memoizedLowerTimeLimit,
            userId: subgraphAccountId,
            lastId,
            pageSize: PAGE_SIZE
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
    if (pairs.length === 0) return { loading: loadingPairs, wrappedPairs: [] }
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
        const {
          reserveNativeCurrency,
          reserveUSD,
          totalSupply,
          token0,
          token1,
          reserve0,
          reserve1,
          liquidityMiningCampaigns
        } = rawPair

        const token0ChecksummedAddress = getAddress(token0.address)
        const tokenA =
          tokensInCurrentChain &&
          tokensInCurrentChain[token0ChecksummedAddress] &&
          tokensInCurrentChain[token0ChecksummedAddress].token
            ? tokensInCurrentChain[token0ChecksummedAddress].token
            : new Token(chainId, token0ChecksummedAddress, parseInt(token0.decimals), token0.symbol, token0.name)
        const tokenAmountA = new TokenAmount(tokenA, parseUnits(reserve0, token0.decimals).toString())

        const token1ChecksummedAddress = getAddress(token1.address)
        const tokenB =
          tokensInCurrentChain &&
          tokensInCurrentChain[token1ChecksummedAddress] &&
          tokensInCurrentChain[token1ChecksummedAddress].token
            ? tokensInCurrentChain[token1ChecksummedAddress].token
            : new Token(chainId, token1ChecksummedAddress, parseInt(token1.decimals), token1.symbol, token1.name)
        const tokenAmountB = new TokenAmount(tokenB, parseUnits(reserve1, token1.decimals).toString())
        const pair = new Pair(tokenAmountA, tokenAmountB)

        const campaigns = toLiquidityMiningCampaigns(
          chainId,
          pair,
          totalSupply,
          reserveNativeCurrency,
          liquidityMiningCampaigns,
          nativeCurrency
        )
        pair.liquidityMiningCampaigns = campaigns
        return {
          pair,
          // campaign.liquidityMiningPositions only has length > 0 if the user has staked positions in the campaign itself
          staked: rawPair.liquidityMiningCampaigns.some(campaign => campaign.liquidityMiningPositions.length > 0),
          reserveUSD: CurrencyAmount.usd(
            parseUnits(new Decimal(reserveUSD).toFixed(USD.decimals), USD.decimals).toString()
          )
        }
      }, [])
    }
  }, [chainId, filterTokenAddress, loadingPairs, nativeCurrency, pairs, tokensInCurrentChain])
}
