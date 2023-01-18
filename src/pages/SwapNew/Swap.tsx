import styled from 'styled-components'

import { CurrencyItem, SwapButton, SwapInfo, SwitchCurrenciesButton } from './components'
import { SWAPBOX_WIDTH } from './constants'

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
  width: ${SWAPBOX_WIDTH};
  position: relative;
`
