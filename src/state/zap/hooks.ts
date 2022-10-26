import { AddressZero } from '@ethersproject/constants'
import { StaticJsonRpcProvider } from '@ethersproject/providers'
import { parseUnits } from '@ethersproject/units'
import {
  Currency,
  CurrencyAmount,
  JSBI,
  Pair,
  Percent,
  RoutablePlatform,
  Route,
  Token,
  TokenAmount,
  Trade,
} from '@swapr/sdk'

import { createSelector } from '@reduxjs/toolkit'
import { useWhatChanged } from '@simbathesailor/use-what-changed'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { unstable_batchedUpdates } from 'react-dom'
import { useDispatch, useSelector } from 'react-redux'

import { PRE_SELECT_OUTPUT_CURRENCY_ID, SWAP_INPUT_ERRORS } from '../../constants/index'
import { usePairAtAddress } from '../../data/Reserves'
import { useActiveWeb3React } from '../../hooks'
import { useCurrency } from '../../hooks/Tokens'
import { useAbortController } from '../../hooks/useAbortController'
import useENS from '../../hooks/useENS'
import { useNativeCurrency } from '../../hooks/useNativeCurrency'
import { useParsedQueryString } from '../../hooks/useParsedQueryString'
import {
  EcoRouterResults,
  getExactIn as getExactInFromEcoRouter,
  getExactOut as getExactOutFromEcoRouter,
} from '../../lib/eco-router'
import { isAddress } from '../../utils'
import { currencyId } from '../../utils/currencyId'
import { computeSlippageAdjustedAmounts } from '../../utils/prices'
import { wrappedCurrency } from '../../utils/wrappedCurrency'
import { AppDispatch, AppState } from '../index'
import { useIsMultihop, useUserSlippageTolerance } from '../user/hooks'
import { useCurrencyBalances } from '../wallet/hooks'
import { replaceZapState, selectCurrency, setPairTokens, setRecipient, switchZapDirection, typeInput } from './actions'
import { Field } from './types'

// set TTL - currently at 5 minutes
const quoteTTL = 5 * 60 * 1000

const selectZap = createSelector(
  (state: AppState) => state.zap,
  zap => zap
)

export function useZapState() {
  return useSelector<AppState, AppState['zap']>(selectZap)
}

export function useZapActionHandlers(): {
  onCurrencySelection: (field: Field, currency: Currency) => void
  onSwitchTokens: () => void
  onUserInput: (field: Field, typedValue: string) => void
  onChangeRecipient: (recipient: string | null) => void
  onPairSelection: (token0Id: string, token1Id: string) => void
} {
  const dispatch = useDispatch<AppDispatch>()

  const onCurrencySelection = useCallback(
    (field: Field, currency: Currency) => {
      dispatch(
        selectCurrency({
          field,
          currencyId: currencyId(currency),
        })
      )
    },
    [dispatch]
  )

  const onSwitchTokens = useCallback(() => {
    dispatch(switchZapDirection())
  }, [dispatch])

  const onUserInput = useCallback(
    (independentField: Field, typedValue: string) => {
      dispatch(typeInput({ independentField, typedValue }))
    },
    [dispatch]
  )

  const onChangeRecipient = useCallback(
    (recipient: string | null) => {
      dispatch(setRecipient({ recipient }))
    },
    [dispatch]
  )

  const onPairSelection = useCallback(
    (token0Id: string, token1Id: string) => {
      dispatch(setPairTokens({ token0Id, token1Id }))
    },
    [dispatch]
  )

  return {
    onSwitchTokens,
    onCurrencySelection,
    onUserInput,
    onChangeRecipient,
    onPairSelection,
  }
}

// try to parse a user entered amount for a given token
export function tryParseAmount(value?: string, currency?: Currency, chainId?: number): CurrencyAmount | undefined {
  if (!value || !currency) {
    return undefined
  }
  try {
    const typedValueParsed = parseUnits(value, currency.decimals).toString()
    if (typedValueParsed !== '0') {
      if (currency instanceof Token) return new TokenAmount(currency, JSBI.BigInt(typedValueParsed))
      else if (chainId) return CurrencyAmount.nativeCurrency(JSBI.BigInt(typedValueParsed), chainId)
      else return undefined
    }
  } catch (error) {
    // should fail if the user specifies too many decimal places of precision (or maybe exceed max uint?)
    console.debug(`Failed to parse input amount: "${value}"`, error)
  }
  // necessary for all paths to return a value
  return undefined
}

export interface UseDerivedZapInfoResult {
  currencies: { [asset in Field]?: Currency }
  currencyBalances: { [asset in Field]?: CurrencyAmount }
  parsedAmount: CurrencyAmount | undefined
  tradeToken0: Trade | undefined
  tradeToken1: Trade | undefined
  allPlatformTradesToken0: (Trade | undefined)[] | undefined
  inputError?: number
  loading: boolean
}

export function useDerivedZapInfo(platformOverride?: RoutablePlatform): UseDerivedZapInfoResult {
  const { account, chainId, library: provider } = useActiveWeb3React()
  // Get all options for the input and output currencies
  const {
    independentField,
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
    pairTokens: { token0Id, token1Id },
    recipient,
  } = useZapState()
  const allowedSlippage = useUserSlippageTolerance()
  const useMultihops = useIsMultihop()
  const recipientLookup = useENS(recipient ?? undefined)
  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)
  const pairCurrency0 = useCurrency(token0Id)
  const pairCurrency1 = useCurrency(token1Id)

  // Start by retrieveing the balances of the input and output currencies
  const relevantTokenBalances = useCurrencyBalances(account ?? undefined, [
    inputCurrency ?? undefined,
    outputCurrency ?? undefined,
  ])
  // Internal state
  const [loading, setLoading] = useState<boolean>(false)
  const [inputError, setInputError] = useState<number | undefined>()
  const [pathToken0toLpToken, setPathToken0toLpToken] = useState<string[]>()
  const [pathToken1toLpToken, setPathToken1toLpToken] = useState<string[]>()
  const [allPlatformTradesToken0, setAllPlatformTradesToken0] = useState<Trade[]>([])
  const [allPlatformTradesToken1, setAllPlatformTradesToken1] = useState<Trade[]>([])

  // Computed on the fly state
  const isExactIn = useMemo(() => independentField === Field.INPUT, [independentField])
  const parsedAmount = tryParseAmount(typedValue, (isExactIn ? inputCurrency : outputCurrency) ?? undefined, chainId)

  // useCurrency and useToken returns a new object every time,
  // so we need to compare the addresses as strings
  const parsedAmountString = `${parsedAmount?.currency.address?.toString()}-${parsedAmount?.raw?.toString()}`

  const [isQuoteExpired, setIsQuoteExpired] = useState(false)
  const quoteExpiryTimeout = useRef<NodeJS.Timeout>()
  const { getAbortSignal } = useAbortController()

  const dependencyList = [
    account,
    useMultihops,
    chainId,
    inputCurrency?.address,
    outputCurrency?.address,
    pairCurrency0,
    pairCurrency1,
    parsedAmountString,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    relevantTokenBalances[0]?.raw.toString(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    relevantTokenBalances[1]?.raw.toString(),
    allowedSlippage,
    isExactIn,
    provider,
    isQuoteExpired,
  ]

  useWhatChanged(
    dependencyList,
    `account,useMultihops,recipientLookupComputed,chainId,inputCurrency?.address,outputCurrency?.address,parsedAmountString,relevantTokenBalances[0]?.raw.toString(),relevantTokenBalances[1]?.raw.toString(),allowedSlippage,recipient,isExactIn,provider,isQuoteExpired`
  )

  useEffect(() => {
    const [inputCurrencyBalance] = relevantTokenBalances

    const signal = getAbortSignal()

    // Require two currencies to be selected
    if (!inputCurrency || !outputCurrency || !pairCurrency0 || !pairCurrency1) {
      setInputError(SWAP_INPUT_ERRORS.SELECT_TOKEN)
      return
    }
    // Require a valid input amount
    if (!parsedAmount) {
      setInputError(SWAP_INPUT_ERRORS.ENTER_AMOUNT)
      return
    }
    // Notify user if input amount is too low, but still trigger the EcoRouter
    let inputErrorNextState: undefined | number = undefined
    if (inputCurrencyBalance && JSBI.greaterThan(parsedAmount.raw, inputCurrencyBalance.raw as JSBI)) {
      inputErrorNextState = SWAP_INPUT_ERRORS.INSUFFICIENT_FUNDS
    }

    // Require a valid receipient
    let receiver = account ?? AddressZero // default back to zero if no account is connected
    if (recipient !== null) {
      if (isAddress(recipientLookup.address)) {
        receiver = recipientLookup.address as string
      } else {
        setInputError(SWAP_INPUT_ERRORS.INVALID_RECIPIENT)
        return
      }
    }

    // The user wants to un/wrap the network native token
    const isWrap = Currency.isNative(inputCurrency) && wrappedCurrency(inputCurrency, chainId) === outputCurrency
    const isUnwrap = Currency.isNative(outputCurrency) && wrappedCurrency(outputCurrency, chainId) === inputCurrency

    if (isWrap || isUnwrap) {
      return
    }
    console.log('zap in out0 out1', inputCurrency, outputCurrency, parsedAmount)

    // Update swap state with the new input
    setInputError(inputErrorNextState)
    setLoading(true)
    setAllPlatformTradesToken0([])
    setAllPlatformTradesToken1([])

    setIsQuoteExpired(false)
    if (quoteExpiryTimeout.current) {
      clearTimeout(quoteExpiryTimeout.current)
    }

    const commonParams = {
      user: account || AddressZero, // default back to zero if no account is connected.
      maximumSlippage: new Percent(allowedSlippage.toString(), '10000'),
      receiver,
    }

    const ecoRouterSourceOptionsParams = {
      uniswapV2: {
        useMultihops,
      },
    }

    const getTradesToken0 = getTradesPromise(
      parsedAmount,
      inputCurrency,
      pairCurrency0,
      commonParams,
      ecoRouterSourceOptionsParams,
      provider,
      signal
    )

    // Start fetching trades from EcoRouter API
    getTradesToken0
      .then(trades => {
        setAllPlatformTradesToken0(trades.trades)
        setLoading(false)
        quoteExpiryTimeout.current = setTimeout(() => {
          setIsQuoteExpired(true)
        }, quoteTTL)
      })
      .catch(error => {
        if (error.name !== 'AbortError') {
          console.error(error)
          setInputError(SWAP_INPUT_ERRORS.UNKNOWN)
          setLoading(false)
        }
      })

    const getTradesToken1 = getTradesPromise(
      parsedAmount,
      inputCurrency,
      pairCurrency1,
      commonParams,
      ecoRouterSourceOptionsParams,
      provider,
      signal
    )

    // Start fetching trades from EcoRouter API
    getTradesToken1
      .then(trades => {
        setAllPlatformTradesToken1(trades.trades)
        setLoading(false)
        quoteExpiryTimeout.current = setTimeout(() => {
          setIsQuoteExpired(true)
        }, quoteTTL)
      })
      .catch(error => {
        if (error.name !== 'AbortError') {
          console.error(error)
          setInputError(SWAP_INPUT_ERRORS.UNKNOWN)
          setLoading(false)
        }
      })

    return function useDerivedSwapInfoCleanUp() {
      setAllPlatformTradesToken0([])
      setAllPlatformTradesToken1([])
      setLoading(false)
      setInputError(undefined)
      if (quoteExpiryTimeout.current) {
        clearTimeout(quoteExpiryTimeout.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencyList)

  useEffect(() => {
    // filter trades with platform & route
    let platformTradeToken0 = allPlatformTradesToken0.filter(t => !!t?.details)
    let platformTradeToken1 = allPlatformTradesToken1.filter(t => !!t?.details)

    // if overridden platform selection and a trade for that platform exists, use that
    if (platformOverride) {
      platformTradeToken0 = platformTradeToken0.filter(t => t?.platform === platformOverride)
      platformTradeToken1 = platformTradeToken1.filter(t => t?.platform === platformOverride)
    }

    // use the best trade
    const [[bestTradeToken0], [bestTradeToken1]] = [platformTradeToken0, platformTradeToken1]

    if (tradeToken0 && bestTradeToken0.details instanceof Route) {
      const tokensAddresses = bestTradeToken0.details.path.map(token => token.address)
    }
  }, [allPlatformTradesToken0, allPlatformTradesToken1, platformOverride])

  console.log('zap get best trade', tradeToken0, tradeToken1)

  let returnInputError = inputError
  if (allowedSlippage) {
    const slippageAdjustedAmounts0 = tradeToken0 && computeSlippageAdjustedAmounts(tradeToken0)
    const slippageAdjustedAmounts1 = tradeToken0 && computeSlippageAdjustedAmounts(tradeToken1)
    // compare input balance to Max input based on version
    const [balanceInToken0, amountInToken0] = [
      relevantTokenBalances[0],
      slippageAdjustedAmounts0 ? slippageAdjustedAmounts0[Field.INPUT] : null,
    ]

    const [balanceInToken1, amountInToken1] = [
      relevantTokenBalances[0],
      slippageAdjustedAmounts1 ? slippageAdjustedAmounts1[Field.INPUT] : null,
    ]

    if (
      (balanceInToken0 && amountInToken0 && balanceInToken0.lessThan(amountInToken0)) ||
      (balanceInToken1 && amountInToken1 && balanceInToken1.lessThan(amountInToken1))
    ) {
      returnInputError = SWAP_INPUT_ERRORS.INSUFFICIENT_BALANCE
    }
  }

  return {
    currencies: {
      [Field.INPUT]: inputCurrency ?? undefined,
      [Field.OUTPUT]: outputCurrency ?? undefined,
    },
    currencyBalances: {
      [Field.INPUT]: relevantTokenBalances[0] ?? undefined,
      [Field.OUTPUT]: relevantTokenBalances[1] ?? undefined,
    },
    parsedAmount,
    tradeToken0,
    tradeToken1,
    allPlatformTradesToken0: inputError === SWAP_INPUT_ERRORS.SELECT_TOKEN ? [] : allPlatformTradesToken0,
    inputError: returnInputError,
    loading,
  }

  async function getTradesPromise(
    parsedAmount: CurrencyAmount,
    inputCurrency: Currency,
    outputCurrency: Currency,
    commonParams: { maximumSlippage: Percent; receiver: string; user: string },
    ecoRouterSourceOptionsParams: { uniswapV2: { useMultihops: boolean } },
    staticJsonRpcProvider: StaticJsonRpcProvider | undefined,
    signal: AbortSignal
  ): Promise<EcoRouterResults> {
    const abortPromise = new Promise<EcoRouterResults>((_, reject) => {
      signal.onabort = () => {
        reject(new DOMException('Aborted', 'AbortError'))
      }
    })

    const ecoRouterPromise = isExactIn
      ? getExactInFromEcoRouter(
          {
            currencyAmountIn: parsedAmount,
            currencyOut: outputCurrency,
            ...commonParams,
          },
          ecoRouterSourceOptionsParams,
          staticJsonRpcProvider
        )
      : getExactOutFromEcoRouter(
          {
            currencyAmountOut: parsedAmount,
            currencyIn: inputCurrency,
            ...commonParams,
          },
          ecoRouterSourceOptionsParams,
          staticJsonRpcProvider
        )

    return await Promise.race([abortPromise, ecoRouterPromise])
  }
}

function parseCurrencyFromURLParameter(urlParam: any, nativeCurrencyId: string): string {
  if (typeof urlParam === 'string') {
    const valid = isAddress(urlParam)
    if (valid) return valid
    if (urlParam.toUpperCase() === nativeCurrencyId) return nativeCurrencyId
    if (valid === false) return nativeCurrencyId
  }
  return nativeCurrencyId ?? ''
}

function parseTokenAmountURLParameter(urlParam: any): string {
  return typeof urlParam === 'string' && !isNaN(parseFloat(urlParam)) ? urlParam : ''
}

function parseIndependentFieldURLParameter(urlParam: any): Field {
  return typeof urlParam === 'string' && urlParam.toLowerCase() === 'output' ? Field.OUTPUT : Field.INPUT
}

const ENS_NAME_REGEX = /^[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)?$/
const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/
function validatedRecipient(recipient: any): string | null {
  if (typeof recipient !== 'string') return null
  const address = isAddress(recipient)
  if (address) return address
  if (ENS_NAME_REGEX.test(recipient)) return recipient
  if (ADDRESS_REGEX.test(recipient)) return recipient
  return null
}

type SearchParams = { [k: string]: string }

type QueryParametersToSwapStateResponse = {
  independentField: Field
  typedValue: string
  [Field.INPUT]: {
    currencyId: string | undefined
  }
  [Field.OUTPUT]: {
    currencyId: string | undefined
  }
  recipient: string | null
}

export function queryParametersToZapState(
  parsedQs: SearchParams,
  nativeCurrencyId: string
): QueryParametersToSwapStateResponse {
  let inputCurrency = parseCurrencyFromURLParameter(parsedQs.inputCurrency, nativeCurrencyId)
  let outputCurrency = parseCurrencyFromURLParameter(parsedQs.outputCurrency, nativeCurrencyId)
  if (inputCurrency === outputCurrency) {
    if (typeof parsedQs.outputCurrency === 'string') {
      inputCurrency = ''
    } else {
      outputCurrency = ''
    }
  }

  const recipient = validatedRecipient(parsedQs.recipient)

  return {
    [Field.INPUT]: {
      currencyId: inputCurrency,
    },
    [Field.OUTPUT]: {
      currencyId: outputCurrency,
    },
    typedValue: parseTokenAmountURLParameter(parsedQs.exactAmount),
    independentField: parseIndependentFieldURLParameter(parsedQs.exactField),
    recipient,
  }
}

// updates the swap state to use the defaults for a given network
export function useDefaultsFromURLSearch():
  | { inputCurrencyId: string | undefined; outputCurrencyId: string | undefined }
  | undefined {
  const { chainId } = useActiveWeb3React()
  const nativeCurrency = useNativeCurrency()
  const dispatch = useDispatch<AppDispatch>()
  const parsedQs = useParsedQueryString()
  const [result, setResult] = useState<
    { inputCurrencyId: string | undefined; outputCurrencyId: string | undefined } | undefined
  >()

  useEffect(() => {
    if (!chainId) return
    const parsed = queryParametersToZapState(parsedQs, currencyId(nativeCurrency))

    const outputCurrencyId = !!parsed[Field.OUTPUT].currencyId?.length
      ? parsed[Field.OUTPUT].currencyId
      : PRE_SELECT_OUTPUT_CURRENCY_ID[chainId]

    dispatch(
      replaceZapState({
        typedValue: parsed.typedValue,
        field: parsed.independentField,
        inputCurrencyId: parsed[Field.INPUT].currencyId,
        outputCurrencyId,
        recipient: parsed.recipient,
      })
    )

    setResult({ inputCurrencyId: parsed[Field.INPUT].currencyId, outputCurrencyId: parsed[Field.OUTPUT].currencyId })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, chainId])

  return result
}
