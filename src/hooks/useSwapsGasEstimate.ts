import { Web3Provider } from '@ethersproject/providers'
import { CurrencyAmount, Trade } from '@swapr/sdk'

import { BigNumber } from 'ethers'
import { parseEther } from 'ethers/lib/utils'
import { useCallback, useContext, useEffect, useState } from 'react'

import { INITIAL_ALLOWED_SLIPPAGE } from '../constants'
import { alchemyExectuionBundleOptions, calucalateGasFromAlchemyResponse } from '../constants/data'
import { SwapContext } from '../pages/Swap/SwapBox/SwapContext'
import { maxAmountSpend } from '../utils/maxAmountSpend'
import { useTokenContract } from './useContract'
import useENS from './useENS'
import { useSwapsCallArguments } from './useSwapCallback'

import { useActiveWeb3React } from './index'

export function useSwapsGasEstimations(
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE,
  recipientAddressOrName: string | null,
  trades?: (Trade | undefined)[]
): { loading: boolean; estimations: (BigNumber | undefined)[] } {
  const { account, library, chainId } = useActiveWeb3React()

  const { parsedAmount, currencyBalances } = useContext(SwapContext)

  const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances['INPUT'], chainId)
  const tokenContract = useTokenContract(parsedAmount?.currency.address, false)
  const platformSwapCalls = useSwapsCallArguments(trades, allowedSlippage, recipientAddressOrName || account)

  const [loading, setLoading] = useState(false)
  const [estimations, setEstimations] = useState<(BigNumber | undefined)[]>([])

  const { address: recipientAddress } = useENS(recipientAddressOrName)
  const recipient = recipientAddress || account

  const updateEstimations = useCallback(async () => {
    if (!trades || platformSwapCalls.length === 0 || !chainId) return
    setLoading(true)
    const estimatedCalls = []

    for (let i = 0; i < platformSwapCalls.length; i++) {
      const platformCalls = platformSwapCalls[i]
      const call = platformCalls[0]

      let estimatedCall = undefined
      if (trades[i]?.estimatedGas !== undefined) {
        estimatedCall = trades[i]?.estimatedGas
      } else {
        try {
          const { to, data, value } = await call.transactionParameters
          const isNative = !(value as BigNumber).isZero()

          const transactionObject = {
            to,
            data,
            value,
            from: !isNative ? account : undefined,
          } as any
          try {
            estimatedCall = await (library as Web3Provider).estimateGas(transactionObject)
          } catch {
            try {
              if (maxAmountInput && !isNative && !parsedAmount?.greaterThan(maxAmountInput.raw.toString())) {
                const amount = parseEther(maxAmountInput?.raw.toString()!)
                const tokenContractAddress = tokenContract?.address
                const approvalData = tokenContract?.interface.encodeFunctionData('approve', [to, amount])

                const appovalTx = {
                  to: tokenContractAddress,
                  data: approvalData,
                  from: account,
                }

                const transferData = tokenContract?.interface.encodeFunctionData('transferFrom', [
                  tokenContractAddress,
                  account,
                  amount,
                ])

                const mintTx = {
                  to: tokenContractAddress,
                  data: transferData,
                  from: tokenContractAddress,
                }

                const swapTransaction = {
                  to,
                  data,
                  value,
                  from: !isNative ? account : undefined,
                } as any
                console.log('approvalTx', appovalTx)
                console.log('mintTx', mintTx)
                console.log('swapTransaction', swapTransaction)
                const params = [appovalTx, mintTx, swapTransaction]
                const options = alchemyExectuionBundleOptions(params)
                const alchemyRequest = fetch(
                  `https://eth-mainnet.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_KEY}`,
                  options
                )

                const gasCalculation = await calucalateGasFromAlchemyResponse(alchemyRequest)
                estimatedCall = BigNumber.from(gasCalculation)
              }
            } catch (e) {
              console.error(`Gas estimation failed for trade ${trades[i]?.platform.name}:`, e)
            }
          }
        } catch (e) {
          console.error('Error fetching call estimations:', e)
        }
      }

      estimatedCalls.push(estimatedCall)
    }

    setEstimations(estimatedCalls)
    setLoading(false)
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platformSwapCalls])

  useEffect(() => {
    if (!trades || trades.length === 0 || !library || !chainId || !recipient) {
      setEstimations([])
    }
    updateEstimations()
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platformSwapCalls, trades])

  return { loading: loading, estimations }
}
