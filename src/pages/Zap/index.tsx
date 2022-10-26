import {
  ChainId,
  CoWTrade,
  Currency,
  CurrencyAmount,
  JSBI,
  Pair,
  RoutablePlatform,
  Route,
  Token,
  Trade,
  UniswapV2RoutablePlatform,
  UniswapV2Trade,
} from '@swapr/sdk'

// Landing Page Imports
import './../../theme/landingPageTheme/stylesheet.css'
import { BigNumber, Contract } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { Box, Flex } from 'rebass'
import styled, { useTheme } from 'styled-components'

import { ReactComponent as SwapIcon } from '../../assets/images/swap-icon.svg'
import { AutoColumn } from '../../components/Column'
import { CurrencyInputPanel } from '../../components/CurrencyInputPanel'
import { InputType } from '../../components/CurrencyInputPanel/CurrencyInputPanel.types'
import { CurrencyView } from '../../components/CurrencyInputPanel/CurrencyView'
import BlogNavigation from '../../components/LandingPageComponents/BlogNavigation'
import CommunityBanner from '../../components/LandingPageComponents/CommunityBanner'
import CommunityLinks from '../../components/LandingPageComponents/CommunityLinks'
import Features from '../../components/LandingPageComponents/Features'
import Footer from '../../components/LandingPageComponents/layout/Footer'
import Hero from '../../components/LandingPageComponents/layout/Hero'
import Stats from '../../components/LandingPageComponents/Stats'
import Timeline from '../../components/LandingPageComponents/Timeline'
import { StyledFlex } from '../../components/Pool/SortByDropdown/SortByDropdown'
import { filterPairsForZap } from '../../components/SearchModal/utils/filtering'
import AdvancedSwapDetailsDropdown from '../../components/Swap/AdvancedSwapDetailsDropdown'
import confirmPriceImpactWithoutFee from '../../components/Swap/confirmPriceImpactWithoutFee'
import ConfirmSwapModal from '../../components/Swap/ConfirmSwapModal'
import { ArrowWrapper, SwitchTokensAmountsContainer, Wrapper } from '../../components/Swap/styleds'
import SwapRoute from '../../components/Swap/SwapRoute'
import { Tabs } from '../../components/Swap/Tabs'
import { TradeDetails } from '../../components/Swap/TradeDetails'
import TokenWarningModal from '../../components/TokenWarningModal'
import SwapButtons from '../../components/Zap/SwapButtons'
import { ROUTABLE_PLATFORM_LOGO, ZAP_CONTRACT_ADDRESS } from '../../constants'
import ZAP_ABI from '../../constants/abis/zap.json'
import { usePair, usePairs } from '../../data/Reserves'
import { useActiveWeb3React } from '../../hooks'
import { useAllTokens, useCurrency, useToken } from '../../hooks/Tokens'
import { ApprovalState, useApproveCallback, useApproveCallbackFromTrade } from '../../hooks/useApproveCallback'
import { useZapContract } from '../../hooks/useContract'
import { useSwapCallback } from '../../hooks/useSwapCallback'
import { useTargetedChainIdFromUrl } from '../../hooks/useTargetedChainIdFromUrl'
import { useHigherUSDValue } from '../../hooks/useUSDValue'
import { useWrapCallback, WrapState, WrapType } from '../../hooks/useWrapCallback'
import { useZapCallback } from '../../hooks/useZapCallback'
import { AppState } from '../../state'
import { selectCurrency } from '../../state/swap/actions'
import {
  useDefaultsFromURLSearch,
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useSwapState,
} from '../../state/swap/hooks'
import {
  useAdvancedSwapDetails,
  useIsExpertMode,
  useUserPreferredGasPrice,
  useUserSlippageTolerance,
} from '../../state/user/hooks'
import { useDerivedZapInfo, useZapActionHandlers, useZapState } from '../../state/zap/hooks'
import { Field } from '../../state/zap/types'
import { TYPE } from '../../theme'
import { computeFiatValuePriceImpact } from '../../utils/computeFiatValuePriceImpact'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { computeTradePriceBreakdown, warningSeverity } from '../../utils/prices'
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

const StyledRouteFlex = styled(Flex)`
  align-items: center;
  background-color: rgba(25, 26, 36, 0.55);
  boarder: 1px solid ${({ theme }) => theme.purple6};
  border-radius: 12px;
  padding: 18px 16px;
  margin-bottom: 16px !important;
`

export enum CoWTradeState {
  UNKNOWN, // default
  WRAP,
  APPROVAL,
  SWAP,
}

export default function Zap() {
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
  // const { independentField, typedValue, recipient } = useSwapState()
  const { independentField, typedValue, recipient, INPUT, OUTPUT, pairTokens } = useZapState()

  const {
    tradeToken0,
    tradeToken1,
    currencyBalances,
    parsedAmount,
    currencies,
    inputError: swapInputError,
    loading,
  } = useDerivedZapInfo()

  const zapIn = independentField === Field.INPUT

  const filterPairs = useCallback(
    (pair: Pair) => {
      return filterPairsForZap(pair, chainId ?? ChainId.MAINNET)
    },
    [chainId]
  )

  const amountOutZero = CurrencyAmount.nativeCurrency(JSBI.BigInt(0), chainId ?? ChainId.MAINNET)
  const pathToPairToken0 =
    tradeToken0 && tradeToken0.details instanceof Route ? tradeToken0.details.path.map(token => token.address) : []
  const pathToPairToken1 =
    tradeToken1 && tradeToken1.details instanceof Route ? tradeToken1.details.path.map(token => token.address) : []

  //GPv2 is falling in the true case, not very useful for what I think I need
  const parsedAmounts = {
    [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : tradeToken0?.inputAmount,
    [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : tradeToken0?.outputAmount,
  }

  const { onUserInput, onSwitchTokens, onCurrencySelection, onPairSelection } = useZapActionHandlers()

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
    [dependentField]: parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  }

  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] && currencies[Field.OUTPUT] && parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0))
  )

  // check whether the user has approved the router on the input token
  const [approval, approveCallback] = useApproveCallback(parsedAmount, ZAP_CONTRACT_ADDRESS)
  console.log('zap approve', approval, parsedAmount)

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalsSubmitted, setApprovalsSubmitted] = useState<boolean[]>([])

  const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.INPUT], chainId)
  const maxAmountOutput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.OUTPUT], chainId, false)

  const { callback: zapCallback, error: zapCallbackError } = useZapCallback({
    amountFrom: parsedAmount,
    amount0Min: amountOutZero,
    amount1Min: amountOutZero,
    pathToPairToken0,
    pathToPairToken1,
    allowedSlippage: 0,
    recipientAddressOrName: null,
    router: '',
  })

  const { priceImpactWithoutFee } = computeTradePriceBreakdown(tradeToken0)

  // warnings on slippage
  const priceImpactSeverity = warningSeverity(priceImpactWithoutFee)

  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode
  // const showApproveFlow =
  //   !swapInputError &&
  //   (approval === ApprovalState.NOT_APPROVED ||
  //     approval === ApprovalState.PENDING ||
  //     (approvalsSubmitted[currentTradeIndex] && approval === ApprovalState.APPROVED)) &&
  //   !(priceImpactSeverity > 3 && !isExpertMode)

  const handleAcceptChanges = useCallback(() => {}, [])
  const handleSwap = useCallback(() => {}, [])

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
      setApprovalsSubmitted([]) // reset 2 step UI for approvals
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

  const [zapPair, setZapPair] = useState<Pair>()

  const { token0Id, token1Id } = useSelector((state: AppState) => state.zap.pairTokens)

  const [token0, token1] = [useToken(token0Id), useToken(token1Id)]

  const pair = usePair(token0 ?? undefined, token1 ?? undefined)[1]

  useEffect(() => {
    if (pair) {
      setZapPair(pair)
    }
  }, [pair])

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

  const { fiatValueInput, fiatValueOutput, isFallbackFiatValueInput, isFallbackFiatValueOutput } = useHigherUSDValue({
    inputCurrencyAmount: parsedAmounts[Field.INPUT],
    outputCurrencyAmount: parsedAmounts[Field.OUTPUT],
  })

  const priceImpact = useMemo(
    () => computeFiatValuePriceImpact(fiatValueInput, fiatValueOutput),
    [fiatValueInput, fiatValueOutput]
  )

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
