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
import { usePairLiquidityTokenTotalSupply } from '../data/Reserves'
import { getLpTokenPrice } from '../utils/prices'
import { useNativeCurrency } from './useNativeCurrency'
import { usePairReserveNativeCurrency } from './usePairReserveNativeCurrency'

import { useTokenDerivedNativeCurrency } from './useTokenDerivedNativeCurrency'
import { parseUnits } from 'arb-ts/node_modules/@ethersproject/units'

import { getAddress } from 'ethers/lib/utils'
import Decimal from 'decimal.js-light'

export function useNewLiquidityMiningCampaign(
  rewards: TokenAmount[],
  startTime: Date | null,
  endTime: Date | null,
  locked: boolean,
  stakingCap: TokenAmount | null,
  simulatedStakedAmount: string,
  stakeToken?: Token,
  stakePair?: Pair
): LiquidityMiningCampaign | SingleSidedLiquidityMiningCampaign | null {
  const { chainId } = useActiveWeb3React()

  const tokenDerivedNative = useTokenDerivedNativeCurrency(stakeToken)

  const nativeCurrency = useNativeCurrency()
  const { pricedTokenAmounts: pricedRewardAmounts } = useNativeCurrencyPricedTokenAmounts(rewards)
  const lpTokenTotalSupply = usePairLiquidityTokenTotalSupply(stakePair)

  const { reserveNativeCurrency: targetedPairReserveNativeCurrency } = usePairReserveNativeCurrency(stakePair)

  return useMemo(() => {
    if (
      !chainId ||
      !(stakeToken || stakePair) ||
      pricedRewardAmounts.length === 0 ||
      !startTime ||
      !endTime ||
      pricedRewardAmounts.length !== rewards.length
    )
      return null
    const formattedStartTime = Math.floor(startTime.getTime() / 1000).toString()
    const formattedEndTime = Math.floor(endTime.getTime() / 1000).toString()
    if (stakePair && lpTokenTotalSupply) {
      const { address, symbol, name, decimals } = stakePair.liquidityToken
      const lpTokenNativeCurrencyPrice = getLpTokenPrice(
        stakePair,
        nativeCurrency,
        lpTokenTotalSupply.raw.toString(),
        targetedPairReserveNativeCurrency.raw.toString()
      )

      const lpToken = new PricedToken(chainId, address, decimals, lpTokenNativeCurrencyPrice, symbol, name)
      const staked = new PricedTokenAmount(lpToken, simulatedStakedAmount)

      return new LiquidityMiningCampaign({
        startsAt: formattedStartTime,
        endsAt: formattedEndTime,
        targetedPair: stakePair,
        rewards: pricedRewardAmounts,
        staked,
        locked,
        stakingCap: stakingCap || new TokenAmount(stakePair.liquidityToken, '0'),
      })
    } else if (stakeToken && tokenDerivedNative.derivedNativeCurrency) {
      const { address, symbol, name, decimals } = stakeToken

      const derivedNative = new Price({
        baseCurrency: stakeToken,
        quoteCurrency: nativeCurrency,
        denominator: parseUnits('1', nativeCurrency.decimals).toString(),
        numerator: parseUnits(
          new Decimal(tokenDerivedNative.derivedNativeCurrency.toFixed()).toFixed(nativeCurrency.decimals),
          nativeCurrency.decimals
        ).toString(),
      })

      const pricedStakeToken = new PricedToken(chainId, getAddress(address), decimals, derivedNative, symbol, name)

      const staked = new PricedTokenAmount(pricedStakeToken, simulatedStakedAmount)

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
    tokenDerivedNative,
    chainId,
    stakeToken,
    stakePair,
    lpTokenTotalSupply,
    simulatedStakedAmount,
    pricedRewardAmounts,
    startTime,
    rewards,
    endTime,
    stakingCap,
    nativeCurrency,
    targetedPairReserveNativeCurrency.raw,
    locked,
  ])
}
