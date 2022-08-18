import { AddressZero } from '@ethersproject/constants'
import { formatUnits } from '@ethersproject/units'
import { ChainId, JSBI, Price, Token, TokenAmount, USDC } from '@swapr/sdk'

import { LimitOrderKind, SerializableLimitOrder } from '../interfaces'
import { TokenAmount as ITokenAmount } from '../interfaces/token.interface'

/**
 *
 * @param amount The amount of tokens to be bought or sold
 * @returns
 */
export const formatTokenAmount = (amount: ITokenAmount) => formatUnits(amount.amount, amount.token.decimals)

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
  const sellTokenAmount = new TokenAmount(Token.getNativeWrapper(chainId), '0')
  const buyTokenAmount = new TokenAmount(USDC[chainId], '0')
  const price = new Price({
    baseCurrency: sellTokenAmount.currency,
    quoteCurrency: buyTokenAmount.currency,
    denominator: sellTokenAmount.raw.toString(),
    numerator: buyTokenAmount.raw.toString(),
  })

  const limitOrder: SerializableLimitOrder = {
    sellAmount: '0',
    buyAmount: '0',
    feeAmount: '0',
    sellToken: sellTokenAmount.currency.address || AddressZero,
    buyToken: buyTokenAmount?.currency?.address || AddressZero,
    createdAt: 0,
    expiresAt: 0,
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

/**
 * Computes a limit price
 * @param baseTokenAmount The first token amount
 * @param quoteTokenAmount The second token amount
 * @returns
 */
export function computeLimitPrice(baseTokenAmount: TokenAmount, quoteTokenAmount: TokenAmount) {
  // get the JSBI
  const baseAmountJSBI = baseTokenAmount.raw
  // Must be a positive number
  const quoteAmountJSBI = JSBI.equal(quoteTokenAmount.raw, JSBI.BigInt(0)) ? JSBI.BigInt(1) : quoteTokenAmount.raw
  // Compute the ratio
  const limitPriceJSBI = JSBI.divide(baseAmountJSBI, quoteAmountJSBI)

  console.log({
    baseAmountJSBI: baseAmountJSBI.toString(),
    quoteAmountJSBI: quoteAmountJSBI.toString(),
    limitPriceJSBI: limitPriceJSBI.toString(),
  })

  return limitPriceJSBI
}
