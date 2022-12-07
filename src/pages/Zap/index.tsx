import {
  ChainId,
  Currency,
  CurrencyAmount,
  JSBI,
  Pair,
  RoutablePlatform,
  Token,
  Trade,
  UniswapV2RoutablePlatform,
} from '@swapr/sdk'

// Landing Page Imports
import './../../theme/landingPageTheme/stylesheet.css'
import { BigNumber } from 'ethers'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { Flex } from 'rebass'
import styled from 'styled-components'

import { ReactComponent as SwapIcon } from '../../assets/images/swap-icon.svg'
import { AutoColumn } from '../../components/Column'
import { CurrencyInputPanel } from '../../components/CurrencyInputPanel'
import { InputType } from '../../components/CurrencyInputPanel/CurrencyInputPanel.types'
import { PageMetaData } from '../../components/PageMetaData'
import { filterPairsForZap } from '../../components/SearchModal/utils/filtering'
import confirmPriceImpactWithoutFee from '../../components/Swap/confirmPriceImpactWithoutFee'
import ConfirmSwapModal from '../../components/Swap/ConfirmSwapModal'
import { ArrowWrapper, SwitchTokensAmountsContainer, Wrapper } from '../../components/Swap/styleds'
import SwapButtons from '../../components/Swap/SwapButtons'
import { Tabs } from '../../components/Swap/Tabs'
import { TradeDetails } from '../../components/Swap/TradeDetailsZap'
import TokenWarningModal from '../../components/TokenWarningModal'
import { PriceImpact, SWAP_INPUT_ERRORS, ZAP_CONTRACT_ADDRESS } from '../../constants'
import { usePair } from '../../data/Reserves'
import { useActiveWeb3React, useUnsupportedChainIdError } from '../../hooks'
import { useAllTokens, useCurrency, useToken } from '../../hooks/Tokens'
import { ApprovalState, useApproveCallback, useApproveCallbackFromTrade } from '../../hooks/useApproveCallback'
import { useRouter } from '../../hooks/useRouter'
import { useTargetedChainIdFromUrl } from '../../hooks/useTargetedChainIdFromUrl'
import { useHigherUSDValue } from '../../hooks/useUSDValue'
import { WrapType } from '../../hooks/useWrapCallback'
import { useZapCallback } from '../../hooks/useZapCallback'
import { AppState } from '../../state'
import { useDerivedSwapInfo } from '../../state/swap/hooks'
import { Field, StateKey } from '../../state/swap/types'
import { useIsExpertMode, useUpdateSelectedSwapTab, useUserSlippageTolerance } from '../../state/user/hooks'
import { SwapTabs } from '../../state/user/reducer'
import {
  useDefaultsFromURLSearch,
  UseDerivedZapInfoResult,
  useZapActionHandlers,
  useZapParams,
  useZapState,
} from '../../state/zap/hooks'
import { ZapState } from '../../state/zap/types'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { computeTradePriceBreakdown, warningSeverityZap } from '../../utils/prices'
import AppBody from '../AppBody'
import BlogNavigation from './../../components/LandingPageComponents/BlogNavigation'
import CommunityBanner from './../../components/LandingPageComponents/CommunityBanner'
import CommunityLinks from './../../components/LandingPageComponents/CommunityLinks'
import Features from './../../components/LandingPageComponents/Features'
import Footer from './../../components/LandingPageComponents/layout/Footer'
import Hero from './../../components/LandingPageComponents/layout/Hero'
import Stats from './../../components/LandingPageComponents/Stats'
import Timeline from './../../components/LandingPageComponents/Timeline'

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
  max-width: 460px;

  ${({ theme }) => theme.mediaWidth.upToLarge`
    min-height: 0;
    max-width: 550px;
  `};

  ${({ theme }) => theme.mediaWidth.upToMedium`
    min-height: 0;
    min-width: 100%;
  `};
`

const LandingBodyContainer = styled.section`
  width: calc(100% + 32px) !important;
`

export enum CoWTradeState {
  UNKNOWN, // default
  WRAP,
  APPROVAL,
  SWAP,
}

export default function Zap() {
  const loadedUrlParams = useDefaultsFromURLSearch()
  const [, setPlatformOverride] = useState<RoutablePlatform | null>(null)
  const allTokens = useAllTokens()
  const { pathname } = useRouter()
  const [activeTab, setActiveTab] = useUpdateSelectedSwapTab()

  const [zapPair, setZapPair] = useState<Pair>()
  const { token0Id, token1Id } = useSelector((state: AppState) => state.zap.pairTokens)
  const [token0, token1] = [useToken(token0Id), useToken(token1Id)]
  const pair = usePair(token0 ?? undefined, token1 ?? undefined)[1]

  // token warning stuff
  const [loadedInputCurrency, loadedOutputCurrency] = [
    useCurrency(loadedUrlParams?.inputCurrencyId),
    useCurrency(loadedUrlParams?.outputCurrencyId),
  ]
  const [dismissTokenWarning, setDismissTokenWarning] = useState<boolean>(false)
  const urlLoadedScammyTokens: Token[] = useMemo(() => {
    const normalizedAllTokens = Object.values(allTokens)
    if (normalizedAllTokens.length === 0) return []
    return [loadedInputCurrency, token0Id, token1Id].filter((urlLoadedToken): urlLoadedToken is Token => {
      return (
        urlLoadedToken instanceof Token && !normalizedAllTokens.some(legitToken => legitToken.equals(urlLoadedToken))
      )
    })
  }, [loadedInputCurrency, token0Id, token1Id, allTokens])
  const urlLoadedChainId = useTargetedChainIdFromUrl()
  const handleConfirmTokenWarning = useCallback(() => {
    setDismissTokenWarning(true)
  }, [])

  useEffect(() => {
    if (pathname.includes('zap') && activeTab !== SwapTabs.ZAP) {
      setActiveTab(SwapTabs.ZAP)
    }
  }, [pathname]) // eslint-disable-line

  const { chainId } = useActiveWeb3React()

  // for expert mode
  const isExpertMode = useIsExpertMode()

  // get custom setting values for user
  const allowedSlippage = useUserSlippageTolerance()

  // zap state
  const { independentField, typedValue, recipient } = useZapState()
  const isZapIn = independentField === Field.INPUT

  const filterPairs = useCallback(
    (pair: Pair) => {
      return filterPairsForZap(pair, chainId ?? ChainId.MAINNET)
    },
    [chainId]
  )
  const derivedInfo = useDerivedSwapInfo<ZapState, UseDerivedZapInfoResult>({ key: StateKey.ZAP })

  const zapParams = useZapParams(derivedInfo, zapPair, isZapIn)
  const currencies = derivedInfo.currencies
  const currencyBalances = derivedInfo.currencyBalances
  const isZapNotAvailable = derivedInfo.inputError === SWAP_INPUT_ERRORS.ZAP_NOT_AVAILABLE

  const parsedAmounts = {
    [Field.INPUT]: derivedInfo.parsedAmount,
    [Field.OUTPUT]: isZapIn ? zapParams.liquidityMinted : derivedInfo.zapOutOutputAmount,
  }

  const { onSwitchTokens, onCurrencySelection, onUserInput, onPairSelection } = useZapActionHandlers()

  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(independentField, value)
    },
    [independentField, onUserInput]
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
    [dependentField]: parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  }

  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] && currencies[Field.OUTPUT] && parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0))
  )

  // check whether the user has approved the router on the input token
  const [approvalZap, approveCallbackZap] = useApproveCallback(
    derivedInfo.parsedAmount,
    chainId && ZAP_CONTRACT_ADDRESS[chainId] !== '' ? ZAP_CONTRACT_ADDRESS[chainId] : undefined
  )

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalsSubmitted, setApprovalsSubmitted] = useState(false)

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approvalZap === ApprovalState.PENDING) {
      setApprovalsSubmitted(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approvalZap])

  const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.INPUT], chainId)
  const maxAmountOutput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.OUTPUT], chainId, false)

  const { callback: zapCallback, error: zapCallbackError } = useZapCallback({
    zapIn: zapParams.zapIn,
    zapOut: zapParams.zapOut,
    swapTokenA: zapParams.swapTokenA,
    swapTokenB: zapParams.swapTokenB,
    recipient,
    affiliate: undefined,
    transferResidual: true,
  })

  const { priceImpactWithoutFee: priceImpactWithoutFeeTrade0 } = computeTradePriceBreakdown(derivedInfo.tradeToken0)
  const { priceImpactWithoutFee: priceImpactWithoutFeeTrade1 } = computeTradePriceBreakdown(derivedInfo.tradeToken1)

  const handleZap = useCallback(() => {
    if (
      priceImpactWithoutFeeTrade0 &&
      !confirmPriceImpactWithoutFee(priceImpactWithoutFeeTrade0)
      // (priceImpactWithoutFeeTrade1 && !confirmPriceImpactWithoutFee(priceImpactWithoutFeeTrade1))
    ) {
      return
    }
    if (!zapCallback) {
      return
    }
    setSwapState({
      attemptingTxn: true,
      tradeToConfirm,
      showConfirm,
      swapErrorMessage: undefined,
      txHash: undefined,
    })
    zapCallback()
      .then(hash => {
        setSwapState({
          attemptingTxn: false,
          tradeToConfirm,
          showConfirm,
          swapErrorMessage: undefined,
          txHash: hash,
        })
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
  }, [priceImpactWithoutFeeTrade0, zapCallback, tradeToConfirm, showConfirm])

  // warnings on slippage
  const priceImpactSeverity = warningSeverityZap(priceImpactWithoutFeeTrade0, priceImpactWithoutFeeTrade1)

  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode
  const showApproveFlow =
    !derivedInfo.inputError &&
    (approvalZap === ApprovalState.NOT_APPROVED ||
      approvalZap === ApprovalState.PENDING ||
      (approvalsSubmitted && approvalZap === ApprovalState.APPROVED)) &&
    !(priceImpactSeverity > PriceImpact.HIGH && !isExpertMode)

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

  const handleAcceptChanges = useCallback(() => {}, [])

  const handleInputSelect = useCallback(
    (inputCurrency: Currency) => {
      setPlatformOverride(null) // reset platform override, since best prices might be on a different platform
      setApprovalsSubmitted(false) // reset 2 step UI for approvals
      onCurrencySelection(Field.INPUT, inputCurrency)
    },
    [onCurrencySelection]
  )

  const handleOutputSelect = useCallback(
    (outputCurrency: Currency) => {
      setPlatformOverride(null) // reset platform override, since best prices might be on a different platform
      onCurrencySelection(Field.OUTPUT, outputCurrency)
    },
    [onCurrencySelection]
  )

  useEffect(() => {
    if (!zapPair && pair) {
      setZapPair(pair)
    } else if (!token0Id || !token1Id) {
      setZapPair(undefined)
    }
  }, [pair, token0Id, token1Id, zapPair])

  const handleOnPairSelect = useCallback(
    (pair: Pair) => {
      setPlatformOverride(null) // reset platform override, since best prices might be on a different platform
      onCurrencySelection(isZapIn ? Field.OUTPUT : Field.INPUT, pair.liquidityToken)
      onPairSelection(pair.token0.address, pair.token1.address)

      setZapPair(pair)
    },
    [onCurrencySelection, onPairSelection, isZapIn]
  )

  const handleMaxInput = useCallback(
    (fieldInput: string) => () => {
      maxAmountInput && fieldInput === Field.INPUT && onUserInput(Field.INPUT, maxAmountInput.toExact())
      maxAmountOutput && fieldInput === Field.OUTPUT && onUserInput(Field.OUTPUT, maxAmountOutput.toExact())
    },
    [maxAmountInput, maxAmountOutput, onUserInput]
  )

  const { fiatValueInput, isFallbackFiatValueInput } = useHigherUSDValue({
    inputCurrencyAmount: parsedAmounts[Field.INPUT],
    outputCurrencyAmount: parsedAmounts[Field.OUTPUT],
  })

  const renderSwapBox = () => (
    <>
      <Flex mb={2} alignItems="center" justifyContent="space-between" width="100%">
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      </Flex>
      <AppBody tradeDetailsOpen={!!derivedInfo.tradeToken0}>
        <Wrapper id="zap-page">
          <ConfirmSwapModal
            isOpen={showConfirm}
            trade={undefined}
            originalTrade={tradeToConfirm}
            onAcceptChanges={handleAcceptChanges}
            attemptingTxn={attemptingTxn}
            txHash={txHash}
            recipient={recipient}
            allowedSlippage={allowedSlippage}
            onConfirm={handleZap}
            swapErrorMessage={swapErrorMessage} //zapErrorMessage
            onDismiss={handleConfirmDismiss}
          />

          <AutoColumn gap="12px">
            <AutoColumn gap="3px">
              <CurrencyInputPanel
                value={formattedAmounts[Field.INPUT]}
                currency={currencies[Field.INPUT]}
                pair={zapPair}
                onUserInput={handleTypeInput}
                onMax={handleMaxInput(Field.INPUT)}
                onCurrencySelect={handleInputSelect}
                onPairSelect={handleOnPairSelect}
                otherCurrency={currencies[Field.INPUT]}
                fiatValue={fiatValueInput}
                isFallbackFiatValue={isFallbackFiatValueInput}
                maxAmount={maxAmountInput}
                showCommonBases
                id="zap-currency-input"
                inputType={isZapIn ? InputType.currency : InputType.pair}
                filterPairs={filterPairs}
              />
              <SwitchIconContainer>
                <SwitchTokensAmountsContainer
                  onClick={() => {
                    setApprovalsSubmitted(false) // reset 2 step UI for approvals TODO: do we need it here?
                    onSwitchTokens()
                  }}
                >
                  <ArrowWrapper
                    clickable={!derivedInfo.loading}
                    data-testid="switch-tokens-button"
                    className={derivedInfo.loading ? 'rotate' : ''}
                  >
                    <SwapIcon />
                  </ArrowWrapper>
                </SwitchTokensAmountsContainer>
              </SwitchIconContainer>
              <CurrencyInputPanel
                value={formattedAmounts[Field.OUTPUT]}
                onMax={handleMaxInput(Field.OUTPUT)}
                currency={currencies[Field.OUTPUT]}
                pair={zapPair}
                onCurrencySelect={handleOutputSelect}
                onPairSelect={handleOnPairSelect}
                otherCurrency={currencies[Field.OUTPUT]}
                isFallbackFiatValue={isFallbackFiatValueInput} //
                maxAmount={maxAmountOutput}
                showCommonBases
                disabled={true}
                isDisabledStyled={true}
                disableCurrencySelect={isZapNotAvailable}
                inputType={isZapIn ? InputType.pair : InputType.currency}
                filterPairs={filterPairs}
                id="zap-currency-output"
                inputTitle="Zap output will be estimated"
              />
            </AutoColumn>
            <TradeDetails
              show={true}
              loading={derivedInfo.loading}
              trade={derivedInfo.tradeToken0}
              trade1={derivedInfo.tradeToken1}
              bestPricedTrade={derivedInfo.tradeToken0}
              bestPricedTrade1={derivedInfo.tradeToken1}
              recipient={recipient}
            />

            <SwapButtons
              wrapInputError={undefined}
              showApproveFlow={showApproveFlow}
              userHasSpecifiedInputOutput={userHasSpecifiedInputOutput}
              approval={approvalZap}
              setSwapState={setSwapState}
              priceImpactSeverity={priceImpactSeverity}
              swapCallbackError={zapCallbackError}
              wrapType={WrapType.NOT_APPLICABLE}
              approvalSubmitted={approvalsSubmitted}
              currencies={currencies}
              trade={derivedInfo.tradeToken0}
              tradeSecondTokenZap={derivedInfo.tradeToken1}
              swapInputError={derivedInfo.inputError}
              swapErrorMessage={swapErrorMessage}
              loading={derivedInfo.loading}
              onWrap={undefined}
              approveCallback={approveCallbackZap}
              handleSwap={handleZap}
              handleInputSelect={handleInputSelect}
              wrapState={undefined}
              setWrapState={undefined}
            />
          </AutoColumn>
        </Wrapper>
      </AppBody>
    </>
  )

  return (
    <>
      <PageMetaData title="Zap | Swapr" />
      <TokenWarningModal
        isOpen={
          (!urlLoadedChainId || chainId === urlLoadedChainId) &&
          urlLoadedScammyTokens.length > 0 &&
          !dismissTokenWarning
        }
        tokens={urlLoadedScammyTokens}
        onConfirm={handleConfirmTokenWarning}
      />
      <>
        <Hero>
          <Flex
            justifyContent="center"
            alignItems={['center', 'center', 'center', 'start', 'start', 'start']}
            flexDirection={['column', 'column', 'column', 'row']}
          >
            <AppBodyContainer>{renderSwapBox()}</AppBodyContainer>
          </Flex>
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
    </>
  )
}
