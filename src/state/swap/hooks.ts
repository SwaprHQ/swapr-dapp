import { AddressZero } from '@ethersproject/constants'
import { StaticJsonRpcProvider } from '@ethersproject/providers'
import { parseUnits } from '@ethersproject/units'
import {
  Currency,
  CurrencyAmount,
  currencyEquals,
  JSBI,
  Pair,
  parseBigintIsh,
  Percent,
  RoutablePlatform,
  Route,
  Token,
  TokenAmount,
  Trade,
  ZERO,
} from '@swapr/sdk'

import { createSelector } from '@reduxjs/toolkit'
import { useWhatChanged } from '@simbathesailor/use-what-changed'
import { BigNumber } from 'ethers'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { PRE_SELECT_OUTPUT_CURRENCY_ID, PRE_SELECT_ZAP_PAIR_ID, SWAP_INPUT_ERRORS } from '../../constants/index'
import { PairState, usePair } from '../../data/Reserves'
import { useTotalSupply } from '../../data/TotalSupply'
import { useActiveWeb3React } from '../../hooks'
import { useCurrency, useToken } from '../../hooks/Tokens'
import { useAbortController } from '../../hooks/useAbortController'
import { useWrappingToken } from '../../hooks/useContract'
import useENS from '../../hooks/useENS'
import { useIsMobileByMedia } from '../../hooks/useIsMobileByMedia'
import { useNativeCurrency } from '../../hooks/useNativeCurrency'
import { useParsedQueryString } from '../../hooks/useParsedQueryString'
import {
  EcoRouterResults,
  getExactIn as getExactInFromEcoRouter,
  getExactOut as getExactOutFromEcoRouter,
} from '../../lib/eco-router'
import { isAddress } from '../../utils'
import { currencyId } from '../../utils/currencyId'
import { calculateZapInAmounts, computeSlippageAdjustedAmounts, limitNumberOfDecimalPlaces } from '../../utils/prices'
import { wrappedCurrency } from '../../utils/wrappedCurrency'
import { AppDispatch, AppState } from '../index'
import { useDerivedMintInfo } from '../mint/hooks'
import { useIsMultihop, useUserSlippageTolerance } from '../user/hooks'
import { useCurrencyBalances } from '../wallet/hooks'
import { replaceZapState } from '../zap/actions'
import { replaceSwapState, selectCurrency, setRecipient, switchCurrencies, typeInput } from './actions'
import { Field, StateKey, SwapState } from './types'

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
      console.log('hook currency swap', field, currency)
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

type DerivedParams = {
  key: StateKey
  platformOverride?: RoutablePlatform
}

const useSwapOrZapState = <T>(key: StateKey) => {
  return useSelector((state: AppState) => state[key]) as T
}

// from the current swap inputs, compute the best trade and return it.
export function useDerivedSwapInfo<
  T extends SwapState & { pairTokens?: { token0Id: string | undefined; token1Id: string | undefined } },
  ReturnedValue
>({ key, platformOverride }: DerivedParams): ReturnedValue {
  console.log('useDerivedSwapInfo:', key)
  const { account, chainId, library: provider } = useActiveWeb3React()
  // Get all options for the input and output currencies

  const isZap = key === StateKey.ZAP

  const {
    independentField,
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
    recipient,
    pairTokens,
  } = useSwapOrZapState<T>(key)

  const allowedSlippage = useUserSlippageTolerance()
  const useMultihops = useIsMultihop()
  const recipientLookup = useENS(recipient ?? undefined)
  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)

  const [pairCurrency0, pairCurrency1] = [useCurrency(pairTokens?.token0Id), useCurrency(pairTokens?.token1Id)]
  const [zapPair, setZapPair] = useState<Pair>()
  const [pairState, pair] = usePair(pairCurrency0 ?? undefined, pairCurrency1 ?? undefined)
  console.log('zap hukowy tokeny', pairCurrency0?.symbol, pairCurrency1?.symbol)
  console.log('zap hukowy pary  ', pair?.token0.symbol, pair?.token1.symbol)

  useEffect(() => {
    if (!zapPair && pair) {
      setZapPair(pair)
    }
  }, [pair, zapPair])

  const totalSupply = useTotalSupply(pair?.liquidityToken)

  const noLiquidity: boolean =
    pairState === PairState.NOT_EXISTS || Boolean(totalSupply && JSBI.equal(totalSupply.raw, ZERO))

  const price = useMemo(() => {
    if (noLiquidity || !pairCurrency0) {
      return undefined
    } else {
      const wrappedCurrency0 = wrappedCurrency(pairCurrency0, chainId)
      return pair && wrappedCurrency0 ? pair.priceOf(wrappedCurrency0) : undefined
    }
  }, [chainId, noLiquidity, pair, pairCurrency0])

  const isMobileByMedia = useIsMobileByMedia()
  const significantDigits = isMobileByMedia ? 6 : 14
  const formattedPrice = limitNumberOfDecimalPlaces(price, significantDigits)

  const relevantTokenBalances = useCurrencyBalances(account ?? undefined, [
    inputCurrency ?? undefined,
    outputCurrency ?? undefined,
  ])

  const [loading, setLoading] = useState<boolean>(false)
  const [inputError, setInputError] = useState<number | undefined>()
  const [allPlatformTrades, setAllPlatformTrades] = useState<Trade[]>([])

  const isExactIn = useMemo(() => independentField === Field.INPUT, [independentField])
  const parsedAmount = tryParseAmount(typedValue, (isExactIn ? inputCurrency : outputCurrency) ?? undefined, chainId)

  const [allPlatformTradesToken0, setAllPlatformTradesToken0] = useState<Trade[]>([])
  const [allPlatformTradesToken1, setAllPlatformTradesToken1] = useState<Trade[]>([])

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
    parsedAmountString,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    relevantTokenBalances[0]?.raw.toString(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    relevantTokenBalances[1]?.raw.toString(),
    allowedSlippage,
    isExactIn,
    provider,
    isQuoteExpired,
    pairCurrency0,
    pairCurrency1,
  ]

  useWhatChanged(
    dependencyList,
    `account,useMultihops,recipientLookupComputed,chainId,inputCurrency?.address,outputCurrency?.address,parsedAmountString,relevantTokenBalances[0]?.raw.toString(),relevantTokenBalances[1]?.raw.toString(),allowedSlippage,recipient,isExactIn,provider,isQuoteExpired`
  )

  useEffect(() => {
    const [inputCurrencyBalance] = relevantTokenBalances

    const signal = getAbortSignal()
    // Require two currencies to be selected
    if (!inputCurrency || !outputCurrency) {
      if (isZap) {
        if (!pairCurrency0 || !pairCurrency1) {
          setInputError(SWAP_INPUT_ERRORS.SELECT_TOKEN)
          return
        }
      } else {
        setInputError(SWAP_INPUT_ERRORS.SELECT_TOKEN)
        return
      }
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
    setInputError(inputErrorNextState)
    setLoading(true)
    setAllPlatformTrades([])

    if (isZap) {
      setAllPlatformTradesToken0([])
      setAllPlatformTradesToken1([])
    }

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

    const halfParsedAmount = tryParseAmount(
      parsedAmount.divide(parseBigintIsh('2')).toFixed(6), //TODO
      parsedAmount.currency,
      chainId
    )

    if (isZap && pairCurrency0 && pairCurrency1) {
      const isInOut0EqualOrWrap =
        currencyEquals(inputCurrency, pairCurrency0) ||
        (Currency.isNative(inputCurrency) && wrappedCurrency(inputCurrency, chainId) === pairCurrency0)
      const isInOut1EqualOrWrap =
        currencyEquals(inputCurrency, pairCurrency1) ||
        (Currency.isNative(inputCurrency) && wrappedCurrency(inputCurrency, chainId) === pairCurrency1)
      console.log('zap is wrapped', isInOut0EqualOrWrap, isInOut1EqualOrWrap)
      console.log('all zap', isZap, pairCurrency0, pairCurrency1)
      console.log('zap amount IN', parsedAmount.toFixed(), halfParsedAmount?.toFixed())

      const getTradesToken0 = getTradesPromise(
        halfParsedAmount ?? parsedAmount,
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
        halfParsedAmount ?? parsedAmount,
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
    } else {
      const getTrades = getTradesPromise(
        parsedAmount,
        inputCurrency,
        outputCurrency,
        commonParams,
        ecoRouterSourceOptionsParams,
        provider,
        signal
      )

      // Start fetching trades from EcoRouter API
      getTrades
        .then(trades => {
          setAllPlatformTrades(trades.trades)
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
    }

    return function useDerivedSwapInfoCleanUp() {
      if (isZap) {
        setAllPlatformTradesToken0([])
        setAllPlatformTradesToken1([])
      } else {
        setAllPlatformTrades([])
      }
      setLoading(false)
      setInputError(undefined)
      if (quoteExpiryTimeout.current) {
        clearTimeout(quoteExpiryTimeout.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencyList)

  // If overridden platform selection and a trade for that platform exists, use that.
  // Otherwise, use the best trade
  let platformTrade

  let platformTradeToken0 = allPlatformTradesToken0.filter(t => !!t?.details)
  let platformTradeToken1 = allPlatformTradesToken1.filter(t => !!t?.details)

  if (platformOverride) {
    if (isZap) {
      platformTradeToken0 = platformTradeToken0.filter(t => t?.platform === platformOverride)
      platformTradeToken1 = platformTradeToken1.filter(t => t?.platform === platformOverride)
    } else {
      platformTrade = allPlatformTrades.filter(t => t?.platform === platformOverride)[0]
    }
  }

  let returnInputError = inputError
  if (isZap) {
    const [bestTradeToken0, bestTradeToken1] = [platformTradeToken0[0], platformTradeToken1[0]]
    let zapInCalculatedAmounts
    if (parsedAmount && pair && totalSupply && chainId) {
      if (bestTradeToken0 && bestTradeToken1) {
        zapInCalculatedAmounts = calculateZapInAmounts(
          parsedAmount,
          pair,
          totalSupply,
          bestTradeToken0.executionPrice.invert(),
          bestTradeToken1.executionPrice.invert(),
          chainId
        )
        console.log('total LP', zapInCalculatedAmounts.liquidityMinted?.toExact())
      } else {
        returnInputError = SWAP_INPUT_ERRORS.TRADE_NOT_FOUND
      }
    }

    if (allowedSlippage && bestTradeToken0 && bestTradeToken1) {
      const slippageAdjustedAmountsTrade0 = bestTradeToken0 && computeSlippageAdjustedAmounts(bestTradeToken0)
      const slippageAdjustedAmountsTrade1 = bestTradeToken1 && computeSlippageAdjustedAmounts(bestTradeToken1)
      // compare input balance to Max input based on version
      const maxAmountInToken0 = slippageAdjustedAmountsTrade0 ? slippageAdjustedAmountsTrade0[Field.INPUT] : null
      const maxAmountInToken1 = slippageAdjustedAmountsTrade1 ? slippageAdjustedAmountsTrade1[Field.INPUT] : null
      const balanceIn = relevantTokenBalances[0]
      if (
        balanceIn &&
        maxAmountInToken0 &&
        maxAmountInToken1 &&
        balanceIn.lessThan(maxAmountInToken0.add(maxAmountInToken1))
      ) {
        returnInputError = SWAP_INPUT_ERRORS.INSUFFICIENT_BALANCE
      }
      //TODO compare with inputAmountBalance0 and pick better
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
      tradeToken0: bestTradeToken0,
      tradeToken1: bestTradeToken1,
      inputError: returnInputError,
      loading,
      inputAmountTrade0: zapInCalculatedAmounts?.amountFromForTokenA,
      inputAmountTrade1: zapInCalculatedAmounts?.amountFromForTokenB,
      liquidityMinted: zapInCalculatedAmounts?.liquidityMinted,
    } as ReturnedValue
  } else {
    const trade = platformTrade ? platformTrade : allPlatformTrades[0] // the first trade is the best trade
    const slippageAdjustedAmounts = trade && allowedSlippage && computeSlippageAdjustedAmounts(trade)

    // compare input balance to MAx input based on version
    const [balanceIn, amountIn] = [
      relevantTokenBalances[0],
      slippageAdjustedAmounts ? slippageAdjustedAmounts[Field.INPUT] : null,
    ]

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
      allPlatformTrades: inputError === SWAP_INPUT_ERRORS.SELECT_TOKEN ? [] : allPlatformTrades,
      inputError: returnInputError,
      loading,
    } as ReturnedValue
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

    const outputCurrencyId = !!parsed[Field.OUTPUT].currencyId?.length
      ? parsed[Field.OUTPUT].currencyId
      : PRE_SELECT_OUTPUT_CURRENCY_ID[chainId]

    dispatch(
      replaceSwapState({
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
