import { Web3Provider } from '@ethersproject/providers'
import { Trade } from '@swapr/sdk'

import { BigNumber } from 'ethers'
import { useCallback, useEffect, useState } from 'react'

import { INITIAL_ALLOWED_SLIPPAGE } from '../constants'
import useENS from './useENS'
import { useSwapsCallArguments } from './useSwapCallback'

import { useActiveWeb3React } from './index'

export function useSwapsGasEstimations(
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE,
  recipientAddressOrName: string | null,
  trades?: (Trade | undefined)[]
): { loading: boolean; estimations: (BigNumber | undefined)[] } {
  const { account, library, chainId } = useActiveWeb3React()
  console.log('trades', trades)
  const platformSwapCalls = useSwapsCallArguments(trades, allowedSlippage, recipientAddressOrName || account)

  const [loading, setLoading] = useState(false)
  const [estimations, setEstimations] = useState<(BigNumber | undefined)[]>([])

  const { address: recipientAddress } = useENS(recipientAddressOrName)
  const recipient = recipientAddress || account

  const updateEstimations = useCallback(async () => {
    if (!trades || platformSwapCalls.length === 0) return
    setLoading(true)
    const estimatedCalls = []
    console.log('PlatformSwapCalls', platformSwapCalls)

    for (let i = 0; i < platformSwapCalls.length; i++) {
      const platformCalls = platformSwapCalls[i]
      const call = platformCalls[0]

      console.log('PlatformCallOne', platformCalls)

      console.log('call', call)
      // if (!call) {
      // } else if (trades)

      // const { value } = await transactionParameters
      // const options = !value || isZero(value as string) ? {} : { value }

      let estimatedCall = undefined
      if (trades[i]?.estimatedGas !== undefined) {
        estimatedCall = trades[i]?.estimatedGas
        console.log('esimated gas works', trades[i]?.estimatedGas)
      } else {
        try {
          const transactionRequest = await call.transactionParameters
          estimatedCall = await (library as Web3Provider).estimateGas(transactionRequest as any)
        } catch (error) {
          console.error(error)
          // silent fail
        }
      }

      estimatedCalls.push(estimatedCall)
    }
    console.log('estimatedCalls', estimatedCalls)
    setEstimations(estimatedCalls)
    setLoading(false)
  }, [platformSwapCalls, library, trades])

  useEffect(() => {
    if (!trades || trades.length === 0 || !library || !chainId || !recipient) {
      setEstimations([])
    }
    updateEstimations()
  }, [chainId, library, recipient, trades, updateEstimations, account])

  return { loading: loading, estimations }
}
