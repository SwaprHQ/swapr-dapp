import { LiquidityMiningCampaign, PricedTokenAmount, SingleSidedLiquidityMiningCampaign } from '@swapr/sdk'
import { useMemo } from 'react'
import { useStakingRewardsDistributionContract, useStakingRewardsDistributionContracts } from './useContract'
import { useMultipleContractSingleData, useSingleCallResult } from '../state/multicall/hooks'
import { useActiveWeb3React } from '.'
import { BigNumber } from 'ethers'

interface UseLiquidityMiningCampaignUserPositionHookResult {
  stakedTokenAmount: PricedTokenAmount | null
  claimedRewardAmounts: PricedTokenAmount[]
  claimableRewardAmounts: PricedTokenAmount[]
  totalRewardedAmounts: PricedTokenAmount[]
}

export function useLiquidityMiningCampaignPositions(
  campaigns?: (LiquidityMiningCampaign | SingleSidedLiquidityMiningCampaign)[],
  account?: string
): UseLiquidityMiningCampaignUserPositionHookResult[] | undefined {
  const { chainId } = useActiveWeb3React()
  const { contracts: distributionContracts, iface } = useStakingRewardsDistributionContracts(
    campaigns?.map(c => c.address) || [],
    true
  )

  const claimedRewardsResult = useMultipleContractSingleData(
    distributionContracts.map(c => c?.address),
    iface,
    'getClaimedRewards',
    [account]
  )
  const stakedTokensOfResult = useMultipleContractSingleData(
    distributionContracts.map(c => c?.address),
    iface,
    'stakedTokensOf',
    [account]
  )
  const claimableRewardsResult = useMultipleContractSingleData(
    distributionContracts.map(c => c?.address),
    iface,
    'claimableRewards',
    [account]
  )

  return useMemo(() => {
    if (!campaigns || !chainId) return undefined
    if (!campaigns.length) return []
    return campaigns.map((camp, i) => {
      const claimedResult = claimedRewardsResult[i]
      const claimableResult = claimableRewardsResult[i]
      const stakedResult = stakedTokensOfResult[i]
      if (!claimedResult.result || !claimableResult.result || !stakedResult.result)
        return {
          stakedTokenAmount: null,
          claimedRewardAmounts: [],
          claimableRewardAmounts: [],
          totalRewardedAmounts: []
        }
      const claimedRewards = claimedResult.result[0] as BigNumber[]
      const claimableRewards = claimableResult.result[0] as BigNumber[]
      const stakedTokensOf = stakedResult.result[0] as BigNumber

      if (!claimedRewards || !claimableRewards || !stakedTokensOf)
        return {
          stakedTokenAmount: null,
          claimedRewardAmounts: [],
          claimableRewardAmounts: [],
          totalRewardedAmounts: []
        }

      const claimedRewardAmounts = claimedRewards.map(
        (claimed, index) => new PricedTokenAmount(camp.rewards[index].token, claimed.toString())
      )
      const claimableRewardAmounts = claimableRewards.map(
        (claimable, index) => new PricedTokenAmount(camp.rewards[index].token, claimable.toString())
      )
      const totalRewardedAmounts = claimableRewardAmounts.map(
        (claimable, index) => new PricedTokenAmount(claimable.token, claimable.add(claimedRewardAmounts[index]).raw)
      )

      return {
        stakedTokenAmount: new PricedTokenAmount(camp.staked.token, stakedTokensOf.toString()),
        claimedRewardAmounts,
        claimableRewardAmounts,
        totalRewardedAmounts
      }
    })
  }, [campaigns, claimableRewardsResult, stakedTokensOfResult, claimedRewardsResult, chainId])
}

export function useLiquidityMiningCampaignPosition(
  campaign?: LiquidityMiningCampaign | SingleSidedLiquidityMiningCampaign,
  account?: string
): UseLiquidityMiningCampaignUserPositionHookResult {
  const { chainId } = useActiveWeb3React()

  const distributionContract = useStakingRewardsDistributionContract(campaign?.address, true)

  const claimedRewardsResult = useSingleCallResult(distributionContract, 'getClaimedRewards', [account])
  const stakedTokensOfResult = useSingleCallResult(distributionContract, 'stakedTokensOf', [account])
  const claimableRewardsResult = useSingleCallResult(distributionContract, 'claimableRewards', [account])

  return useMemo(() => {
    if (
      !campaign ||
      !chainId ||
      !claimableRewardsResult.result ||
      !stakedTokensOfResult.result ||
      !claimedRewardsResult.result
    )
      return {
        stakedTokenAmount: null,
        claimedRewardAmounts: [],
        claimableRewardAmounts: [],
        totalRewardedAmounts: []
      }
    const stakedTokensOf = stakedTokensOfResult.result[0] as BigNumber
    const claimedRewards = claimedRewardsResult.result[0] as BigNumber[]
    const claimableRewards = claimableRewardsResult.result[0] as BigNumber[]

    const claimedRewardAmounts = claimedRewards.map(
      (claimed, index) => new PricedTokenAmount(campaign.rewards[index].token, claimed.toString())
    )
    const claimableRewardAmounts = claimableRewards.map(
      (claimable, index) => new PricedTokenAmount(campaign.rewards[index].token, claimable.toString())
    )
    const totalRewardedAmounts = claimableRewardAmounts.map(
      (claimable, index) => new PricedTokenAmount(claimable.token, claimable.add(claimedRewardAmounts[index]).raw)
    )

    return {
      stakedTokenAmount: new PricedTokenAmount(campaign.staked.token, stakedTokensOf.toString()),
      claimedRewardAmounts,
      claimableRewardAmounts,
      totalRewardedAmounts
    }
  }, [campaign, chainId, claimableRewardsResult.result, claimedRewardsResult.result, stakedTokensOfResult.result])
}
