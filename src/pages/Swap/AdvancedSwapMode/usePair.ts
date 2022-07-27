import { ChainId, Currency } from '@swapr/sdk'

import { subgraphClientsUris } from 'apollo/client'
import request from 'graphql-request'
import { useActiveWeb3React } from 'hooks'
import { useCurrency } from 'hooks/Tokens'
import { useEffect, useState } from 'react'
import { useSwapState } from 'state/swap/hooks'
import { SWPRSupportedChains } from 'utils/chainSupportsSWPR'

import { QUERY_PAIR_TRANSACTIONS, QUERY_PAIRS } from './AdvancedSwapMode.query'
import { Pair, PairHistoryTransactions, TransactionHistory } from './AdvancedSwapMode.types'
import { WrappedNative } from './AdvancedSwapMode.utils'

export const usePair = () => {
  const [pairs, setPairs] = useState<Pair[]>()
  const [targetedPair, setTargetedPair] = useState<Pair>()
  const [pairHistoryTransactions, setPairHistoryTransactions] = useState<PairHistoryTransactions>()

  const { chainId } = useActiveWeb3React()

  useEffect(() => {
    const fetchPairs = async () => {
      try {
        if (chainId === ChainId.POLYGON) throw new Error('Polygon is unsupported')

        const { pairs } = await request<{ pairs: Pair[] }>(
          subgraphClientsUris[(chainId as SWPRSupportedChains) ?? ChainId.MAINNET],
          QUERY_PAIRS
        )
        if (pairs.length) {
          setPairs(pairs)
        }
      } catch {
        setPairs(undefined)
      }
    }

    fetchPairs()
  }, [chainId])

  const {
    INPUT: { currencyId: inputCurrencyId },
    OUTPUT: { currencyId: outputCurrencyId },
  } = useSwapState()

  // convert native currency to wrapped currency
  const [inputToken, outputToken] = [
    useCurrency(
      inputCurrencyId === Currency.getNative(chainId ?? ChainId.MAINNET).symbol
        ? WrappedNative[chainId ?? ChainId.MAINNET].address
        : inputCurrencyId
    ),
    useCurrency(
      outputCurrencyId === Currency.getNative(chainId ?? ChainId.MAINNET).symbol
        ? WrappedNative[chainId ?? ChainId.MAINNET].symbol
        : outputCurrencyId
    ),
  ]

  useEffect(() => {
    const fetchPairTransactionsHistory = async () => {
      try {
        if (!inputCurrencyId || !outputCurrencyId) throw new Error('No token details')

        const targetedPair = pairs?.find(pair => {
          const { token0, token1 } = pair
          const inputCurrencyIdLowerCase = inputCurrencyId.toLowerCase()
          const outputCurrencyIdLowerCase = outputCurrencyId.toLowerCase()
          if (
            (token0.id === inputCurrencyIdLowerCase || token1.id === inputCurrencyIdLowerCase) &&
            (token0.id === outputCurrencyIdLowerCase || token1.id === outputCurrencyIdLowerCase)
          ) {
            return pair
          }

          return
        })

        if (!targetedPair) throw new Error('Pair not found')

        setTargetedPair(targetedPair)

        const pairHistoryTransactions = await request<PairHistoryTransactions>(
          subgraphClientsUris[(chainId as SWPRSupportedChains) ?? ChainId.MAINNET],
          QUERY_PAIR_TRANSACTIONS,
          {
            pairId: targetedPair.id.toLowerCase(),
          }
        )
        setPairHistoryTransactions(pairHistoryTransactions)
      } catch (e) {
        setPairHistoryTransactions(undefined)
      }
    }

    fetchPairTransactionsHistory()
  }, [chainId, inputCurrencyId, outputCurrencyId, pairs])

  const swaps = [...(pairHistoryTransactions?.swaps ?? [])].reduce<TransactionHistory[]>((allPairSwaps, swap) => {
    const { amount0In, amount0Out, amount1In, amount1Out, amountUSD, id, timestamp, transaction } = swap

    const historyAmountIn =
      Number(amount1In) === 0
        ? `${amount0In} ${targetedPair?.token0.symbol}`
        : `${amount1In} ${targetedPair?.token1.symbol}`

    const historyAmountOut =
      Number(amount1Out) === 0
        ? `${amount0Out} ${targetedPair?.token0.symbol}`
        : `${amount1Out} ${targetedPair?.token1.symbol}`

    allPairSwaps.push({
      id,
      timestamp,
      transaction,
      amount0: historyAmountIn,
      amount1: historyAmountOut,
      amountUSD,
    })

    return allPairSwaps
  }, [])

  const burnsAndMints = [pairHistoryTransactions?.burns ?? [], pairHistoryTransactions?.mints ?? []].flat()

  return {
    burnsAndMints,
    swaps,
    inputTokenSymbol: inputToken?.symbol,
    outputTokenSymbol: outputToken?.symbol,
    isLoading: false,
  }
}
