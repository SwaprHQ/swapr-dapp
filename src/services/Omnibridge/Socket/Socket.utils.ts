import { formatUnits } from '@ethersproject/units'
import { Route, TokenPriceResponseDTO } from './api/generated'
import { isFee } from './Socket.types'

export const getIndexBestRoute = (
  tokenData: TokenPriceResponseDTO | undefined,
  routes: Route[],
  decimals: number | undefined
) => {
  //when is one route then return 0 index (first element of array)
  if (routes.length === 1 || !tokenData || !decimals) return 0

  const {
    result: { tokenPrice }
  } = tokenData

  const bestRoute = routes.reduce<{ amount: number; routeId: string }>(
    (total, next) => {
      if (tokenData?.success) {
        const amount = (
          Number(formatUnits(next.toAmount, decimals).toString()) * tokenPrice -
          next.totalGasFeesInUsd
        ).toFixed(2)

        const route = {
          amount: Number(amount),
          routeId: next.routeId
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

  return indexOfBestRoute
}

export const getBridgeFee = (userTxs: any, fromAmount: string, decimals?: number): string => {
  if (isFee(userTxs)) {
    const [singleTxBridge] = userTxs

    //get protocolFee for each step
    const totalStepsFee = singleTxBridge.steps.reduce((total, step) => {
      total += Number(step.protocolFees.amount)
      return total
    }, 0)

    if (totalStepsFee === 0) return '0%'

    const formattedValue = Number(formatUnits(fromAmount, decimals))
    const formattedFees = Number(formatUnits(totalStepsFee, decimals))

    const fee = (formattedFees / formattedValue) * 100

    return `${fee.toFixed(2).toString()}%`
  }

  //this shouldn't happen
  return '---'
}
