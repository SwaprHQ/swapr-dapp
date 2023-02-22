import { Currency } from '@swapr/sdk'

import styled from 'styled-components'

import { ReactComponent as DownArrowLargeSVG } from '../../../assets/swapbox/down-arrow-large.svg'
import { CurrencyLogo } from './CurrencyLogo'
import { CurrencySymbol } from './CurrencySymbol'

type CurrencyTypeProps = {
  currency?: Currency | null
  onClick: () => void
}

export function CurrencyType({ currency, onClick }: CurrencyTypeProps) {
  console.log('CURRENCY: ', currency)

  return (
    <Container onClick={onClick}>
      <CurrencyLogo currency={currency!} />
      <CurrencySymbol currency={currency} />
      <DownArrowLargeSVG />
    </Container>
  )
}

const Container = styled.div`
  height: 24px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 17px;
  cursor: pointer;
`
