import { BigintIsh, CurrencyAmount, Pair, Percent, SingleSidedLiquidityMiningCampaign } from '@swapr/sdk'
import { PairsFilterType } from '../ListFilter'

export interface AggregatedPairs {
  pair: Pair
  liquidityUSD: CurrencyAmount
  maximumApy: Percent
  staked?: boolean
  containsKpiToken?: boolean
  hasFarming?: boolean
  startsAt?: BigintIsh
}
export interface PairsListProps {
  aggregatedPairs: AggregatedPairs[]
  singleSidedStake?: SingleSidedLiquidityMiningCampaign
  hasActiveCampaigns?: boolean
  filter?: PairsFilterType
  loading?: boolean
  hasSingleSidedStake?: boolean
}
