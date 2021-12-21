import { gql, useQuery } from '@apollo/client'

import { DateTime, Duration } from 'luxon'
import { Token } from '@dxdao/swapr-sdk'

import { useMemo } from 'react'
import { useActiveWeb3React } from '..'
import { SubgraphSingleSidedStakingCampaign } from '../../apollo'
import { toSingleSidedStakeCampaign } from '../../utils/liquidityMining'

import { useNativeCurrency } from '../useNativeCurrency'

const QUERY = gql`
  query($address: [ID!], $userId: ID) {
    singleSidedStakingCampaigns(first: 100, where: { stakeToken_in: $address }) {
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
      }
      stakedAmount
      stakingCap
    }
  }
`

export function usePairCampaigns(
  token0?: string,
  token1?: string
): {
  loading: boolean
  active: any
  expired: any
} {
  //const hardcodedShit = '0x26358e62c2eded350e311bfde51588b8383a9315'
  const { chainId, account } = useActiveWeb3React()
  const nativeCurrency = useNativeCurrency()
  const subgraphAccountId = useMemo(() => account?.toLowerCase() || '', [account])
  const token0Address = useMemo(() => token0?.toLowerCase(), [token0])
  const token1Address = useMemo(() => token1?.toLowerCase(), [token1])
  const timestamp = useMemo(() => Math.floor(Date.now() / 1000), [])
  const lowerTimeLimit = DateTime.utc()
    .minus(Duration.fromObject({ days: 30 }))
    .toJSDate()
  const memoizedLowerTimeLimit = useMemo(() => Math.floor(lowerTimeLimit.getTime() / 1000), [lowerTimeLimit])

  const { data, loading, error } = useQuery<{
    singleSidedStakingCampaigns: SubgraphSingleSidedStakingCampaign[]
  }>(QUERY, {
    variables: {
      address: [token0Address, token1Address],
      userId: subgraphAccountId
    }
  })
  return useMemo(() => {
    if (loading || chainId === undefined) {
      return { loading: true, active: [], expired: [] }
    }
    if (error || !data || data.singleSidedStakingCampaigns.length === 0) {
      return { loading: false, active: [], expired: [] }
    }

    const expiredCampaigns = []
    const activeCampaigns = []
    for (let i = 0; i < data.singleSidedStakingCampaigns.length; i++) {
      const camapaign = data.singleSidedStakingCampaigns[i]
      const stakeToken = new Token(
        chainId,
        camapaign.stakeToken.id,
        parseInt(camapaign.stakeToken.decimals),
        camapaign.stakeToken.symbol,
        camapaign.stakeToken.name
      )
      const singleSidedStakeCampaign = toSingleSidedStakeCampaign(
        chainId,
        camapaign,
        stakeToken,
        camapaign.stakeToken.totalSupply,
        nativeCurrency,
        camapaign.stakeToken.derivedNativeCurrency
      )
      const hasStake = camapaign.singleSidedStakingPositions.length > 0
      const isExpired = parseInt(camapaign.endsAt) < timestamp || parseInt(camapaign.endsAt) > memoizedLowerTimeLimit
      //reminder add support for kpi tokens if possbile
      if (hasStake || singleSidedStakeCampaign.currentlyActive) {
        activeCampaigns.push({ campaign: singleSidedStakeCampaign, staked: hasStake, containsKpiToken: false })
      } else if (isExpired) {
        expiredCampaigns.push({ campaign: singleSidedStakeCampaign, staked: hasStake, containsKpiToken: false })
      }
    }

    return {
      loading: false,
      active: activeCampaigns,
      expired: expiredCampaigns
    }
  }, [data, loading, error, chainId, nativeCurrency, memoizedLowerTimeLimit, timestamp])
}
