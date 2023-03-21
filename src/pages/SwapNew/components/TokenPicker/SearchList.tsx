import { Currency } from '@swapr/sdk'

import styled from 'styled-components'

import { SearchItem } from './SearchItem'

type SearchListProps = {
  filteredSortedTokensWithNativeCurrency: Currency[]
  handleCurrencySelect: (currency: Currency) => void
}

export function SearchList({ filteredSortedTokensWithNativeCurrency, handleCurrencySelect }: SearchListProps) {
  return (
    <Container>
      {filteredSortedTokensWithNativeCurrency.map(currency => {
        return <SearchItem currency={currency} onClick={() => handleCurrencySelect(currency)} />
      })}
    </Container>
  )
}

const Container = styled.div`
  max-width: 478px;
  width: 100%;
  max-height: 450px;
  overflow-y: scroll;
  margin-top: 36px;
`
