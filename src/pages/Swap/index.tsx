import {
  Currency,
  CurrencyAmount,
  JSBI,
  Trade,
  Token,
  RoutablePlatform,
  UniswapV2Trade,
  UniswapV2RoutablePlatform,
  GnosisProtocolTrade,
} from '@swapr/sdk'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { ButtonError, ButtonPrimary, ButtonConfirmed } from '../../components/Button'
import Column, { AutoColumn } from '../../components/Column'
import ConfirmSwapModal from '../../components/swap/ConfirmSwapModal'
import { CurrencyInputPanel } from '../../components/CurrencyInputPanel'
import { SwapPoolTabs } from '../../components/NavigationTabs'
import { AutoRow, RowBetween, RowFixed } from '../../components/Row'
import AdvancedSwapDetailsDropdown from '../../components/swap/AdvancedSwapDetailsDropdown'
import confirmPriceImpactWithoutFee from '../../components/swap/confirmPriceImpactWithoutFee'
import { ArrowWrapper, SwapCallbackError, SwitchTokensAmountsContainer, Wrapper } from '../../components/swap/styleds'
import TradePrice from '../../components/swap/TradePrice'
import TokenWarningModal from '../../components/TokenWarningModal'
import ProgressSteps from '../../components/ProgressSteps'
import { useActiveWeb3React } from '../../hooks'
import { useAllTokens, useCurrency } from '../../hooks/Tokens'
import { ApprovalState, useApproveCallbackFromTrade } from '../../hooks/useApproveCallback'
import { useSwapCallback } from '../../hooks/useSwapCallback'
import { useTradeWrapCallback, WrapState, WrapType } from '../../hooks/useWrapCallback'
import { Field, setRecipient } from '../../state/swap/actions'
import {
  useDefaultsFromURLSearch,
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useSwapState,
} from '../../state/swap/hooks'
import { useAdvancedSwapDetails, useExpertModeManager, useUserSlippageTolerance } from '../../state/user/hooks'
import { TYPE } from '../../theme'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { computeTradePriceBreakdown, warningSeverity } from '../../utils/prices'
import AppBody from '../AppBody'
import Loader from '../../components/Loader'
import { useTargetedChainIdFromUrl } from '../../hooks/useTargetedChainIdFromUrl'
import { Tabs } from '../../components/swap/Tabs'
import { ReactComponent as SwapIcon } from '../../assets/svg/swap-icon.svg'
import { useHigherUSDValue } from '../../hooks/useUSDValue'
import { computeFiatValuePriceImpact } from '../../utils/computeFiatValuePriceImpact'
import { SwapSettings } from './../../components/swap/SwapSettings'
import { SwapButton } from '../../components/swap/SwapButton'
import { RecipientField } from '../../components/RecipientField'
import { ButtonConnect } from '../../components/ButtonConnect'
import { Trans } from 'react-i18next'
import { AdvancedSwapDetailsToggle } from '../../components/AdvancedSwapDetailsToggle'
import { useTokenBalance } from '../../state/wallet/hooks'
import { wrappedCurrency } from '../../utils/wrappedCurrency'
import { wrappedAmount } from '@swapr/sdk/dist/entities/trades/utils'

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

const rotateAnimation = keyframes`
    0% { transform: rotate(0deg) };
    100% { transform: rotate(360deg) };
`

const SwapIconLoading = styled(SwapIcon)`
  animation: ${rotateAnimation} 2s linear infinite;
`

enum GnosisProtocolTradeStatus {
  UNKNOWN, // default
  WRAP,
  APPROVAL,
  SWAP,
}

export default function Swap() {
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

  const { account, chainId } = useActiveWeb3React()

  // for expert mode
  const [isExpertMode] = useExpertModeManager()

  // get custom setting values for user
  const [allowedSlippage] = useUserSlippageTolerance()

  // swap state
  const { independentField, typedValue, recipient } = useSwapState()
  const {
    loading: swapInfoIsLoading,
    trade: potentialTrade,
    allPlatformTrades,
    currencyBalances,
    parsedAmount,
    currencies,
    inputError: swapInputError,
  } = useDerivedSwapInfo(platformOverride || undefined)

  // For GPv2 trades, have a state which holds: approval status (handled by useApproveCallback), and
  // wrap status(use useWrapCallback + and a state variable)
  const [gnosisProtocolTradeStatus, setGnosisProtocolStatus] = useState<GnosisProtocolTradeStatus>(
    GnosisProtocolTradeStatus.WRAP
  )
  const { wrapType, execute: onWrap, inputError: wrapInputError, wrapState, setWrapState } = useTradeWrapCallback(
    potentialTrade,
    typedValue
  )

  const bestPricedTrade = allPlatformTrades?.[0] // the best trade is always the first

  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE && !(potentialTrade instanceof GnosisProtocolTrade)

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
  const isValid = !swapInputError
  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT

  const isGnosisTradeRequireWrap = trade instanceof GnosisProtocolTrade && isInputCurrencyNative(trade) && isValid

  console.info({ trade, isNative: isInputCurrencyNative(trade) })

  const wrappedToken = useTokenBalance(account as string, wrappedCurrency(trade?.inputAmount?.currency, chainId))
  console.info({ wrappedToken })

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
  const [{ showConfirm, tradeToConfirm, swapErrorMessage, attemptingTxn, txHash }, setSwapState] = useState<{
    showConfirm: boolean
    tradeToConfirm: Trade | undefined
    attemptingTxn: boolean
    swapErrorMessage: string | undefined
    txHash: string | undefined
  }>({
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

  const route = trade instanceof UniswapV2Trade ? trade?.route : true
  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] && currencies[Field.OUTPUT] && parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0))
  )
  const noRoute = !route

  // check whether the user has approved the router on the input token
  const [approval, approveCallback] = useApproveCallbackFromTrade(trade /* allowedSlippage */)

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    }
  }, [approval, approvalSubmitted])

  // Listen for changes on wrapState
  useEffect(() => {
    // watch GPv2
    if (wrapState === WrapState.WRAPPED) {
      if (approval === ApprovalState.APPROVED) setGnosisProtocolStatus(GnosisProtocolTradeStatus.SWAP)
      else setGnosisProtocolStatus(GnosisProtocolTradeStatus.APPROVAL)
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
        if (trade instanceof GnosisProtocolTrade) {
          setGnosisProtocolStatus(GnosisProtocolTradeStatus.WRAP)
          setWrapState && setWrapState(WrapState.UNKNOWN)
        }
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
  }, [trade, tradeToConfirm, priceImpactWithoutFee, showConfirm, setWrapState, swapCallback])

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

  const SwapBoxButton = () => {
    // Eco Router is computing the best route for the user, so we need to show a loading indicator
    const isGnosisStatusComputed = approval === ApprovalState.UNKNOWN && isGnosisTradeRequireWrap
    if (swapInfoIsLoading || isGnosisStatusComputed) {
      return (
        <ButtonPrimary style={{ textAlign: 'center' }} disabled>
          Loading
        </ButtonPrimary>
      )
    }

    // Wallet is not connected, show connect button
    if (!account) {
      return <ButtonConnect />
    }

    if (noRoute && userHasSpecifiedInputOutput) {
      return (
        <ButtonPrimary style={{ textAlign: 'center' }} disabled>
          Insufficient liquidity
        </ButtonPrimary>
      )
    }

    if (isGnosisTradeRequireWrap) {
      const isApprovalRequired = approval !== ApprovalState.APPROVED
      const swapDisabled =
        !isValid ||
        isApprovalRequired ||
        (priceImpactSeverity > 3 && !isExpertMode) ||
        gnosisProtocolTradeStatus !== GnosisProtocolTradeStatus.SWAP
      const width = showApproveFlow && isApprovalRequired ? '31%' : '48%'

      const wrappedCurrency = trade && wrappedAmount(trade.inputAmount, trade.chainId).currency

      return (
        <RowBetween>
          {
            <ButtonConfirmed
              onClick={onWrap}
              disabled={gnosisProtocolTradeStatus !== GnosisProtocolTradeStatus.WRAP || wrapState === WrapState.PENDING}
              width={width}
              altDisabledStyle={wrapState !== WrapState.UNKNOWN} //{approval === ApprovalState.PENDING} // show solid button while waiting
              confirmed={wrapState === WrapState.WRAPPED}
            >
              {wrapState === WrapState.PENDING ? (
                <AutoRow gap="6px" justify="center">
                  Wrapping <Loader />
                </AutoRow>
              ) : wrapState === WrapState.WRAPPED ? (
                'Wrapped'
              ) : (
                'Wrap ' + currencies[Field.INPUT]?.symbol
              )}
            </ButtonConfirmed>
          }

          {// If the EOA needs to approve the WXDAI or any ERC20
          showApproveFlow && isApprovalRequired && (
            <ButtonConfirmed
              onClick={() => approveCallback().then(() => setGnosisProtocolStatus(GnosisProtocolTradeStatus.SWAP))}
              disabled={gnosisProtocolTradeStatus !== GnosisProtocolTradeStatus.APPROVAL || approvalSubmitted}
              width={width}
              altDisabledStyle={approval === ApprovalState.PENDING} // show solid button while waiting
            >
              {approval === ApprovalState.PENDING ? (
                <AutoRow gap="6px" justify="center">
                  Approving <Loader />
                </AutoRow>
              ) : approvalSubmitted ? (
                'Approved'
              ) : (
                'Approve ' + wrappedCurrency?.symbol // Change this to wrapped token
              )}
            </ButtonConfirmed>
          )}
          <SwapButton
            onClick={() => {
              if (isExpertMode) {
                handleSwap()
              } else {
                setSwapState({
                  tradeToConfirm: trade,
                  attemptingTxn: false,
                  swapErrorMessage: undefined,
                  showConfirm: true,
                  txHash: undefined,
                })
              }
            }}
            width={width}
            id="swap-button"
            disabled={swapDisabled}
            platformName={trade?.platform.name}
            //error={isValid && priceImpactSeverity > 2}
            priceImpactSeverity={priceImpactSeverity}
            isExpertMode={isExpertMode}
          >
            {priceImpactSeverity > 3 && !isExpertMode
              ? `Price Impact High`
              : `Swap${priceImpactSeverity > 2 ? ' Anyway' : ''}`}
          </SwapButton>
        </RowBetween>
      )
    }

    // Wallet is connected
    // User is trying to un/wrap
    if (showWrap) {
      return (
        <ButtonPrimary disabled={Boolean(wrapInputError)} onClick={onWrap} data-testid="wrap-button">
          {wrapInputError ?? (wrapType === WrapType.WRAP ? 'Wrap' : wrapType === WrapType.UNWRAP ? 'Unwrap' : null)}
        </ButtonPrimary>
      )
    }

    if (showApproveFlow) {
      return (
        <RowBetween>
          <ButtonConfirmed
            onClick={approveCallback}
            disabled={approval !== ApprovalState.NOT_APPROVED || approvalSubmitted}
            width="48%"
            altDisabledStyle={approval === ApprovalState.PENDING} // show solid button while waiting
            confirmed={approval === ApprovalState.APPROVED}
          >
            {approval === ApprovalState.PENDING ? (
              <AutoRow gap="6px" justify="center">
                Approving <Loader />
              </AutoRow>
            ) : approvalSubmitted && approval === ApprovalState.APPROVED ? (
              'Approved'
            ) : (
              'Approve ' + currencies[Field.INPUT]?.symbol
            )}
          </ButtonConfirmed>
          <ButtonError
            onClick={() => {
              if (isExpertMode) {
                handleSwap()
              } else {
                setSwapState({
                  tradeToConfirm: trade,
                  attemptingTxn: false,
                  swapErrorMessage: undefined,
                  showConfirm: true,
                  txHash: undefined,
                })
              }
            }}
            width="48%"
            id="swap-button"
            disabled={!isValid || approval !== ApprovalState.APPROVED || (priceImpactSeverity > 3 && !isExpertMode)}
            error={isValid && priceImpactSeverity > 2}
          >
            {priceImpactSeverity > 3 && !isExpertMode
              ? `Price Impact High`
              : `Swap${priceImpactSeverity > 2 ? ' Anyway' : ''}`}
          </ButtonError>
        </RowBetween>
      )
    }

    // Show swap button

    return (
      <SwapButton
        onClick={() => {
          if (isExpertMode) {
            handleSwap()
          } else {
            setSwapState({
              tradeToConfirm: trade,
              attemptingTxn: false,
              swapErrorMessage: undefined,
              showConfirm: true,
              txHash: undefined,
            })
          }
        }}
        id="swap-button"
        disabled={!isValid || (priceImpactSeverity > 3 && !isExpertMode) || !!swapCallbackError}
        platformName={trade?.platform.name}
        swapInputError={swapInputError}
        priceImpactSeverity={priceImpactSeverity}
        isExpertMode={isExpertMode}
      ></SwapButton>
    )
  }

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
                      <ArrowWrapper clickable data-testid="switch-tokens-button">
                        {swapInfoIsLoading ? <SwapIconLoading /> : <SwapIcon />}
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
                {!showWrap && showAddRecipient && <RecipientField recipient={recipient} action={setRecipient} />}
                <div>
                  <SwapBoxButton />
                  {showApproveFlow && !isGnosisTradeRequireWrap && (
                    <Column style={{ marginTop: '1rem' }}>
                      <ProgressSteps steps={[approval === ApprovalState.APPROVED]} />
                    </Column>
                  )}
                  {isExpertMode && swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
                </div>
              </AutoColumn>
            </Wrapper>
          </AppBody>
          {showAdvancedSwapDetails && (
            <AdvancedSwapDetailsDropdown
              isLoading={swapInfoIsLoading}
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

/**
 * @param trade - the whole trade class, whatever it may contain
 * @returns boolean - if the input currency exists and is native
 */
function isInputCurrencyNative(potentialTrade: Trade | undefined) {
  return potentialTrade && potentialTrade.inputAmount && Currency.isNative(potentialTrade?.inputAmount?.currency)
    ? true
    : false
}
