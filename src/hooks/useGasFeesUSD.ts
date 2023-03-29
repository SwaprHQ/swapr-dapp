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
    if (loadingNativeCurrencyUSDPrice || loadingGasPrices) return { loading: true, gasFeesUSD: [] }

    if (!gasEstimations || gasEstimations.length === 0 || !chainId || !preferredGasPrice)
      return { loading: false, gasFeesUSD: [] }

    const gasMapped: {
      [key in MainnetGasPrice]: number
    } = {
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

        return CurrencyAmount.usd(
          parseUnits(
            nativeCurrencyAmount.multiply(nativeCurrencyUSDPrice).toFixed(USD.decimals),
            USD.decimals
          ).toString()
        )
      }),
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gasEstimations, loadingNativeCurrencyUSDPrice, nativeCurrencyUSDPrice, chainId])
}
