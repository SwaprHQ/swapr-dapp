import { parseUnits } from '@ethersproject/units'
import { JSBI, Pair, parseBigintIsh, Percent, Price, PricedToken, PricedTokenAmount, TokenAmount } from '@swapr/sdk'

import Decimal from 'decimal.js-light'
import { useMemo } from 'react'

import { useGetPairQuery } from '../graphql/generated/schema'
import type { Pair as PairType } from '../graphql/generated/schema'
import { useNativeCurrency } from './useNativeCurrency'
import { useWeb3ReactCore } from './useWeb3ReactCore'

export function useLpTokensUnderlyingAssets(
  pair?: Pair,
  lpTokensBalance?: TokenAmount
): { loading: boolean; underlyingAssets?: { token0: PricedTokenAmount; token1: PricedTokenAmount } } {
  const { chainId } = useWeb3ReactCore()
  const nativeCurrency = useNativeCurrency()
  const { data, loading, error } = useGetPairQuery({
    variables: {
      pairId: pair ? pair.liquidityToken.address.toLowerCase() : '',
    },
  })

  return useMemo(() => {
    if (loading) return { loading: true, underlyingAssets: undefined }
    if (error || !data || !chainId || !pair || !lpTokensBalance) return { loading: false, underlyingAssets: undefined }

    const { reserve0, reserve1, totalSupply, token0, token1 } = data.pair as PairType
    const lpTokenDecimals = pair.liquidityToken.decimals // should always be 18, but we explicitly declare this for added safety
    const userPoolShare = new Percent(
      lpTokensBalance.raw.toString(),
      parseUnits(totalSupply, lpTokenDecimals).toString()
    )

    const token0NativeCurrencyPrice = new Price({
      baseCurrency: pair.token0,
      quoteCurrency: nativeCurrency,
      denominator: parseUnits('1', nativeCurrency.decimals).toString(),
      numerator: parseUnits(
        new Decimal(token0.derivedNativeCurrency).toFixed(nativeCurrency.decimals),
        nativeCurrency.decimals
      ).toString(),
    })
    const pricedToken0 = new PricedToken(
      chainId,
      pair.token0.address,
      pair.token0.decimals,
      token0NativeCurrencyPrice,
      pair.token0.symbol,
      pair.token0.name
    )
    const rawReserve0Amount = parseUnits(
      new Decimal(reserve0).toFixed(pair.token0.decimals),
      pair.token0.decimals
    ).toString()
    const token0AmountNumerator = JSBI.multiply(parseBigintIsh(rawReserve0Amount), userPoolShare.numerator)
    const token0Amount = new PricedTokenAmount(
      pricedToken0,
      JSBI.divide(token0AmountNumerator, userPoolShare.denominator)
    )

    const token1NativeCurrencyPrice = new Price({
      baseCurrency: pair.token1,
      quoteCurrency: nativeCurrency,
      denominator: parseUnits('1', nativeCurrency.decimals).toString(),
      numerator: parseUnits(
        new Decimal(token1.derivedNativeCurrency).toFixed(nativeCurrency.decimals),
        nativeCurrency.decimals
      ).toString(),
    })
    const pricedToken1 = new PricedToken(
      chainId,
      pair.token1.address,
      pair.token1.decimals,
      token1NativeCurrencyPrice,
      pair.token1.symbol,
      pair.token1.name
    )
    const rawReserve1Amount = parseUnits(
      new Decimal(reserve1).toFixed(pair.token1.decimals),
      pair.token1.decimals
    ).toString()
    const token1AmountNumerator = JSBI.multiply(parseBigintIsh(rawReserve1Amount), userPoolShare.numerator)
    const token1Amount = new PricedTokenAmount(
      pricedToken1,
      JSBI.divide(token1AmountNumerator, userPoolShare.denominator)
    )

    return {
      loading: false,
      underlyingAssets: {
        token0: token0Amount,
        token1: token1Amount,
      },
    }
  }, [chainId, data, error, loading, lpTokensBalance, nativeCurrency, pair])
}
