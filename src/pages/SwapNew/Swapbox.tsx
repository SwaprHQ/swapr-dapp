import { AnimatePresence } from 'framer-motion'
import styled from 'styled-components'

import { Field } from '../../state/swap/types'
import { CurrencyItem, SwapInfo, SwitchCurrenciesButton, SwapboxButton } from './components'
import { SWAPBOX_WIDTH } from './constants'
import { useSwapbox } from './useSwapbox'

export function Swapbox() {
  const {
    // CURRENCIES
    currencies,
    priceImpact,
    priceImpactSeverity,

    // AMOUNT of CURRENCIES
    formattedAmounts,
    handleTypeInput,
    handleTypeOutput,
    isInputPanelDisabled,

    // AMOUNT WORTH
    fiatValueInput,
    fiatValueOutput,
    isFallbackFiatValueInput,
    isFallbackFiatValueOutput,

    // CURRENCY SELECT
    handleMaxInput,
    handleInputSelect,
    handleOutputSelect,
    maxAmountInput,
    maxAmountOutput,

    // SWITCH CURRENCIES
    onSwitchTokens,

    // LOADING
    loading,

    // SWAP INFO
    allPlatformTrades,
    trade,
    swapCallbackError,

    // SWAP BUTTON
    swapInputError,
    handleSwap,

    // WRAPPING
    showWrap,
    wrapInputError,
    wrapState,
    onWrap,
    wrapType,
    setWrapState,

    // APPROVE FLOW
    showApproveFlow,
    approveCallback,
    approval,

    // CONFIRM SWAP MODAL
    swapErrorMessage,
    recipient,
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
        isInputPanelDisabled={isInputPanelDisabled}
      />
      <SwitchCurrenciesButton loading={loading} onClick={onSwitchTokens} />
      <CurrencyItem
        value={formattedAmounts[Field.OUTPUT]}
        currency={currencies[Field.OUTPUT]}
        onUserInput={handleTypeOutput}
        fiatValue={fiatValueOutput}
        isFallbackFiatValue={isFallbackFiatValueOutput}
        priceImpact={priceImpact}
        onMax={handleMaxInput(Field.OUTPUT)}
        onCurrencySelect={handleOutputSelect}
        isInputPanelDisabled={isInputPanelDisabled}
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
      <SwapboxButton
        priceImpactSeverity={priceImpactSeverity}
        amountInCurrencySymbol={currencies[Field.INPUT]?.symbol}
        swapInputError={swapInputError}
        loading={loading}
        trade={trade}
        handleSwap={handleSwap}
        swapCallbackError={swapCallbackError}
        showWrap={showWrap}
        wrapInputError={wrapInputError}
        wrapState={wrapState}
        onWrap={onWrap}
        wrapType={wrapType}
        showApproveFlow={showApproveFlow}
        approveCallback={approveCallback}
        approval={approval}
      />
    </Container>
  )
}

const Container = styled.div`
  width: ${SWAPBOX_WIDTH};
  position: relative;
  margin: 0 auto 80px;
`
