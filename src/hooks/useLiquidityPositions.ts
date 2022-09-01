import { parseUnits } from '@ethersproject/units'
import { CurrencyAmount, KpiToken, Pair, Percent, Token, TokenAmount, USD } from '@swapr/sdk'

import Decimal from 'decimal.js-light'
import { ethers } from 'ethers'
import { DateTime, Duration } from 'luxon'
import { useMemo } from 'react'

import { SubgraphLiquidityMiningCampaign } from '../apollo'
import { useGetUserLiquidityPositionsQuery } from '../graphql/generated/schema'
import { getBestApyPairCampaign, toLiquidityMiningCampaign } from '../utils/liquidityMining'
import { useKpiTokens } from './useKpiTokens'
import { useNativeCurrency } from './useNativeCurrency'

import { useActiveWeb3React } from './index'
interface SubgraphToken {
  address: string
  symbol: string
  name: string
  decimals: string
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
  liquidityMiningCampaigns: SubgraphLiquidityMiningCampaign[]
}

export function useLPPairs(account?: string): {
  loading: boolean
  data: {
    pair: Pair
    liquidityUSD: CurrencyAmount
    maximumApy: Percent
    staked: boolean
    hasFarming: boolean
    containsKpiToken: boolean
  }[]
} {
  const { chainId } = useActiveWeb3React()
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
  const {
    loading: loadingMyPairs,
    data,
    error,
  } = useGetUserLiquidityPositionsQuery({
    variables: {
      userId: account?.toLowerCase() || '',
      endsAtLowerLimit: memoizedLowerTimeLimit,
    },
  })
  const rewardTokenAddresses = useMemo(() => {
    if (loadingMyPairs || !data) return []
    return data.liquidityMiningPositions.flatMap(position =>
      position.pair.liquidityMiningCampaigns.flatMap(campaign =>
        campaign.rewards.map(reward => reward.token.address.toLowerCase())
      )
    )
  }, [data, loadingMyPairs])
  const { loading: loadingKpiTokens, kpiTokens } = useKpiTokens(rewardTokenAddresses)

  return useMemo(() => {
    if (loadingMyPairs || loadingKpiTokens) return { loading: true, data: [] }
    if (
      !data ||
      !data.liquidityPositions ||
      !data.liquidityMiningPositions ||
      (data.liquidityPositions.length === 0 && data.liquidityMiningPositions.length === 0) ||
      error ||
      !chainId ||
      !kpiTokens
    )
      return { loading: false, data: [] }
    // normalize double pairs (case in which a user has staked only part of their lp tokens)
    const liquidityMiningPositions = data.liquidityMiningPositions as { pair: SubgraphPair }[]
    const allPairsWithoutDuplicates = liquidityMiningPositions
      .concat(data.liquidityPositions as { pair: SubgraphPair }[])
      .reduce(
        (
          accumulator: { pair: SubgraphPair }[],
          rawWrappedPair: { pair: SubgraphPair }
        ): {
          pair: SubgraphPair
        }[] => {
          if (!accumulator.find(p => p.pair.address === rawWrappedPair.pair.address)) {
            accumulator.push(rawWrappedPair)
          }
          return accumulator
        },
        []
      )
    return {
      loading: false,
      data: allPairsWithoutDuplicates.map(position => {
        const {
          token0,
          token1,
          reserve0,
          reserve1,
          totalSupply,
          reserveNativeCurrency,
          reserveUSD,
          liquidityMiningCampaigns,
        } = position.pair
        const tokenAmountA = new TokenAmount(
          new Token(
            chainId,
            ethers.utils.getAddress(token0.address),
            parseInt(token0.decimals),
            token0.symbol,
            token0.name
          ),
          ethers.utils.parseUnits(reserve0, token0.decimals).toString()
        )
        const tokenAmountB = new TokenAmount(
          new Token(
            chainId,
            ethers.utils.getAddress(token1.address),
            parseInt(token1.decimals),
            token1.symbol,
            token1.name
          ),
          ethers.utils.parseUnits(reserve1, token1.decimals).toString()
        )
        const pair = new Pair(tokenAmountA, tokenAmountB)
        pair.liquidityMiningCampaigns = liquidityMiningCampaigns.map(campaign => {
          return toLiquidityMiningCampaign(
            chainId,
            pair,
            totalSupply,
            reserveNativeCurrency,
            kpiTokens,
            campaign,
            nativeCurrency
          )
        })
        const bestCampaign = getBestApyPairCampaign(pair)
        return {
          pair,
          liquidityUSD: CurrencyAmount.usd(
            parseUnits(new Decimal(reserveUSD).toFixed(USD.decimals), USD.decimals).toString()
          ),
          hasFarming: pair.liquidityMiningCampaigns.some(campaign => campaign.currentlyActive),
          staked: position.pair.liquidityMiningCampaigns.some(campaign => campaign.liquidityMiningPositions.length > 0),
          maximumApy: bestCampaign ? bestCampaign.apy : new Percent('0', '100'),
          containsKpiToken: !!bestCampaign?.rewards.some(reward => reward.token instanceof KpiToken),
        }
      }),
    }
  }, [chainId, data, error, kpiTokens, loadingKpiTokens, loadingMyPairs, nativeCurrency])
}
