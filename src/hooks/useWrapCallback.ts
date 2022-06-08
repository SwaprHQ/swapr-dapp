import { ChainId, Currency, currencyEquals } from '@swapr/sdk'
import { useEffect, useMemo, useState } from 'react'
import { tryParseAmount } from '../state/swap/hooks'
import { useAllTransactions, useTransactionAdder } from '../state/transactions/hooks'
import { useCurrencyBalance } from '../state/wallet/hooks'
import { useActiveWeb3React } from './index'
import { useNativeCurrencyWrapperContract, useWrappingToken } from './useContract'
import { useNativeCurrency } from './useNativeCurrency'
import { useTranslation } from 'react-i18next'
import { wrappedCurrency } from '@swapr/sdk/dist/entities/trades/utils'
import { TransactionReceipt } from '@ethersproject/abstract-provider'

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
  execute?: undefined | (() => Promise<void>)
  inputError?: string
  wrapState?: WrapState
  setWrapState?: React.Dispatch<React.SetStateAction<WrapState>>
}

/**
 * Given the selected input and output currency, return a wrap callback
 * @param inputCurrency the selected input currency
 * @param outputCurrency the selected output currency
 * @param typedValue the user input value
 */
export function useWrapCallback(
  inputCurrency: Currency | undefined,
  outputCurrency: Currency | undefined,
  typedValue: string | undefined
): UseWrapCallbackReturn {
  const { chainId, account } = useActiveWeb3React()
  const nativeCurrency = useNativeCurrency()
  const nativeCurrencyWrapperToken = useWrappingToken(nativeCurrency)
  const nativeCurrencyWrapperContract = useNativeCurrencyWrapperContract()
  const balance = useCurrencyBalance(account ?? undefined, inputCurrency)
  const { t } = useTranslation()
  const [wrapState, setWrapState] = useState<WrapState>(WrapState.UNKNOWN)
  // we can always parse the amount typed as the input currency, since wrapping is 1:1
  const inputAmount = useMemo(() => tryParseAmount(typedValue, inputCurrency, chainId), [
    inputCurrency,
    typedValue,
    chainId,
  ])

  const outputAmount = useMemo(() => tryParseAmount(typedValue, outputCurrency, chainId), [
    outputCurrency,
    typedValue,
    chainId,
  ])

  // Watch the transaction from transaction reducer
  const [transactionReceipt, setTransactionReceipt] = useState<TransactionReceipt | undefined>()

  const toWrap = nativeCurrency && inputCurrency && currencyEquals(nativeCurrency, inputCurrency)
  const toUnwrap = nativeCurrency && outputCurrency && currencyEquals(nativeCurrency, outputCurrency)

  const allTransactions = useAllTransactions()
  useEffect(() => {
    const transaction = transactionReceipt && allTransactions[transactionReceipt.transactionHash]
    const success = transaction?.receipt?.status === 1
    toWrap && success && setWrapState(WrapState.WRAPPED)
    toUnwrap && success && setWrapState(WrapState.UNWRAPPED)
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

export function useTradeWrapCallback(
  currencies: { INPUT?: Currency | undefined; OUTPUT?: Currency | undefined },
  isGnosisTrade = false,
  chainId?: ChainId,
  typedValue?: string // can be also obtained from the SwapState
): UseWrapCallback {
  const isInputCurrencyNative = currencies.INPUT && Currency.isNative(currencies?.INPUT) ? true : false
  const isOutputCurrencyNative = currencies.OUTPUT && Currency.isNative(currencies.OUTPUT) ? true : false

  const inputCurrency =
    isGnosisTrade && isOutputCurrencyNative
      ? wrappedCurrency(currencies.OUTPUT as Currency, chainId as ChainId)
      : currencies.INPUT
  const outputCurrency =
    isGnosisTrade && isInputCurrencyNative
      ? wrappedCurrency(currencies.INPUT as Currency, chainId as ChainId)
      : currencies.OUTPUT

  return useWrapCallback(inputCurrency, outputCurrency, typedValue)
}
