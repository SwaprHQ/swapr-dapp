import styled from 'styled-components'

import { CurrencySymbol } from '../../constants'
import { renderCurrencyLogo } from '../../utils'

type SearchTokenItemProps = {
  currencySymbol: CurrencySymbol
  balance: number
}

export function SearchTokenItem({ currencySymbol, balance }: SearchTokenItemProps) {
  return (
    <Container>
      <Info>
        <TokenInfo>
          {renderCurrencyLogo(currencySymbol)}
          <SearchTokenCurrencySymbol>{currencySymbol}</SearchTokenCurrencySymbol>
        </TokenInfo>
        <TokenBalance>{balance}</TokenBalance>
      </Info>
      <TokenName>Ether</TokenName>
    </Container>
  )
}

const Container = styled.div`
  margin-bottom: 16px;
`

const Info = styled.div`
  height: 20px;
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
`

const TokenInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`

const SearchTokenCurrencySymbol = styled.p`
  display: inline-block;
`

const TokenBalance = styled.p`
  display: inline-block;
  line-height: 18px;
  font-size: 15px;
  font-family: Inter;
  font-weight: 500;
  text-align: right;
  text-transform: uppercase;
  font-feature-settings: 'zero' on;
  color: #bcb3f0;
`

const TokenName = styled.p`
  line-height: 12px;
  font-size: 10px;
  font-family: Inter;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-align: left;
  text-transform: uppercase;
  color: #dddaf8;
  opacity: 0.8;
`
