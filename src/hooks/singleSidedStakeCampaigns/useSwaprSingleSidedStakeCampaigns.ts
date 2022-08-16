import { SingleSidedLiquidityMiningCampaign, Token } from '@swapr/sdk'

import { useMemo } from 'react'

import { useActiveWeb3React } from '..'
import { SubgraphSingleSidedStakingCampaign } from '../../apollo'
import { PairsFilterType } from '../../components/Pool/ListFilter'
import { useGetSingleSidedStakingCampaignsQuery } from '../../graphql/generated/schema'
import { toSingleSidedStakeCampaign } from '../../utils/liquidityMining'
import { useSWPRToken } from '../swpr/useSWPRToken'
import { useNativeCurrency } from '../useNativeCurrency'

export function useSwaprSinglelSidedStakeCampaigns(
  filterToken?: Token,
  filter: PairsFilterType = PairsFilterType.ALL
): {
  loading: boolean
  data: SingleSidedLiquidityMiningCampaign | undefined
  stakedAmount?: string
} {
  const { chainId, account } = useActiveWeb3React()
  const nativeCurrency = useNativeCurrency()
  const subgraphAccountId = account?.toLowerCase() || ''
  const filterTokenAddress = filterToken?.address?.toLowerCase()

  const SWPRToken = useSWPRToken()
  const swaprAddress = SWPRToken?.address ?? undefined
  const { data, loading, error } = useGetSingleSidedStakingCampaignsQuery({
    variables: {
      stakeTokenId: swaprAddress?.toLowerCase(),
      userId: subgraphAccountId,
    },
  })
  return useMemo(() => {
    if (loading || chainId === undefined) {
      return { loading: true, data: undefined, stakedAmount: '0' }
    }
    if (error || !data || data.singleSidedStakingCampaigns.length === 0) {
      return { loading: false, data: undefined, stakedAmount: '0' }
    }
    const wrapped = data.singleSidedStakingCampaigns[data.singleSidedStakingCampaigns.length - 1]
    const stakeToken = new Token(
      chainId,
      wrapped.stakeToken.id,
      parseInt(wrapped.stakeToken.decimals),
      wrapped.stakeToken.symbol,
      wrapped.stakeToken.name
    )

    const singleSidedStakeCampaign = toSingleSidedStakeCampaign(
      chainId,
      wrapped as SubgraphSingleSidedStakingCampaign,
      stakeToken,
      wrapped.stakeToken.totalSupply,
      nativeCurrency,
      wrapped.stakeToken.derivedNativeCurrency
    )

    if (
      (filterToken !== undefined && filterTokenAddress !== swaprAddress) ||
      (filter === PairsFilterType.MY && wrapped.singleSidedStakingPositions.length < 0) ||
      singleSidedStakeCampaign.ended
    ) {
      return { loading: false, data: undefined }
    }

    return {
      loading: false,
      data: singleSidedStakeCampaign,
      stakedAmount:
        wrapped.singleSidedStakingPositions.length > 0 ? wrapped.singleSidedStakingPositions[0].stakedAmount : '0',
    }
  }, [filter, data, loading, error, filterToken, swaprAddress, chainId, nativeCurrency, filterTokenAddress])
}
