import { StaticJsonRpcProvider } from '@ethersproject/providers'
import { parseUnits } from '@ethersproject/units'
import {
  ChainId,
  Currency,
  CurrencyAmount,
  getAllCommonUniswapV2Pairs,
  JSBI,
  Pair,
  parseBigintIsh,
  Percent,
  Token,
  TokenAmount,
  Trade,
  UniswapV2RoutablePlatform,
  UniswapV2Trade,
} from '@swapr/sdk'

import { createSelector } from '@reduxjs/toolkit'
import { BigNumber } from 'ethers'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { PRE_SELECT_OUTPUT_CURRENCY_ID, SUPPORTED_ZAP_DEX_INDEX, SWAP_INPUT_ERRORS } from '../../constants/index'
import { useTotalSupply } from '../../data/TotalSupply'
import { useActiveWeb3React } from '../../hooks'
import { useTradeExactInUniswapV2 } from '../../hooks/Trades'
import { useNativeCurrency } from '../../hooks/useNativeCurrency'
import { useParsedQueryString } from '../../hooks/useParsedQueryString'
import { EcoRouterResults, getUniswapV2PlatformList, sortTradesByExecutionPrice } from '../../lib/eco-router'
import { isAddress } from '../../utils'
import { currencyId } from '../../utils/currencyId'
import { getPathFromTrade } from '../../utils/getPathFromTrade'
import { calculateZapInAmounts, calculateZapOutAmounts } from '../../utils/prices'
import { AppDispatch, AppState } from '../index'
import { useTokenBalances } from '../wallet/hooks'
import { replaceZapState, selectCurrency, setPairTokens, setRecipient, switchZapDirection, typeInput } from './actions'
import { Field, SwapTx, ZapContractParams } from './types'

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
  contractParams: ZapContractParams
  estLpMintedZapIn: TokenAmount | undefined
  estAmountZapOut: TokenAmount | undefined
  inputError?: number
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

  const zapInCalculatedAmounts = useMemo(() => {
    return calculateZapInAmounts(
      isZapIn ? data.parsedAmount : undefined,
      pair,
      totalSupply,
      tradeToken0?.executionPrice.invert(),
      tradeToken1?.executionPrice.invert(),
      chainId
    )
  }, [chainId, data.parsedAmount, isZapIn, pair, totalSupply, tradeToken0?.executionPrice, tradeToken1?.executionPrice])

  // balances
  const relevantTokenBalances = useTokenBalances(account ?? undefined, [pair?.liquidityToken])
  const userLiquidity: undefined | TokenAmount = relevantTokenBalances?.[pair?.liquidityToken?.address ?? '']

  const zapOutCalculatedAmounts = useMemo(() => {
    return calculateZapOutAmounts(
      isZapIn ? undefined : data.parsedAmount,
      pair,
      totalSupply,
      userLiquidity,
      tradeToken0?.executionPrice,
      tradeToken1?.executionPrice,
      chainId
    )
  }, [
    chainId,
    data.parsedAmount,
    isZapIn,
    pair,
    totalSupply,
    tradeToken0?.executionPrice,
    tradeToken1?.executionPrice,
    userLiquidity,
  ])

  const exactTrade0 = useTradeExactInUniswapV2(
    zapInCalculatedAmounts?.amountFromForTokenA,
    pair?.token0,
    platformTrade0
  )
  const exactTrade1 = useTradeExactInUniswapV2(
    zapInCalculatedAmounts?.amountFromForTokenB,
    pair?.token1,
    platformTrade1
  )

  const inputError =
    isZapIn &&
    data.parsedAmount &&
    data.tradeToken0 &&
    data.tradeToken1 &&
    (!exactTrade0?.inputAmount || !exactTrade1?.inputAmount)
      ? SWAP_INPUT_ERRORS.ZAP_NOT_AVAILABLE
      : undefined

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

  const zapIn = useMemo(() => {
    if (isZapIn)
      return {
        amountAMin: zeroBN,
        amountBMin: zeroBN,
        amountLPMin: zeroBN, // FOR TEST LEFT ZERO, LATER CAN BE CHANGED TO amountLpMinWithSlippage
        dexIndex: dexIdZap,
      }
    return undefined
  }, [dexIdZap, isZapIn, zeroBN])

  const zapOut = useMemo(() => {
    if (isZapIn) return undefined
    return {
      amountLpFrom: data.parsedAmount ? data.parsedAmount.raw.toString() : zeroBN,
      amountTokenToMin: zeroBN,
      dexIndex: dexIdZap,
    }
  }, [data.parsedAmount, dexIdZap, isZapIn, zeroBN])

  return {
    contractParams: { zapIn, zapOut, swapTokenA, swapTokenB, recipient: null },
    estLpMintedZapIn: zapInCalculatedAmounts?.estLpTokenMinted,
    estAmountZapOut: zapOutCalculatedAmounts?.estAmountTokenTo,
    inputError,
  }
}

export async function getTradesPromiseZapUniV2(
  parsedAmount: CurrencyAmount,
  outputCurrency: Currency,
  commonParams: { maximumSlippage: Percent; receiver: string; user: string },
  ecoRouterSourceOptionsParams: { uniswapV2: { useMultihops: boolean } },
  staticJsonRpcProvider: StaticJsonRpcProvider | undefined,
  signal: AbortSignal,
  chainId: ChainId | undefined
): Promise<EcoRouterResults> {
  const abortPromise = new Promise<EcoRouterResults>((_, reject) => {
    signal.onabort = () => {
      reject(new DOMException('Aborted', 'AbortError'))
    }
  })
  // Error list
  const errors: any[] = []

  if (!chainId) {
    return {
      errors: [new Error('Unsupported chain')],
      trades: [],
    }
  }

  // Uniswap V2
  // Get the list of Uniswap V2 platform that support current chain
  const uniswapV2PlatformList = getUniswapV2PlatformList(chainId)

  const uniswapV2TradesList = uniswapV2PlatformList.map(async platform => {
    try {
      const getAllCommonUniswapV2PairsParams = {
        currencyA: parsedAmount.currency,
        currencyB: outputCurrency,
        platform,
        staticJsonRpcProvider,
      }

      const pairs = await getAllCommonUniswapV2Pairs(getAllCommonUniswapV2PairsParams)

      return (
        UniswapV2Trade.computeTradesExactIn({
          currencyAmountIn: parsedAmount,
          currencyOut: outputCurrency,
          maximumSlippage: commonParams.maximumSlippage,
          maxHops: {
            maxHops: ecoRouterSourceOptionsParams.uniswapV2.useMultihops ? 3 : 1,
            maxNumResults: 1,
          },
          pairs,
        })[0] ?? undefined
      )
    } catch (error) {
      errors.push(error)
      return undefined
    }
  })

  // Wait for all promises to resolve, and
  // remove undefined values
  const unsortedTradesWithUndefined = await Promise.all<Trade | undefined>([...uniswapV2TradesList])
  const unsortedTrades = unsortedTradesWithUndefined.filter((trade): trade is Trade => !!trade)

  // Return the list of sorted trades
  const ecoRouterPromise = {
    errors,
    trades: sortTradesByExecutionPrice(unsortedTrades),
  }

  return await Promise.race([abortPromise, ecoRouterPromise])
}

export async function getZapBestTradesUniV2(
  parsedAmount: CurrencyAmount,
  pairCurrency0: Currency,
  pairCurrency1: Currency,
  outputCurrency: Currency,
  commonParams: { maximumSlippage: Percent; receiver: string; user: string },
  ecoRouterSourceOptionsParams: { uniswapV2: { useMultihops: boolean } },
  staticJsonRpcProvider: StaticJsonRpcProvider | undefined,
  signal: AbortSignal,
  chainId: ChainId | undefined,
  isZapIn: boolean
): Promise<Trade[]> {
  const bestTradesTokens: Trade[] = []
  let allPlatformTrades: EcoRouterResults[] = []

  // use half of the parsed amount to find best routes for to different tokens and estimate prices
  const halfParsedAmount = tryParseAmount(
    parsedAmount.divide(parseBigintIsh('2')).toSignificant(parsedAmount.currency.decimals),
    parsedAmount.currency,
    chainId
  )

  // estimated amounts of token0 & token1 needed just to find the routes
  const inputCurrency0Amount = tryParseAmount(
    parsedAmount.divide(parseBigintIsh('2')).toSignificant(pairCurrency0.decimals),
    pairCurrency0,
    chainId
  )
  const inputCurrency1Amount = tryParseAmount(
    parsedAmount.divide(parseBigintIsh('2')).toSignificant(pairCurrency1.decimals),
    pairCurrency1,
    chainId
  )

  try {
    const getTradesToken0 = getTradesPromiseZapUniV2(
      isZapIn ? halfParsedAmount ?? parsedAmount : inputCurrency0Amount ?? parsedAmount,
      isZapIn ? pairCurrency0 : outputCurrency,
      commonParams,
      ecoRouterSourceOptionsParams,
      staticJsonRpcProvider,
      signal,
      chainId
    )

    const getTradesToken1 = getTradesPromiseZapUniV2(
      isZapIn ? halfParsedAmount ?? parsedAmount : inputCurrency1Amount ?? parsedAmount,
      isZapIn ? pairCurrency1 : outputCurrency,
      commonParams,
      ecoRouterSourceOptionsParams,
      staticJsonRpcProvider,
      signal,
      chainId
    )

    allPlatformTrades = await Promise.all<EcoRouterResults>([getTradesToken0, getTradesToken1])
  } catch (error) {
    console.debug('Zap trades not found!', error)
    return []
  }

  bestTradesTokens.push(
    allPlatformTrades[0].trades.filter(t => !!t?.details)[0],
    allPlatformTrades[1].trades.filter(t => !!t?.details)[0]
  )

  return bestTradesTokens
}
