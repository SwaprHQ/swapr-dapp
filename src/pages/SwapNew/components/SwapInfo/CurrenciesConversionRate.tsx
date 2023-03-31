import { Price } from '@swapr/sdk'

import { useState } from 'react'
import styled from 'styled-components'

import { useIsMobileByMedia } from '../../../../hooks/useIsMobileByMedia'
import { limitNumberOfDecimalPlaces } from '../../../../utils/prices'
import { TEXT_COLOR_PRIMARY } from '../../constants'
import { FontFamily } from '../../constants'

type CurrenciesConversionRateProps = {
  price?: Price
}

export function CurrenciesConversionRate({ price }: CurrenciesConversionRateProps) {
  const [showInvertedConversionRate, setShowInvertedConversionRate] = useState(true)

  const isMobileByMedia = useIsMobileByMedia()
  const significantDigits = isMobileByMedia ? 6 : 14
  const formattedPrice = limitNumberOfDecimalPlaces(
    showInvertedConversionRate ? price : price?.invert(),
    significantDigits
  )

  const show = Boolean(price?.baseCurrency && price?.quoteCurrency)
  const quoteCurrenxy = price?.quoteCurrency.symbol?.slice(0, 6)
  const baseCurrency = price?.baseCurrency.symbol?.slice(0, 6)

  if (show)
    return (
      <Paragraph onClick={() => setShowInvertedConversionRate(value => !value)}>
        <span>1</span> {showInvertedConversionRate ? baseCurrency : quoteCurrenxy} = <span>{formattedPrice}</span>{' '}
        {showInvertedConversionRate ? quoteCurrenxy : baseCurrency}
      </Paragraph>
    )

  return null
}

const Paragraph = styled.p`
  height: 20px;
  line-height: 20px;
  display: inline-block;
  vertical-align: top;
  padding: 5px 6px;
  border-radius: 4px;
  line-height: 10px;
  font-size: 10px;
  ${FontFamily}
  font-weight: 500;
  text-transform: uppercase;
  opacity: 0.8;
  color: ${TEXT_COLOR_PRIMARY};
  background: rgba(104, 110, 148, 0.1);
  user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  cursor: pointer;

  & span {
    opacity: 1;
    font-weight: 700;
  }
`
