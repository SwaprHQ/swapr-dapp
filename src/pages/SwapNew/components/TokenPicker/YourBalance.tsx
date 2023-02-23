import { Currency } from '@swapr/sdk'

import styled from 'styled-components'

import { Heading } from './Heading'
import { TokenItem } from './TokenItem'
import { TokenList } from './TokenList'

type CommonTokensProps = {
  onCurrencySelect: (currency: Currency) => void
  selectedCurrency?: Currency | null
}

export function YourBalance({ onCurrencySelect, selectedCurrency }: CommonTokensProps) {
  return (
    <Container>
      <Heading>Your Balance</Heading>
      <TokenList></TokenList>
    </Container>
  )
}

const Container = styled.div`
  width: 478px;
  text-align: center;
  margin-bottom: 34px;
`
