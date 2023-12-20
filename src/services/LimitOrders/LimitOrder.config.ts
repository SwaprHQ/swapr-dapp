import { ChainId, Currency, DAI, GNO, Token, USDT, WBNB, WETH, WMATIC, WXDAI } from '@swapr/sdk'

import { OneInch } from './1Inch/OneInch'
import { CoW } from './CoW/CoW'
import { Providers } from './LimitOrder.types'
import { LimitOrderBase } from './LimitOrder.utils'

export const DefaultTokens: Record<number, { sellToken: Currency; buyToken: Currency }> = {
  [ChainId.MAINNET]: {
    sellToken: WETH[ChainId.MAINNET],
    buyToken: DAI[ChainId.MAINNET],
  },
  [ChainId.GNOSIS]: {
    sellToken: WXDAI[ChainId.GNOSIS],
    buyToken: GNO,
  },
  [ChainId.POLYGON]: {
    sellToken: WMATIC[ChainId.POLYGON],
    buyToken: DAI[ChainId.POLYGON],
  },
  [ChainId.OPTIMISM_MAINNET]: {
    sellToken: USDT[ChainId.OPTIMISM_MAINNET],
    buyToken: DAI[ChainId.OPTIMISM_MAINNET],
  },
  [ChainId.ARBITRUM_ONE]: {
    sellToken: WETH[ChainId.ARBITRUM_ONE],
    buyToken: DAI[ChainId.ARBITRUM_ONE],
  },
  [ChainId.BSC_MAINNET]: {
    sellToken: WBNB[ChainId.BSC_MAINNET],
    buyToken: DAI[ChainId.BSC_MAINNET],
  },
}

export const getDefaultTokens = (chainId: ChainId) => {
  const defaultSellToken = DefaultTokens[chainId].sellToken
  const defaultBuyToken = DefaultTokens[chainId].buyToken
  const sellToken = new Token(chainId, defaultSellToken.address!, defaultSellToken.decimals, defaultSellToken.symbol)
  const buyToken = new Token(chainId, defaultBuyToken.address!, defaultBuyToken.decimals, defaultBuyToken.symbol)
  return { sellToken, buyToken }
}

export const getLimitOrderCofig = (): LimitOrderBase[] => [
  new CoW({
    supportedChains: [ChainId.MAINNET, ChainId.GNOSIS],
    protocol: Providers.COW,
    ...getDefaultTokens(ChainId.MAINNET),
  }),
  new OneInch({
    supportedChains: [ChainId.POLYGON, ChainId.OPTIMISM_MAINNET, ChainId.ARBITRUM_ONE, ChainId.BSC_MAINNET],
    protocol: Providers.ONEINCH,
    ...getDefaultTokens(ChainId.POLYGON),
  }),
]
