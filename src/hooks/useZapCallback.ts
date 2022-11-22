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

import { BigNumberish, ContractTransaction, UnsignedTransaction } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'
import { useEffect, useMemo, useState } from 'react'

import { useAnalytics } from '../analytics'
import { INITIAL_ALLOWED_SLIPPAGE, SUPPORTED_DEX_ZAP_INDEX, ZERO_ADDRESS } from '../constants'
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
import { Zap } from './zap/Zap'

import { useActiveWeb3React } from './index'

export enum ZapState {
  UNKNOWN,
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

export type ZapInType = Parameters<Zap['functions']['zapIn']>
export type ZapOutType = Parameters<Zap['functions']['zapOut']>
export type ZapInTx = ZapInType[0]
export type ZapOutTx = ZapOutType[0]
export type SwapTx = ZapInType[1]

export interface UseZapInCallbackParams {
  zapIn?: ZapInTx
  zapOut?: ZapOutTx
  swapTokenA: SwapTx
  swapTokenB: SwapTx
  recipient: string | null
  affiliate?: string
  transferResidual?: boolean
}

export interface UseZapCallbackReturn {
  callback?: () => Promise<string>
  state: ZapState
  error: string | null
}

/**
 * Returns a function that will execute a zap, if the parameters are all valid
 * and the user has approved the slippage adjusted input amount for the trade
 */
export function useZapCallback({
  zapIn,
  zapOut,
  swapTokenA,
  swapTokenB,
  recipient,
  affiliate,
  transferResidual = true,
}: UseZapInCallbackParams): UseZapCallbackReturn {
  const { account, chainId, library } = useActiveWeb3React()
  const zapContract = useZapContract() as Zap
  const [zapState, setZapState] = useState(ZapState.UNKNOWN)
  console.log('zap callback constract', zapContract)

  const [preferredGasPrice] = useUserPreferredGasPrice()
  const mainnetGasPrices = useMainnetGasPrices()

  const { address: receiverENS } = useENS(recipient)
  const receiver = receiverENS ?? account
  const affiliateAddress = affiliate ?? ZERO_ADDRESS
  console.log('zap callback inside add', recipient, receiver, account)

  // Watch the transaction from transaction reducer
  const [transactionReceipt, setTransactionReceipt] = useState<ContractTransaction | undefined>()

  const allTransactions = useAllSwapTransactions()
  useEffect(() => {
    const isTransactionSuccessful =
      transactionReceipt && allTransactions[transactionReceipt.hash]?.receipt?.status === 1

    isTransactionSuccessful && setZapState(ZapState.VALID)
  }, [transactionReceipt, allTransactions])

  const addTransaction = useTransactionAdder()

  return useMemo(() => {
    if (!zapContract || !library || !account || !chainId || !receiver || receiver === ZERO_ADDRESS) {
      console.log('zap error', zapContract, library, account, chainId, receiver)
      return {
        callback: undefined,
        state: ZapState.INVALID,
        error: 'Missing dependencies',
      }
    }
    let normalizedGasPrice: BigNumberish
    if (preferredGasPrice && chainId === ChainId.MAINNET) {
      if (!(preferredGasPrice in MainnetGasPrice)) {
        normalizedGasPrice = preferredGasPrice
      } else if (mainnetGasPrices) {
        normalizedGasPrice = mainnetGasPrices[preferredGasPrice as MainnetGasPrice]
      }
    }

    if (zapIn && !zapOut) {
      return {
        callback: async () => {
          try {
            console.log('ESSA zap in callback', zapContract)
            // Set state to pending
            setZapState(ZapState.LOADING)
            console.log('zap callback params TOP', {
              zapIn,
              zapOut,
              swapTokenA,
              swapTokenB,
              receiver,
              affiliateAddress,
              transferResidual,
            })
            // const zapInTx = await zapContract.setSupportedDEX(
            //   BigNumber.from(SUPPORTED_DEX_ZAP_INDEX[UniswapV2RoutablePlatform.SWAPR.name]),
            //   UniswapV2RoutablePlatform.SWAPR.name,
            //   '0xE43e60736b1cb4a75ad25240E2f9a62Bff65c0C0',
            //   '0x5D48C95AdfFD4B40c1AAADc4e08fc44117E02179'
            // )
            const zapInTx = await zapContract.zapIn(
              zapIn,
              swapTokenA,
              swapTokenB,
              receiver,
              affiliateAddress,
              transferResidual,
              {
                gasLimit: 30000000,
                gasPrice: normalizedGasPrice,
              }
            )
            console.log('zap in tx', zapInTx)
            setTransactionReceipt(zapInTx)
            addTransaction(zapInTx, { summary: 'Zap in' })
            const zapInTxReceipt = await zapInTx.wait(1)
            if (zapInTxReceipt.status === 1) setZapState(ZapState.VALID)
            return 'Zap in successed'
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
    }

    if (zapOut && !zapIn) {
      return {
        callback: async () => {
          try {
            console.log('ESSA zap out callback')
            // Set state to pending
            setZapState(ZapState.LOADING)
            const txReceipt = await zapContract.zapOut(zapOut, swapTokenA, swapTokenB, receiver, affiliateAddress)
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
        callback: undefined,
        state: ZapState.INVALID,
        error: 'Undefined',
      }
    }
  }, [
    zapContract,
    library,
    account,
    chainId,
    receiver,
    zapIn,
    zapOut,
    zapState,
    swapTokenA,
    swapTokenB,
    affiliateAddress,
    transferResidual,
    addTransaction,
  ])
}
