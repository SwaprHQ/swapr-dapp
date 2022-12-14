import { ChainId, CurrencyAmount } from '@swapr/sdk'

import { BigNumberish, ContractTransaction } from 'ethers'
import { useEffect, useMemo, useState } from 'react'

import { ZERO_ADDRESS } from '../constants'
import { MainnetGasPrice } from '../state/application/actions'
import { useMainnetGasPrices } from '../state/application/hooks'
import { Field } from '../state/swap/types'
import { useAllSwapTransactions, useTransactionAdder } from '../state/transactions/hooks'
import { useUserPreferredGasPrice } from '../state/user/hooks'
import { UseZapCallbackParams } from '../state/zap/types'
import { calculateGasMargin, isAddress, shortenAddress } from '../utils'
import { limitNumberOfDecimalPlaces } from '../utils/prices'
import { useZapContract } from './useContract'
import useENS from './useENS'
import { Zap } from './zap/Zap'

import { useActiveWeb3React } from './index'

export enum ZapState {
  UNKNOWN,
  INVALID,
  LOADING,
  VALID,
}

/**
 * Returns the zap summary for UI components
 */
export function getZapSummary(
  parsedAmounts: { [Field.INPUT]: CurrencyAmount | undefined; [Field.OUTPUT]: CurrencyAmount | undefined },
  recipientAddressOrName: string | null,
  zapIn: boolean
): string {
  const inputSymbol = parsedAmounts[Field.INPUT]?.currency.symbol
  const outputSymbol = parsedAmounts[Field.OUTPUT]?.currency.symbol
  const inputAmount = limitNumberOfDecimalPlaces(parsedAmounts[Field.INPUT])
  const outputAmount = limitNumberOfDecimalPlaces(parsedAmounts[Field.OUTPUT])

  const base = `Zap ${zapIn ? 'in' : 'out'} ${inputAmount} ${inputSymbol} for ${outputAmount} ${outputSymbol}`

  return recipientAddressOrName != null
    ? `${base} to ${
        recipientAddressOrName && isAddress(recipientAddressOrName)
          ? shortenAddress(recipientAddressOrName)
          : recipientAddressOrName
      }`
    : base
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
export function useZapCallback({ zapContractParams, parsedAmounts }: UseZapCallbackParams): UseZapCallbackReturn {
  const { zapIn, zapOut, swapTokenA, swapTokenB, recipient, affiliate, transferResidual = true } = zapContractParams
  const { account, chainId, library } = useActiveWeb3React()
  const zapContract = useZapContract() as Zap
  const [zapState, setZapState] = useState(ZapState.UNKNOWN)

  const [preferredGasPrice] = useUserPreferredGasPrice()
  const mainnetGasPrices = useMainnetGasPrices()

  const { address: receiverENS } = useENS(recipient)
  const receiver = receiverENS ?? account
  const affiliateAddress = affiliate ?? ZERO_ADDRESS

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
            // Set state to pending
            setZapState(ZapState.LOADING)

            let estimatedGas = await zapContract.estimateGas
              .zapIn(zapIn, swapTokenA, swapTokenB, receiver, affiliateAddress, transferResidual)
              .catch((error: Error) => {
                console.debug('Gas estimation failed', error)
                return undefined
              })
            const txGasLimit = estimatedGas
              ? calculateGasMargin(estimatedGas)
              : (await library.getBlock('latest')).gasLimit

            const zapInTx = await zapContract.zapIn(
              zapIn,
              swapTokenA,
              swapTokenB,
              receiver,
              affiliateAddress,
              transferResidual,
              {
                gasLimit: txGasLimit,
                gasPrice: normalizedGasPrice,
              }
            )
            setTransactionReceipt(zapInTx)
            addTransaction(zapInTx, { summary: getZapSummary(parsedAmounts, receiver, true) })
            const zapInTxReceipt = await zapInTx.wait(1)
            if (zapInTxReceipt.status === 1) setZapState(ZapState.VALID)
            return 'Zap in succeeded'
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
            // Set state to pending
            setZapState(ZapState.LOADING)

            let estimatedGas = await zapContract.estimateGas
              .zapOut(zapOut, swapTokenA, swapTokenB, receiver, affiliateAddress)
              .catch((error: Error) => {
                console.debug('Gas estimation failed', error)
                return undefined
              })
            const txGasLimit = estimatedGas
              ? calculateGasMargin(estimatedGas)
              : (await library.getBlock('latest')).gasLimit

            const zapOutTx = await zapContract.zapOut(zapOut, swapTokenA, swapTokenB, receiver, affiliateAddress, {
              gasLimit: calculateGasMargin(txGasLimit),
              gasPrice: normalizedGasPrice,
            })
            setTransactionReceipt(zapOutTx)
            addTransaction(zapOutTx, { summary: getZapSummary(parsedAmounts, receiver, false) })
            const zapOutTxReceipt = await zapOutTx.wait(1)
            if (zapOutTxReceipt.status === 1) setZapState(ZapState.VALID)
            return 'Zap out succeeded'
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
    preferredGasPrice,
    zapIn,
    zapOut,
    mainnetGasPrices,
    zapState,
    swapTokenA,
    swapTokenB,
    affiliateAddress,
    transferResidual,
    addTransaction,
    parsedAmounts,
  ])
}
