import { gql, useQuery } from '@apollo/client'

import { useMemo } from 'react'
import { SubgraphSingleSidedStakingCampaign } from '../apollo'

const QUERY = gql`
  query($owner: ID) {
    singleSidedStakingCampaigns(first: 5, where: { owner: $owner }) {
      address: id
      owner
      startsAt
      endsAt
      duration
      stakeToken {
        symbol
        name
        decimals
        totalSupply
      }
      rewardToken {
        symbol
        name
        decimals
        totalSupply
      }
      stakedAmount
    }
  }
`

export function useSignelSidedStakeCampaigns(): {
  loading: boolean
  data: any
} {
  const hardcodedShit = '0x26358e62c2eded350e311bfde51588b8383a9315'

  const { data, loading, error } = useQuery<{
    singleSidedStakingCampaigns: SubgraphSingleSidedStakingCampaign[]
  }>(QUERY, {
    variables: {
      owner: hardcodedShit.toLowerCase()
    }
  })
  console.log('loading', loading)
  console.log('error', error)
  console.log(data)
  return useMemo(() => {
    if (loading) {
      return { loading: true, data: {} }
    }
    if (error || !data) {
      return { loading: false, data: {} }
    }

    // const wrappedCampaigns = []
    // for (let i = 0; i < data.singleSidedStakeCampaigns.length; i++) {
    //   console.log('here', i)
    //   const camapaign = data.singleSidedStakeCampaigns[i]
    //   wrappedCampaigns.push({
    //     owner: camapaign.owner,
    //     stakeToken: {
    //       symbol: camapaign.stakeToken.symbol,
    //       name: camapaign.stakeToken.name,
    //       decimals: camapaign.stakeToken.decimals,
    //       totalSupply: camapaign.stakeToken.totalSupply
    //     }
    //   })
    // }
    console.log('shitherad', data)
    const wrapped = data.singleSidedStakingCampaigns[0]
    console.log('wrappedCampaigns', wrapped)
    return { loading: false, data: wrapped }
  }, [data, loading, error])
}
