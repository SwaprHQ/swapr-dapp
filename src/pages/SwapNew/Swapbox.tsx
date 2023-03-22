import { AnimatePresence } from 'framer-motion'
import styled from 'styled-components'

import { Field } from '../../state/swap/types'
import { CurrencyItem, SwapInfo, SwitchCurrenciesButton } from './components'
import { SwapButton } from './components'
import { SWAPBOX_WIDTH } from './constants'
import { useSwapbox } from './useSwapbox'

export function Swapbox() {
  const {
    // AMOUNT of CURRENCIES
    formattedAmounts,
    handleTypeInput,
    handleTypeOutput,

    // CURRENCIES
    currencies,

    // AMOUNT WORTH
    fiatValueInput,
    fiatValueOutput,
    isFallbackFiatValueInput,
    isFallbackFiatValueOutput,

    // CURRENCY SELECT
    handleMaxInput,
    handleInputSelect,
    handleOutputSelect,

    // LOADING
    loading,

    // SWAP BUTTON
    swapInputError,
    handleSwap,
    trade,

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
    priceImpact,
    priceImpactSeverity,
    swapCallbackError,
    wrapType,
    approvalsSubmitted,
    swapErrorMessage,
    onWrap,
    approveCallback,
    wrapState,
    setWrapState,

    // SWAP INFO
    allPlatformTrades,
  } = useSwapbox()

  return (
    <Container>
      <CurrencyItem
        value={formattedAmounts[Field.INPUT]}
        currency={currencies[Field.INPUT]}
        onUserInput={handleTypeInput}
        fiatValue={fiatValueInput}
        isFallbackFiatValue={isFallbackFiatValueInput}
        onMax={handleMaxInput(Field.INPUT)}
        onCurrencySelect={handleInputSelect}
      />
      <SwitchCurrenciesButton loading={loading} />
      <CurrencyItem
        value={formattedAmounts[Field.OUTPUT]}
        currency={currencies[Field.OUTPUT]}
        onUserInput={handleTypeOutput}
        fiatValue={fiatValueOutput}
        isFallbackFiatValue={isFallbackFiatValueOutput}
        priceImpact={priceImpact}
        onMax={handleMaxInput(Field.OUTPUT)}
        onCurrencySelect={handleOutputSelect}
        lowerItem
      />
      <AnimatePresence>
        {allPlatformTrades?.length !== 0 && (
          <SwapInfo
            loading={loading}
            allPlatformTrades={allPlatformTrades}
            selectedTrade={trade}
            outputCurrencySymbol={currencies[Field.OUTPUT]?.symbol}
          />
        )}
      </AnimatePresence>
      <SwapButton
        priceImpactSeverity={priceImpactSeverity}
        amountInCurrencySymbol={currencies[Field.INPUT]?.symbol}
        swapInputError={swapInputError}
        loading={loading}
        trade={trade}
        handleSwap={handleSwap}
        showWrap={showWrap}
      />
    </Container>
  )
}

const Container = styled.div`
  width: ${SWAPBOX_WIDTH};
  position: relative;
  margin: 0 auto 80px;
`
