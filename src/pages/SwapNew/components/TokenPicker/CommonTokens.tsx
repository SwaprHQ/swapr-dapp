import { Currency, Token, currencyEquals } from '@swapr/sdk'

import { useCallback } from 'react'
import styled from 'styled-components'

import { SUGGESTED_BASES } from '../../../../constants'
import { useActiveWeb3React } from '../../../../hooks'
import { useNativeCurrency } from '../../../../hooks/useNativeCurrency'
import { Heading } from './Heading'
import { TokenItem } from './TokenItem'
import { TokenList } from './TokenList'

type CommonTokensProps = {
  onCurrencySelect: (currency: Currency) => void
  selectedCurrency?: Currency | null
}

export function CommonTokens({ onCurrencySelect, selectedCurrency }: CommonTokensProps) {
  const { chainId } = useActiveWeb3React()
  const nativeCurrency = useNativeCurrency()

  const handleClick = useCallback(() => {
    if (!selectedCurrency || !currencyEquals(selectedCurrency, nativeCurrency)) {
      onCurrencySelect(nativeCurrency)
    }
  }, [nativeCurrency, onCurrencySelect, selectedCurrency])

  return (
    <Container>
      <Heading>Common Tokens</Heading>
      <TokenList>
        <TokenItem
          key={nativeCurrency.address}
          token={nativeCurrency as Token}
          onClick={handleClick}
          disabled={selectedCurrency === nativeCurrency || selectedCurrency === undefined}
        />
        {chainId &&
          SUGGESTED_BASES[chainId]?.map((token: Token) => {
            const selected = selectedCurrency instanceof Token && selectedCurrency.address === token.address

            return <TokenItem key={token.address} token={token} onClick={() => !selected && onCurrencySelect(token)} />
          })}
      </TokenList>
    </Container>
  )
}

const Container = styled.div`
  width: 478px;
  text-align: center;
  margin: 74px 0 34px;
`
