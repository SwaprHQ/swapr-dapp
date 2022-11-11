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
import { BigNumber } from 'ethers'
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
import { useCoingeckoUSDPrice } from '../hooks/useUSDValue'
import { tryParseAmount } from '../state/swap/hooks'
import { Field } from '../state/swap/types'

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
  priceAC: Price,
  priceBC: Price,
  chainId: number
): { amountA: BigNumber; amountB: BigNumber } => {
  const significantDigits = amountFrom.currency.decimals < 9 ? amountFrom.currency.decimals : 9
  const reserveA = pair.reserve0
  const reserveB = pair.reserve1
  // const a = priceAC.divide(priceBC)
  const b = reserveA.divide(reserveB)
  // const x = a.multiply(b)
  // const decimals0 = pair.token0.decimals

  // const pairPrice = parseUnits(pair.token1Price.toFixed(), 6)
  // const pac = parseUnits(priceAC.toFixed(), 6)
  // const pbc = parseUnits(priceBC.toFixed(), 6)
  // const amountFromBN = parseUnits(amountFrom.toFixed(), 6)

  // const pac = parseUnits(new Decimal(priceAC.toFixed()).toFixed(18), 18).toString()
  // const pbc = BigNumber.from(priceBC.toFixed())
  // const pairPrice = BigNumber.from(pair.token1Price.toFixed())

  const pairPrice = Number(pair.token1Price.toFixed(significantDigits))
  const pac = Number(priceAC.toFixed(significantDigits))
  const pbc = Number(priceBC.toFixed(significantDigits))
  const amountFromBN = Number(amountFrom.toFixed(significantDigits))

  // console.log(
  //   'tst',
  //   pair,
  //   pair.token0.symbol,
  //   pair.token1.symbol,
  //   pair.token0Price.toFixed(),
  //   pair.token1Price.toFixed()
  // )
  // console.log(
  //   'tst p',
  //   formatCurrencyAmount(amountFrom),
  //   amountFrom.toFixed(),
  //   pair.token0Price.toFixed(),
  //   pair.token1Price.toFixed(),
  //   priceAC.toFixed(),
  //   priceBC.toFixed()
  // )
  // console.log('tst a', a.toFixed(18), priceAC.toFixed(), priceBC.toFixed())
  // console.log('tst b', b.toFixed(18), reserveB.toFixed(), reserveA.toFixed())
  // console.log('tst x', x, x.toFixed(18))

  // const xBN = parseUnits(x?.toFixed(18) ?? '')

  // const one = parseUnits('1', 18)
  // const k0 = BigNumber.from(parseFloat('100'))
  // const k1 = BigNumber.from(parseFloat('0.075'))
  // const k2 = BigNumber.from(parseFloat('1565'))
  // const k3 = BigNumber.from(parseFloat('117'))
  // const tstk = k0.div(k1.mul(k2).add(k3))
  // console.log('tst k', tstk)

  // const a = pairPrice.mul(pac).add(pbc)
  // const amountB = amountFromBN.div(pairPrice.mul(pac).add(pbc))
  const rawAmountB = Number((amountFromBN / (pairPrice * pac + pbc)).toFixed(significantDigits))
  const rawAmountA = Number((rawAmountB * pairPrice).toFixed(significantDigits))
  // TODO too low value check?
  // if (rawAmountA < Number. || rawAmountB < Number.MIN_SAFE_INTEGER) throw new Error('Amount too low')
  const amountFromForTokenB = rawAmountB * pbc
  const amountFromForTokenA = amountFromBN - amountFromForTokenB
  console.log('zap pair:', pair)
  console.log('zap:', amountFrom.currency.symbol, amountFromBN, ' was given')
  console.log('zap:', rawAmountA, pair.token0.symbol, ' will be LP. Bought for', amountFromForTokenA)
  console.log('zap:', rawAmountB, pair.token1.symbol, ' will be LP. Bought for', amountFromForTokenB)
  const amountB = BigNumber.from(parseUnits(rawAmountB.toString()))
  const amountA = BigNumber.from(parseUnits(rawAmountA.toString()))
  console.log('zap amp', amountFromForTokenA + amountFromForTokenB)
  // console.log(
  //   'tst o',
  //   pairPrice.toString(),
  //   pac.toString(),
  //   pbc.toString(),
  //   amountFromBN.toString(),
  //   rawAmountA,
  //   rawAmountB
  // )
  console.log('zap: pair, ac, bc', pair.token1Price.toFixed(), b.toFixed(12), priceAC.toFixed(), priceBC.toFixed())
  // console.log('eloszki', amountFrom, amountFromBN, one.toString())
  // const tmpDenominator = xBN.add(one)
  // const amountB = xBN.mul(amountFromBN).div(tmpDenominator)
  // const amountA = amountFromBN.div(tmpDenominator)
  // const amountB = CurrencyAmount.nativeCurrency(cb, chainId)
  // const amountA = CurrencyAmount.nativeCurrency(ca, chainId)
  // console.log('zap calculate', amountA, amountB, amountFrom.toExact(), amountA.toString(), amountB.toString())
  return { amountA, amountB }
}
