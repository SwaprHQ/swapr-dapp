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
import { useTotalSupply } from '../data/TotalSupply'
import { useTokenDerivedNativeCurrency } from './useTokenDerivedNativeCurrency'
import { parseUnits } from 'arb-ts/node_modules/@ethersproject/units'

import { getAddress } from 'ethers/lib/utils'

export function useNewLiquidityMiningCampaign(
  targetedPairOrToken: Pair | Token | null,
  rewards: TokenAmount[],
  startTime: Date | null,
  endTime: Date | null,
  locked: boolean,
  stakingCap: TokenAmount | null
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
  const tokenTotalSupply = useTotalSupply(targetedPairOrToken instanceof Token ? targetedPairOrToken : undefined)
  console.log(tokenTotalSupply)
  const { reserveNativeCurrency: targetedPairReserveNativeCurrency } = usePairReserveNativeCurrency()

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
      const lpToken = new PricedToken(chainId, address, decimals, lpTokenNativeCurrencyPrice, symbol, name)
      const staked = new PricedTokenAmount(lpToken, '0')
      return new LiquidityMiningCampaign(
        formattedStartTime,
        formattedEndTime,
        targetedPairOrToken,
        pricedRewardAmounts,
        staked,
        locked,
        stakingCap || new TokenAmount(targetedPairOrToken.liquidityToken, '0')
      )
    } else if (targetedPairOrToken instanceof Token && !tokenDerivedNative.loading) {
      const { address, symbol, name, decimals } = targetedPairOrToken
      //const stakeToken = new PricedToken(chainId, address, decimals, derivedNative, symbol, name)
      const derivedNative = new Price(
        targetedPairOrToken,
        nativeCurrency,
        parseUnits('1', nativeCurrency.decimals).toString(),
        tokenDerivedNative.derivedNativeCurrency.toString()
      )
      const stakeToken = new PricedToken(chainId, getAddress(address), decimals, derivedNative, symbol, name)

      const staked = new PricedTokenAmount(stakeToken, '0')
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
    pricedRewardAmounts,
    startTime,
    endTime,
    stakingCap,
    nativeCurrency,
    targetedPairReserveNativeCurrency.raw,
    locked
  ])
}
