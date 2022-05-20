import { Token } from '@swapr/sdk'

export function currencyKey(index: number, data: any): string {
  const currency = data[index]
  if (currency instanceof Token) return currency.address
  return currency.symbol ?? ''
}
