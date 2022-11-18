import { Route, Trade } from '@swapr/sdk'

export const getPathFromTrade = (trade: Trade | undefined): string[] => {
  const isCorrectTrade = trade && trade.details instanceof Route
  return isCorrectTrade ? trade.details.path.map(token => token.address) : []
}
