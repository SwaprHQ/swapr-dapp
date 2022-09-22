import { CoWTrade, Currency, CurrencyAmount, JSBI, RoutablePlatform, Trade } from '@swapr/sdk'

import { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

import { ReactComponent as SwapIcon } from '../../../assets/images/swap-icon.svg'
import { AutoColumn } from '../../../components/Column'
import { CurrencyInputPanel } from '../../../components/CurrencyInputPanel'
import { SwapPoolTabs } from '../../../components/NavigationTabs'
import AdvancedSwapDetailsDropdown from '../../../components/Swap/AdvancedSwapDetailsDropdown'
import confirmPriceImpactWithoutFee from '../../../components/Swap/confirmPriceImpactWithoutFee'
import ConfirmSwapModal from '../../../components/Swap/ConfirmSwapModal'
import { ArrowWrapper, SwitchTokensAmountsContainer, Wrapper } from '../../../components/Swap/styleds'
import SwapButtons from '../../../components/Swap/SwapButtons'
import { TradeDetails } from '../../../components/Swap/TradeDetails'
import { useActiveWeb3React } from '../../../hooks'
import { ApprovalState, useApproveCallbackFromTrade } from '../../../hooks/useApproveCallback'
import { useSwapCallback } from '../../../hooks/useSwapCallback'
import { useHigherUSDValue } from '../../../hooks/useUSDValue'
import { useWrapCallback, WrapState, WrapType } from '../../../hooks/useWrapCallback'
import { useDerivedSwapInfo, useSwapActionHandlers, useSwapState } from '../../../state/swap/hooks'
import { Field } from '../../../state/swap/types'
import { useAdvancedSwapDetails, useIsExpertMode, useUserSlippageTolerance } from '../../../state/user/hooks'
import { computeFiatValuePriceImpact } from '../../../utils/computeFiatValuePriceImpact'
import { maxAmountSpend } from '../../../utils/maxAmountSpend'
import { computeTradePriceBreakdown, warningSeverity } from '../../../utils/prices'
import AppBody from '../../AppBody'

export enum CoWTradeState {
  UNKNOWN, // default
  WRAP,
  APPROVAL,
  SWAP,
}

export type SwapData = {
  showConfirm: boolean
  tradeToConfirm: Trade | undefined
  attemptingTxn: boolean
  swapErrorMessage: string | undefined
  txHash: string | undefined
}

export function Swapbox() {
  const [platformOverride, setPlatformOverride] = useState<RoutablePlatform | null>(null)
  const [showAdvancedSwapDetails, setShowAdvancedSwapDetails] = useAdvancedSwapDetails()

  const { chainId } = useActiveWeb3React()

  // for expert mode
  const isExpertMode = useIsExpertMode()

  // get custom setting values for user
  const allowedSlippage = useUserSlippageTolerance()

  // swap state
  const { independentField, typedValue, recipient } = useSwapState()

  const {
    trade: potentialTrade,
    allPlatformTrades,
    currencyBalances,
    parsedAmount,
    currencies,
    inputError: swapInputError,
    loading,
  } = useDerivedSwapInfo(platformOverride || undefined)

  // For GPv2 trades, have a state which holds: approval status (handled by useApproveCallback), and
  // wrap status(use useWrapCallback and a state variable)
  const [gnosisProtocolTradeState, setGnosisProtocolState] = useState(CoWTradeState.UNKNOWN)
  const {
    wrapType,
    execute: onWrap,
    inputError: wrapInputError,
    wrapState,
    setWrapState,
  } = useWrapCallback(
    currencies.INPUT,
    currencies.OUTPUT,
    potentialTrade instanceof CoWTrade,
    potentialTrade?.inputAmount?.toSignificant(6) ?? typedValue
  )
  const bestPricedTrade = allPlatformTrades?.[0]
  const showWrap = wrapType !== WrapType.NOT_APPLICABLE && !(potentialTrade instanceof CoWTrade)

  const trade = showWrap ? undefined : potentialTrade

  //GPv2 is falling in the true case, not very useful for what I think I need
  const parsedAmounts = showWrap
    ? {
        [Field.INPUT]: parsedAmount,
        [Field.OUTPUT]: parsedAmount,
      }
    : {
        [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
        [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount,
      }

  const { onSwitchTokens, onCurrencySelection, onUserInput } = useSwapActionHandlers()

  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value)
    },
    [onUserInput]
  )
  const handleTypeOutput = useCallback(
    (value: string) => {
      onUserInput(Field.OUTPUT, value)
    },
    [onUserInput]
  )

  // modal and loading
  const [{ showConfirm, tradeToConfirm, swapErrorMessage, attemptingTxn, txHash }, setSwapState] = useState<SwapData>({
    showConfirm: false,
    tradeToConfirm: undefined,
    attemptingTxn: false,
    swapErrorMessage: undefined,
    txHash: undefined,
  })

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: showWrap
      ? parsedAmounts[independentField]?.toExact() ?? ''
      : parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  }

  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] && currencies[Field.OUTPUT] && parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0))
  )

  // check whether the user has approved the router on the input token
  const [approval, approveCallback] = useApproveCallbackFromTrade(trade /* allowedSlippage */)

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalsSubmitted, setApprovalsSubmitted] = useState<boolean[]>([])

  const currentTradeIndex = useMemo(() => {
    if (allPlatformTrades) {
      return (
        allPlatformTrades.findIndex(
          trade => trade && platformOverride && trade.platform.name === platformOverride.name
        ) || 0
      )
    } else {
      return 0
    }
  }, [platformOverride, allPlatformTrades])

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      const newArray = [...approvalsSubmitted]
      newArray[currentTradeIndex] = true
      setApprovalsSubmitted(newArray)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approval])

  // Listen for changes on wrapState
  useEffect(() => {
    // watch GPv2
    if (wrapState === WrapState.WRAPPED) {
      if (approval === ApprovalState.APPROVED) setGnosisProtocolState(CoWTradeState.SWAP)
      else setGnosisProtocolState(CoWTradeState.APPROVAL)
    }
  }, [wrapState, approval, trade])

  const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.INPUT], chainId)
  const maxAmountOutput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.OUTPUT], chainId, false)

  // the callback to execute the swap
  const { callback: swapCallback, error: swapCallbackError } = useSwapCallback({
    trade,
    allowedSlippage,
    recipientAddressOrName: recipient,
  })

  const { priceImpactWithoutFee } = computeTradePriceBreakdown(trade)

  const handleSwap = useCallback(() => {
    if (priceImpactWithoutFee && !confirmPriceImpactWithoutFee(priceImpactWithoutFee)) {
      return
    }
    if (!swapCallback) {
      return
    }
    setSwapState({
      attemptingTxn: true,
      tradeToConfirm,
      showConfirm,
      swapErrorMessage: undefined,
      txHash: undefined,
    })
    swapCallback()
      .then(hash => {
        setSwapState({
          attemptingTxn: false,
          tradeToConfirm,
          showConfirm,
          swapErrorMessage: undefined,
          txHash: hash,
        })
        //reset states, in case we want to operate again
        setGnosisProtocolState(CoWTradeState.UNKNOWN)
        setWrapState && setWrapState(WrapState.UNKNOWN)
      })
      .catch(error => {
        setSwapState({
          attemptingTxn: false,
          tradeToConfirm,
          showConfirm,
          swapErrorMessage: error.message,
          txHash: undefined,
        })
        setGnosisProtocolState(CoWTradeState.UNKNOWN)
      })
  }, [priceImpactWithoutFee, swapCallback, tradeToConfirm, showConfirm, setWrapState])

  // warnings on slippage
  const priceImpactSeverity = warningSeverity(priceImpactWithoutFee)
  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode
  const showApproveFlow =
    !swapInputError &&
    (approval === ApprovalState.NOT_APPROVED ||
      approval === ApprovalState.PENDING ||
      (approvalsSubmitted[currentTradeIndex] && approval === ApprovalState.APPROVED)) &&
    !(priceImpactSeverity > 3 && !isExpertMode)

  const handleConfirmDismiss = useCallback(() => {
    setSwapState({
      showConfirm: false,
      tradeToConfirm,
      attemptingTxn,
      swapErrorMessage,
      txHash,
    })
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.INPUT, '')
      onUserInput(Field.OUTPUT, '')
    }
  }, [attemptingTxn, onUserInput, swapErrorMessage, tradeToConfirm, txHash])

  const handleAcceptChanges = useCallback(() => {
    setSwapState({
      tradeToConfirm: trade,
      swapErrorMessage,
      txHash,
      attemptingTxn,
      showConfirm,
    })
  }, [attemptingTxn, showConfirm, swapErrorMessage, trade, txHash])

  const handleInputSelect = useCallback(
    (inputCurrency: Currency) => {
      setPlatformOverride(null) // reset platform override, since best prices might be on a different platform
      setApprovalsSubmitted([]) // reset 2 step UI for approvals
      onCurrencySelection(Field.INPUT, inputCurrency)
    },
    [onCurrencySelection]
  )

  const handleMaxInput = useCallback(
    (fieldInput: string) => () => {
      maxAmountInput && fieldInput === Field.INPUT && onUserInput(Field.INPUT, maxAmountInput.toExact())
      maxAmountOutput && fieldInput === Field.OUTPUT && onUserInput(Field.OUTPUT, maxAmountOutput.toExact())
    },
    [maxAmountInput, maxAmountOutput, onUserInput]
  )

  const handleOutputSelect = useCallback(
    (outputCurrency: Currency) => {
      setPlatformOverride(null) // reset platform override, since best prices might be on a different platform
      onCurrencySelection(Field.OUTPUT, outputCurrency)
    },
    [onCurrencySelection]
  )

  const { fiatValueInput, fiatValueOutput, isFallbackFiatValueInput, isFallbackFiatValueOutput } = useHigherUSDValue({
    inputCurrencyAmount: parsedAmounts[Field.INPUT],
    outputCurrencyAmount: parsedAmounts[Field.OUTPUT],
  })

  const priceImpact = useMemo(
    () => computeFiatValuePriceImpact(fiatValueInput, fiatValueOutput),
    [fiatValueInput, fiatValueOutput]
  )

  const isInputPanelDisabled =
    (gnosisProtocolTradeState === CoWTradeState.APPROVAL ||
      gnosisProtocolTradeState === CoWTradeState.SWAP ||
      wrapState === WrapState.PENDING) &&
    trade instanceof CoWTrade

  return (
    <>
      <AppBody tradeDetailsOpen={!!trade}>
        <SwapPoolTabs active="swap" />
        <Wrapper id="swap-page">
          <ConfirmSwapModal
            isOpen={showConfirm}
            trade={trade}
            originalTrade={tradeToConfirm}
            onAcceptChanges={handleAcceptChanges}
            attemptingTxn={attemptingTxn}
            txHash={txHash}
            recipient={recipient}
            allowedSlippage={allowedSlippage}
            onConfirm={handleSwap}
            swapErrorMessage={swapErrorMessage}
            onDismiss={handleConfirmDismiss}
          />

          <AutoColumn gap="12px">
            <AutoColumn gap="3px">
              <CurrencyInputPanel
                value={formattedAmounts[Field.INPUT]}
                currency={currencies[Field.INPUT]}
                onUserInput={handleTypeInput}
                onMax={handleMaxInput(Field.INPUT)}
                onCurrencySelect={handleInputSelect}
                otherCurrency={currencies[Field.OUTPUT]}
                fiatValue={fiatValueInput}
                isFallbackFiatValue={isFallbackFiatValueInput}
                maxAmount={maxAmountInput}
                showCommonBases
                disabled={isInputPanelDisabled}
                id="swap-currency-input"
              />
              <SwitchIconContainer>
                <SwitchTokensAmountsContainer
                  onClick={() => {
                    setApprovalsSubmitted([]) // reset 2 step UI for approvals
                    onSwitchTokens()
                  }}
                >
                  <ArrowWrapper
                    clickable={!loading}
                    data-testid="switch-tokens-button"
                    className={loading ? 'rotate' : ''}
                  >
                    <SwapIcon />
                  </ArrowWrapper>
                </SwitchTokensAmountsContainer>
              </SwitchIconContainer>
              <CurrencyInputPanel
                value={formattedAmounts[Field.OUTPUT]}
                onUserInput={handleTypeOutput}
                onMax={handleMaxInput(Field.OUTPUT)}
                currency={currencies[Field.OUTPUT]}
                onCurrencySelect={handleOutputSelect}
                otherCurrency={currencies[Field.INPUT]}
                fiatValue={fiatValueOutput}
                priceImpact={priceImpact}
                isFallbackFiatValue={isFallbackFiatValueOutput}
                maxAmount={maxAmountOutput}
                showCommonBases
                disabled={isInputPanelDisabled}
                id="swap-currency-output"
              />
            </AutoColumn>

            <TradeDetails
              show={!showWrap}
              loading={loading}
              trade={trade}
              bestPricedTrade={bestPricedTrade}
              showAdvancedSwapDetails={showAdvancedSwapDetails}
              setShowAdvancedSwapDetails={setShowAdvancedSwapDetails}
              recipient={recipient}
            />
            <SwapButtons
              wrapInputError={wrapInputError}
              showApproveFlow={showApproveFlow}
              userHasSpecifiedInputOutput={userHasSpecifiedInputOutput}
              approval={approval}
              setSwapState={setSwapState}
              priceImpactSeverity={priceImpactSeverity}
              swapCallbackError={swapCallbackError}
              wrapType={wrapType}
              approvalSubmitted={approvalsSubmitted[currentTradeIndex]}
              currencies={currencies}
              trade={trade}
              swapInputError={swapInputError}
              swapErrorMessage={swapErrorMessage}
              loading={loading}
              onWrap={onWrap}
              approveCallback={approveCallback}
              handleSwap={handleSwap}
              handleInputSelect={handleInputSelect}
              wrapState={wrapState}
              setWrapState={setWrapState}
            />
          </AutoColumn>
        </Wrapper>
      </AppBody>
      {showAdvancedSwapDetails && (
        <AdvancedSwapDetailsDropdown
          isLoading={loading}
          trade={trade}
          allPlatformTrades={allPlatformTrades}
          onSelectedPlatformChange={setPlatformOverride}
        />
      )}
    </>
  )
}

const SwitchIconContainer = styled.div`
  height: 0;
  position: relative;
  width: 100%;
`
