import { parseUnits } from '@ethersproject/units'
import { Currency, CurrencyAmount, JSBI, RoutablePlatform, Token, TokenAmount, Trade, UniswapV2Trade } from '@swapr/sdk'

import { createSelector } from '@reduxjs/toolkit'
import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { SWAP_INPUT_ERRORS } from '../../constants/index'
import { useActiveWeb3React } from '../../hooks'
import { useCurrency } from '../../hooks/Tokens'
import useENS from '../../hooks/useENS'
import { useNativeCurrency } from '../../hooks/useNativeCurrency'
import { useParsedQueryString } from '../../hooks/useParsedQueryString'
import { useEcoRouterExactIn, useEcoRouterExactOut } from '../../lib/eco-router'
import { isAddress } from '../../utils'
import { currencyId } from '../../utils/currencyId'
import { computeSlippageAdjustedAmounts } from '../../utils/prices'
import { AppDispatch, AppState } from '../index'
import { useUserSlippageTolerance } from '../user/hooks'
import { useCurrencyBalances } from '../wallet/hooks'
import {
  Field,
  replaceSwapState,
  selectCurrency,
  setLoading,
  setRecipient,
  switchCurrencies,
  typeInput,
} from './actions'

const selectSwap = createSelector(
  (state: AppState) => state.swap,
  swap => swap
)
export function useSwapState() {
  return useSelector<AppState, AppState['swap']>(selectSwap)
}

const selectSwapLoading = createSelector(
  (state: AppState) => state.swap.loading,
  loading => loading
)
export function useSwapLoading() {
  return useSelector<AppState, AppState['swap']['loading']>(selectSwapLoading)
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

const BAD_RECIPIENT_ADDRESSES: string[] = [
  '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f', // v2 factory
  '0xf164fC0Ec4E93095b804a4795bBe1e041497b92a', // v2 router 01
  '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', // v2 router 02
]

/**
 * Returns true if any of the pairs or tokens in a trade have the given checksummed address
 * @param trade to check for the given address
 * @param checksummedAddress address to check in the pairs and tokens
 */
function involvesAddress(trade: UniswapV2Trade, checksummedAddress: string): boolean {
  return (
    trade.route.path.some(token => token.address === checksummedAddress) ||
    trade.route.pairs.some(pair => pair.liquidityToken.address === checksummedAddress)
  )
}

export interface UseDerivedSwapInfoResult {
  currencies: { [field in Field]?: Currency }
  currencyBalances: { [field in Field]?: CurrencyAmount }
  parsedAmount: CurrencyAmount | undefined
  trade: Trade | undefined
  allPlatformTrades: (Trade | undefined)[] | undefined
  inputError?: number
}

// from the current swap inputs, compute the best trade and return it.
export function useDerivedSwapInfo(platformOverride?: RoutablePlatform): UseDerivedSwapInfoResult {
  const dispatch = useDispatch()
  const { account, chainId } = useActiveWeb3React()
  const {
    independentField,
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
    recipient,
  } = useSwapState()

  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)

  const relevantTokenBalances = useCurrencyBalances(account ?? undefined, [
    inputCurrency ?? undefined,
    outputCurrency ?? undefined,
  ])

  const isExactIn: boolean = independentField === Field.INPUT
  const parsedAmount = tryParseAmount(typedValue, (isExactIn ? inputCurrency : outputCurrency) ?? undefined, chainId)

  const { trades: inTrades, loading: inLoading } = useEcoRouterExactIn(
    isExactIn ? parsedAmount : undefined,
    outputCurrency ?? undefined
  )
  const { trades: outTrades, loading: outLoading } = useEcoRouterExactOut(
    inputCurrency ?? undefined,
    !isExactIn ? parsedAmount : undefined
  )
  const bestTradeExactIn = inTrades[0]
  const bestTradeExactOut = outTrades[0]

  const allPlatformTrades = isExactIn ? inTrades : outTrades
  // If overridden platform selection and a trade for that platform exists, use that.
  // Otherwise, use the best trade
  let platformTrade
  if (platformOverride) {
    platformTrade = allPlatformTrades?.filter(t => t?.platform === platformOverride)[0]
  }
  const trade = platformTrade ? platformTrade : isExactIn ? bestTradeExactIn : bestTradeExactOut

  const currencyBalances = {
    [Field.INPUT]: relevantTokenBalances[0],
    [Field.OUTPUT]: relevantTokenBalances[1],
  }

  const currencies: { [field in Field]?: Currency } = {
    [Field.INPUT]: inputCurrency ?? undefined,
    [Field.OUTPUT]: outputCurrency ?? undefined,
  }

  let inputError: number | undefined
  if (!account) {
    inputError = SWAP_INPUT_ERRORS.CONNECT_WALLET
  }

  if (!parsedAmount) {
    inputError = inputError ?? SWAP_INPUT_ERRORS.ENTER_AMOUNT
  }

  if (!currencies[Field.INPUT] || !currencies[Field.OUTPUT]) {
    inputError = inputError ?? SWAP_INPUT_ERRORS.SELECT_TOKEN
  }

  const recipientLookup = useENS(recipient ?? undefined)
  const to: string | null = (recipient === null ? account : recipientLookup.address) ?? null

  const formattedTo = isAddress(to)
  if (!to || !formattedTo) {
    inputError = inputError ?? SWAP_INPUT_ERRORS.ENTER_RECIPIENT
  } else {
    if (
      BAD_RECIPIENT_ADDRESSES.indexOf(formattedTo) !== -1 ||
      (bestTradeExactIn instanceof UniswapV2Trade && involvesAddress(bestTradeExactIn, formattedTo)) ||
      (bestTradeExactOut instanceof UniswapV2Trade && involvesAddress(bestTradeExactOut, formattedTo))
    ) {
      inputError = inputError ?? SWAP_INPUT_ERRORS.INVALID_RECIPIENT
    }
  }

  const allowedSlippage = useUserSlippageTolerance()

  const slippageAdjustedAmounts =
    trade && allowedSlippage && computeSlippageAdjustedAmounts(trade /* allowedSlippage */)

  // compare input balance to MAx input based on version
  const [balanceIn, amountIn] = [
    currencyBalances[Field.INPUT],
    slippageAdjustedAmounts ? slippageAdjustedAmounts[Field.INPUT] : null,
  ]

  if (balanceIn && amountIn && balanceIn.lessThan(amountIn)) {
    inputError = SWAP_INPUT_ERRORS.INSUFFICIENT_BALANCE
  }

  useLayoutEffect(() => {
    if (inLoading || outLoading) {
      dispatch(setLoading(true))
    } else {
      dispatch(setLoading(false))
    }
    if (inputError !== undefined && inputError !== SWAP_INPUT_ERRORS.CONNECT_WALLET) {
      setTimeout(() => {
        dispatch(setLoading(false))
      }, 500)
    }
  }, [inLoading, outLoading, inputError, dispatch, typedValue, inputCurrency, outputCurrency])

  return {
    currencies,
    currencyBalances,
    parsedAmount,
    trade,
    allPlatformTrades,
    inputError,
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
