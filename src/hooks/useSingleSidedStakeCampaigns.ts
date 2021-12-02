import { gql, useQuery } from '@apollo/client'
import { parseUnits } from '@ethersproject/units'
import { SWPR, Token, TokenAmount } from '@swapr/sdk'

import { useMemo } from 'react'
import { useActiveWeb3React } from '.'
import { SubgraphSingleSidedStakingCampaign } from '../apollo'

const QUERY = gql`
  query($address: ID) {
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
      }
      rewardToken {
        id
        symbol
        name
        decimals
        totalSupply
      }
      reward {
        token {
          id
          symbol
          name
          decimals
          totalSupply
        }
        amount
      }
      stakedAmount
      stakingCap
    }
  }
`

export function useSignelSidedStakeCampaigns(
  filterToken?: Token
): {
  loading: boolean
  data: any
  hasActiveCampaigns: boolean
} {
  //const hardcodedShit = '0x26358e62c2eded350e311bfde51588b8383a9315'
  const { chainId } = useActiveWeb3React()

  //using xeenus as token for rinkeby
  const swaprAddress = chainId === 4 ? '0x022e292b44b5a146f2e8ee36ff44d3dd863c915c' : SWPR[chainId || 1].address

  const { data, loading, error } = useQuery<{
    singleSidedStakingCampaigns: SubgraphSingleSidedStakingCampaign[]
  }>(QUERY, {
    variables: {
      address: swaprAddress.toLowerCase()
    }
  })

  return useMemo(() => {
    if (loading || chainId === undefined) {
      return { loading: true, data: {}, hasActiveCampaigns: false }
    }
    if (error || !data || (filterToken !== undefined && filterToken?.address.toLowerCase() !== swaprAddress)) {
      return { loading: false, data: {}, hasActiveCampaigns: false }
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

    const wrapped = data.singleSidedStakingCampaigns[0]
    const stakeToken = new Token(
      chainId,
      wrapped.stakeToken.id,
      parseInt(wrapped.stakeToken.decimals),
      wrapped.stakeToken.symbol,
      wrapped.stakeToken.name
    )
    const formattedData = {
      id: wrapped.id,
      locked: wrapped.locked,
      stakedAmount: wrapped.stakedAmount,
      owner: wrapped.owner,
      startsAt: wrapped.startsAt,
      endsAt: wrapped.endsAt,
      duration: wrapped.duration,
      stakingCap: new TokenAmount(stakeToken, parseUnits(wrapped.stakingCap, stakeToken.decimals).toString()),
      stakeToken: new Token(
        chainId,
        wrapped.stakeToken.id,
        parseInt(wrapped.stakeToken.decimals),
        wrapped.stakeToken.symbol,
        wrapped.stakeToken.name
      ),
      rewardToken: new Token(
        chainId,
        wrapped.rewardToken.id,
        parseInt(wrapped.rewardToken.decimals),
        wrapped.rewardToken.symbol,
        wrapped.rewardToken.name
      ),
      reward: {
        amount: wrapped.reward.amount,
        token: new Token(
          chainId,
          wrapped.reward.token.id,
          parseInt(wrapped.reward.token.decimals),
          wrapped.reward.token.symbol,
          wrapped.reward.token.name
        )
      }
    }

    return { loading: false, data: formattedData, hasActiveCampaigns: data.singleSidedStakingCampaigns.length !== 0 }
  }, [data, loading, error, filterToken, swaprAddress, chainId])
}
