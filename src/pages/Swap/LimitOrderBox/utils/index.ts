import { AddressZero } from '@ethersproject/constants'
import { formatUnits } from '@ethersproject/units'
import { ChainId, Price, Token, TokenAmount, USDC } from '@swapr/sdk'

import createDebugger from 'debug'

import { LimitOrderKind, SerializableLimitOrder } from '../interfaces'
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
    sellToken: sellTokenAmount.currency.address || AddressZero,
    buyToken: buyTokenAmount?.currency?.address || AddressZero,
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
