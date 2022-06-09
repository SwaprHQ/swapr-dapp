import React from 'react'
import { Price } from '@swapr/sdk'
import { TYPE } from '../../theme'
import styled from 'styled-components'
import { transparentize } from 'polished'
import { RowFixed } from '../Row'
import { useIsMobileByMedia } from '../../hooks/useIsMobileByMedia'
import { limitNumberOfDecimalPlaces } from '../../utils/prices'

const Wrapper = styled(RowFixed)`
  background: ${props => transparentize(0.9, props.theme.bg4)};
  border-radius: 4px;
  padding: 4px 5px;
  cursor: pointer;
`

interface TradePriceProps {
  price?: Price
  showInverted: boolean
  setShowInverted: (showInverted: boolean) => void
}

export default function TradePrice({ price, showInverted, setShowInverted }: TradePriceProps) {
  const isMobileByMedia = useIsMobileByMedia()
  const significantDigits = isMobileByMedia ? 6 : 14
  const formattedPrice = limitNumberOfDecimalPlaces(showInverted ? price : price?.invert(), significantDigits)

  const show = Boolean(price?.baseCurrency && price?.quoteCurrency)
  const quoteCurrenxy = price?.quoteCurrency.symbol?.slice(0, 6)
  const baseCurrency = price?.baseCurrency.symbol?.slice(0, 6)
  const label = showInverted
    ? `${quoteCurrenxy} ${isMobileByMedia ? `/` : `per`} ${baseCurrency}`
    : `${baseCurrency} ${isMobileByMedia ? `/` : `per`}  ${quoteCurrenxy}`

  return (
    <Wrapper onClick={() => setShowInverted(!showInverted)}>
      {show ? (
        <>
          <TYPE.body mr="4px" fontSize="13px" lineHeight="12px" letterSpacing="0" fontWeight="700">
            {formattedPrice || '-'}
          </TYPE.body>
          <TYPE.body fontSize="13px" lineHeight="12px" letterSpacing="0" fontWeight="500">
            {label}
          </TYPE.body>
        </>
      ) : (
        '-'
      )}
    </Wrapper>
  )
}
