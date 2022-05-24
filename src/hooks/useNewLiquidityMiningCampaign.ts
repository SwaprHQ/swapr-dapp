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
import { useMemo } from 'react'
import { useActiveWeb3React } from '.'
import { useNativeCurrencyPricedTokenAmounts } from './useTokensDerivedNativeCurrency'

import { useNativeCurrency } from './useNativeCurrency'

import { parseUnits } from 'arb-ts/node_modules/@ethersproject/units'

import Decimal from 'decimal.js-light'

export function useNewLiquidityMiningCampaign(
  targetedPairOrToken: Pair | Token | null,
  rewards: TokenAmount[],
  startTime: Date | null,
  endTime: Date | null,
  locked: boolean,
  stakingCap: TokenAmount | null,
  simulatedStakedAmount: string,
  simulatedPrice: string
): LiquidityMiningCampaign | SingleSidedLiquidityMiningCampaign | null {
  const { chainId } = useActiveWeb3React()

  const nativeCurrency = useNativeCurrency()
  const { pricedTokenAmounts: pricedRewardAmounts } = useNativeCurrencyPricedTokenAmounts(rewards)

  return useMemo(() => {
    if (
      !chainId ||
      !targetedPairOrToken ||
      pricedRewardAmounts.length === 0 ||
      !startTime ||
      !endTime ||
      pricedRewardAmounts.length !== rewards.length
    )
      return null
    const formattedStartTime = Math.floor(startTime.getTime() / 1000).toString()
    const formattedEndTime = Math.floor(endTime.getTime() / 1000).toString()
    const derivedToken = targetedPairOrToken instanceof Pair ? targetedPairOrToken.liquidityToken : targetedPairOrToken
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
    const stakeToken = new PricedToken(chainId, address, decimals, derivedNative, symbol, name)
    const staked = new PricedTokenAmount(stakeToken, simulatedStakedAmount)

    if (targetedPairOrToken instanceof Pair) {
      return new LiquidityMiningCampaign({
        startsAt: formattedStartTime,
        endsAt: formattedEndTime,
        targetedPair: targetedPairOrToken,
        rewards: pricedRewardAmounts,
        staked,
        locked,
        stakingCap: stakingCap || new TokenAmount(targetedPairOrToken.liquidityToken, '0'),
      })
    } else if (targetedPairOrToken instanceof Token) {
      return new SingleSidedLiquidityMiningCampaign(
        formattedStartTime,
        formattedEndTime,
        targetedPairOrToken,
        pricedRewardAmounts,
        staked,
        locked,
        stakingCap || new TokenAmount(targetedPairOrToken, '0')
      )
    } else {
      return null
    }
  }, [
    simulatedPrice,
    chainId,
    targetedPairOrToken,
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
