import { parseUnits } from '@ethersproject/units'
import { CurrencyAmount, USD } from '@swapr/sdk'

import { BigNumber } from 'ethers'
import { useMemo } from 'react'

import { useNativeCurrencyUSDPrice } from './useNativeCurrencyUSDPrice'

import { useActiveWeb3React } from './index'

export function useGasFeesUSD(gasEstimations: (BigNumber | undefined)[]): {
  loading: boolean
  gasFeesUSD: (CurrencyAmount | null)[]
} {
  const { chainId } = useActiveWeb3React()
  // const mainnetGasPrices = useMainnetGasPrices()
  // const [preferredGasPrice] = useUserPreferredGasPrice()
  const { loading: loadingNativeCurrencyUSDPrice, nativeCurrencyUSDPrice } = useNativeCurrencyUSDPrice()
  console.log('nativeCurrencyUSDPrice', nativeCurrencyUSDPrice)

  return useMemo(() => {
    console.log('loadingNativeCurrencyUSDPrice', loadingNativeCurrencyUSDPrice)
    if (loadingNativeCurrencyUSDPrice) return { loading: true, gasFeesUSD: [] }
    console.log('GasEstimations', gasEstimations)

    console.log('chainId', chainId)

    if (!gasEstimations || gasEstimations.length === 0 || !chainId) return { loading: false, gasFeesUSD: [] }

    return {
      loading: false,
      gasFeesUSD: gasEstimations.map(gasEstimation => {
        if (gasEstimation === undefined) return null
        console.log('GAS ESTIMATION STRING', gasEstimation.toString())
        const nativeCurrencyAmount = CurrencyAmount.nativeCurrency(gasEstimation.mul(10000).toString(), chainId)
        return CurrencyAmount.usd(
          parseUnits(
            nativeCurrencyAmount.multiply(nativeCurrencyUSDPrice).toFixed(USD.decimals),
            USD.decimals
          ).toString()
        )
      }),
    }
  }, [gasEstimations, loadingNativeCurrencyUSDPrice, nativeCurrencyUSDPrice, chainId])
}
