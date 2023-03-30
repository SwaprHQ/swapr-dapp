import { CoWTrade, Currency, CurrencyAmount, JSBI, Token } from '@swapr/sdk'

import { useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { useActiveWeb3React } from '../../hooks'
import { useAllTokens, useCurrency } from '../../hooks/Tokens'
import { ApprovalState, useApproveCallbackFromTrade } from '../../hooks/useApproveCallback'
import { useSwapCallback } from '../../hooks/useSwapCallback'
import { useTargetedChainIdFromUrl } from '../../hooks/useTargetedChainIdFromUrl'
import { useHigherUSDValue } from '../../hooks/useUSDValue'
import { useWrapCallback, WrapState, WrapType } from '../../hooks/useWrapCallback'
import { useDefaultsFromURLSearch, useSwapActionHandlers, useSwapState } from '../../state/swap/hooks'
import { Field } from '../../state/swap/types'
import { useIsExpertMode, useUserSlippageTolerance } from '../../state/user/hooks'
import { computeFiatValuePriceImpact } from '../../utils/computeFiatValuePriceImpact'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { computeTradePriceBreakdown, warningSeverity } from '../../utils/prices'
import confirmPriceImpactWithoutFee from '../Swap/Components/confirmPriceImpactWithoutFee'
import { SwapContext } from '../Swap/SwapBox/SwapContext'
import { CoWTradeState, SwapData } from './models'

export const useSwapbox = () => {
  const loadedUrlParams = useDefaultsFromURLSearch()
  const allTokens = useAllTokens()

  const {
    trade: potentialTrade,
    allPlatformTrades,
    currencyBalances,
    parsedAmount,
    currencies,
    inputError: swapInputError,
    loading,
    platformOverride,
    setPlatformOverride,
  } = useContext(SwapContext)

  // TOKEN WARNING STUFF
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

  const isExpertMode = useIsExpertMode()

  // GET CUSTOM SETTING VALUES FOR USER
  const allowedSlippage = useUserSlippageTolerance()

  // SWAP STATE
  const { independentField, typedValue, recipient } = useSwapState()

  // FOR GPv2 TRADES, HAVE a STATE WHICH HOLDS: APPROVAL STATUS (HANDLED by useApproveCallback) and
  // WRAP STATUS (USE useWrapCallback AND the STATE VARIABLE)
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

  const showWrap = wrapType !== WrapType.NOT_APPLICABLE && !(potentialTrade instanceof CoWTrade)

  const trade = showWrap ? undefined : potentialTrade

  //GPv2 is FALLING in the TRUE CASE, NOT VERY USEFUL for WHAT I THINK I NEED
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

  // MODAL and LOADING
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

  const hasBothCurrenciesInput = !!(currencies[Field.INPUT] && currencies[Field.OUTPUT])

  // CHECK WHETHER the USER HAS APPROVED the ROUTER on the INPUT TOKEN
  const [approval, approveCallback] = useApproveCallbackFromTrade(trade)

  // CHECK if USER HAS GONE THROUGH APPROVAL PROCES, USED TO SHOW TWO STEP BUTTONS, RESET ON TOKEN CHANGE
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

  // MARK WHEN a USER HAS SUBMITTED an APPROVAL, RESET onTokenSelection for INPUT FIELD
  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      const newArray = [...approvalsSubmitted]
      newArray[currentTradeIndex] = true
      setApprovalsSubmitted(newArray)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approval])

  // LISTEN for CHANGES on wrapState
  useEffect(() => {
    // WATCH GPv2
    if (wrapState === WrapState.WRAPPED) {
      if (approval === ApprovalState.APPROVED) setGnosisProtocolState(CoWTradeState.SWAP)
      else setGnosisProtocolState(CoWTradeState.APPROVAL)
    }
  }, [wrapState, approval, trade])

  const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.INPUT], chainId)
  const maxAmountOutput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.OUTPUT], chainId, false)

  // CALLBACK to EXECUTE the SWAP
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
        //RESET STATES, in CASE WE WANT to OPERATE AGAIN
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

  // WARNINGS on SLIPPAGE
  const priceImpactSeverity = warningSeverity(priceImpactWithoutFee)

  // SHOW APPROVE FLOW WHEN: NO ERRORS ON the INPUTS, NOT APPROVED or PENDING, or APPROVED in the CURRENT SESSION
  // NEVER SHOW if PRICE IMPACT is ABOVE the THRESHOLD in NON-EXPERT MODE
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
      setPlatformOverride(null)
      setApprovalsSubmitted([])
      onCurrencySelection(Field.INPUT, inputCurrency)
    },
    [onCurrencySelection, setPlatformOverride]
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
      setPlatformOverride(null)
      onCurrencySelection(Field.OUTPUT, outputCurrency)
    },
    [onCurrencySelection, setPlatformOverride]
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

  return {
    formattedAmounts,
    currencies,
    handleTypeInput,
    handleTypeOutput,
    handleMaxInput,
    handleInputSelect,
    handleOutputSelect,
    fiatValueInput,
    fiatValueOutput,
    isFallbackFiatValueInput,
    isFallbackFiatValueOutput,
    maxAmountInput,
    maxAmountOutput,
    isInputPanelDisabled,

    onSwitchTokens,

    showWrap,
    recipient,

    wrapInputError,
    showApproveFlow,
    approval,
    priceImpact,
    priceImpactSeverity,
    swapCallbackError,
    wrapType,
    trade,
    swapInputError,
    swapErrorMessage,
    loading,
    onWrap,
    approveCallback,
    handleSwap,
    wrapState,
    setWrapState,

    allPlatformTrades,
  }
}
