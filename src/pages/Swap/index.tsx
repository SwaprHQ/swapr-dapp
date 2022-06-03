import {
  CurrencyAmount,
  JSBI,
  Trade,
  Token,
  RoutablePlatform,
  UniswapV2Trade,
  UniswapV2RoutablePlatform,
} from '@swapr/sdk'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { ButtonError, ButtonPrimary, ButtonConfirmed } from '../../components/Button'
import Column, { AutoColumn } from '../../components/Column'
import ConfirmSwapModal from '../../components/swap/ConfirmSwapModal'
import { CurrencyInputPanel } from '../../components/CurrencyInputPanel'
import { SwapPoolTabs } from '../../components/NavigationTabs'
import { RowBetween, RowFixed } from '../../components/Row'
import AdvancedSwapDetailsDropdown from '../../components/swap/AdvancedSwapDetailsDropdown'
import confirmPriceImpactWithoutFee from '../../components/swap/confirmPriceImpactWithoutFee'
import { ArrowWrapper, SwitchTokensAmountsContainer, Wrapper } from '../../components/swap/styleds'
import TradePrice from '../../components/swap/TradePrice'
import TokenWarningModal from '../../components/TokenWarningModal'
import { useActiveWeb3React } from '../../hooks'
import { useAllTokens, useCurrency } from '../../hooks/Tokens'
import { ApprovalState, useApproveCallbackFromTrade } from '../../hooks/useApproveCallback'
import { useSwapCallback } from '../../hooks/useSwapCallback'
import useWrapCallback, { WrapType } from '../../hooks/useWrapCallback'
import { Field, setRecipient } from '../../state/swap/actions'
import {
  useDefaultsFromURLSearch,
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useSwapLoading,
  useSwapState,
} from '../../state/swap/hooks'
import { useAdvancedSwapDetails, useIsExpertMode, useUserSlippageTolerance } from '../../state/user/hooks'
import { TYPE } from '../../theme'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { computeTradePriceBreakdown, warningSeverity } from '../../utils/prices'
import AppBody from '../AppBody'
import { useTargetedChainIdFromUrl } from '../../hooks/useTargetedChainIdFromUrl'
import { Tabs } from '../../components/swap/Tabs'
import { ReactComponent as SwapIcon } from '../../assets/svg/swap-icon.svg'
import { useHigherUSDValue } from '../../hooks/useUSDValue'
import { computeFiatValuePriceImpact } from '../../utils/computeFiatValuePriceImpact'
import { SwapSettings } from './../../components/swap/SwapSettings'
import { RecipientField } from '../../components/RecipientField'
import { Trans } from 'react-i18next'
import { AdvancedSwapDetailsToggle } from '../../components/AdvancedSwapDetailsToggle'

// Landing Page Imports
import './../../theme/landingPageTheme/stylesheet.css'
import Features from './../../components/LandingPageComponents/Features'
import Stats from './../../components/LandingPageComponents/Stats'
import CommunityBanner from './../../components/LandingPageComponents/CommunityBanner'
import Timeline from './../../components/LandingPageComponents/Timeline'
import CommunityLinks from './../../components/LandingPageComponents/CommunityLinks'
import BlogNavigation from './../../components/LandingPageComponents/BlogNavigation'
import Hero from './../../components/LandingPageComponents/layout/Hero'
import Footer from './../../components/LandingPageComponents/layout/Footer'
import SwapButtons from '../../components/swap/SwapButtons'
import Skeleton from 'react-loading-skeleton'

export type SwapData = {
  showConfirm: boolean
  tradeToConfirm: Trade | undefined
  attemptingTxn: boolean
  swapErrorMessage: string | undefined
  txHash: string | undefined
}

const SwitchIconContainer = styled.div`
  height: 0;
  position: relative;
  width: 100%;
`

const AppBodyContainer = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 3;
  min-height: calc(100vh - 340px);
`

const LandingBodyContainer = styled.section`
  width: calc(100% + 32px) !important;
`

export default function Swap() {
  const loading = useSwapLoading()
  const loadedUrlParams = useDefaultsFromURLSearch()
  const [platformOverride, setPlatformOverride] = useState<RoutablePlatform | null>(null)
  const allTokens = useAllTokens()
  const [showAdvancedSwapDetails, setShowAdvancedSwapDetails] = useAdvancedSwapDetails()
  // token warning stuff
  const [loadedInputCurrency, loadedOutputCurrency] = [
    useCurrency(loadedUrlParams?.inputCurrencyId),
    useCurrency(loadedUrlParams?.outputCurrencyId),
  ]
  const [dismissTokenWarning, setDismissTokenWarning] = useState<boolean>(false)
  const urlLoadedScammyTokens: Token[] = useMemo(() => {
    const normalizedAllTokens = Object.values(allTokens)
    if (normalizedAllTokens.length === 0) return []
    return [loadedInputCurrency, loadedOutputCurrency].filter((urlLoadedToken): urlLoadedToken is Token => {
      return (
        urlLoadedToken instanceof Token && !normalizedAllTokens.some(legitToken => legitToken.equals(urlLoadedToken))
      )
    })
  }, [loadedInputCurrency, loadedOutputCurrency, allTokens])
  const urlLoadedChainId = useTargetedChainIdFromUrl()
  const handleConfirmTokenWarning = useCallback(() => {
    setDismissTokenWarning(true)
  }, [])

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
  } = useDerivedSwapInfo(platformOverride || undefined)

  const { wrapType, execute: onWrap, inputError: wrapInputError } = useWrapCallback(
    currencies[Field.INPUT],
    currencies[Field.OUTPUT],
    typedValue
  )
  const bestPricedTrade = allPlatformTrades?.[0] // the best trade is always the first
  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE
  const trade = showWrap ? undefined : potentialTrade

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
  const [approval, approveCallback] = useApproveCallbackFromTrade(trade as UniswapV2Trade /* allowedSlippage */)

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    }
  }, [approval, approvalSubmitted])

  const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.INPUT], chainId)
  const maxAmountOutput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.OUTPUT], chainId, false)

  // the callback to execute the swap
  const { callback: swapCallback, error: swapCallbackError } = useSwapCallback({
    trade,
    allowedSlippage,
    recipientAddressOrName: recipient,
  })

  const { priceImpactWithoutFee } = computeTradePriceBreakdown(trade as UniswapV2Trade)

  const handleSwap = useCallback(() => {
    if (priceImpactWithoutFee && !confirmPriceImpactWithoutFee(priceImpactWithoutFee)) {
      return
    }
    if (!swapCallback) {
      return
    }
    setSwapState({ attemptingTxn: true, tradeToConfirm, showConfirm, swapErrorMessage: undefined, txHash: undefined })
    swapCallback()
      .then(hash => {
        setSwapState({ attemptingTxn: false, tradeToConfirm, showConfirm, swapErrorMessage: undefined, txHash: hash })
      })
      .catch(error => {
        setSwapState({
          attemptingTxn: false,
          tradeToConfirm,
          showConfirm,
          swapErrorMessage: error.message,
          txHash: undefined,
        })
      })
  }, [tradeToConfirm, priceImpactWithoutFee, showConfirm, swapCallback])

  // errors
  const [showInverted, setShowInverted] = useState<boolean>(false)

  // warnings on slippage
  const priceImpactSeverity = warningSeverity(priceImpactWithoutFee)

  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode
  const showApproveFlow =
    !swapInputError &&
    (approval === ApprovalState.NOT_APPROVED ||
      approval === ApprovalState.PENDING ||
      (approvalSubmitted && approval === ApprovalState.APPROVED)) &&
    !(priceImpactSeverity > 3 && !isExpertMode)

  const handleConfirmDismiss = useCallback(() => {
    setSwapState({ showConfirm: false, tradeToConfirm, attemptingTxn, swapErrorMessage, txHash })
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.INPUT, '')
      onUserInput(Field.OUTPUT, '')
    }
  }, [attemptingTxn, onUserInput, swapErrorMessage, tradeToConfirm, txHash])

  const handleAcceptChanges = useCallback(() => {
    setSwapState({ tradeToConfirm: trade, swapErrorMessage, txHash, attemptingTxn, showConfirm })
  }, [attemptingTxn, showConfirm, swapErrorMessage, trade, txHash])

  const handleInputSelect = useCallback(
    inputCurrency => {
      setPlatformOverride(null) // reset platform override, since best prices might be on a different platform
      setApprovalSubmitted(false) // reset 2 step UI for approvals
      onCurrencySelection(Field.INPUT, inputCurrency)
    },
    [onCurrencySelection]
  )

  const handleMaxInput = useCallback(
    fieldInput => () => {
      maxAmountInput && fieldInput === Field.INPUT && onUserInput(Field.INPUT, maxAmountInput.toExact())
      maxAmountOutput && fieldInput === Field.OUTPUT && onUserInput(Field.OUTPUT, maxAmountOutput.toExact())
    },
    [maxAmountInput, maxAmountOutput, onUserInput]
  )

  const handleOutputSelect = useCallback(
    outputCurrency => {
      setPlatformOverride(null) // reset platform override, since best prices might be on a different platform
      onCurrencySelection(Field.OUTPUT, outputCurrency)
    },
    [onCurrencySelection]
  )

  const { fiatValueInput, fiatValueOutput, isFallbackFiatValueInput, isFallbackFiatValueOutput } = useHigherUSDValue({
    inputCurrencyAmount: parsedAmounts[Field.INPUT],
    outputCurrencyAmount: parsedAmounts[Field.OUTPUT],
    trade,
  })

  const priceImpact = useMemo(() => computeFiatValuePriceImpact(fiatValueInput, fiatValueOutput), [
    fiatValueInput,
    fiatValueOutput,
  ])

  const [showAddRecipient, setShowAddRecipient] = useState<boolean>(false)

  return (
    <>
      <TokenWarningModal
        isOpen={
          (!urlLoadedChainId || chainId === urlLoadedChainId) &&
          urlLoadedScammyTokens.length > 0 &&
          !dismissTokenWarning
        }
        tokens={urlLoadedScammyTokens}
        onConfirm={handleConfirmTokenWarning}
      />
      <Hero>
        <AppBodyContainer>
          <Tabs />
          <AppBody tradeDetailsOpen={!!trade}>
            <SwapPoolTabs active={'swap'} />
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
                    showCommonBases
                    id="swap-currency-input"
                  />
                  <SwitchIconContainer>
                    <SwitchTokensAmountsContainer
                      onClick={() => {
                        setApprovalSubmitted(false) // reset 2 step UI for approvals
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
                    showCommonBases
                    id="swap-currency-output"
                  />
                </AutoColumn>
                {!showWrap && !!trade && (
                  <AutoColumn gap="8px">
                    <RowBetween alignItems="center">
                      <TYPE.body fontSize="11px" lineHeight="15px" fontWeight="500">
                        <Trans
                          i18nKey="bestPriceFoundOn"
                          values={{ platform: bestPricedTrade?.platform.name }}
                          components={[<span key="1" style={{ color: 'white', fontWeight: 700 }}></span>]}
                        />
                        {trade.platform.name !== UniswapV2RoutablePlatform.SWAPR.name ? (
                          <>
                            {' '}
                            <Trans
                              i18nKey="swapWithNoAdditionalFees"
                              components={[<span key="1" style={{ color: 'white', fontWeight: 700 }}></span>]}
                            />
                          </>
                        ) : null}
                      </TYPE.body>
                      <AdvancedSwapDetailsToggle
                        setShowAdvancedSwapDetails={setShowAdvancedSwapDetails}
                        showAdvancedSwapDetails={showAdvancedSwapDetails}
                      />
                    </RowBetween>
                    <RowBetween>
                      <SwapSettings showAddRecipient={showAddRecipient} setShowAddRecipient={setShowAddRecipient} />
                      <RowFixed>
                        <TradePrice
                          price={trade?.executionPrice}
                          showInverted={showInverted}
                          setShowInverted={setShowInverted}
                        />
                      </RowFixed>
                    </RowBetween>
                  </AutoColumn>
                )}
                {loading && <Skeleton width="100%" height="46px" />}
                {!showWrap && showAddRecipient && <RecipientField recipient={recipient} action={setRecipient} />}
                <div>
                  <SwapButtons
                    wrapInputError={wrapInputError}
                    showApproveFlow={showApproveFlow}
                    userHasSpecifiedInputOutput={userHasSpecifiedInputOutput}
                    approval={approval}
                    setSwapState={setSwapState}
                    priceImpactSeverity={priceImpactSeverity}
                    swapCallbackError={swapCallbackError}
                    wrapType={wrapType}
                    approvalSubmitted={approvalSubmitted}
                    currencies={currencies}
                    trade={trade}
                    swapInputError={swapInputError}
                    swapErrorMessage={swapErrorMessage}
                    loading={loading}
                    onWrap={onWrap}
                    approveCallback={approveCallback}
                    handleSwap={handleSwap}
                  />
                </div>
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
        </AppBodyContainer>
      </Hero>
      <LandingBodyContainer>
        <Features />
        <Stats />
        <CommunityBanner />
        <Timeline />
        <CommunityLinks />
        <BlogNavigation />
      </LandingBodyContainer>
      <Footer />
    </>
  )
}
