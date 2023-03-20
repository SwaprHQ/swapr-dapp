import styled from 'styled-components'

import Hero from '../../components/LandingPageComponents/layout/Hero'
import { Field } from '../../state/swap/types'
import { LandingSections } from '../Swap/LandingSections'
import { CurrencyItem, SwapInfo, SwitchCurrenciesButton } from './components'
import { SwapButton } from './components'
import { SWAPBOX_WIDTH } from './constants'
import { useSwap } from './useSwap'

export function Swapbox2() {
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
  } = useSwap()

  return (
    <Hero showMarquee={true}>
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
        <SwapInfo
          loading={loading}
          allPlatformTrades={allPlatformTrades}
          selectedTrade={trade}
          outputCurrencySymbol={currencies[Field.OUTPUT]?.symbol}
        />
        <SwapButton
          priceImpactSeverity={priceImpactSeverity}
          amountInCurrencySymbol={currencies[Field.INPUT]?.symbol}
          swapInputError={swapInputError}
          loading={loading}
          trade={trade}
          handleSwap={handleSwap}
        />
      </Container>
      <LandingSections />
    </Hero>
  )
}

const Container = styled.div`
  width: ${SWAPBOX_WIDTH};
  position: relative;
`
