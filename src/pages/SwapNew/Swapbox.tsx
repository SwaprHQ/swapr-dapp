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

    maxAmountInput,
    maxAmountOutput,
    isInputPanelDisabled,

    onSwitchTokens,

    bestPricedTrade,
    showAdvancedSwapDetails,
    setShowAdvancedSwapDetails,
    recipient,

    userHasSpecifiedInputOutput,
    setSwapState,
    priceImpact,
    priceImpactSeverity,
    swapCallbackError,
    swapErrorMessage,

    // SWAP INFO
    allPlatformTrades,
    trade,

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
    approvalSubmitted,
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
