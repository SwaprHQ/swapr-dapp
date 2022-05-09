import React from 'react'
import styled from 'styled-components'
import { TYPE } from '../../theme'
import { JSBI, Percent } from '@swapr/sdk'
import { simpleWarningSeverity } from '../../utils/prices'
import { PRICE_IMPACT_HIGH } from '../../constants'

interface FiatValueDetailsProps {
  fiatValue?: string
  priceImpact?: Percent
  isFallback?: boolean
}

const StyledPriceImpact = styled.span<{ warning?: boolean }>`
  color: ${({ theme, warning }) => (warning ? theme.red1 : theme.text5)};
  margin-left: 8px;
`

export function FiatValueDetails({ fiatValue = '0', priceImpact, isFallback }: FiatValueDetailsProps) {
  const fiatPriceImpactSeverity = simpleWarningSeverity(priceImpact)

  return (
    <TYPE.body fontWeight="600" fontSize="11px" lineHeight="13px" letterSpacing="0.08em">
      {isFallback && '~'}${fiatValue}
      {priceImpact && (
        <StyledPriceImpact warning={fiatPriceImpactSeverity === PRICE_IMPACT_HIGH}>
          {priceImpact.multiply(JSBI.BigInt(-100)).toSignificant(3)}%
        </StyledPriceImpact>
      )}
    </TYPE.body>
  )
}
