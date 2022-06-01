import { useCallback, useMemo } from 'react'
import { gql, useQuery } from '@apollo/client'
import { BigintIsh, Pair, Token } from '@swapr/sdk'

import { MiningCampaign } from '../utils/liquidityMining'
import { SubgraphLiquidityMiningCampaign, SubgraphSingleSidedStakingCampaign } from '../apollo'
import { useNativeCurrency } from './useNativeCurrency'
import { useActiveWeb3React } from '.'
import {
  getLowerTimeLimit,
  getTokenAmount,
  sortActiveCampaigns,
  sortExpiredCampaigns,
  toLiquidityMiningCampaign,
  toSingleSidedStakeCampaign,
} from '../utils/liquidityMining'
import { useAllTokensFromActiveListsOnCurrentChain } from '../state/lists/hooks'
import { useKpiTokens } from './useKpiTokens'
import { PairsFilterType } from '../components/Pool/ListFilter'
import { useSWPRToken } from './swpr/useSWPRToken'

// Native fragments will not be resovled
const CAMPAIGN_REWARDS_TOKEN_COMMON_FIEDLDS = ['address: id', 'name', 'symbol', 'decimals', 'derivedNativeCurrency']
const CAMPAIGN_COMMON_FIEDLDS = ['duration', 'startsAt', 'endsAt', 'locked', 'stakingCap', 'stakedAmount']

const SINGLE_SIDED_CAMPAIGNS = gql`
  query($userId: ID) {
    singleSidedStakingCampaigns(first: 999) {
      id
      owner
      ${CAMPAIGN_COMMON_FIEDLDS.join('\r\n')}
      stakeToken {
        id
        symbol
        name
        decimals
        totalSupply
        derivedNativeCurrency
      }
      rewards {
        token {
          ${CAMPAIGN_REWARDS_TOKEN_COMMON_FIEDLDS.join('\r\n')}
        }
        amount
      }
      singleSidedStakingPositions(where: { stakedAmount_gt: 0, user: $userId }) {
        id
      }
    }
  }
`
const REGULAR_CAMPAIGN = gql`
  query($userId: ID) {
    liquidityMiningCampaigns(first: 999) {
      address: id
      ${CAMPAIGN_COMMON_FIEDLDS.join('\r\n')}
      rewards {
        token {
          ${CAMPAIGN_REWARDS_TOKEN_COMMON_FIEDLDS.join('\r\n')}
        }
        amount
      }
      stakablePair {
        id
        reserveNativeCurrency
        reserveUSD
        totalSupply
        reserve0
        reserve1
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
      }
      liquidityMiningPositions(where: { stakedAmount_gt: 0, user: $userId }) {
        id
      }
    }
  }
`

export function useAllLiquidityMiningCampaigns(pair?: Pair, dataFilter?: PairsFilterType) {
  const token0Address = pair?.token0?.address.toLowerCase()
  const token1Address = pair?.token1?.address.toLowerCase()
  const pairAddress = pair?.liquidityToken.address.toLowerCase()

  const { chainId, account } = useActiveWeb3React()

  const subgraphAccountId = account?.toLowerCase() ?? ''

  const SWPRToken = useSWPRToken()
  const nativeCurrency = useNativeCurrency()
  const timestamp = useMemo(() => Math.floor(Date.now() / 1000), [])
  const isUpcoming = useCallback((startTime: BigintIsh) => timestamp < parseInt(startTime.toString()), [timestamp])

  const memoizedLowerTimeLimit = useMemo(() => getLowerTimeLimit(), [])
  const tokensInCurrentChain = useAllTokensFromActiveListsOnCurrentChain()

  const { data: singleSidedCampaigns, loading: singleSidedLoading, error: singleSidedCampaignsError } = useQuery<{
    singleSidedStakingCampaigns: SubgraphSingleSidedStakingCampaign[]
  }>(SINGLE_SIDED_CAMPAIGNS, {
    variables: {
      userId: subgraphAccountId,
    },
  })

  const { data: pairCampaigns, loading: campaignLoading, error: campaignError } = useQuery<{
    liquidityMiningCampaigns: SubgraphLiquidityMiningCampaign[]
  }>(REGULAR_CAMPAIGN, {
    variables: {
      userId: subgraphAccountId,
    },
  })

  const kpiTokenAddresses = useMemo(() => {
    if (!pairCampaigns) return []
    return pairCampaigns.liquidityMiningCampaigns.flatMap(campaign =>
      campaign.rewards.map(reward => reward.token.address.toLowerCase())
    )
  }, [pairCampaigns])
  const { loading: loadingKpiTokens, kpiTokens } = useKpiTokens(kpiTokenAddresses)

  return useMemo(() => {
    if (
      singleSidedLoading ||
      chainId === undefined ||
      campaignLoading ||
      !SWPRToken ||
      singleSidedCampaignsError ||
      campaignError ||
      !singleSidedCampaigns ||
      !singleSidedCampaigns?.singleSidedStakingCampaigns ||
      !pairCampaigns ||
      !pairCampaigns.liquidityMiningCampaigns ||
      loadingKpiTokens
    ) {
      return { loading: true, miningCampaigns: { active: [], expired: [] } }
    }
    const expiredCampaigns: MiningCampaign[] = []
    const activeCampaigns: MiningCampaign[] = []

    for (let i = 0; i < pairCampaigns.liquidityMiningCampaigns.length; i++) {
      const campaign = pairCampaigns.liquidityMiningCampaigns[i]

      if (
        (pairAddress && campaign.stakablePair.id.toLowerCase() !== pairAddress) ||
        (dataFilter === PairsFilterType.MY && campaign.liquidityMiningPositions.length === 0)
      )
        continue

      const { reserveNativeCurrency, totalSupply, token0, token1, reserve0, reserve1 } = campaign.stakablePair
      const containsKpiToken = !!campaign.rewards.find(
        reward => !!kpiTokens.find(kpiToken => kpiToken.address.toLowerCase() === reward.token.address.toLowerCase())
      )

      const tokenAmountA = getTokenAmount({ token: token0, tokensInCurrentChain, chainId, reserve: reserve0 })
      const tokenAmountB = getTokenAmount({ token: token1, tokensInCurrentChain, chainId, reserve: reserve1 })

      const pair = new Pair(tokenAmountA, tokenAmountB)

      const liquidityCampaign = toLiquidityMiningCampaign(
        chainId,
        pair,
        totalSupply,
        reserveNativeCurrency,
        kpiTokens,
        campaign,
        nativeCurrency
      )

      const hasStake = campaign.liquidityMiningPositions.length > 0
      const isExpired = parseInt(campaign.endsAt) < timestamp || parseInt(campaign.endsAt) > memoizedLowerTimeLimit
      const isActive = hasStake || liquidityCampaign.currentlyActive || isUpcoming(campaign.startsAt)

      if (
        dataFilter !== PairsFilterType.SWPR ||
        SWPRToken.address.toLowerCase() === token0.address ||
        SWPRToken.address.toLowerCase() === token1.address
      ) {
        if (isActive) {
          activeCampaigns.push({ campaign: liquidityCampaign, staked: hasStake, containsKpiToken: containsKpiToken })
        } else if (isExpired) {
          expiredCampaigns.push({ campaign: liquidityCampaign, staked: hasStake, containsKpiToken: containsKpiToken })
        }
      }
    }

    for (let i = 0; i < singleSidedCampaigns.singleSidedStakingCampaigns.length; i++) {
      const campaign = singleSidedCampaigns.singleSidedStakingCampaigns[i]

      if (
        (token0Address &&
          token1Address &&
          campaign.stakeToken.id.toLowerCase() !== token0Address &&
          campaign.stakeToken.id.toLowerCase() !== token1Address) ||
        (dataFilter === PairsFilterType.MY && campaign.singleSidedStakingPositions.length === 0)
      )
        continue
      const containsKpiToken = !!campaign.rewards.find(
        reward => !!kpiTokens.find(kpiToken => kpiToken.address.toLowerCase() === reward.token.address.toLowerCase())
      )
      const stakeToken = new Token(
        chainId,
        campaign.stakeToken.id,
        parseInt(campaign.stakeToken.decimals),
        campaign.stakeToken.symbol,
        campaign.stakeToken.name
      )

      let singleSidedStakeCampaign
      try {
        singleSidedStakeCampaign = toSingleSidedStakeCampaign(
          chainId,
          campaign,
          stakeToken,
          campaign.stakeToken.totalSupply,
          nativeCurrency,
          campaign.stakeToken.derivedNativeCurrency
        )
      } catch (e) {
        // TODO: Investigate why `derivedNativeCurrency` is zero
        console.error('Campaign', { campaign })
        continue
      }

      const hasStake = campaign.singleSidedStakingPositions.length > 0
      const isExpired = parseInt(campaign.endsAt) < timestamp || parseInt(campaign.endsAt) > memoizedLowerTimeLimit

      if (dataFilter !== PairsFilterType.SWPR || SWPRToken.equals(stakeToken)) {
        if (hasStake || singleSidedStakeCampaign.currentlyActive || isUpcoming(singleSidedStakeCampaign.startsAt)) {
          activeCampaigns.unshift({
            campaign: singleSidedStakeCampaign,
            staked: hasStake,
            containsKpiToken: containsKpiToken,
          })
        } else if (isExpired) {
          expiredCampaigns.unshift({
            campaign: singleSidedStakeCampaign,
            staked: hasStake,
            containsKpiToken: containsKpiToken,
          })
        }
      }
    }

    return {
      loading: false,
      miningCampaigns: {
        active: sortActiveCampaigns(activeCampaigns),
        expired: sortExpiredCampaigns(expiredCampaigns),
      },
    }
  }, [
    singleSidedLoading,
    chainId,
    campaignLoading,
    singleSidedCampaignsError,
    campaignError,
    singleSidedCampaigns,
    pairCampaigns,
    loadingKpiTokens,
    pairAddress,
    dataFilter,
    tokensInCurrentChain,
    kpiTokens,
    nativeCurrency,
    timestamp,
    memoizedLowerTimeLimit,
    SWPRToken,
    isUpcoming,
    token0Address,
    token1Address,
  ])
}
