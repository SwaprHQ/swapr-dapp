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
import { Box } from 'react-feather'
import { useDispatch } from 'react-redux'
import styled from 'styled-components'

import { ReactComponent as SwapIcon } from '../../assets/images/swap-icon.svg'
import { AutoColumn } from '../../components/Column'
import { CurrencyInputPanel } from '../../components/CurrencyInputPanel'
import { CurrencyView } from '../../components/CurrencyInputPanel/CurrencyView'
import BlogNavigation from '../../components/LandingPageComponents/BlogNavigation'
import CommunityBanner from '../../components/LandingPageComponents/CommunityBanner'
import CommunityLinks from '../../components/LandingPageComponents/CommunityLinks'
import Features from '../../components/LandingPageComponents/Features'
import Footer from '../../components/LandingPageComponents/layout/Footer'
import Hero from '../../components/LandingPageComponents/layout/Hero'
import Stats from '../../components/LandingPageComponents/Stats'
import Timeline from '../../components/LandingPageComponents/Timeline'
import { PairSelectPanel } from '../../components/PairSelectPanel'
import { PairSearchModal } from '../../components/SearchModal/PairSearchModal'
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
import { ZAP_CONTRACT_ADDRESS, ZERO_ADDRESS } from '../../constants'
import ZAP_ABI from '../../constants/abis/zap.json'
import { useActiveWeb3React } from '../../hooks'
import { useAllTokens, useCurrency } from '../../hooks/Tokens'
import { ApprovalState, useApproveCallback, useApproveCallbackFromTrade } from '../../hooks/useApproveCallback'
import { useZapContract } from '../../hooks/useContract'
import { useSwapCallback } from '../../hooks/useSwapCallback'
import { useTargetedChainIdFromUrl } from '../../hooks/useTargetedChainIdFromUrl'
import { useHigherUSDValue } from '../../hooks/useUSDValue'
import { useWrapCallback, WrapState, WrapType } from '../../hooks/useWrapCallback'
import { useZapCallback } from '../../hooks/useZapCallback'
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

export enum CoWTradeState {
  UNKNOWN, // default
  WRAP,
  APPROVAL,
  SWAP,
}

export default function Zap() {
  const zapContract = useZapContract()

  const loadedUrlParams = useDefaultsFromURLSearch()
  const [platformOverride, setPlatformOverride] = useState<RoutablePlatform | null>(null)
  const [pairZap, setPairZap] = useState<Pair>()
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

  const { chainId, library } = useActiveWeb3React()

  // for expert mode
  const isExpertMode = useIsExpertMode()

  // get custom setting values for user
  const allowedSlippage = useUserSlippageTolerance()

  // swap state
  // const { independentField, typedValue, recipient } = useSwapState()
  const { independentField, typedValue, recipient, INPUT, OUTPUT } = useZapState()

  const {
    trade0: potentialTrade,
    trade1: potentialTrade1,
    allPlatformTrades,
    currencyBalances,
    parsedAmount,
    currencies,
    inputError: swapInputError,
    loading,
  } = useDerivedZapInfo()

  //TODO check chainID
  const tst = potentialTrade?.details as Route
  const tst1 = potentialTrade1?.details as Route
  let pathToken0Addresses: string[] = []
  let pathToken1Addresses: string[] = []
  // TODO GET PATH
  if (chainId) {
    if (tst) {
      const pathToken0 = tst?.path
      for (let i = 0; i < pathToken0.length; i++) {
        pathToken0Addresses.push(pathToken0[i].address)
      }
    } else if (INPUT.tokenId && INPUT.tokenId === OUTPUT.token0Id) {
      pathToken0Addresses = [INPUT.tokenId]
    }

    if (tst1) {
      const pathToken1 = tst1?.path
      for (let i = 0; i < pathToken1.length; i++) {
        pathToken1Addresses.push(pathToken1[i].address)
      }
    } else if (INPUT.tokenId && INPUT.tokenId === OUTPUT.token1Id) {
      pathToken1Addresses = [INPUT.tokenId]
    }
  }

  const handleFilterPair = useCallback(
    (pair: Pair) => {
      return filterPairsForZap(pair, chainId ?? ChainId.MAINNET)
    },
    [chainId]
  )

  const amountOutZero = CurrencyAmount.nativeCurrency(JSBI.BigInt(0), chainId ?? ChainId.MAINNET)
  const pairRouter = pairZap?.platform.routerAddress[chainId ?? ChainId.RINKEBY] ?? ZERO_ADDRESS
  console.log('zap path', pathToken0Addresses, pathToken1Addresses, pairRouter)

  const { callback: onZap } = useZapCallback({
    amountFrom: parsedAmount,
    amount0Min: amountOutZero,
    amount1Min: amountOutZero,
    pathToPairToken0: pathToken0Addresses,
    pathToPairToken1: pathToken1Addresses,
    allowedSlippage: 0,
    recipientAddressOrName: null,
    router: pairRouter,
  })

  const handleZapInToken = useCallback(() => {
    const amountIn = BigNumber.from(1000000000000000)
    const tstFct = async () => {
      if (!zapContract) return
      //weth/dxd & weth/dxd/weenus
      const zapAmountTo = await zapContract.zapInFromToken(
        amountIn,
        0,
        0,
        ['0xc778417E063141139Fce010982780140Aa0cD5Ab', '0x4DBCdF9B62e891a7cec5A2568C3F4FAF9E8Abe2b'],
        ['0xc778417E063141139Fce010982780140Aa0cD5Ab', '0xD9BA894E0097f8cC2BBc9D24D308b98e36dc6D02']
      )
      return zapAmountTo
    }
    // if (!zapCallback) {
    //   console.log('test zap nie ma callbacka')
    //   return
    // }
    tstFct()
      .then(tx => {
        console.log('test sukces!', tx)
      })
      .catch(e => {
        console.log('test failed :<')
        console.error(e)
      })
  }, [zapContract])

  const handleZapOutToToken = useCallback(() => {
    const amountIn = BigNumber.from(500000000000000) // 0.0005 DXS
    console.log('test zap out handle', amountIn.toString())
    const tstFct = async () => {
      if (!zapContract) return
      //dxd/weth & weenus/dxd/weth
      const zapAmountTo = await zapContract.zapOutToToken(
        amountIn,
        0,
        ['0x554898A0BF98aB0C03ff86C7DccBE29269cc4d29', '0xc778417E063141139Fce010982780140Aa0cD5Ab'],
        [
          '0xaFF4481D10270F50f203E0763e2597776068CBc5',
          '0x554898A0BF98aB0C03ff86C7DccBE29269cc4d29',
          '0xc778417E063141139Fce010982780140Aa0cD5Ab',
        ],
        { gasLimit: BigNumber.from(21000000), gasPrice: BigNumber.from(7000000000) }
      )
      return zapAmountTo
    }
    // if (!zapCallback) {
    //   console.log('test zap nie ma callbacka')
    //   return
    // }
    tstFct()
      .then(tx => {
        console.log('test sukces!', tx)
      })
      .catch(e => {
        console.log('test failed :<')
        console.error(e)
      })
  }, [zapContract])

  const handleZapFeeToo = useCallback(() => {
    console.log('test zap handle')
    if (!zapContract) return
    console.log('test zap exist')
    const tstFct = async () => {
      await zapContract.setFeeTo('0x372a291a9cad69b0f5f231cf1885574e9de7fd33')
    }
    const own = tstFct()
    own
      .then(tx => {
        console.log('test sukces!', tx)
      })
      .catch(e => {
        console.log('test failed :<')
        console.error(e)
      })
  }, [zapContract])

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
  const trade1 = showWrap ? undefined : potentialTrade1

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

  const { onCurrencySelection } = useSwapActionHandlers()
  const { onPairSelection, onTokenSelection, onUserInput, onSwitchDirection } = useZapActionHandlers()

  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value)
    },
    [onUserInput]
  )

  console.log('potentialTrade', potentialTrade)

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
  const [approval, approveCallback] = useApproveCallback(parsedAmount, ZAP_CONTRACT_ADDRESS)
  console.log('zap approve', approval, parsedAmount)

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
        if (trade instanceof CoWTrade) {
          setGnosisProtocolState(CoWTradeState.WRAP)
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
        setGnosisProtocolState(CoWTradeState.SWAP)
      })
  }, [trade, tradeToConfirm, priceImpactWithoutFee, showConfirm, setWrapState, swapCallback])

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

  const handleTokenSelect = useCallback(
    (token: Currency) => {
      onTokenSelection(token)
    },
    [onTokenSelection]
  )

  const handlePairSelect = useCallback(
    (pair: Pair) => {
      console.log('platform', UniswapV2RoutablePlatform.SWAPR, pair)
      const outputPairAddress = Pair.getAddress(pair.token0, pair.token1, UniswapV2RoutablePlatform.SWAPR)
      setPairZap(pair)
      onPairSelection(outputPairAddress, pair.token0.address, pair.token1.address)
    },
    [onPairSelection]
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
          <AppBody tradeDetailsOpen={!!trade}>
            <Wrapper id="zap-page">
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
                  {independentField === Field.INPUT ? (
                    <CurrencyInputPanel
                      id="zap-currency-input"
                      value={formattedAmounts[Field.INPUT]}
                      currency={currencies[Field.INPUT]}
                      onUserInput={handleTypeInput}
                      onMax={handleMaxInput(Field.INPUT)}
                      onCurrencySelect={handleTokenSelect}
                      otherCurrency={currencies[Field.INPUT]}
                      fiatValue={fiatValueInput}
                      isFallbackFiatValue={isFallbackFiatValueInput}
                      maxAmount={maxAmountInput}
                      showCommonBases
                      disabled={false}
                    />
                  ) : (
                    <PairSelectPanel
                      id="zap-pair-output"
                      value={formattedAmounts[Field.OUTPUT]}
                      onUserInput={handleTypeOutput}
                      onMax={handleMaxInput(Field.OUTPUT)}
                      currency={currencies[Field.OUTPUT]}
                      pair={pairZap}
                      onPairSelect={handlePairSelect}
                      otherCurrency={currencies[Field.OUTPUT]}
                      fiatValue={fiatValueOutput}
                      priceImpact={priceImpact}
                      isFallbackFiatValue={isFallbackFiatValueOutput}
                      maxAmount={maxAmountOutput}
                      showCommonBases
                      disabled={false}
                      filterPairs={handleFilterPair}
                    />
                  )}
                  <SwitchIconContainer>
                    <SwitchTokensAmountsContainer
                      onClick={() => {
                        setApprovalsSubmitted([]) // reset 2 step UI for approvals
                        // handleZapInToken()
                        // handleZapOutToToken()
                        onSwitchDirection()
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
                  {independentField === Field.INPUT ? (
                    <PairSelectPanel
                      id="zap-pair-output"
                      value={formattedAmounts[Field.OUTPUT]}
                      onUserInput={handleTypeOutput}
                      onMax={handleMaxInput(Field.OUTPUT)}
                      currency={currencies[Field.OUTPUT]}
                      pair={pairZap}
                      onPairSelect={handlePairSelect}
                      otherCurrency={currencies[Field.OUTPUT]}
                      fiatValue={fiatValueOutput}
                      priceImpact={priceImpact}
                      isFallbackFiatValue={isFallbackFiatValueOutput}
                      maxAmount={maxAmountOutput}
                      showCommonBases
                      disabled={true}
                      filterPairs={handleFilterPair}
                    />
                  ) : (
                    <CurrencyInputPanel
                      id="zap-currency-input"
                      value={formattedAmounts[Field.INPUT]}
                      currency={currencies[Field.INPUT]}
                      onUserInput={handleTypeInput}
                      onMax={handleMaxInput(Field.INPUT)}
                      onCurrencySelect={handleTokenSelect}
                      otherCurrency={currencies[Field.INPUT]}
                      fiatValue={fiatValueInput}
                      isFallbackFiatValue={isFallbackFiatValueInput}
                      maxAmount={maxAmountInput}
                      showCommonBases
                      disabled={true}
                    />
                  )}
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
                  priceImpactSeverity={0}
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
                  handleSwap={independentField === Field.INPUT ? handleZapInToken : handleZapOutToToken}
                  handleInputSelect={handleInputSelect}
                  wrapState={wrapState}
                  setWrapState={setWrapState}
                  onZap={onZap}
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
