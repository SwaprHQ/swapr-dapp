import { AddressZero } from '@ethersproject/constants'
import { StaticJsonRpcProvider } from '@ethersproject/providers'
import { parseUnits } from '@ethersproject/units'
import { Currency, CurrencyAmount, JSBI, Percent, RoutablePlatform, Token, TokenAmount, Trade } from '@swapr/sdk'

import { createSelector } from '@reduxjs/toolkit'
import { useWhatChanged } from '@simbathesailor/use-what-changed'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { unstable_batchedUpdates } from 'react-dom'
import { useDispatch, useSelector } from 'react-redux'

import { SWAP_INPUT_ERRORS } from '../../constants/index'
import { useActiveWeb3React } from '../../hooks'
import { useCurrency } from '../../hooks/Tokens'
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
import { replaceSwapState, selectCurrency, setRecipient, switchCurrencies, typeInput } from './actions'
import { Field } from './types'

const selectSwap = createSelector(
  (state: AppState) => state.swap,
  swap => swap
)

export function useSwapState() {
  return useSelector<AppState, AppState['swap']>(selectSwap)
}

export function useSwapActionHandlers(): {
  onCurrencySelection: (field: Field, currency: Currency) => void
  onSwitchTokens: () => void
  onUserInput: (field: Field, typedValue: string) => void
  onChangeRecipient: (recipient: string | null) => void
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
    dispatch(switchCurrencies())
  }, [dispatch])

  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      dispatch(typeInput({ field, typedValue }))
    },
    [dispatch]
  )

  const onChangeRecipient = useCallback(
    (recipient: string | null) => {
      dispatch(setRecipient({ recipient }))
    },
    [dispatch]
  )

  return {
    onSwitchTokens,
    onCurrencySelection,
    onUserInput,
    onChangeRecipient,
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

export interface UseDerivedSwapInfoResult {
  currencies: { [field in Field]?: Currency }
  currencyBalances: { [field in Field]?: CurrencyAmount }
  parsedAmount: CurrencyAmount | undefined
  trade: Trade | undefined
  allPlatformTrades: (Trade | undefined)[] | undefined
  inputError?: number
  loading: boolean
}

// set TTL - currently at 5 minutes
const quoteTTL = 5 * 60 * 1000

// from the current swap inputs, compute the best trade and return it.
export function useDerivedSwapInfo(platformOverride?: RoutablePlatform): UseDerivedSwapInfoResult {
  const { account, chainId, library: provider } = useActiveWeb3React()
  // Get all options for the input and output currencies
  const {
    independentField,
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
    recipient,
  } = useSwapState()
  const allowedSlippage = useUserSlippageTolerance()
  const useMultihops = useIsMultihop()
  const recipientLookup = useENS(recipient ?? undefined)
  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)
  // Start by retrieveing the balances of the input and output currencies
  const relevantTokenBalances = useCurrencyBalances(account ?? undefined, [
    inputCurrency ?? undefined,
    outputCurrency ?? undefined,
  ])
  // Internal state
  const [loading, setLoading] = useState<boolean>(false)
  const [inputError, setInputError] = useState<number | undefined>()
  // const [trade, setTrade] = useState<Trade>()
  const [allPlatformTrades, setAllPlatformTrades] = useState<Trade[]>([])
  // Computed on the fly state
  const isExactIn = useMemo(() => independentField === Field.INPUT, [independentField])
  const parsedAmount = tryParseAmount(typedValue, (isExactIn ? inputCurrency : outputCurrency) ?? undefined, chainId)

  // useCurrency and useToken returns a new object every time,
  // so we need to compare the addresses as strings
  const parsedAmountString = `${parsedAmount?.currency.address?.toString()}-${parsedAmount?.raw?.toString()}`

  const [isQuoteExpired, setIsQuoteExpired] = useState(false)
  const quoteExpiryTimeout = useRef<NodeJS.Timeout>()

  const dependencyList = [
    account,
    useMultihops,
    chainId,
    inputCurrency?.address,
    outputCurrency?.address,
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

    // Require two currencies to be selected
    if (!inputCurrency || !outputCurrency) {
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

    // Update swap state with the new input
    unstable_batchedUpdates(() => {
      setInputError(inputErrorNextState)
      setLoading(true)
      setAllPlatformTrades([])

      setIsQuoteExpired(false)
      if (quoteExpiryTimeout.current) {
        clearTimeout(quoteExpiryTimeout.current)
      }
    })

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

    // Use a static version
    const staticProvider = provider ? new StaticJsonRpcProvider(provider.connection, provider.network) : undefined

    console.log('useDerivedSwapInfo: fetching trades')

    const getTrades = getTradesPromise(
      parsedAmount,
      inputCurrency,
      outputCurrency,
      commonParams,
      ecoRouterSourceOptionsParams,
      staticProvider
    )

    // Start fetching trades from EcoRouter API
    getTrades
      .then(trades => {
        unstable_batchedUpdates(() => {
          setAllPlatformTrades(trades.trades)
          setLoading(false)
          quoteExpiryTimeout.current = setTimeout(() => {
            setIsQuoteExpired(true)
          }, quoteTTL)
        })
      })
      .catch(error => {
        console.error(error)
        unstable_batchedUpdates(() => {
          setInputError(SWAP_INPUT_ERRORS.UNKNOWN)
          setLoading(false)
        })
      })

    return function useDerivedSwapInfoCleanUp() {
      unstable_batchedUpdates(() => {
        setAllPlatformTrades([])
        setLoading(false)
        setInputError(undefined)
        if (quoteExpiryTimeout.current) {
          clearTimeout(quoteExpiryTimeout.current)
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencyList)

  // If overridden platform selection and a trade for that platform exists, use that.
  // Otherwise, use the best trade
  let platformTrade
  if (platformOverride) {
    platformTrade = allPlatformTrades.filter(t => t?.platform === platformOverride)[0]
  }
  const trade = platformTrade ? platformTrade : allPlatformTrades[0] // the first trade is the best trade
  const slippageAdjustedAmounts = trade && allowedSlippage && computeSlippageAdjustedAmounts(trade)

  // compare input balance to MAx input based on version
  const [balanceIn, amountIn] = [
    relevantTokenBalances[0],
    slippageAdjustedAmounts ? slippageAdjustedAmounts[Field.INPUT] : null,
  ]

  let returnInputError = inputError
  if (balanceIn && amountIn && balanceIn.lessThan(amountIn)) {
    returnInputError = SWAP_INPUT_ERRORS.INSUFFICIENT_BALANCE
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
    trade,
    allPlatformTrades,
    inputError: returnInputError,
    loading,
  }

  function getTradesPromise(
    parsedAmount: CurrencyAmount,
    inputCurrency: Currency,
    outputCurrency: Currency,
    commonParams: { maximumSlippage: Percent; receiver: string; user: string },
    ecoRouterSourceOptionsParams: { uniswapV2: { useMultihops: boolean } },
    staticJsonRpcProvider: StaticJsonRpcProvider | undefined
  ): Promise<EcoRouterResults> {
    return isExactIn
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

export function queryParametersToSwapState(
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
    const parsed = queryParametersToSwapState(parsedQs, currencyId(nativeCurrency))

    dispatch(
      replaceSwapState({
        typedValue: parsed.typedValue,
        field: parsed.independentField,
        inputCurrencyId: parsed[Field.INPUT].currencyId,
        outputCurrencyId: parsed[Field.OUTPUT].currencyId,
        recipient: parsed.recipient,
      })
    )

    setResult({ inputCurrencyId: parsed[Field.INPUT].currencyId, outputCurrencyId: parsed[Field.OUTPUT].currencyId })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, chainId])

  return result
}
