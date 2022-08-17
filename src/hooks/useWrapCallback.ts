import { TransactionReceipt } from '@ethersproject/abstract-provider'
import { ChainId, Currency, currencyEquals } from '@swapr/sdk'
import { wrappedCurrency } from '@swapr/sdk/dist/entities/trades/utils'

import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { tryParseAmount } from '../state/swap/hooks'
import { useAllTransactions, useTransactionAdder } from '../state/transactions/hooks'
import { useCurrencyBalance } from '../state/wallet/hooks'
import { useNativeCurrencyWrapperContract, useWrappingToken } from './useContract'
import { useNativeCurrency } from './useNativeCurrency'

import { useActiveWeb3React } from './index'

export enum WrapType {
  NOT_APPLICABLE,
  WRAP,
  UNWRAP,
}

export enum WrapState {
  UNKNOWN,
  PENDING,
  WRAPPED,
  UNWRAPPED,
}

const NOT_APPLICABLE = { wrapType: WrapType.NOT_APPLICABLE }
interface UseWrapCallbackReturn {
  wrapType: WrapType
  execute?: () => Promise<void>
  inputError?: string
  wrapState?: WrapState
  setWrapState?: (wrapState: WrapState) => void
}

/**
 * Given the selected input and output currency, return a wrap callback
 * @param inputCurrency the selected input currency
 * @param outputCurrency the selected output currency
 * @param isGnosisTrade if the trade is a GnosisTrade
 * @param typedValue the user input value
 */
export function useWrapCallback(
  inputCurrency: Currency | undefined,
  outputCurrency: Currency | undefined,
  isGnosisTrade = false,
  typedValue?: string // can be also obtained from the SwapState
): UseWrapCallbackReturn {
  const { chainId, account } = useActiveWeb3React()
  const nativeCurrency = useNativeCurrency()
  const nativeCurrencyWrapperToken = useWrappingToken(nativeCurrency)
  const nativeCurrencyWrapperContract = useNativeCurrencyWrapperContract()

  const balance = useCurrencyBalance(account ?? undefined, inputCurrency as Currency)
  const { t } = useTranslation('common')
  const [wrapState, setWrapState] = useState(WrapState.UNKNOWN)
  // we can always parse the amount typed as the input currency, since wrapping is 1:1
  const [inputAmount, outputAmount] = useMemo(() => {
    const isOutputCurrencyNative = outputCurrency && Currency.isNative(outputCurrency)
    const inputCurrencyWrap =
      isGnosisTrade && isOutputCurrencyNative
        ? wrappedCurrency(outputCurrency as Currency, chainId as ChainId)
        : inputCurrency

    const isInputCurrencyNative = inputCurrency && Currency.isNative(inputCurrency)
    const outputCurrencyWrap =
      isGnosisTrade && isInputCurrencyNative
        ? wrappedCurrency(inputCurrency as Currency, chainId as ChainId)
        : outputCurrency
    return [
      tryParseAmount(typedValue, inputCurrencyWrap, chainId),
      tryParseAmount(typedValue, outputCurrencyWrap, chainId),
    ]
  }, [inputCurrency, outputCurrency, typedValue, isGnosisTrade, chainId])

  // Watch the transaction from transaction reducer
  const [transactionReceipt, setTransactionReceipt] = useState<TransactionReceipt | undefined>()

  const toWrap =
    nativeCurrency &&
    inputCurrency &&
    currencyEquals(nativeCurrency, inputCurrency) &&
    (currencyEquals(outputCurrency as Currency, nativeCurrencyWrapperToken as Currency) || isGnosisTrade)
  const toUnwrap =
    nativeCurrency &&
    outputCurrency &&
    currencyEquals(nativeCurrency, outputCurrency) &&
    currencyEquals(inputCurrency as Currency, nativeCurrencyWrapperToken as Currency)

  const allTransactions = useAllTransactions()
  useEffect(() => {
    const isTransactionSuccessful =
      transactionReceipt && allTransactions[transactionReceipt.transactionHash]?.receipt?.status === 1
    toWrap && isTransactionSuccessful && setWrapState(WrapState.WRAPPED)
    toUnwrap && isTransactionSuccessful && setWrapState(WrapState.UNWRAPPED)
  }, [toWrap, toUnwrap, transactionReceipt, allTransactions])

  const addTransaction = useTransactionAdder()

  return useMemo(() => {
    if (!nativeCurrencyWrapperContract || !chainId || !inputCurrency || !outputCurrency) return NOT_APPLICABLE

    const sufficientBalance = inputAmount && balance && !balance.lessThan(inputAmount)

    if (nativeCurrencyWrapperToken && Currency.isNative(inputCurrency) && toWrap) {
      return {
        wrapType: WrapType.WRAP,
        execute:
          sufficientBalance && inputAmount
            ? async () => {
                try {
                  // Set state to pending
                  setWrapState(WrapState.PENDING)
                  // Submit transaction to signer to sign and broadcast to memepool
                  const depositTransaction = await nativeCurrencyWrapperContract.deposit({
                    value: `0x${inputAmount.raw.toString(16)}`,
                  })

                  setTransactionReceipt(depositTransaction)
                  addTransaction(depositTransaction, {
                    summary: `Wrap ${inputAmount.toSignificant(6)} ${nativeCurrency.symbol} to ${
                      nativeCurrencyWrapperToken.symbol
                    }`,
                  })
                  // Wait for the network to mine the transaction
                  const depositTransactionReceipt = await depositTransaction.wait(1)

                  if (depositTransactionReceipt.status === 1) setWrapState(WrapState.WRAPPED)
                } catch (error) {
                  console.error('Could not deposit', error)
                  //if something goes wrong, reset status
                  setWrapState(WrapState.UNKNOWN)
                }
              }
            : undefined,
        inputError: sufficientBalance
          ? undefined
          : !typedValue
          ? t('enterCurrencyAmount', { currency: nativeCurrency.symbol })
          : t('insufficientCurrencyBalance', { currency: nativeCurrency.symbol }),
        wrapState,
        setWrapState,
      }
    } else if (nativeCurrencyWrapperToken && toUnwrap && outputCurrency === nativeCurrency) {
      return {
        wrapType: WrapType.UNWRAP,
        execute:
          sufficientBalance && outputAmount
            ? async () => {
                try {
                  setWrapState(WrapState.PENDING)
                  const txReceipt = await nativeCurrencyWrapperContract.withdraw(`0x${outputAmount.raw.toString(16)}`)
                  setTransactionReceipt(transactionReceipt)
                  addTransaction(txReceipt, {
                    summary: `Unwrap ${outputAmount.toSignificant(6)} ${nativeCurrencyWrapperToken.symbol} to ${
                      nativeCurrency.symbol
                    }`,
                  })
                } catch (error) {
                  console.error('Could not withdraw', error)
                }
              }
            : undefined,
        inputError: sufficientBalance
          ? undefined
          : !typedValue
          ? t('enterCurrencyAmount', { currency: nativeCurrencyWrapperToken.symbol })
          : t('insufficientCurrencyBalance', { currency: nativeCurrencyWrapperToken.symbol }),
        wrapState,
        setWrapState,
      }
    } else {
      return NOT_APPLICABLE
    }
  }, [
    nativeCurrencyWrapperContract,
    chainId,
    inputCurrency,
    outputCurrency,
    inputAmount,
    outputAmount,
    balance,
    nativeCurrencyWrapperToken,
    nativeCurrency,
    addTransaction,
    typedValue,
    t,
    wrapState,
    toWrap,
    toUnwrap,
    transactionReceipt,
  ])
}
