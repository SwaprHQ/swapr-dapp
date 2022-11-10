import { Token } from '@swapr/sdk'

import _Decimal from 'decimal.js-light'
import { UTCTimestamp } from 'lightweight-charts'
import toFormat from 'toformat'

const Decimal = toFormat(_Decimal)

export type ChartData = { time: UTCTimestamp; value: string }

export const formatDateShort = (date: Date) => date.toLocaleString('default', { month: 'short' }) + ' ' + date.getDate()
export const formatDateHours = (date: Date) => date.toLocaleString('default', { hour: 'numeric', minute: 'numeric' })

export const formatDate = (date: Date) =>
  `${date.toLocaleString('default', {
    month: 'short',
  })} ${date.getDate()}, ${date.getFullYear()}  ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`

export const buildDate = (time: number) => new Date(time * 1000)

export const lastDataElement = (data: ChartData[]) => data[data.length - 1]
export const lastElementValueOrDefault = (data: ChartData[]) => lastDataElement(data)?.value ?? 0
export const lastElementTimeOrDefault = (data: ChartData[]) => lastDataElement(data)?.time ?? 0

export const formatPrice = (price: string) => {
  const floatPrice = parseFloat(price)
  const significantDigits = 6
  const format = { groupSeparator: '' }
  const quotient = new Decimal(floatPrice).toSignificantDigits(significantDigits)
  return quotient.toFormat(quotient.decimalPlaces(), format)
}

export const DATE_INTERVALS = {
  DAY: 'DAY',
  WEEK: 'WEEK',
  MONTH: 'MONTH',
  YEAR: 'YEAR',
}

const PairTokenPriceTimeframe = {
  FiveMinutes: 'FIVE_MINUTES',
  FifteenMinutes: 'FIFTEEN_MINUTES',
  OneHour: 'ONE_HOUR',
  TwelveHours: 'TWELVE_HOURS',
}

export const convertToSecondsTimestamp = (timestamp: number): string => Math.floor(timestamp / 1000).toString()

const oneDayInMilliseconds = 24 * 60 * 60 * 1000

export const TIMEFRAME_PROPRETIES = {
  [DATE_INTERVALS.DAY]: {
    timestamp: convertToSecondsTimestamp(new Date(new Date().getTime() - oneDayInMilliseconds).getTime()),
    pairTokenPriceTimeframe: PairTokenPriceTimeframe.FiveMinutes,
  },
  [DATE_INTERVALS.WEEK]: {
    timestamp: convertToSecondsTimestamp(new Date(new Date().getTime() - 7 * oneDayInMilliseconds).getTime()),
    pairTokenPriceTimeframe: PairTokenPriceTimeframe.FifteenMinutes,
  },
  [DATE_INTERVALS.MONTH]: {
    timestamp: convertToSecondsTimestamp(new Date().setMonth(new Date().getMonth() - 1)),
    pairTokenPriceTimeframe: PairTokenPriceTimeframe.OneHour,
  },
  [DATE_INTERVALS.YEAR]: {
    timestamp: convertToSecondsTimestamp(new Date().setFullYear(new Date().getFullYear() - 1)),
    pairTokenPriceTimeframe: PairTokenPriceTimeframe.TwelveHours,
  },
}

export type GetBlockPairTokenPriceQueryData = {
  blockTimestamp: string
  token0Address: string
  token0Price: string
  token1Price: string
}

export const convertToChartData = (data?: GetBlockPairTokenPriceQueryData[], token0?: Token) =>
  data?.reduce<ChartData[]>((newArray, { blockTimestamp, token0Address, token0Price, token1Price }) => {
    newArray.push({
      time: parseInt(blockTimestamp, 10) as UTCTimestamp,
      value: token0?.address.toLowerCase() === token0Address.toLowerCase() ? token0Price : token1Price,
    })
    return newArray
  }, []) || []
