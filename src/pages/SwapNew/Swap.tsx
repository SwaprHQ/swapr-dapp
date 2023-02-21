import { AnimatePresence } from 'framer-motion'
import styled from 'styled-components'

import { ReactComponent as EtherLogoSVG } from '../../assets/swapbox/currency-logo-eth.svg'
import { ReactComponent as USDTLogoSVG } from '../../assets/swapbox/currency-logo-usdt.svg'
import { CurrencyItem, SwapButton, SwapInfo, SwitchCurrenciesButton } from './components'
import { TokenPicker } from './components/TokenPicker'
import { SWAPBOX_WIDTH } from './constants'
import { Currency } from './models'
import { useSwap } from './useSwap'
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
  const {
    state,
    onFromInputChange,
    onToInputChange,
    tokenPickerOpened,
    openTokenPicker,
    closeTokenPicker,
    tokenPickerInput,
    onTokenPickerInputChange,
  } = useSwapbox()

  const {
    formattedAmounts,
    currencies,
    handleTypeInput,
    handleTypeOutput,
    handleMaxInput,
    handleInputSelect,
    handleOutputSelect,
    fiatValueInput,
    fiatValueOutput,
    isFallbackFiatValueInput,
    isFallbackFiatValueOutput,
    maxAmountInput,
    maxAmountOutput,
    isInputPanelDisabled,

    onSwitchTokens,

    showWrap,
    bestPricedTrade,
    showAdvancedSwapDetails,
    setShowAdvancedSwapDetails,
    recipient,

    wrapInputError,
    showApproveFlow,
    userHasSpecifiedInputOutput,
    approval,
    setSwapState,
    priceImpactSeverity,
    swapCallbackError,
    wrapType,
    approvalsSubmitted,
    trade,
    swapInputError,
    swapErrorMessage,
    loading,
    onWrap,
    approveCallback,
    handleSwap,
    wrapState,
    setWrapState,
  } = useSwap()

  return (
    <>
      <Container>
        <AnimatePresence>
          {tokenPickerOpened && (
            <TokenPicker
              tokenPickerInput={tokenPickerInput}
              onTokenPickerInputChange={onTokenPickerInputChange}
              closeTokenPicker={closeTokenPicker}
            />
          )}
        </AnimatePresence>
        <CurrencyItem
          value={state.fromValue}
          onChange={onFromInputChange}
          currency={swapData.from}
          openTokenPicker={openTokenPicker}
        />
        <CurrencyItem
          value={state.toValue}
          onChange={onToInputChange}
          currency={swapData.to}
          openTokenPicker={openTokenPicker}
          lowerItem
        />
        <SwitchCurrenciesButton />
        <SwapInfo />
        <SwapButton />
      </Container>
    </>
  )
}

const Container = styled.div`
  width: ${SWAPBOX_WIDTH};
  position: relative;
`
