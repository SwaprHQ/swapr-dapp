import { formatUnits } from '@ethersproject/units'
import { Route, TokenPriceResponseDTO } from './api/generated'
import { isFee } from './Socket.types'

export const getBestRoute = (routes: Route[], tokenData?: TokenPriceResponseDTO, toTokenDecimals?: number) => {
  if (routes.length === 1 || !tokenData || !toTokenDecimals) return routes[0]

  const {
    result: { tokenPrice }
  } = tokenData

  const bestRoute = routes.reduce<{ amount: number; routeId: string }>(
    (total, txRoute) => {
      if (tokenData?.success) {
        const amount =
          Number(formatUnits(txRoute.toAmount, toTokenDecimals).toString()) * tokenPrice - txRoute.totalGasFeesInUsd

        const route = {
          amount: Number(amount),
          routeId: txRoute.routeId
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

    if (totalStepsFee === 0) return '0%'

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
