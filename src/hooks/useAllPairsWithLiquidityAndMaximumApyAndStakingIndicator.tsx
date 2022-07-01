import { BigintIsh, CurrencyAmount, JSBI, KpiToken, Pair, Percent, Token, ZERO } from '@swapr/sdk'

import { useMemo } from 'react'

import { PairsFilterType } from '../components/Pool/ListFilter'
import { LIQUIDITY_SORTING_TYPES } from '../constants'
import { getBestApyPairCampaign } from '../utils/liquidityMining'
import { useAllPairsWithNonExpiredLiquidityMiningCampaignsAndLiquidityAndStakingIndicator } from './useAllPairsWithNonExpiredLiquidityMiningCampaignsAndLiquidityAndStakingIndicator'

export interface AggregatedPairs {
  pair: Pair
  liquidityUSD: CurrencyAmount
  maximumApy: Percent
  staked?: boolean
  containsKpiToken?: boolean
  hasFarming?: boolean
  startsAt?: BigintIsh
}

const liquidityPairSorter: {
  [sortBy: string]: (pairA: AggregatedPairs, pairB: AggregatedPairs) => number
} = {
  [LIQUIDITY_SORTING_TYPES.TVL]: (
    pairA: { liquidityUSD: CurrencyAmount },
    pairB: { liquidityUSD: CurrencyAmount }
  ): number => {
    if (pairA.liquidityUSD.equalTo(pairB.liquidityUSD)) return 0
    return pairA.liquidityUSD.lessThan(pairB.liquidityUSD) ? 1 : -1
  },
  [LIQUIDITY_SORTING_TYPES.APY]: (pairA: { maximumApy: Percent }, pairB: { maximumApy: Percent }): number => {
    if (pairA.maximumApy.equalTo(pairB.maximumApy)) return 0
    return pairA.maximumApy.lessThan(pairB.maximumApy) ? 1 : -1
  },
  [LIQUIDITY_SORTING_TYPES.NEW]: (pairA: { startsAt?: BigintIsh }, pairB: { startsAt?: BigintIsh }): number => {
    if (JSBI.EQ(pairA.startsAt, pairB.startsAt)) return 0
    return JSBI.LT(pairA.startsAt, pairB.startsAt) ? 1 : -1
  },
}

export function useAllPairsWithLiquidityAndMaximumApyAndStakingIndicator(
  filter: PairsFilterType = PairsFilterType.ALL,
  filterToken?: Token,
  sortBy = LIQUIDITY_SORTING_TYPES.TVL
): {
  loading: boolean
  aggregatedData: {
    pair: Pair
    liquidityUSD: CurrencyAmount
    maximumApy: Percent
    staked: boolean
    containsKpiToken: boolean
    hasFarming: boolean
  }[]
} {
  const { loading: loadingAllWrappedPairs, wrappedPairs: allWrappedPairs } =
    useAllPairsWithNonExpiredLiquidityMiningCampaignsAndLiquidityAndStakingIndicator(filterToken)

  return useMemo(() => {
    const sorter = liquidityPairSorter[sortBy]

    if (loadingAllWrappedPairs) return { loading: true, aggregatedData: [] }

    const aggregation = []
    for (let i = 0; i < allWrappedPairs.length; i++) {
      const wrappedPair = allWrappedPairs[i]

      const bestCampaign = getBestApyPairCampaign(wrappedPair.pair)
      aggregation.push({
        hasFarming: wrappedPair.hasFarming,
        pair: wrappedPair.pair,
        staked: wrappedPair.staked,
        liquidityUSD: wrappedPair.reserveUSD,
        maximumApy: bestCampaign ? bestCampaign.apy : new Percent('0', '100'),
        containsKpiToken: !!bestCampaign?.rewards.some(reward => reward.token instanceof KpiToken),
        startsAt: bestCampaign?.startsAt || ZERO,
      })
    }
    let filteredData = aggregation

    if (filter !== PairsFilterType.ALL) {
      filteredData = filteredData.filter(data => {
        // TODO: fully implement filtering
        return filter === PairsFilterType.REWARDS ? data.maximumApy.greaterThan('0') : true
      })
    }
    return {
      loading: false,
      aggregatedData: filteredData.sort(sorter),
    }
  }, [allWrappedPairs, filter, loadingAllWrappedPairs, sortBy])
}
