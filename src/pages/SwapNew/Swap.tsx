import styled from 'styled-components'

import { ReactComponent as EtherLogoSVG } from '../../assets/swapbox/currency-logo-eth.svg'
import { ReactComponent as USDTLogoSVG } from '../../assets/swapbox/currency-logo-usdt.svg'
import { CurrencyItem, SwapButton, SwapInfo, SwitchCurrenciesButton } from './components'
import { SWAPBOX_WIDTH } from './constants'
import { Currency } from './models'
import { useSwapbox } from './useSwapbox'

type SwapData = {
  from: Currency
  to: Currency
}

const swapData: SwapData = {
  from: {
    symbol: 'ETH',
    balance: 1.488,
    logo: <EtherLogoSVG />,
  },
  to: {
    symbol: 'USDT',
    balance: 4009.12,
    logo: <USDTLogoSVG />,
  },
}

export function Swapbox2() {
  const { state, onFromInputChange, onToInputChange } = useSwapbox()

  return (
    <Container>
      <CurrencyItem value={state.fromValue} onChange={onFromInputChange} currency={swapData.from} />
      <CurrencyItem value={state.toValue} onChange={onToInputChange} currency={swapData.to} lowerItem />
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
