import { BigintIsh, Pair } from '@swapr/sdk'

import { gql, useQuery } from '@apollo/client'
import { useWeb3React } from '@web3-react/core'
import { useCallback, useMemo } from 'react'

import { SubgraphLiquidityMiningCampaign } from '../apollo'
import { useAllTokensFromActiveListsOnCurrentChain } from '../state/lists/hooks'
import {
  getLowerTimeLimit,
  getTokenAmount,
  MiningCampaign,
  sortActiveCampaigns,
  sortExpiredCampaigns,
  toLiquidityMiningCampaign,
} from '../utils/liquidityMining'
import { useKpiTokens } from './useKpiTokens'
import { useNativeCurrency } from './useNativeCurrency'

const CAMPAIGN_REWARDS_TOKEN_COMMON_FIEDLDS = ['address: id', 'name', 'symbol', 'decimals', 'derivedNativeCurrency']
const CAMPAIGN_COMMON_FIEDLDS = ['duration', 'startsAt', 'endsAt', 'locked', 'stakingCap', 'stakedAmount']

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

export function usePairLiquidityMiningCampaigns(pair?: Pair): {
  loading: boolean
  miningCampaigns: { active: MiningCampaign[]; expired: MiningCampaign[] }
} {
  const pairAddress = pair ? pair.liquidityToken.address.toLowerCase() : undefined
  const { chainId, account } = useWeb3React()
  const subgraphAccountId = account?.toLowerCase() || ''
  const nativeCurrency = useNativeCurrency()
  const timestamp = Math.floor(Date.now() / 1000)
  const isUpcoming = useCallback((startTime: BigintIsh) => timestamp < parseInt(startTime.toString()), [timestamp])
  const memoizedLowerTimeLimit = useMemo(() => getLowerTimeLimit(), [])
  const tokensInCurrentChain = useAllTokensFromActiveListsOnCurrentChain()

  const {
    data: pairCampaigns,
    loading: campaignLoading,
    error: campaignError,
  } = useQuery<{
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
      !chainId ||
      !pairAddress ||
      campaignError ||
      !pairCampaigns ||
      !pairCampaigns.liquidityMiningCampaigns ||
      loadingKpiTokens ||
      campaignLoading
    ) {
      return { loading: true, miningCampaigns: { active: [], expired: [] } }
    }

    const expiredCampaigns = []
    const activeCampaigns = []
    for (let i = 0; i < pairCampaigns.liquidityMiningCampaigns.length; i++) {
      const campaign = pairCampaigns.liquidityMiningCampaigns[i]

      if (pairAddress && campaign.stakablePair.id.toLowerCase() !== pairAddress) {
        continue
      }

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

      if (isActive) {
        activeCampaigns.push({ campaign: liquidityCampaign, staked: hasStake, containsKpiToken: containsKpiToken })
      } else if (isExpired) {
        expiredCampaigns.push({ campaign: liquidityCampaign, staked: hasStake, containsKpiToken: containsKpiToken })
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
    chainId,
    campaignLoading,
    campaignError,
    pairCampaigns,
    loadingKpiTokens,
    pairAddress,
    tokensInCurrentChain,
    kpiTokens,
    nativeCurrency,
    timestamp,
    memoizedLowerTimeLimit,
    isUpcoming,
  ])
}
