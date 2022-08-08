import { Currency, CurrencyAmount, Percent, Trade } from '@swapr/sdk'

import { useEffect, useState } from 'react'

// Eco Router modules
// Web3 hooks
import { useActiveWeb3React } from '../../hooks'
import { useIsMultihop, useUserSlippageTolerance } from '../../state/user/hooks'
import { getExactIn, getExactOut } from './api'
// Types
// eslint-disable-next-line
import { EcoRouterHookResults } from './types'

/**
 * Eco Router hook
 * @param currencyAmountIn Input currency amount
 * @param currencyOut Output currency
 * @returns {EcoRouterHookResults} List of trade sources
 */
export function useEcoRouterExactIn(currencyAmountIn?: CurrencyAmount, currencyOut?: Currency): EcoRouterHookResults {
  const [loading, setLoading] = useState(true)
  // All trades including Curve, Unsiwap V2 and CowSwap
  const [trades, setTrades] = useState<Trade[]>([])
  // Errors
  const [errors, setErrors] = useState<any[]>([])
  // Chain Id
  const { chainId, account, library } = useActiveWeb3React()
  // Uniswap V2 Trade option: using multi-hop option
  const uniswapV2IsMultihop = useIsMultihop()
  // Used to trigger computing trade route
  const currencyInAndOutAdddress = `${currencyOut?.address}-${currencyAmountIn?.currency.address}`
  // User max slippage
  const userSlippageTolerance = useUserSlippageTolerance()

  useEffect(() => {
    let isCancelled = false

    // Early exit and clean state if necessary
    if (!currencyAmountIn || !account || !currencyAmountIn.currency || !library || !currencyOut || !chainId) {
      setTrades([])
      setLoading(false)

      return
    }

    // Reset state

    setTrades([])
    setLoading(true)

    getExactIn(
      {
        user: account,
        currencyAmountIn,
        currencyOut,
        maximumSlippage: new Percent(userSlippageTolerance.toString(), '10000'),
        receiver: account ?? undefined,
      },
      {
        uniswapV2: {
          useMultihops: uniswapV2IsMultihop,
        },
      },
      library
    )
      .then(newTrades => {
        // Only update this invokation is not cancelled
        if (!isCancelled) {
          setTrades(newTrades.trades)
          setErrors(newTrades.errors)
        }
      })
      .catch(error => setErrors([error]))
      .finally(() => setLoading(false))

    return () => {
      isCancelled = true
    }
    // eslint-disable-next-line
  }, [
    chainId,
    uniswapV2IsMultihop,
    // eslint-disable-next-line
    currencyAmountIn?.toSignificant(),
    currencyInAndOutAdddress,
    account,
    userSlippageTolerance,
  ])

  return {
    loading,
    errors,
    trades,
  }
}

/**
 * Eco Router hook
 * @param currencyIn Input currency
 * @param currencyAmountOut Output currency amount
 * @returns {EcoRouterResults} List of trade sources
 */
export function useEcoRouterExactOut(currencyIn?: Currency, currencyAmountOut?: CurrencyAmount): EcoRouterHookResults {
  const [loading, setLoading] = useState(true)
  // All trades including Curve, Unsiwap V2 and CowSwap
  const [trades, setTrades] = useState<Trade[]>([])
  // Errors
  const [errors, setErrors] = useState<any[]>([])
  // Chain Id
  const { chainId, account, library } = useActiveWeb3React()
  // Uniswap V2 Trade option: using multi-hop option
  const uniswapV2IsMultihop = useIsMultihop()
  // Used to trigger computing trade route
  const currencyInAndOutAdddress = `${currencyIn?.address}-${currencyAmountOut?.currency.address}`
  // User max slippage
  const userSlippageTolerance = useUserSlippageTolerance()

  useEffect(() => {
    let isCancelled = false

    // Early exit and clean state if necessary
    if (!currencyAmountOut || !account || !currencyAmountOut.currency || !currencyIn || !chainId) {
      setTrades([])
      setLoading(false)
      return
    }

    // Reset state

    setTrades([])
    setLoading(true)

    getExactOut(
      {
        user: account,
        currencyAmountOut,
        currencyIn,
        maximumSlippage: new Percent(userSlippageTolerance.toString(), '10000'),
        receiver: account ?? undefined,
      },
      {
        uniswapV2: {
          useMultihops: uniswapV2IsMultihop,
        },
      },
      library
    )
      .then(newTrades => {
        // Only update this invokation is not cancelled
        if (!isCancelled) {
          setTrades(newTrades.trades)
          setErrors(newTrades.errors)
        }
      })
      .catch(error => setErrors([error]))
      .finally(() => setLoading(false))

    return () => {
      isCancelled = true
    }
    // eslint-disable-next-line
  }, [
    chainId,
    uniswapV2IsMultihop,
    // eslint-disable-next-line
    currencyAmountOut?.toSignificant(),
    currencyInAndOutAdddress,
    account,
    userSlippageTolerance,
  ])

  return {
    loading,
    errors,
    trades,
  }
}
