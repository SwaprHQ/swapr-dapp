import { CurrencyAmount, Percent } from '@swapr/sdk'

import styled from 'styled-components'

import { TEXT_COLOR_SECONDARY } from '../constants'
import { FontFamily } from './styles'

type CurrencyAmountWorthProps = {
  fiatValue?: CurrencyAmount | null
  priceImpact?: Percent
  isFallback?: boolean
}

export function CurrencyAmountWorth({ fiatValue, priceImpact, isFallback }: CurrencyAmountWorthProps) {
  const value = fiatValue ? `${`${isFallback ? '~' : ''}`}$${fiatValue.toFixed(2, { groupSeparator: ',' })}` : ''

  return <Paragraph>{value}</Paragraph>
}

const Paragraph = styled.p`
  line-height: 12px;
  font-size: 10px;
  ${FontFamily}
  font-weight: 600;
  letter-spacing: 0.08em;
  color: ${TEXT_COLOR_SECONDARY};
`
