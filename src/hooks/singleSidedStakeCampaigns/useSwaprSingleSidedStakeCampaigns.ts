import { gql, useQuery } from '@apollo/client'

import { SWPR, Token, SingleSidedLiquidityMiningCampaign } from '@dxdao/swapr-sdk'

import { useMemo } from 'react'

import { useActiveWeb3React } from '..'
import { SubgraphSingleSidedStakingCampaign } from '../../apollo'
import { PairsFilterType } from '../../components/Pool/ListFilter'

import { toSingleSidedStakeCampaign } from '../../utils/liquidityMining'
import { useNativeCurrency } from '../useNativeCurrency'

const QUERY = gql`
  query($address: ID, $userId: ID) {
    singleSidedStakingCampaigns(first: 100, where: { stakeToken: $address }) {
      id
      owner
      startsAt
      endsAt
      duration
      locked
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
          address: id
          name
          symbol
          decimals
          derivedNativeCurrency
        }
        amount
      }
      singleSidedStakingPositions(where: { stakedAmount_gt: 0, user: $userId }) {
        id
        stakedAmount
      }
      stakedAmount
      stakingCap
    }
  }
`

export function useSwaprSinglelSidedStakeCampaigns(
  filterToken?: Token,
  filter: PairsFilterType = PairsFilterType.ALL
): {
  loading: boolean
  data: SingleSidedLiquidityMiningCampaign | undefined
  stakedAmount?: string
} {
  //const hardcodedShit = '0x26358e62c2eded350e311bfde51588b8383a9315'
  const { chainId, account } = useActiveWeb3React()
  const nativeCurrency = useNativeCurrency()
  const subgraphAccountId = useMemo(() => account?.toLowerCase() || '', [account])
  const filterTokenAddress = useMemo(() => filterToken?.address.toLowerCase(), [filterToken])
  //using xeenus as token for rinkeby
  const swaprAddress = chainId === 4 ? '0x022e292b44b5a146f2e8ee36ff44d3dd863c915c' : SWPR[chainId || 1].address
  const { data, loading, error } = useQuery<{
    singleSidedStakingCampaigns: SubgraphSingleSidedStakingCampaign[]
  }>(QUERY, {
    variables: {
      address: swaprAddress.toLowerCase(),
      userId: subgraphAccountId
    }
  })
  return useMemo(() => {
    if (loading || chainId === undefined) {
      return { loading: true, data: undefined, stakedAmount: '0' }
    }
    if (error || !data) {
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
      wrapped,
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
        wrapped.singleSidedStakingPositions.length > 0 ? wrapped.singleSidedStakingPositions[0].stakedAmount : '0'
    }
  }, [filter, data, loading, error, filterToken, swaprAddress, chainId, nativeCurrency, filterTokenAddress])
}
