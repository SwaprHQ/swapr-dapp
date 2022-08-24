import Numeral from 'numeral'

export const formatNumber = (number: number | string, usd = false, ignoreZero = false) => {
  if (isNaN(Number(number)) || number === '' || number === undefined) {
    return usd ? '$0' : ignoreZero ? '' : 0
  }

  let num = parseFloat(number.toString())

  if (num > 500000000) {
    return (usd ? '$' : '') + toK(num.toFixed(0))
  }

  if (num === 0) {
    if (usd) {
      return '$0'
    }
    return ignoreZero ? '' : 0
  }

  if (num < 0.0001 && num > 0) {
    return usd ? '< $0.0001' : '< 0.0001'
  }

  if (num > 1000) {
    return usd ? formatDollarAmount(num, 0) : Number(num.toFixed(0)).toLocaleString()
  }

  if (usd) {
    if (num < 0.1) {
      return formatDollarAmount(num, 4)
    } else {
      return formatDollarAmount(num, 2)
    }
  }

  if (num > 0 && num < 1) {
    return Number(num.toFixed(4)).toString()
  }

  if (num > 1 && num < 10) {
    return Number(num.toFixed(3)).toString()
  }

  return Number(num.toFixed(5)).toLocaleString()
}

export const toK = (num: string) => {
  return Numeral(num).format('0.[00]a').toUpperCase()
}

export const formatDollarAmount = (num: number, digits: number) => {
  const formatter = new Intl.NumberFormat([], {
    style: 'currency',
    currency: 'USD',
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
  return formatter.format(num)
}
