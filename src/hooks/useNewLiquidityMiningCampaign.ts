import {
  LiquidityMiningCampaign,
  Pair,
  Price,
  PricedToken,
  PricedTokenAmount,
  SingleSidedLiquidityMiningCampaign,
  Token,
  TokenAmount
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
  targetedPairOrToken: Pair | Token | null,
  rewards: TokenAmount[],
  startTime: Date | null,
  endTime: Date | null,
  locked: boolean,
  stakingCap: TokenAmount | null,
  simulatedStakedAmount?: string | null
): LiquidityMiningCampaign | SingleSidedLiquidityMiningCampaign | null {
  const { chainId } = useActiveWeb3React()
  //const isPair = targetedPairOrToken instanceof Pair
  //const isToken = targetedPairOrToken instanceof Token
  const tokenDerivedNative = useTokenDerivedNativeCurrency(
    targetedPairOrToken instanceof Token ? targetedPairOrToken : undefined
  )

  const nativeCurrency = useNativeCurrency()
  const { pricedTokenAmounts: pricedRewardAmounts } = useNativeCurrencyPricedTokenAmounts(rewards)
  const lpTokenTotalSupply = usePairLiquidityTokenTotalSupply(
    targetedPairOrToken instanceof Pair ? targetedPairOrToken : undefined
  )

  const { reserveNativeCurrency: targetedPairReserveNativeCurrency } = usePairReserveNativeCurrency(
    targetedPairOrToken instanceof Pair ? targetedPairOrToken : undefined
  )

  return useMemo(() => {
    if (!chainId || !targetedPairOrToken || pricedRewardAmounts.length === 0 || !startTime || !endTime) return null
    const formattedStartTime = Math.floor(startTime.getTime() / 1000).toString()
    const formattedEndTime = Math.floor(endTime.getTime() / 1000).toString()
    if (targetedPairOrToken instanceof Pair && lpTokenTotalSupply) {
      const { address, symbol, name, decimals } = targetedPairOrToken.liquidityToken
      const lpTokenNativeCurrencyPrice = getLpTokenPrice(
        targetedPairOrToken,
        nativeCurrency,
        lpTokenTotalSupply.raw.toString(),
        targetedPairReserveNativeCurrency.raw.toString()
      )
      console.log('Native price-NewCampaing', lpTokenNativeCurrencyPrice.toSignificant(10))
      const lpToken = new PricedToken(chainId, address, decimals, lpTokenNativeCurrencyPrice, symbol, name)
      const staked = new PricedTokenAmount(lpToken, simulatedStakedAmount ? simulatedStakedAmount : '0')

      return new LiquidityMiningCampaign(
        formattedStartTime,
        formattedEndTime,
        targetedPairOrToken,
        pricedRewardAmounts,
        staked,
        locked,
        stakingCap || new TokenAmount(targetedPairOrToken.liquidityToken, '0')
      )
    } else if (targetedPairOrToken instanceof Token && tokenDerivedNative.derivedNativeCurrency) {
      const { address, symbol, name, decimals } = targetedPairOrToken

      const derivedNative = new Price(
        targetedPairOrToken,
        nativeCurrency,
        parseUnits('1', nativeCurrency.decimals).toString(),
        parseUnits(
          new Decimal(tokenDerivedNative.derivedNativeCurrency.toFixed()).toFixed(nativeCurrency.decimals),
          nativeCurrency.decimals
        ).toString()
      )

      const stakeToken = new PricedToken(chainId, getAddress(address), decimals, derivedNative, symbol, name)

      const staked = new PricedTokenAmount(stakeToken, simulatedStakedAmount ? simulatedStakedAmount : '0')

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
    tokenDerivedNative,
    chainId,
    targetedPairOrToken,
    lpTokenTotalSupply,
    simulatedStakedAmount,
    pricedRewardAmounts,
    startTime,
    endTime,
    stakingCap,
    nativeCurrency,
    targetedPairReserveNativeCurrency.raw,
    locked
  ])
}
