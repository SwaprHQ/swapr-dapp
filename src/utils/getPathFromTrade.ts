import { Route, Trade } from '@swapr/sdk'

export const getPathFromTrade = (trade: Trade | undefined): string[] => {
  const isCorrectTrade = trade && trade.details instanceof Route
  const path = isCorrectTrade ? trade.details.path.map(token => token.address) : []
  const length = path.length
  if (length > 0 && path[0] === path[length - 1]) {
    return path.slice(length - 1)
  }
  return path
}
