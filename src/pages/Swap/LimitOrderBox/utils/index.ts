import { AddressZero } from '@ethersproject/constants'
import { formatUnits } from '@ethersproject/units'
import { ChainId, Price, Token, TokenAmount, USDC } from '@swapr/sdk'

import createDebugger from 'debug'

import { isAddress } from '../../../../utils'
import { LimitOrderKind, MarketPrices, SerializableLimitOrder } from '../interfaces'
import { TokenAmount as ITokenAmount } from '../interfaces/token.interface'

/**
 *
 * @param amount The amount of tokens to be bought or sold
 * @returns
 */
export const formatTokenAmount = (amount: ITokenAmount) => formatUnits(amount.amount, amount.token.decimals)

export const debug = createDebugger('limit-orders')

interface InitialState {
  sellTokenAmount: TokenAmount
  buyTokenAmount: TokenAmount
  price: Price
  limitOrder: SerializableLimitOrder
}

/**
 *
 * @param chainId The chain id of the network
 */
export function getInitialState(chainId: ChainId, account: string): InitialState {
  const sellTokenAmount = new TokenAmount(Token.getNativeWrapper(chainId), '1000000000000000000')
  const buyTokenAmount = new TokenAmount(USDC[chainId], '0')
  const price = new Price({
    baseCurrency: sellTokenAmount.currency,
    quoteCurrency: buyTokenAmount.currency,
    denominator: sellTokenAmount.raw.toString(),
    numerator: buyTokenAmount.raw.toString(),
  })

  const limitOrder: SerializableLimitOrder = {
    sellAmount: '1000000000000000000',
    buyAmount: '0',
    feeAmount: '0',
    sellToken: isAddress(sellTokenAmount.currency.address) || AddressZero,
    buyToken: isAddress(buyTokenAmount?.currency?.address) || AddressZero,
    createdAt: 0,
    expiresAt: Date.now(),
    limitPrice: '0',
    userAddress: account,
    receiverAddress: account, // default reciver is the account itself
    kind: LimitOrderKind.SELL, // start with SELL, meaning selling WETH for USDC at or higher price than the current price
  }

  return {
    sellTokenAmount,
    buyTokenAmount,
    price,
    limitOrder,
  }
}

export function calculateMarketPriceDiffPercentage(
  limitOrderKind: LimitOrderKind,
  marketPrices: MarketPrices,
  formattedLimitPrice: string
) {
  const nextLimitPriceFloat = limitOrderKind === LimitOrderKind.SELL ? marketPrices.buy : marketPrices.sell
  let marketPriceDiffPercentage = 0
  let isDiffPositive = false

  if (Boolean(Number(nextLimitPriceFloat))) {
    if (limitOrderKind === LimitOrderKind.SELL) {
      marketPriceDiffPercentage = (Number(formattedLimitPrice) / Number(nextLimitPriceFloat.toFixed(6)) - 1) * 100
      isDiffPositive = Math.sign(Number(marketPriceDiffPercentage)) > 0
    } else {
      marketPriceDiffPercentage = (Number(nextLimitPriceFloat.toFixed(6)) / Number(formattedLimitPrice) - 1) * 100

      if (marketPriceDiffPercentage < 0) {
        marketPriceDiffPercentage = Math.abs(marketPriceDiffPercentage)
      } else {
        marketPriceDiffPercentage = Math.min(marketPriceDiffPercentage, 999)
        marketPriceDiffPercentage = marketPriceDiffPercentage * -1
      }
      isDiffPositive = Math.sign(Number(marketPriceDiffPercentage)) < 0
    }
  }

  marketPriceDiffPercentage = Math.min(marketPriceDiffPercentage, 999)
  return { marketPriceDiffPercentage, isDiffPositive }
}
