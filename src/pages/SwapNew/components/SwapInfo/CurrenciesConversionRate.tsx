import { Price } from '@swapr/sdk'

import { useState } from 'react'
import styled from 'styled-components'

import { TEXT_COLOR_PRIMARY } from '../../constants'
import { FontFamily } from '../styles'

type CurrenciesConversionRateProps = {
  price?: Price
}

export function CurrenciesConversionRate({ price }: CurrenciesConversionRateProps) {
  const [showInvertedConversionRate, setShowInvertedConversionRate] = useState(false)

  return (
    <Paragraph onClick={() => setShowInvertedConversionRate(value => !value)}>
      <span>1</span> ETH = <span>3007</span> USDT
    </Paragraph>
  )
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
  cursor: pointer;

  & span {
    opacity: 1;
    font-weight: 700;
  }
`
