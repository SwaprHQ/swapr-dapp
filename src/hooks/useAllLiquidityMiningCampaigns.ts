import { BigintIsh, Pair } from '@swapr/sdk'

import { useCallback, useMemo } from 'react'

import { SubgraphLiquidityMiningCampaign } from '../apollo'
import { PairsFilterType } from '../components/Pool/ListFilter'
import { useGetLiquidityMiningCampaignsQuery } from '../graphql/generated/schema'
import { useAllTokensFromActiveListsOnCurrentChain } from '../state/lists/hooks'
import {
  getLowerTimeLimit,
  getTokenAmount,
  MiningCampaign,
  sortActiveCampaigns,
  sortExpiredCampaigns,
  toLiquidityMiningCampaign,
} from '../utils/liquidityMining'

import { useSWPRToken } from './swpr/useSWPRToken'
import { useKpiTokens } from './useKpiTokens'
import { useNativeCurrency } from './useNativeCurrency'

import { useActiveWeb3React } from './index'

export function useAllLiquidityMiningCampaigns(pair?: Pair, dataFilter?: PairsFilterType) {
  const pairAddress = pair?.liquidityToken.address.toLowerCase()

  const { chainId, account } = useActiveWeb3React()

  const subgraphAccountId = account?.toLowerCase() ?? ''

  const SWPRToken = useSWPRToken()
  const nativeCurrency = useNativeCurrency()
  const timestamp = useMemo(() => Math.floor(Date.now() / 1000), [])
  const isUpcoming = useCallback((startTime: BigintIsh) => timestamp < parseInt(startTime.toString()), [timestamp])

  const memoizedLowerTimeLimit = useMemo(() => getLowerTimeLimit(), [])
  const tokensInCurrentChain = useAllTokensFromActiveListsOnCurrentChain()

  const {
    data: pairCampaigns,
    loading: campaignLoading,
    error: campaignError,
  } = useGetLiquidityMiningCampaignsQuery({
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
      campaignLoading ||
      !SWPRToken ||
      campaignError ||
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
        campaign as SubgraphLiquidityMiningCampaign,
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
