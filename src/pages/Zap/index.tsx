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
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'

import { ReactComponent as SwapIcon } from '../../assets/images/swap-icon.svg'
import { AutoColumn } from '../../components/Column'
import { CurrencyInputPanel } from '../../components/CurrencyInputPanel'
import { InputType } from '../../components/CurrencyInputPanel/CurrencyInputPanel.types'
import BlogNavigation from '../../components/LandingPageComponents/BlogNavigation'
import CommunityBanner from '../../components/LandingPageComponents/CommunityBanner'
import CommunityLinks from '../../components/LandingPageComponents/CommunityLinks'
import Features from '../../components/LandingPageComponents/Features'
import Footer from '../../components/LandingPageComponents/layout/Footer'
import Hero from '../../components/LandingPageComponents/layout/Hero'
import Stats from '../../components/LandingPageComponents/Stats'
import Timeline from '../../components/LandingPageComponents/Timeline'
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
import { useActiveWeb3React } from '../../hooks'
import { useAllTokens, useCurrency, useToken } from '../../hooks/Tokens'
import { ApprovalState, useApproveCallback, useApproveCallbackFromTrade } from '../../hooks/useApproveCallback'
import { useTargetedChainIdFromUrl } from '../../hooks/useTargetedChainIdFromUrl'
import { useHigherUSDValue } from '../../hooks/useUSDValue'
import { useWrapCallback, WrapState, WrapType } from '../../hooks/useWrapCallback'
import { SwapTx, useZapCallback, ZapInTx, ZapInType, ZapOutTx } from '../../hooks/useZapCallback'
import { AppState } from '../../state'
import { useDerivedSwapInfo } from '../../state/swap/hooks'
import { StateKey } from '../../state/swap/types'
import { useAdvancedSwapDetails, useIsExpertMode, useUserSlippageTolerance } from '../../state/user/hooks'
import {
  useDefaultsFromURLSearch,
  UseDerivedZapInfoResult,
  useZapActionHandlers,
  useZapState,
} from '../../state/zap/hooks'
import { Field, ZapState } from '../../state/zap/types'
import { getPathFromTrade } from '../../utils/getPathFromTrade'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { computeTradePriceBreakdown, warningSeverity, warningSeverityZap } from '../../utils/prices'
import AppBody from '../AppBody'

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

// const StyledRouteFlex = styled(Flex)`
//   align-items: center;
//   background-color: rgba(25, 26, 36, 0.55);
//   boarder: 1px solid ${({ theme }) => theme.purple6};
//   border-radius: 12px;
//   padding: 18px 16px;
//   margin-bottom: 16px !important;
// `

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
  const [showAdvancedSwapDetails, setShowAdvancedSwapDetails] = useAdvancedSwapDetails()
  // token warning stuff
  const [loadedInputCurrency, loadedOutputCurrency] = [
    useCurrency(loadedUrlParams?.inputCurrencyId),
    useCurrency(loadedUrlParams?.outputCurrencyId),
  ]
  // console.log('zap currencies loaded', { loadedInputCurrency, loadedOutputCurrency })
  const [dismissTokenWarning, setDismissTokenWarning] = useState<boolean>(false)

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
  // const { independentField, typedValue, recipient } = useSwapState()
  const { independentField, typedValue, recipient } = useZapState()

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
  } = useDerivedSwapInfo<ZapState, UseDerivedZapInfoResult>({ key: StateKey.ZAP })

  const [zapPair, setZapPair] = useState<Pair>()

  const { token0Id, token1Id } = useSelector((state: AppState) => state.zap.pairTokens)

  const [token0, token1] = [useToken(token0Id), useToken(token1Id)]

  const pair = usePair(token0 ?? undefined, token1 ?? undefined)[1]

  const zapIn = independentField === Field.INPUT

  const filterPairs = useCallback(
    (pair: Pair) => {
      return filterPairsForZap(pair, chainId ?? ChainId.MAINNET)
    },
    [chainId]
  )

  const urlLoadedScammyTokens: Token[] = useMemo(() => {
    const normalizedAllTokens = Object.values(allTokens)
    if (normalizedAllTokens.length === 0) return []
    return [loadedInputCurrency, token0Id, token1Id].filter((urlLoadedToken): urlLoadedToken is Token => {
      return (
        urlLoadedToken instanceof Token && !normalizedAllTokens.some(legitToken => legitToken.equals(urlLoadedToken))
      )
    })
  }, [allTokens, loadedInputCurrency, token0Id, token1Id])

  // const amountOutZero = CurrencyAmount.nativeCurrency(JSBI.BigInt(0), chainId ?? ChainId.MAINNET)

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
  // const {
  //   wrapType: wrapType1,
  //   execute: onWrap1,
  //   inputError: wrapInputError1,
  //   wrapState: wrapState1,
  // } = useWrapCallback(
  //   potentialTrade1?.inputAmount.currency,
  //   potentialTrade1?.outputAmount.currency,
  //   potentialTrade1 instanceof CoWTrade,
  //   potentialTrade1?.inputAmount?.toSignificant(6) ?? typedValue
  // )

  const bestPricedTrade = potentialTrade0
  const bestPricedTrade1 = potentialTrade1
  const showWrap = wrapType !== WrapType.NOT_APPLICABLE && !(potentialTrade0 instanceof CoWTrade)

  console.log('zap wrap 0', potentialTrade0?.outputAmount.currency.symbol, showWrap, wrapType, potentialTrade0)

  const trade = showWrap ? undefined : potentialTrade0
  const trade1 = showWrap ? undefined : potentialTrade1

  const parsedAmounts = {
    [Field.INPUT]: parsedAmount,
    [Field.OUTPUT]: zapIn ? zapInLiquidityMinted : zapOutOutputAmount,
  }

  const { onUserInput, onSwitchTokens, onCurrencySelection, onPairSelection } = useZapActionHandlers()

  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value)
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
    [dependentField]: parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  }

  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] && currencies[Field.OUTPUT] && parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0))
  )

  // check whether the user has approved the router on the input token
  const [approvalZap, approveCallbackZap] = useApproveCallback(
    parsedAmount,
    chainId ? ZAP_CONTRACT_ADDRESS[chainId] : undefined
  )

  // check whether the user has approved the router on the input token
  const [approval, approveCallback] = useApproveCallbackFromTrade(trade /* allowedSlippage */)

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState(false)

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
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

  const swapTokenA: SwapTx = {
    amount: zapInInputAmountTrade0?.toSignificant() ?? '0',
    amountMin: zeroBN,
    path: getPathFromTrade(potentialTrade0),
    dexIndex: dexIdSwapA,
  }

  const swapTokenB: SwapTx = {
    amount: zapInInputAmountTrade1?.toSignificant() ?? '0',
    amountMin: zeroBN,
    path: getPathFromTrade(potentialTrade1),
    dexIndex: dexIdSwapB,
  }

  const zapInParams: ZapInTx = {
    amountAMin: zeroBN,
    amountBMin: zeroBN,
    amountLPMin: zeroBN,
    dexIndex: dexIdZap,
  }

  const zapOutParams: ZapOutTx = {
    amountLpFrom: parsedAmount?.toSignificant() ?? '0',
    amountTokenToMin: zeroBN,
    dexIndex: dexId2,
  }

  const { callback: zapCallback, error: zapCallbackError } = useZapCallback({
    zapIn: zapIn ? zapInParams : undefined,
    zapOut: zapIn ? undefined : zapOutParams,
    swapTokenA,
    swapTokenB,
    receiver: recipient,
  })

  console.log('zap callback', zapCallback, zapCallbackError, inputError)

  // console.log('zap error', zapCallbackError)

  const { priceImpactWithoutFee: priceImpactWithoutFeeTrade0 } = computeTradePriceBreakdown(trade)
  const { priceImpactWithoutFee: priceImpactWithoutFeeTrade1 } = computeTradePriceBreakdown(trade1)
  console.log('zap price impact', priceImpactWithoutFeeTrade0?.toFixed(), priceImpactWithoutFeeTrade1?.toFixed())
  console.log('zap price impact mix', warningSeverityZap(priceImpactWithoutFeeTrade0, priceImpactWithoutFeeTrade1))

  const handleZap = useCallback(() => {
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
    (approval === ApprovalState.NOT_APPROVED ||
      approval === ApprovalState.PENDING ||
      (approvalSubmitted && approval === ApprovalState.APPROVED)) &&
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

  const handleInputSelect = useCallback(
    (inputCurrency: Currency) => {
      setPlatformOverride(null) // reset platform override, since best prices might be on a different platform
      setApprovalSubmitted(false) // reset 2 step UI for approvals
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
      onCurrencySelection(zapIn ? Field.OUTPUT : Field.INPUT, pair.liquidityToken)
      onPairSelection(pair.token0.address, pair.token1.address)

      setZapPair(pair)
    },
    [onCurrencySelection, onPairSelection, zapIn]
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
          <AppBody>
            <Wrapper id="zap-page">
              <ConfirmSwapModal
                isOpen={showConfirm}
                trade={undefined}
                originalTrade={tradeToConfirm}
                onAcceptChanges={() => {}}
                attemptingTxn={attemptingTxn}
                txHash={txHash}
                recipient={recipient}
                allowedSlippage={allowedSlippage}
                onConfirm={handleZap}
                swapErrorMessage={swapErrorMessage}
                onDismiss={handleConfirmDismiss}
              />

              <AutoColumn gap="12px">
                <AutoColumn gap="3px">
                  <CurrencyInputPanel
                    id="zap-currency-input"
                    value={formattedAmounts[Field.INPUT]}
                    currency={currencies[Field.INPUT]}
                    pair={zapIn ? null : zapPair}
                    onUserInput={handleTypeInput}
                    onMax={handleMaxInput(Field.INPUT)}
                    onCurrencySelect={handleInputSelect}
                    onPairSelect={handleOnPairSelect}
                    otherCurrency={currencies[Field.INPUT]}
                    fiatValue={fiatValueInput}
                    isFallbackFiatValue={isFallbackFiatValueInput}
                    maxAmount={maxAmountInput}
                    showCommonBases
                    disabled={false}
                    inputType={zapIn ? InputType.currency : InputType.pair}
                    filterPairs={filterPairs}
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
                    id="zap-currency-output"
                    value={formattedAmounts[Field.OUTPUT]}
                    onUserInput={handleTypeInput}
                    currency={currencies[Field.OUTPUT]}
                    pair={zapIn ? zapPair : null}
                    onMax={handleMaxInput(Field.OUTPUT)}
                    onCurrencySelect={handleOutputSelect}
                    onPairSelect={handleOnPairSelect}
                    otherCurrency={currencies[Field.OUTPUT]}
                    fiatValue={fiatValueInput}
                    isFallbackFiatValue={isFallbackFiatValueInput}
                    maxAmount={maxAmountInput}
                    showCommonBases
                    disabled={true}
                    inputType={zapIn ? InputType.pair : InputType.currency}
                    filterPairs={filterPairs}
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
                  approvalSubmitted={approvalSubmitted}
                  currencies={currencies}
                  trade={trade}
                  swapInputError={inputError}
                  swapErrorMessage={swapErrorMessage}
                  loading={loading}
                  onWrap={onWrap}
                  approveCallback={approveCallbackZap}
                  handleSwap={handleZap}
                  handleInputSelect={handleInputSelect}
                  wrapState={wrapState}
                  setWrapState={setWrapState}
                  tradeSecondTokenZap={trade1}
                />
              </AutoColumn>
            </Wrapper>
          </AppBody>
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
