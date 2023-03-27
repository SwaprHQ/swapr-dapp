import { Currency, CurrencyAmount } from '@swapr/sdk'

import styled from 'styled-components'

import { CurrencyLogo } from '../CurrencyItem/CurrencyLogo'

type SearchItemProps = {
  currency: Currency
  balance?: CurrencyAmount
  onClick: () => void
}

export function SearchItem({ currency, balance, onClick }: SearchItemProps) {
  return (
    <Container onClick={onClick}>
      <Info>
        <TokenInfo>
          <CurrencyLogo currency={currency} />
          {currency?.symbol}
        </TokenInfo>
        <TokenBalance>{balance?.toSignificant(4)}</TokenBalance>
      </Info>
      <TokenName>{currency.name}</TokenName>
    </Container>
  )
}

const Container = styled.div`
  margin-bottom: 16px;
  cursor: pointer;
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

const TokenBalance = styled.p`
  line-height: 18px;
  font-size: 15px;
  font-weight: 500;
  font-feature-settings: 'zero' on;
  color: #bcb3f0;
`
