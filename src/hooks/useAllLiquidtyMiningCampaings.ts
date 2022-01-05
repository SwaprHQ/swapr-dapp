import { gql, useQuery } from '@apollo/client'

import { Pair, Token, TokenAmount } from '@swapr/sdk'

import { useMemo } from 'react'
import { useActiveWeb3React } from '.'
import { SubgraphLiquidityMiningCampaign, SubgraphSingleSidedStakingCampaign } from '../apollo'
import { useNativeCurrency } from './useNativeCurrency'

import { toLiquidityMiningCampaign, toSingleSidedStakeCampaign } from '../utils/liquidityMining'
import { DateTime, Duration } from 'luxon'
import { useAllTokensFromActiveListsOnCurrentChain } from '../state/lists/hooks'
import { getAddress, parseUnits } from 'ethers/lib/utils'
import { useKpiTokens } from './useKpiTokens'

// const QUERY = gql`
//   query($stakeToken: [ID!], $userId: ID) {
//     singleSidedStakingCampaigns() {
//       id
//       owner
//       startsAt
//       endsAt
//       duration
//       locked
//       stakeToken {
//         id
//         symbol
//         name
//         decimals
//         totalSupply
//         derivedNativeCurrency
//       }
//       rewards {
//         token {
//           address: id
//           name
//           symbol
//           decimals
//           derivedNativeCurrency
//         }
//         amount
//       }
//       singleSidedStakingPositions(where: { stakedAmount_gt: 0, user: $userId }) {
//         id
//       }
//       stakedAmount
//       stakingCap
//     }
//   }
// `

const QUERY2 = gql`
  query($userId: ID) {
    singleSidedStakingCampaigns {
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
const REGULAR_CAMPAIGN = gql`
  query($userId: ID) {
    liquidityMiningCampaigns {
      address: id
      duration
      startsAt
      endsAt
      locked
      stakingCap
      rewards {
        token {
          derivedNativeCurrency
          address: id
          name
          symbol
          decimals
        }
        amount
      }
      stakablePair {
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

      stakedAmount
      liquidityMiningPositions(where: { stakedAmount_gt: 0, user: $userId }) {
        id
      }
    }
  }
`

export function useAllLiquidtyMiningCampaings(
  pair?: any
): {
  loading: boolean
  singleSidedCampaings: any
} {
  //const hardcodedShit = '0x26358e62c2eded350e311bfde51588b8383a9315'
  console.log(pair)
  const { chainId, account } = useActiveWeb3React()
  const nativeCurrency = useNativeCurrency()
  const timestamp = useMemo(() => Math.floor(Date.now() / 1000), [])
  const lowerTimeLimit = DateTime.utc()
    .minus(Duration.fromObject({ days: 30 }))
    .toJSDate()

  const memoizedLowerTimeLimit = useMemo(() => Math.floor(lowerTimeLimit.getTime() / 1000), [lowerTimeLimit])
  const tokensInCurrentChain = useAllTokensFromActiveListsOnCurrentChain()

  const { data: singleSidedCampaings, loading: singleSidedLoading, error: singleSidedCampaingsError } = useQuery<{
    singleSidedStakingCampaigns: SubgraphSingleSidedStakingCampaign[]
  }>(QUERY2, {
    variables: {
      userId: account
    }
  })
  console.log(singleSidedCampaings)
  console.log(singleSidedCampaingsError)
  console.log(singleSidedLoading)
  const { data: pairCampaings, loading: campaingLoading, error: campaingError } = useQuery<{
    liquidityMiningCampaigns: SubgraphLiquidityMiningCampaign[]
  }>(REGULAR_CAMPAIGN, {
    variables: {
      userId: account
    }
  })
  const kpiTokenAddresses = useMemo(() => {
    if (!pairCampaings) return []
    return pairCampaings.liquidityMiningCampaigns.flatMap(campaign =>
      campaign.rewards.map(reward => reward.token.address.toLowerCase())
    )
  }, [pairCampaings])
  const { loading: loadingKpiTokens, kpiTokens } = useKpiTokens(kpiTokenAddresses)
  console.log(campaingError)
  console.log(pairCampaings)

  return useMemo(() => {
    if (singleSidedLoading || chainId === undefined || campaingLoading) {
      return { loading: true, singleSidedCampaings: { active: [], expired: [] } }
    }
    if (
      singleSidedCampaingsError ||
      campaingError ||
      !singleSidedCampaings ||
      !singleSidedCampaings.singleSidedStakingCampaigns ||
      !pairCampaings ||
      !pairCampaings.liquidityMiningCampaigns ||
      loadingKpiTokens
    ) {
      return { loading: true, singleSidedCampaings: { active: [], expired: [] } }
    }
    const expiredCampaigns = []
    const activeCampaigns = []
    for (let i = 0; i < pairCampaings.liquidityMiningCampaigns.length; i++) {
      const camapaign = pairCampaings.liquidityMiningCampaigns[i]
      console.log(camapaign)
      // const stakeToken = new Token(
      //   chainId,
      //   camapaign.stakeToken.id,
      //   parseInt(camapaign.stakeToken.decimals),
      //   camapaign.stakeToken.symbol,
      //   camapaign.stakeToken.name
      // )
      const { reserveNativeCurrency, totalSupply, token0, token1, reserve0, reserve1 } = camapaign.stakablePair
      const containsKpiToken = !!camapaign.rewards.find(
        reward => !!kpiTokens.find(kpiToken => kpiToken.address.toLowerCase() === reward.token.address.toLowerCase())
      )
      const token0ChecksummedAddress = getAddress(token0.address)
      const tokenA =
        tokensInCurrentChain &&
        tokensInCurrentChain[token0ChecksummedAddress] &&
        tokensInCurrentChain[token0ChecksummedAddress].token
          ? tokensInCurrentChain[token0ChecksummedAddress].token
          : new Token(chainId, token0ChecksummedAddress, parseInt(token0.decimals), token0.symbol, token0.name)
      const tokenAmountA = new TokenAmount(tokenA, parseUnits(reserve0, token0.decimals).toString())
      const token1ChecksummedAddress = getAddress(token1.address)
      const tokenB =
        tokensInCurrentChain &&
        tokensInCurrentChain[token1ChecksummedAddress] &&
        tokensInCurrentChain[token1ChecksummedAddress].token
          ? tokensInCurrentChain[token1ChecksummedAddress].token
          : new Token(chainId, token1ChecksummedAddress, parseInt(token1.decimals), token1.symbol, token1.name)
      const tokenAmountB = new TokenAmount(tokenB, parseUnits(reserve1, token1.decimals).toString())
      const pair = new Pair(tokenAmountA, tokenAmountB)
      const liquditiyCampaing = toLiquidityMiningCampaign(
        chainId,
        pair,
        totalSupply,
        reserveNativeCurrency,
        kpiTokens,
        camapaign,
        nativeCurrency
      )
      const hasStake = pairCampaings.liquidityMiningCampaigns.length > 0
      const isExpired = parseInt(camapaign.endsAt) < timestamp || parseInt(camapaign.endsAt) > memoizedLowerTimeLimit

      if (liquditiyCampaing.currentlyActive) {
        activeCampaigns.push({ campaign: liquditiyCampaing, staked: hasStake, containsKpiToken: containsKpiToken })
      } else if (isExpired) {
        expiredCampaigns.push({ campaign: liquditiyCampaing, staked: hasStake, containsKpiToken: containsKpiToken })
      }
    }

    for (let i = 0; i < singleSidedCampaings.singleSidedStakingCampaigns.length; i++) {
      const camapaign = singleSidedCampaings.singleSidedStakingCampaigns[i]
      console.log(camapaign)
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
        if (isExpired)
          activeCampaigns.unshift({ campaign: singleSidedStakeCampaign, staked: hasStake, containsKpiToken: false })
        else activeCampaigns.push({ campaign: singleSidedStakeCampaign, staked: hasStake, containsKpiToken: false })
      } else if (isExpired) {
        expiredCampaigns.push({ campaign: singleSidedStakeCampaign, staked: hasStake, containsKpiToken: false })
      }
    }

    return {
      loading: false,
      singleSidedCampaings: { active: activeCampaigns, expired: expiredCampaigns }
    }
  }, [
    singleSidedCampaings,
    singleSidedLoading,
    singleSidedCampaingsError,
    chainId,
    nativeCurrency,
    timestamp,
    memoizedLowerTimeLimit,
    kpiTokens,
    tokensInCurrentChain,
    loadingKpiTokens,
    campaingLoading,
    campaingError,
    pairCampaings
  ])
}
