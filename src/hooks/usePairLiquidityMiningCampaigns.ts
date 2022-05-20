import { useCallback, useMemo } from 'react'
import { useQuery } from '@apollo/client'
import { BigintIsh, Pair } from '@swapr/sdk'
import { SubgraphLiquidityMiningCampaign } from '../apollo'

import { useNativeCurrency } from './useNativeCurrency'
import { useActiveWeb3React } from '.'
import {
  getLowerTimeLimit,
  getTokenAmount,
  sortActiveCampaigns,
  sortExpiredCampaigns,
  toLiquidityMiningCampaign,
} from '../utils/liquidityMining'
import { useAllTokensFromActiveListsOnCurrentChain } from '../state/lists/hooks'
import { useKpiTokens } from './useKpiTokens'
import { PairsFilterType } from '../components/Pool/ListFilter'
import { useSWPRToken } from './swpr/useSWPRToken'
import { REGULAR_CAMPAIGN } from './useAllLiquidityMiningCampaigns'

export function usePairLiquidityMiningCampaigns(
  pair?: Pair,
  dataFilter?: PairsFilterType
): {
  loading: boolean
  miningCampaigns: any
} {
  const pairAddress = useMemo(() => (pair ? pair.liquidityToken.address.toLowerCase() : undefined), [pair])
  const { chainId, account } = useActiveWeb3React()
  const subgraphAccountId = useMemo(() => account?.toLowerCase() || '', [account])
  const SWPRToken = useSWPRToken()
  const nativeCurrency = useNativeCurrency()
  const timestamp = useMemo(() => Math.floor(Date.now() / 1000), [])
  const isUpcoming = useCallback((startTime: BigintIsh) => timestamp < parseInt(startTime.toString()), [timestamp])
  const memoizedLowerTimeLimit = useMemo(() => getLowerTimeLimit(), [])
  const tokensInCurrentChain = useAllTokensFromActiveListsOnCurrentChain()

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
      chainId === undefined ||
      pairAddress === undefined ||
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

      if (
        (pairAddress && campaign.stakablePair.id.toLowerCase() !== pairAddress) ||
        (dataFilter === PairsFilterType.MY && campaign.liquidityMiningPositions.length === 0)
      ) {
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
      if (dataFilter !== PairsFilterType.SWPR || SWPRToken.equals(token0) || SWPRToken.equals(token1)) {
        if (isActive) {
          activeCampaigns.push({ campaign: liquidityCampaign, staked: hasStake, containsKpiToken: containsKpiToken })
        } else if (isExpired) {
          expiredCampaigns.push({ campaign: liquidityCampaign, staked: hasStake, containsKpiToken: containsKpiToken })
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
    chainId,
    campaignLoading,
    campaignError,
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
  ])
}
