export interface SubgraphLiquidityMiningCampaignRewardToken {
  derivedNativeCurrency: string
  address: string
  symbol: string
  name: string
  decimals: string
}

export interface SubgraphLiquidityMiningCampaignReward {
  token: SubgraphLiquidityMiningCampaignRewardToken
  amount: string
}

export interface SubgraphLiquidityMiningCampaign {
  address: string
  duration: string
  startsAt: string
  endsAt: string
  rewards: SubgraphLiquidityMiningCampaignReward[]
  stakedAmount: string
  locked: boolean
  stakingCap: string
}

export interface SubgraphSingleSidedStakingCampaign {
  id: string
  owner: string
  startsAt: string
  endsAt: string
  duration: string
  stakeToken: { symbol: string; name: string; decimals: string; totalSupply: string }
  rewardToken: { symbol: string; name: string; decimals: string; totalSupply: string }
  stakedAmount: string
}
