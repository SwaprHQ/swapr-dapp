import { ChainId, Currency, Token } from '@swapr/sdk'

import styled from 'styled-components'

import { SUGGESTED_BASES } from '../../../../constants'
import { useActiveWeb3React } from '../../../../hooks'
import { CurrencySymbol } from '../../constants'
import { Heading } from './Heading'
import { TokenItem } from './TokenItem'
import { TokenList } from './TokenList'

type CommonTokensProps = {
  onCurrencySelect: (currency: Currency) => void
  selectedCurrency?: Currency | null
}

export function CommonTokens({ onCurrencySelect, selectedCurrency }: CommonTokensProps) {
  const { chainId } = useActiveWeb3React()

  return (
    <Container>
      <Heading>Common Tokens</Heading>
      <TokenList>
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
  margin-bottom: 34px;
`
