import { parseUnits } from '@ethersproject/units'
import { Pair, Price, Token } from '@swapr/sdk'

import Decimal from 'decimal.js-light'
import { useMemo } from 'react'

import { usePairLiquidityTokenTotalSupply } from '../data/Reserves'
import { getLpTokenPrice } from '../utils/prices'
import { useNativeCurrency } from './useNativeCurrency'
import { usePairReserveNativeCurrency } from './usePairReserveNativeCurrency'
import { useTokenDerivedNativeCurrency } from './useTokenDerivedNativeCurrency'

import { useActiveWeb3React } from '.'

export function useTokenOrPairNativeCurrency(
  tokenOrPair?: Token | Pair
): { loading: boolean; derivedNativeCurrency?: Price } {
  const { chainId } = useActiveWeb3React()
  const nativeCurrency = useNativeCurrency()
  const isToken = tokenOrPair instanceof Token
  const lpTokenTotalSupply = usePairLiquidityTokenTotalSupply(tokenOrPair instanceof Pair ? tokenOrPair : undefined)

  const {
    reserveNativeCurrency: targetedPairReserveNativeCurrency,
    loading: loadingReserveNative,
  } = usePairReserveNativeCurrency(tokenOrPair instanceof Pair ? tokenOrPair : undefined)
  const { loading: loadingTokenNativeCurrency, derivedNativeCurrency } = useTokenDerivedNativeCurrency(
    tokenOrPair instanceof Token ? tokenOrPair : undefined
  )

  return useMemo(() => {
    if (!tokenOrPair || !chainId || (isToken ? loadingTokenNativeCurrency : loadingReserveNative))
      return { loading: true, derivedNativeCurrency: undefined }

    if ((isToken && !derivedNativeCurrency) || (!isToken && lpTokenTotalSupply === null))
      return { loading: false, derivedNativeCurrency: undefined }

    let derivedNative: Price | undefined
    if (tokenOrPair instanceof Token) {
      derivedNative = new Price({
        baseCurrency: tokenOrPair,
        quoteCurrency: nativeCurrency,
        denominator: parseUnits('1', nativeCurrency.decimals).toString(),
        numerator: parseUnits(
          new Decimal(derivedNativeCurrency.toSignificant(22)).toFixed(nativeCurrency.decimals),
          nativeCurrency.decimals
        ).toString(),
      })
    } else if (lpTokenTotalSupply && tokenOrPair instanceof Pair) {
      derivedNative = getLpTokenPrice(
        tokenOrPair,
        nativeCurrency,
        lpTokenTotalSupply.raw.toString(),
        targetedPairReserveNativeCurrency.raw.toString()
      )
    }
    return {
      loading: false,
      derivedNativeCurrency: derivedNative,
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
    tokenOrPair,
  ])
}
