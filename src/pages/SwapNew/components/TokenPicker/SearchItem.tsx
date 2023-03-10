import { Currency } from '@swapr/sdk'

import styled from 'styled-components'

import { CurrencyLogo } from '../CurrencyLogo'

type SearchItemProps = {
  currency: Currency
  onClick: () => void
}

export function SearchItem({ currency, onClick }: SearchItemProps) {
  return (
    <Container onClick={onClick}>
      <CurrencyLogo currency={currency} />
      {currency?.symbol}
    </Container>
  )
}

const Container = styled.div`
  margin-bottom: 16px;
`
