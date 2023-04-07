import { CurrencyAmount, JSBI, Percent } from '@swapr/sdk'

import styled from 'styled-components'

import { PRICE_IMPACT_HIGH } from '../../../../constants'
import { simpleWarningSeverity } from '../../../../utils/prices'
import { TEXT_COLOR_SECONDARY } from '../../constants'

type CurrencyAmountWorthProps = {
  fiatValue?: CurrencyAmount | null
  priceImpact?: Percent
  isFallback?: boolean
}

export function CurrencyAmountWorth({ fiatValue, priceImpact, isFallback }: CurrencyAmountWorthProps) {
  if (fiatValue) {
    const value = fiatValue ? `${`${isFallback ? '~' : ''}`}$${fiatValue.toFixed(2, { groupSeparator: ',' })}` : ''
    const fiatPriceImpactSeverity = simpleWarningSeverity(priceImpact)

    return (
      <Paragraph alert={fiatPriceImpactSeverity === PRICE_IMPACT_HIGH}>
        {value} {priceImpact && <span>{priceImpact.multiply(JSBI.BigInt(-100)).toSignificant(3)}%</span>}
      </Paragraph>
    )
  }

  return null
}

const Paragraph = styled.p<{ alert?: boolean }>`
  line-height: 12px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: ${TEXT_COLOR_SECONDARY};

  & span {
    color: ${({ alert }) => (alert ? '#f02e51' : '#8780BF')};
  }
`
