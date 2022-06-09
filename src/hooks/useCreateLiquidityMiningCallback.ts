import { TransactionResponse } from '@ethersproject/providers'
import { parseUnits } from '@ethersproject/units'
import { LiquidityMiningCampaign, SingleSidedLiquidityMiningCampaign } from '@swapr/sdk'

import { useMemo } from 'react'

import { useStakingRewardsDistributionFactoryContract } from './useContract'

/**
 * Returns a function that creates a liquidity mining distribution with the given parameters.
 */
export function useCreateLiquidityMiningCallback(
  campaign: LiquidityMiningCampaign | SingleSidedLiquidityMiningCampaign | null
): null | (() => Promise<TransactionResponse>) {
  const factoryContract = useStakingRewardsDistributionFactoryContract(true)

  return useMemo(() => {
    if (!factoryContract || !campaign) return null
    return async () => {
      return factoryContract.createDistribution(
        campaign.rewards.map(reward => reward.token.address),
        campaign instanceof SingleSidedLiquidityMiningCampaign
          ? campaign.stakeToken.address
          : campaign.targetedPair.liquidityToken.address,
        campaign.rewards.map(reward => parseUnits(reward?.toExact(), reward.token.decimals).toString()),
        campaign.startsAt,
        campaign.endsAt,
        campaign.locked,
        campaign.stakingCap.raw.toString()
      )
    }
  }, [factoryContract, campaign])
}
