import { parseUnits } from '@ethersproject/units'
import {
  LiquidityMiningCampaign,
  Pair,
  Price,
  PricedToken,
  PricedTokenAmount,
  SingleSidedLiquidityMiningCampaign,
  Token,
  TokenAmount,
} from '@swapr/sdk'

import Decimal from 'decimal.js-light'
import { useMemo } from 'react'

import { useNativeCurrency } from './useNativeCurrency'
import { useNativeCurrencyPricedTokenAmounts } from './useTokensDerivedNativeCurrency'

import { useActiveWeb3React } from '.'

export function useNewLiquidityMiningCampaign(
  rewards: TokenAmount[],
  startTime: Date | null,
  endTime: Date | null,
  locked: boolean,
  stakingCap: TokenAmount | null,
  simulatedStakedAmount: string,
  simulatedPrice: string,
  stakeToken?: Token,
  stakePair?: Pair
): LiquidityMiningCampaign | SingleSidedLiquidityMiningCampaign | null {
  const { chainId } = useActiveWeb3React()

  const nativeCurrency = useNativeCurrency()
  const { pricedTokenAmounts: pricedRewardAmounts } = useNativeCurrencyPricedTokenAmounts(rewards)

  return useMemo(() => {
    const derivedToken = stakeToken ? stakeToken : stakePair?.liquidityToken
    if (
      !chainId ||
      derivedToken === undefined ||
      pricedRewardAmounts.length === 0 ||
      !startTime ||
      !endTime ||
      pricedRewardAmounts.length !== rewards.length
    ) {
      return null
    }

    const formattedStartTime = Math.floor(startTime.getTime() / 1000).toString()
    const formattedEndTime = Math.floor(endTime.getTime() / 1000).toString()

    const { address, symbol, name, decimals } = derivedToken

    const tokenNativePrice = simulatedPrice.length === 0 ? '0' : simulatedPrice
    const derivedNative = new Price({
      baseCurrency: derivedToken,
      quoteCurrency: nativeCurrency,
      denominator: parseUnits('1', nativeCurrency.decimals).toString(),
      numerator: parseUnits(
        new Decimal(tokenNativePrice).toFixed(nativeCurrency.decimals),
        nativeCurrency.decimals
      ).toString(),
    })
    const pricedToken = new PricedToken(chainId, address, decimals, derivedNative, symbol, name)
    const staked = new PricedTokenAmount(pricedToken, simulatedStakedAmount)

    if (stakePair) {
      return new LiquidityMiningCampaign({
        startsAt: formattedStartTime,
        endsAt: formattedEndTime,
        targetedPair: stakePair,
        rewards: pricedRewardAmounts,
        staked,
        locked,
        stakingCap: stakingCap || new TokenAmount(stakePair.liquidityToken, '0'),
      })
    } else if (stakeToken) {
      return new SingleSidedLiquidityMiningCampaign(
        formattedStartTime,
        formattedEndTime,
        stakeToken,
        pricedRewardAmounts,
        staked,
        locked,
        stakingCap || new TokenAmount(stakeToken, '0')
      )
    } else {
      return null
    }
  }, [
    simulatedPrice,
    chainId,
    stakeToken,
    stakePair,

    simulatedStakedAmount,
    pricedRewardAmounts,
    startTime,
    rewards,
    endTime,
    stakingCap,
    nativeCurrency,
    locked,
  ])
}
