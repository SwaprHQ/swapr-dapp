import { formatUnits } from '@ethersproject/units'
import { ChainId, Currency } from '@swapr/sdk'
import { isFee } from './Socket.types'
import { Route, TokenPriceResponseDTO } from './api/generated'
import {
  DAI_ARBITRUM_ADDRESS,
  DAI_ETHEREUM_ADDRESS,
  SOCKET_NATIVE_TOKEN_ADDRESS,
  WETH_GNOSIS_ADDRESS,
} from '../../../constants'

export const getDAIAddress = (chainId: ChainId) => {
  switch (chainId) {
    case ChainId.ARBITRUM_ONE:
      return DAI_ARBITRUM_ADDRESS
    case ChainId.MAINNET:
      return DAI_ETHEREUM_ADDRESS
    default:
      return undefined
  }
}

export const getBestRoute = (routes: Route[], tokenData?: TokenPriceResponseDTO, toTokenDecimals?: number) => {
  if (routes.length === 1 || !tokenData || !toTokenDecimals) return routes[0]

  const {
    result: { tokenPrice },
  } = tokenData

  const bestRoute = routes.reduce<{ amount: number; routeId: string }>(
    (total, txRoute) => {
      if (tokenData?.success) {
        const amount =
          Number(formatUnits(txRoute.toAmount, toTokenDecimals).toString()) * tokenPrice - txRoute.totalGasFeesInUsd

        const route = {
          amount: Number(amount),
          routeId: txRoute.routeId,
        }

        //find better way to do it
        if (route.amount <= 0) {
          if (total.amount <= route.amount && total.amount !== 0) {
            total = route
            return total
          }

          total = route
        } else {
          if (total.amount <= route.amount) {
            total = route
          }
        }

        return total
      }
      return total
    },
    { amount: 0, routeId: '' } as { amount: number; routeId: string }
  )

  const indexOfBestRoute = routes.findIndex(route => route.routeId === bestRoute.routeId)

  if (indexOfBestRoute === -1) return undefined

  return routes[indexOfBestRoute]
}

export const getBridgeFee = (userTxs: any, fromAsset: { amount: string; decimals?: number }): string => {
  if (isFee(userTxs)) {
    const [singleTxBridge] = userTxs

    //get protocolFee for each step
    const totalStepsFee = singleTxBridge.steps.reduce((total, step) => {
      if (!step.protocolFees.asset || step.protocolFees.amount === '0') {
        return total
      }
      total += Number(formatUnits(step.protocolFees.amount, step.protocolFees.asset.decimals))
      return total
    }, 0)

    const { amount, decimals } = fromAsset
    const formattedValue = Number(formatUnits(amount, decimals))

    //fee is incorrect (socket)
    const fee = (totalStepsFee / formattedValue) * 100

    return `${fee.toFixed(2).toString()}%`
  }

  //this shouldn't happen
  return '---'
}

export const getStatusOfResponse = (e: any) => {
  //e.code 20 is status of aborted request
  if (e.code === 20) return true

  return false
}

export const overrideTokensAddresses = (
  toChainId: ChainId,
  fromChainId: ChainId,
  fromAddress: string,
  fromNativeCurrency: Currency
) => {
  const ETHtoWETH = toChainId === ChainId.XDAI && fromAddress === fromNativeCurrency.symbol
  const WETHtoETH = fromChainId === ChainId.XDAI && fromAddress === WETH_GNOSIS_ADDRESS
  const XDAItoDAI = fromChainId === ChainId.XDAI && fromAddress === fromNativeCurrency.symbol
  const DAItoXDAI =
    toChainId === ChainId.XDAI && [DAI_ETHEREUM_ADDRESS, DAI_ARBITRUM_ADDRESS].includes(fromAddress.toLowerCase())

  // Overrides
  if (XDAItoDAI) {
    return {
      fromTokenAddressOverride: SOCKET_NATIVE_TOKEN_ADDRESS,
      toTokenAddressOverride: getDAIAddress(toChainId) ?? '',
    }
  }

  if (DAItoXDAI) {
    return {
      fromTokenAddressOverride: fromAddress,
      toTokenAddressOverride: SOCKET_NATIVE_TOKEN_ADDRESS,
    }
  }

  if (ETHtoWETH) {
    return {
      fromTokenAddressOverride: SOCKET_NATIVE_TOKEN_ADDRESS,
      toTokenAddressOverride: WETH_GNOSIS_ADDRESS,
    }
  }

  if (WETHtoETH) {
    return {
      fromTokenAddressOverride: WETH_GNOSIS_ADDRESS,
      toTokenAddressOverride: SOCKET_NATIVE_TOKEN_ADDRESS,
    }
  }

  return undefined
}

export const VERSION = {
  major: 1,
  minor: 0,
  patch: 0,
}
