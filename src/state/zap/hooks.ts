import { AddressZero } from '@ethersproject/constants'
import { StaticJsonRpcProvider } from '@ethersproject/providers'
import { parseUnits } from '@ethersproject/units'
import { Currency, CurrencyAmount, JSBI, Pair, Percent, RoutablePlatform, Token, TokenAmount, Trade } from '@swapr/sdk'

import { createSelector } from '@reduxjs/toolkit'
import { useWhatChanged } from '@simbathesailor/use-what-changed'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { unstable_batchedUpdates } from 'react-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Route } from 'react-router-dom'

import { SWAP_INPUT_ERRORS } from '../../constants/index'
import { useActiveWeb3React } from '../../hooks'
import { useCurrency } from '../../hooks/Tokens'
import { useAbortController } from '../../hooks/useAbortController'
import { useZapContract } from '../../hooks/useContract'
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
import { UseDerivedSwapInfoResult } from '../swap/hooks'
import { useIsMultihop, useUserSlippageTolerance } from '../user/hooks'
import { useCurrencyBalances } from '../wallet/hooks'
import { selectPair, selectToken, setRecipient, switchZapDirection, typeInput, updateZapState } from './actions'
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
  onTokenSelection: (tokenId: Currency) => void
  onPairSelection: (pairId: string, token0Id: string, token1Id: string) => void
  onUserInput: (independentField: Field, typedValue: string) => void
  onChangeRecipient: (recipient: string | null) => void
  onSwitchDirection: () => void
} {
  const dispatch = useDispatch<AppDispatch>()

  const onTokenSelection = useCallback(
    (tokenId: Currency) => {
      dispatch(
        selectToken({
          tokenId: currencyId(tokenId),
        })
      )
    },
    [dispatch]
  )

  const onSwitchDirection = useCallback(() => {
    dispatch(switchZapDirection())
  }, [dispatch])

  const onPairSelection = useCallback(
    (pairId: string, token0Id: string, token1Id: string) => {
      dispatch(
        selectPair({
          pairId: pairId,
          token0Id: token0Id,
          token1Id: token1Id,
        })
      )
    },
    [dispatch]
  )

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

  return {
    onTokenSelection,
    onPairSelection,
    onUserInput,
    onChangeRecipient,
    onSwitchDirection,
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
  trade0: Trade | undefined
  trade1: Trade | undefined
  allPlatformTrades: (Trade | undefined)[] | undefined
  inputError?: number
  loading: boolean
}

export function useDerivedZapInfo(platformOverride?: RoutablePlatform): UseDerivedZapInfoResult {
  const { account, chainId, library: provider } = useActiveWeb3React()
  // Get all options for the input and output currencies
  const {
    typedValue,
    [Field.INPUT]: { tokenId: inputTokenId },
    [Field.OUTPUT]: { token0Id: outputToken0Id, token1Id: outputToken1Id, pairId: outputPairId },
    recipient,
    independentField,
  } = useZapState()
  const allowedSlippage = useUserSlippageTolerance()
  const useMultihops = useIsMultihop()
  const recipientLookup = useENS(recipient ?? undefined)
  const inputCurrency = useCurrency(inputTokenId)
  const outputCurrency = useCurrency(outputToken0Id)
  const outputCurrency1 = useCurrency(outputToken1Id)
  const outputPair = useCurrency(outputPairId)
  // Start by retrieveing the balances of the input and output currencies
  const relevantTokenBalances = useCurrencyBalances(account ?? undefined, [
    inputCurrency ?? undefined,
    outputPair ?? undefined,
  ])
  // Internal state
  const [loading, setLoading] = useState<boolean>(false)
  const [inputError, setInputError] = useState<number | undefined>()
  // const [trade, setTrade] = useState<Trade>()
  const [allPlatformTrades, setAllPlatformTrades] = useState<Trade[]>([])
  const [allPlatformTrades1, setAllPlatformTrades1] = useState<Trade[]>([])

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
    outputCurrency1?.address,
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
    if (!inputCurrency || !outputCurrency || !outputCurrency1) {
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
    console.log('zap in out0 out1', inputCurrency, outputCurrency, outputCurrency1, parsedAmount)

    // Update swap state with the new input
    setInputError(inputErrorNextState)
    setLoading(true)
    setAllPlatformTrades([])

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

    const getTrades1 = getTradesPromise(
      parsedAmount,
      inputCurrency,
      outputCurrency1,
      commonParams,
      ecoRouterSourceOptionsParams,
      provider,
      signal
    )

    // Start fetching trades from EcoRouter API
    getTrades1
      .then(trades => {
        setAllPlatformTrades1(trades.trades)
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
      setAllPlatformTrades([])
      setAllPlatformTrades1([])
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
  if (platformOverride) {
    platformTrade = allPlatformTrades.filter(t => t?.platform === platformOverride)[0]
  }
  const trade0 = platformTrade ? platformTrade : allPlatformTrades[0] // the first trade is the best trade
  const trade1 = platformTrade ? platformTrade : allPlatformTrades1[0] // the first trade is the best trade

  const slippageAdjustedAmounts = trade0 && allowedSlippage && computeSlippageAdjustedAmounts(trade0)

  // const trade0 = allPlatformTrades.filter(t => t?.platform.name === 'Swapr')[0]
  // const trade1 = allPlatformTrades1.filter(t => t?.platform.name === 'Swapr')[0]
  console.log('zap get all trades', allPlatformTrades, allPlatformTrades1)
  console.log('zap get best trade', trade0, trade1, typeof trade0?.details)
  // compare input balance to Max input based on version
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
      [Field.OUTPUT]: outputPair ?? undefined,
    },
    currencyBalances: {
      [Field.INPUT]: relevantTokenBalances[0] ?? undefined,
      [Field.OUTPUT]: relevantTokenBalances[1] ?? undefined,
    },
    parsedAmount,
    trade0,
    trade1,
    allPlatformTrades: inputError === SWAP_INPUT_ERRORS.SELECT_TOKEN ? [] : allPlatformTrades,
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
