import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { ChainId, currencyEquals, Token, Trade, TradeType, WETH } from 'dxswap-sdk'
import { useMemo } from 'react'
import { DEFAULT_DEADLINE_FROM_NOW, INITIAL_ALLOWED_SLIPPAGE, ROUTER_ADDRESS } from '../constants'
import { useTokenAllowance } from '../data/Allowances'
import { Field } from '../state/swap/actions'
import { useTransactionAdder } from '../state/transactions/hooks'
import { calculateGasMargin, getRouterContract, isAddress } from '../utils'
import { computeSlippageAdjustedAmounts } from '../utils/prices'
import { useActiveWeb3React } from './index'
import useENSName from './useENSName'

// TODO: I have some doubts here. Lots of breaking changes coming in from Uniswap

enum SwapType {
  EXACT_TOKENS_FOR_TOKENS,
  EXACT_TOKENS_FOR_ETH,
  EXACT_ETH_FOR_TOKENS,
  TOKENS_FOR_EXACT_TOKENS,
  TOKENS_FOR_EXACT_ETH,
  ETH_FOR_EXACT_TOKENS
}

export enum SwapCallbackState {
  INVALID,
  LOADING,
  VALID
}

function getSwapType(trade: Trade | undefined, chainId: ChainId): SwapType | undefined {
  if (!trade) return undefined
  const inputWETH = currencyEquals(trade.inputAmount.currency, WETH[chainId])
  const outputWETH = currencyEquals(trade.outputAmount.currency, WETH[chainId])
  const isExactIn = trade.tradeType === TradeType.EXACT_INPUT
  if (isExactIn) {
    if (inputWETH) {
      return SwapType.EXACT_ETH_FOR_TOKENS
    } else if (outputWETH) {
      return SwapType.EXACT_TOKENS_FOR_ETH
    } else {
      return SwapType.EXACT_TOKENS_FOR_TOKENS
    }
  } else {
    if (inputWETH) {
      return SwapType.ETH_FOR_EXACT_TOKENS
    } else if (outputWETH) {
      return SwapType.TOKENS_FOR_EXACT_ETH
    } else {
      return SwapType.TOKENS_FOR_EXACT_TOKENS
    }
  }
}

// returns a function that will execute a swap, if the parameters are all valid
// and the user has approved the slippage adjusted input amount for the trade
export function useSwapCallback(
  trade?: Trade, // trade to execute, required,
  inputToken?: Token,
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE, // in bips
  deadline: number = DEFAULT_DEADLINE_FROM_NOW, // in seconds from now
  to?: string // recipient of output, optional
): null | (() => Promise<string>) {
  const { account, chainId, library } = useActiveWeb3React()
  const addTransaction = useTransactionAdder()
  const recipient = to ? isAddress(to) : account
  const ensName = useENSName(to)
  const inputAllowance = useTokenAllowance(inputToken, account ?? undefined, ROUTER_ADDRESS)

  return useMemo(() => {
    if (!trade || !recipient || !inputToken) return null

    // will always be defined
    const {
      [Field.INPUT]: slippageAdjustedInput,
      [Field.OUTPUT]: slippageAdjustedOutput
    } = computeSlippageAdjustedAmounts(trade, allowedSlippage)

    if (!slippageAdjustedInput || !slippageAdjustedOutput) return null

    // no allowance
    if (
      !currencyEquals(trade?.inputAmount?.currency, WETH[chainId as ChainId]) &&
      (!inputAllowance || slippageAdjustedInput.greaterThan(inputAllowance))
    ) {
      return null
    }

    return async function onSwap() {
      if (!chainId || !library || !account) {
        throw new Error('missing dependencies in onSwap callback')
      }

      const contract: Contract | null = getRouterContract(chainId, library, account)
      if (!contract) {
        throw new Error('Failed to get a swap contract')
      }

      const path = trade.route.path.map(t => t.address)

      const deadlineFromNow: number = Math.ceil(Date.now() / 1000) + deadline

      const swapType = getSwapType(trade, chainId)

      // let estimate: Function, method: Function,
      let methodNames: string[],
        args: Array<string | string[] | number>,
        value: BigNumber | null = null
      switch (swapType) {
        case SwapType.EXACT_TOKENS_FOR_TOKENS:
          methodNames = ['swapExactTokensForTokens', 'swapExactTokensForTokensSupportingFeeOnTransferTokens']
          args = [
            slippageAdjustedInput.raw.toString(),
            slippageAdjustedOutput.raw.toString(),
            path,
            recipient,
            deadlineFromNow
          ]
          break
        case SwapType.TOKENS_FOR_EXACT_TOKENS:
          methodNames = ['swapTokensForExactTokens']
          args = [
            slippageAdjustedOutput.raw.toString(),
            slippageAdjustedInput.raw.toString(),
            path,
            recipient,
            deadlineFromNow
          ]
          break
        case SwapType.EXACT_ETH_FOR_TOKENS:
          methodNames = ['swapExactETHForTokens', 'swapExactETHForTokensSupportingFeeOnTransferTokens']
          args = [slippageAdjustedOutput.raw.toString(), path, recipient, deadlineFromNow]
          value = BigNumber.from(slippageAdjustedInput.raw.toString())
          break
        case SwapType.TOKENS_FOR_EXACT_ETH:
          methodNames = ['swapTokensForExactETH']
          args = [
            slippageAdjustedOutput.raw.toString(),
            slippageAdjustedInput.raw.toString(),
            path,
            recipient,
            deadlineFromNow
          ]
          break
        case SwapType.EXACT_TOKENS_FOR_ETH:
          methodNames = ['swapExactTokensForETH', 'swapExactTokensForETHSupportingFeeOnTransferTokens']
          args = [
            slippageAdjustedInput.raw.toString(),
            slippageAdjustedOutput.raw.toString(),
            path,
            recipient,
            deadlineFromNow
          ]
          break
        case SwapType.ETH_FOR_EXACT_TOKENS:
          methodNames = ['swapETHForExactTokens']
          args = [slippageAdjustedOutput.raw.toString(), path, recipient, deadlineFromNow]
          value = BigNumber.from(slippageAdjustedInput.raw.toString())
          break
        default:
          throw new Error(`Unhandled swap type: ${swapType}`)
      }

      const safeGasEstimates: (BigNumber | undefined)[] = await Promise.all(
        methodNames.map(methodName =>
          contract.estimateGas[methodName](...args, value ? { value } : {})
            .then(calculateGasMargin)
            .catch(error => {
              console.error(`estimateGas failed for ${methodName}`, error)
              return undefined
            })
        )
      )

      // we expect failures from left to right, so throw if we see failures
      // from right to left
      for (let i = 0; i < safeGasEstimates.length - 1; i++) {
        // if the FoT method fails, but the regular method does not, we should not
        // use the regular method. this probably means something is wrong with the fot token.
        if (BigNumber.isBigNumber(safeGasEstimates[i]) && !BigNumber.isBigNumber(safeGasEstimates[i + 1])) {
          throw new Error(
            'An error occurred. Please try raising your slippage. If that does not work, contact support.'
          )
        }
      }

      const indexOfSuccessfulEstimation = safeGasEstimates.findIndex(safeGasEstimate =>
        BigNumber.isBigNumber(safeGasEstimate)
      )

      // all estimations failed...
      if (indexOfSuccessfulEstimation === -1) {
        // if only 1 method exists, either:
        // a) the token is doing something weird not related to FoT (e.g. enforcing a whitelist)
        // b) the token is FoT and the user specified an exact output, which is not allowed
        if (methodNames.length === 1) {
          throw Error(
            `An error occurred. If either of the tokens you're swapping take a fee on transfer, you must specify an exact input amount.`
          )
        }
        // if 2 methods exists, either:
        // a) the token is doing something weird not related to FoT (e.g. enforcing a whitelist)
        // b) the token is FoT and is taking more than the specified slippage
        else if (methodNames.length === 2) {
          throw Error(
            `An error occurred. If either of the tokens you're swapping take a fee on transfer, you must specify a slippage tolerance higher than the fee.`
          )
        } else {
          throw Error('This transaction would fail. Please contact support.')
        }
      } else {
        const methodName = methodNames[indexOfSuccessfulEstimation]
        const safeGasEstimate = safeGasEstimates[indexOfSuccessfulEstimation]

        return contract[methodName](...args, {
          gasLimit: safeGasEstimate,
          ...(value ? { value } : {})
        })
          .then((response: any) => {
            const inputSymbol = trade.inputAmount.currency.symbol
            const outputSymbol = trade.outputAmount.currency.symbol
            const inputAmount = slippageAdjustedInput.toSignificant(3)
            const outputAmount = slippageAdjustedOutput.toSignificant(3)

            const base = `Swap ${inputAmount} ${inputSymbol} for ${outputAmount} ${outputSymbol}`
            const withRecipient = recipient === account ? base : `${base} to ${ensName ?? recipient}`

            addTransaction(response, {
              summary: withRecipient
            })

            return response.hash
          })
          .catch((error: any) => {
            // if the user rejected the tx, pass this along
            if (error?.code === 4001) {
              throw error
            }
            // otherwise, the error was unexpected and we need to convey that
            else {
              console.error(`Swap failed`, error, methodName, args, value)
              throw Error('An error occurred while swapping. Please contact support.')
            }
          })
      }
    }
  }, [
    trade,
    recipient,
    inputToken,
    allowedSlippage,
    chainId,
    inputAllowance,
    library,
    account,
    deadline,
    ensName,
    addTransaction
  ])
}
