import {
  ChainId,
  CoWTrade,
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
import { TradeDetails } from '../../components/Swap/TradeDetails'
import TokenWarningModal from '../../components/TokenWarningModal'
import { PriceImpact, SUPPORTED_DEX_ZAP_INDEX, ZAP_CONTRACT_ADDRESS } from '../../constants'
import { usePair } from '../../data/Reserves'
import { useActiveWeb3React, useUnsupportedChainIdError } from '../../hooks'
import { useAllTokens, useCurrency, useToken } from '../../hooks/Tokens'
import { ApprovalState, useApproveCallback, useApproveCallbackFromTrade } from '../../hooks/useApproveCallback'
import { useIsDesktop } from '../../hooks/useIsDesktopByMedia'
import { useRouter } from '../../hooks/useRouter'
import { useTargetedChainIdFromUrl } from '../../hooks/useTargetedChainIdFromUrl'
import { useHigherUSDValue } from '../../hooks/useUSDValue'
import { useWrapCallback, WrapState, WrapType } from '../../hooks/useWrapCallback'
import { SwapTx, useZapCallback, ZapInTx, ZapOutTx } from '../../hooks/useZapCallback'
import { AppState } from '../../state'
import { useDerivedSwapInfo } from '../../state/swap/hooks'
import { Field, StateKey } from '../../state/swap/types'
import {
  useAdvancedSwapDetails,
  useIsExpertMode,
  useUpdateSelectedSwapTab,
  useUserSlippageTolerance,
} from '../../state/user/hooks'
import {
  useDefaultsFromURLSearch,
  UseDerivedZapInfoResult,
  useZapActionHandlers,
  useZapParams,
  useZapState,
} from '../../state/zap/hooks'
import { ZapState } from '../../state/zap/types'
import { getPathFromTrade } from '../../utils/getPathFromTrade'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { computeSlippageAdjustedAmounts, computeTradePriceBreakdown, warningSeverityZap } from '../../utils/prices'
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

const getZapParams = (
  data: UseDerivedZapInfoResult,
  isZapIn = true
): { zapInParams: ZapInTx | undefined; zapOutParams: ZapOutTx | undefined; swapTokenA: SwapTx; swapTokenB: SwapTx } => {
  const zeroBN = BigNumber.from(0)
  const dexIdZap = BigNumber.from(SUPPORTED_DEX_ZAP_INDEX[UniswapV2RoutablePlatform.SWAPR.name]) //TODO pass zap dex
  const dexIdSwapA = BigNumber.from(
    SUPPORTED_DEX_ZAP_INDEX[data.tradeToken0?.platform.name ?? UniswapV2RoutablePlatform.SWAPR.name]
  )
  const dexIdSwapB = BigNumber.from(
    SUPPORTED_DEX_ZAP_INDEX[data.tradeToken1?.platform.name ?? UniswapV2RoutablePlatform.SWAPR.name]
  )

  const tradeToken0 = data.tradeToken0
  const tradeToken1 = data.tradeToken1
  const slippageAdjustedAmountsTrade0 = tradeToken0 && computeSlippageAdjustedAmounts(tradeToken0)
  const slippageAdjustedAmountsTrade1 = tradeToken1 && computeSlippageAdjustedAmounts(tradeToken1)

  const swapTokenA: SwapTx = {
    amount: data.zapInInputAmountTrade0?.toSignificant() ?? '0',
    amountMin: slippageAdjustedAmountsTrade0?.OUTPUT?.toSignificant() ?? '0',
    path: getPathFromTrade(data.tradeToken0),
    dexIndex: dexIdSwapA,
  }

  const swapTokenB: SwapTx = {
    amount: data.zapInInputAmountTrade1?.toSignificant() ?? '0',
    amountMin: slippageAdjustedAmountsTrade1?.OUTPUT?.toSignificant() ?? '0',
    path: getPathFromTrade(data.tradeToken1),
    dexIndex: dexIdSwapB,
  }

  const zapInParams = isZapIn
    ? {
        amountAMin: zeroBN,
        amountBMin: zeroBN,
        amountLPMin: zeroBN,
        dexIndex: dexIdZap,
      }
    : undefined

  const zapOutParams = isZapIn
    ? undefined
    : {
        amountLpFrom: data.parsedAmount?.toSignificant() ?? '0',
        amountTokenToMin: zeroBN,
        dexIndex: dexIdZap,
      }

  return { zapInParams, zapOutParams, swapTokenA, swapTokenB }
}

export default function Zap() {
  const isDesktop = useIsDesktop()
  const loadedUrlParams = useDefaultsFromURLSearch()
  const [, setPlatformOverride] = useState<RoutablePlatform | null>(null)
  const allTokens = useAllTokens()
  const [showAdvancedSwapDetails, setShowAdvancedSwapDetails] = useAdvancedSwapDetails()
  const isUnsupportedChainIdError = useUnsupportedChainIdError()
  const { navigate, pathname } = useRouter()
  const isInProMode = pathname.includes('/pro') // comment
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
    if (isInProMode) {
      if (!isDesktop) {
        navigate('/swap')
      }
    }
  }, [isDesktop, navigate, isInProMode])

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
  const {
    currencies,
    currencyBalances,
    loading,
    parsedAmount,
    tradeToken0: potentialTrade0,
    tradeToken1: potentialTrade1,
    inputError,
    zapInInputAmountTrade0,
    zapInInputAmountTrade1,
    zapInLiquidityMinted,
    zapOutOutputAmount,
  } = derivedInfo
  const zapParams = useZapParams(derivedInfo, zapPair, isZapIn)
  console.log('ZAP DONE TRADE 0', potentialTrade0)
  console.log('ZAP DONE TRADE 1', potentialTrade1)

  // For GPv2 trades, have a state which holds: approval status (handled by useApproveCallback), and
  // wrap status(use useWrapCallback and a state variable)
  const [gnosisProtocolTradeState, setGnosisProtocolState] = useState(CoWTradeState.UNKNOWN)
  const {
    wrapType,
    execute: onWrap,
    inputError: wrapInputError,
    wrapState,
    setWrapState,
  } = useWrapCallback({
    inputCurrency: potentialTrade0?.inputAmount.currency,
    outputCurrency: potentialTrade0?.outputAmount.currency,
    isGnosisTrade: potentialTrade0 instanceof CoWTrade,
    typedValue: potentialTrade0?.inputAmount.toSignificant(6) ?? typedValue,
  })

  const bestPricedTrade = potentialTrade0
  const bestPricedTrade1 = potentialTrade1

  const showWrap = wrapType !== WrapType.NOT_APPLICABLE && !(potentialTrade0 instanceof CoWTrade)
  console.log('zap wrap 0', potentialTrade0?.outputAmount.currency.symbol, showWrap, wrapType, potentialTrade0)

  const trade = showWrap ? undefined : potentialTrade0
  const trade1 = showWrap ? undefined : potentialTrade1

  const parsedAmounts = {
    [Field.INPUT]: parsedAmount,
    [Field.OUTPUT]: isZapIn ? zapParams.liquidityMinted : zapOutOutputAmount,
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
  console.log('FORMATTED', zapInLiquidityMinted, parsedAmounts, formattedAmounts)

  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] && currencies[Field.OUTPUT] && parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0))
  )

  // check whether the user has approved the router on the input token
  const [approvalZap, approveCallbackZap] = useApproveCallback(
    parsedAmount,
    chainId && ZAP_CONTRACT_ADDRESS[chainId] !== '' ? ZAP_CONTRACT_ADDRESS[chainId] : undefined
  )

  // check whether the user has approved the router on the input token
  const [approval, approveCallback] = useApproveCallbackFromTrade(trade /* allowedSlippage */)

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalsSubmitted, setApprovalsSubmitted] = useState(false)

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approvalZap === ApprovalState.PENDING) {
      setApprovalsSubmitted(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approvalZap])

  // Listen for changes on wrapState
  useEffect(() => {
    // watch GPv2
    if (wrapState === WrapState.WRAPPED) {
      if (approvalZap === ApprovalState.APPROVED) setGnosisProtocolState(CoWTradeState.SWAP)
      else setGnosisProtocolState(CoWTradeState.APPROVAL)
    }
  }, [wrapState, approvalZap, trade])

  const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.INPUT], chainId)
  const maxAmountOutput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.OUTPUT], chainId, false)
  const dexIdSwapA = BigNumber.from(
    SUPPORTED_DEX_ZAP_INDEX[bestPricedTrade?.platform.name ?? UniswapV2RoutablePlatform.SWAPR.name]
  )
  const dexIdSwapB = BigNumber.from(
    SUPPORTED_DEX_ZAP_INDEX[bestPricedTrade1?.platform.name ?? UniswapV2RoutablePlatform.SWAPR.name]
  )
  const dexIdZap = BigNumber.from(SUPPORTED_DEX_ZAP_INDEX[UniswapV2RoutablePlatform.SWAPR.name]) //TODO pass zap dex
  console.log('zap dex index', dexIdSwapA.toString(), dexIdSwapB.toString())
  const tstPath0 = ['0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6']
  const tstPath1 = ['0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6']
  const zeroBN = BigNumber.from(0)
  const dexId2 = BigNumber.from('2')
  const userAddress = '0x372A291A9cad69b0F5F231cf1885574e9De7fD33'
  console.log('zap path0', potentialTrade0?.details, getPathFromTrade(potentialTrade0))
  console.log('zap path1', potentialTrade1?.details, getPathFromTrade(potentialTrade1))
  // const { zapInParams, zapOutParams, swapTokenA, swapTokenB } = getZapParams(derivedInfo, isZapIn)
  // const zapParams = useZapParams(derivedInfo, zapPair, isZapIn)
  // const swapTokenA: SwapTx = {
  //   amount: zapInInputAmountTrade0?.toSignificant() ?? '0',
  //   amountMin: zeroBN,
  //   path: getPathFromTrade(potentialTrade0),
  //   dexIndex: dexIdSwapA,
  // }

  // const swapTokenB: SwapTx = {
  //   amount: zapInInputAmountTrade1?.toSignificant() ?? '0',
  //   amountMin: zeroBN,
  //   path: getPathFromTrade(potentialTrade1),
  //   dexIndex: dexIdSwapB,
  // }

  // const zapInParams: ZapInTx = {
  //   amountAMin: zeroBN,
  //   amountBMin: zeroBN,
  //   amountLPMin: zeroBN,
  //   dexIndex: dexIdZap,
  // }

  // // TODO zap Out params
  // const zapOutParams: ZapOutTx = {
  //   amountLpFrom: parsedAmount?.toSignificant() ?? '0',
  //   amountTokenToMin: zeroBN,
  //   dexIndex: dexId2,
  // }

  const { callback: zapCallback, error: zapCallbackError } = useZapCallback({
    zapIn: zapParams.zapIn,
    zapOut: zapParams.zapOut,
    swapTokenA: zapParams.swapTokenA,
    swapTokenB: zapParams.swapTokenB,
    recipient,
    affiliate: undefined,
    transferResidual: true,
  })

  console.log('zap callback', zapCallback, zapCallbackError, inputError)

  // console.log('zap error', zapCallbackError)

  const { priceImpactWithoutFee: priceImpactWithoutFeeTrade0 } = computeTradePriceBreakdown(trade)
  const { priceImpactWithoutFee: priceImpactWithoutFeeTrade1 } = computeTradePriceBreakdown(trade1)
  console.log('zap price impact', priceImpactWithoutFeeTrade0?.toFixed(), priceImpactWithoutFeeTrade1?.toFixed())
  console.log('zap price impact mix', warningSeverityZap(priceImpactWithoutFeeTrade0, priceImpactWithoutFeeTrade1))

  const handleZap = useCallback(() => {
    //  TODO: shouldnt check also for priceImpact for trade1
    if (priceImpactWithoutFeeTrade0 && !confirmPriceImpactWithoutFee(priceImpactWithoutFeeTrade0)) {
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
  }, [priceImpactWithoutFeeTrade0, zapCallback, tradeToConfirm, showConfirm, setWrapState])

  // warnings on slippage
  const priceImpactSeverity = warningSeverityZap(priceImpactWithoutFeeTrade0, priceImpactWithoutFeeTrade1)

  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode
  const showApproveFlow =
    !inputError &&
    (approvalZap === ApprovalState.NOT_APPROVED ||
      approvalZap === ApprovalState.PENDING ||
      (approvalsSubmitted && approvalZap === ApprovalState.APPROVED)) &&
    !(priceImpactSeverity > PriceImpact.HIGH && !isExpertMode)

  // const handleAcceptChanges = useCallback(() => {}, [])
  console.log('approveFlow', showApproveFlow)

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
      <AppBody tradeDetailsOpen={!!trade}>
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
                pair={isZapIn ? null : zapPair}
                onUserInput={handleTypeInput}
                onMax={handleMaxInput(Field.INPUT)}
                onCurrencySelect={handleInputSelect}
                onPairSelect={handleOnPairSelect}
                otherCurrency={currencies[Field.INPUT]} // TODO: old INPUT hmm?
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
                onUserInput={handleTypeInput} // TODO: make it optional as it is disabled
                onMax={handleMaxInput(Field.OUTPUT)}
                currency={currencies[Field.OUTPUT]}
                pair={isZapIn ? zapPair : null}
                onCurrencySelect={handleOutputSelect}
                onPairSelect={handleOnPairSelect}
                otherCurrency={currencies[Field.OUTPUT]}
                fiatValue={fiatValueInput} // TODO; make it optional
                // priceImpact={priceImpact}
                isFallbackFiatValue={isFallbackFiatValueInput} //
                maxAmount={maxAmountOutput}
                showCommonBases
                disabled={true}
                inputType={isZapIn ? InputType.pair : InputType.currency}
                filterPairs={filterPairs}
                id="zap-currency-output"
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
            <TradeDetails
              show={!showWrap}
              loading={loading}
              trade={trade1}
              bestPricedTrade={bestPricedTrade1}
              showAdvancedSwapDetails={showAdvancedSwapDetails}
              setShowAdvancedSwapDetails={setShowAdvancedSwapDetails}
              recipient={recipient}
            />
            <SwapButtons
              wrapInputError={wrapInputError}
              showApproveFlow={showApproveFlow}
              userHasSpecifiedInputOutput={userHasSpecifiedInputOutput}
              approval={approvalZap}
              setSwapState={setSwapState}
              priceImpactSeverity={priceImpactSeverity}
              swapCallbackError={zapCallbackError}
              wrapType={wrapType}
              approvalSubmitted={approvalsSubmitted}
              currencies={currencies}
              trade={trade}
              tradeSecondTokenZap={trade1}
              swapInputError={inputError}
              swapErrorMessage={swapErrorMessage}
              loading={loading}
              onWrap={onWrap}
              approveCallback={approveCallbackZap}
              handleSwap={handleZap}
              handleInputSelect={handleInputSelect}
              wrapState={wrapState}
              setWrapState={setWrapState}
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
