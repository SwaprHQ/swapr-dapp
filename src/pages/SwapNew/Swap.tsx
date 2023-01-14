import styled from 'styled-components'

import { CurrencyItem, SwapButton, SwapInfo, SwitchCurrenciesButton } from './components'

export function Swapbox2() {
  return (
    <Container>
      <CurrencyItem />
      <CurrencyItem />
      <SwitchCurrenciesButton />
      <SwapInfo />
      <SwapButton />
    </Container>
  )
}

const Container = styled.div`
  width: 467px;
  position: relative;
`
