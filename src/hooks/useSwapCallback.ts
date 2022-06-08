import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { UnsignedTransaction } from 'ethers'
import {
  UniswapV2Trade,
  UniswapV2RoutablePlatform,
  Trade,
  CurveTrade,
  ChainId,
  TradeType,
  GnosisProtocolTrade,
} from '@swapr/sdk'
import { useMemo } from 'react'
import { INITIAL_ALLOWED_SLIPPAGE } from '../constants'
import { useTransactionAdder } from '../state/transactions/hooks'
import { calculateGasMargin, isAddress, shortenAddress } from '../utils'
import { useActiveWeb3React } from './index'
import useTransactionDeadline from './useTransactionDeadline'
import useENS from './useENS'
import { useMainnetGasPrices } from '../state/application/hooks'
import { useUserPreferredGasPrice } from '../state/user/hooks'
import { MainnetGasPrice } from '../state/application/actions'
import { SwapProtocol } from '../state/transactions/reducer'

export enum SwapCallbackState {
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
    if (!trades || trades.length === 0 || !recipient || !library || !account || !chainId || !deadline) return []

    return trades.map(trade => {
      if (!trade) {
        return []
      }

      const swapMethods = []
      // Curve trade
      if (trade instanceof CurveTrade) {
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
  }, [account, allowedSlippage, chainId, deadline, library, recipient, trades])
}

/**
 * Returns the swap summary for UI components
 */
export function getSwapSummary(trade: Trade, recipientAddressOrName: string | null): string {
  const inputSymbol = trade.inputAmount.currency.symbol
  const outputSymbol = trade.outputAmount.currency.symbol
  const inputAmount = trade.inputAmount.toSignificant(3)
  const outputAmount = trade.outputAmount.toSignificant(3)
  const platformName = trade.platform.name

  const base = `Swap ${inputAmount} ${inputSymbol} for ${outputAmount} ${outputSymbol} ${
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

export interface UseSwapCallbackParams {
  trade: Trade | undefined // trade to execute
  allowedSlippage: number // in bips
  recipientAddressOrName: string | null // the ENS name or address of the recipient of the trade, or null if swap should be returned to sender
}

export interface UseSwapCallbackReturn {
  state: SwapCallbackState
  callback: null | (() => Promise<string>)
  error: string | null
}
/**
 * Returns a function that will execute a swap, if the parameters are all valid
 * and the user has approved the slippage adjusted input amount for the trade
 */
export function useSwapCallback({
  trade,
  allowedSlippage = INITIAL_ALLOWED_SLIPPAGE,
  recipientAddressOrName,
}: UseSwapCallbackParams): UseSwapCallbackReturn {
  const { account, chainId, library } = useActiveWeb3React()
  const mainnetGasPrices = useMainnetGasPrices()
  const [preferredGasPrice] = useUserPreferredGasPrice()

  const memoizedTrades = useMemo(() => (trade ? [trade] : undefined), [trade])
  const [swapCalls] = useSwapsCallArguments(memoizedTrades, allowedSlippage, recipientAddressOrName)

  const addTransaction = useTransactionAdder()

  const { address: recipientAddress } = useENS(recipientAddressOrName)
  const recipient = recipientAddressOrName === null ? account : recipientAddress

  return useMemo(() => {
    if (!trade || !library || !account || !chainId) {
      return { state: SwapCallbackState.INVALID, callback: null, error: 'Missing dependencies' }
    }
    if (!recipient) {
      if (recipientAddressOrName !== null) {
        return { state: SwapCallbackState.INVALID, callback: null, error: 'Invalid recipient' }
      } else {
        return { state: SwapCallbackState.LOADING, callback: null, error: null }
      }
    }

    return {
      state: SwapCallbackState.VALID,
      callback: async function onSwap(): Promise<string> {
        // GPv2 trade
        if (trade instanceof GnosisProtocolTrade) {
          const signer = library.getSigner()

          // Sign the order using Metamask
          // and then submit the order to GPv2
          const orderId = await trade
            .signOrder(signer)
            .then((trade: { submitOrder: () => Promise<string> }) => trade.submitOrder())

          addTransaction(
            {
              hash: orderId,
            },
            {
              summary: getSwapSummary(trade, recipientAddressOrName ?? null),
              swapProtocol: SwapProtocol.COW,
            }
          )

          return orderId
        }
        // eslint-disable-next-line
        // @ts-ignore
        const estimatedCalls: EstimatedSwapCall[] = await Promise.all(
          swapCalls.map(async call => {
            const transactionRequest = await call.transactionParameters
            // Ignore gas estimation if the request has gasLimit property
            if (transactionRequest.gasLimit) {
              return {
                call,
                gasEstimate: transactionRequest.gasLimit as BigNumber,
              }
            }

            return library
              .getSigner()
              .estimateGas(transactionRequest as any)
              .then(gasEstimate => ({
                call,
                gasEstimate,
              }))
              .catch((gasError: string) => {
                console.debug('Gas estimate failed, trying eth_call to extract error', transactionRequest, gasError)

                return library
                  .call(transactionRequest as any)
                  .then((result: string) => {
                    console.debug('Unexpected successful call after failed estimate gas', call, gasError, result)
                    return {
                      call,
                      error: new Error('Unexpected issue with estimating the gas. Please try again.'),
                    }
                  })
                  .catch((callError: { reason: string }) => {
                    console.debug('Call threw error', call, callError)
                    let errorMessage: string
                    switch (callError.reason) {
                      case 'DXswapRouter: INSUFFICIENT_OUTPUT_AMOUNT':
                      case 'DXswapRouter: EXCESSIVE_INPUT_AMOUNT':
                        errorMessage =
                          'This transaction will not succeed either due to price movement or fee on transfer. Try increasing your slippage tolerance.'
                        break
                      default:
                        errorMessage = `The transaction cannot succeed due to error: ${callError.reason}. This is probably an issue with one of the tokens you are swapping.`
                    }
                    return { call, error: new Error(errorMessage) }
                  })
              })
          })
        )

        // a successful estimation is a bignumber gas estimate and the next call is also a bignumber gas estimate
        const successfulEstimation = estimatedCalls.find(
          (el, ix, list): el is SuccessfulCall =>
            'gasEstimate' in el && (ix === list.length - 1 || 'gasEstimate' in list[ix + 1])
        )

        if (!successfulEstimation) {
          const errorCalls = estimatedCalls.filter((call): call is FailedCall => 'error' in call)
          if (errorCalls.length > 0) throw errorCalls[errorCalls.length - 1].error
          throw new Error('Unexpected error. Please contact support: none of the calls threw an error')
        }

        const {
          call: { transactionParameters },
          gasEstimate,
        } = successfulEstimation

        let normalizedGasPrice = undefined
        if (preferredGasPrice && chainId === ChainId.MAINNET) {
          if (!(preferredGasPrice in MainnetGasPrice)) {
            normalizedGasPrice = preferredGasPrice
          } else if (mainnetGasPrices) {
            normalizedGasPrice = mainnetGasPrices[preferredGasPrice as MainnetGasPrice]
          }
        }

        return library
          .getSigner()
          .sendTransaction({
            gasLimit: calculateGasMargin(gasEstimate),
            gasPrice: normalizedGasPrice,
            ...((await transactionParameters) as any),
          })
          .then(response => {
            addTransaction(response, {
              summary: getSwapSummary(trade, recipient),
            })

            return response.hash
          })
          .catch(error => {
            // if the user rejected the tx, pass this along
            if (error?.code === 4001) {
              throw new Error('Transaction rejected.')
            } else {
              // otherwise, the error was unexpected and we need to convey that
              console.error(`Swap failed`, error, transactionParameters)
              throw new Error(`Swap failed: ${error.message}`)
            }
          })
      },
      error: null,
    }
  }, [
    trade,
    library,
    account,
    chainId,
    recipient,
    recipientAddressOrName,
    swapCalls,
    preferredGasPrice,
    mainnetGasPrices,
    addTransaction,
  ])
}
