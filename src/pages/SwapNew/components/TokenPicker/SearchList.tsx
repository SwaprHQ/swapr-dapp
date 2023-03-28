import { Currency } from '@swapr/sdk'

import styled from 'styled-components'

import { useActiveWeb3React } from '../../../../hooks'
import { useCurrencyBalances } from '../../../../state/wallet/hooks'
import { SearchItem } from './SearchItem'

type SearchListProps = {
  filteredSortedTokensWithNativeCurrency: Currency[]
  handleCurrencySelect: (currency: Currency) => void
}

export function SearchList({ filteredSortedTokensWithNativeCurrency, handleCurrencySelect }: SearchListProps) {
  const { account } = useActiveWeb3React()

  const balances = useCurrencyBalances(account || undefined, filteredSortedTokensWithNativeCurrency)

  return (
    <Container>
      {filteredSortedTokensWithNativeCurrency.map((currency, index) => {
        return (
          <SearchItem
            key={currency.address}
            currency={currency}
            balance={balances[index]}
            onClick={() => handleCurrencySelect(currency)}
          />
        )
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

  &::-webkit-scrollbar {
    background-color: transparent;
  }
`
