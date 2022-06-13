import { Currency, CurrencyAmount, Percent, Trade } from '@swapr/sdk'

import { useEffect, useState } from 'react'
import { unstable_batchedUpdates as batchedUpdates } from 'react-dom';



// Eco Router modules
// Web3 hooks
import { useActiveWeb3React } from '../../hooks'
import { useIsMultihop } from '../../state/user/hooks'
import { getExactIn, getExactOut } from './api'
// Types
// eslint-disable-next-line
import type { EcoRouterHookResults } from './types'

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

  useEffect(() => {
    let isCancelled = false

    // Early exit and clean state if necessary
    if (!currencyAmountIn || !currencyAmountIn.currency || !currencyOut || !chainId) {
      batchedUpdates(() => {
        setTrades([])
        setLoading(false)
      })
      return
    }

    // Reset state
    batchedUpdates(() => {
      setTrades([])
      setLoading(true)
    })

    getExactIn(
      {
        currencyAmountIn,
        currencyOut,
        maximumSlippage: new Percent('3', '100'),
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
          batchedUpdates(() => {
            setTrades(newTrades.trades)
            setErrors(newTrades.errors)
          })
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

  useEffect(() => {
    let isCancelled = false

    // Early exit and clean state if necessary
    if (!currencyAmountOut || !currencyAmountOut.currency || !currencyIn || !chainId) {
      batchedUpdates(() => {
        setTrades([])
        setLoading(false)
      })
      return
    }

    // Reset state
    batchedUpdates(() => {
      setTrades([])
      setLoading(true)
    })

    getExactOut(
      {
        currencyAmountOut,
        currencyIn,
        maximumSlippage: new Percent('3', '100'),
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
  ])

  return {
    loading,
    errors,
    trades,
  }
}
