import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import {
  ChainId,
  CoWTrade,
  CurrencyAmount,
  CurveTrade,
  Trade,
  TradeType,
  UniswapTrade,
  UniswapV2RoutablePlatform,
  UniswapV2Trade,
  ZeroXTrade,
} from '@swapr/sdk'

import { UnsignedTransaction } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'
import { useMemo } from 'react'

import { useAnalytics } from '../analytics'
import { INITIAL_ALLOWED_SLIPPAGE } from '../constants'
import { MainnetGasPrice } from '../state/application/actions'
import { useMainnetGasPrices } from '../state/application/hooks'
import { useTransactionAdder } from '../state/transactions/hooks'
import { SwapProtocol } from '../state/transactions/reducer'
import { useUserPreferredGasPrice } from '../state/user/hooks'
import { calculateGasMargin, isAddress, shortenAddress } from '../utils'
import { limitNumberOfDecimalPlaces } from '../utils/prices'
import { useZapContract } from './useContract'
import useENS from './useENS'
import useTransactionDeadline from './useTransactionDeadline'

import { useActiveWeb3React } from './index'

export enum ZapCallbackState {
  INVALID,
  LOADING,
  VALID,
}

interface SwapCall {
  contract?: Contract
  transactionParameters: Promise<UnsignedTransaction>
}

interface SuccessfulCall {
  call: SwapCall
  gasEstimate: BigNumber
}

interface FailedCall {
  call: SwapCall
  error: Error
}

type EstimatedSwapCall = SuccessfulCall | FailedCall

/**
 * Returns the swap calls that can be used to make the trade
 * @param trade trade to execute
 * @param allowedSlippage user allowed slippage
 * @param recipientAddressOrName
 */
export function useSwapsCallArguments(
  trades: (Trade | undefined)[] | undefined, // trade to execute, required
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE, // in bips
  recipientAddressOrName: string | null // the ENS name or address of the recipient of the trade, or null if swap should be returned to sender
): SwapCall[][] {
  const { account, chainId, library } = useActiveWeb3React()
  const { address: recipientAddress } = useENS(recipientAddressOrName)
  const recipient = recipientAddressOrName === null ? account : recipientAddress
  const deadline = useTransactionDeadline()

  return useMemo(() => {
    if (!trades || trades.length === 0 || !recipient || !library || !account || !chainId || !deadline) {
      return []
    }

    return trades.map(trade => {
      if (!trade) {
        return []
      }

      const swapMethods = []
      // Curve, Uniswap v3, ZeroX
      if (trade instanceof CurveTrade || trade instanceof UniswapTrade || trade instanceof ZeroXTrade) {
        return [
          {
            transactionParameters: trade.swapTransaction(),
          },
        ]
      }

      // Uniswap V2 trade
      if (trade instanceof UniswapV2Trade) {
        swapMethods.push(
          trade.swapTransaction({
            recipient,
            ttl: deadline.toNumber(),
          })
        )
      }

      /**
       * @todo implement slippage
       */
      if (allowedSlippage > 6 && trade.tradeType === TradeType.EXACT_INPUT) {
        // swapMethods.push(
        // Router.swapCallParameters(trade, {
        //   feeOnTransfer: true,
        //   allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
        //   recipient,
        //   ttl: deadline.toNumber()
        // })
        // )
      }

      return swapMethods.map(transactionParameters => ({ transactionParameters }))
    })
  }, [account, allowedSlippage, chainId, deadline, library, trades, recipient])
}

/**
 * Returns the zap summary for UI components
 */
export function getZapSummary(trade: Trade, recipientAddressOrName: string | null): string {
  const inputSymbol = trade.inputAmount.currency.symbol
  const outputSymbol = trade.outputAmount.currency.symbol
  const inputAmount = limitNumberOfDecimalPlaces(trade.inputAmount)
  const outputAmount = limitNumberOfDecimalPlaces(trade.outputAmount)
  const platformName = trade.platform.name

  const base = `Zap ${inputAmount} ${inputSymbol} for ${outputAmount} ${outputSymbol} ${
    platformName !== UniswapV2RoutablePlatform.SWAPR.name ? `on ${platformName}` : ''
  }`

  return recipientAddressOrName != null
    ? `${base} to ${
        recipientAddressOrName && isAddress(recipientAddressOrName)
          ? shortenAddress(recipientAddressOrName)
          : recipientAddressOrName
      }`
    : base
}

export interface UseZapCallbackParams {
  amountFrom: CurrencyAmount | undefined
  amount0Min: CurrencyAmount | undefined
  amount1Min: CurrencyAmount | undefined
  pathToPairToken0: string[] | undefined
  pathToPairToken1: string[] | undefined
  allowedSlippage: number // in bips
  recipientAddressOrName: string | null // the ENS name or address of the recipient of the trade, or null if swap should be returned to sender
  router: string
}

export interface UseZapCallbackReturn {
  state: ZapCallbackState
  callback?: () => Promise<void>
  error: string | null
}
/**
 * Returns a function that will execute a swap, if the parameters are all valid
 * and the user has approved the slippage adjusted input amount for the trade
 */
export function useZapCallback({
  amountFrom,
  amount0Min,
  amount1Min,
  pathToPairToken0,
  pathToPairToken1,
  allowedSlippage = INITIAL_ALLOWED_SLIPPAGE,
  recipientAddressOrName,
  router,
}: UseZapCallbackParams): UseZapCallbackReturn {
  const { account, chainId, library } = useActiveWeb3React()
  const zapContract = useZapContract()
  const [preferredGasPrice] = useUserPreferredGasPrice()

  const addTransaction = useTransactionAdder()

  const { address: recipientAddress } = useENS(recipientAddressOrName)
  const recipient = recipientAddressOrName === null ? account : recipientAddress

  return useMemo(() => {
    if (!zapContract || !library || !account || !chainId || !amountFrom || !amount0Min || !amount1Min) {
      return { state: ZapCallbackState.INVALID, callback: undefined, error: 'Missing dependencies' }
    }
    if (!recipient) {
      if (recipientAddressOrName !== null) {
        return { state: ZapCallbackState.INVALID, callback: undefined, error: 'Invalid recipient' }
      } else {
        return { state: ZapCallbackState.LOADING, callback: undefined, error: null }
      }
    }

    const amountFromBN = parseUnits(amountFrom.toExact(), amountFrom.currency.decimals)
    const amount0MinBN = parseUnits(amount0Min.toExact(), amount0Min.currency.decimals)
    const amount1MinBN = parseUnits(amount1Min.toExact(), amount1Min.currency.decimals)
    return {
      state: ZapCallbackState.VALID,
      callback: async function onZapIn(): Promise<void> {
        try {
          console.log('zap callback inside')
          const zapTx = await zapContract.zapInFromToken(
            amountFromBN,
            amount0MinBN,
            amount1MinBN,
            pathToPairToken0,
            pathToPairToken1,
            router,
            {
              gasLimit: BigNumber.from(21000000),
              gasPrice: preferredGasPrice,
            }
          )
          // TODO summary
          addTransaction(zapTx, {
            summary: `Zap ${amountFrom.toSignificant(6)} ${amountFrom.currency.symbol}`,
          })
        } catch (error) {
          // TODO error msg
          console.error('Could not zap', error)
        }
      },
      error: null,
    }
  }, [
    zapContract,
    library,
    account,
    chainId,
    amountFrom,
    amount0Min,
    amount1Min,
    recipient,
    recipientAddressOrName,
    pathToPairToken0,
    pathToPairToken1,
    router,
    preferredGasPrice,
    addTransaction,
  ])
}
