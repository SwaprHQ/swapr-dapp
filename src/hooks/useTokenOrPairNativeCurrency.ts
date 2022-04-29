import { ChainId, Token, CurrencyAmount, Pair } from '@swapr/sdk'

import { useMemo } from 'react'
import { useActiveWeb3React } from '.'
import { useNativeCurrency } from './useNativeCurrency'
import { usePairLiquidityTokenTotalSupply } from '../data/Reserves'
import { usePairReserveNativeCurrency } from './usePairReserveNativeCurrency'
import { useTokenDerivedNativeCurrency } from './useTokenDerivedNativeCurrency'
import { getLpTokenPrice } from '../utils/prices'
import { ethers } from 'ethers'
import Decimal from 'decimal.js-light'

export function useTokenOrPairNativeCurrency(
  tokenOrPair?: Token | Pair
): { loading: boolean; derivedNativeCurrency: CurrencyAmount } {
  const { chainId } = useActiveWeb3React()
  const nativeCurrency = useNativeCurrency()
  const isToken = tokenOrPair instanceof Token
  const lpTokenTotalSupply = usePairLiquidityTokenTotalSupply(tokenOrPair instanceof Pair ? tokenOrPair : undefined)

  const {
    reserveNativeCurrency: targetedPairReserveNativeCurrency,
    loading: loadingReserveNative
  } = usePairReserveNativeCurrency(tokenOrPair instanceof Pair ? tokenOrPair : undefined)
  const { loading: loadingTokenNativeCurrency, derivedNativeCurrency } = useTokenDerivedNativeCurrency(
    tokenOrPair instanceof Token ? tokenOrPair : undefined
  )

  return useMemo(() => {
    if (!tokenOrPair || !chainId || (isToken ? loadingTokenNativeCurrency : loadingReserveNative))
      return { loading: true, derivedNativeCurrency: CurrencyAmount.nativeCurrency('0', chainId || ChainId.MAINNET) }

    if ((isToken && !derivedNativeCurrency) || (!isToken && lpTokenTotalSupply === null))
      return { loading: false, derivedNativeCurrency: CurrencyAmount.nativeCurrency('0', chainId) }

    let derivedNative: CurrencyAmount = CurrencyAmount.nativeCurrency('0', chainId)
    if (isToken) {
      derivedNative = derivedNativeCurrency
    } else if (lpTokenTotalSupply && tokenOrPair instanceof Pair) {
      const lpTokenNativeCurrencyPrice = getLpTokenPrice(
        tokenOrPair,
        nativeCurrency,
        lpTokenTotalSupply.raw.toString(),
        targetedPairReserveNativeCurrency.raw.toString()
      )

      derivedNative = CurrencyAmount.nativeCurrency(
        ethers.utils
          .parseUnits(
            new Decimal(lpTokenNativeCurrencyPrice.toSignificant(20)).toFixed(tokenOrPair.liquidityToken.decimals),
            nativeCurrency.decimals
          )
          .toString(),
        chainId
      )
    }
    return {
      loading: false,
      derivedNativeCurrency: derivedNative
    }
  }, [
    chainId,
    derivedNativeCurrency,
    isToken,
    nativeCurrency,
    lpTokenTotalSupply,
    loadingReserveNative,
    loadingTokenNativeCurrency,
    targetedPairReserveNativeCurrency,
    tokenOrPair
  ])
}
