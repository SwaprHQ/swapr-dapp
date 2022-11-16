import { TransactionReceipt } from '@ethersproject/abstract-provider'
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

import { ContractTransaction, UnsignedTransaction } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'
import { useEffect, useMemo, useState } from 'react'

import { useAnalytics } from '../analytics'
import { INITIAL_ALLOWED_SLIPPAGE } from '../constants'
import { MainnetGasPrice } from '../state/application/actions'
import { useMainnetGasPrices } from '../state/application/hooks'
import { useAllSwapTransactions, useTransactionAdder } from '../state/transactions/hooks'
import { SwapProtocol } from '../state/transactions/reducer'
import { useUserPreferredGasPrice } from '../state/user/hooks'
import { calculateGasMargin, isAddress, shortenAddress } from '../utils'
import { limitNumberOfDecimalPlaces } from '../utils/prices'
import { useZapContract } from './useContract'
import useENS from './useENS'
import useTransactionDeadline from './useTransactionDeadline'
import { Zap, ZapInterface } from './zap/Zap'

import { useActiveWeb3React } from './index'

export enum ZapState {
  UNKNOWN,
  INVALID,
  LOADING,
  VALID,
}

export enum ZapType {
  NOT_APPLICABLE,
  ZAP_IN,
  ZAP_OUT,
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

export interface SwapTx {
  amount: BigNumber
  amountMin: BigNumber
  path: string[]
  dexIndex: BigNumber
}

export interface ZapInTx {
  amountAMin: BigNumber
  amountBMin: BigNumber
  amountLPMin: BigNumber
  dexIndex: BigNumber
  to: string // the ENS name or address of the recipient of the trade
}

export interface ZapOutTx {
  amountLpFrom: BigNumber
  amountTokenToMin: BigNumber
  dexIndex: BigNumber
  to: string // the ENS name or address of the recipient of the trade
}

export interface UseZapInCallbackParams {
  swapTokenA: SwapTx
  swapTokenB: SwapTx
  zapIn?: ZapInTx
  zapOut?: ZapOutTx
  allowedSlippage: number // in bips
  transferResidual: boolean
  affiliate: string
}

export interface UseZapCallbackReturn {
  zapType: ZapType
  callback?: () => Promise<string>
  state: ZapState
  error: string | null
}

/**
 * Returns a function that will execute a zap, if the parameters are all valid
 * and the user has approved the slippage adjusted input amount for the trade
 */
export function useZapCallback({
  swapTokenA,
  swapTokenB,
  zapIn,
  zapOut,
  allowedSlippage = INITIAL_ALLOWED_SLIPPAGE,
  affiliate,
  transferResidual,
}: UseZapInCallbackParams): UseZapCallbackReturn {
  const { account, chainId, library } = useActiveWeb3React()
  const zapContract = useZapContract() as Zap
  const [zapState, setZapState] = useState(ZapState.UNKNOWN)
  const [zapType, setZapType] = useState(ZapType.NOT_APPLICABLE)
  console.log('zap callback inside', zapContract)

  const zapToAddress = zapType === ZapType.ZAP_IN ? zapIn?.to : zapOut?.to
  const { address: recipientAddress } = useENS(zapToAddress)
  const recipient = zapToAddress === null ? account : recipientAddress

  // Watch the transaction from transaction reducer
  const [transactionReceipt, setTransactionReceipt] = useState<ContractTransaction | undefined>()

  const allTransactions = useAllSwapTransactions()
  useEffect(() => {
    const isTransactionSuccessful =
      transactionReceipt && allTransactions[transactionReceipt.hash]?.receipt?.status === 1

    zapType !== ZapType.NOT_APPLICABLE && isTransactionSuccessful && setZapState(ZapState.VALID)
  }, [transactionReceipt, allTransactions, zapType])

  const addTransaction = useTransactionAdder()

  useEffect(() => {
    setZapType(zapIn ? ZapType.ZAP_IN : zapOut ? ZapType.ZAP_OUT : ZapType.NOT_APPLICABLE)
  }, [zapIn, zapOut])

  return useMemo(() => {
    if (!zapContract || !library || !account || !chainId) {
      return {
        zapType: ZapType.NOT_APPLICABLE,
        state: ZapState.INVALID,
        callback: undefined,
        error: 'Missing dependencies',
      }
    }
    if (!recipient) {
      if (zapToAddress !== null) {
        return {
          zapType: ZapType.NOT_APPLICABLE,
          state: ZapState.INVALID,
          callback: undefined,
          error: 'Invalid recipient',
        }
      } else {
        return { zapType: zapType, state: ZapState.LOADING, callback: undefined, error: null }
      }
    }

    if (zapType === ZapType.ZAP_IN && zapIn) {
      return {
        zapType: ZapType.NOT_APPLICABLE,
        callback: async () => {
          try {
            console.log('ESSA zap in callback', zapContract, {
              swapTokenA,
              swapTokenB,
              zapIn,
              affiliate,
              transferResidual,
            })
            // Set state to pending
            setZapState(ZapState.LOADING)
            const txReceipt = await zapContract.zapIn(swapTokenA, swapTokenB, zapIn, affiliate, transferResidual)
            console.log('zap in tx', txReceipt)
            setTransactionReceipt(txReceipt)
            addTransaction(txReceipt, { summary: 'Zap in' })
            return 'wio'
          } catch (error) {
            console.error('Could not zap in!', error)
            //if something goes wrong, reset status
            setZapState(ZapState.INVALID)
            return 'Error'
          }
        },
        state: zapState,
        error: null,
      }
    } else if (zapType === ZapType.ZAP_OUT && zapOut) {
      return {
        zapType: ZapType.NOT_APPLICABLE,
        callback: async () => {
          try {
            console.log('ESSA zap out callback')
            // Set state to pending
            setZapState(ZapState.LOADING)
            const txReceipt = await zapContract.zapOut(zapOut, swapTokenA, swapTokenB, affiliate)
            setTransactionReceipt(txReceipt)
            addTransaction(txReceipt, { summary: 'Zap out' })
            return 'wio'
          } catch (error) {
            console.error('Could not zap out!', error)
            //if something goes wrong, reset status
            setZapState(ZapState.INVALID)
            return 'Error'
          }
        },
        state: zapState,
        error: null,
      }
    } else {
      return {
        zapType: ZapType.NOT_APPLICABLE,
        state: ZapState.INVALID,
        callback: undefined,
        error: 'Undefined',
      }
    }
  }, [
    zapContract,
    library,
    account,
    chainId,
    recipient,
    zapType,
    zapIn,
    zapToAddress,
    zapState,
    swapTokenA,
    swapTokenB,
    affiliate,
    transferResidual,
    addTransaction,
    zapOut,
  ])
}
