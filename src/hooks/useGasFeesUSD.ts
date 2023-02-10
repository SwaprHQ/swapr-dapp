import { parseUnits } from '@ethersproject/units'
import { CurrencyAmount, USD } from '@swapr/sdk'

import { BigNumber } from 'ethers'
import { useMemo } from 'react'

import { MainnetGasPrice } from '../state/application/actions'
import { useUserPreferredGasPrice } from '../state/user/hooks'
import { useGasInfo } from './useGasInfo'
import { useNativeCurrencyUSDPrice } from './useNativeCurrencyUSDPrice'

import { useActiveWeb3React } from './index'

export function useGasFeesUSD(gasEstimations: (BigNumber | undefined)[]): {
  loading: boolean
  gasFeesUSD: (CurrencyAmount | null)[]
} {
  const { chainId } = useActiveWeb3React()

  const [preferredGasPrice] = useUserPreferredGasPrice()
  const { loading: loadingNativeCurrencyUSDPrice, nativeCurrencyUSDPrice } = useNativeCurrencyUSDPrice()
  const { gas, loading: loadingGasPrices } = useGasInfo()

  return useMemo(() => {
    console.log('loadingNativeCurrencyUSDPrice', loadingNativeCurrencyUSDPrice)
    if (loadingNativeCurrencyUSDPrice || loadingGasPrices) return { loading: true, gasFeesUSD: [] }

    console.log('preferredGasPrice', preferredGasPrice)
    if (!gasEstimations || gasEstimations.length === 0 || !chainId || !preferredGasPrice)
      return { loading: false, gasFeesUSD: [] }

    const gasMapped = {
      [MainnetGasPrice.INSTANT]: gas.fast,
      [MainnetGasPrice.FAST]: gas.slow,
      [MainnetGasPrice.NORMAL]: gas.normal,
    }

    return {
      loading: false,
      gasFeesUSD: gasEstimations.map(gasEstimation => {
        if (gasEstimation === undefined) return null
        //hardcoded gas price to 20 gwei

        const gasCalc = gasMapped[preferredGasPrice as MainnetGasPrice] + '000000000'

        const nativeCurrencyAmount = CurrencyAmount.nativeCurrency(gasEstimation.mul(gasCalc).toString(), chainId)
        console.log('nativeCurrencyAmount', nativeCurrencyAmount.toString())
        console.log('price', nativeCurrencyUSDPrice.toString())
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
