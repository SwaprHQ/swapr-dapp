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
  UniswapV2RoutablePlatform,
} from '@swapr/sdk'

import { createSelector } from '@reduxjs/toolkit'
import { useWhatChanged } from '@simbathesailor/use-what-changed'
import { BigNumber, BigNumberish } from 'ethers'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { unstable_batchedUpdates } from 'react-dom'
import { useDispatch, useSelector } from 'react-redux'

import {
  PRE_SELECT_OUTPUT_CURRENCY_ID,
  PRE_SELECT_ZAP_PAIR_ID,
  SUPPORTED_ZAP_DEX_INDEX,
  SWAP_INPUT_ERRORS,
} from '../../constants/index'
import { usePairAtAddress } from '../../data/Reserves'
import { useTotalSupply } from '../../data/TotalSupply'
import { useActiveWeb3React } from '../../hooks'
import { useCurrency } from '../../hooks/Tokens'
import { useTradeExactInUniswapV2 } from '../../hooks/Trades'
import { useAbortController } from '../../hooks/useAbortController'
import useENS from '../../hooks/useENS'
import { useNativeCurrency } from '../../hooks/useNativeCurrency'
import { useParsedQueryString } from '../../hooks/useParsedQueryString'
import { SwapTx, ZapInTx, ZapOutTx } from '../../hooks/useZapCallback'
import {
  EcoRouterResults,
  getExactIn as getExactInFromEcoRouter,
  getExactOut as getExactOutFromEcoRouter,
} from '../../lib/eco-router'
import { calculateSlippageAmount, isAddress } from '../../utils'
import { currencyId } from '../../utils/currencyId'
import { getPathFromTrade } from '../../utils/getPathFromTrade'
import { calculateZapInAmounts, calculateZapOutAmounts, computeSlippageAdjustedAmounts } from '../../utils/prices'
import { wrappedCurrency } from '../../utils/wrappedCurrency'
import { AppDispatch, AppState } from '../index'
import { useIsMultihop, useUserSlippageTolerance } from '../user/hooks'
import { useCurrencyBalances, useTokenBalances } from '../wallet/hooks'
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
  inputError?: number
  loading: boolean
  zapInInputAmountTrade0: CurrencyAmount | undefined
  zapInInputAmountTrade1: CurrencyAmount | undefined
  zapInLiquidityMinted: TokenAmount | undefined
  zapOutOutputAmount: CurrencyAmount | undefined
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
  readonly pairTokens: {
    token0Id: string | undefined
    token1Id: string | undefined
  }
  recipient: string | null
}

export function queryParametersToZapState(
  parsedQs: SearchParams,
  nativeCurrencyId: string
): QueryParametersToSwapStateResponse {
  let inputCurrency = parseCurrencyFromURLParameter(parsedQs.inputCurrency, nativeCurrencyId)
  let outputCurrency = parseCurrencyFromURLParameter(parsedQs.pair, nativeCurrencyId)
  let token0 = parsedQs.token0
  let token1 = parsedQs.token1
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
    pairTokens: {
      token0Id: token0,
      token1Id: token1,
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

    const inputCurrencyId = !!parsed[Field.INPUT].currencyId?.length
      ? parsed[Field.INPUT].currencyId
      : PRE_SELECT_OUTPUT_CURRENCY_ID[chainId]

    const outputCurrencyId = !!parsed[Field.OUTPUT].currencyId?.length ? parsed[Field.OUTPUT].currencyId : ''

    const token0Id = !!parsed.pairTokens.token0Id?.length ? parsed.pairTokens.token0Id : ''

    const token1Id = !!parsed.pairTokens.token1Id?.length ? parsed.pairTokens.token1Id : ''

    dispatch(
      replaceZapState({
        typedValue: parsed.typedValue,
        field: parsed.independentField,
        inputCurrencyId,
        outputCurrencyId,
        recipient: parsed.recipient,
      })
    )

    dispatch(dispatch(setPairTokens({ token0Id: token0Id, token1Id: token1Id })))

    setResult({ inputCurrencyId: parsed[Field.INPUT].currencyId, outputCurrencyId: parsed[Field.OUTPUT].currencyId })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, chainId])

  return result
}

export const useZapParams = (
  data: UseDerivedZapInfoResult,
  pair: Pair | undefined,
  isZapIn = true
): {
  zapIn: ZapInTx | undefined
  zapOut: ZapOutTx | undefined
  swapTokenA: SwapTx
  swapTokenB: SwapTx
  estLpMintedZapIn: TokenAmount | undefined
  estAmountZapOut: TokenAmount | undefined
} => {
  const { account, chainId } = useActiveWeb3React()
  const totalSupply = useTotalSupply(pair?.liquidityToken)

  const zeroBN = BigNumber.from(0)
  const dexIdZap = BigNumber.from(SUPPORTED_ZAP_DEX_INDEX[pair?.platform.name ?? UniswapV2RoutablePlatform.SWAPR.name])
  const dexIdSwapA = BigNumber.from(
    SUPPORTED_ZAP_DEX_INDEX[data.tradeToken0?.platform.name ?? UniswapV2RoutablePlatform.SWAPR.name]
  )
  const dexIdSwapB = BigNumber.from(
    SUPPORTED_ZAP_DEX_INDEX[data.tradeToken1?.platform.name ?? UniswapV2RoutablePlatform.SWAPR.name]
  )

  const tradeToken0 = data.tradeToken0
  const tradeToken1 = data.tradeToken1
  const platformTrade0 = (tradeToken0?.platform as UniswapV2RoutablePlatform) ?? undefined
  const platformTrade1 = (tradeToken1?.platform as UniswapV2RoutablePlatform) ?? undefined

  const zapInCalculatedAmounts = calculateZapInAmounts(
    isZapIn ? data.parsedAmount : undefined,
    pair,
    totalSupply,
    tradeToken0?.executionPrice.invert(),
    tradeToken1?.executionPrice.invert(),
    chainId
  )

  // balances
  const relevantTokenBalances = useTokenBalances(account ?? undefined, [pair?.liquidityToken])
  const userLiquidity: undefined | TokenAmount = relevantTokenBalances?.[pair?.liquidityToken?.address ?? '']

  const zapOutCalculatedAmounts = calculateZapOutAmounts(
    isZapIn ? undefined : data.parsedAmount,
    pair,
    totalSupply,
    userLiquidity,
    tradeToken0?.executionPrice,
    tradeToken1?.executionPrice,
    chainId
  )

  const exactTrade0 = useTradeExactInUniswapV2(zapInCalculatedAmounts.amountFromForTokenA, pair?.token0, platformTrade0)
  const exactTrade1 = useTradeExactInUniswapV2(zapInCalculatedAmounts.amountFromForTokenB, pair?.token1, platformTrade1)

  const swapTokenA: SwapTx = {
    amount: isZapIn && exactTrade0?.inputAmount ? exactTrade0.inputAmount.raw.toString() : zeroBN,
    amountMin: zeroBN, // FOR TEST LEFT ZERO, LATER CAN BE CHANGED TO  isZapIn && exactTrade0 ? exactTrade0.minimumAmountOut().toSignificant() : zeroBN,
    path: getPathFromTrade(data.tradeToken0),
    dexIndex: dexIdSwapA,
  }

  const swapTokenB: SwapTx = {
    amount: isZapIn && exactTrade1?.inputAmount ? exactTrade1.inputAmount.raw.toString() : zeroBN,
    amountMin: zeroBN, // FOR TEST LEFT ZERO, LATER CAN BE CHANGED TO  isZapIn && exactTrade1 ? exactTrade1.minimumAmountOut().toSignificant() : zeroBN,
    path: getPathFromTrade(data.tradeToken1),
    dexIndex: dexIdSwapB,
  }

  const zapIn = isZapIn
    ? {
        amountAMin: zeroBN,
        amountBMin: zeroBN,
        amountLPMin: zeroBN, // FOR TEST LEFT ZERO, LATER CAN BE CHANGED TO amountLpMinWithSlippage
        dexIndex: dexIdZap,
      }
    : undefined

  const zapOut = zapIn
    ? undefined
    : {
        amountLpFrom: data.parsedAmount ? data.parsedAmount.raw.toString() : zeroBN,
        amountTokenToMin: zeroBN,
        dexIndex: dexIdZap,
      }

  return {
    zapIn,
    zapOut,
    swapTokenA,
    swapTokenB,
    estLpMintedZapIn: zapInCalculatedAmounts.estLpTokenMinted,
    estAmountZapOut: zapOutCalculatedAmounts.estAmountTokenTo,
  }
}
