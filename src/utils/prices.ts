import { parseUnits } from '@ethersproject/units'
import {
  _100,
  _10000,
  BigintIsh,
  CoWTrade,
  Currency,
  CurrencyAmount,
  CurveTrade,
  Fraction,
  JSBI,
  Pair,
  Percent,
  Price,
  Token,
  TokenAmount,
  Trade,
  UniswapTrade,
  UniswapV2Trade,
  ZERO,
  ZeroXTrade,
} from '@swapr/sdk'

import _Decimal from 'decimal.js-light'
import { BigNumber, BigNumberish } from 'ethers'
import toFormat from 'toformat'

import {
  ALLOWED_FIAT_PRICE_IMPACT_HIGH,
  ALLOWED_PRICE_IMPACT_HIGH,
  ALLOWED_PRICE_IMPACT_LOW,
  ALLOWED_PRICE_IMPACT_MEDIUM,
  BLOCKED_PRICE_IMPACT_NON_EXPERT,
  NO_PRICE_IMPACT,
  PRICE_IMPACT_HIGH,
  PRICE_IMPACT_LOW,
  PRICE_IMPACT_MEDIUM,
  PRICE_IMPACT_NON_EXPERT,
  PriceImpact,
} from '../constants'
import { useTotalSupply } from '../data/TotalSupply'
import { useCoingeckoUSDPrice } from '../hooks/useUSDValue'
import { tryParseAmount } from '../state/swap/hooks'
import { Field } from '../state/swap/types'
import { wrappedCurrency, wrappedCurrencyAmount } from './wrappedCurrency'

import { formatCurrencyAmount } from '.'

const Decimal = toFormat(_Decimal)

const ONE_HUNDRED_PERCENT = new Percent(_10000, _10000)

interface TradePriceBreakdown {
  priceImpactWithoutFee?: Percent
  realizedLPFee?: Percent
  realizedLPFeeAmount?: CurrencyAmount
}

// computes price breakdown for the trade
export function computeTradePriceBreakdown(trade?: Trade): TradePriceBreakdown {
  // early exit
  if (!trade) {
    return {}
  }

  // for each hop in our trade, take away the x*y=k price impact from 0.3% fees
  // e.g. for 3 tokens/2 hops: 1 - ((1 - .03) * (1-.03))
  const realizedLPFee: Percent | undefined = computeRealizedLPFee(trade)

  function computeRealizedLPFee(trade: Trade) {
    if (trade instanceof UniswapV2Trade) {
      const totalRoutesFee = trade.route.pairs.reduce<Fraction>(
        (currentFee: Fraction, currentIndex: Pair): Fraction => {
          return currentFee.multiply(
            ONE_HUNDRED_PERCENT.subtract(new Percent(JSBI.BigInt(currentIndex.swapFee.toString()), _10000))
          )
        },
        ONE_HUNDRED_PERCENT
      )
      return ONE_HUNDRED_PERCENT.subtract(totalRoutesFee)
    } else if (trade instanceof CoWTrade || trade instanceof UniswapTrade || trade instanceof ZeroXTrade) {
      return trade.fee
    } else if (trade instanceof CurveTrade) {
      return ONE_HUNDRED_PERCENT.subtract(ONE_HUNDRED_PERCENT.subtract(trade.fee))
    } else return undefined
  }
  // remove lp fees from price impact
  const priceImpactWithoutFeeFraction = trade && realizedLPFee ? trade.priceImpact.subtract(realizedLPFee) : undefined

  // the x*y=k impact
  const priceImpactWithoutFeePercent = priceImpactWithoutFeeFraction
    ? new Percent(priceImpactWithoutFeeFraction?.numerator, priceImpactWithoutFeeFraction?.denominator)
    : undefined

  function computeRealizedLPFeeAmount(trade: Trade, realizedLPFee?: Fraction) {
    if (!realizedLPFee) return undefined

    if (trade instanceof CoWTrade) return (trade as CoWTrade).feeAmount
    else if (trade.inputAmount instanceof TokenAmount)
      return new TokenAmount(trade.inputAmount.token, realizedLPFee.multiply(trade.inputAmount.raw).quotient)
    else return CurrencyAmount.nativeCurrency(realizedLPFee.multiply(trade.inputAmount.raw).quotient, trade.chainId)
  }
  const realizedLPFeeAmount = computeRealizedLPFeeAmount(trade, realizedLPFee)

  return {
    priceImpactWithoutFee: priceImpactWithoutFeePercent,
    realizedLPFee: realizedLPFee ? new Percent(realizedLPFee.numerator, realizedLPFee.denominator) : undefined,
    realizedLPFeeAmount,
  }
}

// calculates teh protocol fee for a pair and amount
export function calculateProtocolFee(
  pair: Pair | null | undefined,
  amount?: CurrencyAmount,
  chainId?: number
): { protocolFee?: Fraction; protocolFeeAmount?: CurrencyAmount } {
  const protocolFee = pair ? new Percent(pair.swapFee, _100).divide(pair.protocolFeeDenominator) : undefined

  // the amount of the input that accrues to LPs
  const protocolFeeAmount =
    protocolFee && amount && chainId
      ? amount instanceof TokenAmount
        ? new TokenAmount(amount.token, protocolFee.multiply(amount.raw).divide(_10000).quotient)
        : CurrencyAmount.nativeCurrency(protocolFee.multiply(amount.raw).divide(_10000).quotient, chainId)
      : undefined

  return { protocolFee, protocolFeeAmount }
}

// computes the minimum amount out and maximum amount in for a trade given a user specified allowed slippage in bips
export function computeSlippageAdjustedAmounts(trade: Trade | undefined): { [field in Field]?: CurrencyAmount } {
  return {
    [Field.INPUT]: trade?.maximumAmountIn(),
    [Field.OUTPUT]: trade?.minimumAmountOut(),
  }
}

const ALLOWED_PRICE_IMPACT_PERCENTAGE: { [key: number]: Percent } = {
  [PRICE_IMPACT_NON_EXPERT]: BLOCKED_PRICE_IMPACT_NON_EXPERT,
  [PRICE_IMPACT_HIGH]: ALLOWED_PRICE_IMPACT_HIGH,
  [PRICE_IMPACT_MEDIUM]: ALLOWED_PRICE_IMPACT_MEDIUM,
  [PRICE_IMPACT_LOW]: ALLOWED_PRICE_IMPACT_LOW,
}

const ALLOWED_FIAT_PRICE_IMPACT_PERCENTAGE: { [key: number]: Percent } = {
  [PRICE_IMPACT_HIGH]: ALLOWED_FIAT_PRICE_IMPACT_HIGH,
}

export function warningSeverity(priceImpact: Percent | undefined): 0 | 1 | 2 | 3 | 4 {
  if (!priceImpact?.lessThan(ALLOWED_PRICE_IMPACT_PERCENTAGE[PRICE_IMPACT_NON_EXPERT])) return PRICE_IMPACT_NON_EXPERT
  if (!priceImpact?.lessThan(ALLOWED_PRICE_IMPACT_PERCENTAGE[PRICE_IMPACT_HIGH])) return PRICE_IMPACT_HIGH
  if (!priceImpact?.lessThan(ALLOWED_PRICE_IMPACT_PERCENTAGE[PRICE_IMPACT_MEDIUM])) return PRICE_IMPACT_MEDIUM
  if (!priceImpact?.lessThan(ALLOWED_PRICE_IMPACT_PERCENTAGE[PRICE_IMPACT_LOW])) return PRICE_IMPACT_LOW
  return NO_PRICE_IMPACT
}

export function warningSeverityZap(
  priceImpactTrade0: Percent | undefined,
  priceImpactTrade1: Percent | undefined
): PriceImpact {
  const severityTrade0 = warningSeverity(priceImpactTrade0)
  const severityTrade1 = warningSeverity(priceImpactTrade1)
  console.log('zap price impact sev', severityTrade0, severityTrade1)
  if (severityTrade0 === 4 || severityTrade1 === 4) return PriceImpact.ONLY_EXPERT
  if (severityTrade0 === 3 || severityTrade1 === 3) return PriceImpact.HIGH
  if (severityTrade0 === 2 || severityTrade1 === 2) return PriceImpact.MEDIUM
  if (severityTrade0 === 1 || severityTrade1 === 1) return PriceImpact.LOW
  return PriceImpact.NO_IMPACT
}

export function simpleWarningSeverity(priceImpact: Percent | undefined): 0 | 3 {
  if (!priceImpact?.lessThan(ALLOWED_FIAT_PRICE_IMPACT_PERCENTAGE[PRICE_IMPACT_HIGH])) return PRICE_IMPACT_HIGH
  return NO_PRICE_IMPACT
}

export function formatExecutionPrice(trade?: Trade, inverted?: boolean): string {
  if (!trade) {
    return ''
  }
  return inverted
    ? `${trade.executionPrice.invert().toSignificant(6)} ${trade.inputAmount.currency.symbol} / ${
        trade.outputAmount.currency.symbol
      }`
    : `${trade.executionPrice.toSignificant(6)} ${trade.outputAmount.currency.symbol} / ${
        trade.inputAmount.currency.symbol
      }`
}

export function sortTradesByExecutionPrice(trades: (Trade | undefined)[]): (Trade | undefined)[] {
  return trades.sort((a, b) => {
    if (a === undefined || a === null) {
      return 1
    }
    if (b === undefined || b === null) {
      return -1
    }

    if (a.executionPrice.lessThan(b.executionPrice)) {
      return 1
    } else if (a.executionPrice.equalTo(b.executionPrice)) {
      return 0
    } else {
      return -1
    }
  })
}

export function getLpTokenPrice(
  pair: Pair,
  nativeCurrency: Currency,
  totalSupply: string,
  reserveNativeCurrency: string
): Price {
  const decimalTotalSupply = new Decimal(totalSupply)
  // the following check avoids division by zero when total supply is zero
  // (case in which a pair has been created but liquidity has never been proviided)
  const priceDenominator = decimalTotalSupply.isZero()
    ? '1'
    : parseUnits(
        new Decimal(totalSupply).toFixed(pair.liquidityToken.decimals),
        pair.liquidityToken.decimals
      ).toString()
  return new Price({
    baseCurrency: pair.liquidityToken,
    quoteCurrency: nativeCurrency,
    denominator: priceDenominator,
    numerator: parseUnits(
      new Decimal(reserveNativeCurrency).toFixed(nativeCurrency.decimals),
      nativeCurrency.decimals
    ).toString(),
  })
}

/**
 * Returns trimmed fraction value to limit number of decimal places
 * @param value Fraction value to trim
 * @param significantDigits Limit number of decimal places
 * @param rounding Rounding mode
 */
export const limitNumberOfDecimalPlaces = (
  value?: CurrencyAmount | Fraction,
  significantDigits = 6,
  format = { groupSeparator: '' },
  rounding = Decimal.ROUND_DOWN
): string | undefined => {
  if (!value || value.equalTo(ZERO)) return undefined
  if (value instanceof CurrencyAmount && value.currency.decimals < significantDigits)
    significantDigits =
      typeof value.currency.decimals === 'string' ? parseInt(value.currency.decimals) : value.currency.decimals

  const fixedQuotient = value.toFixed(significantDigits)
  Decimal.set({ precision: significantDigits + 1, rounding })
  const quotient = new Decimal(fixedQuotient).toSignificantDigits(6)

  return quotient.toFormat(quotient.decimalPlaces(), format)
}

export const calculateZapInAmounts = (
  amountFrom: CurrencyAmount,
  pair: Pair,
  pairTotalSupply: TokenAmount,
  priceToken0TokenFrom: Price,
  priceToken1TokenFrom: Price,
  chainId: number
): {
  amountFromForTokenA?: CurrencyAmount
  amountFromForTokenB?: CurrencyAmount
  amountAddLpTokenA?: CurrencyAmount
  amountAddLpTokenB?: CurrencyAmount
  liquidityMinted?: TokenAmount
} => {
  const significantDigits = amountFrom.currency.decimals < 9 ? amountFrom.currency.decimals : 9

  const pairPrice = Number(pair.token1Price.toFixed(significantDigits))
  const token0TokenFromPrice = Number(priceToken0TokenFrom.toFixed(significantDigits))
  const token1TokenFromPrice = Number(priceToken1TokenFrom.toFixed(significantDigits))
  const amountFromBN = Number(amountFrom.toFixed(significantDigits))

  const rawLpAmountB = Number(
    (amountFromBN / (pairPrice * token0TokenFromPrice + token1TokenFromPrice)).toFixed(significantDigits)
  )
  const rawLpAmountA = Number((rawLpAmountB * pairPrice).toFixed(significantDigits))

  const rawFromForB = rawLpAmountB * token1TokenFromPrice
  const rawFromForA = amountFromBN - rawFromForB

  // amounts of input token which should be used to buy tokenA and tokenB
  // amountFrom = amountFromForTokenA + amountFromForTokenB
  const amountFromForTokenA = tryParseAmount(rawFromForA.toFixed(significantDigits), amountFrom.currency, chainId)
  const amountFromForTokenB = tryParseAmount(rawFromForB.toFixed(significantDigits), amountFrom.currency, chainId)

  // amounts of tokenA and tokenB which should be used to add liquidity accordingly
  const amountAddLpTokenA = tryParseAmount(rawLpAmountA.toFixed(significantDigits), pair.token0, chainId)
  const amountAddLpTokenB = tryParseAmount(rawLpAmountB.toFixed(significantDigits), pair.token1, chainId)

  const [tokenAmountA, tokenAmountB] = [
    wrappedCurrencyAmount(amountAddLpTokenA, chainId),
    wrappedCurrencyAmount(amountAddLpTokenB, chainId),
  ]
  // estimated amount of LP tokens received after zap in
  const liquidityMinted =
    tokenAmountA && tokenAmountB && tokenAmountA.greaterThan('0') && tokenAmountB.greaterThan('0')
      ? pair.getLiquidityMinted(pairTotalSupply, tokenAmountA, tokenAmountB)
      : undefined

  console.log('zap pair:', pair)
  console.log('zap:', amountFrom.currency.symbol, amountFromBN, ' was given. Significant', significantDigits)
  console.log(
    'zap:',
    amountAddLpTokenA?.toFixed(),
    pair.token0.symbol,
    ' will be LP. Bought for',
    amountFromForTokenA?.toFixed()
  )
  console.log(
    'zap:',
    amountAddLpTokenB?.toFixed(),
    pair.token1.symbol,
    ' will be LP. Bought for',
    amountFromForTokenB?.toFixed()
  )
  console.log('zap total LP', liquidityMinted?.toExact())

  return { amountAddLpTokenA, amountAddLpTokenB, amountFromForTokenA, amountFromForTokenB, liquidityMinted }
}

// export const calculateZapOutAmounts = (
//   amountFrom: CurrencyAmount,
//   pair: Pair,
//   pairTotalSupply: TokenAmount,
//   priceToken0TokenFrom: Price,
//   priceToken1TokenFrom: Price,
//   chainId: number
// ): {
//   amountTo?: TokenAmount
// } => {
//   const significantDigits = amountFrom.currency.decimals < 9 ? amountFrom.currency.decimals : 9

//   const pairPrice = Number(pair.token1Price.toFixed(significantDigits))
//   const token0TokenFromPrice = Number(priceToken0TokenFrom.toFixed(significantDigits))
//   const token1TokenFromPrice = Number(priceToken1TokenFrom.toFixed(significantDigits))
//   const amountFromBN = Number(amountFrom.toFixed(significantDigits))

//   const [tokenA, tokenB] = [wrappedCurrency(currencyA, chainId), wrappedCurrency(currencyB, chainId)]

//   const liquidityValueA =
//     pair &&
//     pairTotalSupply &&
//     userLiquidity &&
//     tokenA &&
//     // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
//     JSBI.greaterThanOrEqual(pairTotalSupply.raw, userLiquidity.raw)
//       ? new TokenAmount(tokenA, pair.getLiquidityValue(tokenA, pairTotalSupply, userLiquidity, false).raw)
//       : undefined
//   const liquidityValueB =
//     pair &&
//     pairTotalSupply &&
//     userLiquidity &&
//     tokenB &&
//     // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
//     JSBI.greaterThanOrEqual(pairTotalSupply.raw, userLiquidity.raw)
//       ? new TokenAmount(tokenB, pair.getLiquidityValue(tokenB, pairTotalSupply, userLiquidity, false).raw)
//       : undefined
//   const liquidityValues: { [Field.CURRENCY_A]?: TokenAmount; [Field.CURRENCY_B]?: TokenAmount } = {
//     [Field.CURRENCY_A]: liquidityValueA,
//     [Field.CURRENCY_B]: liquidityValueB,
//   }

//   return {}
// }
