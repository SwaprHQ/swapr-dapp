import { SingleSidedLiquidityMiningCampaign, Token } from '@swapr/sdk'

import { useMemo } from 'react'

import { SubgraphSingleSidedStakingCampaign } from '../../apollo'
import { useGetSingleSidedStakingCampaignQuery } from '../../graphql/generated/schema'
import { toSingleSidedStakeCampaign } from '../../utils/liquidityMining'
import { useNativeCurrency } from '../useNativeCurrency'
import { useWeb3ReactCore } from '../useWeb3ReactCore'

export function useSingleSidedCampaign(campaginAddress: string): {
  loading: boolean
  singleSidedStakingCampaign: SingleSidedLiquidityMiningCampaign | undefined
} {
  //const hardcodedShit = '0x26358e62c2eded350e311bfde51588b8383a9315'
  const { chainId } = useWeb3ReactCore()
  const nativeCurrency = useNativeCurrency()
  const { data, loading, error } = useGetSingleSidedStakingCampaignQuery({
    variables: {
      campaignId: campaginAddress.toLowerCase(),
    },
  })
  return useMemo(() => {
    if (loading || chainId === undefined) {
      return { loading: true, singleSidedStakingCampaign: undefined }
    }
    if (error || !data || !data.singleSidedStakingCampaign) {
      return { loading: false, singleSidedStakingCampaign: undefined }
    }
    const wrapped = data.singleSidedStakingCampaign
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

    return {
      loading: false,
      singleSidedStakingCampaign: singleSidedStakeCampaign,
    }
  }, [data, loading, error, chainId, nativeCurrency])
}
